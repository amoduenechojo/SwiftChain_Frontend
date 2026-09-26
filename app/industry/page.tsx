export const dynamic = 'force-dynamic';

import { IndustryHero } from '@/components/industry/IndustryHero';

export const metadata = {
  title: 'Industry Solutions | SwiftChain',
  description:
    'Enterprise logistics solutions built on SwiftChain: escrow-backed settlement, live fleet telemetry, and an auditable supply chain.',
};

export default function IndustryPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_40%),linear-gradient(135deg,_#020617_0%,_#0f172a_70%,_#111827_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <IndustryHero />
      </div>
    </main>
  );
}
