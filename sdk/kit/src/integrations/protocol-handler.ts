/**
 * Protocol Handler Interface — Kit-native
 *
 * Defines the contract for protocol adapters in the Kit SDK.
 * Bridges hand-crafted adapters (Tier 1) and runtime-registered
 * handlers (Tier 2) into a uniform dispatch mechanism.
 *
 * Ported from @phalnx/typescript with:
 *   PublicKey → Address, TransactionInstruction → Instruction,
 *   Connection → Rpc<SolanaRpcApi>, Signer → TransactionSigner,
 *   BN → bigint, Program<Phalnx> → rpc + network
 */

import type {
  Address,
  Instruction,
  Rpc,
  SolanaRpcApi,
  TransactionSigner,
} from "@solana/kit";
import type { ActionType } from "../generated/types/actionType.js";

// ─── Compose Result ──────────────────────────────────────────────────────────

/**
 * Returned by ProtocolHandler.compose() — everything needed to build
 * the composed Phalnx transaction sandwich.
 */
export interface ProtocolComposeResult {
  /** DeFi instructions to place between validate_and_authorize and finalize_session */
  instructions: Instruction[];
  /** Extra signers required by the protocol instructions (e.g. ephemeral keypairs) */
  additionalSigners?: TransactionSigner[];
  /** Address lookup table addresses for versioned transaction compression */
  addressLookupTables?: Address[];
}

// ─── Protocol Context ────────────────────────────────────────────────────────

/**
 * Shared vault context passed to every ProtocolHandler.compose() call.
 * Kit-native: uses Rpc instead of Connection, Address instead of PublicKey.
 */
export interface ProtocolContext {
  /** Kit RPC client */
  rpc: Rpc<SolanaRpcApi>;
  /** Target network */
  network: "devnet" | "mainnet-beta";
  /** Vault PDA address */
  vault: Address;
  /** Vault owner address */
  owner: Address;
  /** Vault identifier */
  vaultId: bigint;
  /** Agent signing key address */
  agent: Address;
}

// ─── Handler Metadata ────────────────────────────────────────────────────────

/** Action descriptor mapping a handler action name to an on-chain ActionType */
export interface ProtocolActionDescriptor {
  /** On-chain ActionType enum variant */
  actionType: ActionType;
  /** Whether this action counts against the spending cap */
  isSpending: boolean;
}

/**
 * Static metadata describing a protocol handler's capabilities.
 */
export interface ProtocolHandlerMetadata {
  /** Unique protocol identifier (e.g. "drift", "kamino-lending") */
  protocolId: string;
  /** Human-readable display name (e.g. "Drift Protocol") */
  displayName: string;
  /** On-chain program IDs this handler covers */
  programIds: Address[];
  /** Map of action names to their ActionType + spending classification */
  supportedActions: Map<string, ProtocolActionDescriptor>;
}

// ─── Protocol Handler Interface ──────────────────────────────────────────────

/**
 * Interface for protocol adapters that integrate with Phalnx composed transactions.
 *
 * Each handler wraps a DeFi protocol's instruction building into a uniform
 * interface that the registry and client can dispatch to.
 */
export interface ProtocolHandler {
  /** Static metadata about this handler */
  readonly metadata: ProtocolHandlerMetadata;

  /**
   * Build DeFi instructions for a given action.
   *
   * @param ctx - Vault context (rpc, network, vault, owner, vaultId, agent)
   * @param action - Handler-specific action name (e.g. "deposit", "placePerpOrder")
   * @param params - Action-specific parameters (type-safe within each handler)
   * @returns Instructions + optional signers/ALTs for the composed transaction
   */
  compose(
    ctx: ProtocolContext,
    action: string,
    params: Record<string, unknown>,
  ): Promise<ProtocolComposeResult>;

  /**
   * Produce a human-readable summary of an action for display/logging.
   */
  summarize(action: string, params: Record<string, unknown>): string;

  /**
   * Optional one-time initialization (e.g. loading protocol client state).
   * Called lazily on first use via the registry.
   */
  initialize?(rpc: Rpc<SolanaRpcApi>): Promise<void>;
}
