# Entity Catalog — AI Agent Custody Competitive Landscape

## Status Legend
- **RESEARCHED** — Full profile created
- **PENDING** — Discovered, not yet deep-researched
- **SKIP** — Evaluated as not worth deep research

## Value Legend
- **CRITICAL** — Defines the domain. Must research.
- **HIGH** — Major player. Research if time allows.
- **MEDIUM** — Notable. Research in later iterations.
- **LOW** — Minor or dormant.

---

## Colosseum Hackathon Projects

| Entity | Category | Status | Value | Threat to Sigil | Notes |
|--------|----------|--------|-------|-------------------|-------|
| **Mercantill** | Competitor | RESEARCHED | LOW | NEGLIGIBLE | Repo 404. Squads Grid wrapper. Solo dev (frontend). Not in accelerator. Likely abandoned. |
| **AgentVault** | Competitor | RESEARCHED | LOW | NEGLIGIBLE | Repo is actually an EVM cross-chain swap (wrong project). Real "AgentVault" for Solana not found. |
| **Blockpal Smart Delegation** | Competitor | RESEARCHED | MEDIUM | LOW | Real Solana program (closed-source). 17 instructions, Merkle allowlists. No spending limits. SDK published but stale. |
| **Agent-Cred** | Competitor | RESEARCHED | LOW | NEGLIGIBLE | 538-line prototype. Spend-before-check vulnerability. Unchecked arithmetic. Dead since Nov 2025. |
| **Novel** | Competitor | RESEARCHED | LOW | NEGLIGIBLE | Repo 404. Cannot analyze. |
| **MCPay** | Adjacent | RESEARCHED | HIGH | LOW-MEDIUM | ONLY thriving project. 85 stars, npm published, $250K accelerator. x402 MCP payments. Complementary not competitive. |
| **Smart Wallet** | Competitor | RESEARCHED | LOW | NEGLIGIBLE | 640-line raw program. Per-tx limits only. Dead since Dec 2024. |
| **Agent Arc** | Adjacent | RESEARCHED | LOW | NEGLIGIBLE | Won 3rd AI. Pivoted to CEX trading bots. No longer on-chain. |
| **Latinum** | Adjacent | RESEARCHED | MEDIUM | LOW | Won 1st AI Breakout. MCP payment middleware. Complementary. |
| **Project Plutus** | Adjacent | RESEARCHED | LOW | NEGLIGIBLE | Agent deployment platform. Won 2nd AI. Potential customer not competitor. |

## Infrastructure Companies (Non-Colosseum)

| Entity | Category | Status | Value | Threat to Sigil | Notes |
|--------|----------|--------|-------|-------------------|-------|
| **Crossmint** | Key Mgmt + Policy | RESEARCHED | CRITICAL | HIGH | $23.6M raised. Agent wallets with Squads. Off-chain policy enforcement. 40K+ devs. |
| **Turnkey** | Key Management | RESEARCHED | CRITICAL | MEDIUM | $30M Series B. TEE custody. Ex-Coinbase team. Sigil uses Turnkey for custody layer. |
| **Squads Protocol** | Smart Accounts | RESEARCHED | CRITICAL | MEDIUM-HIGH | $10B+ secured. V5 Hooks could enable competitor building. Foundation of the Solana smart account stack. |
| **GLAM** | On-chain DeFi | RESEARCHED | HIGH | MEDIUM-HIGH | On-chain Solana program for AI agent DeFi guardrails. Vertical (fund mgmt only). Live on mainnet. |
| **Coinbase CDP** | Key Mgmt + Policy | RESEARCHED | HIGH | LOW (no Solana yet) | Agentic wallets with TEE. Spending limits. No Solana support yet. When launched, adjacent. |
| **Privy (Stripe)** | Key Management | RESEARCHED | MEDIUM | LOW-MEDIUM | Acquired by Stripe. Delegated actions on Solana. Basic policy enforcement. |
| **Lit Protocol** | Key Management | RESEARCHED | MEDIUM | LOW | PKPs for programmable signing. 24M+ requests on Solana. Key infra, not DeFi security. |
| **Shield3** | Policy Engine | PENDING | MEDIUM | LOW | Transaction firewall. Primarily EVM. Security research pending. |
| **Openfort** | Agent Wallets | RESEARCHED | MEDIUM | LOW-MEDIUM | "Money movement infra for AI agents." Primarily EVM, nascent Solana support. |
| **Halliday** | Protocol Protections | PENDING | HIGH | MEDIUM | Named by a16z for "protocol-level protections." Cross-chain. Need deep research. |

## Thesis/Research Sources

| Entity | Category | Status | Value | Notes |
|--------|----------|--------|-------|-------|
| **a16z "Agency by Design"** | Investor Thesis | RESEARCHED | CRITICAL | Sigil fits "Agent-Permissioning Frameworks." On-chain enforcement is unique. |
| **Galaxy "Raising for Robots"** | Investor Thesis | RESEARCHED | HIGH | Agents as economic actors. Secure permissions "early and unproven." |
| **a16z "Tourists in the Bazaar"** | Investor Thesis | RESEARCHED | HIGH | Scoped delegation model maps to Sigil session authority. |
| **Superteam "L1 Wars"** | Ecosystem Analysis | RESEARCHED | MEDIUM | Solana's agent infrastructure advantage. 99.99% agent-driven tx prediction. |
| **Colosseum "Request For Products"** | Builder Signal | RESEARCHED | MEDIUM | Explicitly called for agent treasury controls. |
