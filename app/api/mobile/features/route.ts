// Local content endpoint for the mobile Kinetic Features Stack.
// Serves the exact `MobileFeatureCard[]` contract the platform backend will
// expose, so the client layers (service -> hook -> component) talk to a
// real HTTP endpoint. Point NEXT_PUBLIC_API_URL at the backend to override it.
import { NextResponse } from 'next/server';
import type { MobileFeatureCard } from '@/types/mobileFeatures';

const payload: MobileFeatureCard[] = [
  {
    id: 'spatial-anchoring',
    icon: '📍',
    title: 'Spatial Anchoring',
    description:
      'Every shipment is pinned to a live location trail, so pickup, transit and delivery are all verifiable against real coordinates.',
  },
  {
    id: 'smart-contracts',
    icon: '📜',
    title: 'Smart Contracts',
    description:
      'Escrow terms are enforced by code, not a promise — funds release automatically the moment delivery conditions are met.',
  },
  {
    id: 'immutable-audit',
    icon: '🔒',
    title: 'Immutable Audit',
    description:
      'Every status change and payout is written to the ledger permanently, giving disputes a record no one can quietly edit.',
  },
];

export async function GET() {
  return NextResponse.json(payload);
}
