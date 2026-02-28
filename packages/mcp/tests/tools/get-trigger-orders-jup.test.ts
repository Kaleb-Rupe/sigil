import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import { getTriggerOrdersJup } from "../../src/tools/get-trigger-orders-jup";
import { createMockClient } from "../helpers/mock-client";

describe("shield_get_trigger_orders_jup", () => {
  const authority = Keypair.generate().publicKey.toBase58();

  it("returns formatted trigger order list", async () => {
    const client = createMockClient();
    const result = await getTriggerOrdersJup(client as any, { authority });
    expect(result).to.include("Jupiter Trigger Orders");
    expect(result).to.include("mock-order-1");
    expect(result).to.include("active");
    expect(result).to.include("100000000");
    expect(result).to.include("5000000000");
    expect(result).to.include("Remaining");
  });

  it("passes state filter to client", async () => {
    const client = createMockClient();
    await getTriggerOrdersJup(client as any, {
      authority,
      state: "completed",
    });
    const call = client.calls.find(
      (c) => c.method === "getJupiterTriggerOrders",
    );
    expect(call).to.exist;
    expect(call!.args[0]).to.equal(authority);
    expect(call!.args[1]).to.equal("completed");
  });

  it("returns empty message when no orders found", async () => {
    const client = createMockClient();
    // Override the mock to return empty array
    client.getJupiterTriggerOrders = async () => [];
    const result = await getTriggerOrdersJup(client as any, { authority });
    expect(result).to.include("No");
    expect(result).to.include("trigger orders found");
  });

  it("returns error on SDK failure", async () => {
    const client = createMockClient({
      shouldThrow: new Error("connection refused"),
    });
    const result = await getTriggerOrdersJup(client as any, { authority });
    expect(result).to.include("connection refused");
  });
});
