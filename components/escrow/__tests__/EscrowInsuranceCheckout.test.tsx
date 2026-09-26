import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EscrowInsuranceCheckout } from '@/components/escrow/EscrowInsuranceCheckout';
import { insuranceService } from '@/services/insuranceService';
import type { EscrowCheckoutReceipt, InsurancePlan } from '@/types/insurance';

/**
 * Only the two network-bound members are mocked. buildCheckoutQuote and
 * formatXlm stay real so the totals asserted here are the ones the production
 * pricing logic produces.
 */
jest.mock('@/services/insuranceService', () => {
  const actual = jest.requireActual('@/services/insuranceService');
  return {
    ...actual,
    insuranceService: {
      ...actual.insuranceService,
      getPlans: jest.fn(),
      payWithEscrow: jest.fn(),
    },
  };
});

const mockGetPlans = insuranceService.getPlans as jest.MockedFunction<
  typeof insuranceService.getPlans
>;
const mockPayWithEscrow = insuranceService.payWithEscrow as jest.MockedFunction<
  typeof insuranceService.payWithEscrow
>;

const PLANS: InsurancePlan[] = [
  {
    id: 'plan-basic',
    name: 'Basic Cover',
    description: 'Covers loss in transit.',
    coverageXlm: 1000,
    premiumXlm: 12.5,
  },
  {
    id: 'plan-premium',
    name: 'Premium Cover',
    description: 'Covers loss, damage and delay.',
    coverageXlm: 5000,
    premiumXlm: 40.25,
    deductibleXlm: 25,
    recommended: true,
  },
];

const RECEIPT: EscrowCheckoutReceipt = {
  escrowId: 'escrow-9001',
  transactionHash: '3f8a1c2d4e5b6a7c8d9e0f1a2b3c4d5e',
  lockedXlm: 290.25,
  insurancePolicyId: 'policy-77',
};

const SHIPMENT_XLM = 250;

const WALLET = 'GBTESTWALLETADDRESS000000000000000000000000000000000000';

function renderCheckout(props: Partial<React.ComponentProps<typeof EscrowInsuranceCheckout>> = {}) {
  return render(
    <EscrowInsuranceCheckout
      shipmentId="shipment-1"
      shipmentXlm={SHIPMENT_XLM}
      walletAddress={WALLET}
      {...props}
    />
  );
}

/** Wait for the plan list to replace the loading indicator. */
async function awaitPlansLoaded() {
  await waitFor(() =>
    expect(screen.queryByText('Loading insurance plans')).not.toBeInTheDocument()
  );
}

