import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateDeliveryForm } from '@/features/deliveries/components/CreateDeliveryForm';
import { useCreateDelivery } from '@/hooks/useCreateDelivery';

jest.mock('@/hooks/useCreateDelivery');

const mockUseCreateDelivery = useCreateDelivery as jest.MockedFunction<typeof useCreateDelivery>;

function renderForm() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateDeliveryForm />
    </QueryClientProvider>
  );
}

describe('CreateDeliveryForm package tier mapping', () => {
  it.each([
    ['small', 'Small'],
    ['medium', 'Medium'],
    ['large', 'Large'],
  ])('keeps the %s shipping tier selectable as %s', async (value, label) => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const register = jest.fn((name: string) => ({ name, onChange: jest.fn(), onBlur: jest.fn(), ref: jest.fn() }));

    mockUseCreateDelivery.mockReturnValue({
      form: {
        register,
        handleSubmit: (submit: (_values: unknown) => unknown) => (event: React.FormEvent) => {
          event.preventDefault();
          return submit({ packageSize: value });
        },
        formState: { errors: {}, isValid: true },
      } as any,
      isSubmitting: false,
      isSuccess: false,
      onSubmit,
    });

    renderForm();

    const packageSize = screen.getByRole('combobox', { name: 'Package Size' });
    await user.selectOptions(packageSize, value);

    expect(packageSize).toHaveValue(value);
    expect(screen.getByRole('option', { name: label })).toHaveValue(value);
  });
});