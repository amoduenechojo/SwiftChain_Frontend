// Local content endpoint for the Industry Solutions page.
// It serves the exact `IndustryHeroResponse` contract the platform backend will
// expose, so the client layers (service -> hook -> component) talk to a real
// HTTP endpoint. Point NEXT_PUBLIC_API_URL at the backend to override it.
import { NextResponse } from 'next/server';
import type { IndustryHeroResponse } from '@/types/industry';

const payload: IndustryHeroResponse = {
  hero: {
    eyebrow: 'Industry Solutions',
    title: 'Modernizing the Global Supply Chain',
    description:
      'SwiftChain replaces paperwork, blind hand-offs and delayed settlement with escrow-backed contracts and live telemetry — so every shipment, partner and payout is verifiable end to end.',
    primaryCta: { label: 'Talk to our team', href: '/contact' },
    secondaryCta: { label: 'Explore the platform', href: '/dashboard' },
    stats: [
      { id: 'stat-corridors', label: 'Active trade corridors', value: '120+' },
      { id: 'stat-settlement', label: 'Average escrow settlement', value: '4.2s' },
      { id: 'stat-visibility', label: 'Shipment visibility', value: '99.98%' },
    ],
  },
  features: [
    {
      id: 'enterprise-logistics',
      eyebrow: 'Enterprise Logistics',
      title: 'One command center for every shipment you move',
      description:
        'Dispatch, exceptions, proof of delivery and escrow release in a single operational view. Your teams stop reconciling spreadsheets and start acting on what is happening on the road right now.',
      imagePosition: 'right',
      image: {
        src: '/images/industry/enterprise-command-center.png',
        alt: 'SwiftChain enterprise command center showing live delivery routes, fleet performance metrics and an escrow settlement ledger.',
        width: 1280,
        height: 960,
      },
      highlights: [
        {
          id: 'highlight-visibility',
          title: 'Live network visibility',
          description:
            'Track every driver, lane and hand-off on one map with telemetry streamed straight from the field.',
        },
        {
          id: 'highlight-escrow',
          title: 'Escrow-backed settlement',
          description:
            'Funds lock at pickup and release the moment proof of delivery is confirmed on chain — no invoice chasing.',
        },
        {
          id: 'highlight-audit',
          title: 'Audit-ready by default',
          description:
            'Every status change, signature and payout is immutably recorded and exportable for compliance reviews.',
        },
      ],
      cta: { label: 'See how enterprise teams deploy SwiftChain', href: '/contact' },
    },
  ],
};

export async function GET() {
  return NextResponse.json(payload);
}
