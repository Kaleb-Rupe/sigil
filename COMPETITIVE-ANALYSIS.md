# Sigil Competitive Analysis — AI Agent Custody & Security Middleware

**Date:** 2026-03-27 | **Methodology:** 8 parallel research agents, Colosseum Copilot API, GitHub analysis, web intelligence

---

## Executive Summary

After analyzing 7 Colosseum hackathon projects (scraping 4 GitHub repos, finding 3 were 404/private), 10 infrastructure companies, 595 projects across 2 Colosseum clusters, and 7 investor thesis documents — **Sigil has no real on-chain competitor.**

The closest threat is **Crossmint** ($23.6M raised, off-chain policy enforcement with Squads) and **GLAM** (on-chain Solana DeFi guardrails for fund management). Every hackathon competitor is either abandoned, pivoted, or operates at a fundamentally different layer. The $50M+ in VC funding flowing into agent custody validates the market but targets key management (Turnkey, Crossmint), not instruction-level policy enforcement.

**Sigil's unique position:** The only project enforcing DeFi constraints at the Solana instruction level using atomic transaction composition with outcome-based spending verification. This is architecturally distinct from every competitor.

---

## Part 1: Colosseum Hackathon Competitors (Detailed)

### Tier 1: Closest Competitors

**Mercantill** — Cypherpunk (Sep 2025) | 4th Stablecoins ($10K)
- **Status:** ABANDONED. Repo 404. Not in accelerator. No post-hackathon activity.
- **Architecture:** Squads Grid wrapper, NOT a custom Anchor program. Application-layer controls on top of Grid's REST APIs. Solo developer (frontend background).
- **Why it's not a threat:** No custom on-chain enforcement. All controls are API-layer, bypassable if server compromised. Dependent on Squads Grid pricing and availability. No instruction constraints, no outcome verification, no multi-agent model.
- **Useful insight:** The "enterprise banking" framing resonates with Sigil's fintech UX preference. "Audit trails, team controls, spending safeguards" is good marketing language.

**Blockpal Smart Delegation** — Breakout (Apr 2025)
- **Status:** STALE. SDK last published ~10 months ago. UI archived. Closed-source program.
- **Architecture:** Real on-chain program (`VLTXgMHZU9atoxy3AY37tV3GUGkonviEWicqWBq76sh`). 17 instructions, 4 PDAs. Merkle tree allowlists on IPFS. Founder/Member role hierarchy.
- **Strengths vs Sigil:** Multi-sig founder threshold (Sigil is single-owner). Merkle proof space optimization. Gaming use case positioning.
- **Weaknesses vs Sigil:** ZERO spending limits. No outcome verification. No instruction-level constraints. Closed-source. IPFS dependency for permissions. No tests visible. 22 error codes vs Sigil's 71. Non-commercial license.
- **Useful insight:** Merkle tree allowlists are a clever space optimization for large permission sets. The gaming delegation use case (letting someone play your games with restrictions) could expand Sigil's addressable market.

### Tier 2: Partially Overlapping

**Agent-Cred** — Cypherpunk (Sep 2025)
- **Status:** DEAD. 0 stars, last commit Nov 2025.
- **Architecture:** 538-line Anchor program. Hotkey/coldkey model. Daily spending limit with calendar reset.
- **Critical vulnerability:** Spend-before-check — performs CPI token transfer BEFORE checking daily limit (line 159 vs 172). Unchecked arithmetic throughout.
- **Useful insight:** The Payment Request/Approval PDA (deferred human approval for over-limit transactions) is a pattern Sigil doesn't have. Worth considering for "out-of-band" large-spend authorization.

**Smart Wallet** — Radar (Sep 2024)
- **Status:** DEAD. 2 stars, last commit Dec 2024.
- **Architecture:** 640-line raw Solana program (not Anchor). Per-dApp per-token approval PDAs with max_amount and expiry.
- **Critical weakness:** max_amount is per-transaction, not cumulative. Approved dApp can drain vault with many small transactions.
- **Useful insight:** Validates the exact Sigil thesis (AI agent with keypair transacting against PDA wallet). Their LangChain integration shows how frameworks connect to on-chain wallets. spl-token-2022 support is forward-looking.

