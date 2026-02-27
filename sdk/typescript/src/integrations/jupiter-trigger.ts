// ---------------------------------------------------------------------------
// Jupiter Trigger / Limit Orders API v1
// ---------------------------------------------------------------------------
// Agents place conditional orders. Returns pre-built transactions.
// Client-side policy enforcement only (TEE protects signing key).
//
// API: POST /trigger/v1/createOrder, POST /trigger/v1/cancelOrder,
//      GET /trigger/v1/getTriggerOrders
// ---------------------------------------------------------------------------

import { jupiterFetch } from "./jupiter-api";

// ---------------------------------------------------------------------------
// Policy Check
// ---------------------------------------------------------------------------

/**
 * Optional client-side policy check for trigger/limit orders.
 * Since these orders bypass the on-chain vault (Jupiter returns opaque
 * pre-built transactions), this provides a safety check before signing.
 */
export interface TriggerOrderPolicyCheck {
  /** Maximum order amount in base units. Rejects if makingAmount exceeds this. */
  maxAmount?: string;
  /** Daily spending cap in base units. Combined with currentSpend, rejects if exceeded. */
  dailyCap?: string;
  /** Amount already spent in the current window (base units). Used with dailyCap. */
  currentSpend?: string;
}

function validateTriggerPolicy(
  makingAmount: string,
  check: TriggerOrderPolicyCheck,
): void {
  const amount = BigInt(makingAmount);

  if (check.maxAmount !== undefined) {
    if (amount > BigInt(check.maxAmount)) {
      throw new Error(
        `Order amount ${makingAmount} exceeds maximum allowed ${check.maxAmount}. ` +
          `Reduce the order size or adjust your policy limits.`,
      );
    }
  }

  if (check.dailyCap !== undefined) {
    const cap = BigInt(check.dailyCap);
    const spent = BigInt(check.currentSpend ?? "0");
    if (spent + amount > cap) {
      const remaining = cap > spent ? (cap - spent).toString() : "0";
      throw new Error(
        `Order would exceed daily spending cap: spent ${check.currentSpend ?? "0"} + order ${makingAmount} > cap ${check.dailyCap}. ` +
          `Remaining budget: ${remaining}. Reduce order size or wait for cap to reset.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JupiterTriggerOrderParams {
  /** Authority/signer for the order. */
  maker: string;
  /** Fee payer public key. */
  payer: string;
  /** Input token mint address. */
  inputMint: string;
  /** Output token mint address. */
  outputMint: string;
  /** Amount of input tokens (in base units). */
  makingAmount: string;
  /** Minimum amount of output tokens (in base units). */
  takingAmount: string;
  /** Expiry timestamp (Unix seconds). 0 = no expiry. */
  expiredAt?: number;
}

export interface JupiterTriggerOrder {
  orderId: string;
  maker: string;
  inputMint: string;
  outputMint: string;
  makingAmount: string;
  takingAmount: string;
  remainingMakingAmount: string;
  remainingTakingAmount: string;
  state: "active" | "completed" | "cancelled";
  createdAt: string;
  expiredAt?: string;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Create a Jupiter trigger/limit order.
 * Returns a serialized transaction for signing.
 *
 * @param params - Order parameters.
 * @param policyCheck - Optional client-side spending policy check. Since trigger
 *   orders bypass the on-chain vault (Jupiter builds opaque pre-signed txs),
 *   this provides a safety net before the order is created.
 */
export async function createJupiterTriggerOrder(
  params: JupiterTriggerOrderParams,
  policyCheck?: TriggerOrderPolicyCheck,
): Promise<{ serializedTransaction: string }> {
  if (policyCheck) {
    validateTriggerPolicy(params.makingAmount, policyCheck);
  }

  return jupiterFetch<{ serializedTransaction: string }>(
    "/trigger/v1/createOrder",
    {
      method: "POST",
      body: params as unknown as Record<string, unknown>,
    },
  );
}

/**
 * Cancel a Jupiter trigger/limit order.
 * Returns a serialized transaction for signing.
 */
export async function cancelJupiterTriggerOrder(
  orderId: string,
  feePayer: string,
  signer: string,
): Promise<{ serializedTransaction: string }> {
  return jupiterFetch<{ serializedTransaction: string }>(
    "/trigger/v1/cancelOrder",
    {
      method: "POST",
      body: {
        orderId,
        feePayer,
        owner: signer,
      },
    },
  );
}

/**
 * Get trigger orders for an authority.
 *
 * @param authority - Wallet address.
 * @param state - Filter by order state (optional).
 */
export async function getJupiterTriggerOrders(
  authority: string,
  state?: "active" | "completed" | "cancelled",
): Promise<JupiterTriggerOrder[]> {
  const qs = new URLSearchParams({ wallet: authority });
  if (state) {
    qs.set("state", state);
  }
  return jupiterFetch<JupiterTriggerOrder[]>(
    `/trigger/v1/getTriggerOrders?${qs.toString()}`,
  );
}
