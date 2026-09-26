/**
 * EscrowRelease component tests — transaction signing state UI.
 *
 * Covers every state the signing flow puts in front of a user:
 * idle, the confirmation modal, signing (wallet prompt), releasing
 * (submitted), done (success), and the failure path where the hook
 * resets to idle and surfaces an error toast.
 *
 * Both the hook and the wallet store are mocked at their boundaries, so
 * these tests describe rendered text and icons only — no network, no
 * wallet, no escrow service. That matters here because escrowService
 * currently imports a Stellar SDK that is not installed; mocking at the
 * hook seam keeps this suite runnable regardless.
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EscrowRelease } from '@/features/escrow/components/EscrowRelease';
import { useEscrowRelease, type ReleaseStep } from '@/hooks/useEscrowRelease';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// A factory mock, not an automock: automocking still loads the real module to
// derive its shape, and useEscrowRelease pulls in escrowService -> stellar-sdk,
// which is not an installed dependency.
jest.mock('@/hooks/useEscrowRelease', () => ({
  useEscrowRelease: jest.fn(),
}));

const mockWalletState = {
  address: 'GABCDEF1234567890XYZ',
  isConnected: true,
};

jest.mock('@/store/walletStore', () => ({
  useWalletStore: (selector: (state: typeof mockWalletState) => unknown) =>
    selector(mockWalletState),
}));

const mockUseEscrowRelease = useEscrowRelease as jest.MockedFunction<
  typeof useEscrowRelease
>;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ESCROW_ID = 'escrow-abcdef123456789';
const DELIVERY_ID = 'delivery-42';
const TX_HASH = 'c670b91e8c2d91e4cf6bae2f6a6373a3b64e3c8ce73f3c2b6a5d8f9e4c3b2a1';

const LOCKED_ESCROW = {
  id: ESCROW_ID,
  amount: '250.00',
  currency: 'XLM',
  status: 'locked',
};

const hookActions = {
  fetchEscrowDetails: jest.fn(),
  openConfirmDialog: jest.fn(),
  confirmAndRelease: jest.fn(),
  reset: jest.fn(),
};

function mockHook(overrides: Record<string, unknown> = {}) {
  mockUseEscrowRelease.mockReturnValue({
    escrowDetails: LOCKED_ESCROW,
    step: 'idle' as ReleaseStep,
    isLoading: false,
    transactionHash: null,
    ...hookActions,
    ...overrides,
  } as ReturnType<typeof useEscrowRelease>);
}

function renderComponent() {
  return render(
    <EscrowRelease escrowId={ESCROW_ID} deliveryId={DELIVERY_ID} />,
  );
}

/** The signing/releasing panel and the done panel are the only status boxes. */
function statusPanel(container: HTMLElement, tone: 'blue' | 'green') {
  const panel = container.querySelector(`.bg-${tone}-50`);
  if (!panel) throw new Error(`No ${tone} status panel rendered`);
  return panel as HTMLElement;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockWalletState.address = 'GABCDEF1234567890XYZ';
  mockWalletState.isConnected = true;
  mockHook();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EscrowRelease — transaction signing state UI', () => {
  describe('idle state', () => {
    it('renders the release panel with the escrow summary', () => {
      renderComponent();

      expect(
        screen.getByRole('heading', { name: 'Release Escrow Payment' }),
      ).toBeInTheDocument();
      expect(screen.getByText('250.00 XLM')).toBeInTheDocument();
      expect(screen.getByText('Locked')).toBeInTheDocument();
    });

    it('labels the action button for the idle step', () => {
      renderComponent();

      expect(
        screen.getByRole('button', {
          name: 'Confirm Delivery & Release Payment',
        }),
      ).toBeEnabled();
    });

    it('shows no in-progress or success panel', () => {
      renderComponent();

      expect(
        screen.queryByText('Waiting for wallet approval…'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Payment Released!')).not.toBeInTheDocument();
    });

    it('opens the confirmation dialog when the action button is clicked', () => {
      renderComponent();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Confirm Delivery & Release Payment',
        }),
      );

      expect(hookActions.openConfirmDialog).toHaveBeenCalledWith(
        ESCROW_ID,
        DELIVERY_ID,
        mockWalletState.address,
      );
    });
  });

  describe('confirming state — the modal', () => {
    beforeEach(() => mockHook({ step: 'confirming' }));

    it('renders an accessible modal dialog', () => {
      renderComponent();

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'escrow-modal-title');
    });

    it('shows the warning icon and the irreversibility copy', () => {
      renderComponent();
      const dialog = screen.getByRole('dialog');

      // Amber warning triangle, not the spinner or the checkmark.
      expect(dialog.querySelector('svg.text-amber-600')).toBeInTheDocument();
      expect(dialog.querySelector('svg.animate-spin')).not.toBeInTheDocument();
      expect(
        within(dialog).getByText(/This action cannot be undone/i),
      ).toBeInTheDocument();
    });

    it('states the amount being released', () => {
      renderComponent();
      const dialog = screen.getByRole('dialog');

      expect(within(dialog).getByText('Release escrow')).toBeInTheDocument();
      expect(within(dialog).getAllByText(/250\.00 XLM/).length).toBeGreaterThan(
        0,
      );
    });

    it('resets the flow when the modal is cancelled', () => {
      renderComponent();

      fireEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: 'Cancel',
        }),
      );

      expect(hookActions.reset).toHaveBeenCalled();
    });
  });

  describe('signing state — pending wallet approval', () => {
    beforeEach(() => mockHook({ step: 'signing' }));

    it('shows the waiting-for-wallet text', () => {
      renderComponent();

      expect(
        screen.getAllByText('Waiting for wallet approval…').length,
      ).toBeGreaterThan(0);
      expect(
        screen.getByText(/Your wallet is requesting your approval/i),
      ).toBeInTheDocument();
    });

    it('shows a spinning icon rather than the success checkmark', () => {
      const { container } = renderComponent();
      const panel = statusPanel(container, 'blue');

      const spinner = panel.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('text-blue-500');
      expect(panel.querySelector('svg.text-green-600')).not.toBeInTheDocument();
    });

    it('marks the action button busy and disabled', () => {
      renderComponent();

      const button = screen.getByRole('button', {
        name: 'Waiting for wallet approval…',
      });
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
    });
  });

  describe('releasing state — transaction submitted', () => {
    beforeEach(() => mockHook({ step: 'releasing' }));

    it('tells the user the transaction is awaiting confirmation', () => {
      renderComponent();

      expect(
        screen.getAllByText('Releasing payment…').length,
      ).toBeGreaterThan(0);
      expect(
        screen.getByText(/waiting for blockchain confirmation/i),
      ).toBeInTheDocument();
    });

    it('keeps the spinner visible', () => {
      const { container } = renderComponent();

      expect(
        statusPanel(container, 'blue').querySelector('svg.animate-spin'),
      ).toBeInTheDocument();
    });

    it('stays busy so the action cannot be fired twice', () => {
      renderComponent();

      const button = screen.getByRole('button', { name: 'Releasing payment…' });
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
    });
  });

  describe('done state — success', () => {
    beforeEach(() => mockHook({ step: 'done', transactionHash: TX_HASH }));

    it('announces the released payment', () => {
      renderComponent();

      expect(screen.getByText('Payment Released!')).toBeInTheDocument();
    });

    it('shows the success checkmark and drops the spinner', () => {
      const { container } = renderComponent();
      const panel = statusPanel(container, 'green');

      const check = panel.querySelector('svg.text-green-600');
      expect(check).toBeInTheDocument();
      expect(check).not.toHaveClass('animate-spin');
      expect(panel.querySelector('svg.animate-spin')).not.toBeInTheDocument();
    });

    it('surfaces the transaction hash for the explorer', () => {
      renderComponent();

      expect(screen.getByText(`Tx: ${TX_HASH}`)).toBeInTheDocument();
    });

    it('disables the action button once complete', () => {
      renderComponent();

      expect(
        screen.getByRole('button', { name: 'Payment Released ✓' }),
      ).toBeDisabled();
    });

    it('renders no confirmation modal', () => {
      renderComponent();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('error path', () => {
    it('returns to idle so the user can retry after a failure', () => {
      // useEscrowRelease resets step to idle and toasts on failure, so the
      // component should be back to an actionable idle panel.
      mockHook({ step: 'idle', transactionHash: null });
      renderComponent();

      expect(
        screen.getByRole('button', {
          name: 'Confirm Delivery & Release Payment',
        }),
      ).toBeEnabled();
      expect(screen.queryByText('Payment Released!')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Waiting for wallet approval…'),
      ).not.toBeInTheDocument();
    });

    it('blocks the action when the escrow is not in a locked state', () => {
      mockHook({
        escrowDetails: { ...LOCKED_ESCROW, status: 'disputed' },
      });
      renderComponent();

      expect(
        screen.getByRole('button', {
          name: 'Confirm Delivery & Release Payment',
        }),
      ).toBeDisabled();
      expect(screen.getByText('Disputed')).toBeInTheDocument();
    });
  });

  describe('gating states', () => {
    it('renders a skeleton while escrow details load', () => {
      mockHook({ isLoading: true });
      const { container } = renderComponent();

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { name: 'Release Escrow Payment' }),
      ).not.toBeInTheDocument();
    });

    it('asks the user to connect a wallet when disconnected', () => {
      mockWalletState.isConnected = false;
      mockHook();
      renderComponent();

      expect(
        screen.getByText(/Connect your wallet to release the escrow payment/i),
      ).toBeInTheDocument();
    });

    it('shows the already-released panel with a checkmark', () => {
      mockHook({
        escrowDetails: { ...LOCKED_ESCROW, status: 'released' },
      });
      const { container } = renderComponent();

      expect(screen.getByText('Payment Already Released')).toBeInTheDocument();
      expect(
        container.querySelector('svg.text-green-600'),
      ).toBeInTheDocument();
    });
  });

  describe('wiring', () => {
    it('fetches the escrow details for the given id on mount', () => {
      renderComponent();

      expect(hookActions.fetchEscrowDetails).toHaveBeenCalledWith(ESCROW_ID);
    });

    it('truncates the connected wallet address', () => {
      renderComponent();

      expect(screen.getByText('GABCDE…0XYZ')).toBeInTheDocument();
    });
  });
});
