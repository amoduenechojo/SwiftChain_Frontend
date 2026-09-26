import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { pricingService } from '@/services/pricingService';
import type { PricingComparison } from '@/types/pricing';

interface UsePricingComparisonResult {
  comparison: PricingComparison | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * usePricingComparison — single source for the pricing feature comparison matrix.
 *
 * Components consume this hook; they never call pricingService directly.
 * Aborts in-flight requests on unmount or refetch to avoid setting state
 * on an unmounted component.
 */
export function usePricingComparison(): UsePricingComparisonResult {
  const [comparison, setComparison] = useState<PricingComparison | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    pricingService
      .getComparison(controller.signal)
      .then((data) => {
        if (cancelled) return;
        setComparison(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isCancel(err)) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load pricing comparison';
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

  return { comparison, isLoading, error, refetch };
}
