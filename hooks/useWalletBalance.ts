import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { walletService, WalletBalance, BalanceCheckResult } from '../services/walletService';

interface UseWalletBalanceOptions {
  requiredAmount?: number;
  autoFetch?: boolean;
  fetchOnMount?: boolean;
}

interface UseWalletBalanceReturn {
  balance: WalletBalance | null;
  isLoading: boolean;
  error: Error | null;
  hasSufficientBalance: boolean;
  checkBalance: (amount: number) => Promise<BalanceCheckResult>;
  refetch: () => Promise<void>;
  optimisticBalance: WalletBalance | null;
}

export function useWalletBalance(options: UseWalletBalanceOptions = {}): UseWalletBalanceReturn {
  const {
    requiredAmount = 0,
    autoFetch = false,
    fetchOnMount = true,
  } = options;

  const [balance, setBalance] = useState<WalletBalance | null>(() => {
    // Initialize with cached balance for immediate display
    return walletService.getCachedBalance();
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [optimisticBalance, setOptimisticBalance] = useState<WalletBalance | null>(balance);
  
  const mountRef = useRef<boolean>(true);
  const fetchInProgressRef = useRef<boolean>(false);

  // Check if balance is sufficient based on current balance and required amount
  const checkSufficiency = useCallback((currentBalance: WalletBalance | null, amount: number): boolean => {
    if (!currentBalance) return true; // Assume sufficient if not loaded
    return currentBalance.available >= amount;
  }, []);

  // Fetch balance from API
  const fetchBalance = useCallback(async (forceRefresh = false): Promise<void> => {
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) return;

    try {
      fetchInProgressRef.current = true;
      setIsLoading(true);
      setError(null);

      // Use service to fetch balance
      const fetchedBalance = await walletService.fetchBalance(forceRefresh);

      if (!mountRef.current) return;

      setBalance(fetchedBalance);
      setOptimisticBalance(fetchedBalance);

    } catch (err) {
      if (!mountRef.current) return;

      const error = err instanceof Error ? err : new Error('Failed to fetch balance');
      setError(error);

      // Use cached balance as fallback
      const cached = walletService.getCachedBalance();
      if (cached) {
        setBalance(cached);
        setOptimisticBalance(cached);
      }
    } finally {
      if (mountRef.current) {
        setIsLoading(false);
      }
      fetchInProgressRef.current = false;
    }
  }, []);

  // Check balance for a specific amount
  const checkBalance = useCallback(async (amount: number): Promise<BalanceCheckResult> => {
    try {
      // First, use optimistic balance if available
      if (optimisticBalance) {
        const hasSufficient = optimisticBalance.available >= amount;
        if (hasSufficient) {
          // Return optimistic result immediately
          return {
            hasSufficientBalance: true,
            balance: optimisticBalance,
            requiredAmount: amount,
          };
        }
      }

      // If optimistic check fails or no cached balance, fetch fresh
      const result = await walletService.checkSufficientBalance(amount);
      
      if (mountRef.current) {
        setBalance(result.balance);
        setOptimisticBalance(result.balance);
      }
      
      return result;
    } catch (error) {
      console.error('Balance check failed:', error);
      // Return optimistic result if available, otherwise assume insufficient
      const currentBalance = optimisticBalance || balance;
      return {
        hasSufficientBalance: currentBalance ? currentBalance.available >= amount : false,
        balance: currentBalance || { available: 0, locked: 0, pending: 0, total: 0, currency: 'USD' },
        requiredAmount: amount,
      };
    }
  }, [optimisticBalance, balance]);

  // Pre-fetch balance on mount if enabled
  useEffect(() => {
    mountRef.current = true;

    // Pre-fetch balance in background if enabled
    if (fetchOnMount) {
      // Start fetching immediately without waiting
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchBalance();
      
      // Also prefetch for future use
      walletService.prefetchBalance();
    }

    return () => {
      mountRef.current = false;
    };
  }, [fetchOnMount, fetchBalance]);

  // Auto-fetch when required amount changes significantly
  useEffect(() => {
    if (autoFetch && requiredAmount > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchBalance();
    }
  }, [requiredAmount, autoFetch, fetchBalance]);

  // Sufficiency is derived from balance and required amount; no effect needed.
  const hasSufficientBalance = useMemo(
    () => checkSufficiency(balance, requiredAmount),
    [balance, requiredAmount, checkSufficiency]
  );

  // Expose refetch method
  const refetch = useCallback(async (): Promise<void> => {
    await fetchBalance(true);
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    hasSufficientBalance,
    checkBalance,
    refetch,
    optimisticBalance,
  };
}