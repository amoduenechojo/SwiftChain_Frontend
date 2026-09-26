/**
 * Insurance Service
 * API communication for cargo insurance plans and the escrow payment that
 * settles a shipment together with any coverage the shipper selected.
 *
 * Components never call this directly — they go through useEscrowCheckout.
 */

import axios from 'axios';
import type {
  EscrowCheckoutParams,
  EscrowCheckoutQuote,
  EscrowCheckoutReceipt,
  EscrowCheckoutResult,
  InsurancePlan,
  InsurancePlansResult,
} from '@/types/insurance';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/** XLM is divisible to seven decimal places (one stroop). */
const STROOP_PRECISION = 7;

/**
 * Round an XLM amount to stroop precision so accumulated floating point error
 * never reaches the displayed total or the amount sent on chain.
 */
export function toStroopPrecision(amount: number): number {
  return Number(amount.toFixed(STROOP_PRECISION));
}

/**
 * Format an XLM amount for display, trimming trailing zeros.
 */
export function formatXlm(amount: number): string {
  return `${toStroopPrecision(amount)} XLM`;
}

/**
 * Build the priced breakdown for a checkout.
 * Pure function — the totals shown to the shipper and the amount submitted to
 * the escrow contract are derived from this single source.
 *
 * @param shipmentXlm - Freight cost in XLM
 * @param plan - Selected coverage, or null when declined
 * @throws Error when the shipment cost is not a positive finite number
 */
export function buildCheckoutQuote(
  shipmentXlm: number,
  plan: InsurancePlan | null
): EscrowCheckoutQuote {
  if (!Number.isFinite(shipmentXlm) || shipmentXlm <= 0) {
    throw new Error('Shipment amount must be a positive number');
  }

  const premiumXlm = plan ? toStroopPrecision(plan.premiumXlm) : 0;

  return {
    shipmentXlm: toStroopPrecision(shipmentXlm),
    premiumXlm,
    totalXlm: toStroopPrecision(shipmentXlm + premiumXlm),
    plan,
  };
}

function messageFor(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

/**
 * Fetch the cargo insurance plans available for a shipment.
 *
 * @param shipmentId - Shipment the quote applies to
 * @throws Error when the shipment id is missing or the request fails
 */
async function getPlans(shipmentId: string): Promise<InsurancePlan[]> {
  if (!shipmentId) {
    throw new Error('Shipment ID is required');
  }

  try {
    const { data } = await axios.get<InsurancePlansResult>(
      `${API_BASE_URL}/api/shipments/${shipmentId}/insurance-plans`
    );

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (error) {
    throw new Error(messageFor(error, 'Failed to load insurance plans'));
  }
}

/**
 * Lock the escrow payment for a shipment, including any selected coverage.
 *
 * @param params - Shipment, wallet, chosen plan and total to lock
 * @throws Error when the payload is incomplete or the payment fails
 */
async function payWithEscrow(
  params: EscrowCheckoutParams
): Promise<EscrowCheckoutReceipt> {
  if (!params.shipmentId) {
    throw new Error('Shipment ID is required');
  }

  if (!params.walletAddress) {
    throw new Error('A connected wallet is required to fund the escrow');
  }

  if (!Number.isFinite(params.totalXlm) || params.totalXlm <= 0) {
    throw new Error('Escrow amount must be a positive number');
  }

  try {
    const { data } = await axios.post<EscrowCheckoutResult>(
      `${API_BASE_URL}/api/escrow/checkout`,
      { ...params, totalXlm: toStroopPrecision(params.totalXlm) }
    );

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (error) {
    throw new Error(messageFor(error, 'Escrow payment failed'));
  }
}

export const insuranceService = {
  getPlans,
  payWithEscrow,
  buildCheckoutQuote,
};
