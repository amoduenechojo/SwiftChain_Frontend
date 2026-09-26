import { render, screen, fireEvent } from '@testing-library/react';
import { PricingCards } from '../PricingCards';
import { usePricingCards } from '@/hooks/usePricingCards';
import { pricingService } from '@/services/pricingService';
import type { PricingCardsResponse } from '@/types/pricing';

jest.mock('@/hooks/usePricingCards');
const mockedUsePricingCards = usePricingCards as jest.Mock;

jest.mock('@/services/pricingService', () => ({
  pricingService: {
    getPricingCards: jest.fn(),
  },
}));

const mockCards: PricingCardsResponse = {
  cards: [
    {
      id: 'starter',
      name: 'Starter',
      price: '0',
      period: 'month',
      description: 'Perfect for getting started.',
      features: ['Up to 5 deliveries', 'Standard confirmation', 'Email support'],
      ctaLabel: 'Get Started',
      highlighted: false,
      href: '/signup?plan=starter',
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '49',
      period: 'month',
      description: 'Ideal for growing operations.',
      features: [
        'Up to 50 deliveries',
        'Priority confirmation',
        'Priority support',
        'API access',
      ],
      ctaLabel: 'Start Free Trial',
      highlighted: true,
      href: '/signup?plan=growth',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '199',
      period: 'month',
      description: 'For large-scale operations.',
      features: [
        'Unlimited deliveries',
        'Instant confirmation',
        'Dedicated account manager',
        'SLA guarantee',
      ],
      ctaLabel: 'Contact Sales',
      highlighted: false,
      href: '/contact',
    },
  ],
};

describe('PricingCards', () => {
  beforeEach(() => {
    mockedUsePricingCards.mockClear();
  });

  it('renders loading state', () => {
    mockedUsePricingCards.mockReturnValue({
      cards: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<PricingCards />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders error state and retries on click', () => {
    const mockRefetch = jest.fn();
    mockedUsePricingCards.mockReturnValue({
      cards: null,
      isLoading: false,
      error: 'Failed to load pricing cards',
      refetch: mockRefetch,
    });

    render(<PricingCards />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to load pricing cards',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders all three pricing cards', () => {
    mockedUsePricingCards.mockReturnValue({
      cards: mockCards,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<PricingCards />);
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('renders the MOST POPULAR badge for the Growth card', () => {
    mockedUsePricingCards.mockReturnValue({
      cards: mockCards,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<PricingCards />);
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('renders pricing information correctly', () => {
    mockedUsePricingCards.mockReturnValue({
      cards: mockCards,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<PricingCards />);
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$49')).toBeInTheDocument();
    expect(screen.getByText('$199')).toBeInTheDocument();
  });

  it('renders features for each card', () => {
    mockedUsePricingCards.mockReturnValue({
      cards: mockCards,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<PricingCards />);
    expect(screen.getByText('Up to 5 deliveries')).toBeInTheDocument();
    expect(screen.getByText('Up to 50 deliveries')).toBeInTheDocument();
    expect(screen.getByText('Unlimited deliveries')).toBeInTheDocument();
  });

  it('renders CTA buttons with correct labels', () => {
    mockedUsePricingCards.mockReturnValue({
      cards: mockCards,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<PricingCards />);
    expect(screen.getByRole('link', { name: 'Get Started' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Start Free Trial' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact Sales' })).toBeInTheDocument();
  });

  it('applies highlighted styling to the Growth card', () => {
    mockedUsePricingCards.mockReturnValue({
      cards: mockCards,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<PricingCards />);
    const growthCard = screen.getByText('Growth').closest('div[class*="rounded-2xl"]');
    expect(growthCard).toHaveClass('z-10');
  });

  it('verifies backend API service returns PricingCardsResponse shape', async () => {
    (pricingService.getPricingCards as jest.Mock).mockResolvedValue(mockCards);

    const result = await pricingService.getPricingCards();
    expect(result.cards).toHaveLength(3);
    expect(result.cards[1].name).toBe('Growth');
    expect(result.cards[1].highlighted).toBe(true);
  });
});