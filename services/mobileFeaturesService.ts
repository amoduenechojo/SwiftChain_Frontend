import axios from 'axios';
import type { MobileFeatureCard } from '@/types/mobileFeatures';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * mobileFeaturesService — all Mobile Kinetic Features Stack API
 * communication. Hooks call this; components never call this directly.
 */
export const mobileFeaturesService = {
  async getFeatures(signal?: AbortSignal): Promise<MobileFeatureCard[]> {
    const { data } = await axios.get<MobileFeatureCard[]>(
      `${API_BASE_URL}/api/mobile/features`,
      { signal },
    );
    return data;
  },
};
