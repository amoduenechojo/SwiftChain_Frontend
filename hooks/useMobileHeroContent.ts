import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { mobileHeroService } from '@/services/mobileHeroService';
import type { MobileHeroContent } from '@/types/mobileHero';

interface UseMobileHeroContentResult {
  content: MobileHeroContent | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useMobileHeroContent — single source for the mobile hero's network
 * badge, headline and CTAs.
 *
 * Components consume this hook; they never call mobileHeroService
 * directly. Aborts in-flight requests on unmount or refetch to avoid
 * setting state on an unmounted component.
 */
export function useMobileHeroContent(): UseMobileHeroContentResult {
  const [content, setContent] = useState<MobileHeroContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    mobileHeroService
      .getContent(controller.signal)
      .then((data) => {
        if (cancelled) return;
        setContent(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isCancel(err)) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load hero content';
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
    content,
    isLoading,
    error,
    refetch,
  };
}
