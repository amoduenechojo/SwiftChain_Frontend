export interface PricingPlan {
  id: string;
  name: string;
}

export type PricingFeatureValue = boolean | string;

export interface PricingFeatureRow {
  id: string;
  label: string;
  values: Record<string, PricingFeatureValue>;
}

export interface PricingComparison {
  plans: PricingPlan[];
  rows: PricingFeatureRow[];
}

export interface PricingCard {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaLabel: string;
  highlighted: boolean;
  href: string;
}

export interface PricingCardsResponse {
  cards: PricingCard[];
}
