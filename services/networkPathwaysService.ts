import axios from 'axios';
import type { NetworkPathwayCard } from '@/types/networkPathways';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * networkPathwaysService — all Network Pathways card API communication.
 * Hooks call this; components never call this directly.
 */
export const networkPathwaysService = {
  async getCards(signal?: AbortSignal): Promise<NetworkPathwayCard[]> {
    const { data } = await axios.get<NetworkPathwayCard[]>(
      `${API_BASE_URL}/api/landing/network-pathways`,
      { signal },
    );
    return data;
  },
};
