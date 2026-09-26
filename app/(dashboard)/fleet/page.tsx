'use client';

import { useFleet } from '@/hooks/useFleet';
import { useRequireRole } from '@/hooks/useRequireRole';
import { FleetMap } from '@/components/fleet/FleetMap';
import { DriverList } from '@/components/fleet/DriverList';
import { FleetStats } from '@/components/fleet/FleetStats';
import { FleetPartnerDirectory } from '@/components/fleet/FleetPartnerDirectory';

export default function FleetDashboardPage() {
  const { isAuthorized } = useRequireRole('Fleet Operator');
  const { drivers, summary, isLoading, error, refetch } = useFleet();

  if (!isAuthorized) {
    return (
      <main className="p-6">
        <p className="text-sm text-gray-500" role="status">
          Verifying access…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Fleet Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Live view of drivers in your fleet.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isLoading}
          className="self-start rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      {isLoading && drivers.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-500">
          Loading fleet…
        </div>
      ) : (
        <>
          {summary ? <FleetStats summary={summary} /> : null}
          <FleetMap drivers={drivers} />
          <FleetPartnerDirectory partners={drivers} isLoading={isLoading} />
          <DriverList drivers={drivers} />
        </>
      )}
    </main>
  );
}
