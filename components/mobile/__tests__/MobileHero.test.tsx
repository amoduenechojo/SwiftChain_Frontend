import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileHero } from '@/components/mobile/MobileHero';
import { useMobileHeroContent } from '@/hooks/useMobileHeroContent';

jest.mock('@/hooks/useMobileHeroContent');
const mockUseMobileHeroContent = useMobileHeroContent as jest.Mock;

const baseContent = {
  networkBadge: 'MAINNET V4.0 ACTIVE',
  headline: 'Deliver Anything. Pay Only When It Arrives.',
  subheadline: 'SwiftChain protects your deliveries using blockchain escrow.',
  primaryCta: { label: 'Secure Your Shipment', href: '/dashboard' },
  secondaryCta: { label: 'See How It Works', href: '#value-props' },
};

describe('MobileHero', () => {
  it('renders the network badge and headline once loaded', () => {
    mockUseMobileHeroContent.mockReturnValue({
      content: baseContent,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<MobileHero />);

    expect(screen.getByText('MAINNET V4.0 ACTIVE')).toBeInTheDocument();
    expect(
      screen.getByText('Deliver Anything. Pay Only When It Arrives.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Secure Your Shipment' }),
    ).toBeInTheDocument();
  });

  it('shows a loading skeleton while data is being fetched', () => {
    mockUseMobileHeroContent.mockReturnValue({
      content: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<MobileHero />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText('MAINNET V4.0 ACTIVE')).not.toBeInTheDocument();
  });

  it('renders an error message when the fetch fails', () => {
    mockUseMobileHeroContent.mockReturnValue({
      content: null,
      isLoading: false,
      error: 'Failed to load hero content',
      refetch: jest.fn(),
    });

    render(<MobileHero />);

    expect(screen.getByText('Failed to load hero content')).toBeInTheDocument();
  });

  it('opens the hamburger menu overlay and closes it via the close button', async () => {
    mockUseMobileHeroContent.mockReturnValue({
      content: baseContent,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const user = userEvent.setup();
    render(<MobileHero />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('dialog', { name: 'Mobile navigation' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
  });

  it('disables body scroll while the menu overlay is open', async () => {
    mockUseMobileHeroContent.mockReturnValue({
      content: baseContent,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const user = userEvent.setup();
    render(<MobileHero />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(document.body.style.overflow).toBe('hidden');

    await user.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(document.body.style.overflow).toBe('');
  });

  it('gives the menu toggle and CTAs at least a 44px touch target', () => {
    mockUseMobileHeroContent.mockReturnValue({
      content: baseContent,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<MobileHero />);

    const menuButton = screen.getByRole('button', { name: 'Open menu' });
    expect(menuButton.className).toContain('h-11');
    expect(menuButton.className).toContain('w-11');

    const primaryCta = screen.getByRole('link', { name: 'Secure Your Shipment' });
    expect(primaryCta.className).toContain('min-h-[44px]');
  });
});
