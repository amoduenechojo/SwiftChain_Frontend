import axios from 'axios';
import type { TrustBarResponse } from '@/types/trustBar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * trustBarService — all trust bar and secondary stats API communication.
 * Hooks call this; components never call this directly.
 */
export const trustBarService = {
  async getTrustBarData(signal?: AbortSignal): Promise<TrustBarResponse> {
    const { data } = await axios.get<TrustBarResponse>(
      `${API_BASE_URL}/content/trust-bar`,
      { signal },
    );
    return data;
  },
};
