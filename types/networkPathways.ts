export type NetworkPathwayIcon = 'enterprise' | 'carrier';

export interface NetworkPathwayCard {
  id: string;
  icon: NetworkPathwayIcon;
  title: string;
  description: string;
  cta: { label: string; href: string };
}
