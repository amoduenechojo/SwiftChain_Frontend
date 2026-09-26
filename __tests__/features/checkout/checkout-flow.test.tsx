import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// TODO: Update this import path to point to your actual checkout component
// import CheckoutView from '@/features/checkout/CheckoutView'; 

// 1. Mock external API calls
const mockLockFunds = jest.fn();
const mockGetEscrow = jest.fn();

jest.mock('@/services/api', () => ({
  lockFunds: (...args: any[]) => mockLockFunds(...args),
  getEscrowDetails: (...args: any[]) => mockGetEscrow(...args),
}));

// 2. Mock Web3 Wallet / Stellar hooks
jest.mock('@/hooks/useWallet', () => ({
  useWallet: () => ({
    connect: jest.fn().mockResolvedValue(true),
    address: 'GABCD...MOCK_WALLET_ADDRESS',
    isConnected: true,
    signTransaction: jest.fn().mockResolvedValue('mock_signed_xdr'),
  }),
}));

describe('E2E: Complete Escrow Payment Checkout Flow', () => {
  const MOCK_ESCROW = {
    id: 'escrow_12345',
    amount: '500',
    currency: 'USDC',
    status: 'pending_funding',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEscrow.mockResolvedValue(MOCK_ESCROW);
  });

  it('completes the happy path: locks funds and shows success state', async () => {
    const user = userEvent.setup();
    mockLockFunds.mockResolvedValue({ success: true, status: 'funded' });

    // Render the component (pass mock ID as prop or via mocked router)
    // render(<CheckoutView escrowId="escrow_12345" />);

    // Verify initial state
    expect(await screen.findByText(/500 USDC/i)).toBeInTheDocument();
    
    // Simulate clicking the "Lock Funds" button
    const lockButton = screen.getByRole('button', { name: /Lock Funds/i });
    await user.click(lockButton);

    // Verify API was called to lock funds
    await waitFor(() => {
      expect(mockLockFunds).toHaveBeenCalledWith('escrow_12345', 'mock_signed_xdr');
    });

    // Verify success UI
    expect(await screen.findByText(/Funds successfully locked/i)).toBeInTheDocument();
  });

  it('handles backend validation errors during checkout', async () => {
    const user = userEvent.setup();
    // Mock a failure response
    mockLockFunds.mockRejectedValue(new Error('Escrow already funded or invalid state.'));

    // render(<CheckoutView escrowId="escrow_12345" />);

    const lockButton = await screen.findByRole('button', { name: /Lock Funds/i });
    await user.click(lockButton);

    // Verify error UI is displayed
    expect(await screen.findByText(/Escrow already funded or invalid state/i)).toBeInTheDocument();
  });
});