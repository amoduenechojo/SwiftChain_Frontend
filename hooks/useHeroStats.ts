import { useQuery } from '@tanstack/react-query';
import { landingService, type HeroStat } from '@/services/landingService';

export const HERO_STATS_QUERY_KEY = ['landing', 'hero-stats'] as const;

export interface UseHeroStatsReturn {
  stats: HeroStat[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * useHeroStats — fetches the animated statistics shown in the landing page
 * hero section (e.g. deliveries secured, total value locked).
 */
export function useHeroStats(): UseHeroStatsReturn {
  const { data, isLoading, isError, error } = useQuery<HeroStat[], Error>({
    queryKey: HERO_STATS_QUERY_KEY,
    queryFn: () => landingService.getHeroStats(),
  });

  return {
    stats: data ?? [],
    isLoading,
    isError,
    error: error ?? null,
  };
}
