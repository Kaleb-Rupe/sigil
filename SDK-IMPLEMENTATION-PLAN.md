# Phalnx SDK Implementation Plan — Persona Gap Resolution

> **Version:** 1.0 | **Date:** 2026-03-25
> **Source:** 6-persona usability audit (Marcus/Developer, Elena/Agent Builder, Jake/Protocol Integrator, David/Treasury, Sarah/Risk Manager, Rook/Auditor)
> **Scope:** 17 gaps across P0 (blocking), P1 (limits usability), P2 (nice to have)
> **Constraint:** No changesets created by this plan -- project is not live. Publishing infra only.
> **Prerequisite:** All work happens on `feat/wrap-architecture` or a child branch.

---

## Status Key

- [ ] Not started
- [x] Complete
- [~] In progress

---

## P0 -- Blocking Adoption (Must Ship First)

These four items prevent every persona from using the SDK at all. Nothing in P1/P2 matters until P0 ships.

---

### Step 1: npm Publishing Pipeline Verification

- [ ] **1a.** Verify OIDC Trusted Publishing is configured for all 7 packages on npmjs.com
- [ ] **1b.** Verify `pnpm -r run build` succeeds for all packages (CI does this, but confirm locally)
- [ ] **1c.** Create a test changeset, push to `main`, confirm Version Packages PR opens
- [ ] **1d.** Merge Version Packages PR, confirm packages appear on npmjs.com with provenance

**WHAT:** Validate the existing CI pipeline (`release.yml`) end-to-end. No code changes -- this is operational verification.

**WHERE:**
- `.github/workflows/release.yml` (already written, dual-job check+release with OIDC)
- `.changeset/config.json` (already configured: `access: "public"`, `baseBranch: "main"`)
- npmjs.com package settings for each `@phalnx/*` package

**WHY:** Every persona (Marcus, Elena, Jake, David, Sarah, Rook) reported "can't npm install." The release pipeline exists in CI but has never been triggered on a real merge to `main`. The changeset config, OIDC permissions, and dual-job workflow are all in place -- the gap is that no changeset has been consumed.

**HOW:**
The pipeline is already built:
1. `release.yml` runs on push to `main`, checks for `.changeset/*.md` files or unpublished version bumps
2. If changesets exist: `changesets/action` opens a Version Packages PR (bumps versions, generates CHANGELOG)
3. If no changesets but versions are ahead of npm: publishes with `pnpm changeset publish` + OIDC provenance
4. Each package needs Trusted Publishing configured on npmjs.com: repo `Kaleb-Rupe/phalnx`, workflow `release.yml`, environment `production`

**Packages to publish (7):**

| Package | Path | Version | Peer Dependencies |
|---------|------|---------|-------------------|
| `@phalnx/core` | `sdk/core` | 0.1.5 | none |
| `@phalnx/kit` | `sdk/kit` | 0.1.0 | `@solana/kit ^6.2.0` |
| `@phalnx/platform` | `sdk/platform` | 0.1.4 | none |
| `@phalnx/custody-crossmint` | `sdk/custody/crossmint` | 0.1.4 | none |
| `@phalnx/custody-privy` | `sdk/custody/privy` | 0.1.0 | none |
| `@phalnx/custody-turnkey` | `sdk/custody/turnkey` | 0.1.0 | none |
| `@phalnx/plugin-solana-agent-kit` | `packages/plugin-solana-agent-kit` | 0.1.0 | none |

**Acceptance criteria:** `npm view @phalnx/kit` returns valid package metadata with provenance attestation.

---

### Step 2: README + Getting Started Guide for @phalnx/kit

- [ ] **2a.** Create `sdk/kit/README.md` with install, quickstart, API overview, architecture diagram
- [ ] **2b.** Include 30-line code example: createVault -> wrap Jupiter swap -> executeAndConfirm -> getPnL
- [ ] **2c.** Document all public exports organized by category (matching `index.ts` section headers)
- [ ] **2d.** Link to full docs, examples directory, and API reference

**WHAT:** Create a README that takes a developer from zero to a wrapped Jupiter swap in under 10 minutes.

**WHERE:** `sdk/kit/README.md` (new file -- currently missing)

**WHY:** Marcus (Developer persona) said "I'd spend 2-3 hours reading source code to understand the integration path." Elena (Agent Builder) said this is her "give-up threshold." The SDK has 534 lines of exports in `index.ts` across 25 module categories. Without a README, the only way to discover the API is reading source.

**HOW:**

```
# @phalnx/kit

Kit-native TypeScript SDK for Phalnx — on-chain spending limits and
permission policies for AI agent wallets on Solana.

## Install

npm install @phalnx/kit @solana/kit

## Quickstart

[30-line example showing full flow]

## API Overview

### Core (wrap + execute)
- `PhalnxClient` — stateful client, recommended for production
- `wrap()` — stateless function for single-use wrapping
- `createVault()` — provision an on-chain vault
- `buildOwnerTransaction()` — owner-side tx builder (deposit, freeze, policy)

### State Resolution
- `resolveVaultState()` — fetch complete vault state in one call
- `resolveVaultBudget()` — per-agent budget with remaining headroom

### Analytics
- Security: `getSecurityPosture()`, `getAuditTrail()`
- Spending: `getSpendingVelocity()`, `getSpendingBreakdown()`
- Agents: `getAgentProfile()`, `getAgentLeaderboard()`
- Portfolio: `getPortfolioOverview()`, `getCrossVaultAgentRanking()`

### Safety
- `simulateBeforeSend()` — pre-flight simulation with drain detection
- `shield()` — client-side policy enforcement
- `toAgentError()` — structured error translation for AI agents

[... etc for each section in index.ts ...]

## Architecture

Phalnx wraps arbitrary DeFi instructions with security:
[validate_and_authorize, ...defiInstructions, finalize_session]

All succeed or all revert atomically. The SDK handles instruction
composition, ATA rewriting, ALT compression, and pre-flight checks.

## Testing

import { createMockRpc, createMockVaultState } from "@phalnx/kit/testing"
```

The quickstart example must demonstrate the COMPLETE flow:

```typescript
import { PhalnxClient, createVault, buildOwnerTransaction } from "@phalnx/kit";
import { createSolanaRpc, generateKeyPairSigner, address } from "@solana/kit";

// 1. Create vault (owner operation)
const rpc = createSolanaRpc("https://api.devnet.solana.com");
const vaultResult = await createVault({
  rpc, network: "devnet", owner, agent,
  dailySpendingCapUsd: 500_000_000n, // $500
});
const ownerTx = await buildOwnerTransaction({
  rpc, network: "devnet", owner,
  instructions: [vaultResult.initializeVaultIx, vaultResult.registerAgentIx],
});
// ... sign and send ownerTx with wallet adapter ...

// 2. Wrap a Jupiter swap (agent operation)
const client = new PhalnxClient({
  rpc, vault: vaultResult.vaultAddress, agent, network: "devnet",
});
const jupiterInstructions = /* from Jupiter /swap-instructions API */;
const { signature } = await client.executeAndConfirm(jupiterInstructions, {
  tokenMint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  amount: 100_000_000n, // $100 in USDC base units (6 decimals)
  actionType: ActionType.Swap,
  protocolAltAddresses: jupiterResponse.addressLookupTableAddresses,
});

// 3. Check P&L
const pnl = await client.getPnL();
```

