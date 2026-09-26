export interface OrbitalElement {
  id: string;
  label: string;
}

export interface SettlementFeature {
  id: string;
  title: string;
  description: string;
}

export interface SettlementDiagramData {
  centralLabel: string;
  orbitalElements: OrbitalElement[];
  features: SettlementFeature[];
}
