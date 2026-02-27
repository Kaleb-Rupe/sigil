import { expect } from "chai";
import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { syncPositions } from "../../src/tools/sync-positions";
import { createMockClient, TEST_VAULT_PDA } from "../helpers/mock-client";
import type { McpConfig } from "../../src/config";

describe("shield_sync_positions", () => {
  let tmpDir: string;
  let agentKeypairPath: string;
  let config: McpConfig;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-sync-test-"));
    const kp = Keypair.generate();
    agentKeypairPath = path.join(tmpDir, "agent.json");
    fs.writeFileSync(
      agentKeypairPath,
      JSON.stringify(Array.from(kp.secretKey)),
    );
    config = {
      walletPath: agentKeypairPath,
      rpcUrl: "http://localhost:8899",
      agentKeypairPath,
    };
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("syncs positions successfully", async () => {
    const client = createMockClient();
    const pool = Keypair.generate().publicKey;
    const custody = Keypair.generate().publicKey;
    const result = await syncPositions(client as any, config, {
      vault: TEST_VAULT_PDA.toBase58(),
      poolCustodyPairs: [
        { pool: pool.toBase58(), custody: custody.toBase58() },
      ],
    });
    expect(result).to.satisfy(
      (s: string) =>
        s.includes("Positions Synced") ||
        s.includes("Positions Already In Sync"),
    );
  });

  it("calls syncPositions on client", async () => {
    const client = createMockClient();
    const pool = Keypair.generate().publicKey;
    const custody = Keypair.generate().publicKey;
    await syncPositions(client as any, config, {
      vault: TEST_VAULT_PDA.toBase58(),
      poolCustodyPairs: [
        { pool: pool.toBase58(), custody: custody.toBase58() },
      ],
    });
    expect(client.calls.some((c) => c.method === "syncPositions")).to.be.true;
  });

  it("returns error on failure", async () => {
    const client = createMockClient({
      shouldThrow: new Error("Not vault owner"),
    });
    const pool = Keypair.generate().publicKey;
    const custody = Keypair.generate().publicKey;
    const result = await syncPositions(client as any, config, {
      vault: TEST_VAULT_PDA.toBase58(),
      poolCustodyPairs: [
        { pool: pool.toBase58(), custody: custody.toBase58() },
      ],
    });
    expect(result).to.include("Not vault owner");
  });
});
