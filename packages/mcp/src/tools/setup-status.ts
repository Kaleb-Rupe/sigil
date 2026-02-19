import { z } from "zod";
import {
  loadShieldConfig,
  getCurrentTier,
  type ShieldLocalConfig,
} from "../config";

export const setupStatusSchema = z.object({});

export type SetupStatusInput = z.infer<typeof setupStatusSchema>;

/**
 * Check the current AgentShield setup status.
 * Reads ~/.agentshield/config.json and reports tier, wallet, policy, network.
 * If Tier 3 (vault), also includes vault address.
 *
 * This tool works without an SDK client — it only reads local config.
 */
export async function setupStatus(
  _client: any,
  _input: SetupStatusInput,
): Promise<string> {
  const config = loadShieldConfig();

  if (!config) {
    return [
      "## AgentShield Setup Status",
      "",
      "**Status:** Not configured",
      "",
      "AgentShield is not configured on this machine. Ask me to set it up!",
      "",
      "I can configure three layers of protection:",
      "- **Shield** (Tier 1) — Software spending controls, free, instant",
      "- **TEE** (Tier 2) — Hardware enclave key protection, free, ~30s",
      "- **Vault** (Tier 3) — On-chain policy enforcement, ~0.003 SOL, ~2min",
      "",
      'Say "Set up AgentShield" to get started.',
    ].join("\n");
  }

  const tier = getCurrentTier(config);
  const tierLabels: Record<number, string> = {
    1: "Shield (software controls)",
    2: "Shield + TEE (hardware enclave)",
    3: "Shield + TEE + Vault (on-chain enforcement)",
  };

  const lines: string[] = [
    "## AgentShield Setup Status",
    "",
    `**Current Tier:** ${tier} — ${tierLabels[tier]}`,
    `**Network:** ${config.network}`,
    `**Template:** ${config.template}`,
    `**Configured:** ${config.configuredAt}`,
    "",
  ];

  // Wallet info
  lines.push("### Wallet");
  lines.push(`- **Type:** ${config.wallet.type}`);
  lines.push(`- **Public Key:** ${config.wallet.publicKey}`);
  if (config.wallet.path) {
    lines.push(`- **Keypair Path:** ${config.wallet.path}`);
  }
  lines.push("");

  // Shield layer
  lines.push("### Shield Layer (Tier 1)");
  const shield = config.layers.shield;
  lines.push(`- **Enabled:** ${shield.enabled}`);
  if (shield.enabled) {
    lines.push(`- **Daily Cap:** $${shield.dailyCapUsd}`);
    lines.push(
      `- **Allowed Protocols:** ${shield.allowedProtocols.length > 0 ? shield.allowedProtocols.join(", ") : "Any"}`,
    );
    lines.push(`- **Max Leverage:** ${shield.maxLeverageBps} BPS`);
    lines.push(`- **Rate Limit:** ${shield.rateLimit} tx/min`);
  }
  lines.push("");

  // TEE layer
  lines.push("### TEE Layer (Tier 2)");
  const tee = config.layers.tee;
  lines.push(`- **Enabled:** ${tee.enabled}`);
  if (tee.enabled) {
    lines.push(`- **Public Key:** ${tee.publicKey}`);
    lines.push(`- **Locator:** ${tee.locator}`);
  }
  lines.push("");

  // Vault layer
  lines.push("### Vault Layer (Tier 3)");
  const vault = config.layers.vault;
  lines.push(`- **Enabled:** ${vault.enabled}`);
  if (vault.enabled) {
    lines.push(`- **Vault Address:** ${vault.address}`);
    lines.push(`- **Owner:** ${vault.owner}`);
    lines.push(`- **Vault ID:** ${vault.vaultId}`);
  }

  // Upgrade suggestion
  if (tier < 3) {
    lines.push("");
    lines.push("### Recommended Upgrade");
    if (tier === 1) {
      lines.push(
        "For production use, add **TEE custody** (Tier 2) to protect your agent's private key in a hardware enclave.",
      );
    } else {
      lines.push(
        "For maximum security (>$5k/day), add **on-chain Vault** (Tier 3) for blockchain-enforced policy limits.",
      );
    }
    lines.push('Say "Upgrade my security" to add the next layer.');
  }

  return lines.join("\n");
}

export const setupStatusTool = {
  name: "shield_setup_status",
  description:
    "Check the current AgentShield setup status. Shows which security tiers are active, " +
    "wallet configuration, and policy settings. Works even when AgentShield is not configured — " +
    "reports setup instructions in that case.",
  schema: setupStatusSchema,
  handler: setupStatus,
};