**Acceptance criteria:** A developer can copy-paste the quickstart and modify only their keypairs and RPC URL to get a working integration.

---

### Step 3: Jupiter Integration Example

- [ ] **3a.** Create `sdk/kit/examples/jupiter-swap.ts`
- [ ] **3b.** Show complete flow: fetch Jupiter quote -> get swap-instructions -> extract ALTs -> wrap -> execute
- [ ] **3c.** Include error handling and drain detection
- [ ] **3d.** Add inline comments explaining every non-obvious step

**WHAT:** A runnable example file that demonstrates the #1 integration path: Jupiter swap via Phalnx.

**WHERE:** `sdk/kit/examples/jupiter-swap.ts` (new file -- `examples/` directory does not exist)

**WHY:** Marcus (Developer) identified Jupiter as THE critical integration path. The SDK's `wrap()` takes Kit `Instruction[]` but Jupiter's API returns a different format. The conversion path (Jupiter response -> Kit Instruction -> wrap) has zero documentation. Marcus: "Where's the type bridge?"

**HOW:**

```typescript
// sdk/kit/examples/jupiter-swap.ts
//
// Complete example: Wrap a Jupiter V6 swap with Phalnx security.
// Prerequisites: deployed vault, funded with USDC, agent registered.

import {
  PhalnxClient,
  ActionType,
  toAgentError,
  simulateBeforeSend,
  USDC_MINT_DEVNET,
} from "@phalnx/kit";
import { address, createSolanaRpc } from "@solana/kit";
import type { Address, Instruction } from "@solana/kit";

// ---- Configuration ----
const VAULT = address("YOUR_VAULT_ADDRESS");
const RPC_URL = "https://api.devnet.solana.com";
const INPUT_MINT = USDC_MINT_DEVNET;
const OUTPUT_MINT = address("So11111111111111111111111111111111111111112"); // SOL
const AMOUNT_LAMPORTS = 10_000_000; // $10 USDC

async function main() {
  const rpc = createSolanaRpc(RPC_URL);
  const agent = /* your agent TransactionSigner */;

  // Step 1: Get Jupiter quote
  const quoteResponse = await fetch(
    `https://quote-api.jup.ag/v6/quote?` +
    `inputMint=${INPUT_MINT}&outputMint=${OUTPUT_MINT}` +
    `&amount=${AMOUNT_LAMPORTS}&slippageBps=50`
  ).then(r => r.json());

  // Step 2: Get swap instructions (NOT /swap — we need raw instructions)
  //
  // CRITICAL: Use /swap-instructions, not /swap.
  // /swap returns a serialized transaction (unusable with wrap).
  // /swap-instructions returns individual instructions we can compose.
  const swapInstructionsResponse = await fetch(
    "https://quote-api.jup.ag/v6/swap-instructions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey: agent.address,
        // Do NOT set wrapAndUnwrapSol — Phalnx handles token accounts
      }),
    }
  ).then(r => r.json());

  // Step 3: Convert Jupiter instructions to Kit format
  //
  // Jupiter returns base64-encoded instructions. Convert to Kit Instruction[].
  // wrap() will: strip ComputeBudget/System ixs, rewrite agent ATAs to vault ATAs,
  // and sandwich with validate_and_authorize + finalize_session.
  const jupiterInstructions: Instruction[] = [
    ...deserializeJupiterIxs(swapInstructionsResponse.setupInstructions ?? []),
    deserializeJupiterIx(swapInstructionsResponse.swapInstruction),
    ...(swapInstructionsResponse.cleanupInstruction
      ? [deserializeJupiterIx(swapInstructionsResponse.cleanupInstruction)]
      : []),
  ];

  // Step 4: Extract ALT addresses from Jupiter response
  //
  // Jupiter routes use address lookup tables that rotate per-route.
  // Always pass fresh values — never cache these.
  const protocolAltAddresses: Address[] = (
    swapInstructionsResponse.addressLookupTableAddresses ?? []
  ).map((a: string) => address(a));

  // Step 5: Wrap and execute
  const client = new PhalnxClient({
    rpc,
    vault: VAULT,
    agent,
    network: "devnet",
  });

  try {
    const { signature, wrapResult } = await client.executeAndConfirm(
      jupiterInstructions,
      {
        tokenMint: INPUT_MINT,
        amount: BigInt(AMOUNT_LAMPORTS), // USDC base units (6 decimals = USD)
        actionType: ActionType.Swap,
        protocolAltAddresses,
      }
    );

    console.log(`Swap executed: ${signature}`);
    console.log(`Warnings: ${wrapResult.warnings.join(", ") || "none"}`);

    // Step 6: Check vault P&L
    const pnl = await client.getPnL();
    console.log(`Vault P&L: ${pnl.pnl} (${pnl.pnlPercent}%)`);
  } catch (err) {
    // Structured error for AI agent consumption
    const agentError = toAgentError(err);
    console.error(`[${agentError.category}] ${agentError.message}`);
    console.error(`Retryable: ${agentError.retryable}`);
    for (const action of agentError.recovery_actions) {
      console.error(`  Recovery: ${action.description}`);
    }
  }
}

// ---- Jupiter instruction deserialization helpers ----
// (These would be in a shared utility in production)

function deserializeJupiterIx(ix: {
  programId: string;
  accounts: Array<{ pubkey: string; isSigner: boolean; isWritable: boolean }>;
  data: string;
}): Instruction {
  return {
    programAddress: address(ix.programId),
    accounts: ix.accounts.map((a) => ({
      address: address(a.pubkey),
      role: a.isWritable
        ? a.isSigner ? 3 /* WRITABLE_SIGNER */ : 2 /* WRITABLE */
        : a.isSigner ? 1 /* READONLY_SIGNER */ : 0 /* READONLY */,
    })),
    data: Buffer.from(ix.data, "base64"),
  };
}

function deserializeJupiterIxs(
  ixs: Array<Parameters<typeof deserializeJupiterIx>[0]>
): Instruction[] {
  return ixs.map(deserializeJupiterIx);
}
```

Key design decisions in this example:
- Uses `/swap-instructions` not `/swap` (the most common Jupiter integration mistake)
- Shows the `AccountRole` numeric mapping explicitly (Kit uses numeric roles, not boolean flags)
- Demonstrates `protocolAltAddresses` passthrough (critical for tx size)
- Includes `toAgentError()` error handling (bridges wrap errors to AI agent consumption)

**Acceptance criteria:** Example compiles with `tsc --noEmit`. A developer can adapt it by changing only `VAULT`, `RPC_URL`, and agent signer.

---

### Step 4: `createAndSendVault()` Convenience for Vault Creation

- [ ] **4a.** Add `createAndSendVault()` to `sdk/kit/src/create-vault.ts`
- [ ] **4b.** Composes createVault instructions -> buildOwnerTransaction -> signAndEncode -> sendAndConfirmTransaction
- [ ] **4c.** Returns `CreateAndSendVaultResult` with vault address, signature, and all PDAs
- [ ] **4d.** Add tests in `sdk/kit/tests/create-vault.test.ts`

**WHAT:** A self-contained function that goes from options to confirmed on-chain vault in one call.

**WHERE:** `sdk/kit/src/create-vault.ts` (extend existing file)

**WHY:** Marcus and Elena both identified the gap between `createVault()` (returns raw instructions) and a confirmed transaction as the #1 DX wall. Currently requires 8 manual steps:
1. Call `createVault()` to get instructions
2. Call `buildOwnerTransaction()` with those instructions
3. Extract the compiled transaction
4. Call `signAndEncode()` with the owner signer
5. Call `sendAndConfirmTransaction()` with the encoded bytes
6. Handle errors
7. Return the vault address

Option A (export `sendKitTransaction()` from testing) was rejected because testing utilities import `node:fs` and `@solana/web3.js`, breaking browser bundlers. The `@phalnx/kit/testing` subpath export exists specifically to isolate these.

Option B (self-contained `createAndSendVault()`) matches the `PhalnxClient.executeAndConfirm()` pattern and keeps the main import path browser-safe.

**HOW:**

```typescript
// Added to sdk/kit/src/create-vault.ts

