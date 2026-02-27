import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import { squadsStatus } from "../../src/tools/squads-status";
import { createMockClient } from "../helpers/mock-client";

describe("shield_squads_status", () => {
  const multisig = Keypair.generate().publicKey.toBase58();

  it("returns multisig info", async () => {
    const client = createMockClient();
    const result = await squadsStatus(client as any, { multisig });
    expect(result).to.include("Squads Multisig Status");
    expect(result).to.include("Threshold");
    expect(result).to.include("2-of-3");
    expect(result).to.include("Members");
  });

  it("calls squadsFetchMultisigInfo", async () => {
    const client = createMockClient();
    await squadsStatus(client as any, { multisig });
    const call = client.calls.find(
      (c) => c.method === "squadsFetchMultisigInfo",
    );
    expect(call).to.exist;
  });

  it("includes proposal status when transactionIndex provided", async () => {
    const client = createMockClient();
    const result = await squadsStatus(client as any, {
      multisig,
      transactionIndex: "1",
    });
    expect(result).to.include("Proposal #1");
    expect(result).to.include("Active");
    expect(result).to.include("Approvals");
  });

  it("fetches proposal info when transactionIndex provided", async () => {
    const client = createMockClient();
    await squadsStatus(client as any, {
      multisig,
      transactionIndex: "3",
    });
    const call = client.calls.find(
      (c) => c.method === "squadsFetchProposalInfo",
    );
    expect(call).to.exist;
  });

  it("shows members with permissions", async () => {
    const client = createMockClient();
    const result = await squadsStatus(client as any, { multisig });
    expect(result).to.include("Initiate");
    expect(result).to.include("Vote");
    expect(result).to.include("Execute");
  });

  it("returns error on invalid multisig address", async () => {
    const client = createMockClient();
    const result = await squadsStatus(client as any, {
      multisig: "not-a-key",
    });
    expect(result).to.include("Invalid public key");
  });

  it("returns error on SDK failure", async () => {
    const client = createMockClient({
      shouldThrow: new Error("Account not found"),
    });
    const result = await squadsStatus(client as any, { multisig });
    expect(result).to.include("Account not found");
  });
});
