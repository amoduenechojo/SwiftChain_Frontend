'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { reputationService } from '@/services/reputationService';

export interface UseDriverReputationResult {
  onChainScore: number | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * useDriverReputation — fetches a driver's on-chain reputation token score.
 *
 * Components consume this hook; they never call reputationService directly.
 * Aborts in-flight requests on unmount or driverId change to avoid setting
 * state on an unmounted component.
 */
export function useDriverReputation(driverId: string): UseDriverReputationResult {
  // Store the settled result together with the driverId it belongs to, so
  // loading is derived from a stale/absent result rather than written back
  // into state from the effect.
  const [result, setResult] = useState<{
    driverId: string;
    onChainScore: number | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!driverId) return;

    const controller = new AbortController();
    let cancelled = false;

    reputationService
      .getDriverReputation(driverId, controller.signal)
      .then((data) => {
        if (cancelled) return;
        setResult({ driverId, onChainScore: data.onChainScore, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isCancel(err)) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load on-chain reputation';
        setResult({ driverId, onChainScore: null, error: message });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [driverId]);

  // With no driverId there is nothing to fetch.
  if (!driverId) {
    return { onChainScore: null, isLoading: false, error: null };
  }

  // No result yet for this driverId means the request is still in flight.
  if (!result || result.driverId !== driverId) {
    return { onChainScore: null, isLoading: true, error: null };
  }

  return {
    onChainScore: result.onChainScore,
    isLoading: false,
    error: result.error,
  };
}
