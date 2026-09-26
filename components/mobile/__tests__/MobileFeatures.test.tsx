import { render, screen } from '@testing-library/react';
import { MobileFeatures } from '@/components/mobile/MobileFeatures';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

jest.mock('@/hooks/useMobileFeatures');
const mockUseMobileFeatures = useMobileFeatures as jest.Mock;

const baseFeatures = [
  {
    id: 'spatial-anchoring',
    icon: '📍',
    title: 'Spatial Anchoring',
    description: 'Every shipment is pinned to a live location trail.',
  },
  {
    id: 'smart-contracts',
    icon: '📜',
    title: 'Smart Contracts',
    description: 'Escrow terms are enforced by code.',
  },
  {
    id: 'immutable-audit',
    icon: '🔒',
    title: 'Immutable Audit',
    description: 'Every status change is written to the ledger permanently.',
  },
];

describe('MobileFeatures', () => {
  it('renders all three feature cards once loaded', () => {
    mockUseMobileFeatures.mockReturnValue({
      features: baseFeatures,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<MobileFeatures />);

    expect(screen.getByText('Spatial Anchoring')).toBeInTheDocument();
    expect(screen.getByText('Smart Contracts')).toBeInTheDocument();
    expect(screen.getByText('Immutable Audit')).toBeInTheDocument();
  });

  it('stacks cards vertically', () => {
    mockUseMobileFeatures.mockReturnValue({
      features: baseFeatures,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<MobileFeatures />);
    const wrapper = container.firstElementChild;

    expect(wrapper?.className).toContain('flex-col');
  });

  it('uses high-contrast text classes against the dark card background', () => {
    mockUseMobileFeatures.mockReturnValue({
      features: baseFeatures,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<MobileFeatures />);

    const title = screen.getByText('Spatial Anchoring');
    const description = screen.getByText('Every shipment is pinned to a live location trail.');

    expect(title.className).toContain('text-white');
    expect(description.className).toContain('text-gray-300');
  });

  it('shows a loading skeleton while data is being fetched', () => {
    mockUseMobileFeatures.mockReturnValue({
      features: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<MobileFeatures />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText('Spatial Anchoring')).not.toBeInTheDocument();
  });

  it('renders an error message when the fetch fails', () => {
    mockUseMobileFeatures.mockReturnValue({
      features: [],
      isLoading: false,
      error: 'Failed to load features',
      refetch: jest.fn(),
    });

    render(<MobileFeatures />);

    expect(screen.getByText('Failed to load features')).toBeInTheDocument();
  });
});
