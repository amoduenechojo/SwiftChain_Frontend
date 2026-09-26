import { render, screen } from '@testing-library/react';
import { MobileEscrowWidget } from '@/components/mobile/MobileEscrowWidget';
import { useMobileEscrowSummary } from '@/hooks/useMobileEscrowSummary';

jest.mock('@/hooks/useMobileEscrowSummary');
const mockUseMobileEscrowSummary = useMobileEscrowSummary as jest.Mock;

describe('MobileEscrowWidget', () => {
  it('renders the escrow status and locked amount once loaded', () => {
    mockUseMobileEscrowSummary.mockReturnValue({
      summary: {
        status: 'locked',
        statusLabel: 'ESCROW LOCKED',
        amount: 42500,
        currency: 'USDC',
        metrics: [
          { id: 'metric-signatures', label: 'Signatures', value: '2 / 3' },
        ],
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<MobileEscrowWidget />);

    expect(screen.getByText('ESCROW LOCKED')).toBeInTheDocument();
    expect(screen.getByText('42,500 USDC')).toBeInTheDocument();
    expect(screen.getByText('Signatures')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('stacks each metric block below the main widget', () => {
    mockUseMobileEscrowSummary.mockReturnValue({
      summary: {
        status: 'locked',
        statusLabel: 'ESCROW LOCKED',
        amount: 42500,
        currency: 'USDC',
        metrics: [
          { id: 'metric-signatures', label: 'Signatures', value: '2 / 3' },
          { id: 'metric-network', label: 'Network', value: 'Stellar Mainnet' },
          { id: 'metric-eta', label: 'Release ETA', value: '~4s' },
        ],
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<MobileEscrowWidget />);

    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('Stellar Mainnet')).toBeInTheDocument();
    expect(screen.getByText('Release ETA')).toBeInTheDocument();
  });

  it('shows a loading skeleton while data is being fetched', () => {
    mockUseMobileEscrowSummary.mockReturnValue({
      summary: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<MobileEscrowWidget />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText('ESCROW LOCKED')).not.toBeInTheDocument();
  });

  it('renders an error message when the fetch fails', () => {
    mockUseMobileEscrowSummary.mockReturnValue({
      summary: null,
      isLoading: false,
      error: 'Failed to load escrow status',
      refetch: jest.fn(),
    });

    render(<MobileEscrowWidget />);

    expect(screen.getByText('Failed to load escrow status')).toBeInTheDocument();
  });
});
