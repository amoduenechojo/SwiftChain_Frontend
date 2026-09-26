import api from '@/lib/api';
import type { TransactionStatus } from '@/types/transaction';

export interface TransactionRecord {
  id: string;
  /** Stellar transaction hash. */
  hash: string;
  /** ISO timestamp of when the transaction was submitted. */
  date: string;
  type: 'ESCROW_LOCK' | 'ESCROW_RELEASE' | 'REFUND' | 'PAYOUT';
  amount: number;
  currency: string;
  status: TransactionStatus;
  counterparty?: string;
  deliveryId?: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  message?: string;
  data?: TransactionRecord[];
}

/**
 * transactionHistoryService — reads the authenticated user's on-chain
 * transaction history for the settings and wallet history views.
 */
export const transactionHistoryService = {
  async getTransactions(): Promise<TransactionHistoryResponse> {
    try {
      const { data } = await api.get<TransactionHistoryResponse>('/transactions');
      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to load transaction history',
      };
    }
  },
};
