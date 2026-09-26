import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { pricingService } from '@/services/pricingService';
import type { PricingCardsResponse } from '@/types/pricing';

interface UsePricingCardsResult {
  cards: PricingCardsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * usePricingCards — single source for the 3-tier pricing card data.
 *
 * Components consume this hook; they never call pricingService directly.
 * Aborts in-flight requests on unmount or refetch to avoid setting
 * state on an unmounted component.
 */
export function usePricingCards(): UsePricingCardsResult {
  const [cards, setCards] = useState<PricingCardsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    pricingService
      .getPricingCards(controller.signal)
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
            : 'Failed to load pricing cards';
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

  return { cards, isLoading, error, refetch };
}