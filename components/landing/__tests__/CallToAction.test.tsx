import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CallToAction } from '@/components/landing/CallToAction';
import { useCallToAction } from '@/hooks/useCallToAction';

jest.mock('@/hooks/useCallToAction');
const mockUseCallToAction = useCallToAction as jest.Mock;

const mockFormRegister = jest.fn().mockReturnValue({});
const mockFormHandleSubmit = jest.fn(
  (fn: (_values: Record<string, unknown>) => Promise<void>) => fn,
);

const baseMock = {
  form: {
    register: mockFormRegister,
    handleSubmit: mockFormHandleSubmit,
    formState: {
      errors: {},
      isDirty: false,
      isValid: true,
    },
    reset: jest.fn(),
  },
  isSubmitting: false,
  isSuccess: false,
  responseMessage: null,
  error: null,
  onSubmit: jest.fn(),
  resetForm: jest.fn(),
};

describe('CallToAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the headline and email input', () => {
    mockUseCallToAction.mockReturnValue(baseMock);

    render(<CallToAction />);

    expect(screen.getByText(/Ready to/i)).toBeInTheDocument();
    expect(screen.getByText(/Chain/)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter your work email/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Get Access/i }),
    ).toBeInTheDocument();
  });

  it('shows validation error when email is invalid', () => {
    mockUseCallToAction.mockReturnValue({
      ...baseMock,
      form: {
        ...baseMock.form,
        formState: {
          errors: { email: { message: 'Please enter a valid email address' } },
          isDirty: true,
          isValid: false,
        },
      },
    });

    render(<CallToAction />);

    expect(
      screen.getByText('Please enter a valid email address'),
    ).toBeInTheDocument();
  });

  it('shows success state after submission', () => {
    mockUseCallToAction.mockReturnValue({
      ...baseMock,
      isSuccess: true,
      responseMessage: 'You are on the waitlist!',
    });

    render(<CallToAction />);

    expect(screen.getByText('You are on the waitlist!')).toBeInTheDocument();
    expect(screen.getByText(/We'll be in touch soon/i)).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/Enter your work email/i),
    ).not.toBeInTheDocument();
  });

  it('shows error state when submission fails', () => {
    mockUseCallToAction.mockReturnValue({
      ...baseMock,
      error: 'Something went wrong. Please try again.',
    });

    render(<CallToAction />);

    expect(
      screen.getByText('Something went wrong. Please try again.'),
    ).toBeInTheDocument();
  });

  it('disables the submit button while submitting', () => {
    mockUseCallToAction.mockReturnValue({
      ...baseMock,
      isSubmitting: true,
    });

    render(<CallToAction />);

    const button = screen.getByRole('button', { name: /Sending/i });
    expect(button).toBeDisabled();
  });

  it('renders the trust indicator text', () => {
    mockUseCallToAction.mockReturnValue(baseMock);

    render(<CallToAction />);

    expect(
      screen.getByText(/2,500\+ logistics professionals/i),
    ).toBeInTheDocument();
  });

  it('calls resetForm when "Try again" is clicked in error state', async () => {
    const user = userEvent.setup();
    const mockResetForm = jest.fn();

    mockUseCallToAction.mockReturnValue({
      ...baseMock,
      error: 'Something went wrong. Please try again.',
      resetForm: mockResetForm,
    });

    render(<CallToAction />);

    await user.click(screen.getByRole('button', { name: /Try again/i }));
    expect(mockResetForm).toHaveBeenCalledTimes(1);
  });
});
