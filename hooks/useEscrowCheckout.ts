'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { insuranceService } from '@/services/insuranceService';
import type {
  EscrowCheckoutQuote,
  EscrowCheckoutReceipt,
  InsurancePlan,
} from '@/types/insurance';

/** The three steps a shipper moves through to fund a shipment. */
export type CheckoutStep = 'insurance' | 'review' | 'complete';

export interface UseEscrowCheckoutParams {
  shipmentId: string;
  /** Freight cost in XLM, before any insurance premium */
  shipmentXlm: number;
  /** Connected wallet address, or undefined while disconnected */
  walletAddress?: string;
}

export interface UseEscrowCheckoutReturn {
  step: CheckoutStep;
  plans: InsurancePlan[];
  isLoadingPlans: boolean;
  plansError: string | null;
  selectedPlan: InsurancePlan | null;
  quote: EscrowCheckoutQuote | null;
  isPaying: boolean;
  paymentError: string | null;
  receipt: EscrowCheckoutReceipt | null;
  selectPlan: (planId: string | null) => void;
  loadPlans: () => Promise<void>;
  goToReview: () => void;
  goBackToInsurance: () => void;
  confirmPayment: () => Promise<void>;
}

/**
 * useEscrowCheckout — drives the cargo insurance selection and the XLM escrow
 * payment that concludes checkout.
 *
 * Follows the Component -> Hook -> Service pattern: the component owns
 * presentation, this hook owns step and request state, and insuranceService
 * owns every network call.
 */
export function useEscrowCheckout({
  shipmentId,
  shipmentXlm,
  walletAddress,
}: UseEscrowCheckoutParams): UseEscrowCheckoutReturn {
  const [step, setStep] = useState<CheckoutStep>('insurance');
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<EscrowCheckoutReceipt | null>(null);

  const loadPlans = useCallback(async () => {
    setIsLoadingPlans(true);
    setPlansError(null);

    try {
      const available = await insuranceService.getPlans(shipmentId);
      setPlans(available);
    } catch (err) {
      setPlans([]);
      setPlansError(
        err instanceof Error ? err.message : 'Failed to load insurance plans'
      );
    } finally {
      setIsLoadingPlans(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    // Fetching on mount is the point of this effect; loadPlans owns its own
    // loading and error state, matching the pattern used across the hooks here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPlans();
  }, [loadPlans]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );

  const quote = useMemo(() => {
    try {
      return insuranceService.buildCheckoutQuote(shipmentXlm, selectedPlan);
    } catch {
      return null;
    }
  }, [shipmentXlm, selectedPlan]);

  /** Choose a plan, or pass null to decline coverage. */
  const selectPlan = useCallback((planId: string | null) => {
    setSelectedPlanId(planId);
  }, []);

  const goToReview = useCallback(() => {
    setPaymentError(null);
    setStep('review');
  }, []);

  const goBackToInsurance = useCallback(() => {
    setPaymentError(null);
    setStep('insurance');
  }, []);

  const confirmPayment = useCallback(async () => {
    if (!walletAddress) {
      setPaymentError('Connect your wallet to fund this escrow.');
      return;
    }

    if (!quote) {
      setPaymentError('Escrow amount must be a positive number');
      return;
    }

    setIsPaying(true);
    setPaymentError(null);

    try {
      const result = await insuranceService.payWithEscrow({
        shipmentId,
        walletAddress,
        insurancePlanId: selectedPlan?.id ?? null,
        totalXlm: quote.totalXlm,
      });

      setReceipt(result);
      setStep('complete');
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Escrow payment failed');
    } finally {
      setIsPaying(false);
    }
  }, [quote, selectedPlan, shipmentId, walletAddress]);

  return {
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
  };
}
