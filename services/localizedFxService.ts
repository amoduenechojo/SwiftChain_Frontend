/**
 * localizedFxService — Service layer for multi-currency (NGN + USD) live FX rates.
 *
 * Wraps currencyRateService with a small in-memory TTL cache keyed per fiat
 * code, and exposes an Intl.NumberFormat-based formatter so the hook/component
 * layer never instantiates formatters directly.
 *
 * Architecture: Component -> useLocalizedFiatPreview (Hook) ->
 *              localizedFxService -> currencyRateService -> Backend
 */

import { currencyRateService } from '@/services/currencyRateService';

export type SupportedFiatCode = 'NGN' | 'USD';

export const SUPPORTED_FIAT_CODES: SupportedFiatCode[] = ['NGN', 'USD'];

export interface LocalizedRate {
  fiatCode: SupportedFiatCode;
  ratePerXlm: number;
  updatedAt: string;
}

const CACHE_TTL_MS = 60_000; // 60 seconds — balance between freshness and API load

interface CacheEntry {
  data: LocalizedRate;
  expiresAt: number;
}

const cache = new Map<SupportedFiatCode, CacheEntry>();

const FORMATTERS: Record<SupportedFiatCode, Intl.NumberFormat> = {
  NGN: new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};

/**
 * Formats an amount as a localized currency string.
 * e.g. formatLocalizedAmount(1234.5, 'NGN') -> "₦1,234.50"
 */
export function formatLocalizedAmount(amount: number, fiatCode: SupportedFiatCode): string {
  return FORMATTERS[fiatCode].format(amount);
}

export const localizedFxService = {
  /**
   * Returns the current XLM rate for the given fiat currency.
   * Hits the in-memory cache for up to `CACHE_TTL_MS` before re-fetching.
   */
  async getRate(fiatCode: SupportedFiatCode): Promise<LocalizedRate> {
    const now = Date.now();

    const cached = cache.get(fiatCode);
    if (cached && now < cached.expiresAt) {
      return cached.data;
    }

    const response = await currencyRateService.getXlmRate(fiatCode);

    const entry: LocalizedRate = {
      fiatCode,
      ratePerXlm: response.xlmRate,
      updatedAt: response.updatedAt,
    };

    cache.set(fiatCode, { data: entry, expiresAt: now + CACHE_TTL_MS });

    return entry;
  },

  /**
   * Clears the in-memory cache — useful for testing or forced refresh.
   */
  clearCache(): void {
    cache.clear();
  },
};
