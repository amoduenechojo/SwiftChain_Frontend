import axios from 'axios';
import type {
  IndustryHeroResponse,
  IndustrySplitFeature,
} from '@/types/industry';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const INDUSTRY_HERO_ENDPOINT = '/api/industry/hero';

/**
 * Normalises a raw feature block so components can render it without
 * defensive checks: collections always exist and CTAs are explicitly null.
 */
function normaliseFeature(feature: IndustrySplitFeature): IndustrySplitFeature {
  return {
    ...feature,
    imagePosition: feature.imagePosition === 'left' ? 'left' : 'right',
    highlights: feature.highlights ?? [],
    cta: feature.cta ?? null,
  };
}

/**
 * industryService — all Industry Solutions API communication.
 * Hooks call this; components never call it directly.
 */
export const industryService = {
  async getIndustryHero(signal?: AbortSignal): Promise<IndustryHeroResponse> {
    const { data } = await axios.get<IndustryHeroResponse>(
      `${API_BASE_URL}${INDUSTRY_HERO_ENDPOINT}`,
      { signal },
    );

    return {
      hero: data.hero
        ? {
            ...data.hero,
            primaryCta: data.hero.primaryCta ?? null,
            secondaryCta: data.hero.secondaryCta ?? null,
            stats: data.hero.stats ?? [],
          }
        : null,
      features: (data.features ?? []).map(normaliseFeature),
    };
  },
};
