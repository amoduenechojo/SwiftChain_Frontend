import { render, screen, fireEvent } from '@testing-library/react';
import { ComparisonTable } from '../ComparisonTable';
import { usePricingComparison } from '@/hooks/usePricingComparison';
import { pricingService } from '@/services/pricingService';
import type { PricingComparison } from '@/types/pricing';

jest.mock('@/hooks/usePricingComparison');
const mockedUsePricingComparison = usePricingComparison as jest.Mock;

jest.mock('@/services/pricingService', () => ({
  pricingService: {
    getComparison: jest.fn(),
  },
}));

const mockComparison: PricingComparison = {
  plans: [
    { id: 'starter', name: 'Starter' },
    { id: 'business', name: 'Business' },
    { id: 'enterprise', name: 'Enterprise' },
  ],
  rows: [
    {
      id: 'blockchain-confirmation',
      label: 'Blockchain Confirmation',
      values: { starter: '~30s', business: '~10s', enterprise: '<3s' },
    },
    {
      id: 'escrow-multisig',
      label: 'Escrow Multi-Sig',
      values: { starter: false, business: true, enterprise: true },
    },
  ],
};

describe('ComparisonTable', () => {
  const mockRefetch = jest.fn();

  beforeEach(() => {
    mockedUsePricingComparison.mockClear();
    mockRefetch.mockClear();
  });

  it('renders loading state', () => {
    mockedUsePricingComparison.mockReturnValue({
      comparison: null,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<ComparisonTable />);
    expect(screen.getByLabelText('Loading pricing comparison')).toBeInTheDocument();
  });

  it('renders error state and retries on click', () => {
    mockedUsePricingComparison.mockReturnValue({
      comparison: null,
      isLoading: false,
      error: 'Failed to load pricing comparison',
      refetch: mockRefetch,
    });

    render(<ComparisonTable />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load pricing comparison');

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders plan column headers and feature rows', () => {
    mockedUsePricingComparison.mockReturnValue({
      comparison: mockComparison,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<ComparisonTable />);
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getByText('Blockchain Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Escrow Multi-Sig')).toBeInTheDocument();
    expect(screen.getByText('~30s')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Included')).toHaveLength(2);
    expect(screen.getByLabelText('Not included')).toBeInTheDocument();
  });

  it('verifies backend API service returns PricingComparison response shape', async () => {
    (pricingService.getComparison as jest.Mock).mockResolvedValue(mockComparison);

    const result = await pricingService.getComparison();
    expect(result.plans).toHaveLength(3);
    expect(result.rows[0].label).toBe('Blockchain Confirmation');
  });
});
