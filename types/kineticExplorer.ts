export type LedgerTransactionStatus = 'settled' | 'pending' | 'escrowed';

export interface LedgerTransaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: number;
  asset: string;
  status: LedgerTransactionStatus;
  timestamp: string;
}

export interface NetworkMetrics {
  tps: number;
  latencyMs: number;
  ledgerNumber: number;
  activeValidators: number;
}

export interface KineticExplorerResponse {
  transactions: LedgerTransaction[];
  metrics: NetworkMetrics;
}
