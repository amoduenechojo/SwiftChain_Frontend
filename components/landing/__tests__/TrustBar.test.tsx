import { render, screen } from '@testing-library/react';
import { TrustBar } from '@/components/landing/TrustBar';
import { useTrustBar } from '@/hooks/useTrustBar';

jest.mock('@/hooks/useTrustBar');
const mockUseTrustBar = useTrustBar as jest.Mock;

const mockTrustData = {
  header: 'Securing transactions',
  networks: [
    { id: 'ethereum', name: 'Ethereum', logoSvg: '' },
    { id: 'solana', name: 'Solana', logoSvg: '' },
    { id: 'polygon', name: 'Polygon', logoSvg: '' },
    { id: 'arbitrum', name: 'Arbitrum', logoSvg: '' },
    { id: 'optimism', name: 'Optimism', logoSvg: '' },
  ],
  stats: [
    { id: 'tps', label: 'Network Speed', value: '10,000+ TPS', subtext: 'Sub-second finality' },
    { id: 'tvl', label: 'Total Volume Secured', value: '$500M+', subtext: 'Cross-chain liquidity' },
  ],
};

describe('TrustBar Component', () => {
  it('renders network header, all 5 blockchain networks, and secondary stats', () => {
    mockUseTrustBar.mockReturnValue({
      data: mockTrustData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<TrustBar />);

    expect(screen.getByText('Securing transactions')).toBeInTheDocument();

    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Solana')).toBeInTheDocument();
    expect(screen.getByText('Polygon')).toBeInTheDocument();
    expect(screen.getByText('Arbitrum')).toBeInTheDocument();
    expect(screen.getByText('Optimism')).toBeInTheDocument();

    expect(screen.getByText('10,000+ TPS')).toBeInTheDocument();
    expect(screen.getByText('Network Speed')).toBeInTheDocument();
    expect(screen.getByText('$500M+')).toBeInTheDocument();
  });

  it('renders loading skeleton state', () => {
    mockUseTrustBar.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<TrustBar />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders error state when error is returned', () => {
    mockUseTrustBar.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Failed to load trust bar data',
      refetch: jest.fn(),
    });

    render(<TrustBar />);

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load trust bar data');
  });

  it('applies hover opacity shift classes to network logo cards', () => {
    mockUseTrustBar.mockReturnValue({
      data: mockTrustData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<TrustBar />);
    const networkBadge = container.querySelector('.opacity-70');

    expect(networkBadge).not.toBeNull();
    expect(networkBadge?.className).toContain('hover:opacity-100');
  });
});
