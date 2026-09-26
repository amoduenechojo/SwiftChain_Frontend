'use client';

/**
 * SlippageWarning — standalone FX rate volatility warning UI.
 *
 * Presentational component covering the three slippage states:
 * - Volatile (>2%): non-blocking advisory banner.
 * - Critical (>5%): blocking banner with a required acknowledgment checkbox.
 * - Acknowledged: confirmation that the user accepted the critical variance.
 *
 * Kept separate from FiatXlmPreview so any escrow flow that quotes a
 * fiat/XLM rate can reuse the same warning UI and thresholds.
 *
 * Architecture: SlippageWarning (Component) → useFiatXlmSlippage (Hook) →
 *              fiatXlmSlippageService → fxService → Backend
 */

import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface SlippageWarningProps {
  /** Percentage change of the current rate against the quoted rate */
  slippagePercent: number;
  /** True if slippage magnitude exceeds the 2% volatility threshold */
  isVolatile: boolean;
  /** True if slippage magnitude exceeds the 5% critical threshold */
  requiresAcknowledgment: boolean;
  /** Whether the user has ticked the acknowledgment checkbox */
  isAcknowledged: boolean;
  /** Called with the new checked state when the checkbox is toggled */
  onAcknowledgeChange: (acknowledged: boolean) => void;
  /** Disables the checkbox while a submission is in flight */
  isSubmitting?: boolean;
}

export function SlippageWarning({
  slippagePercent,
  isVolatile,
  requiresAcknowledgment,
  isAcknowledged,
  onAcknowledgeChange,
  isSubmitting = false,
}: SlippageWarningProps) {
  if (!isVolatile && !requiresAcknowledgment) {
    return null;
  }

  const magnitude = Math.abs(slippagePercent).toFixed(2);

  if (requiresAcknowledgment) {
    return (
      <div
        role="alert"
        className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
      >
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
        <div className="flex-1 text-sm text-red-800 dark:text-red-200">
          <p className="font-semibold">High FX Rate Volatility</p>
          <p className="mt-1 text-xs">
            The NGN/XLM rate has shifted more than{' '}
            <span className="font-semibold">{magnitude}%</span>. This is a
            significant change. You must acknowledge this volatility before
            proceeding.
          </p>

          <div className="mt-3 flex items-start gap-2">
            <input
              id="volatility-ack"
              type="checkbox"
              checked={isAcknowledged}
              onChange={(e) => onAcknowledgeChange(e.target.checked)}
              disabled={isSubmitting}
              className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-red-600 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Acknowledge FX rate volatility"
            />
            <label
              htmlFor="volatility-ack"
              className={`text-xs cursor-pointer select-none ${
                isSubmitting ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              I acknowledge the rate volatility and accept the current rate
            </label>
          </div>

          {isAcknowledged && (
            <div className="mt-3 flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Volatility acknowledged. Ready to proceed.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="mb-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" aria-hidden="true" />
      <div className="text-sm text-amber-800 dark:text-amber-200">
        <p className="font-semibold">FX Rate Volatility Detected</p>
        <p className="mt-1 text-xs">
          The NGN/XLM rate has shifted{' '}
          <span className="font-semibold">{magnitude}%</span> since your
          quote. Please review the updated rate.
        </p>
      </div>
    </div>
  );
}