export interface CreateAndSendVaultOptions extends CreateVaultOptions {
  /** Priority fee in microLamports per CU. Default: 0. */
  priorityFeeMicroLamports?: number;
  /** Override compute units. Default: CU_VAULT_CREATION (400,000). */
  computeUnits?: number;
  /** Confirmation options. */
  confirmOptions?: SendAndConfirmOptions;
}

export interface CreateAndSendVaultResult extends CreateVaultResult {
  /** Transaction signature. */
  signature: string;
}

export async function createAndSendVault(
  options: CreateAndSendVaultOptions,
): Promise<CreateAndSendVaultResult> {
  // 1. Build instructions
  const result = await createVault(options);

  // 2. Compose into owner transaction
  const ownerTx = await buildOwnerTransaction({
    rpc: options.rpc,
    owner: options.owner,
    instructions: [result.initializeVaultIx, result.registerAgentIx],
    network: options.network,
    computeUnits: options.computeUnits,
    priorityFeeMicroLamports: options.priorityFeeMicroLamports,
  });

  // 3. Sign and send
  const encoded = await signAndEncode(options.owner, ownerTx.transaction);
  const signature = await sendAndConfirmTransaction(
    options.rpc,
    encoded,
    options.confirmOptions,
  );

  return { ...result, signature };
}
```

New imports needed: `buildOwnerTransaction` from `./owner-transaction.js`, `signAndEncode`/`sendAndConfirmTransaction` from `./rpc-helpers.js`.

Also export from `index.ts`:
```typescript
export { createVault, createAndSendVault } from "./create-vault.js";
export type { CreateVaultOptions, CreateVaultResult, CreateAndSendVaultOptions, CreateAndSendVaultResult } from "./create-vault.js";
```

**Acceptance criteria:** `await createAndSendVault({ rpc, network: "devnet", owner, agent })` returns a confirmed vault address in one call.

---

## P1 -- Limits Usability

These items do not prevent adoption but create friction, confusion, or force workarounds.

---

### Step 5: WrapParams JSDoc Documentation

- [ ] **5a.** Add JSDoc to `amount` field explaining unit semantics
- [ ] **5b.** Add JSDoc to `tokenMint` field explaining vault-relative meaning
- [ ] **5c.** Add JSDoc to `actionType` field with variant reference
- [ ] **5d.** Add JSDoc to `outputStablecoinAccount` explaining non-stablecoin flow

**WHAT:** Add precise JSDoc to the `WrapParams` interface fields that have non-obvious semantics.

**WHERE:** `sdk/kit/src/wrap.ts`, lines 75-102 (`WrapParams` interface)

**WHY:** Marcus (Developer) asked "what unit? USD base units? Token base units? Lamports?" The `amount` field accepts `bigint` with no documentation of its semantics, which change based on whether `tokenMint` is a stablecoin. This is the kind of ambiguity that causes silent financial errors.

**HOW:**

```typescript
export interface WrapParams {
  /** On-chain vault address (PDA). */
  vault: Address;
  /** Agent signer -- must be registered in the vault's agent list. */
  agent: TransactionSigner;
  /** DeFi instructions to wrap. ComputeBudget and System instructions are stripped automatically. */
  instructions: Instruction[];
  /** RPC client for state resolution and blockhash fetching. */
  rpc: Rpc<SolanaRpcApi>;
  /** Network identifier. Accepts "devnet" or "mainnet" (normalized to "mainnet-beta" internally). */
  network: "devnet" | "mainnet";
  /**
   * The token mint being spent FROM the vault.
   *
   * For swaps: the input mint (what leaves the vault).
   * For transfers: the transferred token's mint.
   *
   * The SDK uses this to derive the vault's ATA and rewrite agent ATAs
   * in the DeFi instructions to point at the vault's token account.
   */
  tokenMint: Address;
  /**
   * Amount in the token's native base units.
   *
   * - Stablecoin input (USDC/USDT): base units = USD with 6 decimals.
   *   Example: $100 USDC = 100_000_000n (100 * 10^6).
   *
   * - Non-stablecoin input (SOL, BONK, etc.): raw token base units.
   *   Example: 1 SOL = 1_000_000_000n (10^9 lamports).
   *   Non-stablecoin amounts are NOT cap-checked (by design) --
   *   finalize_session measures actual stablecoin balance delta instead.
   *
   * For spending actions, must be > 0.
   * For non-spending actions (close, withdraw, etc.), must be 0.
   */
  amount: bigint;
  /**
   * DeFi action type. Determines permission check and spending classification.
   * Defaults to `ActionType.Swap` if omitted.
   *
   * 9 spending actions: Swap, OpenPosition, IncreasePosition, Deposit,
   *   Transfer, AddCollateral, PlaceLimitOrder, SwapAndOpenPosition, CreateEscrow.
   *
   * 12 non-spending actions: ClosePosition, DecreasePosition, Withdraw,
   *   RemoveCollateral, PlaceTriggerOrder, EditTriggerOrder, CancelTriggerOrder,
   *   EditLimitOrder, CancelLimitOrder, CloseAndSwapPosition, SettleEscrow, RefundEscrow.
   *
   * Escrow actions (Create/Settle/Refund) use standalone instructions, not wrap().
   */
  actionType?: ActionType;
  // ... remaining fields already documented or obvious
}
```

**Acceptance criteria:** Hovering over any `WrapParams` field in an IDE shows documentation that answers "what unit?" and "what does this mean?" without reading source.

---

### Step 6: Network Type Normalization

- [ ] **6a.** Export `normalizeNetwork()` from `sdk/kit/src/types.ts`
- [ ] **6b.** Accept `"mainnet"` in all public functions that currently require `"mainnet-beta"`
- [ ] **6c.** Add overload to `validateNetwork()` that accepts the short form
- [ ] **6d.** Add tests for normalization edge cases

**WHAT:** Eliminate the foot-gun where `PhalnxClient` accepts `"mainnet"` but standalone functions require `"mainnet-beta"`.

**WHERE:**
- `sdk/kit/src/types.ts` (add export, widen `Network` type)
- `sdk/kit/src/wrap.ts` (already has internal `normalizeNetwork()` -- remove, use shared one)
- `sdk/kit/src/owner-transaction.ts` (same)

**WHY:** Marcus identified this as a foot-gun. The type `Network = "devnet" | "mainnet-beta"` is used by state-resolver, analytics, and all pure functions. But `PhalnxClient`, `wrap()`, and `buildOwnerTransaction()` accept `"devnet" | "mainnet"`. The internal `normalizeNetwork()` exists in two files (wrap.ts:123, owner-transaction.ts:78) but is not exported. A developer who reads types.ts sees `Network` requires `"mainnet-beta"`, then passes it to `PhalnxClient` which rejects it.

**HOW:**

In `sdk/kit/src/types.ts`:

```typescript
/** Solana network identifier. Canonical form uses "mainnet-beta". */
export type Network = "devnet" | "mainnet-beta";

