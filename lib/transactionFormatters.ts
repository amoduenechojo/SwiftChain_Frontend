/**
 * Display formatting for cross-border transaction history.
 *
 * Amounts are rendered as a locale-grouped number followed by the ISO asset or
 * currency code rather than a localised symbol. Corridors span currencies whose
 * symbols collide (several use "$"), and `Intl` currency symbols also vary with
 * the host ICU build, which would make the UI inconsistent across environments.
 */

import type { EscrowStatus } from '@/types/status';
import type { TransactionDirection } from '@/types/transactionHistory';

/** Stellar assets carry up to 7 decimal places. */
const MAX_ASSET_DECIMALS = 7;
const FIAT_DECIMALS = 2;

const assetFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: FIAT_DECIMALS,
  maximumFractionDigits: MAX_ASSET_DECIMALS,
});

const fiatFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: FIAT_DECIMALS,
  maximumFractionDigits: FIAT_DECIMALS,
});

const ESCROW_STATUS_LABELS: Record<EscrowStatus, string> = {
  LOCKED: 'Locked in escrow',
  RELEASED: 'Released',
  DISPUTED: 'Disputed',
  NOT_LOCKED: 'Not locked',
};

export const ESCROW_STATUS_STYLES: Record<EscrowStatus, string> = {
  LOCKED: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  RELEASED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  DISPUTED:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  NOT_LOCKED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const UNKNOWN_AMOUNT = '—';

/**
 * Formats a settlement amount, e.g. `1234.5, "XLM"` becomes `1,234.50 XLM`.
 * Non-finite amounts render as an em dash so a bad feed cannot print "NaN".
 */
export function formatAssetAmount(amount: number, assetCode: string): string {
  if (!Number.isFinite(amount)) return UNKNOWN_AMOUNT;
  return `${assetFormatter.format(amount)} ${assetCode}`;
}

/**
 * Formats the local-currency leg of a transfer, e.g. `1,234.50 NGN`.
 * Returns an em dash when the corridor has no fiat quote attached.
 */
export function formatFiatAmount(
  amount: number | undefined,
  currency: string | undefined,
): string {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || !currency) {
    return UNKNOWN_AMOUNT;
  }
  return `${fiatFormatter.format(amount)} ${currency}`;
}

/** Prefixes an amount with the direction sign a user expects on a ledger. */
export function formatSignedAssetAmount(
  amount: number,
  assetCode: string,
  direction: TransactionDirection,
): string {
  const formatted = formatAssetAmount(amount, assetCode);
  if (formatted === UNKNOWN_AMOUNT) return formatted;
  return `${direction === 'SENT' ? '-' : '+'}${formatted}`;
}

/** Turns the wire-format escrow status into sentence-case display text. */
export function formatEscrowStatus(status: EscrowStatus): string {
  return ESCROW_STATUS_LABELS[status] ?? 'Unknown';
}

/** Tailwind classes for an escrow status badge, with a neutral fallback. */
export function escrowStatusStyle(status: EscrowStatus): string {
  return ESCROW_STATUS_STYLES[status] ?? ESCROW_STATUS_STYLES.NOT_LOCKED;
}

/** Renders a corridor as `NG -> GB`, using an arrow the terminal-safe way. */
export function formatCorridor(origin: string, destination: string): string {
  return `${origin} → ${destination}`;
}

/** Short, unambiguous date for a history row, e.g. `Apr 25, 2026`. */
export function formatTransactionDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return UNKNOWN_AMOUNT;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
