// Local content endpoint for the landing page's Network Pathways cards.
// Serves the exact `NetworkPathwayCard[]` contract the platform backend will
// expose, so the client layers (service -> hook -> component) talk to a
// real HTTP endpoint. Point NEXT_PUBLIC_API_URL at the backend to override it.
import { NextResponse } from 'next/server';
import type { NetworkPathwayCard } from '@/types/networkPathways';

const payload: NetworkPathwayCard[] = [
  {
    id: 'logistics-enterprises',
    icon: 'enterprise',
    title: 'Logistics Enterprises',
    description:
      'Run your entire fleet through one escrow-backed command center — dispatch, exceptions and settlement in a single operational view.',
    cta: { label: 'Talk to our team', href: '/contact' },
  },
  {
    id: 'independent-carriers',
    icon: 'carrier',
    title: 'Independent Carriers',
    description:
      'Pick up jobs, get paid the moment delivery is confirmed, and build an on-chain reputation that travels with you across the network.',
    cta: { label: 'Join as a carrier', href: '/dashboard' },
  },
];

export async function GET() {
  return NextResponse.json(payload);
}