/** Short-form network accepted by public APIs. Normalized internally. */
export type NetworkInput = "devnet" | "mainnet" | "mainnet-beta";

/** Convert short-form network to canonical Network type.
 *  "mainnet" -> "mainnet-beta", all others pass through. */
export function normalizeNetwork(network: NetworkInput): Network {
  return network === "mainnet" ? "mainnet-beta" : network as Network;
}
```

Then update `validateNetwork()` to accept `NetworkInput`:

```typescript
export function validateNetwork(network: string): asserts network is Network {
  const normalized = network === "mainnet" ? "mainnet-beta" : network;
  if (normalized !== "devnet" && normalized !== "mainnet-beta") {
    throw new Error(`Invalid network: "${network}". Must be "devnet", "mainnet", or "mainnet-beta".`);
  }
}
```

Remove the duplicate `normalizeNetwork()` from `wrap.ts` (line 123) and `owner-transaction.ts` (line 78). Import from `types.js` instead.

**Acceptance criteria:** `resolveVaultState(rpc, vault, agent, undefined, "mainnet")` works without error. `normalizeNetwork` appears in `@phalnx/kit` exports.

---

### Step 7: `getAuditTrail()` Enhancement

- [ ] **7a.** Add `category` filter parameter to `getAuditTrail()`
- [ ] **7b.** Add `txSignature` population from event metadata when available
- [ ] **7c.** Add `getAuditTrailSummary()` for high-level counts
- [ ] **7d.** Add tests

**WHAT:** Enhance the existing `getAuditTrail()` with filtering and summary capabilities.

**WHERE:** `sdk/kit/src/security-analytics.ts` (line 410, existing function)

**WHY:** Rook (Auditor) and David (Treasury) both need audit trail filtering. The function exists (line 410-430) but:
- No category filtering -- callers must filter the returned array manually
- `txSignature` is always empty string (`""`) -- the function receives `DecodedPhalnxEvent[]` which lacks tx context
- No summary view -- auditors need "5 policy changes, 2 emergencies" at a glance

The implementation was found to already exist with correct event categorization (22 event types mapped to 5 categories). The gap is in filtering and metadata.

**HOW:**

```typescript
// Enhanced signature
export function getAuditTrail(
  events: DecodedPhalnxEvent[],
  options?: {
    /** Filter to specific categories. If omitted, returns all. */
    categories?: AuditEntry["category"][];
    /** Filter to events after this Unix timestamp. */
    since?: number;
    /** Filter to events by a specific actor address. */
    actor?: Address;
  },
): AuditEntry[] {
  const trail: AuditEntry[] = [];

  for (const e of events) {
    const category = AUDIT_EVENTS[e.name];
    if (!category) continue;

    // Category filter
    if (options?.categories && !options.categories.includes(category)) continue;

    const f = e.fields ?? {};
    const timestamp = Number((f.timestamp as bigint) ?? 0n);

    // Time filter
    if (options?.since && timestamp < options.since) continue;

    const actor = ((f.owner ?? f.agent ?? "unknown") as string) as Address;

    // Actor filter
    if (options?.actor && actor !== options.actor) continue;

    trail.push({
      timestamp,
      txSignature: (e as { txSignature?: string }).txSignature ?? "",
      category,
      action: e.name,
      actor,
      details: f,
      description: describeEvent(e),
    });
  }

  return trail;
}

// New summary function
export interface AuditTrailSummary {
  totalEntries: number;
  byCategory: Record<AuditEntry["category"], number>;
  latestTimestamp: number;
  uniqueActors: Address[];
}

export function getAuditTrailSummary(trail: AuditEntry[]): AuditTrailSummary {
  const byCategory: Record<string, number> = {
    policy_change: 0,
    agent_change: 0,
    emergency: 0,
    escrow: 0,
    constraint_change: 0,
  };
  const actors = new Set<string>();
  let latest = 0;

  for (const entry of trail) {
    byCategory[entry.category]++;
    actors.add(entry.actor);
    if (entry.timestamp > latest) latest = entry.timestamp;
  }

  return {
    totalEntries: trail.length,
    byCategory: byCategory as Record<AuditEntry["category"], number>,
    latestTimestamp: latest,
    uniqueActors: Array.from(actors) as Address[],
  };
}
```

Add exports to `index.ts`:
```typescript
export { getSecurityPosture, evaluateAlertConditions, getAuditTrail, getAuditTrailSummary } from "./security-analytics.js";
export type { SecurityPosture, SecurityCheck, Alert, AuditEntry, AuditTrailSummary } from "./security-analytics.js";
```

**Acceptance criteria:** `getAuditTrail(events, { categories: ["emergency"] })` returns only emergency events. `getAuditTrailSummary()` returns per-category counts.

---

### Step 8: 4 Missing Security Posture Checks

- [ ] **8a.** Add "timelock-short" check: timelock < 3600 (1 hour) -> WARNING
- [ ] **8b.** Add "fee-rate-edge" check: developerFeeRate at max (500) or 0 -> INFO
- [ ] **8c.** Add "stale-constraints" check: constraint references programs not in allowlist -> WARNING
- [ ] **8d.** Add "permission-concentration" check: single agent has >15 of 21 bits -> WARNING
- [ ] **8e.** Add tests for all 4 new checks

**WHAT:** Expand the 13-point security checklist to 17 points.

**WHERE:** `sdk/kit/src/security-analytics.ts`, `getSecurityPosture()` function (line 65-208)

**WHY:** Rook (Auditor) found these gaps during the 13-point checklist review. The existing checks catch severe misconfiguration (no cap, full permissions, system program fee destination) but miss nuanced risks:
- A 1-second timelock technically "passes" the timelock check but provides zero protection
- A developer fee rate at max (500 = 5 BPS) could indicate a compromised vault setup
- Constraints referencing programs outside the allowlist are dead rules that create false confidence
- An agent with 16 of 21 permission bits is effectively unrestricted (only missing 5 niche actions)

**HOW:**

Add after line 200 (the `recent-activity` check), before the closing of the `checks` array:

```typescript
    // ---- New checks (Step 8) ----
    {
      id: "timelock-meaningful",
      label: "Timelock is at least 1 hour",
      passed: policy.timelockDuration === 0n || policy.timelockDuration >= 3600n,
      severity: "warning",
      detail:
        "A timelock under 1 hour may not provide enough reaction time if the owner key is compromised. " +
        "A zero timelock (disabled) is caught by the 'timelock-enabled' check above.",
      remediation:
        policy.timelockDuration > 0n && policy.timelockDuration < 3600n
          ? `Current timelock is ${Number(policy.timelockDuration)}s. Increase to at least 3600s (1 hour).`
          : null,
    },
    {
      id: "fee-rate-reasonable",
      label: "Developer fee rate is set and below maximum",
      passed: policy.developerFeeRate > 0 && policy.developerFeeRate < MAX_DEVELOPER_FEE_RATE,
      severity: "info",
      detail:
        "A zero fee rate means no developer revenue. " +
        "A max-rate (500 = 5 BPS) may indicate a default or compromised configuration.",
      remediation:
        policy.developerFeeRate === 0
          ? "Consider setting a developer fee rate if you intend to collect fees."
          : policy.developerFeeRate >= MAX_DEVELOPER_FEE_RATE
            ? "Developer fee rate is at the maximum (5 BPS). Verify this is intentional."
            : null,
    },
    {
      id: "constraints-protocol-aligned",
      label: "Constraint programs are in allowlist",
      passed: (() => {
        if (!constraints || policy.protocolMode !== PROTOCOL_MODE_ALLOWLIST) return true;
        const allowedSet = new Set(policy.protocols.map(String));
        for (const entry of constraints.entries) {
          if (entry.program && !allowedSet.has(String(entry.program))) return false;
        }
        return true;
      })(),
      severity: "warning",
      detail:
        "Instruction constraints reference program addresses not in the protocol allowlist. " +
        "These constraints will never trigger because the protocol is already blocked.",
      remediation: "Update the allowlist to include constrained programs, or remove stale constraints.",
    },
    {
      id: "no-permission-concentration",
      label: "No agent has more than 15 permissions",
      passed: !vault.agents.some((a) => countBits(a.permissions) > 15),
      severity: "warning",
      detail:
        "An agent with more than 15 of 21 permission bits is effectively unrestricted. " +
        "Use least-privilege — grant only the actions the agent's strategy requires.",
      remediation: "Review agent permissions and restrict to only necessary action types.",
    },
