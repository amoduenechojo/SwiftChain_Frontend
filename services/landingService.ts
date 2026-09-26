import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface HeroStat {
  id: string;
  label: string;
  value: number;
  suffix?: string;
}

export const landingService = {
  async getHeroStats(): Promise<HeroStat[]> {
    const { data } = await axios.get<HeroStat[]>(
      `${API_BASE_URL}/api/landing/hero-stats`,
    );
    return data;
  },
};