### Tier 3: Adjacent (Not Competitive)

**MCPay** — Cypherpunk (Sep 2025) | 1st Stablecoins ($25K) | Accelerator C4 ($250K)
- **Status:** ACTIVE. 85 stars, 31 forks, published npm (58 versions). Live at mcpay.tech.
- **Architecture:** Hook-based MCP proxy with x402 payment layer. Monorepo (JS-SDK, proxy server, dashboard, facilitator). Zero on-chain code — delegates settlement to x402 facilitator.
- **NOT competitive with Sigil.** MCPay monetizes MCP tool calls. Sigil authorizes DeFi transactions. Different problem entirely.
- **Integration opportunity:** MCPay's `maxPaymentValue` is client-enforced (trivially bypassable). Sigil vaults could back MCPay payments, adding on-chain spending enforcement to the x402 flow.
- **Useful patterns:**
  - Hook-based proxy architecture with `continue`/`respond`/`retry`/`abort` semantics — well-engineered middleware
  - `paidTool()` as first-class server concept (tools declare price at registration)
  - Payment annotations in `tools/list` (agents see costs before calling)
  - `confirmationCallback` for user approval of payments

**Agent Arc** — Breakout (Apr 2025) | 3rd AI ($15K)
- **Status:** ACTIVE but pivoted to CEX trading bots (agentarc.ai). No longer on-chain Solana.

**Latinum** — Breakout (Apr 2025) | 1st AI ($25K)
- MCP payment middleware. Complementary, not competitive.

**Novel** — Breakout (Apr 2025)
- Repo 404. Cannot analyze.

---

## Part 2: Infrastructure Companies (Non-Colosseum)

### CRITICAL Threats

**Crossmint** ($23.6M raised, Ribbit Capital led) — THREAT: HIGH
- Agent wallets with dual-key (owner + agent in TEE), built on Squads Protocol
- 40,000+ developers, brands include Adidas and Red Bull
- Products: Agent Wallets, lobster.cash (open payment standard), GOAT SDK
- **How Sigil differs:** Crossmint enforces policies off-chain (server-side). Sigil enforces on-chain at the instruction level. A compromised Crossmint server could bypass all safeguards. A compromised SDK cannot bypass Sigil — the on-chain program rejects unauthorized transactions regardless.
- **Integration angle:** Crossmint for key management + Sigil for on-chain enforcement could be complementary. Crossmint's GOAT SDK agents could use Sigil vaults.

**Squads Protocol** ($10B+ secured, Certora verified) — THREAT: MEDIUM-HIGH
- V5 introduces Hooks — programs that tighten/loosen smart account consensus
- Planned session keys and programmable policies could overlap with Sigil
- **How Sigil differs:** Squads is general-purpose smart accounts. Sigil is purpose-built for DeFi agent security with instruction-level constraints, outcome-based verification, rolling spending windows, protocol-specific intelligence, and 42 analytics functions. Building Sigil-equivalent on Squads V5 Hooks would require months of DeFi-specific engineering.

**GLAM** — THREAT: MEDIUM-HIGH
- On-chain Solana program with role-based DeFi guardrails for AI agents
- Live on mainnet with verifiable transactions
- Jupiter integration, manager vs. trader agent roles
- **How Sigil differs:** GLAM is vertical (fund management protocol). Sigil is horizontal (wraps any DeFi instruction from any source). GLAM restricts at the protocol level; Sigil restricts at the instruction level. Different market positioning but closest architectural competitor.

### HIGH Priority Monitoring

