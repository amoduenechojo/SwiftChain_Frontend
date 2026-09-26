import axios from 'axios';
import type { MobileEscrowSummary } from '@/types/mobileEscrow';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * mobileEscrowService — all Mobile Escrow Widget API communication.
 * Hooks call this; components never call this directly.
 */
export const mobileEscrowService = {
  async getSummary(signal?: AbortSignal): Promise<MobileEscrowSummary> {
    const { data } = await axios.get<MobileEscrowSummary>(
      `${API_BASE_URL}/api/mobile/escrow-summary`,
      { signal },
    );
    return data;
  },
};
