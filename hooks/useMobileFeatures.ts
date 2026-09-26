import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { mobileFeaturesService } from '@/services/mobileFeaturesService';
import type { MobileFeatureCard } from '@/types/mobileFeatures';

interface UseMobileFeaturesResult {
  features: MobileFeatureCard[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useMobileFeatures — single source for the mobile Kinetic Features Stack
 * (Spatial Anchoring, Smart Contracts, Immutable Audit).
 *
 * Components consume this hook; they never call mobileFeaturesService
 * directly. Aborts in-flight requests on unmount or refetch to avoid
 * setting state on an unmounted component.
 */
export function useMobileFeatures(): UseMobileFeaturesResult {
  const [features, setFeatures] = useState<MobileFeatureCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    mobileFeaturesService
      .getFeatures(controller.signal)
      .then((data) => {
        if (cancelled) return;
        setFeatures(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isCancel(err)) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load features';
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
    features,
    isLoading,
    error,
    refetch,
  };
}
