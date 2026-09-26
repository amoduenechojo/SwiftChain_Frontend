'use client';

import {
  Users,
  Package,
  DollarSign,
  Truck,
  ShieldCheck,
  Lock,
  RefreshCw,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import type { AdminStats } from '@/services/adminService';

/**
 * Presentation config for each statistic card. `key` maps to a field on the
 * AdminStats payload returned by the backend — no mock values are defined here,
 * only labels and icons. Ordering here drives the on-screen order.
 */
const STAT_CARDS: ReadonlyArray<{
  key: keyof AdminStats;
  label: string;
  icon: LucideIcon;
}> = [
  { key: 'totalUsers', label: 'Total Users', icon: Users },
  { key: 'activeDeliveries', label: 'Active Deliveries', icon: Package },
  { key: 'totalRevenue', label: 'Total Revenue (XLM)', icon: DollarSign },
  { key: 'activeDrivers', label: 'Active Drivers', icon: Truck },
  { key: 'pendingKyc', label: 'Pending KYC', icon: ShieldCheck },
  { key: 'escrowLocked', label: 'Escrow Locked (XLM)', icon: Lock },
];

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  isLoading: boolean;
}

/**
 * StatCard — renders a single statistic. The loading skeleton and the final
 * value are rendered through this SAME element, so their box dimensions are
 * guaranteed identical and the grid cannot reflow when data lands.
 *
 * CLS is prevented at two levels:
 *   1. The card reserves a fixed height (`min-h-[8.5rem]`).
 *   2. The value slot reserves the exact skeleton dimensions
 *      (`min-h-8 min-w-24`, matching the `h-8 w-24` skeleton bar).
 */
function StatCard({ label, value, icon: Icon, isLoading }: StatCardProps) {
  return (
    <div className="flex min-h-[8.5rem] flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Value slot — hardcoded min dimensions matching the skeleton bar so the
          number and the loader occupy the exact same box (zero shift on swap). */}
      <div className="flex min-h-8 min-w-24 items-center">
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
        ) : (
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {value.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Statistics — dashboard statistics section.
 *
 * Layered Architecture:
 *   Statistics (Component) → useAdminDashboard (Hook) → adminService (Service)
 *
 * The skeleton loaders share their wrapper with the loaded cards and reserve
 * fixed min-height/min-width, so the section registers a Lighthouse CLS of 0.00
 * when API data replaces the loaders.
 */
export function Statistics() {
  const { stats, isLoading, isError, refetch } = useAdminDashboard();

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Statistics</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Platform-wide metrics and activity summary
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {isError && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load statistics. Please refresh or try again later.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_CARDS.map(({ key, label, icon }) => (
          <StatCard
            key={key}
            label={label}
            value={stats?.[key] ?? 0}
            icon={icon}
            isLoading={isLoading}
          />
        ))}
      </div>
    </section>
  );
}
