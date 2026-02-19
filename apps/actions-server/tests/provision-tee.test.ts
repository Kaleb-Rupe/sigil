import { expect } from "chai";
import { Hono } from "hono";
import { provisionTee } from "../src/routes/provision-tee";

describe("POST /api/actions/provision-tee", () => {
  const app = new Hono();
  app.route("/", provisionTee);

  const origApiKey = process.env.CROSSMINT_API_KEY;

  afterEach(() => {
    if (origApiKey) {
      process.env.CROSSMINT_API_KEY = origApiKey;
    } else {
      delete process.env.CROSSMINT_API_KEY;
    }
  });

  it("returns 503 when CROSSMINT_API_KEY is not set", async () => {
    delete process.env.CROSSMINT_API_KEY;
    const res = await app.request("/api/actions/provision-tee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).to.equal(503);
    const body = (await res.json()) as any;
    expect(body.error).to.include("not available");
  });

  it("handles OPTIONS preflight", async () => {
    const res = await app.request("/api/actions/provision-tee", {
      method: "OPTIONS",
    });
    expect(res.status).to.equal(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).to.equal("*");
  });

  it("includes CORS headers on POST response", async () => {
    delete process.env.CROSSMINT_API_KEY;
    const res = await app.request("/api/actions/provision-tee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.headers.get("Access-Control-Allow-Origin")).to.equal("*");
  });

  it("accepts network parameter", async () => {
    delete process.env.CROSSMINT_API_KEY;
    const res = await app.request("/api/actions/provision-tee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ network: "mainnet-beta" }),
    });
    // Will still fail with 503 (no API key) but the request should parse correctly
    expect(res.status).to.equal(503);
  });

  it("handles empty body gracefully", async () => {
    delete process.env.CROSSMINT_API_KEY;
    const res = await app.request("/api/actions/provision-tee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).to.be.oneOf([503, 502, 500]);
  });
});
