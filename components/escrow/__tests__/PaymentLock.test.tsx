/**
 * PaymentLock component tests
 *
 * Strategy: mock useCurrencyConversion at the hook boundary so tests run
 * fast without a QueryClient or network. Focus on UI behaviour, form
 * validation, accessibility, and the onLock callback contract.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaymentLock } from '@/components/escrow/PaymentLock';
import {
  useCurrencyConversion,
  type CurrencyConversionResult,
} from '@/hooks/useCurrencyConversion';

// ---------------------------------------------------------------------------
// Mock the hook layer
// ---------------------------------------------------------------------------
jest.mock('@/hooks/useCurrencyConversion');

const mockUseCurrencyConversion = useCurrencyConversion as jest.MockedFunction<
  typeof useCurrencyConversion
>;

const DEFAULT_HOOK_STATE: CurrencyConversionResult = {
  ngnAmount: '',
  ngnRaw: null,
  rate: null,
  rateUpdatedAt: null,
  isLoading: false,
  isError: false,
};

const mockConversion = (overrides: Partial<CurrencyConversionResult> = {}) => {
  mockUseCurrencyConversion.mockReturnValue({
    ...DEFAULT_HOOK_STATE,
    ...overrides,
  });
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks();
  mockConversion(); // default: no rate, no NGN amount
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('PaymentLock', () => {
  const mockOnLock = jest.fn();

  // -- Rendering -----------------------------------------------------------

  it('renders the form with the correct heading', () => {
    render(<PaymentLock onLock={mockOnLock} />);
    expect(
      screen.getByRole('heading', { name: /Lock Escrow Payment/i }),
    ).toBeInTheDocument();
  });

  it('renders the XLM amount input', () => {
    render(<PaymentLock onLock={mockOnLock} />);
    expect(screen.getByLabelText(/Amount \(XLM\)/i)).toBeInTheDocument();
  });

  it('pre-fills the input when initialAmount is provided', () => {
    mockConversion({ ngnAmount: '₦2,500.00', ngnRaw: 2500, rate: 2500 });
    render(<PaymentLock onLock={mockOnLock} initialAmount="1" />);
    expect(screen.getByLabelText(/Amount \(XLM\)/i)).toHaveValue('1');
  });

  it('renders a submit button', () => {
    render(<PaymentLock onLock={mockOnLock} />);
    expect(
      screen.getByRole('button', { name: /Lock Payment/i }),
    ).toBeInTheDocument();
  });

  it('renders the "Why XLM only?" tooltip trigger button', () => {
    render(<PaymentLock onLock={mockOnLock} />);
    expect(
      screen.getByRole('button', { name: /Why XLM only\?/i }),
    ).toBeInTheDocument();
  });

  // -- Accessibility -------------------------------------------------------

  it('has aria-label on the form', () => {
    render(<PaymentLock onLock={mockOnLock} />);
    expect(
      screen.getByRole('form', { name: /Lock escrow payment/i }),
    ).toBeInTheDocument();
  });

  it('has aria-live="polite" on the NGN equivalent section', () => {
    render(<PaymentLock onLock={mockOnLock} />);
    const liveRegion = document.getElementById('ngn-equivalent');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  // -- Tooltip interaction -------------------------------------------------

  it('shows the tooltip text on hover', async () => {
    render(<PaymentLock onLock={mockOnLock} />);
    const infoButton = screen.getByRole('button', { name: /Why XLM only\?/i });

    fireEvent.mouseEnter(infoButton);
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      /Smart contracts on the Stellar network operate strictly in XLM/i,
    );

    fireEvent.mouseLeave(infoButton);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows the tooltip on keyboard focus', async () => {
    render(<PaymentLock onLock={mockOnLock} />);
    const infoButton = screen.getByRole('button', { name: /Why XLM only\?/i });

    fireEvent.focus(infoButton);
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(infoButton);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // -- NGN equivalent display ----------------------------------------------

  it('shows loading text while the rate is being fetched', () => {
    mockConversion({ isLoading: true });
    render(<PaymentLock onLock={mockOnLock} />);
    expect(screen.getByText(/Fetching rate/i)).toBeInTheDocument();
  });

  it('shows "NGN equivalent unavailable" when the rate fetch errors', () => {
    mockConversion({ isError: true });
    render(<PaymentLock onLock={mockOnLock} />);
    expect(screen.getByText(/NGN equivalent unavailable/i)).toBeInTheDocument();
  });

  it('displays the formatted NGN amount when a rate is available', () => {
    mockConversion({ ngnAmount: '₦2,500.00', ngnRaw: 2500, rate: 2500 });
    render(<PaymentLock onLock={mockOnLock} initialAmount="1" />);
    expect(screen.getByText('₦2,500.00')).toBeInTheDocument();
  });

  it('shows the placeholder text when input is empty and no error', () => {
    render(<PaymentLock onLock={mockOnLock} />);
    expect(
      screen.getByText(/Enter an amount to see the NGN equivalent/i),
    ).toBeInTheDocument();
  });

  it('shows "≈ NGN equivalent" label next to the amount', () => {
    mockConversion({ ngnAmount: '₦1,250.00', ngnRaw: 1250, rate: 2500 });
    render(<PaymentLock onLock={mockOnLock} initialAmount="0.5" />);
    expect(screen.getByText(/≈ NGN equivalent/i)).toBeInTheDocument();
  });

  // -- Input filtering / validation ----------------------------------------

  it('accepts numeric input', async () => {
    render(<PaymentLock onLock={mockOnLock} />);
    const input = screen.getByLabelText(/Amount \(XLM\)/i);
    fireEvent.change(input, { target: { value: '10' } });
    expect(input).toHaveValue('10');
  });

  it('accepts decimal input', async () => {
    render(<PaymentLock onLock={mockOnLock} />);
    const input = screen.getByLabelText(/Amount \(XLM\)/i);
    fireEvent.change(input, { target: { value: '0.5' } });
    expect(input).toHaveValue('0.5');
  });

  it('rejects non-numeric characters', async () => {
    render(<PaymentLock onLock={mockOnLock} />);
    const input = screen.getByLabelText(/Amount \(XLM\)/i);
    // The onChange handler filters non-numeric characters — value stays empty
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue('');
  });

  it('shows a validation message when the input is non-empty but invalid', async () => {
    render(<PaymentLock onLock={mockOnLock} />);
    const input = screen.getByLabelText(/Amount \(XLM\)/i);
    // "0" is valid numerically but parsedXlm > 0 guard catches it
    // Simulate entering "0" which passes the regex but fails the > 0 check
    fireEvent.change(input, { target: { value: '0' } });
    expect(
      await screen.findByText(/valid XLM amount greater than 0/i),
    ).toBeInTheDocument();
  });

  // -- Submit button state -------------------------------------------------

  it('disables the submit button when input is empty', () => {
    render(<PaymentLock onLock={mockOnLock} />);
    expect(
      screen.getByRole('button', { name: /Lock Payment/i }),
    ).toBeDisabled();
  });

  it('enables the submit button when a valid amount is entered', async () => {
    mockConversion({ ngnAmount: '₦2,500.00', ngnRaw: 2500, rate: 2500 });
    render(<PaymentLock onLock={mockOnLock} initialAmount="1" />);
    expect(
      screen.getByRole('button', { name: /Lock 1 XLM/i }),
    ).not.toBeDisabled();
  });

  it('disables the entire form when the disabled prop is true', () => {
    render(<PaymentLock onLock={mockOnLock} disabled />);
    expect(screen.getByLabelText(/Amount \(XLM\)/i)).toBeDisabled();
  });

  // -- onLock callback -----------------------------------------------------

  it('calls onLock with the correct numeric value on submit', async () => {
    mockConversion({ ngnAmount: '₦2,500.00', ngnRaw: 2500, rate: 2500 });
    mockOnLock.mockResolvedValue(undefined);

    render(<PaymentLock onLock={mockOnLock} initialAmount="1" />);

    fireEvent.click(screen.getByRole('button', { name: /Lock 1 XLM/i }));

    await waitFor(() => expect(mockOnLock).toHaveBeenCalledWith(1));
  });

  it('calls onLock with a float value for decimal input', async () => {
    mockConversion({ ngnAmount: '₦1,250.00', ngnRaw: 1250, rate: 2500 });
    mockOnLock.mockResolvedValue(undefined);

    render(<PaymentLock onLock={mockOnLock} initialAmount="0.5" />);

    fireEvent.click(screen.getByRole('button', { name: /Lock 0.5 XLM/i }));

    await waitFor(() => expect(mockOnLock).toHaveBeenCalledWith(0.5));
  });

  // -- Submit error handling -----------------------------------------------

  it('shows an error alert when onLock throws', async () => {
    mockConversion({ ngnAmount: '₦2,500.00', ngnRaw: 2500, rate: 2500 });
    mockOnLock.mockRejectedValue(new Error('Wallet rejected transaction'));

    render(<PaymentLock onLock={mockOnLock} initialAmount="1" />);
    fireEvent.click(screen.getByRole('button', { name: /Lock 1 XLM/i }));

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/Wallet rejected transaction/i);
  });

  it('shows a generic error message when onLock throws a non-Error', async () => {
    mockConversion({ ngnAmount: '₦2,500.00', ngnRaw: 2500, rate: 2500 });
    mockOnLock.mockRejectedValue('unknown');

    render(<PaymentLock onLock={mockOnLock} initialAmount="1" />);
    fireEvent.click(screen.getByRole('button', { name: /Lock 1 XLM/i }));

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/Failed to lock escrow/i);
  });

  // -- useCurrencyConversion called with correct value ---------------------

  it('passes the current input value to useCurrencyConversion', () => {
    render(<PaymentLock onLock={mockOnLock} initialAmount="42" />);
    expect(mockUseCurrencyConversion).toHaveBeenCalledWith('42');
  });

  it('passes an empty string to useCurrencyConversion when input is empty', () => {
    render(<PaymentLock onLock={mockOnLock} />);
    expect(mockUseCurrencyConversion).toHaveBeenCalledWith('');
  });
});
