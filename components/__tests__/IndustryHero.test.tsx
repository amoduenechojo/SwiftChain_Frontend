import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IndustryHero } from '@/components/industry/IndustryHero';
import { useIndustryHero } from '@/hooks/useIndustryHero';
import type { UseIndustryHeroResult } from '@/hooks/useIndustryHero';
import type { IndustrySplitFeature } from '@/types/industry';

jest.mock('@/hooks/useIndustryHero', () => ({
  useIndustryHero: jest.fn(),
}));

const mockUseIndustryHero = useIndustryHero as jest.MockedFunction<
  typeof useIndustryHero
>;

const feature: IndustrySplitFeature = {
  id: 'enterprise-logistics',
  eyebrow: 'Enterprise Logistics',
  title: 'One command center for every shipment you move',
  description: 'Dispatch, exceptions and escrow release in a single view.',
  imagePosition: 'right',
  image: {
    src: '/images/industry/enterprise-command-center.png',
    alt: 'SwiftChain enterprise command center',
    width: 1280,
    height: 960,
  },
  highlights: [
    {
      id: 'highlight-1',
      title: 'Live network visibility',
      description: 'Track every driver and lane on one map.',
    },
  ],
  cta: { label: 'See how it works', href: '/contact' },
};

const loadedState: UseIndustryHeroResult = {
  hero: {
    eyebrow: 'Industry Solutions',
    title: 'Modernizing the Global Supply Chain',
    description: 'Escrow-backed logistics for enterprise networks.',
    primaryCta: { label: 'Talk to our team', href: '/contact' },
    secondaryCta: null,
    stats: [{ id: 'stat-1', label: 'Active trade corridors', value: '120+' }],
  },
  features: [feature],
  isLoading: false,
  error: null,
  refetch: jest.fn(),
};

function mockState(overrides: Partial<UseIndustryHeroResult> = {}) {
  mockUseIndustryHero.mockReturnValue({ ...loadedState, ...overrides });
}

describe('IndustryHero', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the supply chain header and stats from the API', () => {
    mockState();
    render(<IndustryHero />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Modernizing the Global Supply Chain',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Active trade corridors')).toBeInTheDocument();
    expect(screen.getByText('120+')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Talk to our team' }),
    ).toHaveAttribute('href', '/contact');
  });

  it('renders the Enterprise Logistics split block with a next/image asset', () => {
    mockState();
    render(<IndustryHero />);

    expect(screen.getByText('Enterprise Logistics')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'One command center for every shipment you move',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Live network visibility')).toBeInTheDocument();

    const image = screen.getByAltText('SwiftChain enterprise command center');
    // next/image emits an <img> with an optimizer srcset and intrinsic
    // dimensions, which is what prevents the layout shift.
    expect(image).toHaveAttribute('width', '1280');
    expect(image).toHaveAttribute('height', '960');
    expect(image.getAttribute('srcset')).toContain(
      encodeURIComponent('/images/industry/enterprise-command-center.png'),
    );
  });

  it('shows the loading skeleton while content is fetched', () => {
    mockState({ isLoading: true, hero: null, features: [] });
    render(<IndustryHero />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('shows an error state and retries through the hook', async () => {
    const refetch = jest.fn();
    mockState({
      error: 'Service unavailable',
      hero: null,
      features: [],
      refetch,
    });
    render(<IndustryHero />);

    expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable');

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state when nothing is published', () => {
    mockState({ hero: null, features: [] });
    render(<IndustryHero />);

    expect(
      screen.getByText('No industry solutions content is published yet.'),
    ).toBeInTheDocument();
  });
});
