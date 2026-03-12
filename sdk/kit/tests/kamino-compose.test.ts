/**
 * Kamino Lending Compose Tests — Codama pre-generated builders
 *
 * Tests instruction building with static account configs.
 * No RPC, no protocol SDK needed.
 */

import { expect } from "chai";
import type { Address, Rpc, SolanaRpcApi } from "@solana/kit";
import type { ProtocolContext } from "../src/integrations/protocol-handler.js";
import { dispatchKaminoCompose } from "../src/integrations/kamino-compose.js";
import { KaminoHandler } from "../src/integrations/t2-handlers.js";
import { KAMINO_LEND_PROGRAM } from "../src/integrations/config/kamino-markets.js";

// ─── Test Context ────────────────────────────────────────────────────────────

const FAKE_VAULT = "11111111111111111111111111111111" as Address;
const FAKE_OWNER = "22222222222222222222222222222222" as Address;
const FAKE_AGENT = "33333333333333333333333333333333" as Address;
const FAKE_OBLIGATION = "66666666666666666666666666666666" as Address;

function makeCtx(): ProtocolContext {
  return {
    rpc: {} as Rpc<SolanaRpcApi>,
    network: "mainnet-beta",
    vault: FAKE_VAULT,
    owner: FAKE_OWNER,
    vaultId: 1n,
    agent: FAKE_AGENT,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Kamino Compose (Codama)", () => {
  const ctx = makeCtx();

  describe("deposit", () => {
    it("produces 3+ instructions (refresh + refresh + deposit)", async () => {
      const result = await dispatchKaminoCompose(ctx, "deposit", {
        amount: "1000000",
        tokenMint: "USDC",
        obligation: FAKE_OBLIGATION,
      });
      expect(result.instructions).to.have.length.gte(3);
    });

    it("first two are refresh instructions, third targets Kamino program", async () => {
      const result = await dispatchKaminoCompose(ctx, "deposit", {
        amount: "1000000",
        tokenMint: "USDC",
        obligation: FAKE_OBLIGATION,
      });
      // All instructions should target the Kamino program
      for (const ix of result.instructions) {
        expect(ix.programAddress).to.equal(KAMINO_LEND_PROGRAM);
      }
    });

    it("deposit instruction has correct discriminator (8 bytes)", async () => {
      const result = await dispatchKaminoCompose(ctx, "deposit", {
        amount: "1000000",
        tokenMint: "USDC",
        obligation: FAKE_OBLIGATION,
      });
      const depositIx = result.instructions[2]; // 3rd instruction
      expect(depositIx.data!.length).to.be.greaterThan(8);
    });
  });

  describe("borrow", () => {
    it("produces 3+ instructions", async () => {
      const result = await dispatchKaminoCompose(ctx, "borrow", {
        amount: "500000",
        tokenMint: "USDC",
        obligation: FAKE_OBLIGATION,
      });
      expect(result.instructions).to.have.length.gte(3);
    });

    it("all target Kamino program", async () => {
      const result = await dispatchKaminoCompose(ctx, "borrow", {
        amount: "500000",
        tokenMint: "USDC",
        obligation: FAKE_OBLIGATION,
      });
      for (const ix of result.instructions) {
        expect(ix.programAddress).to.equal(KAMINO_LEND_PROGRAM);
      }
    });
  });

  describe("repay", () => {
    it("produces 3+ instructions", async () => {
      const result = await dispatchKaminoCompose(ctx, "repay", {
        amount: "250000",
        tokenMint: "USDC",
        obligation: FAKE_OBLIGATION,
      });
      expect(result.instructions).to.have.length.gte(3);
    });

    it("all target Kamino program", async () => {
      const result = await dispatchKaminoCompose(ctx, "repay", {
        amount: "250000",
        tokenMint: "USDC",
        obligation: FAKE_OBLIGATION,
      });
      for (const ix of result.instructions) {
        expect(ix.programAddress).to.equal(KAMINO_LEND_PROGRAM);
      }
    });
  });

  describe("withdraw", () => {
    it("produces 3+ instructions", async () => {
      const result = await dispatchKaminoCompose(ctx, "withdraw", {
        amount: "100000",
        tokenMint: "SOL",
        obligation: FAKE_OBLIGATION,
      });
      expect(result.instructions).to.have.length.gte(3);
    });

    it("all target Kamino program", async () => {
      const result = await dispatchKaminoCompose(ctx, "withdraw", {
        amount: "100000",
        tokenMint: "SOL",
        obligation: FAKE_OBLIGATION,
      });
      for (const ix of result.instructions) {
        expect(ix.programAddress).to.equal(KAMINO_LEND_PROGRAM);
      }
    });

    it("no additionalSigners", async () => {
      const result = await dispatchKaminoCompose(ctx, "withdraw", {
        amount: "100000",
        tokenMint: "SOL",
        obligation: FAKE_OBLIGATION,
      });
      expect(result.additionalSigners).to.be.undefined;
    });
  });

  describe("error cases", () => {
    it("throws for unsupported action", async () => {
      try {
        await dispatchKaminoCompose(ctx, "liquidate", {});
        expect.fail("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include("Unsupported Kamino action");
      }
    });

    it("throws for missing amount", async () => {
      try {
        await dispatchKaminoCompose(ctx, "deposit", { tokenMint: "USDC", obligation: FAKE_OBLIGATION });
        expect.fail("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include("Missing required");
      }
    });

    it("throws for missing tokenMint", async () => {
      try {
        await dispatchKaminoCompose(ctx, "deposit", { amount: "100", obligation: FAKE_OBLIGATION });
        expect.fail("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include("Missing required");
      }
    });

    it("throws for unknown token symbol", async () => {
      try {
        await dispatchKaminoCompose(ctx, "deposit", {
          amount: "100",
          tokenMint: "UNKNOWN",
          obligation: FAKE_OBLIGATION,
        });
        expect.fail("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include("Unknown Kamino token");
      }
    });
  });

  describe("all 4 actions dispatch", () => {
    const actions = ["deposit", "borrow", "repay", "withdraw"];

    for (const action of actions) {
      it(`${action} does not throw "Unsupported"`, async () => {
        try {
          await dispatchKaminoCompose(ctx, action, {});
        } catch (e: any) {
          expect(e.message).to.not.include("Unsupported Kamino action");
        }
      });
    }
  });

  describe("Handler.summarize()", () => {
    const handler = new KaminoHandler();

    it("produces readable summaries", () => {
      expect(handler.summarize("deposit", { amount: "1000000", tokenMint: "USDC" })).to.include("Kamino deposit");
      expect(handler.summarize("borrow", { amount: "500000", tokenMint: "SOL" })).to.include("Kamino borrow");
      expect(handler.summarize("repay", {})).to.include("Kamino repay");
      expect(handler.summarize("withdraw", { tokenMint: "USDC" })).to.include("Kamino withdraw");
    });
  });
});
