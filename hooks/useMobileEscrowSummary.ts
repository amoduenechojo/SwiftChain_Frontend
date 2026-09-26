import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { mobileEscrowService } from '@/services/mobileEscrowService';
import type { MobileEscrowSummary } from '@/types/mobileEscrow';

interface UseMobileEscrowSummaryResult {
  summary: MobileEscrowSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useMobileEscrowSummary — single source for the mobile Trustless Escrow
 * Widget's status and metrics.
 *
 * Components consume this hook; they never call mobileEscrowService
 * directly. Aborts in-flight requests on unmount or refetch to avoid
 * setting state on an unmounted component.
 */
export function useMobileEscrowSummary(): UseMobileEscrowSummaryResult {
  const [summary, setSummary] = useState<MobileEscrowSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    mobileEscrowService
      .getSummary(controller.signal)
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isCancel(err)) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load escrow status';
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
    summary,
    isLoading,
    error,
    refetch,
  };
}
