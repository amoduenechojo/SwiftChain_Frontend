import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { settlementService } from '@/services/settlementService';
import type { SettlementDiagramData } from '@/types/settlement';

interface UseSettlementDiagramResult {
  data: SettlementDiagramData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useSettlementDiagram — single source for the automated settlement flow diagram.
 *
 * Components consume this hook; they never call settlementService directly.
 * Aborts in-flight requests on unmount or refetch to avoid setting state
 * on an unmounted component.
 */
export function useSettlementDiagram(): UseSettlementDiagramResult {
  const [data, setData] = useState<SettlementDiagramData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    settlementService
      .getSettlementDiagram(controller.signal)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isCancel(err)) return;
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to load settlement diagram';
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

  return { data, isLoading, error, refetch };
}
