/**
 * Contract for the Industry Solutions marketing surface.
 * Mirrors the payload returned by `GET /api/industry/hero`.
 */

export interface IndustryLink {
  label: string;
  href: string;
}

export interface IndustryStat {
  id: string;
  label: string;
  value: string;
}

export interface IndustryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface IndustryHighlight {
  id: string;
  title: string;
  description: string;
}

export interface IndustryHeroContent {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: IndustryLink | null;
  secondaryCta: IndustryLink | null;
  stats: IndustryStat[];
}

export type IndustryImagePosition = 'left' | 'right';

export interface IndustrySplitFeature {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  imagePosition: IndustryImagePosition;
  image: IndustryImage;
  highlights: IndustryHighlight[];
  cta: IndustryLink | null;
}

export interface IndustryHeroResponse {
  /** `null` when the CMS/backend has no published hero for this page. */
  hero: IndustryHeroContent | null;
  features: IndustrySplitFeature[];
}
