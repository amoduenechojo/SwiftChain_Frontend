// DEV-ONLY DEMO ROUTE — delete before opening the PR.
// This stands in for the real backend so the pricing comparison table renders with data on localhost.
import { NextResponse } from 'next/server';
import type { PricingComparison } from '@/types/pricing';

const fixture: PricingComparison = {
  plans: [
    { id: 'starter', name: 'Starter' },
    { id: 'business', name: 'Business' },
    { id: 'enterprise', name: 'Enterprise' },
  ],
  rows: [
    {
      id: 'blockchain-confirmation',
      label: 'Blockchain Confirmation',
      values: { starter: '~30s', business: '~10s', enterprise: '<3s' },
    },
    {
      id: 'escrow-multisig',
      label: 'Escrow Multi-Sig',
      values: { starter: false, business: true, enterprise: true },
    },
    {
      id: 'multi-currency-settlement',
      label: 'Multi-Currency Settlement',
      values: { starter: false, business: true, enterprise: true },
    },
    {
      id: 'dispute-resolution',
      label: 'Dispute Resolution',
      values: { starter: 'Standard', business: 'Priority', enterprise: 'Dedicated' },
    },
    {
      id: 'api-access',
      label: 'API Access',
      values: { starter: false, business: true, enterprise: true },
    },
    {
      id: 'dedicated-account-manager',
      label: 'Dedicated Account Manager',
      values: { starter: false, business: false, enterprise: true },
    },
    {
      id: 'uptime-sla',
      label: 'Uptime SLA',
      values: { starter: '99.5%', business: '99.9%', enterprise: '99.99%' },
    },
  ],
};

export async function GET() {
  return NextResponse.json(fixture);
}
