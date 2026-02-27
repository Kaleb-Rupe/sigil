import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import { createTriggerOrderJup } from "../../src/tools/create-trigger-order-jup";
import { createMockClient } from "../helpers/mock-client";

describe("shield_create_trigger_order_jup", () => {
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
    makingAmount: "100000000",
    takingAmount: "5000000000",
    expiredAt: 0,
  };

  it("creates trigger order successfully", async () => {
    const client = createMockClient();
    const result = await createTriggerOrderJup(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("Jupiter Trigger Order Created");
    expect(result).to.include("100000000");
    expect(result).to.include(inputMint);
    expect(result).to.include(outputMint);
    expect(result).to.include("Transaction");
  });

  it("calls createJupiterTriggerOrder with correct maker", async () => {
    const client = createMockClient();
    await createTriggerOrderJup(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    const call = client.calls.find(
      (c) => c.method === "createJupiterTriggerOrder",
    );
    expect(call).to.exist;
    expect(call!.args[0].maker).to.equal(
      mockCustodyWallet.publicKey.toBase58(),
    );
    expect(call!.args[0].payer).to.equal(
      mockCustodyWallet.publicKey.toBase58(),
    );
  });

  it("shows expiry when expiredAt is non-zero", async () => {
    const client = createMockClient();
    const futureTs = Math.floor(Date.now() / 1000) + 3600;
    const result = await createTriggerOrderJup(
      client as any,
      mockConfig,
      { ...validInput, expiredAt: futureTs },
      mockCustodyWallet,
    );
    expect(result).to.include("Jupiter Trigger Order Created");
    // Should contain an ISO date string, not "None"
    expect(result).not.to.include("None");
  });

  it("shows no expiry when expiredAt is 0", async () => {
    const client = createMockClient();
    const result = await createTriggerOrderJup(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("None");
  });

  it("returns error on SDK failure", async () => {
    const client = createMockClient({
      shouldThrow: new Error("network timeout"),
    });
    const result = await createTriggerOrderJup(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("network timeout");
  });
});
