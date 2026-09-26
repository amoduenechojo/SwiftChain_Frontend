import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { kineticExplorerService } from '@/services/kineticExplorerService';
import type { LedgerTransaction, NetworkMetrics } from '@/types/kineticExplorer';

interface UseKineticExplorerResult {
  transactions: LedgerTransaction[];
  metrics: NetworkMetrics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useKineticExplorer — single source for the Kinetic Ledger Explorer widget
 * (mock transaction feed + live network metrics).
 *
 * Components consume this hook; they never call kineticExplorerService directly.
 * Aborts in-flight requests on unmount or refetch to avoid setting state
 * on an unmounted component.
 */
export function useKineticExplorer(): UseKineticExplorerResult {
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    kineticExplorerService
      .getSnapshot(controller.signal)
      .then((data) => {
        if (cancelled) return;
        setTransactions(data.transactions);
        setMetrics(data.metrics);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isCancel(err)) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load network explorer data';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [reloadTick]);

  const refetch = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setReloadTick((tick) => tick + 1);
  }, []);

  return {
    transactions,
    metrics,
    isLoading,
    error,
    refetch,
  };
}
