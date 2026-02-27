// ---------------------------------------------------------------------------
// Jupiter Recurring / DCA Orders API v1
// ---------------------------------------------------------------------------
// Time-based recurring swap orders. Returns pre-built transactions.
// Client-side policy enforcement only (TEE protects signing key).
//
// API: POST /recurring/v1/createOrder, POST /recurring/v1/cancelOrder,
//      GET /recurring/v1/getRecurringOrders
//
// Constraints (per Jupiter skill):
//   - Min 100 USD total, min 2 orders, min 50 USD per order
//   - 0.1% fee on all recurring orders
//   - Token-2022 NOT supported
//   - Price-based recurring orders are DEPRECATED — use time-based only
// ---------------------------------------------------------------------------

import { jupiterFetch } from "./jupiter-api";

// ---------------------------------------------------------------------------
// Policy Check
// ---------------------------------------------------------------------------

/**
 * Optional client-side policy check for recurring/DCA orders.
 * Since these orders bypass the on-chain vault (Jupiter returns opaque
 * pre-built transactions), this provides a safety check before signing.
 */
export interface RecurringOrderPolicyCheck {
  /** Maximum total order amount in base units. Rejects if inAmount exceeds this. */
  maxAmount?: string;
  /** Daily spending cap in base units. Combined with currentSpend, rejects if exceeded. */
  dailyCap?: string;
  /** Amount already spent in the current window (base units). Used with dailyCap. */
  currentSpend?: string;
}

function validateRecurringPolicy(
  inAmount: string,
  check: RecurringOrderPolicyCheck,
): void {
  const amount = BigInt(inAmount);

  if (check.maxAmount !== undefined) {
    if (amount > BigInt(check.maxAmount)) {
      throw new Error(
        `Recurring order total ${inAmount} exceeds maximum allowed ${check.maxAmount}. ` +
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
        `Recurring order would exceed daily spending cap: spent ${check.currentSpend ?? "0"} + order ${inAmount} > cap ${check.dailyCap}. ` +
          `Remaining budget: ${remaining}. Reduce order size or wait for cap to reset.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JupiterRecurringOrderParams {
  /** Authority/signer for the order. */
  maker: string;
  /** Fee payer public key. */
  payer: string;
  /** Input token mint address. */
  inputMint: string;
  /** Output token mint address. */
  outputMint: string;
  /** Total input amount across all orders (in base units). */
  inAmount: string;
  /** Number of orders to split into (min 2). */
  numberOfOrders: number;
  /** Interval between orders in seconds. */
  intervalSeconds: number;
}

export interface JupiterRecurringOrder {
  orderId: string;
  maker: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  inDeposited: string;
  inWithdrawn: string;
  outWithdrawn: string;
  numberOfOrders: number;
  numberOfOrdersFilled: number;
  intervalSeconds: number;
  state: "active" | "completed" | "cancelled";
  createdAt: string;
  nextExecutionAt?: string;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Create a Jupiter recurring (DCA) order.
 * Returns a serialized transaction for signing.
 *
 * @param params - Order parameters.
 * @param policyCheck - Optional client-side spending policy check. Since recurring
 *   orders bypass the on-chain vault (Jupiter builds opaque pre-signed txs),
 *   this provides a safety net before the order is created.
 */
export async function createJupiterRecurringOrder(
  params: JupiterRecurringOrderParams,
  policyCheck?: RecurringOrderPolicyCheck,
): Promise<{ transaction: string }> {
  if (policyCheck) {
    validateRecurringPolicy(params.inAmount, policyCheck);
  }

  const response = await jupiterFetch<{ serializedTransaction: string }>(
    "/recurring/v1/createOrder",
    {
      method: "POST",
      body: {
        maker: params.maker,
        payer: params.payer,
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        params: {
          time: {
            inAmount: params.inAmount,
            numberOfOrders: params.numberOfOrders,
            interval: params.intervalSeconds,
          },
        },
      },
    },
  );
  return { transaction: response.serializedTransaction };
}

/**
 * Get recurring orders for a user.
 */
export async function getJupiterRecurringOrders(
  user: string,
): Promise<JupiterRecurringOrder[]> {
  const qs = new URLSearchParams({ wallet: user });
  return jupiterFetch<JupiterRecurringOrder[]>(
    `/recurring/v1/getRecurringOrders?${qs.toString()}`,
  );
}

/**
 * Cancel a Jupiter recurring order.
 * Returns a serialized transaction for signing.
 */
export async function cancelJupiterRecurringOrder(
  orderId: string,
  feePayer: string,
  signer: string,
): Promise<{ transaction: string }> {
  const response = await jupiterFetch<{ serializedTransaction: string }>(
    "/recurring/v1/cancelOrder",
    {
      method: "POST",
      body: {
        orderId,
        feePayer,
        owner: signer,
      },
    },
  );
  return { transaction: response.serializedTransaction };
}
