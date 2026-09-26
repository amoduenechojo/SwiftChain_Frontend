import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { valuePropsService } from '@/services/valuePropsService';
import type { ValuePropItem } from '@/types/valueProp';

interface UseValuePropsResult {
  items: ValuePropItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useValueProps — single source for the landing page's value proposition
 * cards (Trustless Escrow, Instant Settlement, Zero-Fee Layer, etc).
 *
 * Components consume this hook; they never call valuePropsService directly.
 * Aborts in-flight requests on unmount or refetch to avoid setting state
 * on an unmounted component.
 */
export function useValueProps(): UseValuePropsResult {
  const [items, setItems] = useState<ValuePropItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    valuePropsService
      .getValueProps(controller.signal)
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isCancel(err)) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load value propositions';
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
    items,
    isLoading,
    error,
    refetch,
  };
}
