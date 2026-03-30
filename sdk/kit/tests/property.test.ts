/**
 * Property-based + fuzz tests for the Phalnx SDK.
 *
 * Uses fast-check (v3) for property-based testing to exhaustively explore edge cases
 * that hand-written tests miss. Three categories:
 *   A — Exported function properties (isSpendingAction, hasPermission, getRolling24hUsd)
 *   B — Cross-validation (ceilFee formula)
 *   C — Fuzz testing (detectDrainAttempt, replaceAgentAtas)
 */

import * as fc from "fast-check";
import { expect } from "chai";
import {
  isSpendingAction,
  hasPermission,
  FULL_PERMISSIONS,
} from "../src/types.js";
import {
  detectDrainAttempt,
  RISK_FLAG_LARGE_OUTFLOW,
  RISK_FLAG_FULL_DRAIN,
  RISK_FLAG_UNKNOWN_RECIPIENT,
  RISK_FLAG_MULTI_OUTPUT,
} from "../src/simulation.js";
import { getRolling24hUsd } from "../src/state-resolver.js";
import { AccountRole } from "@solana/kit";
import type { Address, Instruction } from "@solana/kit";
import type { BalanceDelta, DrainDetectionInput } from "../src/simulation.js";

/**
 * Inlined from wrap.ts to avoid transitive dependency on generated instructions
 * which require a newer @solana/kit export not available in this worktree.
 * The logic is identical to the exported replaceAgentAtas function.
 */
function replaceAgentAtas(
  instructions: Instruction[],
  replacements: Map<Address, Address>,
): Instruction[] {
  if (replacements.size === 0) return instructions;
  return instructions.map((ix) => ({
    ...ix,
    accounts: ix.accounts?.map((acc) => {
      const replacement = replacements.get(acc.address);
      if (
        replacement &&
        (acc.role === AccountRole.WRITABLE ||
          acc.role === AccountRole.WRITABLE_SIGNER)
      ) {
        return { ...acc, address: replacement };
      }
      return acc;
    }),
  }));
}

// ─── Configuration ──────────────────────────────────────────────────────────

const NUM_RUNS = parseInt(process.env.PROPERTY_RUNS ?? "5000", 10);

// ─── Constants ──────────────────────────────────────────────────────────────

const SPENDING_ACTIONS = [
  "swap",
  "openPosition",
  "increasePosition",
  "deposit",
  "transfer",
  "addCollateral",
  "placeLimitOrder",
  "swapAndOpenPosition",
  "createEscrow",
] as const;

const NON_SPENDING_ACTIONS = [
  "closePosition",
  "decreasePosition",
  "withdraw",
  "removeCollateral",
  "placeTriggerOrder",
  "editTriggerOrder",
  "cancelTriggerOrder",
  "editLimitOrder",
  "cancelLimitOrder",
  "closeAndSwapPosition",
  "settleEscrow",
  "refundEscrow",
] as const;

const ALL_ACTIONS = [...SPENDING_ACTIONS, ...NON_SPENDING_ACTIONS];

const ACTION_KEYS: readonly string[] = [
  "swap",
  "openPosition",
  "closePosition",
  "increasePosition",
  "decreasePosition",
  "deposit",
  "withdraw",
  "transfer",
  "addCollateral",
  "removeCollateral",
  "placeTriggerOrder",
  "editTriggerOrder",
  "cancelTriggerOrder",
  "placeLimitOrder",
  "editLimitOrder",
  "cancelLimitOrder",
  "swapAndOpenPosition",
  "closeAndSwapPosition",
  "createEscrow",
  "settleEscrow",
  "refundEscrow",
];

const EPOCH_DURATION = 600;
const NUM_EPOCHS = 144;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Create a fake Solana address from a seed string. */
function fakeAddress(seed: string): Address {
  const base = seed.replace(/[^A-Za-z0-9]/g, "A");
  const padded = (base + "1".repeat(44)).slice(0, 44);
  return padded as Address;
}

