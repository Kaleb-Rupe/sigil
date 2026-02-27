import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import { createRecurringOrder } from "../../src/tools/create-recurring-order";
import { createMockClient } from "../helpers/mock-client";

describe("shield_create_recurring_order", () => {
  const inputMint = Keypair.generate().publicKey.toBase58();
  const outputMint = Keypair.generate().publicKey.toBase58();
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
    inputMint,
    outputMint,
    inAmount: "1000000000",
    numberOfOrders: 10,
    intervalSeconds: 86400,
  };

  it("creates recurring order successfully", async () => {
    const client = createMockClient();
    const result = await createRecurringOrder(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("Jupiter Recurring Order Created");
    expect(result).to.include("1000000000");
    expect(result).to.include(inputMint);
    expect(result).to.include(outputMint);
    expect(result).to.include("10");
    expect(result).to.include("24.0h");
  });

  it("calls createJupiterRecurringOrder with correct params", async () => {
    const client = createMockClient();
    await createRecurringOrder(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    const call = client.calls.find(
      (c) => c.method === "createJupiterRecurringOrder",
    );
    expect(call).to.exist;
    expect(call!.args[0].maker).to.equal(
      mockCustodyWallet.publicKey.toBase58(),
    );
    expect(call!.args[0].numberOfOrders).to.equal(10);
    expect(call!.args[0].intervalSeconds).to.equal(86400);
  });

  it("formats interval in hours correctly", async () => {
    const client = createMockClient();
    const result = await createRecurringOrder(
      client as any,
      mockConfig,
      { ...validInput, intervalSeconds: 3600 },
      mockCustodyWallet,
    );
    expect(result).to.include("1.0h");
  });

  it("includes transaction snippet in response", async () => {
    const client = createMockClient();
    const result = await createRecurringOrder(
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
      shouldThrow: new Error("insufficient funds"),
    });
    const result = await createRecurringOrder(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("insufficient funds");
  });
});