```

Also need to import `MAX_DEVELOPER_FEE_RATE` from types.ts and add a `countBits` helper:

```typescript
import { FULL_PERMISSIONS, PROTOCOL_MODE_ALLOWLIST, MAX_DEVELOPER_FEE_RATE } from "./types.js";

function countBits(n: bigint): number {
  let count = 0;
  let v = n;
  while (v > 0n) { count += Number(v & 1n); v >>= 1n; }
  return count;
}
```

**Acceptance criteria:** `getSecurityPosture(state).checks.length === 17`. Each new check has meaningful `remediation` text when it fails.

---

### Step 9: `stringsToPermissions()` Inverse Function

- [ ] **9a.** Add `stringsToPermissions()` to `sdk/kit/src/types.ts`
- [ ] **9b.** Export from `index.ts`
- [ ] **9c.** Add tests for round-trip: `stringsToPermissions(permissionsToStrings(x)) === x`
- [ ] **9d.** Validate inputs: throw on unknown action type strings

**WHAT:** The inverse of `permissionsToStrings()` -- convert human-readable action names to a bitmask.

**WHERE:** `sdk/kit/src/types.ts` (alongside existing `permissionsToStrings`, line 173)

**WHY:** Marcus said "I have to use raw bitmask math to set permissions." The SDK exports `permissionsToStrings(bigint): string[]` (line 173) and `PermissionBuilder` (line 198) but no `stringsToPermissions(string[]): bigint`. The PermissionBuilder requires chaining `.add()` calls. A simple `stringsToPermissions(["swap", "deposit"])` is the natural complement that every developer expects.

**HOW:**

```typescript
/**
 * Convert an array of action type strings to a permission bitmask.
 * Inverse of permissionsToStrings().
 *
 * @throws Error if any string is not a recognized action type.
 *
 * @example
 * stringsToPermissions(["swap", "deposit"]) // => 33n (bit 0 + bit 5)
 * stringsToPermissions(permissionsToStrings(PERPS_FULL)) === PERPS_FULL // true
 */
export function stringsToPermissions(strings: string[]): bigint {
  let result = 0n;
  for (const s of strings) {
    const bit = ACTION_PERMISSION_MAP[s];
    if (bit === undefined) {
      const valid = Object.keys(ACTION_PERMISSION_MAP).join(", ");
      throw new Error(
        `Unknown action type: "${s}". Valid types: ${valid}`,
      );
    }
    result |= bit;
  }
  return result;
}
```

Add to `index.ts` exports:
```typescript
export {
  // ... existing
  permissionsToStrings,
  stringsToPermissions,  // NEW
  // ...
} from "./types.js";
```

**Acceptance criteria:** `stringsToPermissions(["swap"]) === 1n`. Round-trip identity holds for all preset constants.

---

### Step 10: SDK-Level Error Categories in wrap()

- [ ] **10a.** Add `wrapError()` helper that converts any `Error` from `wrap()` into `AgentError`
- [ ] **10b.** Categorize known wrap() error patterns (vault not active, agent not registered, cap exceeded, etc.)
- [ ] **10c.** Apply `wrapError()` in `PhalnxClient.wrap()` and `PhalnxClient.executeAndConfirm()`
- [ ] **10d.** Add tests for each error category mapping

**WHAT:** Bridge the gap between `wrap()` throwing plain `Error` objects and `toAgentError()` which only handles on-chain error codes.

**WHERE:**
- `sdk/kit/src/agent-errors.ts` (add `wrapError()` function and SDK error patterns)
- `sdk/kit/src/wrap.ts` (apply in PhalnxClient methods)

**WHY:** Marcus said "there's no bridge between wrap() errors and toAgentError()." Currently:
- `wrap()` throws `new Error("Vault is not active ...")` -- plain string, no category, no recovery actions
- `toAgentError()` handles numeric on-chain codes (6000-6069) but not SDK-layer errors
- An AI agent catching a wrap() error gets zero structured metadata

The fix was determined by analyzing all `throw new Error(...)` sites in wrap.ts (10 distinct patterns) and mapping each to an appropriate `ErrorCategory` + `RecoveryAction[]`.

**HOW:**

In `sdk/kit/src/agent-errors.ts`, add:

```typescript
// ---------------------------------------------------------------------------
// SDK-layer error patterns (wrap() and friends)
// ---------------------------------------------------------------------------

interface SdkErrorPattern {
  pattern: RegExp;
  category: ErrorCategory;
  retryable: boolean;
  recovery_actions: RecoveryAction[];
}

