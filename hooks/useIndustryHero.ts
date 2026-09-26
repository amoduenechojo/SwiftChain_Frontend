import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { industryService } from '@/services/industryService';
import type {
  IndustryHeroContent,
  IndustrySplitFeature,
} from '@/types/industry';

export interface UseIndustryHeroResult {
  hero: IndustryHeroContent | null;
  features: IndustrySplitFeature[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useIndustryHero — single source for Industry Solutions page content.
 *
 * Components consume this hook; they never call industryService directly.
 * In-flight requests are aborted on unmount or refetch so state is never
 * written after the component has gone away.
 */
export function useIndustryHero(): UseIndustryHeroResult {
  const [hero, setHero] = useState<IndustryHeroContent | null>(null);
  const [features, setFeatures] = useState<IndustrySplitFeature[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    industryService
      .getIndustryHero(controller.signal)
      .then((data) => {
        if (cancelled) return;
        setHero(data.hero);
        setFeatures(data.features);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled || axios.isCancel(err)) return;
        setError(
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load industry solutions content',
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [reloadTick]);

  const refetch = useCallback((): void => {
    setIsLoading(true);
    setError(null);
    setReloadTick((tick) => tick + 1);
  }, []);

  return { hero, features, isLoading, error, refetch };
}
