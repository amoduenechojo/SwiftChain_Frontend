import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { testimonialService } from '@/services/testimonialService';
import type { Testimonial } from '@/types/testimonial';

interface UseTestimonialResult {
  testimonial: Testimonial | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useTestimonial — single source for the featured industry testimonial.
 *
 * Components consume this hook; they never call testimonialService directly.
 * Aborts in-flight requests on unmount or refetch to avoid setting state
 * on an unmounted component.
 */
export function useTestimonial(): UseTestimonialResult {
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    testimonialService
      .getFeaturedTestimonial(controller.signal)
      .then((data) => {
        if (cancelled) return;
        setTestimonial(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isCancel(err)) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load testimonial';
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

  return { testimonial, isLoading, error, refetch };
}