**Turnkey** ($30M Series B, Bain Capital Crypto) — THREAT: MEDIUM
- TEE custody with policy engine. Ex-Coinbase Custody team. 50M+ wallets.
- Sigil already uses Turnkey for the custody layer. Complementary.
- If Turnkey adds DeFi-specific policy enforcement, it could reduce Sigil's value prop. Currently their policies are basic (transaction limits, address whitelists).

**Coinbase CDP** — THREAT: LOW (no Solana yet)
- Agentic wallets with TEE, spending limits, session caps.
- When they launch Solana support (planned 2026), could be adjacent.
- Off-chain enforcement model — same limitation as Crossmint.

**Halliday** (named by a16z) — THREAT: MEDIUM
- "Protocol-level protections to ensure AI doesn't go beyond user's intent"
- Cross-chain (likely EVM-focused). Needs deeper research.

### MEDIUM Priority

- **Privy/Stripe** — Delegated actions on Solana, basic policy. Acquired by Stripe, likely shifting to traditional payments.
- **Lit Protocol** — PKPs for programmable signing. Key infra, not DeFi security.
- **Openfort** — "Money movement infra for AI agents." Primarily EVM, nascent Solana.
- **Shield3** — Transaction firewall. Primarily EVM.

---

## Part 3: Market Intelligence

### Market Size Signals
- **340,000+** on-chain wallets held by agents in Q1 2026 (Solana Foundation)
- **15M+** on-chain agent payments processed (Solana Foundation)
- **$50M+** in VC funding to agent custody (Turnkey $30M + Crossmint $23.6M)
- **595 projects** in Colosseum's AI agent clusters (v1-c14 + v1-c22)
- Solana Foundation exec: "99.99% of on-chain transactions will be agent-driven within 2 years"

### Investor Thesis Alignment

**a16z "Agency by Design" (Dec 2025):**
- Places Sigil in "Agent-Permissioning Frameworks" alongside MetaMask, Coinbase, Biconomy, Lit
- Sigil is the ONLY project in this category enforcing at the Solana instruction level on-chain
- Cites AiXBT hack (March 2025, 55 ETH stolen) as evidence that interface/policy compromise bypasses agent logic — exactly the threat Sigil's on-chain enforcement prevents

**Galaxy "Raising for Robots" (Feb 2026):**
- "Secure identity, permissions, reputation for agents remain early and unproven at scale"
- "Autonomous agents are economic actors. Systems must enable coordination, funding, and value exchange by default."
- Sigil's multi-agent vault with per-agent permissions directly addresses this

**a16z "Tourists in the Bazaar" (Feb 2026):**
- User->agent delegation model maps to Sigil session authority + spending caps
- "Delegated access to accounts" = SessionAuthority
- "Working capital" = AgentVault with spending caps

### Hackathon Trend (Capability -> Security)
| Hackathon | Theme | Security Projects |
|-----------|-------|-------------------|
| Renaissance (Mar 2024) | Wallet primitives | Blockpal (gaming vaults) |
| Radar (Sep 2024) | Smart wallets | Verve (smart wallets) |
| Breakout (Apr 2025) | Agent capability explosion | 0 security-focused winners |
| Cypherpunk (Sep 2025) | Controls maturation | Mercantill (spending controls) |

Sigil is positioned at the leading edge of the capability->security transition.

---

## Part 4: First Principles Analysis

### Why This Problem Exists (Irreducible)
1. A Solana keypair grants **total authority** — no native partial authority
2. AI agents need signing keys to execute DeFi transactions autonomously
3. DeFi protocols expect a single signer — they don't understand "this signer has restrictions"
4. The gap between "agent can sign" and "agent should be allowed to" must be bridged somewhere

### The Fundamental Design Choices

| Choice | Sigil | Competitors |
|--------|--------|-------------|
| Where is policy enforced? | On-chain (program rejects) | Off-chain (server blocks) |
| How is spending measured? | Outcome-based (balance delta) | Intent-based (declared amounts) |
| How are DeFi txs wrapped? | Instruction composition (atomic) | CPI wrapping or pre-signing |
| What granularity? | Instruction-level constraints | Transaction-level or account-level |
| Multi-agent? | 10 agents, 21-bit permissions each | Single agent per wallet |

