export type EscrowStatus = 'locked' | 'released' | 'disputed';

export interface EscrowMetric {
  id: string;
  label: string;
  value: string;
}

export interface MobileEscrowSummary {
  status: EscrowStatus;
  statusLabel: string;
  amount: number;
  currency: string;
  metrics: EscrowMetric[];
}
