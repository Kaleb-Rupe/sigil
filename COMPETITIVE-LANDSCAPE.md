# AI Agent Custody & Security Middleware — Competitive Landscape

**Created:** 2026-03-27
**Updated:** 2026-03-27
**Scope:** Solana-focused, includes cross-chain infrastructure competitors

## Overview

The AI agent custody/security middleware space is emerging rapidly on Solana, driven by 340,000+ on-chain agent wallets in Q1 2026 and $50M+ in VC funding. The market sits at the intersection of two macro trends: (1) AI agents becoming autonomous economic actors that need to execute DeFi transactions, and (2) the security gap between "agent can sign" and "agent should be allowed to."

Two Colosseum hackathon clusters contain 595 projects building AI agent infrastructure (v1-c14: 325 projects) and DeFi assistants (v1-c22: 270 projects). Of these 595 projects, essentially **zero** focus on instruction-level on-chain constraint enforcement. One (Mercantill) explicitly addresses spending controls. The rest build execution capabilities without security guardrails.

## Market Structure

### Three Layers of the Stack

| Layer | What It Does | Players |
|-------|-------------|---------|
| **Key Management** | Who holds the private key, how signing happens | Turnkey ($30M), Crossmint ($23.6M), Privy/Stripe, Lit Protocol, Coinbase CDP |
| **Policy Enforcement** | Rules constraining what agents can do | **Sigil** (on-chain), Shield3 (off-chain), Squads V5 Hooks (planned), GLAM (vertical) |
| **Execution** | What agents actually do in DeFi | Solana Agent Kit, GOAT SDK, Agent Arc, MCPay, Latinum |

Sigil uniquely spans Layers 2 and 3 — it enforces policies AND wraps execution.

### Competitive Segmentation

**On-chain policy enforcement (Sigil's category):**
- Sigil — PDA vaults, instruction constraints, outcome-based verification (ONLY player)
- GLAM — On-chain DeFi guardrails but vertical (fund management only)
- Squads V5 Hooks — Potential future competitor (not yet shipped)

**Off-chain policy enforcement:**
- Crossmint Agent Wallets — Server-side spending limits, dual-key with Squads
- Turnkey — TEE-based policy engine, transaction limits, address whitelisting
- Coinbase CDP — TEE wallets, programmable spending limits (no Solana yet)
- Privy — Delegated actions with transfer limits, protocol restrictions
- Shield3 — Transaction firewall (primarily EVM)

**Payment middleware (adjacent, not competitive):**
- MCPay — x402 payments for MCP tools, $25K prize + $250K accelerator
- Latinum — MCP wallet for agent-to-service payments, $25K 1st Place AI

## Key Dynamics

### The Maturation Curve
Colosseum hackathon data shows a clear progression:
- **Renaissance (Mar 2024)**: Wallet primitives (smart wallets, account abstraction)
- **Radar (Sep 2024)**: Smart wallets, embedded wallets, early agent concepts
- **Breakout (Apr 2025)**: Agent capability explosion (AI track introduced, 1st/2nd/3rd all AI-agent projects)
- **Cypherpunk (Sep 2025)**: Security/controls maturation (Mercantill wins for "spending controls for AI agents")

The field follows the classic security adoption pattern: capability first, then controls. Sigil is positioned at the leading edge of the controls wave.

### The Squads Question
Squads Protocol ($10B+ secured, OtterSec audited, Certora verified) is the gravitational center for smart accounts on Solana. Mercantill built on Squads Grid. Crossmint uses Squads for their agent wallets. Squads V5 introduces "Hooks" — programs that can tighten/loosen smart account consensus.

**Risk:** Squads V5 Hooks could theoretically enable Sigil-like functionality.
**Counter:** Building instruction-level DeFi constraint enforcement requires deep protocol-specific knowledge (discriminator bytes, account layouts, action type classification) that took Sigil months to build. Squads provides the primitive; Sigil provides the intelligence.

### Investor Thesis Validation
- **a16z "Agency by Design" (Dec 2025)**: Taxonomizes agent-permissioning frameworks. Names MetaMask, Coinbase, Biconomy, Lit. None do on-chain instruction-level enforcement on Solana.
- **Galaxy "Raising for Robots" (Feb 2026)**: "Secure identity, permissions, reputation for agents remain early and unproven." Sigil directly addresses this.
- **a16z "AI x Crypto Crossovers" (Jun 2025)**: Names Halliday for "protocol-level protections to ensure AI doesn't go beyond user's intent" — closest named competitor concept to Sigil.

## Entity Categories

| Category | Description | Count |
|----------|-------------|-------|
| **Colosseum Competitors** | Hackathon projects in the same space | 7 analyzed |
| **Infrastructure Companies** | Funded companies with agent custody products | 8 identified |
| **Payment Middleware** | Adjacent projects (x402, MCP payments) | 3 identified |
| **Investor/Thesis Sources** | VCs and research validating the space | 5 identified |

## Sources

All URLs verified via WebFetch or agent-confirmed:
- Colosseum Copilot API: 5,400+ projects, 65+ archive sources, 6,300+ Grid products
- GitHub: 7 repos analyzed (3 were 404/private)
- Web research: 20+ verified URLs (see ENTITIES.md for per-entity sources)
- Archive documents: a16z, Galaxy, Superteam, Colosseum Codex