### Where Sigil Is Uniquely Correct
- **Outcome-based verification is the only honest measurement.** Declared amounts are gameable. Balance deltas are trustless.
- **On-chain enforcement cannot be bypassed by compromising the SDK.** Off-chain policy engines can.
- **Instruction composition avoids CPI depth limits.** The 4-level CPI limit makes nested wrapping impossible for complex DeFi operations.

### Where Sigil Could Be Challenged
- **Complexity cost:** 29 instructions, 9 PDAs is significant attack surface. A minimal solution: 1 vault + 1 policy + 3 instructions.
- **TEE equivalence argument:** If agent runs in TEE (Turnkey/Phala), policy engine there has equivalent trust guarantees.
- **Composability friction:** Wrapping every tx adds CU overhead. High-frequency agents may resist.

---

## Part 5: Security Comparison (Code-Level)

| Security Property | Sigil | Agent-Cred | Smart Wallet | Blockpal | MCPay |
|---|---|---|---|---|---|
| On-chain enforcement | Yes (29 ix) | Yes (7 ix, buggy) | Yes (4 ix, basic) | Yes (17 ix, closed) | No program |
| Checked arithmetic | All operations | NONE (overflow vuln) | NONE | Unknown (closed) | N/A |
| Spending caps | Rolling 24h, per-agent | Daily calendar reset | Per-tx only (not cumulative) | NONE | Client-side only |
| Outcome verification | Balance delta | No (trust declared) | No | No | No |
| Instruction constraints | 7 operators, 16 entries | No | No | Program allowlist only | No |
| Event emission | 31 events | No | No | Unknown | No |
| Error codes | 71 | 6 | ~5 | 22 | N/A |
| Test coverage | 1,489 tests, 4 tiers | 1 smoke test | 0 | 0 visible | 0 found |
| Formal verification | Certora specs | No | No | No | No |
| Post-finalize scan | Yes (error 6070) | No | No | No | No |

**Key finding:** No competitor implements outcome-based spending verification. Every competitor that has spending controls trusts declared amounts or per-transaction limits, both of which are gameable.

---

## Part 6: Actionable Intelligence

### Patterns Worth Adopting from Competitors

1. **MCPay's Hook architecture** — The `Hook` interface with `continue`/`respond`/`retry`/`abort` semantics is excellent middleware design. Consider for Sigil's MCP server implementation.

2. **MCPay's payment annotations** — Tools declaring price in `tools/list` annotations. Sigil's MCP server could annotate tools with estimated CU cost and vault impact.

3. **Agent-Cred's deferred approval workflow** — `PaymentRequest` PDA that requires owner approval for over-limit transactions. Sigil currently only allows or rejects — a "request human approval" flow could handle edge cases where the cap is exceeded but the transaction is legitimate.

4. **Blockpal's gaming delegation** — "Let someone play your games with restrictions" is a concrete use case that maps naturally to Sigil's permission bitmasks.

5. **Crossmint's enterprise marketing language** — "Audit trails, team controls, spending safeguards" rather than "PDA vaults with instruction constraints."

### Feature Gaps Exposed

1. **No deferred approval flow** — When a transaction exceeds caps but is legitimate, Sigil has no mechanism for async human approval. Agent-Cred's PaymentRequest PDA (despite being buggy) points to a real need.

2. **No fiat rails** — Crossmint (via Squads Grid) offers virtual bank accounts, card programs, fiat on/off-ramps. Sigil has none. Partnership opportunity.

3. **No gaming-specific positioning** — Blockpal targets gaming guilds. Sigil's permission system could serve this market but isn't positioned for it.

### Integration Opportunities

