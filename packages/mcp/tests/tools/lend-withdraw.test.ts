import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import { lendWithdraw } from "../../src/tools/lend-withdraw";
import { createMockClient, TEST_VAULT_PDA } from "../helpers/mock-client";

describe("shield_lend_withdraw", () => {
  const mint = Keypair.generate().publicKey.toBase58();
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
    vault: TEST_VAULT_PDA.toBase58(),
    mint,
    amount: "500000",
  };

  it("withdraws successfully with custody wallet", async () => {
    const client = createMockClient();
    const result = await lendWithdraw(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("Lend Withdrawal Complete");
    expect(result).to.include("mock-sig-lend-withdraw");
    expect(result).to.include(TEST_VAULT_PDA.toBase58());
    expect(result).to.include(mint);
    expect(result).to.include("500000");
  });

  it("calls jupiterLendWithdraw with correct params", async () => {
    const client = createMockClient();
    await lendWithdraw(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    const call = client.calls.find((c) => c.method === "jupiterLendWithdraw");
    expect(call).to.exist;
    expect(call!.args[0].agent.toBase58()).to.equal(
      mockCustodyWallet.publicKey.toBase58(),
    );
    expect(call!.args[0].amount.toString()).to.equal("500000");
  });

  it("mentions non-spending in response", async () => {
    const client = createMockClient();
    const result = await lendWithdraw(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("non-spending");
  });

  it("returns error on SDK failure", async () => {
    const client = createMockClient({
      shouldThrow: Object.assign(new Error("test"), { code: 6000 }),
    });
    const result = await lendWithdraw(
      client as any,
      mockConfig,
      validInput,
      mockCustodyWallet,
    );
    expect(result).to.include("VaultNotActive");
  });

  it("returns error on invalid vault address", async () => {
    const client = createMockClient();
    const result = await lendWithdraw(
      client as any,
      mockConfig,
      { ...validInput, vault: "not-a-pubkey" },
      mockCustodyWallet,
    );
    expect(result).to.include("Invalid public key");
  });
});
