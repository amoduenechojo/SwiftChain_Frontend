// DEV-ONLY DEMO ROUTE — delete before opening the PR.
// This stands in for the real backend so the settlement diagram renders with data on localhost.
import { NextResponse } from 'next/server';
import type { SettlementDiagramData } from '@/types/settlement';

const fixture: SettlementDiagramData = {
  centralLabel: 'Instant Payouts',
  orbitalElements: [
    { id: 'escrow', label: 'Escrow Release' },
    { id: 'blockchain', label: 'Blockchain Confirmation' },
    { id: 'currency', label: 'Multi-Currency' },
    { id: 'bank', label: 'Bank Settlement' },
  ],
  features: [
    {
      id: 'automated-escrow',
      title: 'Automated Escrow Release',
      description:
        'Funds release automatically once delivery conditions are verified on-chain, with no manual intervention required.',
    },
    {
      id: 'sub-second-confirmation',
      title: 'Sub-Second Confirmation',
      description:
        'Settlement finality is confirmed on the ledger in under three seconds, even across borders.',
    },
    {
      id: 'multi-currency-payouts',
      title: 'Multi-Currency Payouts',
      description:
        'Recipients receive funds in their local currency without manual conversion or added fees.',
    },
  ],
};

export async function GET() {
  return NextResponse.json(fixture);
}
