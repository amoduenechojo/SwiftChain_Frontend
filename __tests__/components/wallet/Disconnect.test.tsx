import { render, screen, fireEvent, act } from '@testing-library/react';
import { DisconnectButton } from '@/components/wallet/DisconnectButton';
import { useWalletStore, WALLET_STORAGE_KEY } from '@/store/walletStore';
import { walletService } from '@/services/walletService';
import { mockWalletDisconnectResponse } from '../../../hooks/__tests__/fixtures/walletApiResponses';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Only the network boundary is mocked, per the Component -> Hook -> Service
// architecture; useWallet, useWalletStore and sessionService run for real so
// this test exercises the actual session cleanup path.
jest.mock('@/services/walletService', () => ({
  walletService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
}));

describe('DisconnectButton - session cleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (walletService.disconnect as jest.Mock).mockResolvedValue(
      mockWalletDisconnectResponse
    );

    act(() => {
      useWalletStore.getState().setWallet('GABC123DEF456STELLAR', 0);
    });
    localStorage.setItem(
      WALLET_STORAGE_KEY,
      JSON.stringify({ address: 'GABC123DEF456STELLAR' })
    );
  });

  afterEach(() => {
    act(() => {
      useWalletStore.getState().clearWalletState();
    });
    localStorage.clear();
  });

  it('renders the connected address and an enabled disconnect control', () => {
    render(<DisconnectButton />);

    expect(
      screen.getByRole('button', { name: /disconnect wallet/i })
    ).toBeEnabled();
    expect(screen.getByText(/GABC123DEF456STELLAR/i)).toBeInTheDocument();
  });

  it('clears the wallet key from localStorage when disconnect is clicked', async () => {
    render(<DisconnectButton />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /disconnect wallet/i }));
    });

    expect(walletService.disconnect).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(WALLET_STORAGE_KEY)).toBeNull();
  });

  it('redirects to /login after disconnect completes', async () => {
    render(<DisconnectButton />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /disconnect wallet/i }));
    });

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('still clears localStorage and redirects when the backend call fails', async () => {
    (walletService.disconnect as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<DisconnectButton />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /disconnect wallet/i }));
    });

    expect(localStorage.getItem(WALLET_STORAGE_KEY)).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('renders the disabled empty state and clicking it performs no cleanup', () => {
    act(() => {
      useWalletStore.getState().clearWalletState();
    });
    localStorage.removeItem(WALLET_STORAGE_KEY);

    render(<DisconnectButton />);

    const button = screen.getByRole('button', { name: /disconnect wallet/i });
    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(walletService.disconnect).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
