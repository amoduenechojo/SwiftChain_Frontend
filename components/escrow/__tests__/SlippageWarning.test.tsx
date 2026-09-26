/**
 * Tests for SlippageWarning
 *
 * Covers:
 * - No render when slippage is within normal range
 * - Advisory banner for volatile slippage (>2%)
 * - Blocking banner + checkbox for critical slippage (>5%)
 * - Acknowledgment callback wiring
 * - Success state once acknowledged
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SlippageWarning } from '@/components/escrow/SlippageWarning';

describe('SlippageWarning', () => {
  it('renders nothing when slippage is within the normal range', () => {
    render(
      <SlippageWarning
        slippagePercent={0.5}
        isVolatile={false}
        requiresAcknowledgment={false}
        isAcknowledged={false}
        onAcknowledgeChange={jest.fn()}
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the volatility advisory banner when slippage exceeds 2% but not 5%', () => {
    render(
      <SlippageWarning
        slippagePercent={3.14}
        isVolatile={true}
        requiresAcknowledgment={false}
        isAcknowledged={false}
        onAcknowledgeChange={jest.fn()}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/FX Rate Volatility Detected/i)).toBeInTheDocument();
    expect(screen.getByText(/3\.14%/)).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('shows the blocking critical banner with a checkbox when slippage exceeds 5%', () => {
    render(
      <SlippageWarning
        slippagePercent={6.2}
        isVolatile={true}
        requiresAcknowledgment={true}
        isAcknowledged={false}
        onAcknowledgeChange={jest.fn()}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/High FX Rate Volatility/i)).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.checked).toBe(false);
  });

  it('invokes onAcknowledgeChange with the new checked state when toggled', () => {
    const onAcknowledgeChange = jest.fn();
    render(
      <SlippageWarning
        slippagePercent={6.2}
        isVolatile={true}
        requiresAcknowledgment={true}
        isAcknowledged={false}
        onAcknowledgeChange={onAcknowledgeChange}
      />
    );

    fireEvent.click(screen.getByRole('checkbox'));

    expect(onAcknowledgeChange).toHaveBeenCalledWith(true);
  });

  it('disables the checkbox while a submission is in flight', () => {
    render(
      <SlippageWarning
        slippagePercent={6.2}
        isVolatile={true}
        requiresAcknowledgment={true}
        isAcknowledged={false}
        onAcknowledgeChange={jest.fn()}
        isSubmitting={true}
      />
    );

    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('shows the acknowledged confirmation once the checkbox is checked', () => {
    render(
      <SlippageWarning
        slippagePercent={6.2}
        isVolatile={true}
        requiresAcknowledgment={true}
        isAcknowledged={true}
        onAcknowledgeChange={jest.fn()}
      />
    );

    expect(screen.getByText(/Volatility acknowledged/i)).toBeInTheDocument();
  });
});
