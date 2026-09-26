/**
 * useContractMockup — Hook layer for the product page's IDE contract mockup.
 *
 * Architecture: Component → useContractMockup (Hook) → contractMockupService → Backend
 */

'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contractMockupService } from '@/services/contractMockupService';
import type { ContractSnippet } from '@/types/contractMockup';

export interface UseContractMockupResult {
  snippet: ContractSnippet | null;
  isLoading: boolean;
  isError: boolean;
  isCopied: boolean;
  refetch: () => void;
  copyCode: () => Promise<void>;
}

export function useContractMockup(): UseContractMockupResult {
  const [isCopied, setIsCopied] = useState(false);

  const query = useQuery({
    queryKey: ['contract-mockup'],
    queryFn: ({ signal }) => contractMockupService.getContractSnippet(signal),
    staleTime: Infinity,
    retry: false,
  });

  const snippet = query.data ?? null;

  const copyCode = useCallback(async (): Promise<void> => {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [snippet]);

  return {
    snippet,
    isLoading: query.isLoading,
    isError: query.isError,
    isCopied,
    refetch: () => void query.refetch(),
    copyCode,
  };
}
