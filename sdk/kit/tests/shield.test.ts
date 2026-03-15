import { expect } from "chai";
import {
  shield,
  ShieldState,
  ShieldDeniedError,
  evaluateInstructions,
  _extractInstructionsFromCompiled,
} from "../src/shield.js";
import type { InspectableInstruction } from "../src/inspector.js";
import type { Address } from "@solana/kit";
import { AltCache } from "../src/alt-loader.js";

const SIGNER = "SignerAddr1111111111111111111111111111111" as Address;
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as Address;
const UNKNOWN_PROGRAM = "UnknownProg111111111111111111111111111111" as Address;
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as Address;
const DEST = "Dest1111111111111111111111111111111111111111" as Address;

function buildTransferIx(
  amount: bigint,
  authority: Address,
  destination: Address = DEST,
): InspectableInstruction {
  const data = new Uint8Array(9);
  data[0] = 3; // Transfer discriminator
  const view = new DataView(data.buffer);
  view.setBigUint64(1, amount, true);

  return {
    programAddress: TOKEN_PROGRAM,
    accounts: [
      { address: "Source11111111111111111111111111111111111111" as Address },
      { address: destination },
      { address: authority },
    ],
    data,
  };
}

function noopIx(programAddress: Address): InspectableInstruction {
  return {
    programAddress,
    accounts: [],
    data: new Uint8Array(),
  };
}

