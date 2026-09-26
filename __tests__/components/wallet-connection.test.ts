// __tests__/components/wallet-connection.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// TODO: Update these import paths to match your actual hooks and components
// import { useWallet } from '@/hooks/useWallet';
// import WalletConnector from '@/components/WalletConnector';

// 1. Mock the useWallet hook
jest.mock('@/hooks/useWallet', () => ({
  useWallet: jest.fn(),
}));

import { useWallet } from '@/hooks/useWallet';

describe('E2E: Stellar Wallet Connection and Disconnection Flow', () => {
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes the happy path: connects wallet and displays address', async () => {
    const user = userEvent.setup();
    
    // Simulate initial disconnected state
    (useWallet as jest.Mock).mockReturnValue({
      connect: mockConnect,
      disconnect: mockDisconnect,
      address: null,
      isConnected: false,
      error: null,
    });

    // render(<WalletConnector />);

    const connectButton = await screen.findByRole('button', { name: /Connect Wallet/i });
    expect(connectButton).toBeInTheDocument();

    // Simulate clicking connect
    await user.click(connectButton);
    expect(mockConnect).toHaveBeenCalledTimes(1);

    // Simulate the state update after successful connection
    (useWallet as jest.Mock).mockReturnValue({
      connect: mockConnect,
      disconnect: mockDisconnect,
      address: 'GABCD1234567890MOCKWALLETADDRESS',
      isConnected: true,
      error: null,
    });

    // Re-render the component to reflect the new mocked state
    // render(<WalletConnector />);

    // Verify the UI updates to show the connected address or a disconnect button
    expect(await screen.findByText(/GABCD...RESS/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Connect Wallet/i })).not.toBeInTheDocument();
  });

  it('completes the happy path: disconnects an active wallet', async () => {
    const user = userEvent.setup();
    
    // Simulate connected state
    (useWallet as jest.Mock).mockReturnValue({
      connect: mockConnect,
      disconnect: mockDisconnect,
      address: 'GABCD1234567890MOCKWALLETADDRESS',
      isConnected: true,
      error: null,
    });

    // render(<WalletConnector />);

    const disconnectButton = await screen.findByRole('button', { name: /Disconnect/i });
    expect(disconnectButton).toBeInTheDocument();

    // Simulate clicking disconnect
    await user.click(disconnectButton);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('handles wallet connection rejection or errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Simulate an error state after a failed connection attempt
    (useWallet as jest.Mock).mockReturnValue({
      connect: mockConnect,
      disconnect: mockDisconnect,
      address: null,
      isConnected: false,
      error: 'User rejected the request.',
    });

    // render(<WalletConnector />);

    // The component should render an error message to the user
    expect(await screen.findByText(/User rejected the request/i)).toBeInTheDocument();
    
    // The connect button should still be available for retry
    const connectButton = screen.getByRole('button', { name: /Connect Wallet/i });
    expect(connectButton).toBeInTheDocument();
  });
});