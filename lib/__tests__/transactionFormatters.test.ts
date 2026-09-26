/**
 * Unit tests for the cross-border transaction display formatters.
 *
 * These are the single source of truth for how amounts and escrow statuses
 * read in both the grid and list views, so they are pinned down directly as
 * well as through the component tests.
 */

import {
  escrowStatusStyle,
  ESCROW_STATUS_STYLES,
  formatAssetAmount,
  formatCorridor,
  formatEscrowStatus,
  formatFiatAmount,
  formatSignedAssetAmount,
  formatTransactionDate,
} from '@/lib/transactionFormatters';
import type { EscrowStatus } from '@/types/status';

describe('formatAssetAmount', () => {
  it('groups thousands and pads to two decimals', () => {
    expect(formatAssetAmount(1250.5, 'XLM')).toBe('1,250.50 XLM');
    expect(formatAssetAmount(1000000, 'USDC')).toBe('1,000,000.00 USDC');
  });

  it('keeps stellar precision up to seven decimal places', () => {
    expect(formatAssetAmount(0.0000001, 'XLM')).toBe('0.0000001 XLM');
    expect(formatAssetAmount(12.1234567, 'XLM')).toBe('12.1234567 XLM');
  });

  it('rounds beyond seven decimal places rather than overflowing the cell', () => {
    expect(formatAssetAmount(1.123456789, 'XLM')).toBe('1.1234568 XLM');
  });

  it('formats zero as a real amount, not a placeholder', () => {
    expect(formatAssetAmount(0, 'XLM')).toBe('0.00 XLM');
  });

  it('preserves the sign of a negative amount', () => {
    expect(formatAssetAmount(-42.5, 'XLM')).toBe('-42.50 XLM');
  });

  it('renders a placeholder instead of NaN or Infinity', () => {
    expect(formatAssetAmount(Number.NaN, 'XLM')).toBe('—');
    expect(formatAssetAmount(Number.POSITIVE_INFINITY, 'XLM')).toBe('—');
  });
});

describe('formatFiatAmount', () => {
  it('renders the amount with its ISO currency code', () => {
    expect(formatFiatAmount(640.25, 'USD')).toBe('640.25 USD');
    expect(formatFiatAmount(1234567.8, 'NGN')).toBe('1,234,567.80 NGN');
  });

  it('always shows exactly two decimals', () => {
    expect(formatFiatAmount(10, 'EUR')).toBe('10.00 EUR');
    expect(formatFiatAmount(10.129, 'EUR')).toBe('10.13 EUR');
  });

  it('returns a placeholder when the corridor has no fiat quote', () => {
    expect(formatFiatAmount(undefined, 'USD')).toBe('—');
    expect(formatFiatAmount(640.25, undefined)).toBe('—');
    expect(formatFiatAmount(undefined, undefined)).toBe('—');
  });

  it('returns a placeholder for a non-finite amount', () => {
    expect(formatFiatAmount(Number.NaN, 'USD')).toBe('—');
  });

  it('treats a zero quote as a real amount', () => {
    expect(formatFiatAmount(0, 'USD')).toBe('0.00 USD');
  });
});

describe('formatSignedAssetAmount', () => {
  it('prefixes outgoing transfers with a minus sign', () => {
    expect(formatSignedAssetAmount(1250.5, 'XLM', 'SENT')).toBe('-1,250.50 XLM');
  });

  it('prefixes incoming transfers with a plus sign', () => {
    expect(formatSignedAssetAmount(800, 'XLM', 'RECEIVED')).toBe('+800.00 XLM');
  });

  it('signs a zero amount by direction rather than dropping the sign', () => {
    expect(formatSignedAssetAmount(0, 'USDC', 'SENT')).toBe('-0.00 USDC');
    expect(formatSignedAssetAmount(0, 'USDC', 'RECEIVED')).toBe('+0.00 USDC');
  });

  it('does not sign the placeholder for a non-finite amount', () => {
    expect(formatSignedAssetAmount(Number.NaN, 'XLM', 'SENT')).toBe('—');
  });
});

describe('formatEscrowStatus', () => {
  it.each<[EscrowStatus, string]>([
    ['LOCKED', 'Locked in escrow'],
    ['RELEASED', 'Released'],
    ['DISPUTED', 'Disputed'],
    ['NOT_LOCKED', 'Not locked'],
  ])('renders %s as %s', (status, expected) => {
    expect(formatEscrowStatus(status)).toBe(expected);
  });

  it('never leaks the raw wire format to the user', () => {
    const statuses: EscrowStatus[] = [
      'LOCKED',
      'RELEASED',
      'DISPUTED',
      'NOT_LOCKED',
    ];

    for (const status of statuses) {
      expect(formatEscrowStatus(status)).not.toContain('_');
    }
  });

  it('falls back to Unknown for an unrecognised status', () => {
    expect(formatEscrowStatus('SOMETHING_NEW' as EscrowStatus)).toBe('Unknown');
  });
});

describe('escrowStatusStyle', () => {
  it('gives every known status a distinct badge style', () => {
    const styles = Object.values(ESCROW_STATUS_STYLES);
    expect(new Set(styles).size).toBe(styles.length);
  });

  it('returns the neutral style for an unrecognised status', () => {
    expect(escrowStatusStyle('SOMETHING_NEW' as EscrowStatus)).toBe(
      ESCROW_STATUS_STYLES.NOT_LOCKED,
    );
  });
});

describe('formatCorridor', () => {
  it('renders origin and destination with a direction arrow', () => {
    expect(formatCorridor('NG', 'GB')).toBe('NG → GB');
  });
});

describe('formatTransactionDate', () => {
  it('renders a short, unambiguous date', () => {
    expect(formatTransactionDate('2026-04-25T12:00:00.000Z')).toBe(
      'Apr 25, 2026',
    );
  });

  it('returns a placeholder for an unparseable timestamp', () => {
    expect(formatTransactionDate('not-a-date')).toBe('—');
  });
});
