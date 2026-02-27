import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import { cancelTriggerOrderJup } from "../../src/tools/cancel-trigger-order-jup";
import { createMockClient } from "../helpers/mock-client";

describe("shield_cancel_trigger_order_jup", () => {
  const mockConfig = {
    walletPath: "/tmp/fake-wallet.json",
    rpcUrl: "https://api.devnet.solana.com",
    agentKeypairPath: "/tmp/fake-agent.json",
  } as any;

  const mockCustodyWallet = {
    publicKey: Keypair.generate().publicKey,
    signTransaction: async <T>(tx: T): Promise<T> => tx,
  };

  const validInput = {
    orderId: "mock-order-123",
  };

  it("cancels trigger order successfully", async () => {
    const client = createMockClient();
    const result = await cancelTriggerOrderJup(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("Jupiter Trigger Order Cancelled");
    expect(result).to.include("mock-order-123");
    expect(result).to.include("Transaction");
  });

  it("calls cancelJupiterTriggerOrder with correct args", async () => {
    const client = createMockClient();
    await cancelTriggerOrderJup(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    const call = client.calls.find(
      (c) => c.method === "cancelJupiterTriggerOrder",
    );
    expect(call).to.exist;
    expect(call!.args[0]).to.equal("mock-order-123");
    expect(call!.args[1]).to.equal(mockCustodyWallet.publicKey.toBase58());
    expect(call!.args[2]).to.equal(mockCustodyWallet.publicKey.toBase58());
  });

  it("includes serialized transaction snippet in response", async () => {
    const client = createMockClient();
    const result = await cancelTriggerOrderJup(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("Transaction:");
    expect(result).to.include("...");
  });

  it("returns error on SDK failure", async () => {
    const client = createMockClient({
      shouldThrow: new Error("order not found"),
    });
    const result = await cancelTriggerOrderJup(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("order not found");
  });
});
