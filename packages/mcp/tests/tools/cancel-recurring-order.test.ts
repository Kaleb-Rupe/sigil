import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import { cancelRecurringOrder } from "../../src/tools/cancel-recurring-order";
import { createMockClient } from "../helpers/mock-client";

describe("shield_cancel_recurring_order", () => {
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
    orderId: "mock-recurring-456",
  };

  it("cancels recurring order successfully", async () => {
    const client = createMockClient();
    const result = await cancelRecurringOrder(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("Jupiter Recurring Order Cancelled");
    expect(result).to.include("mock-recurring-456");
    expect(result).to.include("Transaction");
  });

  it("calls cancelJupiterRecurringOrder with correct args", async () => {
    const client = createMockClient();
    await cancelRecurringOrder(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    const call = client.calls.find(
      (c) => c.method === "cancelJupiterRecurringOrder",
    );
    expect(call).to.exist;
    expect(call!.args[0]).to.equal("mock-recurring-456");
    expect(call!.args[1]).to.equal(mockCustodyWallet.publicKey.toBase58());
    expect(call!.args[2]).to.equal(mockCustodyWallet.publicKey.toBase58());
  });

  it("includes serialized transaction snippet in response", async () => {
    const client = createMockClient();
    const result = await cancelRecurringOrder(
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
      shouldThrow: new Error("order already cancelled"),
    });
    const result = await cancelRecurringOrder(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("order already cancelled");
  });
});
