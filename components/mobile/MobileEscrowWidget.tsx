'use client';

import { useMobileEscrowSummary } from '@/hooks/useMobileEscrowSummary';
import type { EscrowStatus } from '@/types/mobileEscrow';

const STATUS_STYLES: Record<EscrowStatus, string> = {
  locked: 'bg-blue-500/15 text-blue-400',
  released: 'bg-emerald-500/15 text-emerald-400',
  disputed: 'bg-amber-500/15 text-amber-400',
};

function formatAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString('en-US')} ${currency}`;
}

/**
 * MobileEscrowWidget — compact mobile version of the Trustless Escrow
 * Widget. Shows the escrow's current status and locked amount, with a
 * vertical stack of supporting metrics underneath so it reads cleanly on
 * narrow viewports without horizontal scrolling.
 */
export function MobileEscrowWidget() {
  const { summary, isLoading, error } = useMobileEscrowSummary();

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto w-full max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
      >
        {error}
      </div>
    );
  }

  if (isLoading || !summary) {
    return (
      <div
        className="mx-auto w-full max-w-sm animate-pulse space-y-3 rounded-xl border border-white/10 bg-white/5 p-4"
        aria-label="Loading escrow status"
      >
        <div className="h-6 w-32 rounded-full bg-white/10" />
        <div className="h-8 w-40 rounded bg-white/10" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-12 rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-[#0b0f19] p-4"
      aria-label="Escrow status"
    >
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold tracking-wide ${STATUS_STYLES[summary.status]}`}
      >
        {summary.statusLabel}
      </span>

      <p className="mt-3 break-words text-2xl font-bold text-white sm:text-3xl">
        {formatAmount(summary.amount, summary.currency)}
      </p>

      {/* Metric blocks stacked below the main widget */}
      <div className="mt-4 space-y-2">
        {summary.metrics.map((metric) => (
          <div
            key={metric.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5"
          >
            <span className="text-sm text-gray-400">{metric.label}</span>
            <span className="text-sm font-medium text-gray-100">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MobileEscrowWidget;