describe('EscrowInsuranceCheckout — escrow and cargo insurance flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPlans.mockResolvedValue(PLANS);
    mockPayWithEscrow.mockResolvedValue(RECEIPT);
  });

  describe('insurance step', () => {
    it('shows a loading indicator while plans are being fetched', () => {
      mockGetPlans.mockReturnValue(new Promise(() => {}));

      renderCheckout();

      expect(screen.getByRole('status')).toHaveTextContent('Loading insurance plans');
    });

    it('requests plans for the shipment being funded', async () => {
      renderCheckout({ shipmentId: 'shipment-42' });

      await awaitPlansLoaded();

      expect(mockGetPlans).toHaveBeenCalledWith('shipment-42');
      expect(mockGetPlans).toHaveBeenCalledTimes(1);
    });

    it('lists every available plan with its coverage and premium', async () => {
      renderCheckout();
      await awaitPlansLoaded();

      expect(screen.getByRole('radio', { name: /Basic Cover/ })).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Covers up to 1000 XLM for 12.5 XLM/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /25 XLM deductible/ })
      ).toBeInTheDocument();
      expect(screen.getByText('Recommended')).toBeInTheDocument();
    });

    it('defaults to declining coverage', async () => {
      renderCheckout();
      await awaitPlansLoaded();

      expect(
        screen.getByRole('radio', { name: /Continue without coverage/ })
      ).toBeChecked();
      expect(screen.getByRole('radio', { name: /Basic Cover/ })).not.toBeChecked();
    });

    it('selects a plan and deselects the previous choice', async () => {
      const user = userEvent.setup();
      renderCheckout();
      await awaitPlansLoaded();

      await user.click(screen.getByRole('radio', { name: /Basic Cover/ }));
      expect(screen.getByRole('radio', { name: /Basic Cover/ })).toBeChecked();

      await user.click(screen.getByRole('radio', { name: /Premium Cover/ }));
      expect(screen.getByRole('radio', { name: /Premium Cover/ })).toBeChecked();
      expect(screen.getByRole('radio', { name: /Basic Cover/ })).not.toBeChecked();
    });
  });

  describe('happy path', () => {
    it('completes the full flow: select insurance, review, pay, confirm', async () => {
      const user = userEvent.setup();
      const onComplete = jest.fn();
      renderCheckout({ onComplete });
      await awaitPlansLoaded();

      // Step 1 — choose coverage
      await user.click(screen.getByRole('radio', { name: /Premium Cover/ }));
      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));

      // Step 2 — the premium is added to the escrow total
      expect(
        screen.getByRole('heading', { name: 'Review and pay' })
      ).toBeInTheDocument();
      expect(screen.getByTestId('summary-shipment')).toHaveTextContent('250 XLM');
      expect(screen.getByTestId('summary-premium')).toHaveTextContent('40.25 XLM');
      expect(screen.getByTestId('summary-total')).toHaveTextContent('290.25 XLM');

      // Step 3 — pay
      await user.click(screen.getByRole('button', { name: 'Pay 290.25 XLM' }));

      expect(mockPayWithEscrow).toHaveBeenCalledWith({
        shipmentId: 'shipment-1',
        walletAddress: WALLET,
        insurancePlanId: 'plan-premium',
        totalXlm: 290.25,
      });

      const heading = await screen.findByRole('heading', { name: 'Escrow funded' });
      const receiptSection = heading.closest('section') as HTMLElement;

      expect(
        within(receiptSection).getByText('290.25 XLM is locked until delivery is confirmed.')
      ).toBeInTheDocument();
      expect(within(receiptSection).getByText('escrow-9001')).toBeInTheDocument();
      expect(
        within(receiptSection).getByText('3f8a1c2d4e5b6a7c8d9e0f1a2b3c4d5e')
      ).toBeInTheDocument();
      expect(within(receiptSection).getByText('policy-77')).toBeInTheDocument();

      await waitFor(() => expect(onComplete).toHaveBeenCalledWith(RECEIPT));
    });

    it('completes checkout without coverage and charges no premium', async () => {
      const user = userEvent.setup();
      mockPayWithEscrow.mockResolvedValue({
        escrowId: 'escrow-1',
        transactionHash: 'abc123',
        lockedXlm: SHIPMENT_XLM,
      });

      renderCheckout();
      await awaitPlansLoaded();

      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));

      expect(screen.getByTestId('summary-premium')).toHaveTextContent('0 XLM');
      expect(screen.getByTestId('summary-total')).toHaveTextContent('250 XLM');
      expect(screen.getByText('Insurance (declined)')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Pay 250 XLM' }));

      expect(mockPayWithEscrow).toHaveBeenCalledWith(
        expect.objectContaining({ insurancePlanId: null, totalXlm: 250 })
      );
      await screen.findByRole('heading', { name: 'Escrow funded' });
    });

    it('omits the policy reference when no coverage was purchased', async () => {
      const user = userEvent.setup();
      mockPayWithEscrow.mockResolvedValue({
        escrowId: 'escrow-1',
        transactionHash: 'abc123',
        lockedXlm: SHIPMENT_XLM,
      });

      renderCheckout();
      await awaitPlansLoaded();
      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));
      await user.click(screen.getByRole('button', { name: 'Pay 250 XLM' }));

      await screen.findByRole('heading', { name: 'Escrow funded' });
      expect(screen.queryByText('Insurance policy')).not.toBeInTheDocument();
    });

    it('recalculates the total when the shipper changes plan before paying', async () => {
      const user = userEvent.setup();
      renderCheckout();
      await awaitPlansLoaded();

      await user.click(screen.getByRole('radio', { name: /Premium Cover/ }));
      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));
      expect(screen.getByTestId('summary-total')).toHaveTextContent('290.25 XLM');

      await user.click(screen.getByRole('button', { name: 'Back' }));
      await user.click(screen.getByRole('radio', { name: /Basic Cover/ }));
      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));

      expect(screen.getByTestId('summary-total')).toHaveTextContent('262.5 XLM');

      await user.click(screen.getByRole('button', { name: 'Pay 262.5 XLM' }));

      expect(mockPayWithEscrow).toHaveBeenCalledWith(
        expect.objectContaining({ insurancePlanId: 'plan-basic', totalXlm: 262.5 })
      );
    });

    it('updates the estimated total when cargo coverage is selected', async () => {
      const user = userEvent.setup();
      renderCheckout();
      await awaitPlansLoaded();

      expect(screen.getByRole('radio', { name: /Continue without coverage/ })).toBeChecked();
      await user.click(screen.getByRole('radio', { name: /Premium Cover/ }));
      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));

      expect(screen.getByTestId('summary-premium')).toHaveTextContent('40.25 XLM');
      expect(screen.getByTestId('summary-total')).toHaveTextContent('290.25 XLM');
    });

    it('rounds the escrow total to stroop precision', async () => {
      const user = userEvent.setup();
      mockGetPlans.mockResolvedValue([
        { ...PLANS[0], premiumXlm: 0.2 },
      ]);

      renderCheckout({ shipmentXlm: 0.1 });
      await awaitPlansLoaded();

      await user.click(screen.getByRole('radio', { name: /Basic Cover/ }));
      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));

      // 0.1 + 0.2 must not surface as 0.30000000000000004
      expect(screen.getByTestId('summary-total')).toHaveTextContent('0.3 XLM');
    });
  });

  describe('empty and disconnected states', () => {
    it('lets the shipper continue when no plans are offered', async () => {
      const user = userEvent.setup();
      mockGetPlans.mockResolvedValue([]);
      mockPayWithEscrow.mockResolvedValue({
        escrowId: 'escrow-1',
        transactionHash: 'abc123',
        lockedXlm: SHIPMENT_XLM,
      });

      renderCheckout();
      await awaitPlansLoaded();

      expect(
        screen.getByText(/No insurance plans are available for this shipment/)
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));
      await user.click(screen.getByRole('button', { name: 'Pay 250 XLM' }));

      await screen.findByRole('heading', { name: 'Escrow funded' });
    });

    it('warns and blocks payment when no wallet is connected', async () => {
      const user = userEvent.setup();
      renderCheckout({ walletAddress: undefined });
      await awaitPlansLoaded();

      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Connect your wallet to fund this escrow.'
      );
      expect(screen.getByRole('button', { name: 'Pay 250 XLM' })).toBeDisabled();
      expect(mockPayWithEscrow).not.toHaveBeenCalled();
    });

    it('disables the continue button when the shipment amount is invalid', async () => {
      renderCheckout({ shipmentXlm: 0 });
      await awaitPlansLoaded();

      expect(screen.getByRole('button', { name: 'Continue to payment' })).toBeDisabled();
    });
  });

  describe('error handling', () => {
    it('surfaces a plan lookup failure and recovers on retry', async () => {
      const user = userEvent.setup();
      mockGetPlans.mockRejectedValueOnce(new Error('Insurance service unavailable'));

      renderCheckout();

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Insurance service unavailable');
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();

      mockGetPlans.mockResolvedValueOnce(PLANS);
      await user.click(screen.getByRole('button', { name: 'Retry' }));

      expect(
        await screen.findByRole('radio', { name: /Basic Cover/ })
      ).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows the payment error and keeps the shipper on the review step', async () => {
      const user = userEvent.setup();
      mockPayWithEscrow.mockRejectedValue(new Error('Insufficient XLM balance'));

      renderCheckout();
      await awaitPlansLoaded();

      await user.click(screen.getByRole('radio', { name: /Basic Cover/ }));
      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));
      await user.click(screen.getByRole('button', { name: 'Pay 262.5 XLM' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Insufficient XLM balance'
      );
      expect(screen.getByRole('heading', { name: 'Review and pay' })).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { name: 'Escrow funded' })
      ).not.toBeInTheDocument();
    });

    it('allows a retry after a rejected payment', async () => {
      const user = userEvent.setup();
      mockPayWithEscrow
        .mockRejectedValueOnce(new Error('User declined the transaction'))
        .mockResolvedValueOnce(RECEIPT);

      renderCheckout();
      await awaitPlansLoaded();

      await user.click(screen.getByRole('radio', { name: /Premium Cover/ }));
      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));
      await user.click(screen.getByRole('button', { name: 'Pay 290.25 XLM' }));

      await screen.findByRole('alert');

      await user.click(screen.getByRole('button', { name: 'Pay 290.25 XLM' }));

      await screen.findByRole('heading', { name: 'Escrow funded' });
      expect(mockPayWithEscrow).toHaveBeenCalledTimes(2);
    });

    it('clears a payment error when the shipper goes back to change coverage', async () => {
      const user = userEvent.setup();
      mockPayWithEscrow.mockRejectedValue(new Error('Network error'));

      renderCheckout();
      await awaitPlansLoaded();
      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));
      await user.click(screen.getByRole('button', { name: 'Pay 250 XLM' }));
      await screen.findByRole('alert');

      await user.click(screen.getByRole('button', { name: 'Back' }));
      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('disables both actions and shows progress while the payment settles', async () => {
      const user = userEvent.setup();
      let settle: (receipt: EscrowCheckoutReceipt) => void = () => {};
      mockPayWithEscrow.mockReturnValue(
        new Promise<EscrowCheckoutReceipt>((resolve) => {
          settle = resolve;
        })
      );

      renderCheckout();
      await awaitPlansLoaded();
      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));
      await user.click(screen.getByRole('button', { name: 'Pay 250 XLM' }));

      const payButton = await screen.findByRole('button', { name: /Processing payment/ });
      expect(payButton).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

      settle({
        escrowId: 'escrow-1',
        transactionHash: 'abc123',
        lockedXlm: SHIPMENT_XLM,
      });

      await screen.findByRole('heading', { name: 'Escrow funded' });
    });

    it('does not submit the payment twice on a double click', async () => {
      const user = userEvent.setup();
      let settle: (receipt: EscrowCheckoutReceipt) => void = () => {};
      mockPayWithEscrow.mockReturnValue(
        new Promise<EscrowCheckoutReceipt>((resolve) => {
          settle = resolve;
        })
      );

      renderCheckout();
      await awaitPlansLoaded();
      await user.click(screen.getByRole('button', { name: 'Continue to payment' }));

      const payButton = screen.getByRole('button', { name: 'Pay 250 XLM' });
      await user.click(payButton);
      await user.click(payButton);

      expect(mockPayWithEscrow).toHaveBeenCalledTimes(1);

      settle(RECEIPT);
      await screen.findByRole('heading', { name: 'Escrow funded' });
    });
  });
});
