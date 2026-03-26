/**
 * Tests for createAndSendVault() convenience function.
 *
 * createAndSendVault() is a thin composition of createVault() → buildOwnerTransaction()
 * → signAndEncode() → sendAndConfirmTransaction(). It calls through the full Anchor
 * instruction-building stack (PDA derivation, sysvar reads), so integration testing
 * requires LiteSVM or devnet. These unit tests verify the function contract:
 * - Type exports and interface shapes
 * - Error propagation from createVault (owner === agent)
 * - Option forwarding types
 */

import { expect } from "chai";
import {
  createVault,
  createAndSendVault,
} from "../src/create-vault.js";
import type {
  CreateVaultOptions,
  CreateVaultResult,
  CreateAndSendVaultOptions,
  CreateAndSendVaultResult,
} from "../src/create-vault.js";
import type { Address, TransactionSigner } from "@solana/kit";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockSigner(addr: Address): TransactionSigner {
  return {
    address: addr,
    signTransactions: async (txs: unknown[]) => txs,
  } as unknown as TransactionSigner;
}

// Valid base58 addresses (no O, I, l, 0)
const OWNER = "4ZeVCqnjUgUtFrHHPG7jELUxvJeoVGHhGNgPrhBPwrHL" as Address;
const AGENT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as Address;

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("createAndSendVault", () => {
  it("exports function and types", () => {
    expect(createAndSendVault).to.be.a("function");
    // Verify the function accepts CreateAndSendVaultOptions shape
    const opts: CreateAndSendVaultOptions = {
      rpc: {} as any,
      network: "devnet",
      owner: createMockSigner(OWNER),
      agent: createMockSigner(AGENT),
      priorityFeeMicroLamports: 1000,
      computeUnits: 400_000,
      confirmOptions: { timeoutMs: 30_000 },
    };
    expect(opts).to.have.property("priorityFeeMicroLamports", 1000);
    expect(opts).to.have.property("computeUnits", 400_000);
    expect(opts).to.have.property("confirmOptions");
  });

  it("CreateAndSendVaultOptions extends CreateVaultOptions", () => {
    // Verify the extends relationship: all CreateVaultOptions fields accepted
    const opts: CreateAndSendVaultOptions = {
      rpc: {} as any,
      network: "devnet",
      owner: createMockSigner(OWNER),
      agent: createMockSigner(AGENT),
      // CreateVaultOptions fields
      permissions: 1n,
      spendingLimitUsd: 500_000_000n,
      dailySpendingCapUsd: 1_000_000_000n,
      protocols: [],
      protocolMode: 1,
      // CreateAndSendVaultOptions additions
      priorityFeeMicroLamports: 0,
      computeUnits: 200_000,
    };
    expect(opts.dailySpendingCapUsd).to.equal(1_000_000_000n);
    expect(opts.priorityFeeMicroLamports).to.equal(0);
  });

  it("CreateAndSendVaultResult extends CreateVaultResult with signature", () => {
    // Verify the result type shape
    const result: CreateAndSendVaultResult = {
      vaultAddress: OWNER,
      vaultId: 0n,
      policyAddress: AGENT,
      agentOverlayAddress: AGENT,
      initializeVaultIx: { programAddress: OWNER, accounts: [], data: new Uint8Array() },
      registerAgentIx: { programAddress: OWNER, accounts: [], data: new Uint8Array() },
      signature: "abc123",
    };
    expect(result).to.have.property("vaultAddress");
    expect(result).to.have.property("signature", "abc123");
  });

  it("rejects owner === agent before any RPC calls", async () => {
    try {
      await createAndSendVault({
        rpc: {} as any,
        network: "devnet",
        owner: createMockSigner(OWNER),
        agent: createMockSigner(OWNER), // same as owner
      });
      expect.fail("should have thrown");
    } catch (err) {
      expect((err as Error).message).to.include("Owner and agent must be different");
    }
  });
});
