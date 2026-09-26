import { render, screen } from '@testing-library/react';
import { NetworkPathways } from '@/components/landing/NetworkPathways';
import { useNetworkPathways } from '@/hooks/useNetworkPathways';

jest.mock('@/hooks/useNetworkPathways');
const mockUseNetworkPathways = useNetworkPathways as jest.Mock;

const baseCards = [
  {
    id: 'logistics-enterprises',
    icon: 'enterprise',
    title: 'Logistics Enterprises',
    description: 'Run your entire fleet through one escrow-backed command center.',
    cta: { label: 'Talk to our team', href: '/contact' },
  },
  {
    id: 'independent-carriers',
    icon: 'carrier',
    title: 'Independent Carriers',
    description: 'Pick up jobs, get paid the moment delivery is confirmed.',
    cta: { label: 'Join as a carrier', href: '/dashboard' },
  },
];

describe('NetworkPathways', () => {
  it('renders both pathway cards once loaded', () => {
    mockUseNetworkPathways.mockReturnValue({
      cards: baseCards,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<NetworkPathways />);

    expect(screen.getByText('Logistics Enterprises')).toBeInTheDocument();
    expect(screen.getByText('Independent Carriers')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Talk to our team/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Join as a carrier/i })).toBeInTheDocument();
  });

  it('stacks cards in a single column below md and two columns from md up', () => {
    mockUseNetworkPathways.mockReturnValue({
      cards: baseCards,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<NetworkPathways />);
    const grid = container.querySelector('.grid');

    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
  });

  it('applies a hover state class to each card', () => {
    mockUseNetworkPathways.mockReturnValue({
      cards: baseCards,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<NetworkPathways />);

    const card = screen.getByText('Logistics Enterprises').closest('div.group');
    expect(card?.className).toContain('hover:');
  });

  it('shows a loading skeleton while data is being fetched', () => {
    mockUseNetworkPathways.mockReturnValue({
      cards: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<NetworkPathways />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText('Logistics Enterprises')).not.toBeInTheDocument();
  });

  it('renders an error message when the fetch fails', () => {
    mockUseNetworkPathways.mockReturnValue({
      cards: [],
      isLoading: false,
      error: 'Failed to load network pathways',
      refetch: jest.fn(),
    });

    render(<NetworkPathways />);

    expect(screen.getByText('Failed to load network pathways')).toBeInTheDocument();
  });
});
