import React, { useState, useRef } from 'react';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import './BalanceWarning.css';

interface BalanceWarningProps {
  requiredAmount: number;
  onClose?: () => void;
  className?: string;
  /**
   * Reserve a fixed DOM slot so the surrounding layout never jumps when the
   * banner mounts or unmounts.
   */
  reserveSpace?: boolean;
  /**
   * Use the optimistic/cached balance to decide visibility on the first render.
   * When true, a pre-fetched low balance is shown instantly (no wait for the
   * network round-trip).
   */
  showImmediately?: boolean;
}

/**
 * BalanceWarning — insufficient-balance banner.
 *
 * Layered Architecture:
 *   BalanceWarning (Component) → useWalletBalance (Hook) → walletService (Service)
 *
 * Visibility is DERIVED during render from the balance the hook exposes — it is
 * never stored in state and never toggled by effects. That removes the race that
 * caused the banner to flicker on modal load, and lets a pre-fetched low balance
 * paint on the very first frame. The only local state is the user's explicit
 * dismissal, which is a genuine user action and not part of the data flow.
 */
export const BalanceWarning: React.FC<BalanceWarningProps> = ({
  requiredAmount,
  onClose,
  className = '',
  reserveSpace = true,
  showImmediately = true,
}) => {
  // The hook owns the data. It auto-fetches on mount AND seeds `balance` /
  // `optimisticBalance` synchronously from the service cache, so a low balance
  // that was already fetched is available on the very first render.
  const { balance, isLoading, optimisticBalance, refetch } = useWalletBalance({
    requiredAmount,
    autoFetch: true,
    fetchOnMount: true,
  });

  // The ONLY piece of local state: has the user explicitly dismissed the banner?
  // Everything else is derived, so there is nothing left to race.
  const [dismissed, setDismissed] = useState<boolean>(false);
  const warningRef = useRef<HTMLDivElement>(null);

  // ---- Derived visibility (single source of truth, computed every render) ----
  //
  // Prefer the optimistic/cached balance for an instant decision when
  // `showImmediately` is set; otherwise use the confirmed balance. While the
  // very first fetch is still in flight and we have no balance at all, we stay
  // hidden (but keep the reserved space) so nothing flickers in and back out.
  const effectiveBalance =
    (showImmediately ? optimisticBalance : null) ?? balance;

  // `!= null` guards against both null and an undefined balance (e.g. a fetch
  // that resolved without cached data), so the render below is always safe.
  const isInsufficient =
    effectiveBalance != null && effectiveBalance.available < requiredAmount;

  const isVisible = isInsufficient && !dismissed;

  const handleClose = () => {
    setDismissed(true);
    onClose?.();
  };

  const handleRetry = () => {
    // Re-open (in case it was dismissed) and force a fresh fetch.
    setDismissed(false);
    refetch();
  };

  // If there is nothing to show and we are not holding space, render nothing.
  if (!isVisible && !reserveSpace) {
    return null;
  }

  // Reserve a stable slot so mounting/unmounting the banner never shifts layout.
  const containerStyle: React.CSSProperties = reserveSpace
    ? { minHeight: '60px' }
    : {};

  // Severity variant, based on the balance we are actually displaying.
  const isLowBalance =
    !!effectiveBalance && effectiveBalance.available < requiredAmount * 0.5;
  const variant = isLowBalance ? 'danger' : 'warning';

  const getWarningMessage = (): string => {
    if (!effectiveBalance) return 'Checking balance...';

    const shortfall = (requiredAmount - effectiveBalance.available).toFixed(2);
    const currency = effectiveBalance.currency || 'USD';

    if (effectiveBalance.available === 0) {
      return 'Insufficient balance. Please add funds to your wallet.';
    }

    return `Insufficient balance. You need ${currency} ${shortfall} more to complete this transaction.`;
  };

  return (
    <div
      className={`balance-warning-container ${className}`}
      style={containerStyle}
      role="alert"
      aria-live="polite"
    >
      {isVisible && (
        <div
          ref={warningRef}
          className={`balance-warning balance-warning--${variant}`}
          data-testid="balance-warning"
        >
          <div className="balance-warning__icon">
            {isLowBalance ? '⚠️' : '💡'}
          </div>

          <div className="balance-warning__content">
            <h4 className="balance-warning__title">
              {isLowBalance ? 'Critical: Insufficient Balance' : 'Insufficient Balance'}
            </h4>

            <p className="balance-warning__message">{getWarningMessage()}</p>

            {effectiveBalance && (
              <div className="balance-warning__details">
                <span>
                  Available: {effectiveBalance.currency} {effectiveBalance.available.toFixed(2)}
                </span>
                <span>
                  Required: {effectiveBalance.currency} {requiredAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="balance-warning__actions">
            <button
              className="balance-warning__btn balance-warning__btn--retry"
              onClick={handleRetry}
              aria-label="Retry balance check"
              disabled={isLoading}
            >
              <span>🔄</span> Retry
            </button>

            {onClose && (
              <button
                className="balance-warning__btn balance-warning__btn--close"
                onClick={handleClose}
                aria-label="Close warning"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden spacer keeps the reserved slot filled while the banner is hidden. */}
      {reserveSpace && !isVisible && (
        <div className="balance-warning__spacer" aria-hidden="true" />
      )}
    </div>
  );
};

export default BalanceWarning;
