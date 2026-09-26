// Local content endpoint for the mobile hero section.
// Serves the exact `MobileHeroContent` contract the platform backend will
// expose, so the client layers (service -> hook -> component) talk to a
// real HTTP endpoint. Point NEXT_PUBLIC_API_URL at the backend to override it.
import { NextResponse } from 'next/server';
import type { MobileHeroContent } from '@/types/mobileHero';

const payload: MobileHeroContent = {
  networkBadge: 'MAINNET V4.0 ACTIVE',
  headline: 'Deliver Anything. Pay Only When It Arrives.',
  subheadline:
    'SwiftChain protects your deliveries using blockchain escrow — funds stay locked until delivery is confirmed.',
  primaryCta: { label: 'Secure Your Shipment', href: '/dashboard' },
  secondaryCta: { label: 'See How It Works', href: '#value-props' },
};

export async function GET() {
  return NextResponse.json(payload);
}