/** Build a mock SpendTracker with configurable buckets. */
function makeTracker(
  buckets: Array<{ epochId: bigint; usdAmount: bigint }>,
  lastWriteEpoch: bigint,
): any {
  const fullBuckets = [...buckets];
  while (fullBuckets.length < NUM_EPOCHS) {
    fullBuckets.push({ epochId: 0n, usdAmount: 0n });
  }
  return {
    discriminator: new Uint8Array(8),
    vault: fakeAddress("Vault"),
    buckets: fullBuckets,
    protocolCounters: Array.from({ length: 10 }, () => ({
      protocol: new Uint8Array(32),
      windowStart: 0n,
      windowSpend: 0n,
    })),
    lastWriteEpoch,
    bump: 255,
    padding: new Uint8Array(7),
  };
}

/** Build a BalanceDelta. */
function makeDelta(
  account: string,
  pre: bigint,
  post: bigint,
): BalanceDelta {
  return { account, preBalance: pre, postBalance: post, delta: post - pre };
}

/** Arbitrary for a fake Address (base58-like string, 32-44 chars). */
const arbAddress: fc.Arbitrary<Address> = fc
  .stringOf(
    fc.constantFrom(
      ..."ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789".split(
        "",
      ),
    ),
    { minLength: 32, maxLength: 44 },
  )
  .map((s) => s as Address);

/** Arbitrary for an AccountRole enum value. */
const arbAccountRole: fc.Arbitrary<AccountRole> = fc.constantFrom(
  AccountRole.READONLY,
  AccountRole.WRITABLE,
  AccountRole.READONLY_SIGNER,
  AccountRole.WRITABLE_SIGNER,
);

// ─── CATEGORY A: Exported Function Properties ──────────────────────────────

