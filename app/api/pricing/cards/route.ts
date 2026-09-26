import { NextResponse } from 'next/server';
import type { PricingCardsResponse } from '@/types/pricing';

const fixture: PricingCardsResponse = {
  cards: [
    {
      id: 'starter',
      name: 'Starter',
      price: '0',
      period: 'month',
      description: 'Perfect for getting started with SwiftChain escrow.',
      features: [
        'Up to 5 deliveries per month',
        'Standard blockchain confirmation',
        'Email support',
        'Basic escrow protection',
      ],
      ctaLabel: 'Get Started',
      highlighted: false,
      href: '/signup?plan=starter',
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '49',
      period: 'month',
      description: 'Ideal for growing logistics operations.',
      features: [
        'Up to 50 deliveries per month',
        'Priority blockchain confirmation',
        'Priority email & chat support',
        'Advanced escrow with dispute resolution',
        'API access',
        'Multi-currency settlement',
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
      description: 'For large-scale logistics operations.',
      features: [
        'Unlimited deliveries',
        'Instant blockchain confirmation',
        'Dedicated account manager',
        'Custom escrow terms',
        'Full API & webhook access',
        'Multi-currency settlement',
        'SLA guarantee (99.99% uptime)',
        'White-glove onboarding',
      ],
      ctaLabel: 'Contact Sales',
      highlighted: false,
      href: '/contact',
    },
  ],
};

export async function GET() {
  return NextResponse.json(fixture);
}