const SDK_ERROR_PATTERNS: SdkErrorPattern[] = [
  {
    pattern: /Vault is not active/,
    category: "RESOURCE_NOT_FOUND",
    retryable: false,
    recovery_actions: [
      { action: "check_vault_status", description: "Verify vault status. It may be frozen or closed." },
      { action: "reactivate_vault", description: "If frozen, ask the vault owner to reactivate.", tool: "reactivateVault" },
    ],
  },
  {
    pattern: /Agent .+ is not registered/,
    category: "PERMISSION",
    retryable: false,
    recovery_actions: [
      { action: "register_agent", description: "Register this agent in the vault.", tool: "registerAgent" },
    ],
  },
  {
    pattern: /Agent .+ is paused/,
    category: "PERMISSION",
    retryable: false,
    recovery_actions: [
      { action: "unpause_agent", description: "Ask the vault owner to unpause this agent.", tool: "unpauseAgent" },
    ],
  },
  {
    pattern: /lacks permission for action/,
    category: "PERMISSION",
    retryable: false,
    recovery_actions: [
      { action: "update_permissions", description: "Request permission for this action type from the vault owner." },
    ],
  },
  {
    pattern: /Protocol .+ is not allowed/,
    category: "PROTOCOL_NOT_SUPPORTED",
    retryable: false,
    recovery_actions: [
      { action: "add_protocol", description: "Add this protocol to the vault's allowlist." },
    ],
  },
  {
    pattern: /exceeds remaining daily cap/,
    category: "SPENDING_CAP",
    retryable: true,
    recovery_actions: [
      { action: "reduce_amount", description: "Reduce the transaction amount to fit within remaining cap headroom." },
      { action: "wait", description: "Wait for the 24-hour rolling window to free up budget." },
    ],
  },
  {
    pattern: /Transaction size .+ exceeds/,
    category: "INPUT_VALIDATION",
    retryable: false,
    recovery_actions: [
      { action: "add_alts", description: "Pass protocolAltAddresses from your DeFi API response." },
      { action: "reduce_instructions", description: "Reduce instruction count or split across multiple transactions." },
    ],
  },
  {
    pattern: /Position limit reached/,
    category: "POLICY_VIOLATION",
    retryable: true,
    recovery_actions: [
      { action: "close_position", description: "Close an existing position before opening a new one." },
    ],
  },
  {
    pattern: /Spending action .+ requires amount > 0/,
    category: "INPUT_VALIDATION",
    retryable: false,
    recovery_actions: [
      { action: "fix_amount", description: "Set amount to the transaction value in token base units." },
    ],
  },
  {
    pattern: /Escrow action/,
    category: "INPUT_VALIDATION",
    retryable: false,
    recovery_actions: [
      { action: "use_escrow_api", description: "Use createEscrow/settleEscrow/refundEscrow instead of wrap()." },
    ],
  },
];

/**
 * Convert any error thrown by wrap() or PhalnxClient methods into a structured AgentError.
 *
 * Falls back to toAgentError() for on-chain errors (numeric codes),
 * then pattern-matches SDK error messages, then returns a generic FATAL.
 */
export function wrapError(err: unknown): AgentError {
  // Try on-chain error extraction first
  const onChain = toAgentError(err);
  if (onChain.code !== "UNKNOWN") return onChain;

  // Pattern-match SDK errors
  const message = err instanceof Error ? err.message : String(err);
  for (const p of SDK_ERROR_PATTERNS) {
    if (p.pattern.test(message)) {
      return {
        code: `SDK_${p.category}`,
        message,
        category: p.category,
        retryable: p.retryable,
        recovery_actions: p.recovery_actions,
        context: {},
      };
    }
  }

  // Fallback
  return {
    code: "UNKNOWN",
    message,
    category: "FATAL",
    retryable: false,
    recovery_actions: [],
    context: {},
  };
}
```

Export `wrapError` from `index.ts`. In `wrap.ts`, update `PhalnxClient.executeAndConfirm()`:

```typescript
async executeAndConfirm(/* ... */): Promise<ExecuteResult> {
  try {
    const result = await this.wrap(instructions, opts);
    const encoded = await signAndEncode(this.agent, result.transaction);
    const signature = await sendAndConfirmTransaction(this.rpc, encoded, opts.confirmOptions);
    return { signature, wrapResult: result };
  } catch (err) {
    throw wrapError(err); // re-throw as structured AgentError
  }
}
```

**Acceptance criteria:** Catching a `PhalnxClient.executeAndConfirm()` error yields an `AgentError` with `category`, `retryable`, and `recovery_actions` -- not a plain Error.

---

### Step 11: Cross-Vault Agent Ranking

- [ ] **11a.** Verify `getCrossVaultAgentRanking()` exists and handles the David persona use case
- [ ] **11b.** Add `getAgentLeaderboardAcrossVaults()` convenience wrapper if needed
- [ ] **11c.** Add tests for multi-vault, multi-agent scenarios

**WHAT:** Verify and potentially extend cross-vault agent comparison capability.

**WHERE:** `sdk/kit/src/portfolio-analytics.ts` (line 173, `getCrossVaultAgentRanking()`)

**WHY:** David (Treasury) needs to compare 5 bots across 3 vaults. The investigation revealed that `getCrossVaultAgentRanking()` ALREADY EXISTS (line 173-223) and does exactly this: it takes a `PortfolioOverview`, iterates all vaults' agent budgets, collects lifetime spend from overlays, and returns a ranked list sorted by 24h spend.

However, the current function requires a `PortfolioOverview` object (which requires RPC calls via `getPortfolioOverview()`). David may already have resolved vault states but not gone through the portfolio pipeline.

**HOW:**

Add a convenience overload in `portfolio-analytics.ts`:

```typescript
/**
 * Rank agents across multiple pre-resolved vault states.
 * Convenience wrapper when you have ResolvedVaultState[] but not a full PortfolioOverview.
 *
 * For the full portfolio pipeline, use getPortfolioOverview() + getCrossVaultAgentRanking().
 */
export function getAgentLeaderboardAcrossVaults(
  vaultStates: Array<{ address: Address; state: ResolvedVaultState }>,
): CrossVaultAgentRanking[] {
  const allAgents: CrossVaultAgentRanking[] = [];

  for (const { address: vaultAddress, state } of vaultStates) {
    for (const [agentAddr, budget] of state.allAgentBudgets) {
      const agentEntry = state.vault.agents.find((a) => a.pubkey === agentAddr);
      if (!agentEntry) continue;

      let lifetimeSpend = 0n;
      if (state.overlay) {
        const slotIdx = state.overlay.entries.findIndex((e) => {
          try { return bytesToAddress(e.agent) === agentAddr; } catch { return false; }
        });
        if (slotIdx >= 0 && slotIdx < state.overlay.lifetimeSpend.length) {
          lifetimeSpend = state.overlay.lifetimeSpend[slotIdx];
        }
      }

      allAgents.push({
        agent: agentAddr,
        vaultAddress,
        vaultId: state.vault.vaultId,
        spend24h: budget.spent24h,
        lifetimeSpend,
        capUtilization:
          budget.cap > 0n ? Number((budget.spent24h * 10000n) / budget.cap) / 100 : 0,
        paused: agentEntry.paused,
        rank: 0,
      });
    }
  }

  allAgents.sort((a, b) => (b.spend24h > a.spend24h ? 1 : b.spend24h < a.spend24h ? -1 : 0));
  allAgents.forEach((a, i) => { a.rank = i + 1; });

  return allAgents;
}
```

Export from `index.ts`:
```typescript
export {
  getPortfolioOverview,
  aggregatePortfolio,
  getCrossVaultAgentRanking,
  getAgentLeaderboardAcrossVaults,  // NEW
  getPortfolioTimeSeries,
} from "./portfolio-analytics.js";
```

**Acceptance criteria:** `getAgentLeaderboardAcrossVaults([{ address: v1, state: s1 }, { address: v2, state: s2 }])` returns agents from both vaults, ranked.

---

### Step 12: Constraint Content Inspection

- [ ] **12a.** Add `inspectConstraints()` to `sdk/kit/src/inspector.ts`
- [ ] **12b.** Returns human-readable summary of each constraint entry
- [ ] **12c.** Export from `index.ts`
- [ ] **12d.** Add tests

**WHAT:** Human-readable inspection of the InstructionConstraints PDA contents.

**WHERE:** `sdk/kit/src/inspector.ts` (extend existing file)

**WHY:** Rook (Auditor) can read the raw constraints PDA via `resolveVaultState()` but gets opaque byte arrays and numeric operators. There is no function to convert `ConstraintEntry[]` into a summary like "Program X: account[2] must equal ADDRESS, data[4..8] must be <= VALUE". The existing `analyzeInstructions()` in inspector.ts handles instruction-level analysis (token transfers, dangerous ops) but not constraint-level analysis.

**HOW:**

```typescript
// Added to sdk/kit/src/inspector.ts

