import axios from 'axios';
import type { MobileHeroContent } from '@/types/mobileHero';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * mobileHeroService — all Mobile Hero content API communication.
 * Hooks call this; components never call this directly.
 */
export const mobileHeroService = {
  async getContent(signal?: AbortSignal): Promise<MobileHeroContent> {
    const { data } = await axios.get<MobileHeroContent>(
      `${API_BASE_URL}/api/mobile/hero-content`,
      { signal },
    );
    return data;
  },
};
