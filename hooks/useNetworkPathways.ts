import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { networkPathwaysService } from '@/services/networkPathwaysService';
import type { NetworkPathwayCard } from '@/types/networkPathways';

interface UseNetworkPathwaysResult {
  cards: NetworkPathwayCard[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useNetworkPathways — single source for the landing page's Network
 * Pathways split cards (Logistics Enterprises, Independent Carriers).
 *
 * Components consume this hook; they never call networkPathwaysService
 * directly. Aborts in-flight requests on unmount or refetch to avoid
 * setting state on an unmounted component.
 */
export function useNetworkPathways(): UseNetworkPathwaysResult {
  const [cards, setCards] = useState<NetworkPathwayCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    networkPathwaysService
      .getCards(controller.signal)
      .then((data) => {
        if (cancelled) return;
        setCards(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isCancel(err)) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load network pathways';
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
    cards,
    isLoading,
    error,
    refetch,
  };
}