import type { ConstraintEntry } from "./generated/types/constraintEntry.js";
import { resolveProtocolName } from "./protocol-names.js";

export interface ConstraintSummary {
  /** 0-based index in the constraints array. */
  index: number;
  /** Protocol program address this constraint targets. */
  program: Address;
  /** Human-readable protocol name (e.g. "Jupiter V6") or shortened address. */
  programName: string;
  /** Number of data constraints (byte-level rules). */
  dataConstraintCount: number;
  /** Number of account constraints (address-level rules). */
  accountConstraintCount: number;
  /** Human-readable description of each rule. */
  rules: string[];
}

const OPERATOR_NAMES: Record<number, string> = {
  0: "==",
  1: "!=",
  2: "<",
  3: "<=",
  4: ">",
  5: ">=",
  6: "contains",
};

/**
 * Inspect an InstructionConstraints account and return a human-readable
 * summary of each constraint entry.
 *
 * @param entries - The constraint entries from the InstructionConstraints PDA.
 *   Obtain via: `(await resolveVaultState(rpc, vault, agent)).constraints?.entries`
 */
export function inspectConstraints(
  entries: ConstraintEntry[],
): ConstraintSummary[] {
  return entries
    .map((entry, index) => {
      const program = entry.program as Address;
      const programName = resolveProtocolName(program) ?? formatShortAddress(program);
      const rules: string[] = [];

      // Data constraints
      for (const dc of entry.dataConstraints ?? []) {
        const op = OPERATOR_NAMES[dc.operator as number] ?? `op(${dc.operator})`;
        const valueHex = Buffer.from(dc.value).toString("hex");
        rules.push(
          `data[${dc.offset}..${dc.offset + dc.length}] ${op} 0x${valueHex}`,
        );
      }

      // Account constraints
      for (const ac of entry.accountConstraints ?? []) {
        const op = OPERATOR_NAMES[ac.operator as number] ?? `op(${ac.operator})`;
        rules.push(
          `account[${ac.accountIndex}] ${op} ${ac.expectedAddress}`,
        );
      }

      return {
        index,
        program,
        programName,
        dataConstraintCount: entry.dataConstraints?.length ?? 0,
        accountConstraintCount: entry.accountConstraints?.length ?? 0,
        rules,
      };
    })
    .filter((s) => s.rules.length > 0);
}

function formatShortAddress(addr: Address): string {
  const s = String(addr);
  return s.length > 8 ? `${s.slice(0, 4)}...${s.slice(-4)}` : s;
}
```

Export from `index.ts`:
```typescript
export { analyzeInstructions, inspectConstraints } from "./inspector.js";
export type {
  InspectableInstruction, TokenTransferInfo, InstructionAnalysis,
  DangerousTokenOperation, ConstraintSummary,  // NEW
} from "./inspector.js";
```

**Acceptance criteria:** `inspectConstraints(state.constraints.entries)` returns human-readable rules like `data[0..4] == 0xe517cb98` and `account[2] == JUP6Lk...`.

---

## P2 -- Nice to Have

These items enhance the SDK for advanced use cases but are not required for initial adoption.

---

### Step 13: Per-Agent P&L (Architectural Design Only)

- [ ] **13a.** Document the fundamental constraint: on-chain finalize_session records vault-level delta, not per-agent
- [ ] **13b.** Design SDK-side attribution: parse SessionFinalized events, attribute delta to acting agent
- [ ] **13c.** Document accuracy limitations (concurrent agents = ambiguous attribution)
- [ ] **13d.** Write spec for `getAgentPnL()` function signature

**WHAT:** Architectural design for per-agent profit/loss tracking.

**WHERE:** Documentation only (this plan). Implementation deferred to after P0/P1 ship.

**WHY:** David (Treasury) wants per-bot P&L. The fundamental constraint is that on-chain `finalize_session` measures vault-level stablecoin balance delta and attributes it to the vault, not the agent. The `AgentSpendOverlay` tracks per-agent spending (outflows) but not per-agent returns (inflows from swaps, position closes, etc.).

**Design:**

The SDK can approximate per-agent P&L by parsing `SessionFinalized` events:
```
Per-agent P&L = sum of (stablecoin_delta) for all sessions where agent = X
```

This is accurate when:
- Only one agent operates at a time (no concurrent sessions)
- External deposits/withdrawals happen between sessions (not during)

This is approximate when:
- Multiple agents operate concurrently (deltas interleave)
- Owner deposits during an active session (inflates apparent return)

**Function signature (future):**
```typescript
export function getAgentPnL(
  events: DecodedPhalnxEvent[],
  agentAddress: Address,
): { totalPnl: bigint; sessionCount: number; avgPnlPerSession: bigint }
```

**Acceptance criteria:** Design document exists. No code shipped. Decision on accuracy tradeoffs recorded.

---

### Step 14: Program Hash Verification

- [ ] **14a.** Design `verifyProgramHash()` that fetches deployed program ELF hash via RPC
- [ ] **14b.** Maintain expected hash constants per version per network
- [ ] **14c.** Document the trust model (who publishes hashes, where are they stored)

**WHAT:** Verify that the deployed Phalnx program matches an expected build hash.

**WHERE:** New file `sdk/kit/src/program-verify.ts` (design only, no implementation)

**WHY:** Rook (Auditor) needs to confirm the deployed program matches the audited source. Solana programs can be upgraded by the authority. Without hash verification, there is no SDK-level way to detect a rogue upgrade.

**Design:**
```typescript
export async function verifyProgramHash(
  rpc: Rpc<SolanaRpcApi>,
  network: Network,
): Promise<{ verified: boolean; expectedHash: string; actualHash: string; version: string }>
```

Uses `rpc.getAccountInfo(programAddress)` to fetch the ELF, hashes it with SHA-256, and compares against a known-good hash shipped in the SDK. The known-good hash would be updated each SDK release that corresponds to a program upgrade.

**Acceptance criteria:** Design recorded. Implementation deferred until program is frozen post-audit.

---

### Step 15: Evidence Chain-of-Custody

- [ ] **15a.** Design audit evidence export format (JSON bundle: vault state + events + signatures)
- [ ] **15b.** Document what constitutes a complete evidence package for a compliance audit
- [ ] **15c.** Spec `exportAuditBundle()` function

**WHAT:** Export a self-contained evidence bundle for external audit.

**WHERE:** Design only. Depends on getAuditTrail() (Step 7) shipping first.

**WHY:** Rook (Auditor) needs to provide evidence to external auditors. Currently audit data is scattered across on-chain state, parsed events, and security posture checks. A single exportable bundle would standardize what "audited" means.

**Design:**
```typescript
export interface AuditBundle {
  version: "1.0";
  exportedAt: string; // ISO 8601
  vaultAddress: Address;
  network: Network;
  vaultState: ResolvedVaultState;
  securityPosture: SecurityPosture;
  auditTrail: AuditEntry[];
  programHash: string;
  sdkVersion: string;
}
```

**Acceptance criteria:** Design recorded. Implementation after Steps 7, 8, 14.

---

### Step 16: Failed Transaction Visibility

- [ ] **16a.** Add `FailedTransactionRecord` type to agent-errors.ts
- [ ] **16b.** Add `onError` callback to PhalnxClient for telemetry/logging
- [ ] **16c.** Document how to persist failed transactions for post-mortem

**WHAT:** Make failed wrap/execute attempts visible and analyzable.

**WHERE:** Design + minimal implementation in `sdk/kit/src/wrap.ts`

**WHY:** Sarah (Risk Manager) and Marcus (Developer) both need visibility into failures. Currently, a failed `executeAndConfirm()` throws an error that is lost unless the caller catches and logs it. There is no built-in telemetry, retry history, or failure catalog.

**Design:**
```typescript
export interface PhalnxClientConfig {
  // ... existing fields
  /** Callback invoked on any error during wrap or execute. For telemetry/logging. */
  onError?: (error: AgentError, context: { action: string; tokenMint: Address; amount: bigint }) => void;
}
```

This is a minimal hook -- the caller decides where to send errors (console, Datadog, Sentry, etc.). The SDK does not prescribe a telemetry backend.

**Acceptance criteria:** `onError` callback fires with structured `AgentError` on every failed `executeAndConfirm()`.

---

### Step 17: Polling/Streaming Pattern Documentation

- [ ] **17a.** Document recommended polling pattern for vault state (30s interval, stale detection)
- [ ] **17b.** Document WebSocket subscription pattern using Helius/Triton
- [ ] **17c.** Add example: `pollVaultState()` wrapper with exponential backoff

**WHAT:** Documentation and example code for real-time vault monitoring.

**WHERE:** `sdk/kit/README.md` (section in README) + `sdk/kit/examples/poll-vault.ts`

**WHY:** Elena (Agent Builder) and David (Treasury) need to monitor vault state changes. The SDK provides `resolveVaultState()` for one-shot reads but no guidance on polling frequency, stale detection, or WebSocket alternatives. `PhalnxClient` has `maxCacheAgeMs` (30s default) but this is not documented.

**Design:**

Document three patterns:
1. **Polling (simple):** Call `resolveVaultState()` every 30s. Use `resolvedAtTimestamp` for stale detection.
2. **PhalnxClient cache (recommended):** `client.wrap()` auto-resolves with 30s cache. No manual polling needed for wrap flows.
3. **WebSocket (advanced):** Subscribe to vault PDA account changes via `onAccountChange`. Parse events from transaction logs.

```typescript
// sdk/kit/examples/poll-vault.ts
async function pollVaultState(
  rpc: Rpc<SolanaRpcApi>,
  vault: Address,
  agent: Address,
  network: Network,
  onUpdate: (state: ResolvedVaultState) => void,
  intervalMs = 30_000,
): Promise<() => void> {
  let running = true;
  const poll = async () => {
    while (running) {
      try {
        const state = await resolveVaultState(rpc, vault, agent, undefined, network);
        onUpdate(state);
      } catch (err) {
        console.error("Poll failed:", err);
      }
      await new Promise(r => setTimeout(r, intervalMs));
    }
  };
  poll(); // fire-and-forget
  return () => { running = false; }; // cancel handle
}
```

**Acceptance criteria:** README documents all three patterns. Example compiles.

---

## Dependency Graph

```
P0 (must ship first):
  Step 1 (npm publish)     -- no code deps, operational
  Step 2 (README)          -- depends on Step 3 existing for link
  Step 3 (Jupiter example) -- independent
  Step 4 (createAndSendVault) -- depends on existing buildOwnerTransaction

