'use client';

import { useKineticExplorer } from '@/hooks/useKineticExplorer';
import type { LedgerTransactionStatus } from '@/types/kineticExplorer';

const STATUS_STYLES: Record<LedgerTransactionStatus, string> = {
  settled: 'bg-emerald-500/15 text-emerald-400',
  pending: 'bg-amber-500/15 text-amber-400',
  escrowed: 'bg-blue-500/15 text-blue-400',
};

function truncateHash(hash: string): string {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

/**
 * KineticExplorer — interactive browser-window mockup showing a live
 * transaction feed and network metrics (TPS, latency) for the Stellar ledger.
 */
export function KineticExplorer() {
  const { transactions, metrics, isLoading, error } = useKineticExplorer();

  return (
    <div
      className="mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-[#0b0f19] shadow-2xl"
      aria-label="Kinetic Ledger Explorer"
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#12172a] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-500" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
        <div className="ml-4 flex-1 truncate rounded-md bg-black/30 px-3 py-1 text-xs text-gray-400">
          swiftchain.network/explorer
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:gap-6 sm:p-6">
        <section
          aria-label="Network metrics"
          className="order-2 grid grid-cols-2 gap-3 sm:order-1 sm:col-span-1 sm:grid-cols-1"
        >
          <MetricCard label="TPS" value={metrics ? metrics.tps.toString() : '—'} isLoading={isLoading} />
          <MetricCard
            label="Latency"
            value={metrics ? `${metrics.latencyMs}ms` : '—'}
            isLoading={isLoading}
          />
          <MetricCard
            label="Ledger #"
            value={metrics ? metrics.ledgerNumber.toLocaleString() : '—'}
            isLoading={isLoading}
          />
          <MetricCard
            label="Validators"
            value={metrics ? metrics.activeValidators.toString() : '—'}
            isLoading={isLoading}
          />
        </section>

        <section
          aria-label="Recent transactions"
          className="order-1 min-w-0 sm:order-2 sm:col-span-2"
        >
          <h3 className="mb-3 text-sm font-semibold text-gray-300">
            Live Transactions
          </h3>

          {error ? (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                    <th className="px-3 py-2 font-medium">Hash</th>
                    <th className="px-3 py-2 font-medium">Amount</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading &&
                    Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index} className="border-b border-white/5 last:border-0">
                        <td className="px-3 py-3" colSpan={3}>
                          <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                        </td>
                      </tr>
                    ))}

                  {!isLoading &&
                    transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-white/5 text-gray-200 last:border-0">
                        <td className="px-3 py-3 font-mono text-xs text-gray-400">
                          {truncateHash(tx.hash)}
                        </td>
                        <td className="px-3 py-3">
                          {tx.amount.toLocaleString()} {tx.asset}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${STATUS_STYLES[tx.status]}`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                  {!isLoading && transactions.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={3}>
                        No transactions to display.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  isLoading: boolean;
}

function MetricCard({ label, value, isLoading }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      {isLoading ? (
        <div className="mt-2 h-6 w-16 animate-pulse rounded bg-white/10" />
      ) : (
        <p className="mt-1 text-xl font-semibold text-white">{value}</p>
      )}
    </div>
  );
}
