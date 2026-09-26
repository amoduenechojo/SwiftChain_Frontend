/**
 * Cross-border transaction history types.
 *
 * Shared by the list and grid presentations of a user's settled and in-flight
 * cross-border transfers.
 */

import type { EscrowStatus } from './status';

export type TransactionDirection = 'SENT' | 'RECEIVED';

export interface CrossBorderTransaction {
  id: string;
  /** Human-facing reference shown to the user, e.g. "SC-20260425-0001". */
  reference: string;
  direction: TransactionDirection;
  /** Display name of the other party in the corridor. */
  counterparty: string;
  /** Amount in the settlement asset. */
  amount: number;
  /** Settlement asset code, e.g. "XLM" or "USDC". */
  assetCode: string;
  /** Quoted amount in the corridor's local fiat currency, when available. */
  fiatAmount?: number;
  /** ISO 4217 code for {@link fiatAmount}. */
  fiatCurrency?: string;
  /** ISO 3166-1 alpha-2 origin country. */
  originCountry: string;
  /** ISO 3166-1 alpha-2 destination country. */
  destinationCountry: string;
  escrowStatus: EscrowStatus;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
}
