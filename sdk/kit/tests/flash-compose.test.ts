/**
 * Flash Trade Compose Tests — Codama pre-generated builders
 *
 * Tests instruction building with static account configs.
 * No RPC, no protocol SDK needed.
 */

import { expect } from "chai";
import type { Address, Rpc, SolanaRpcApi } from "@solana/kit";
import type { ProtocolContext } from "../src/integrations/protocol-handler.js";
import { dispatchFlashTradeCompose } from "../src/integrations/flash-compose.js";
import { FlashTradeHandler } from "../src/integrations/t2-handlers.js";
import { PERPETUALS_PROGRAM } from "../src/integrations/config/flash-trade-markets.js";
import { OPEN_POSITION_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/openPosition.js";
import { CLOSE_POSITION_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/closePosition.js";
import { INCREASE_SIZE_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/increaseSize.js";
import { DECREASE_SIZE_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/decreaseSize.js";
import { ADD_COLLATERAL_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/addCollateral.js";
import { REMOVE_COLLATERAL_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/removeCollateral.js";
import { PLACE_TRIGGER_ORDER_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/placeTriggerOrder.js";
import { EDIT_TRIGGER_ORDER_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/editTriggerOrder.js";
import { CANCEL_TRIGGER_ORDER_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/cancelTriggerOrder.js";
import { PLACE_LIMIT_ORDER_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/placeLimitOrder.js";
import { EDIT_LIMIT_ORDER_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/editLimitOrder.js";
import { SWAP_AND_OPEN_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/swapAndOpen.js";
import { CLOSE_AND_SWAP_DISCRIMINATOR } from "../src/generated/protocols/flash-trade/instructions/closeAndSwap.js";

// ─── Test Context ────────────────────────────────────────────────────────────

const FAKE_VAULT = "11111111111111111111111111111111" as Address;
const FAKE_OWNER = "22222222222222222222222222222222" as Address;
const FAKE_AGENT = "33333333333333333333333333333333" as Address;
const FAKE_POSITION = "44444444444444444444444444444444" as Address;
const FAKE_ORDER = "55555555555555555555555555555555" as Address;

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

const DEFAULT_PRICE = { price: "150000000000", exponent: -9 };

function matchDiscriminator(data: Uint8Array | ArrayLike<number>, expected: ArrayLike<number>): boolean {
  for (let i = 0; i < 8; i++) {
    if (data[i] !== expected[i]) return false;
  }
  return true;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Flash Trade Compose (Codama)", () => {
  const ctx = makeCtx();

  describe("openPosition", () => {
    it("builds instruction with correct program address", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "openPosition", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        side: "long",
        priceWithSlippage: DEFAULT_PRICE,
        collateralAmount: "1000000000",
        sizeAmount: "5000000000",
      });
      expect(result.instructions).to.have.length(1);
      expect(result.instructions[0].programAddress).to.equal(PERPETUALS_PROGRAM);
    });

    it("returns additionalSigners (ephemeral position keypair)", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "openPosition", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        side: "long",
        priceWithSlippage: DEFAULT_PRICE,
        collateralAmount: "1000000000",
        sizeAmount: "5000000000",
      });
      expect(result.additionalSigners).to.have.length(1);
    });

    it("has correct discriminator", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "openPosition", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        side: "long",
        priceWithSlippage: DEFAULT_PRICE,
        collateralAmount: "1000000000",
        sizeAmount: "5000000000",
      });
      expect(matchDiscriminator(result.instructions[0].data!, OPEN_POSITION_DISCRIMINATOR)).to.be.true;
    });

    it("has correct account count (19)", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "openPosition", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        side: "long",
        priceWithSlippage: DEFAULT_PRICE,
        collateralAmount: "1000000000",
        sizeAmount: "5000000000",
      });
      expect(result.instructions[0].accounts!.length).to.equal(19);
    });
  });

  describe("closePosition", () => {
    it("builds with correct discriminator and no additionalSigners", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "closePosition", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        side: "long",
        priceWithSlippage: DEFAULT_PRICE,
        positionPubKey: FAKE_POSITION,
      });
      expect(result.instructions).to.have.length(1);
      expect(result.instructions[0].programAddress).to.equal(PERPETUALS_PROGRAM);
      expect(matchDiscriminator(result.instructions[0].data!, CLOSE_POSITION_DISCRIMINATOR)).to.be.true;
      expect(result.additionalSigners).to.be.undefined;
    });
  });

  describe("increasePosition", () => {
    it("builds correctly", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "increasePosition", {
        targetSymbol: "BTC",
        collateralSymbol: "USDC",
        side: "short",
        priceWithSlippage: DEFAULT_PRICE,
        sizeDelta: "100000000",
        positionPubKey: FAKE_POSITION,
      });
      expect(result.instructions).to.have.length(1);
      expect(matchDiscriminator(result.instructions[0].data!, INCREASE_SIZE_DISCRIMINATOR)).to.be.true;
    });
  });

  describe("decreasePosition", () => {
    it("builds correctly with no additionalSigners", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "decreasePosition", {
        targetSymbol: "ETH",
        collateralSymbol: "ETH",
        side: "long",
        priceWithSlippage: DEFAULT_PRICE,
        sizeDelta: "50000000",
        positionPubKey: FAKE_POSITION,
      });
      expect(result.instructions).to.have.length(1);
      expect(matchDiscriminator(result.instructions[0].data!, DECREASE_SIZE_DISCRIMINATOR)).to.be.true;
      expect(result.additionalSigners).to.be.undefined;
    });
  });

  describe("addCollateral", () => {
    it("builds correctly", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "addCollateral", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        side: "long",
        amount: "500000000",
        positionPubKey: FAKE_POSITION,
      });
      expect(result.instructions).to.have.length(1);
      expect(matchDiscriminator(result.instructions[0].data!, ADD_COLLATERAL_DISCRIMINATOR)).to.be.true;
    });
  });

  describe("removeCollateral", () => {
    it("builds correctly with no additionalSigners", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "removeCollateral", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        side: "long",
        amount: "100000000",
        positionPubKey: FAKE_POSITION,
      });
      expect(result.instructions).to.have.length(1);
      expect(matchDiscriminator(result.instructions[0].data!, REMOVE_COLLATERAL_DISCRIMINATOR)).to.be.true;
      expect(result.additionalSigners).to.be.undefined;
    });
  });

  describe("placeTriggerOrder", () => {
    it("returns additionalSigners (ephemeral order)", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "placeTriggerOrder", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        receiveSymbol: "USDC",
        side: "long",
        triggerPrice: DEFAULT_PRICE,
        deltaSizeAmount: "1000000000",
        isStopLoss: true,
        positionPubKey: FAKE_POSITION,
      });
      expect(result.additionalSigners).to.have.length(1);
      expect(matchDiscriminator(result.instructions[0].data!, PLACE_TRIGGER_ORDER_DISCRIMINATOR)).to.be.true;
    });
  });

  describe("editTriggerOrder", () => {
    it("builds with no additionalSigners", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "editTriggerOrder", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        receiveSymbol: "USDC",
        side: "long",
        orderId: 0,
        triggerPrice: DEFAULT_PRICE,
        deltaSizeAmount: "500000000",
        isStopLoss: false,
        positionPubKey: FAKE_POSITION,
        orderPubKey: FAKE_ORDER,
      });
      expect(result.instructions).to.have.length(1);
      expect(matchDiscriminator(result.instructions[0].data!, EDIT_TRIGGER_ORDER_DISCRIMINATOR)).to.be.true;
      expect(result.additionalSigners).to.be.undefined;
    });
  });

  describe("cancelTriggerOrder", () => {
    it("builds with minimal accounts", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "cancelTriggerOrder", {
        orderId: 1,
        isStopLoss: true,
        orderPubKey: FAKE_ORDER,
      });
      expect(result.instructions).to.have.length(1);
      expect(matchDiscriminator(result.instructions[0].data!, CANCEL_TRIGGER_ORDER_DISCRIMINATOR)).to.be.true;
      expect(result.additionalSigners).to.be.undefined;
    });
  });

  describe("placeLimitOrder", () => {
    it("returns additionalSigners (position + order keypairs)", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "placeLimitOrder", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        reserveSymbol: "USDC",
        receiveSymbol: "USDC",
        side: "long",
        limitPrice: DEFAULT_PRICE,
        reserveAmount: "1000000",
        sizeAmount: "5000000000",
        stopLossPrice: { price: "100000000000", exponent: -9 },
        takeProfitPrice: { price: "200000000000", exponent: -9 },
      });
      expect(result.additionalSigners).to.have.length(2);
      expect(matchDiscriminator(result.instructions[0].data!, PLACE_LIMIT_ORDER_DISCRIMINATOR)).to.be.true;
    });
  });

  describe("editLimitOrder", () => {
    it("builds with no additionalSigners", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "editLimitOrder", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        reserveSymbol: "USDC",
        receiveSymbol: "USDC",
        side: "long",
        orderId: 0,
        limitPrice: DEFAULT_PRICE,
        sizeAmount: "3000000000",
        stopLossPrice: { price: "100000000000", exponent: -9 },
        takeProfitPrice: { price: "200000000000", exponent: -9 },
        positionPubKey: FAKE_POSITION,
        orderPubKey: FAKE_ORDER,
      });
      expect(result.instructions).to.have.length(1);
      expect(matchDiscriminator(result.instructions[0].data!, EDIT_LIMIT_ORDER_DISCRIMINATOR)).to.be.true;
      expect(result.additionalSigners).to.be.undefined;
    });
  });

  describe("cancelLimitOrder", () => {
    it("uses editLimitOrder with sizeAmount=0 pattern", async () => {
      const result = await dispatchFlashTradeCompose(ctx, "cancelLimitOrder", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        reserveSymbol: "USDC",
        receiveSymbol: "USDC",
        side: "long",
        orderId: 0,
        positionPubKey: FAKE_POSITION,
        orderPubKey: FAKE_ORDER,
      });
      expect(result.instructions).to.have.length(1);
      // cancelLimitOrder reuses editLimitOrder
      expect(matchDiscriminator(result.instructions[0].data!, EDIT_LIMIT_ORDER_DISCRIMINATOR)).to.be.true;
    });
  });

  describe("swapAndOpen", () => {
    it("returns additionalSigners and prepends swap instructions", async () => {
      const fakeSwapIx = {
        programAddress: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" as Address,
        accounts: [],
        data: new Uint8Array([1, 2, 3]),
      };
      const result = await dispatchFlashTradeCompose(ctx, "swapAndOpen", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        side: "long",
        priceWithSlippage: DEFAULT_PRICE,
        collateralAmount: "1000000000",
        sizeAmount: "5000000000",
        swapInstructions: [fakeSwapIx],
      });
      expect(result.instructions).to.have.length(2); // swap + Flash open
      expect(result.instructions[0].programAddress).to.equal("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");
      expect(matchDiscriminator(result.instructions[1].data!, SWAP_AND_OPEN_DISCRIMINATOR)).to.be.true;
      expect(result.additionalSigners).to.have.length(1);
    });
  });

  describe("closeAndSwap", () => {
    it("appends swap instructions after close", async () => {
      const fakeSwapIx = {
        programAddress: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" as Address,
        accounts: [],
        data: new Uint8Array([4, 5, 6]),
      };
      const result = await dispatchFlashTradeCompose(ctx, "closeAndSwap", {
        targetSymbol: "SOL",
        collateralSymbol: "SOL",
        side: "long",
        priceWithSlippage: DEFAULT_PRICE,
        positionPubKey: FAKE_POSITION,
        swapInstructions: [fakeSwapIx],
      });
      expect(result.instructions).to.have.length(2); // Flash close + swap
      expect(matchDiscriminator(result.instructions[0].data!, CLOSE_AND_SWAP_DISCRIMINATOR)).to.be.true;
      expect(result.instructions[1].programAddress).to.equal("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4");
    });
  });

  describe("error cases", () => {
    it("throws for unsupported action", async () => {
      try {
        await dispatchFlashTradeCompose(ctx, "invalidAction", {});
        expect.fail("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include("Unsupported Flash Trade action");
      }
    });

    it("throws for missing required params", async () => {
      try {
        await dispatchFlashTradeCompose(ctx, "openPosition", {});
        expect.fail("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include("Missing required");
      }
    });

    it("throws for unknown symbol", async () => {
      try {
        await dispatchFlashTradeCompose(ctx, "openPosition", {
          targetSymbol: "UNKNOWN",
          collateralSymbol: "SOL",
          side: "long",
          priceWithSlippage: DEFAULT_PRICE,
          collateralAmount: "100",
          sizeAmount: "100",
        });
        expect.fail("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include("Unknown Flash Trade target symbol");
      }
    });
  });

  describe("Handler.summarize()", () => {
    const handler = new FlashTradeHandler();

    it("produces readable summaries", () => {
      expect(handler.summarize("openPosition", { targetSymbol: "SOL", side: "long" })).to.include("Flash open");
      expect(handler.summarize("closePosition", { targetSymbol: "BTC" })).to.include("Flash close");
      expect(handler.summarize("placeLimitOrder", { targetSymbol: "ETH", side: "short" })).to.include("Flash limit");
      expect(handler.summarize("cancelTriggerOrder", {})).to.include("Flash cancel trigger");
    });
  });

  describe("all 14 actions dispatch", () => {
    const actions = [
      "openPosition", "closePosition", "increasePosition", "decreasePosition",
      "addCollateral", "removeCollateral", "placeTriggerOrder", "editTriggerOrder",
      "cancelTriggerOrder", "placeLimitOrder", "editLimitOrder", "cancelLimitOrder",
      "swapAndOpen", "closeAndSwap",
    ];

    for (const action of actions) {
      it(`${action} does not throw "Unsupported"`, async () => {
        try {
          // Will throw for missing params, but NOT for unsupported action
          await dispatchFlashTradeCompose(ctx, action, {});
        } catch (e: any) {
          expect(e.message).to.not.include("Unsupported Flash Trade action");
        }
      });
    }
  });
});
