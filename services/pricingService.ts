import axios from 'axios';
import type { PricingCardsResponse, PricingComparison } from '@/types/pricing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * pricingService — all pricing-related API communication.
 * Hooks call this; components never call this directly.
 */
export const pricingService = {
  async getComparison(signal?: AbortSignal): Promise<PricingComparison> {
    const { data } = await axios.get<PricingComparison>(
      `${API_BASE_URL}/pricing/comparison`,
      { signal },
    );
    return data;
  },

  async getPricingCards(signal?: AbortSignal): Promise<PricingCardsResponse> {
    const { data } = await axios.get<PricingCardsResponse>(
      `${API_BASE_URL}/pricing/cards`,
      { signal },
    );
    return data;
  },
};
