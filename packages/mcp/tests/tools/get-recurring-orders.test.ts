import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import { getRecurringOrders } from "../../src/tools/get-recurring-orders";
import { createMockClient } from "../helpers/mock-client";

describe("shield_get_recurring_orders", () => {
  const user = Keypair.generate().publicKey.toBase58();

  it("returns formatted recurring order list", async () => {
    const client = createMockClient();
    const result = await getRecurringOrders(client as any, { user });
    expect(result).to.include("Jupiter Recurring Orders");
    expect(result).to.include("mock-recurring-1");
    expect(result).to.include("active");
    expect(result).to.include("5/10 orders");
    expect(result).to.include("24.0h");
    expect(result).to.include("Deposited");
    expect(result).to.include("Received");
    expect(result).to.include("Next Execution");
  });

  it("passes user to client method", async () => {
    const client = createMockClient();
    await getRecurringOrders(client as any, { user });
    const call = client.calls.find(
      (c) => c.method === "getJupiterRecurringOrders",
    );
    expect(call).to.exist;
    expect(call!.args[0]).to.equal(user);
  });

  it("returns empty message when no orders found", async () => {
    const client = createMockClient();
    // Override mock to return empty array
    client.getJupiterRecurringOrders = async () => [];
    const result = await getRecurringOrders(client as any, { user });
    expect(result).to.include("No recurring orders found");
    expect(result).to.include(user);
  });

  it("returns error on SDK failure", async () => {
    const client = createMockClient({
      shouldThrow: new Error("RPC unavailable"),
    });
    const result = await getRecurringOrders(client as any, { user });
    expect(result).to.include("RPC unavailable");
  });
});
