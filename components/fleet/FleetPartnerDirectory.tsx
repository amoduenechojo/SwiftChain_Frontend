'use client';

import { ShieldCheckIcon, StarIcon } from '@heroicons/react/24/solid';
import type { Driver } from '@/types/fleet';

export interface FleetPartnerDirectoryProps {
  partners: Driver[];
  isLoading?: boolean;
}

function TrustBadge({ score, loading }: { score: number | null; loading?: boolean }) {
  if (loading) {
    return <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />;
  }

  if (!score || score <= 0) {
    return (
      <span className="text-xs text-gray-400">No on-chain score</span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
      title="Verified On-Chain Trust Score"
    >
      <ShieldCheckIcon className="h-3.5 w-3.5 text-blue-500" />
      {score.toLocaleString()}
    </span>
  );
}

function PartnerCard({ partner }: { partner: Driver }) {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
      data-testid="partner-card"
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {partner.name}
          </h3>
          <p className="text-xs text-gray-500">
            {partner.vehicleType} · {partner.vehiclePlate}
          </p>
        </div>
        <TrustBadge score={partner.trustScore ?? null} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <StarIcon className="h-3.5 w-3.5 text-amber-500" />
          {partner.rating.toFixed(1)}
        </span>
        <span>
          {partner.activeDeliveries} active · {partner.completedDeliveries} done
        </span>
      </div>

      <div className="mt-2">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            partner.status === 'active'
              ? 'bg-emerald-100 text-emerald-700'
              : partner.status === 'on_delivery'
                ? 'bg-blue-100 text-blue-700'
                : partner.status === 'idle'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-200 text-gray-500'
          }`}
        >
          {partner.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}

function PartnerCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
      </div>
      <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-100" />
    </div>
  );
}

export function FleetPartnerDirectory({
  partners,
  isLoading = false,
}: FleetPartnerDirectoryProps) {
  if (isLoading) {
    return (
      <section aria-label="Fleet partner directory" className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PartnerCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return (
      <section
        aria-label="Fleet partner directory"
        className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500"
      >
        No partners found in your fleet network.
      </section>
    );
  }

  return (
    <section aria-label="Fleet partner directory" className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-gray-900">
          Fleet & Partner Network
        </h2>
        <p className="text-sm text-gray-500">
          {partners.length} partner{partners.length !== 1 ? 's' : ''} in your
          network
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>
    </section>
  );
}
