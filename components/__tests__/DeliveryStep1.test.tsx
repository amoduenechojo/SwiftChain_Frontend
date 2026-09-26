// __tests__/components/DeliveryStep1.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Adjust import path to match your project structure
import DeliveryStep1 from '@/components/delivery/DeliveryStep1';

describe('Component: New Delivery (Step 1) Validation Requirements', () => {
  const mockOnNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays validation errors when attempting to proceed with empty fields', async () => {
    const user = userEvent.setup();
    render(<DeliveryStep1 onNext={mockOnNext} defaultValues={{}} />);

    // Attempt to proceed without filling the form
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Assert that validation errors appear for all required fields
    expect(await screen.findByText(/sender origin is required/i)).toBeInTheDocument();
    expect(screen.getByText(/receiver destination is required/i)).toBeInTheDocument();

    // Ensure the onNext callback is strictly blocked
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('clears validation errors dynamically as fields are populated', async () => {
    const user = userEvent.setup();
    render(<DeliveryStep1 onNext={mockOnNext} defaultValues={{}} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Errors should be visible initially
    expect(await screen.findByText(/sender origin is required/i)).toBeInTheDocument();

    // Fill in the sender origin
    const originInput = screen.getByLabelText(/sender origin/i);
    await user.type(originInput, '123 Start St, Lagos');

    // Error should disappear
    await waitFor(() => {
      expect(screen.queryByText(/sender origin is required/i)).not.toBeInTheDocument();
    });
  });

  it('calls onNext with form data when all required fields are valid', async () => {
    const user = userEvent.setup();
    render(<DeliveryStep1 onNext={mockOnNext} defaultValues={{}} />);

    await user.type(screen.getByLabelText(/sender origin/i), '123 Start St, Lagos');
    await user.type(screen.getByLabelText(/receiver destination/i), '456 End Ave, Lagos');

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledTimes(1);
      expect(mockOnNext).toHaveBeenCalledWith(expect.objectContaining({
        origin: '123 Start St, Lagos',
        destination: '456 End Ave, Lagos',
      }));
    });
  });
});