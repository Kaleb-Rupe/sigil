/**
 * Drift Protocol compose functions — Kit-native via compat bridge.
 *
 * Uses dynamic import for @drift-labs/sdk (optional dependency).
 * Each function: takes Kit-native types → converts via compat bridge →
 * calls Drift SDK → converts result back via toKitInstruction().
 *
 * Reference: sdk/typescript/src/integrations/drift.ts (715 lines)
 */

import type { Instruction } from "@solana/kit";
import type { ProtocolContext, ProtocolComposeResult } from "./protocol-handler.js";
import { toKitInstruction, toKitAddress } from "../compat.js";

// ─── Precision Constants ────────────────────────────────────────────────────

/** USDC/quote precision: 10^6 */
export const DRIFT_QUOTE_PRECISION = 1_000_000;
/** Perp base asset precision: 10^9 */
export const DRIFT_BASE_PRECISION = 1_000_000_000;
/** Price precision: 10^6 */
export const DRIFT_PRICE_PRECISION = 1_000_000;

// ─── Lazy SDK Import ────────────────────────────────────────────────────────

let _driftSdk: any = null;

async function getDriftSdk(): Promise<any> {
  if (!_driftSdk) {
    try {
      // Dynamic import — @drift-labs/sdk is optional, may not be installed
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — optional dependency, resolved at runtime
      _driftSdk = await import("@drift-labs/sdk");
    } catch {
      throw new Error(
        "@drift-labs/sdk is not installed. Run: npm install @drift-labs/sdk",
      );
    }
  }
  return _driftSdk;
}

// ─── DriftClient Cache ──────────────────────────────────────────────────────

let _cachedClient: any = null;

async function getOrCreateDriftClient(
  ctx: ProtocolContext,
): Promise<any> {
  if (_cachedClient) return _cachedClient;

  const sdk = await getDriftSdk();

  // We need a web3.js Connection for the Drift SDK. Import dynamically.
  let Connection: any;
  try {
    // @ts-ignore — optional dependency, resolved at runtime
    const web3 = await import("@solana/web3.js");
    Connection = web3.Connection;
  } catch {
    throw new Error(
      "@solana/web3.js is required for Drift integration. It should be installed as an optional dependency.",
    );
  }

  const endpoint = ctx.network === "devnet"
    ? "https://api.devnet.solana.com"
    : "https://api.mainnet-beta.solana.com";

  const connection = new Connection(endpoint);
  const env = ctx.network === "devnet" ? "devnet" : "mainnet-beta";
  sdk.initialize({ env });

  // Minimal wallet adapter for Drift SDK
  const wallet = {
    publicKey: { toBase58: () => ctx.agent },
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs,
  };

  const client = new sdk.DriftClient({
    connection,
    wallet,
    env,
    accountSubscription: {
      type: "polling",
      accountLoader: new sdk.BulkAccountLoader(connection, "confirmed", 5000),
    },
  });

  await client.subscribe();
  _cachedClient = client;
  return client;
}

// ─── Helper: Build Drift Types ──────────────────────────────────────────────

function buildDriftOrderType(sdk: any, type: string): any {
  switch (type) {
    case "market": return sdk.OrderType.MARKET;
    case "limit": return sdk.OrderType.LIMIT;
    case "triggerMarket": return sdk.OrderType.TRIGGER_MARKET;
    case "triggerLimit": return sdk.OrderType.TRIGGER_LIMIT;
    default: throw new Error(`Unknown Drift order type: ${type}`);
  }
}

function buildDriftDirection(sdk: any, side: "long" | "short"): any {
  return side === "long"
    ? sdk.PositionDirection.LONG
    : sdk.PositionDirection.SHORT;
}

// ─── Compose Functions ──────────────────────────────────────────────────────

export async function composeDriftDeposit(
  ctx: ProtocolContext,
  params: Record<string, unknown>,
): Promise<ProtocolComposeResult> {
  const sdk = await getDriftSdk();
  const client = await getOrCreateDriftClient(ctx);

  const amount = BigInt(params.amount as string);
  const marketIndex = params.marketIndex as number;
  const subAccountId = (params.subAccountId as number) ?? 0;

  const ix = await client.getDepositIx(
    new sdk.BN(amount.toString()),
    marketIndex,
    undefined, // userTokenAccount — SDK resolves
    subAccountId,
  );

  return { instructions: [toKitInstruction(ix)] };
}

