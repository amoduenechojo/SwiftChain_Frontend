'use client';

import React from 'react';
import { AlertCircle, Check, Loader, Shield, ShieldOff } from 'lucide-react';
import { useEscrowCheckout } from '@/hooks/useEscrowCheckout';
import { formatXlm } from '@/services/insuranceService';
import type { EscrowCheckoutReceipt, InsurancePlan } from '@/types/insurance';

const NO_COVERAGE = 'none';

export interface EscrowInsuranceCheckoutProps {
  shipmentId: string;
  /** Freight cost in XLM, before any insurance premium */
  shipmentXlm: number;
  /** Connected wallet address, or undefined while disconnected */
  walletAddress?: string;
  onComplete?: (receipt: EscrowCheckoutReceipt) => void;
}

/**
 * EscrowInsuranceCheckout — cargo insurance selection followed by the XLM
 * escrow payment that funds the shipment.
 *
 * Step 1 offers the available coverage (or none at all), step 2 reviews the
 * priced breakdown, and step 3 confirms the on-chain receipt.
 */
export function EscrowInsuranceCheckout({
  shipmentId,
  shipmentXlm,
  walletAddress,
  onComplete,
}: EscrowInsuranceCheckoutProps) {
  const {
    step,
    plans,
    isLoadingPlans,
    plansError,
    selectedPlan,
    quote,
    isPaying,
    paymentError,
    receipt,
    selectPlan,
    loadPlans,
    goToReview,
    goBackToInsurance,
    confirmPayment,
  } = useEscrowCheckout({ shipmentId, shipmentXlm, walletAddress });

  const isWalletConnected = !!walletAddress;

  const handleConfirm = async () => {
    await confirmPayment();
  };

  // Notify once per settled payment. Keeping the receipt in a ref means an
  // inline onComplete prop cannot re-fire the callback on every re-render.
  const notifiedReceipt = React.useRef<EscrowCheckoutReceipt | null>(null);

  React.useEffect(() => {
    if (receipt && notifiedReceipt.current !== receipt) {
      notifiedReceipt.current = receipt;
      onComplete?.(receipt);
    }
  }, [receipt, onComplete]);

  if (step === 'complete' && receipt) {
    return (
      <section
        aria-labelledby="checkout-complete-heading"
        className="w-full max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <h2
            id="checkout-complete-heading"
            className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
          >
            Escrow funded
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {formatXlm(receipt.lockedXlm)} is locked until delivery is confirmed.
          </p>
          <dl className="w-full text-left space-y-3">
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">Escrow ID</dt>
              <dd className="text-sm font-mono text-gray-900 dark:text-white break-all">
                {receipt.escrowId}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">Transaction hash</dt>
              <dd className="text-sm font-mono text-gray-900 dark:text-white break-all">
                {receipt.transactionHash}
              </dd>
            </div>
            {receipt.insurancePolicyId && (
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">Insurance policy</dt>
                <dd className="text-sm font-mono text-gray-900 dark:text-white break-all">
                  {receipt.insurancePolicyId}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    );
  }

  if (step === 'review' && quote) {
    return (
      <section
        aria-labelledby="checkout-review-heading"
        className="w-full max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
      >
        <h2
          id="checkout-review-heading"
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          Review and pay
        </h2>

        <dl className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-300">Shipment</dt>
            <dd data-testid="summary-shipment" className="text-gray-900 dark:text-white">
              {formatXlm(quote.shipmentXlm)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-300">
              {quote.plan ? `Insurance (${quote.plan.name})` : 'Insurance (declined)'}
            </dt>
            <dd data-testid="summary-premium" className="text-gray-900 dark:text-white">
              {formatXlm(quote.premiumXlm)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 font-semibold">
            <dt className="text-gray-900 dark:text-white">Total locked in escrow</dt>
            <dd data-testid="summary-total" className="text-gray-900 dark:text-white">
              {formatXlm(quote.totalXlm)}
            </dd>
          </div>
        </dl>

        {!isWalletConnected && (
          <p role="alert" className="mb-4 text-sm text-amber-600 dark:text-amber-400">
            Connect your wallet to fund this escrow.
          </p>
        )}

        {paymentError && (
          <p
            role="alert"
            className="mb-4 flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            {paymentError}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={goBackToInsurance}
            disabled={isPaying}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPaying || !isWalletConnected}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
          >
            {isPaying ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
                Processing payment
              </span>
            ) : (
              `Pay ${formatXlm(quote.totalXlm)}`
            )}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="checkout-insurance-heading"
      className="w-full max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
    >
      <h2
        id="checkout-insurance-heading"
        className="text-lg font-semibold text-gray-900 dark:text-white mb-1"
      >
        Cargo insurance
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Coverage is optional. Any premium is added to the escrow total.
      </p>

      {isLoadingPlans && (
        <p role="status" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
          Loading insurance plans
        </p>
      )}

      {!isLoadingPlans && plansError && (
        <div>
          <p
            role="alert"
            className="mb-3 flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            {plansError}
          </p>
          <button
            type="button"
            onClick={() => void loadPlans()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoadingPlans && !plansError && plans.length === 0 && (
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          No insurance plans are available for this shipment. You can continue without
          coverage.
        </p>
      )}

      {!isLoadingPlans && !plansError && (
        <fieldset className="mb-4">
          <legend className="sr-only">Choose cargo coverage</legend>
          <div role="radiogroup" aria-label="Cargo coverage" className="space-y-2">
            {plans.map((plan) => (
              <PlanOption
                key={plan.id}
                plan={plan}
                checked={selectedPlan?.id === plan.id}
                onSelect={() => selectPlan(plan.id)}
              />
            ))}

            <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="insurance-plan"
                value={NO_COVERAGE}
                checked={selectedPlan === null}
                onChange={() => selectPlan(null)}
                className="mt-1"
              />
              <span>
                <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  <ShieldOff className="w-4 h-4" aria-hidden="true" />
                  Continue without coverage
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  Losses in transit are not reimbursed.
                </span>
              </span>
            </label>
          </div>
        </fieldset>
      )}

      {!isLoadingPlans && !plansError && (
        <button
          type="button"
          onClick={goToReview}
          disabled={!quote}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
        >
          Continue to payment
        </button>
      )}
    </section>
  );
}

interface PlanOptionProps {
  plan: InsurancePlan;
  checked: boolean;
  onSelect: () => void;
}

function PlanOption({ plan, checked, onSelect }: PlanOptionProps) {
  return (
    <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer">
      <input
        type="radio"
        name="insurance-plan"
        value={plan.id}
        checked={checked}
        onChange={onSelect}
        className="mt-1"
      />
      <span className="flex-1">
        <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
          <Shield className="w-4 h-4" aria-hidden="true" />
          {plan.name}
          {plan.recommended && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              Recommended
            </span>
          )}
        </span>
        <span className="block text-xs text-gray-500 dark:text-gray-400">
          {plan.description}
        </span>
        <span className="block mt-1 text-xs text-gray-600 dark:text-gray-300">
          Covers up to {formatXlm(plan.coverageXlm)} for {formatXlm(plan.premiumXlm)}
          {plan.deductibleXlm !== undefined &&
            ` (${formatXlm(plan.deductibleXlm)} deductible)`}
        </span>
      </span>
    </label>
  );
}

export default EscrowInsuranceCheckout;