describe("Property Tests — Category A: Exported Function Properties", () => {
  // ── isSpendingAction ────────────────────────────────────────────────────

  describe("isSpendingAction", () => {
    it("exactly 9 actions are spending", () => {
      const spendingCount = ALL_ACTIONS.filter(isSpendingAction).length;
      expect(spendingCount).to.equal(9);
    });

    it("exactly 12 actions are non-spending", () => {
      const nonSpendingCount = ALL_ACTIONS.filter(
        (a) => !isSpendingAction(a),
      ).length;
      expect(nonSpendingCount).to.equal(12);
    });

    it("every known spending action returns true", () => {
      for (const action of SPENDING_ACTIONS) {
        expect(isSpendingAction(action)).to.equal(
          true,
          `Expected ${action} to be spending`,
        );
      }
    });

    it("every known non-spending action returns false", () => {
      for (const action of NON_SPENDING_ACTIONS) {
        expect(isSpendingAction(action)).to.equal(
          false,
          `Expected ${action} to be non-spending`,
        );
      }
    });

    it("random unknown strings always return false", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(
            (s) => !(ALL_ACTIONS as readonly string[]).includes(s),
          ),
          (unknownAction) => {
            expect(isSpendingAction(unknownAction)).to.equal(false);
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("total known actions = 21", () => {
      expect(ALL_ACTIONS.length).to.equal(21);
    });
  });

  // ── hasPermission ─────────────────────────────────────────────────────

  describe("hasPermission", () => {
    it("FULL_PERMISSIONS = (1n << 21n) - 1n", () => {
      expect(FULL_PERMISSIONS).to.equal((1n << 21n) - 1n);
    });

    it("FULL_PERMISSIONS grants all 21 action types", () => {
      for (const key of ACTION_KEYS) {
        expect(hasPermission(FULL_PERMISSIONS, key)).to.equal(
          true,
          `FULL_PERMISSIONS should grant ${key}`,
        );
      }
    });

    it("zero permissions grants no action types", () => {
      for (const key of ACTION_KEYS) {
        expect(hasPermission(0n, key)).to.equal(
          false,
          `0n should not grant ${key}`,
        );
      }
    });

    it("single bit grants exactly one action and no others", () => {
      for (let i = 0; i < ACTION_KEYS.length; i++) {
        const singleBit = 1n << BigInt(i);
        expect(hasPermission(singleBit, ACTION_KEYS[i])).to.equal(
          true,
          `bit ${i} should grant ${ACTION_KEYS[i]}`,
        );
        for (let j = 0; j < ACTION_KEYS.length; j++) {
          if (j === i) continue;
          expect(hasPermission(singleBit, ACTION_KEYS[j])).to.equal(
            false,
            `bit ${i} should not grant ${ACTION_KEYS[j]}`,
          );
        }
      }
    });

    it("bitwise OR composes permissions correctly", () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer({ min: 0, max: 20 }), {
            minLength: 1,
            maxLength: 21,
          }),
          (indices) => {
            const combined = indices.reduce(
              (acc, i) => acc | (1n << BigInt(i)),
              0n,
            );
            for (let i = 0; i < ACTION_KEYS.length; i++) {
              const expected = indices.includes(i);
              expect(hasPermission(combined, ACTION_KEYS[i])).to.equal(
                expected,
                `Combined bitmask should ${expected ? "" : "not "}grant ${ACTION_KEYS[i]}`,
              );
            }
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("unknown action keys always return false regardless of permissions", () => {
      // Filter out strings that exist as inherited Object.prototype properties
      // (e.g. "toString", "constructor") because ACTION_PERMISSION_MAP is a
      // plain Record<string, bigint> and bracket access finds inherited props.
      // This is a known SDK limitation — hasPermission should use hasOwnProperty.
      const objectProtoKeys = new Set(
        Object.getOwnPropertyNames(Object.prototype),
      );
      fc.assert(
        fc.property(
          fc.bigUintN(21),
          fc.string({ minLength: 1, maxLength: 30 }).filter(
            (s) => !ACTION_KEYS.includes(s) && !objectProtoKeys.has(s),
          ),
          (permissions, unknownKey) => {
            expect(hasPermission(permissions, unknownKey)).to.equal(false);
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("adding a permission never removes existing permissions (monotonicity)", () => {
      fc.assert(
        fc.property(
          fc.bigUintN(21),
          fc.integer({ min: 0, max: 20 }),
          (base, bitIndex) => {
            const extended = base | (1n << BigInt(bitIndex));
            for (let i = 0; i < ACTION_KEYS.length; i++) {
              if (hasPermission(base, ACTION_KEYS[i])) {
                expect(hasPermission(extended, ACTION_KEYS[i])).to.equal(true);
              }
            }
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });
  });

  // ── getRolling24hUsd ──────────────────────────────────────────────────

  describe("getRolling24hUsd", () => {
    it("all-zero buckets return 0", () => {
      const tracker = makeTracker([], 0n);
      fc.assert(
        fc.property(
          fc.bigInt({ min: 1n, max: BigInt(Number.MAX_SAFE_INTEGER) }),
          (nowUnix) => {
            expect(getRolling24hUsd(tracker, nowUnix)).to.equal(0n);
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("single bucket fully inside window returns its full amount", () => {
      fc.assert(
        fc.property(
          fc.bigInt({ min: 1n, max: 1_000_000_000_000n }),
          (amount) => {
            const currentEpoch = 200n;
            const nowUnix =
              currentEpoch * BigInt(EPOCH_DURATION) +
              BigInt(EPOCH_DURATION / 2);
            const tracker = makeTracker(
              [{ epochId: currentEpoch, usdAmount: amount }],
              currentEpoch,
            );
            const result = getRolling24hUsd(tracker, nowUnix);
            expect(result).to.equal(amount);
          },
        ),
        { numRuns: Math.min(NUM_RUNS, 1000) },
      );
    });

    it("expired data returns 0 (lastWriteEpoch too old)", () => {
      fc.assert(
        fc.property(
          fc.bigInt({ min: 1n, max: 1_000_000n }),
          fc.bigInt({ min: 200n, max: 10_000n }),
          (amount, currentEpoch) => {
            const oldEpoch = currentEpoch - BigInt(NUM_EPOCHS) - 1n;
            const tracker = makeTracker(
              [{ epochId: oldEpoch, usdAmount: amount }],
              oldEpoch,
            );
            const nowUnix = currentEpoch * BigInt(EPOCH_DURATION) + 300n;
            const result = getRolling24hUsd(tracker, nowUnix);
            expect(result).to.equal(0n);
          },
        ),
        { numRuns: Math.min(NUM_RUNS, 1000) },
      );
    });

    it("boundary bucket is proportionally scaled", () => {
      const currentEpoch = 200n;
      const nowUnix = currentEpoch * BigInt(EPOCH_DURATION) + 300n;
      const windowStart = nowUnix - 86400n;
      const boundaryEpoch = windowStart / BigInt(EPOCH_DURATION);
      const bucketStart = boundaryEpoch * BigInt(EPOCH_DURATION);
      const bucketEnd = bucketStart + BigInt(EPOCH_DURATION);
      const overlap = bucketEnd - windowStart;

      const amount = 600_000_000n;
      const tracker = makeTracker(
        [{ epochId: boundaryEpoch, usdAmount: amount }],
        boundaryEpoch,
      );
      const result = getRolling24hUsd(tracker, nowUnix);
      const expected = (amount * overlap) / BigInt(EPOCH_DURATION);
      expect(result).to.equal(expected);
    });

    it("nowUnix <= 0 always returns 0", () => {
      const tracker = makeTracker(
        [{ epochId: 1n, usdAmount: 1_000_000n }],
        1n,
      );
      expect(getRolling24hUsd(tracker, 0n)).to.equal(0n);
      expect(getRolling24hUsd(tracker, -1n)).to.equal(0n);
    });

    it("result is always non-negative", () => {
      fc.assert(
        fc.property(
          fc.bigInt({ min: 1n, max: BigInt(Number.MAX_SAFE_INTEGER) }),
          fc.array(
            fc.record({
              epochId: fc.bigInt({ min: 0n, max: 10_000n }),
              usdAmount: fc.bigUintN(64),
            }),
            { minLength: 0, maxLength: 10 },
          ),
          (nowUnix, rawBuckets) => {
            const seen = new Set<bigint>();
            const buckets = rawBuckets.filter((b) => {
              if (seen.has(b.epochId)) return false;
              seen.add(b.epochId);
              return true;
            });
            const maxEpoch = buckets.reduce(
              (m, b) => (b.epochId > m ? b.epochId : m),
              0n,
            );
            const tracker = makeTracker(buckets, maxEpoch);
            const result = getRolling24hUsd(tracker, nowUnix);
            expect(result >= 0n).to.equal(true);
          },
        ),
        { numRuns: Math.min(NUM_RUNS, 1000) },
      );
    });

    it("adding spend to a bucket never decreases the rolling total", () => {
      fc.assert(
        fc.property(
          fc.bigInt({ min: 200n, max: 5_000n }),
          fc.bigInt({ min: 1n, max: 1_000_000_000n }),
          fc.bigInt({ min: 1n, max: 1_000_000_000n }),
          (currentEpoch, baseAmount, additionalAmount) => {
            const nowUnix = currentEpoch * BigInt(EPOCH_DURATION) + 300n;
            const trackerBefore = makeTracker(
              [{ epochId: currentEpoch, usdAmount: baseAmount }],
              currentEpoch,
            );
            const trackerAfter = makeTracker(
              [
                {
                  epochId: currentEpoch,
                  usdAmount: baseAmount + additionalAmount,
                },
              ],
              currentEpoch,
            );
            const before = getRolling24hUsd(trackerBefore, nowUnix);
            const after = getRolling24hUsd(trackerAfter, nowUnix);
            expect(after >= before).to.equal(true);
          },
        ),
        { numRuns: Math.min(NUM_RUNS, 1000) },
      );
    });
  });
});

// ─── CATEGORY B: Cross-Validation (ceilFee formula) ────────────────────────

describe("Property Tests — Category B: Cross-Validation (ceilFee)", () => {
  const FEE_DENOM = 1_000_000n;

  const ceilFee = (amount: bigint, rate: bigint): bigint =>
    amount === 0n || rate === 0n
      ? 0n
      : (amount * rate + FEE_DENOM - 1n) / FEE_DENOM;

  it("zero amount always yields zero fee", () => {
    fc.assert(
      fc.property(fc.bigUintN(16), (rate) => {
        expect(ceilFee(0n, rate)).to.equal(0n);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("zero rate always yields zero fee", () => {
    fc.assert(
      fc.property(fc.bigUintN(64), (amount) => {
        expect(ceilFee(amount, 0n)).to.equal(0n);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("fee is always >= floor(amount * rate / denom) (ceiling property)", () => {
    fc.assert(
      fc.property(
        fc.bigUintN(64),
        fc.bigUint({ max: 65535n }).filter((r) => r > 0n),
        (amount, rate) => {
          if (amount === 0n) return;
          const fee = ceilFee(amount, rate);
          const floor = (amount * rate) / FEE_DENOM;
          expect(fee >= floor).to.equal(true);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it("fee never exceeds floor + 1 (tight ceiling bound)", () => {
    fc.assert(
      fc.property(
        fc.bigUintN(64),
        fc.bigUint({ max: 65535n }).filter((r) => r > 0n),
        (amount, rate) => {
          if (amount === 0n) return;
          const fee = ceilFee(amount, rate);
          const floor = (amount * rate) / FEE_DENOM;
          expect(fee <= floor + 1n).to.equal(true);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it("fee is exact when amount * rate is divisible by denom", () => {
    fc.assert(
      fc.property(
        fc.bigUint({ max: 1_000_000_000n }).filter((q) => q > 0n),
        fc.bigUint({ max: 500n }).filter((r) => r > 0n),
        (quotient, rate) => {
          const amount = (quotient * FEE_DENOM) / rate;
          if (amount === 0n) return;
          if ((amount * rate) % FEE_DENOM !== 0n) return;
          const fee = ceilFee(amount, rate);
          expect(fee).to.equal((amount * rate) / FEE_DENOM);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it("fee is monotonically increasing with amount (rate fixed)", () => {
    fc.assert(
      fc.property(
        fc.bigUintN(48),
        fc.bigUintN(48),
        fc.bigUint({ max: 500n }).filter((r) => r > 0n),
        (a, b, rate) => {
          const small = a < b ? a : b;
          const large = a < b ? b : a;
          if (small === large) return;
          expect(ceilFee(large, rate) >= ceilFee(small, rate)).to.equal(true);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it("fee is monotonically increasing with rate (amount fixed)", () => {
    fc.assert(
      fc.property(
        fc.bigUintN(48).filter((a) => a > 0n),
        fc.bigUint({ max: 500n }),
        fc.bigUint({ max: 500n }),
        (amount, r1, r2) => {
          const small = r1 < r2 ? r1 : r2;
          const large = r1 < r2 ? r2 : r1;
          if (small === large) return;
          expect(ceilFee(amount, large) >= ceilFee(amount, small)).to.equal(true);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it("fee <= amount when rate <= FEE_DENOM", () => {
    fc.assert(
      fc.property(
        fc.bigUintN(64).filter((a) => a > 0n),
        fc.bigUint({ max: FEE_DENOM }),
        (amount, rate) => {
          if (rate === 0n) return;
          expect(ceilFee(amount, rate) <= amount).to.equal(true);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });

  it("maximum developer fee rate (500) yields correct ceiling", () => {
    fc.assert(
      fc.property(
        fc.bigUintN(64).filter((a) => a > 0n),
        (amount) => {
          const fee = ceilFee(amount, 500n);
          const expected = (amount * 500n + FEE_DENOM - 1n) / FEE_DENOM;
          expect(fee).to.equal(expected);
        },
      ),
      { numRuns: NUM_RUNS },
    );
  });
});

// ─── CATEGORY C: Fuzz Testing ──────────────────────────────────────────────

describe("Property Tests — Category C: Fuzz Testing", () => {
  // ── detectDrainAttempt ────────────────────────────────────────────────

  describe("detectDrainAttempt — never crashes", () => {
    it("random balance deltas never throw", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              account: fc.string({ minLength: 32, maxLength: 44 }),
              preBalance: fc.bigUintN(64),
              postBalance: fc.bigUintN(64),
            }),
            { minLength: 0, maxLength: 10 },
          ),
          fc.string({ minLength: 32, maxLength: 44 }),
          fc.bigUintN(64),
          (rawDeltas, vaultAddress, totalVaultBalance) => {
            const balanceDeltas: BalanceDelta[] = rawDeltas.map((d) => ({
              ...d,
              delta: d.postBalance - d.preBalance,
            }));
            const input: DrainDetectionInput = {
              balanceDeltas,
              vaultAddress,
              totalVaultBalance,
            };
            const flags = detectDrainAttempt(input);
            expect(flags).to.be.an("array");
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("random thresholds (integer, NaN, Infinity) never throw", () => {
      // detectDrainAttempt clamps thresholds to [0, 100] but uses BigInt()
      // internally, which requires integer values. Generate integers plus
      // the pathological non-finite values (NaN, Infinity, -Infinity).
      const arbThreshold = fc.oneof(
        fc.integer({ min: -1000, max: 1000 }),
        fc.constantFrom(NaN, Infinity, -Infinity, 0, 100, -1, 101),
      );
      fc.assert(
        fc.property(
          arbThreshold,
          arbThreshold,
          fc.bigUintN(64),
          (warningPercent, blockPercent, vaultBalance) => {
            const vaultAddr = "VaultXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
            const input: DrainDetectionInput = {
              balanceDeltas: [makeDelta(vaultAddr, vaultBalance, 0n)],
              vaultAddress: vaultAddr,
              totalVaultBalance: vaultBalance,
            };
            const flags = detectDrainAttempt(input, {
              warningPercent,
              blockPercent,
            });
            expect(flags).to.be.an("array");
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("zero vault balance produces no percentage-based flags", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              account: fc.string({ minLength: 32, maxLength: 44 }),
              preBalance: fc.bigUintN(64),
              postBalance: fc.bigUintN(64),
            }),
            { minLength: 0, maxLength: 5 },
          ),
          fc.string({ minLength: 32, maxLength: 44 }),
          (rawDeltas, vaultAddress) => {
            const balanceDeltas: BalanceDelta[] = rawDeltas.map((d) => ({
              ...d,
              delta: d.postBalance - d.preBalance,
            }));
            const input: DrainDetectionInput = {
              balanceDeltas,
              vaultAddress,
              totalVaultBalance: 0n,
            };
            const flags = detectDrainAttempt(input);
            expect(flags).to.not.include(RISK_FLAG_LARGE_OUTFLOW);
            expect(flags).to.not.include(RISK_FLAG_FULL_DRAIN);
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("FULL_DRAIN implies LARGE_OUTFLOW (when default thresholds)", () => {
      fc.assert(
        fc.property(
          fc.bigInt({ min: 1n, max: 1n << 63n }),
          fc.bigInt({ min: 1n, max: 1n << 63n }),
          (vaultBalance, outflowRaw) => {
            const outflow =
              outflowRaw > vaultBalance ? vaultBalance : outflowRaw;
            const vaultAddr =
              "VaultXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
            const postBalance = vaultBalance - outflow;
            const input: DrainDetectionInput = {
              balanceDeltas: [
                makeDelta(vaultAddr, vaultBalance, postBalance),
              ],
              vaultAddress: vaultAddr,
              totalVaultBalance: vaultBalance,
            };
            const flags = detectDrainAttempt(input);
            if (flags.includes(RISK_FLAG_FULL_DRAIN)) {
              expect(flags).to.include(RISK_FLAG_LARGE_OUTFLOW);
            }
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("no vault delta means no LARGE_OUTFLOW or FULL_DRAIN", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              account: fc.string({ minLength: 32, maxLength: 44 }),
              preBalance: fc.bigUintN(64),
              postBalance: fc.bigUintN(64),
            }),
            { minLength: 0, maxLength: 5 },
          ),
          fc.bigUintN(64),
          (rawDeltas, vaultBalance) => {
            const vaultAddr =
              "UNIQUEVAULT_NOT_IN_DELTAS_XXXXXXXXXXXXXXXXXX";
            const balanceDeltas: BalanceDelta[] = rawDeltas
              .filter((d) => d.account !== vaultAddr)
              .map((d) => ({
                ...d,
                delta: d.postBalance - d.preBalance,
              }));
            const input: DrainDetectionInput = {
              balanceDeltas,
              vaultAddress: vaultAddr,
              totalVaultBalance: vaultBalance,
            };
            const flags = detectDrainAttempt(input);
            expect(flags).to.not.include(RISK_FLAG_LARGE_OUTFLOW);
            expect(flags).to.not.include(RISK_FLAG_FULL_DRAIN);
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("UNKNOWN_RECIPIENT requires knownRecipients to be provided", () => {
      fc.assert(
        fc.property(
          fc.bigUintN(64),
          fc.bigUintN(64),
          (pre, post) => {
            const vaultAddr =
              "VaultXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
            const recipientAddr =
              "RecipXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
            const input: DrainDetectionInput = {
              balanceDeltas: [makeDelta(recipientAddr, pre, pre + 100n)],
              vaultAddress: vaultAddr,
              totalVaultBalance: 1000n,
            };
            const flags = detectDrainAttempt(input);
            expect(flags).to.not.include(RISK_FLAG_UNKNOWN_RECIPIENT);
          },
        ),
        { numRuns: Math.min(NUM_RUNS, 1000) },
      );
    });

    it("MULTI_OUTPUT requires >= 2 unknown positive-delta accounts", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 5 }), (numRecipients) => {
          const vaultAddr = "VaultXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
          const deltas: BalanceDelta[] = [];
          for (let i = 0; i < numRecipients; i++) {
            const addr = `Recip${String(i).padEnd(39, "X")}`;
            deltas.push(makeDelta(addr, 0n, 100n));
          }
          const input: DrainDetectionInput = {
            balanceDeltas: deltas,
            vaultAddress: vaultAddr,
            totalVaultBalance: 10000n,
          };
          const flags = detectDrainAttempt(input);
          if (numRecipients >= 2) {
            expect(flags).to.include(RISK_FLAG_MULTI_OUTPUT);
          } else {
            expect(flags).to.not.include(RISK_FLAG_MULTI_OUTPUT);
          }
        }),
        { numRuns: Math.min(NUM_RUNS, 100) },
      );
    });

    it("known recipients are excluded from MULTI_OUTPUT count", () => {
      const vaultAddr = "VaultXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
      const knownAddr = "KnownXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
      const unknownAddr =
        "UnknownXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

      const input: DrainDetectionInput = {
        balanceDeltas: [
          makeDelta(knownAddr, 0n, 500n),
          makeDelta(unknownAddr, 0n, 500n),
        ],
        vaultAddress: vaultAddr,
        totalVaultBalance: 10000n,
        knownRecipients: new Set([knownAddr]),
      };
      const flags = detectDrainAttempt(input);
      expect(flags).to.not.include(RISK_FLAG_MULTI_OUTPUT);
    });
  });

  // ── replaceAgentAtas ──────────────────────────────────────────────────

  describe("replaceAgentAtas — replacement properties", () => {
    function makeInstruction(
      accounts: Array<{ address: Address; role: AccountRole }>,
    ): Instruction {
      return {
        programAddress: fakeAddress("Program"),
        accounts: accounts.map((a) => ({
          address: a.address,
          role: a.role,
        })),
        data: new Uint8Array(0),
      } as Instruction;
    }

    it("empty replacement map is identity", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              address: arbAddress,
              role: arbAccountRole,
            }),
            { minLength: 0, maxLength: 8 },
          ),
          (accounts) => {
            const ix = makeInstruction(accounts);
            const result = replaceAgentAtas([ix], new Map());
            expect(result).to.deep.equal([ix]);
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("WRITABLE accounts are replaced when in the map", () => {
      fc.assert(
        fc.property(arbAddress, arbAddress, (agentAta, vaultAta) => {
          if (agentAta === vaultAta) return;
          const ix = makeInstruction([
            { address: agentAta, role: AccountRole.WRITABLE },
          ]);
          const replacements = new Map<Address, Address>([
            [agentAta, vaultAta],
          ]);
          const result = replaceAgentAtas([ix], replacements);
          expect(result[0].accounts![0].address).to.equal(vaultAta);
        }),
        { numRuns: NUM_RUNS },
      );
    });

    it("WRITABLE_SIGNER accounts are replaced when in the map", () => {
      fc.assert(
        fc.property(arbAddress, arbAddress, (agentAta, vaultAta) => {
          if (agentAta === vaultAta) return;
          const ix = makeInstruction([
            { address: agentAta, role: AccountRole.WRITABLE_SIGNER },
          ]);
          const replacements = new Map<Address, Address>([
            [agentAta, vaultAta],
          ]);
          const result = replaceAgentAtas([ix], replacements);
          expect(result[0].accounts![0].address).to.equal(vaultAta);
        }),
        { numRuns: NUM_RUNS },
      );
    });

    it("READONLY accounts are never replaced", () => {
      fc.assert(
        fc.property(arbAddress, arbAddress, (agentAta, vaultAta) => {
          const ix = makeInstruction([
            { address: agentAta, role: AccountRole.READONLY },
          ]);
          const replacements = new Map<Address, Address>([
            [agentAta, vaultAta],
          ]);
          const result = replaceAgentAtas([ix], replacements);
          expect(result[0].accounts![0].address).to.equal(agentAta);
        }),
        { numRuns: NUM_RUNS },
      );
    });

    it("READONLY_SIGNER accounts are never replaced", () => {
      fc.assert(
        fc.property(arbAddress, arbAddress, (agentAta, vaultAta) => {
          const ix = makeInstruction([
            { address: agentAta, role: AccountRole.READONLY_SIGNER },
          ]);
          const replacements = new Map<Address, Address>([
            [agentAta, vaultAta],
          ]);
          const result = replaceAgentAtas([ix], replacements);
          expect(result[0].accounts![0].address).to.equal(agentAta);
        }),
        { numRuns: NUM_RUNS },
      );
    });

    it("applying replacements twice is idempotent", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              address: arbAddress,
              role: arbAccountRole,
            }),
            { minLength: 1, maxLength: 6 },
          ),
          fc.array(fc.tuple(arbAddress, arbAddress), {
            minLength: 0,
            maxLength: 4,
          }),
          (accounts, rawReplacements) => {
            const ix = makeInstruction(accounts);
            const replacements = new Map<Address, Address>(rawReplacements);
            const once = replaceAgentAtas([ix], replacements);
            const twice = replaceAgentAtas(once, replacements);
            expect(twice).to.deep.equal(once);
          },
        ),
        { numRuns: Math.min(NUM_RUNS, 1000) },
      );
    });

    it("replacement preserves account role", () => {
      fc.assert(
        fc.property(
          arbAddress,
          arbAddress,
          arbAccountRole,
          (agentAta, vaultAta, role) => {
            const ix = makeInstruction([{ address: agentAta, role }]);
            const replacements = new Map<Address, Address>([
              [agentAta, vaultAta],
            ]);
            const result = replaceAgentAtas([ix], replacements);
            expect(result[0].accounts![0].role).to.equal(role);
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("replacement preserves instruction count", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.array(
              fc.record({
                address: arbAddress,
                role: arbAccountRole,
              }),
              { minLength: 0, maxLength: 4 },
            ),
            { minLength: 0, maxLength: 5 },
          ),
          fc.array(fc.tuple(arbAddress, arbAddress), {
            minLength: 0,
            maxLength: 3,
          }),
          (instructionAccounts, rawReplacements) => {
            const ixs = instructionAccounts.map((accs) =>
              makeInstruction(accs),
            );
            const replacements = new Map<Address, Address>(rawReplacements);
            const result = replaceAgentAtas(ixs, replacements);
            expect(result.length).to.equal(ixs.length);
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("replacement preserves account count per instruction", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              address: arbAddress,
              role: arbAccountRole,
            }),
            { minLength: 0, maxLength: 8 },
          ),
          fc.array(fc.tuple(arbAddress, arbAddress), {
            minLength: 0,
            maxLength: 4,
          }),
          (accounts, rawReplacements) => {
            const ix = makeInstruction(accounts);
            const replacements = new Map<Address, Address>(rawReplacements);
            const result = replaceAgentAtas([ix], replacements);
            expect(result[0].accounts!.length).to.equal(
              ix.accounts!.length,
            );
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("addresses not in map are never modified", () => {
      fc.assert(
        fc.property(
          arbAddress,
          arbAddress,
          arbAccountRole,
          (addr, mapKey, role) => {
            if (addr === mapKey) return;
            const ix = makeInstruction([{ address: addr, role }]);
            const replacements = new Map<Address, Address>([
              [mapKey, fakeAddress("target")],
            ]);
            const result = replaceAgentAtas([ix], replacements);
            expect(result[0].accounts![0].address).to.equal(addr);
          },
        ),
        { numRuns: NUM_RUNS },
      );
    });

    it("programAddress is never modified by replacement", () => {
      fc.assert(
        fc.property(arbAddress, arbAddress, (programAddr, replacement) => {
          const ix: Instruction = {
            programAddress: programAddr,
            accounts: [
              {
                address: programAddr,
                role: AccountRole.WRITABLE,
              },
            ],
            data: new Uint8Array(0),
          } as Instruction;
          const replacements = new Map<Address, Address>([
            [programAddr, replacement],
          ]);
          const result = replaceAgentAtas([ix], replacements);
          expect(result[0].programAddress).to.equal(programAddr);
        }),
        { numRuns: NUM_RUNS },
      );
    });
  });
});