export async function composeDriftWithdraw(
  ctx: ProtocolContext,
  params: Record<string, unknown>,
): Promise<ProtocolComposeResult> {
  const sdk = await getDriftSdk();
  const client = await getOrCreateDriftClient(ctx);

  const amount = BigInt(params.amount as string);
  const marketIndex = params.marketIndex as number;
  const subAccountId = (params.subAccountId as number) ?? 0;

  const ix = await client.getWithdrawIx(
    new sdk.BN(amount.toString()),
    marketIndex,
    undefined,
    false, // reduceOnly
    subAccountId,
  );

  return { instructions: [toKitInstruction(ix)] };
}

export async function composeDriftPlacePerpOrder(
  ctx: ProtocolContext,
  params: Record<string, unknown>,
): Promise<ProtocolComposeResult> {
  const sdk = await getDriftSdk();
  const client = await getOrCreateDriftClient(ctx);

  const marketIndex = params.marketIndex as number;
  const side = params.side as "long" | "short";
  const amount = BigInt(params.amount as string);
  const price = params.price ? BigInt(params.price as string) : undefined;
  const orderType = params.orderType as string;

  const orderParams = {
    orderType: buildDriftOrderType(sdk, orderType),
    marketIndex,
    direction: buildDriftDirection(sdk, side),
    baseAssetAmount: new sdk.BN(amount.toString()),
    price: price ? new sdk.BN(price.toString()) : undefined,
    marketType: sdk.MarketType.PERP,
  };

  const ix = await client.getPlacePerpOrderIx(orderParams);
  return { instructions: [toKitInstruction(ix)] };
}

export async function composeDriftPlaceSpotOrder(
  ctx: ProtocolContext,
  params: Record<string, unknown>,
): Promise<ProtocolComposeResult> {
  const sdk = await getDriftSdk();
  const client = await getOrCreateDriftClient(ctx);

  const marketIndex = params.marketIndex as number;
  const side = params.side as "long" | "short";
  const amount = BigInt(params.amount as string);
  const price = params.price ? BigInt(params.price as string) : undefined;
  const orderType = params.orderType as string;

  const orderParams = {
    orderType: buildDriftOrderType(sdk, orderType),
    marketIndex,
    direction: buildDriftDirection(sdk, side),
    baseAssetAmount: new sdk.BN(amount.toString()),
    price: price ? new sdk.BN(price.toString()) : undefined,
    marketType: sdk.MarketType.SPOT,
  };

  const ix = await client.getPlaceSpotOrderIx(orderParams);
  return { instructions: [toKitInstruction(ix)] };
}

export async function composeDriftCancelOrder(
  ctx: ProtocolContext,
  params: Record<string, unknown>,
): Promise<ProtocolComposeResult> {
  const sdk = await getDriftSdk();
  const client = await getOrCreateDriftClient(ctx);

  const orderId = params.orderId as number;
  const ix = await client.getCancelOrderIx(orderId);
  return { instructions: [toKitInstruction(ix)] };
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

const COMPOSE_MAP: Record<
  string,
  (ctx: ProtocolContext, params: Record<string, unknown>) => Promise<ProtocolComposeResult>
> = {
  deposit: composeDriftDeposit,
  withdraw: composeDriftWithdraw,
  placePerpOrder: composeDriftPlacePerpOrder,
  placeSpotOrder: composeDriftPlaceSpotOrder,
  cancelOrder: composeDriftCancelOrder,
};

/**
 * Dispatch a Drift action to the correct compose function.
 * Called by DriftHandler.compose().
 */
export async function dispatchDriftCompose(
  ctx: ProtocolContext,
  action: string,
  params: Record<string, unknown>,
): Promise<ProtocolComposeResult> {
  const composeFn = COMPOSE_MAP[action];
  if (!composeFn) {
    throw new Error(
      `Unsupported Drift action: ${action}. Supported: ${Object.keys(COMPOSE_MAP).join(", ")}`,
    );
  }
  return composeFn(ctx, params);
}