describe("shield", () => {
  describe("ShieldState", () => {
    it("records and queries spend in window", () => {
      const state = new ShieldState();
      state.recordSpend("USDC", 100n);
      state.recordSpend("USDC", 200n);
      expect(state.getSpendInWindow("USDC", 60_000)).to.equal(300n);
      expect(state.getSpendInWindow("USDT", 60_000)).to.equal(0n);
    });

    it("records and queries transaction count", () => {
      const state = new ShieldState();
      state.recordTransaction();
      state.recordTransaction();
      expect(state.getTransactionCountInWindow(60_000)).to.equal(2);
    });

    it("checkpoint/rollback restores state", () => {
      const state = new ShieldState();
      state.recordSpend("USDC", 100n);
      const cp = state.checkpoint();

      state.recordSpend("USDC", 900n);
      expect(state.getSpendInWindow("USDC", 60_000)).to.equal(1000n);

      state.rollback(cp);
      expect(state.getSpendInWindow("USDC", 60_000)).to.equal(100n);
    });

    it("reset clears all state", () => {
      const state = new ShieldState();
      state.recordSpend("USDC", 100n);
      state.recordTransaction();
      state.reset();
      expect(state.getSpendInWindow("USDC", 60_000)).to.equal(0n);
      expect(state.getTransactionCountInWindow(60_000)).to.equal(0);
    });

    it("getTotalSpendInWindow sums across different mints", () => {
      const state = new ShieldState();
      state.recordSpend("USDC", 100n);
      state.recordSpend("USDT", 200n);
      state.recordSpend("SOL", 50n);
      expect(state.getTotalSpendInWindow(60_000)).to.equal(350n);
    });

    it("getTotalSpendInWindow respects time window", () => {
      const state = new ShieldState();
      state.recordSpend("USDC", 100n);
      state.recordSpend("USDT", 200n);
      // Within window should return total
      expect(state.getTotalSpendInWindow(60_000)).to.equal(300n);
      // getSpendInWindow with same window only returns USDC
      expect(state.getSpendInWindow("USDC", 60_000)).to.equal(100n);
    });

    it("getTotalSpendInWindow returns 0n for empty state", () => {
      const state = new ShieldState();
      expect(state.getTotalSpendInWindow(60_000)).to.equal(0n);
    });
  });

  describe("ShieldDeniedError", () => {
    it("includes violations in message", () => {
      const err = new ShieldDeniedError([
        { rule: "test", message: "blocked" },
      ]);
      expect(err.message).to.include("blocked");
      expect(err.violations).to.have.length(1);
      expect(err.name).to.equal("ShieldDeniedError");
    });

    it("accepts optional error code", () => {
      const err = new ShieldDeniedError([{ rule: "test", message: "x" }], 7021);
      expect(err.code).to.equal(7021);
    });

    it("code is undefined when not provided", () => {
      const err = new ShieldDeniedError([{ rule: "test", message: "x" }]);
      expect(err.code).to.equal(undefined);
    });
  });

  describe("shield() context", () => {
    it("check() with no policies and benign instructions passes", () => {
      const ctx = shield();
      const result = ctx.check(
        [noopIx("11111111111111111111111111111111" as Address)],
        SIGNER,
      );
      expect(result.allowed).to.be.true;
      expect(result.violations).to.have.length(0);
    });

    it("check() when paused returns violation", () => {
      const ctx = shield();
      ctx.pause();
      const result = ctx.check([], SIGNER);
      expect(result.allowed).to.be.false;
      expect(result.violations[0].rule).to.equal("paused");
    });

    it("enforce() when paused throws ShieldDeniedError", () => {
      const ctx = shield();
      ctx.pause();
      expect(() => ctx.enforce([], SIGNER)).to.throw(ShieldDeniedError);
    });

    it("resume() re-enables operations", () => {
      const ctx = shield();
      ctx.pause();
      ctx.resume();
      expect(ctx.isPaused).to.be.false;
      const result = ctx.check([], SIGNER);
      expect(result.allowed).to.be.true;
    });

    it("enforce() records transaction in state", () => {
      const ctx = shield();
      ctx.enforce(
        [noopIx("11111111111111111111111111111111" as Address)],
        SIGNER,
      );
      const summary = ctx.getSpendingSummary();
      expect(summary.rateLimit.count).to.equal(1);
    });

    it("updatePolicies changes resolved policies", () => {
      const ctx = shield();
      const before = ctx.resolvedPolicies;
      ctx.updatePolicies({ blockUnknownPrograms: true });
      // After update, blockUnknownPrograms should be true
      expect(ctx.resolvedPolicies.blockUnknownPrograms).to.be.true;
    });

    it("resetState clears spending history", () => {
      const ctx = shield();
      ctx.enforce(
        [noopIx("11111111111111111111111111111111" as Address)],
        SIGNER,
      );
      expect(ctx.getSpendingSummary().rateLimit.count).to.equal(1);
      ctx.resetState();
      expect(ctx.getSpendingSummary().rateLimit.count).to.equal(0);
    });

    it("callbacks fire on deny", () => {
      let deniedError: ShieldDeniedError | null = null;
      const ctx = shield(undefined, {
        onDenied: (err) => { deniedError = err; },
      });
      ctx.pause();
      try { ctx.enforce([], SIGNER); } catch {}
      expect(deniedError).to.be.instanceOf(ShieldDeniedError);
    });

    it("callbacks fire on approve", () => {
      let approved = false;
      const ctx = shield(undefined, {
        onApproved: () => { approved = true; },
      });
      ctx.enforce(
        [noopIx("11111111111111111111111111111111" as Address)],
        SIGNER,
      );
      expect(approved).to.be.true;
    });

    it("getSpendingSummary reflects current state", () => {
      const ctx = shield();
      const summary = ctx.getSpendingSummary();
      expect(summary.isPaused).to.be.false;
      expect(summary.rateLimit.count).to.equal(0);
    });
  });

  describe("spend limit violations", () => {
    it("detects spend limit exceeded", () => {
      const ctx = shield({
        maxSpend: { mint: USDC_MINT, amount: 1_000_000n },
      });
      const result = ctx.check(
        [buildTransferIx(2_000_000n, SIGNER)],
        SIGNER,
      );
      expect(result.allowed).to.be.false;
      expect(result.violations.some((v) => v.rule === "spend_limit")).to.be.true;
    });

    it("tracks spend accumulation across enforce() calls", () => {
      const ctx = shield({
        maxSpend: { mint: "", amount: 1_000_000n },
      });
      // First enforcement: 600k (passes, under 1M limit)
      ctx.enforce([buildTransferIx(600_000n, SIGNER)], SIGNER);

      // Second check: another 600k (total 1.2M > 1M limit)
      const result = ctx.check(
        [buildTransferIx(600_000n, SIGNER)],
        SIGNER,
      );
      expect(result.allowed).to.be.false;
      expect(result.violations.some((v) => v.rule === "spend_limit")).to.be.true;
    });
  });

  describe("rate limit violations", () => {
    it("blocks after max transactions exceeded", () => {
      const ctx = shield({
        rateLimit: { maxTransactions: 2, windowMs: 60_000 },
      });
      // Consume rate limit
      ctx.enforce(
        [noopIx("11111111111111111111111111111111" as Address)],
        SIGNER,
      );
      ctx.enforce(
        [noopIx("11111111111111111111111111111111" as Address)],
        SIGNER,
      );
      // Third should fail
      expect(() =>
        ctx.enforce(
          [noopIx("11111111111111111111111111111111" as Address)],
          SIGNER,
        ),
      ).to.throw(ShieldDeniedError);
    });
  });

  describe("custom check violations", () => {
    it("blocks when custom check returns not allowed", () => {
      const ctx = shield({
        customCheck: () => ({ allowed: false, reason: "blocked by policy" }),
      });
      expect(() =>
        ctx.enforce(
          [noopIx("11111111111111111111111111111111" as Address)],
          SIGNER,
        ),
      ).to.throw(ShieldDeniedError);
    });

    it("passes when custom check returns allowed", () => {
      const ctx = shield({
        customCheck: () => ({ allowed: true }),
      });
      ctx.enforce(
        [noopIx("11111111111111111111111111111111" as Address)],
        SIGNER,
      );
      // No throw = pass
      expect(ctx.getSpendingSummary().rateLimit.count).to.equal(1);
    });
  });

  describe("evaluateInstructions", () => {
    it("blocks unknown programs when blockUnknownPrograms=true", () => {
      const resolved = {
        blockUnknownPrograms: true,
        allowedProtocols: new Set<string>(),
        spendLimits: [],
        rateLimit: { maxTransactions: 100, windowMs: 3_600_000 },
      };
      const state = new ShieldState();
      const { violations } = evaluateInstructions(
        [noopIx(UNKNOWN_PROGRAM)],
        SIGNER,
        resolved as any,
        state,
      );
      expect(violations.length).to.be.greaterThan(0);
      expect(violations[0].rule).to.equal("program_allowlist");
    });

    it("allows system programs even when blockUnknownPrograms=true", () => {
      const resolved = {
        blockUnknownPrograms: true,
        allowedProtocols: new Set<string>(),
        spendLimits: [],
        rateLimit: { maxTransactions: 100, windowMs: 3_600_000 },
      };
      const state = new ShieldState();
      const { violations } = evaluateInstructions(
        [noopIx("11111111111111111111111111111111" as Address)],
        SIGNER,
        resolved as any,
        state,
      );
      expect(violations).to.have.length(0);
    });
  });

  describe("ALT resolution in _extractInstructionsFromCompiled", () => {
    const ALT_A = "ALTaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;
    const ALT_B = "ALTbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;
    const PROG = "Prog1111111111111111111111111111111111111111" as Address;
    const ACCT_W1 = "Writabl1111111111111111111111111111111111" as Address;
    const ACCT_W2 = "Writabl2222222222222222222222222222222222" as Address;
    const ACCT_R1 = "Readonl1111111111111111111111111111111111" as Address;
    const ACCT_R2 = "Readonl2222222222222222222222222222222222" as Address;

    function populateCache(cache: AltCache, altAddr: Address, addresses: Address[]) {
      (cache as any).cache.set(altAddr as string, {
        data: { [altAddr]: addresses },
        expiresAt: Date.now() + 300_000,
      });
    }

    it("V6 — resolves ALT-referenced accounts via AltCache", () => {
      const cache = new AltCache();
      populateCache(cache, ALT_A, [ACCT_W1, ACCT_R1]);

      const tx = {
        compiledMessage: {
          staticAccounts: [PROG],
          instructions: [
            {
              programAddressIndex: 0,
              accountIndices: [1, 2], // indices into combined table
              data: new Uint8Array([1]),
            },
          ],
          addressTableLookups: [
            {
              lookupTableAddress: ALT_A,
              writableIndexes: [0], // ACCT_W1
              readonlyIndexes: [1], // ACCT_R1
            },
          ],
        },
      };

      const ixs = _extractInstructionsFromCompiled(tx, cache);
      expect(ixs).to.have.length(1);
      expect(ixs[0].programAddress).to.equal(PROG);
      // Account table: [PROG, ACCT_W1 (writable pass), ACCT_R1 (readonly pass)]
      expect(ixs[0].accounts[0].address).to.equal(ACCT_W1);
      expect(ixs[0].accounts[1].address).to.equal(ACCT_R1);
    });

    it("V10 — warns without crash when AltCache absent", () => {
      const tx = {
        compiledMessage: {
          staticAccounts: [PROG],
          instructions: [
            {
              programAddressIndex: 0,
              accountIndices: [],
              data: new Uint8Array([1]),
            },
          ],
          addressTableLookups: [
            {
              lookupTableAddress: ALT_A,
              writableIndexes: [0],
              readonlyIndexes: [],
            },
          ],
        },
      };

      // Should not throw, just warn
      const ixs = _extractInstructionsFromCompiled(tx);
      expect(ixs).to.have.length(1);
      expect(ixs[0].programAddress).to.equal(PROG);
    });

    it("V6b — multi-ALT two-pass ordering", () => {
      const cache = new AltCache();
      // ALT_A has [ACCT_W1, ACCT_R1], ALT_B has [ACCT_W2, ACCT_R2]
      populateCache(cache, ALT_A, [ACCT_W1, ACCT_R1]);
      populateCache(cache, ALT_B, [ACCT_W2, ACCT_R2]);

      const tx = {
        compiledMessage: {
          staticAccounts: [PROG],
          instructions: [
            {
              programAddressIndex: 0,
              // Indices into: [PROG, W1(A), W2(B), R1(A), R2(B)]
              accountIndices: [1, 2, 3, 4],
              data: new Uint8Array([1]),
            },
          ],
          addressTableLookups: [
            {
              lookupTableAddress: ALT_A,
              writableIndexes: [0],  // ACCT_W1
              readonlyIndexes: [1],  // ACCT_R1
            },
            {
              lookupTableAddress: ALT_B,
              writableIndexes: [0],  // ACCT_W2
              readonlyIndexes: [1],  // ACCT_R2
            },
          ],
        },
      };

      const ixs = _extractInstructionsFromCompiled(tx, cache);
      expect(ixs).to.have.length(1);
      // Two-pass ordering: all writables first, then all readonlys
      // [PROG, ACCT_W1, ACCT_W2, ACCT_R1, ACCT_R2]
      expect(ixs[0].accounts[0].address).to.equal(ACCT_W1); // idx 1
      expect(ixs[0].accounts[1].address).to.equal(ACCT_W2); // idx 2
      expect(ixs[0].accounts[2].address).to.equal(ACCT_R1); // idx 3
      expect(ixs[0].accounts[3].address).to.equal(ACCT_R2); // idx 4
    });
  });
});
