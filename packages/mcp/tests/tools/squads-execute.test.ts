import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import { squadsExecute } from "../../src/tools/squads-execute";
import { createMockClient, createMockConfig } from "../helpers/mock-client";

describe("shield_squads_execute", () => {
  let mockConfig: ReturnType<typeof createMockConfig>;

  beforeEach(() => {
    mockConfig = createMockConfig();
  });

  afterEach(() => {
    mockConfig.cleanup();
  });

  const multisig = Keypair.generate().publicKey.toBase58();

  const validInput = {
    multisig,
    transactionIndex: "1",
  };

  it("executes vault transaction successfully", async () => {
    const client = createMockClient();
    const result = await squadsExecute(
      client as any,
      mockConfig as any,
      validInput,
    );
    expect(result).to.include("Vault Transaction Executed");
    expect(result).to.include(multisig);
    expect(result).to.include("mock-sig-squads-execute");
  });

  it("calls squadsExecuteTransaction on client", async () => {
    const client = createMockClient();
    await squadsExecute(client as any, mockConfig as any, validInput);
    const call = client.calls.find(
      (c) => c.method === "squadsExecuteTransaction",
    );
    expect(call).to.exist;
    const params = call!.args[0];
    expect(params.multisigPda.toBase58()).to.equal(multisig);
    expect(params.transactionIndex).to.equal(1n);
  });

  it("converts transactionIndex string to bigint", async () => {
    const client = createMockClient();
    await squadsExecute(client as any, mockConfig as any, {
      ...validInput,
      transactionIndex: "999",
    });
    const call = client.calls.find(
      (c) => c.method === "squadsExecuteTransaction",
    );
    expect(call!.args[0].transactionIndex).to.equal(999n);
  });

  it("returns error on invalid multisig address", async () => {
    const client = createMockClient();
    const result = await squadsExecute(client as any, mockConfig as any, {
      ...validInput,
      multisig: "bad-address",
    });
    expect(result).to.include("Invalid public key");
  });

  it("returns error on SDK failure (threshold not met)", async () => {
    const client = createMockClient({
      shouldThrow: new Error("Threshold not met"),
    });
    const result = await squadsExecute(
      client as any,
      mockConfig as any,
      validInput,
    );
    expect(result).to.include("Threshold not met");
  });
});
