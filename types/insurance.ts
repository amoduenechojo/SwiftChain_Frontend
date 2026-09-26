/**
 * Cargo Insurance Types
 * Interfaces for optional cargo coverage offered during escrow checkout.
 */

/**
 * A cargo insurance product a shipper can attach to a shipment.
 * All monetary values are denominated in XLM.
 */
export interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  /** Maximum payout for a claim against this plan, in XLM */
  coverageXlm: number;
  /** One-off premium added to the escrow total, in XLM */
  premiumXlm: number;
  /** Amount the shipper bears before coverage applies, in XLM */
  deductibleXlm?: number;
  /** Marks the plan the UI highlights as the default choice */
  recommended?: boolean;
}

/** Successful plan lookup. */
export interface InsurancePlansResponse {
  success: true;
  data: InsurancePlan[];
}

/** Failed plan lookup. */
export interface InsuranceErrorResponse {
  success: false;
  error: string;
}

export type InsurancePlansResult = InsurancePlansResponse | InsuranceErrorResponse;

/**
 * Priced breakdown of an escrow checkout, including any selected coverage.
 */
export interface EscrowCheckoutQuote {
  /** Freight cost being placed in escrow, in XLM */
  shipmentXlm: number;
  /** Insurance premium, in XLM. Zero when coverage is declined. */
  premiumXlm: number;
  /** Sum locked into escrow, in XLM */
  totalXlm: number;
  /** The chosen plan, or null when the shipper declined coverage */
  plan: InsurancePlan | null;
}

/**
 * Payload sent when locking the escrow payment.
 */
export interface EscrowCheckoutParams {
  shipmentId: string;
  walletAddress: string;
  /** Chosen insurance plan id, or null when coverage was declined */
  insurancePlanId: string | null;
  /** Total XLM to lock, including any premium */
  totalXlm: number;
}

/**
 * Confirmation returned once the escrow payment settles on chain.
 */
export interface EscrowCheckoutReceipt {
  escrowId: string;
  transactionHash: string;
  /** Amount actually locked, in XLM */
  lockedXlm: number;
  /** Policy reference when coverage was purchased */
  insurancePolicyId?: string;
}

/** Successful checkout submission. */
export interface EscrowCheckoutResponse {
  success: true;
  data: EscrowCheckoutReceipt;
}

export type EscrowCheckoutResult = EscrowCheckoutResponse | InsuranceErrorResponse;