P1 (parallelize where possible):
  Step 5 (WrapParams JSDoc)    -- independent, text-only
  Step 6 (network normalize)   -- independent
  Step 7 (audit trail)         -- independent
  Step 8 (security checks)     -- independent
  Step 9 (stringsToPermissions) -- independent
  Step 10 (error categories)   -- depends on agent-errors.ts patterns
  Step 11 (cross-vault agents) -- depends on portfolio-analytics.ts
  Step 12 (constraint inspect) -- depends on inspector.ts

  [P] Steps 5, 6, 7, 8, 9 can be done in parallel.
  [P] Steps 10, 11, 12 can be done in parallel (after reading their target files).

P2 (design first, implement later):
  Step 13 (per-agent P&L)      -- design only
  Step 14 (program hash)       -- design only
  Step 15 (evidence bundle)    -- depends on Steps 7, 8, 14
  Step 16 (failed tx)          -- depends on Step 10
  Step 17 (polling docs)       -- depends on Step 2
```

---

## Estimated Effort

| Priority | Steps | Estimated Effort | Parallelizable |
|----------|-------|------------------|----------------|
| P0 | 1-4 | 2-3 days | Steps 2, 3 parallel; Step 4 after Step 1 verified |
| P1 | 5-12 | 3-4 days | Steps 5-9 all parallel; Steps 10-12 parallel |
| P2 | 13-17 | 1-2 days | All design docs, parallel |
| **Total** | **17** | **6-9 days** | |

---

## Implementation Order

**Phase A (Day 1-2):** P0 blocking items
1. Step 1: Verify npm pipeline (operational, no code)
2. Step 3: Jupiter example (reference for README)
3. Step 4: createAndSendVault() (code change)
4. Step 2: README (references Step 3 example)

**Phase B (Day 3-5):** P1 usability, parallelized
- Agent 1: Steps 5 + 6 + 9 (types.ts cluster)
- Agent 2: Steps 7 + 8 (security-analytics.ts cluster)
- Agent 3: Steps 10 + 11 + 12 (errors + analytics + inspector)

**Phase C (Day 6-7):** P2 design docs
- All steps 13-17 (design documents, no code)

---

## Test Strategy

Each code step includes tests. Test files follow existing convention:

| Step | Test File | Test Count (est.) |
|------|-----------|-------------------|
| 4 | `sdk/kit/tests/create-vault.test.ts` | 4-6 |
| 6 | `sdk/kit/tests/types.test.ts` (extend) | 3-4 |
| 7 | `sdk/kit/tests/security-analytics.test.ts` (extend) | 4-6 |
| 8 | `sdk/kit/tests/security-analytics.test.ts` (extend) | 4-8 |
| 9 | `sdk/kit/tests/types.test.ts` (extend) | 3-4 |
| 10 | `sdk/kit/tests/error-categories.test.ts` (extend) | 6-10 |
| 11 | `sdk/kit/tests/portfolio-analytics.test.ts` (extend) | 3-4 |
| 12 | `sdk/kit/tests/inspector.test.ts` (extend) | 3-4 |

All tests use the existing mock infrastructure (`@phalnx/kit/testing`). No RPC calls. No devnet dependency.
