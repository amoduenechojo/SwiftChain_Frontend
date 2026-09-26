import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { trustBarService } from '@/services/trustBarService';
import type { TrustBarResponse } from '@/types/trustBar';

interface UseTrustBarResult {
  data: TrustBarResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useTrustBar — custom hook for securing network trust bar data & stats.
 * Components consume this hook; they never call trustBarService directly.
 */
export function useTrustBar(): UseTrustBarResult {
  const [data, setData] = useState<TrustBarResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    trustBarService
      .getTrustBarData(controller.signal)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isCancel(err)) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load trust bar data';
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
    data,
    isLoading,
    error,
    refetch,
  };
}