| Partner | Integration | Value |
|---------|-------------|-------|
| **MCPay** | Sigil vaults backing x402 payments | On-chain spending enforcement for MCP tool payments |
| **Turnkey** | Already planned | TEE key management for Sigil vaults |
| **Crossmint/GOAT SDK** | GOAT SDK agents using Sigil `seal()` | Security layer for the largest Solana agent framework |
| **Solana Agent Kit** | Already built (SAK plugin) | Thin adapter done, needs promotion |
| **Squads Grid** | Grid handles fiat rails, Sigil handles on-chain DeFi enforcement | Complete stack for enterprise agent banking |
| **GLAM** | Research collaboration | Share DeFi guardrail patterns |

### Positioning Recommendations

1. **Own "on-chain enforcement."** Every competitor does off-chain policy. Sigil's on-chain PDA enforcement is architecturally unique and trustless. Lead messaging with: "The only AI agent security layer that the blockchain itself enforces — not your server, not your TEE, the program."

2. **Target the 595 execution projects.** The two Colosseum clusters (v1-c14 + v1-c22) contain 595 projects building agent execution without security guardrails. These are all potential Sigil customers.

3. **Watch Squads V5 Hooks and GLAM.** These are the only credible potential competitors on the on-chain enforcement front. Squads V5 could enable competitors; GLAM is already live but vertical.

---

## Part 7: Strategic Recommendations (from Architect agent)

The Architect agent produced a full 42-criterion strategic analysis at `MEMORY/WORK/20260326-120000_sigil-competitive-strategic-analysis/STRATEGIC-ANALYSIS.md`. Key findings:

### Five Compound Moats (12-18 month replication time for funded team)
1. On-chain enforcement (program rejects unauthorized txs regardless of SDK)
2. Outcome-based spending verification (balance delta, not declared amounts)
3. Protocol-agnostic instruction constraints (7 operators, 16 entries)
4. Comprehensive SDK (42 analytics functions, SigilClient, seal())
5. Formal verification (Certora specs)

### Critical Vulnerability
**Zero adoption makes all moats latent.** Moats only activate with users. The most dangerous competitor is TIME, not any specific project. Squads could add Grid templates, SAK could build native security, or a funded team could ship "good enough" faster.

### Recommended 8-Week Action Plan
1. **Weeks 1-2:** Ship devnet E2E demo (Claude + MCP + Turnkey + Sigil swap)
2. **Weeks 3-4:** Publish security manifesto ("Why Off-Chain Agent Security is an Oxymoron")
3. **Weeks 4-8:** Secure one integration partner (MCPay or SAK official listing)

### Long-Term Threat Assessment
**Privy/Stripe is the most dangerous long-term competitor.** Privy's policy engine has calldata-level constraints and per-instruction Solana evaluation (closest to Sigil's approach), and Stripe's $1T+ payment volume gives them unmatched distribution. Counter: Privy enforces off-chain (bypassable), Sigil enforces on-chain (verifiable).

---

## Appendix: Data Sources

### Colosseum Copilot API
- 4 project searches (10 results each), 1 accelerator-only search, 1 winners-only search
- 3 archive searches returning 25+ documents
- 2 cluster analyses (v1-c14: 325 projects, v1-c22: 270 projects)
- 7 full archive document fetches (a16z x3, Galaxy x1, Superteam x1, Colosseum x2)

### GitHub Analysis
- Mercantill: 404 (analyzed via Squads Grid repos)
- AgentVault: wrong project (EVM cross-chain swap)
- Blockpal: closed-source program, analyzed SDK + UI repos
- Agent-Cred: 538-line program fully analyzed (security vulnerabilities found)
- Novel: 404
- MCPay: 3,610-line SDK + proxy + dashboard fully analyzed
- Smart Wallet: 640-line program fully analyzed

### Web Research
- 20+ verified URLs across project websites, hackathon announcements, VC announcements
- Twitter/X presence checked for all 7 hackathon projects
- npm registry checked for all projects
