// Local content endpoint for the mobile Trustless Escrow Widget.
// Serves the exact `MobileEscrowSummary` contract the platform backend will
// expose, so the client layers (service -> hook -> component) talk to a
// real HTTP endpoint. Point NEXT_PUBLIC_API_URL at the backend to override it.
import { NextResponse } from 'next/server';
import type { MobileEscrowSummary } from '@/types/mobileEscrow';

const payload: MobileEscrowSummary = {
  status: 'locked',
  statusLabel: 'ESCROW LOCKED',
  amount: 42500,
  currency: 'USDC',
  metrics: [
    { id: 'metric-signatures', label: 'Signatures', value: '2 / 3' },
    { id: 'metric-network', label: 'Network', value: 'Stellar Mainnet' },
    { id: 'metric-eta', label: 'Release ETA', value: '~4s after confirmation' },
  ],
};

export async function GET() {
  return NextResponse.json(payload);
}
