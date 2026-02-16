# TASKS.md — Build Sequence & Progress Tracker

## Phase 1: Core Permission Engine (MVP) ✅

### 1.1 Project Setup ✅
- [x] Initialize Anchor project with `anchor init`
- [x] Configure Anchor.toml for localnet and devnet
- [x] Set up TypeScript test infrastructure
- [x] Verify `anchor build` and `anchor test` work with empty program

### 1.2 State Accounts ✅
- [x] Implement `state/vault.rs` — AgentVault account struct
- [x] Implement `state/policy.rs` — PolicyConfig account struct
- [x] Implement `state/tracker.rs` — SpendTracker, SpendEntry, TransactionRecord
- [x] Implement `state/session.rs` — SessionAuthority account struct (includes `action_type` field)
- [x] Implement `state/mod.rs` — VaultStatus, ActionType enums, constants
- [x] Verify all state compiles with `anchor build`

### 1.3 Errors & Events ✅
- [x] Implement `errors.rs` — all error codes from PROJECT.md
- [x] Implement `events.rs` — all events from PROJECT.md (including `FeesCollected`)
- [x] Verify compilation

### 1.4 Vault Management Instructions ✅
- [x] Implement `initialize_vault.rs` + tests
  - Test: creates vault, policy, and tracker PDAs ✅
  - Test: sets correct initial values ✅
  - Test: rejects duplicate vault_id ✅
- [x] Implement `deposit_funds.rs` + tests
  - Test: transfers tokens into vault PDA token account ✅
  - Test: rejects non-owner signer ✅
- [x] Implement `register_agent.rs` + tests
  - Test: registers agent pubkey ✅
  - Test: rejects if agent already registered ✅
  - Test: rejects non-owner signer ✅
- [x] Implement `update_policy.rs` + tests
  - Test: updates each field independently (Option pattern) ✅
  - Test: rejects non-owner signer ✅
  - Test: validates policy constraints (max tokens, max protocols) ✅
- [x] Implement `revoke_agent.rs` (kill switch) + tests
  - Test: sets vault status to Frozen ✅
  - Test: rejects non-owner signer ✅
  - Test: works when vault is already frozen (idempotent) ✅
- [x] Implement `reactivate_vault.rs` + tests
  - Test: sets vault status back to Active ✅
  - Test: optionally rotates agent key ✅
  - Test: rejects reactivating an already-active vault ✅
- [x] Implement `withdraw_funds.rs` + tests
  - Test: transfers tokens from vault to owner ✅
  - Test: rejects non-owner signer ✅
  - Test: rejects insufficient balance ✅
- [x] Implement `close_vault.rs` + tests
  - Test: closes vault and reclaims rent ✅
  - Test: rejects non-owner signer ✅

### 1.5 Permission Engine (Core Product) ✅
- [x] Implement `validate_and_authorize.rs`
  - [x] Check vault status is Active
  - [x] Check signer is registered agent
  - [x] Check token_mint is in allowed_tokens
  - [x] Check target_protocol is in allowed_protocols
  - [x] Check amount <= max_transaction_size
  - [x] Calculate rolling 24h spend, prune expired entries
  - [x] Check amount + rolling_spend <= daily_spending_cap
  - [x] If perp action: check leverage_bps <= max_leverage_bps
  - [x] If opening position: check count < max_concurrent_positions
  - [x] Create SessionAuthority PDA with expiry
  - [x] Store action_type in session for finalize to use
  - [x] Update SpendTracker
  - [x] Emit ActionAuthorized event
  - Tests:
    - [x] Happy path: agent authorized for valid action
    - [x] Denied: vault is frozen
    - [x] Denied: wrong agent key
    - [x] Denied: token not in whitelist
    - [x] Denied: protocol not in whitelist
    - [x] Denied: single tx exceeds max size
    - [x] Denied: daily cap exceeded (multiple small txs)
    - [x] Edge: session already exists (double-auth prevented)

- [x] Implement `finalize_session.rs`
  - [x] Verify session belongs to vault
  - [x] Record transaction in SpendTracker audit log (with correct action_type)
  - [x] Update open_positions counter (increment on OpenPosition, decrement on ClosePosition)
  - [x] Collect protocol fees via CPI token transfer
  - [x] Close SessionAuthority PDA, reclaim rent
  - Tests:
    - [x] Happy path: session finalized after DeFi action

### 1.6 Integration: lib.rs ✅
- [x] Wire all instructions into lib.rs program module
- [x] Implement instructions/mod.rs re-exports
- [x] Full `anchor build` succeeds
- [x] Full test suite passes (30 tests)

---

## Phase 2: Jupiter Integration ✅

### 2.1 Transaction Composition ✅
- [x] Build TypeScript transaction composer utility (`sdk/typescript/src/composer.ts`)
- [x] Compose: [SetComputeBudget, ValidateAndAuthorize, JupiterSwap, FinalizeSession]
- [x] Handle Jupiter V6 Swap API to get swap instruction (`sdk/typescript/src/integrations/jupiter.ts`)
- [x] Pass vault PDA token accounts as source/destination for swap
- [x] Test on localnet with mock DeFi instructions

### 2.2 Integration Tests ✅ (9 tests in `tests/jupiter-integration.ts`)
- [x] Agent swaps within policy → succeeds
- [x] Records multiple composed swaps correctly
- [x] Agent swaps above daily cap → entire tx reverts
- [x] Agent swaps disallowed token → entire tx reverts
- [x] Agent swaps disallowed protocol → entire tx reverts
- [x] Frozen vault → entire tx reverts
- [x] Rolling window spending → multiple swaps under cap, then rejects
- [x] deserializeInstruction utility works correctly

---

## Phase 3: Flash Trade Integration ✅

### 3.1 Flash Trade SDK Integration ✅
- [x] Integrate Flash Trade TypeScript SDK (`flash-sdk` npm package)
- [x] Map Flash Trade instructions: open_position, close_position, increase, decrease (`sdk/typescript/src/integrations/flash-trade.ts`)
- [x] Compose: [SetComputeBudget, ValidateAndAuthorize, FlashTradeOpen, FinalizeSession]
- [x] Enforce leverage limits from PolicyConfig
- [x] Track open position count (on-chain: finalize_session increments/decrements `vault.open_positions`)
- [x] Fix: action_type stored in SessionAuthority and used in finalize (was hardcoded to Swap)
- [x] Fix: open_positions counter updated in finalize_session (was never modified)

### 3.2 Integration Tests ✅ (9 tests in `tests/flash-trade-integration.ts`)
- [x] Agent opens leveraged long within policy → succeeds, open_positions incremented
- [x] Agent exceeds leverage limit → LeverageTooHigh revert
- [x] Agent exceeds max positions → TooManyPositions revert
- [x] Agent closes position → succeeds, open_positions decremented
- [x] Agent increases position → succeeds within policy
- [x] Agent decreases position → succeeds within policy
- [x] Frozen vault prevents new positions → VaultNotActive revert
- [x] Position opening disabled → PositionOpeningDisallowed revert
- [x] Action type recorded correctly in audit log (not hardcoded Swap)

---

## Phase 4: TypeScript SDK

### 4.1 Core SDK ✅
- [x] `client.ts` — AgentShieldClient class wrapping all instructions + Jupiter + Flash Trade
- [x] `instructions.ts` — Instruction builder functions
- [x] `accounts.ts` — Account fetching and deserialization
- [x] `types.ts` — TypeScript type definitions matching on-chain state
- [x] `composer.ts` — Transaction composition utilities
- [x] `index.ts` — Clean public exports
- [x] npm package configuration (package.json, tsconfig, build scripts)

### 4.2 Agent Framework Plugins ✅
- [x] Solana Agent Kit plugin (`plugins/solana-agent-kit/`)
  - [x] Plugin scaffolding (package.json, tsconfig.json)
  - [x] Types + WeakMap-cached client factory
  - [x] Read-only tools: shield_check_policy, shield_check_balance, shield_check_spending
  - [x] Write tools: shield_swap, shield_open_position, shield_close_position
  - [x] Plugin entry with Zod schemas and `createAgentShieldPlugin()` factory
- [x] ElizaOS plugin (`plugins/elizaos/`)
  - [x] Plugin scaffolding (package.json, tsconfig.json)
  - [x] Types (env var keys) + runtime-based client factory
  - [x] Providers: vaultStatus, spendTracking (context injection)
  - [x] Actions: SHIELD_SWAP, SHIELD_OPEN_POSITION, SHIELD_CLOSE_POSITION
  - [x] Evaluator: policyCheck (warns at >80% daily cap usage)
  - [x] Plugin assembly + default export

---

## Phase 4.3: Documentation & Publishing ✅
- [x] Root README.md — project overview, architecture, packages, quick start
- [x] `sdk/typescript/README.md` — installation, API reference, types, constants
- [x] `plugins/solana-agent-kit/README.md` — plugin setup, 6 tools, configuration
- [x] `plugins/elizaos/README.md` — plugin setup, env vars, actions/providers/evaluators
- [x] Bump all packages to v0.1.1
- [x] Publish `@agent-shield/sdk@0.1.1` to npm
- [x] Publish `@agent-shield/plugin-solana-agent-kit@0.1.1` to npm
- [x] Publish `@agent-shield/plugin-elizaos@0.1.1` to npm

### Devnet Deployment ✅
- [x] Fund deployer wallet on devnet (10 SOL via web faucet)
- [x] Deploy program to devnet (`4ZeVCqnjUgUtFrHHPG7jELUxvJeoVGHhGNgPrhBPwrHL`)
- [x] Upload IDL to devnet (IDL account: `Ev3gSzxLw6RwExAMpTHUKvn2o9YVULxiWehrHee7aepP`)

---

## Phase 4.4: Security Hardening & Sync ✅
- [x] Add `sessionRentRecipient` to finalize_session (prevents rent theft)
- [x] Expired session permissionless crank (anyone can clean up expired sessions)
- [x] Dual fee model: protocol fee (hardcoded 0.2 BPS) + developer fee (configurable 0–0.5 BPS)
- [x] Update SDK, plugins, and tests for security changes
- [x] Fix account namespace casing (PascalCase for Anchor 0.32.1)
- [x] Fix `feeBps` → `developerFeeRate` across all packages
- [x] All 39 core tests passing
- [x] Redeploy to devnet with updated IDL
- [x] Republish all npm packages at v0.1.2

---

## Phase 5: Dashboard

> Dashboard lives in a separate repo: `agentshield-dashboard`

### 5.1 Core App ✅
- [x] Next.js 14 App Router setup with Tailwind + shadcn/ui
- [x] Solana wallet adapter integration (SolanaProvider)
- [x] Anchor program provider (AnchorProvider, read-only mode when disconnected)
- [x] Network switching (devnet / mainnet-beta) with localStorage persistence
- [x] PascalCase account names for Anchor 0.32.1

### 5.2 Read Operations ✅
- [x] Vault detail page with live updates (useVaultLive — account change listeners)
- [x] My Vaults page (useMyVaults — memcmp filter by owner)
- [x] Explore / leaderboard page (useAllVaults — batch fetch with 30s polling)
- [x] Token balances display (useTokenBalances — getParsedTokenAccountsByOwner)
- [x] Activity feed (ActivityFeed — renders tracker.recentTransactions)
- [x] Spending progress bar (SpendingProgressBar — 24h rolling window calculation)
- [x] Policy display (PolicyDisplay — all policy fields)
- [x] Search by address, owner, or .sol domain (useSearch + Bonfida SNS)

### 5.3 Write Operations ✅ (wired but no error UX)
- [x] Create vault wizard (CreateVaultWizard → client.createVault())
- [x] Policy editor (PolicyEditor → client.updatePolicy())
- [x] Kill switch (KillSwitchButton → client.revokeAgent())

### 5.4 Write Operations (Extended) ✅
- [x] **Deposit/Withdraw UI** — DepositWithdraw component with mint + amount input
- [x] **Agent Registration UI** — RegisterAgent component shown when vault has no agent
- [x] **Reactivate Vault UI** — ReactivateVault component with optional agent key rotation
- [x] **Error toast notifications** — Toast system replacing console.error across all write ops
- [x] **Transaction history CSV export** — Download button on ActivityFeed

### 5.5 Remaining — TODO
- [ ] **Real-time activity feed via Helius webhooks** — currently using account change listeners + polling

---

## Test Summary

| Suite | File | Tests |
|-------|------|-------|
| Core (Phase 1) | `tests/agent-shield.ts` | 39 |
| Jupiter (Phase 2) | `tests/jupiter-integration.ts` | 9 |
| Flash Trade (Phase 3) | `tests/flash-trade-integration.ts` | 9 |
| Wrapper SDK (Phase A) | `sdk/wrapper/tests/wrapper.test.ts` | 41 |
| **Total** | | **98** |

---

## Phase A: Wrapper SDK (`@agent-shield/solana`) — THE WEDGE ✅

> **Strategic pivot:** The vault-deposit model is the wrong entry point. Developers expect 3-line integrations, not PDA custody management. The wrapper is the OpenZeppelin play — importable security that makes the easy path the safe path. The vault program (Level 3) becomes the enterprise upgrade for agents managing serious capital.

### Architecture: Three-Tier Security Model

```
┌──────────────────────────────────────────────────────┐
│  LEVEL 1: Client-Side Wrapper (Zero Friction)         │
│  shield(wallet, { maxSpend: '500 USDC/day' })         │
│  - Intercepts signTransaction()                       │
│  - Client-side policy enforcement                     │
│  - Zero on-chain overhead, works with ANY wallet      │
│  - 3 lines of code to integrate                       │
├──────────────────────────────────────────────────────┤
│  LEVEL 2: TEE-Backed Signing (Key Isolation)          │
│  shield(wallet, { custody: 'turnkey' })               │
│  - Keys held in TEE (Turnkey, Privy, Coinbase)        │
│  - Policy enforcement at signing boundary             │
│  - Agent code never touches private keys              │
│  - Adapter pattern — bring your own custody provider  │
├──────────────────────────────────────────────────────┤
│  LEVEL 3: On-Chain Vault (Cryptographic Guarantees)   │
│  shield.harden(wallet, { onChain: true })             │
│  - PDA vault with on-chain PolicyConfig               │
│  - Cannot be bypassed even by compromised software    │
│  - Progressive upgrade from Level 1/2                 │
│  - THE EXISTING PROGRAM — nothing wasted              │
└──────────────────────────────────────────────────────┘
```

### A.1 Wrapper Package ✅
- [x] Scaffold `sdk/wrapper/` with package.json (`@agent-shield/solana`), tsconfig
- [x] Zero Anchor dependency — only `@solana/web3.js` and `@solana/spl-token`
- [x] `@agent-shield/sdk` as optional peer dep (only for `harden()`)
- [x] Added to root workspace, builds successfully

### A.2 Core Implementation ✅
- [x] `src/errors.ts` — `ShieldDeniedError` with violations array, `ShieldConfigError`
- [x] `src/policies.ts` — `ShieldPolicies` config type, defaults, human-readable parsing ("500 USDC/day" → BigInt)
- [x] `src/registry.ts` — 30+ known Solana protocol program IDs + 10 common token mints
- [x] `src/inspector.ts` — Transaction deserialization, SPL Transfer/TransferChecked detection, program ID extraction
- [x] `src/state.ts` — In-memory spending tracker with rolling windows + pluggable storage persistence
- [x] `src/engine.ts` — Policy evaluation engine (spending caps, protocol allowlist, token allowlist, rate limiting, custom checks)
- [x] `src/shield.ts` — `shield()` function wrapping any wallet with policy interception
- [x] `src/harden.ts` — `shield.harden()` stub for on-chain vault upgrade (requires `@agent-shield/sdk`)
- [x] `src/index.ts` — Clean barrel exports

### A.3 Shield Features ✅
- [x] Human-readable policy strings: `"500 USDC/day"`, `"10 SOL/hour"`
- [x] Secure defaults with no config: 1000 USDC/day, 1000 USDT/day, 10 SOL/day, block unknown programs, 60 tx/hr rate limit
- [x] Known protocol registry: Jupiter, Drift, Flash Trade, Raydium, Orca, Meteora, Kamino, Marginfi, Solend, Marinade, Jito
- [x] System programs (Token, ATA, Compute Budget) always allowed
- [x] Rolling 24h spend tracking with window-based expiry
- [x] Cumulative spend enforcement across `signAllTransactions` batches
- [x] Runtime policy updates via `updatePolicies()`
- [x] State reset via `resetState()`
- [x] `onDenied` / `onApproved` event callbacks
- [x] Pluggable storage backend (auto-detects localStorage in browser, in-memory in Node.js)
- [x] Custom policy check hook for extensibility

### A.4 Tests ✅ (41 tests)
- [x] `parseSpendLimit` — parses USDC/day, SOL/hour, fractional amounts, defaults, error cases
- [x] Registry — protocol lookup, token lookup, system program detection
- [x] `analyzeTransaction` — system instructions, SPL TransferChecked, unknown program detection
- [x] `ShieldState` — rolling spend, rate limit counting, reset, storage persistence/reload
- [x] `evaluatePolicy` — within/over cap, cumulative spend, unknown programs, allowlists, rate limits, token allowlists
- [x] `shield()` — signs within policy, blocks over-limit, blocks unknown programs, allows Jupiter, cumulative tracking, onDenied callback, signAllTransactions batch enforcement, runtime policy updates, state reset, secure defaults, custom checks

### A.5 TODO (Future) — _now tracked in later phases_
- `harden()` → Phase G.1
- Custody adapters → Phase G.2 (research) / Phase I.2 (implementation)
- `shieldedFetch()` / x402 → Phase I.1
- VersionedTransaction → Phase F.5
- Publish `@agent-shield/solana` to npm → Phase 0.2

---

## Phase 0: Project Restructure

> **Goal:** Migrate to pnpm workspaces, extract shared policy engine into `@agent-shield/core`, and set up CI. Foundation for all future phases.

### 0.1 Package Manager Migration ✅
- [x] Migrate yarn v1 → pnpm workspaces
- [x] Configure `pnpm-workspace.yaml` with existing layout (`sdk/`, `plugins/`, `programs/`)
- [x] Remove `yarn.lock`, generate `pnpm-lock.yaml`
- [x] Shared `tsconfig.base.json` for all TypeScript packages
- [x] Fix integration tests (sync with dual fee model: `developer_fee_rate`, `protocolTreasuryTokenAccount`, `.accountsPartial()`)
- [x] **Gate: 98 tests passing (39 core + 9 Jupiter + 9 Flash Trade + 41 wrapper)**

> **Ship 0.1 as its own PR before starting 0.2.** pnpm migration touches every lockfile and build script — keep the blast radius small and bisectable.

### 0.2 Extract `@agent-shield/core` ✅
- [x] Scaffold `sdk/core/` with package.json (`@agent-shield/core`), tsconfig
- [x] Zero Solana dependencies — pure TypeScript policy engine
- [x] Move from `sdk/wrapper/src/`: `engine.ts`, `policies.ts`, `state.ts`, `errors.ts`, `registry.ts`
- [x] `@agent-shield/solana` imports policy engine from `@agent-shield/core`
- [ ] `@agent-shield/sdk` can optionally import shared types from `@agent-shield/core`
- [x] Update all internal imports and verify builds
- [ ] Publish `@agent-shield/core` to npm (required before `@agent-shield/solana` can depend on it externally)
- [ ] Publish `@agent-shield/solana` to npm (was never published — A.5 TODO)
- [x] **Gate: 98 tests still pass (39 core + 9 Jupiter + 9 Flash Trade + 41 wrapper)**

> **Ship 0.2 as its own PR after 0.1 lands.** Core extraction rewrites every import path in the wrapper — don't combine with the pnpm migration.

### 0.3 CI Pipeline ✅
- [x] GitHub Actions workflow (`.github/workflows/ci.yml`) with 3 parallel jobs
- [x] **Job 1:** Build all TS packages, Prettier lint (core + wrapper), wrapper tests (41 tests)
- [x] **Job 2:** `cargo fmt --check` + `cargo clippy` (with Anchor-specific lint allows)
- [x] **Job 3:** Anchor build + `solana-test-validator` + 57 on-chain tests
- [x] Cache: pnpm deps (Job 1/3), Cargo registry + build (Job 2/3)
- [x] Concurrency: cancel in-progress runs for same branch/PR
- [x] Fix pre-existing `cargo fmt` issues across Rust source
- [x] Fix pre-existing Prettier issues in `sdk/core/src/` and `sdk/wrapper/src/`
- [x] **Gate: all 3 jobs pass locally (builds, lints, 98 tests)**

---

## Phase B: Framework Plugins v2

> **Goal:** Rewrite plugins to use `shield()` wrapper internally (Level 1 by default), add new framework support, and improve ShieldedWallet API.

### B.1 Plugin Rewrites
- [ ] Rewrite Solana Agent Kit plugin → `shield()` wrapper internally (Level 1 default)
- [ ] Rewrite ElizaOS plugin → `shield()` wrapper internally (Level 1 default)
- [ ] Optional vault upgrade path in both plugins (Level 3 when configured)

### B.2 ShieldedWallet API Improvements
- [ ] Add `pause()` / `resume()` to ShieldedWallet (temporary policy bypass for owner)
- [ ] Add event emitter: `onDenied`, `onApproved`, `onPolicyUpdate`, `onPause`, `onResume`
- [ ] Add `getSpendingSummary()` — current 24h spend, remaining budget, rate limit status
- [ ] Tests for new ShieldedWallet features

### B.3 Upstream PRs
- [ ] Submit PR to Solana Agent Kit repo
- [ ] Submit PR to ElizaOS repo

---

## Phase C: MCP Security Server

> **Goal:** MCP server that lets any AI tool (Claude Desktop, Cursor, Copilot) manage vaults and enforce policies. Ship standalone mode first — proxy mode is a follow-up.

### C.1 Standalone Mode (ship first)
- [ ] Scaffold `packages/mcp/` with package.json (`@agent-shield/mcp`), tsconfig
- [ ] MCP server entrypoint using `@modelcontextprotocol/sdk`
- [ ] Tool: `shield_create_vault` — initialize vault with policy
- [ ] Tool: `shield_deposit` / `shield_withdraw` — fund management
- [ ] Tool: `shield_register_agent` — register agent key to vault
- [ ] Tool: `shield_update_policy` — modify spending caps, whitelists
- [ ] Tool: `shield_check_vault` — read vault state (read-only)
- [ ] Tool: `shield_check_spending` — read 24h rolling spend (read-only)
- [ ] Tool: `shield_execute_swap` — compose + send Jupiter swap through vault
- [ ] Tool: `shield_open_position` / `shield_close_position` — Flash Trade perps through vault
- [ ] Tool: `shield_revoke_agent` — kill switch
- [ ] Tool: `shield_reactivate_vault` — unfreeze vault

### C.2 MCP Resources
- [ ] Resource: `shield://policy` — current policy configuration
- [ ] Resource: `shield://spending` — live 24h spending state
- [ ] Resource: `shield://activity` — recent transaction history

### C.3 Packaging + Publish
- [ ] JSON Schema input validation for all tools
- [ ] Error handling: map `AgentShieldError` codes to human-readable MCP responses
- [ ] README with Claude Desktop / Cursor configuration examples
- [ ] Tests for standalone mode
- [ ] Publish `@agent-shield/mcp` to npm

### C.4 Proxy Mode (follow-up, after C.1-C.3 shipped)

> **Ship standalone first.** Proxy mode (intercepting arbitrary MCP tool calls) is a harder problem with different security implications. The standalone MCP server alone is a strong differentiator.

- [ ] Intercept MCP tool calls and enforce `@agent-shield/core` policies before forwarding
- [ ] Policy config via env vars + JSON config file
- [ ] Transparent to downstream MCP tools — no code changes required
- [ ] Tests for proxy mode

---

## Phase F: Protocol Integrations

> **Goal:** Expand DeFi protocol coverage. Drift and Jupiter Perps are the highest-priority gaps.

### F.1 Drift Protocol Integration
- [ ] Add `sdk/typescript/src/integrations/drift.ts`
- [ ] Map Drift instructions: `place_perp_order`, `cancel_order`, `modify_order`, `close_position`
- [ ] Compose: `[SetComputeBudget, ValidateAndAuthorize, DriftInstruction, FinalizeSession]`
- [ ] Handle Drift account model (User, UserStats, PerpMarket, SpotMarket)
- [ ] Leverage validation from PolicyConfig (`max_leverage_bps`)
- [ ] Position tracking (increment/decrement `open_positions` on open/close)
- [ ] Add `client.composeDriftOrder()` and `client.composeDriftClose()` to `AgentShieldClient`
- [ ] Integration tests in `tests/drift-integration.ts`
- [ ] Add Drift analyzer to wrapper registry (`sdk/wrapper/src/registry.ts`)

### F.2 Jupiter Perps Integration
- [ ] Add `sdk/typescript/src/integrations/jupiter-perps.ts`
- [ ] Map Jupiter Perps instructions: `open_position`, `close_position`, `increase_size`, `decrease_size`
- [ ] Compose: `[SetComputeBudget, ValidateAndAuthorize, JupiterPerpsInstruction, FinalizeSession]`
- [ ] Reuse Jupiter account patterns from existing swap integration
- [ ] Leverage validation from PolicyConfig (`max_leverage_bps`)
- [ ] Position tracking (increment/decrement `open_positions` on open/close)
- [ ] Add `client.composeJupiterPerpsOpen()` / `client.composeJupiterPerpsClose()` to `AgentShieldClient`
- [ ] Integration tests in `tests/jupiter-perps-integration.ts`
- [ ] Add Jupiter Perps analyzer to wrapper registry

### F.3 GOAT SDK Plugin

> **Moved from Phase B.** GOAT adoption is speculative — ship it in parallel with protocol work rather than blocking plugin rewrites.

- [ ] Scaffold `plugins/goat-sdk/` with package.json (`@agent-shield/plugin-goat-sdk`)
- [ ] Implement GOAT SDK plugin interface
- [ ] Shield wrapper integration for all GOAT tools
- [ ] Tests for GOAT SDK plugin
- [ ] Submit PR to GOAT SDK repo

### F.4 Plugin Updates
- [ ] Update Solana Agent Kit plugin with Drift + Jupiter Perps tools
- [ ] Update ElizaOS plugin with Drift + Jupiter Perps actions
- [ ] Update GOAT SDK plugin with Drift + Jupiter Perps tools (if F.3 complete)

### F.5 VersionedTransaction Support
- [ ] Add VersionedTransaction with address lookup tables to `inspector.ts`
- [ ] Required for Jupiter v6 routes and modern Solana DeFi protocols
- [ ] Update wrapper `shield()` to handle both legacy and versioned transactions
- [ ] Tests: versioned transaction inspection, ALT resolution

---

## Phase G: On-Chain Vault + Mainnet

> **Goal:** Complete the Level 1 → Level 3 upgrade path, security hardening, formal audit, and mainnet deployment. TEE research runs in parallel with Phase F. Sequence: security review → audit → ops prep → mainnet.

### G.0 LiteSVM Test Migration — _do before G.3 security review_

> **Moved from Phase J.** Fast tests (target <30s vs ~2min) pay for themselves during security review and audit iteration. Every exploit test you write in G.3 runs 4x faster.

- [ ] Replace `solana-test-validator` with LiteSVM for CI
- [ ] Migrate all test suites (core, Jupiter, Flash Trade)
- [ ] Target <30s full test suite
- [ ] Keep validator-based tests as optional integration smoke tests

### G.1 `harden()` Implementation
- [ ] `harden()` full implementation — create vault, register agent, map wrapper policies to on-chain config
- [ ] `shield.withVault()` auto-setup helper — Level 3 in one call
- [ ] Level 1 → Level 3 migration helper — preserves spending history

### G.2 TEE Adapter Research (Level 2) — _can run in parallel with Phase F_
- [ ] Research Turnkey TEE signing integration
- [ ] Research Privy embedded wallet TEE integration
- [ ] Research Coinbase Agentic Wallet TEE integration
- [ ] Define `CustodyAdapter` interface: `signTransaction(tx)`, `getPublicKey()`, `getNetwork()`
- [ ] Prototype at least one adapter (Turnkey recommended — most developer-friendly)
- [ ] Write research findings doc with recommendation for Phase I.2 full implementation

### G.3 Security Review — _gates G.4_
- [ ] Add exploit scenario tests:
  - Session replay attacks
  - Fee destination manipulation
  - Spending cap bypass via token switching
  - Concurrent session creation attempts
  - Rent exemption edge cases
- [ ] Static analysis: `cargo clippy` with all warnings as errors
- [ ] Formal specification document covering all instructions and invariants
- [ ] Document all PDA derivation paths and access control matrix
- [ ] **Gate: all exploit tests pass and spec document reviewed before proceeding to G.4**

### G.4 Security Audit — _blocked by G.3_
- [ ] Submit program + spec document to audit firm (OtterSec / Neodyme)
- [ ] Address findings (Critical/High within 48h, Medium within 1 week)
- [ ] Re-deploy to devnet with fixes if needed
- [ ] Publish audit report to GitHub
- [ ] **Gate: all Critical/High findings resolved before proceeding to G.5**

### G.5 Pre-Mainnet Operations & Publishing — _start during G.4, ship after audit resolves_

> **Start this work while the audit is in progress.** These items don't depend on audit results — build them in parallel. But don't ship mainnet (G.6) until both G.4 and G.5 are complete.

- [ ] Define versioning strategy for `@agent-shield/core` (semver, what constitutes breaking)
- [ ] npm publish workflow in CI (automated on tag push)
- [ ] Migration guide for existing `@agent-shield/solana` users when wrapper imports change after core extraction
- [ ] Monitoring/alerting for mainnet program (Helius webhooks + PagerDuty/Discord alerts)
- [ ] Runbook: incident response for mainnet issues (freeze program, emergency upgrade)
- [ ] Program upgrade authority management (document who holds it, multisig plan)
- [ ] Examples repo or `examples/` directory with working integration samples
- [ ] Changelog process (conventional commits → auto-generated CHANGELOG.md)

### G.6 Mainnet Deployment — _blocked by G.4 + G.5_
- [ ] Audit all hardcoded devnet references in SDK, plugins, and tests
- [ ] Add `MAINNET_PROGRAM_ID` constant alongside existing devnet ID
- [ ] Network-aware program ID selection in `AgentShieldClient` constructor
- [ ] Deploy program to mainnet-beta (retain upgrade authority until stable)
- [ ] Upload IDL to mainnet
- [ ] Verify program on Solana Explorer / Solana.fm
- [ ] Set up Helius RPC for mainnet (Professional tier)
- [ ] Update and republish all npm packages with mainnet support
- [ ] Add audit badge to README

---

## Phase I: x402 + Identity + Reputation

> **Goal:** Integrate x402 payments, custody adapters, cross-chain identity (ERC-8004), and on-chain reputation scoring.

### I.1 x402 Detection + `shieldedFetch()`
- [ ] Detect HTTP 402 responses with x402 V2 payment headers
- [ ] `shieldedFetch()` — auto-pay x402 requests through shield policies
- [ ] x402 payments tracked as `Swap`-type action (spending cap applies)
- [ ] Works at Level 1 (wrapper) and Level 3 (vault)
- [ ] Tests: x402 payment flow, policy enforcement, spending cap tracking

### I.2 TEE / Custody Adapters (Level 2 Implementation) — _builds on G.2 research_

> **Consolidates old I.2 + J.4.** The TEE providers (Turnkey, Privy, Coinbase) ARE the custody providers — one adapter per provider, not two separate phases.

- [ ] Full Turnkey adapter: TEE signing + shield policy enforcement
- [ ] Full Privy adapter: embedded wallet + shield policy enforcement
- [ ] Full Coinbase adapter: agentic wallet + shield policy enforcement
- [ ] Custody adapters are optional peer dependencies
- [ ] Level 2 end-to-end tests with mock TEE signing
- [ ] Tests: each adapter signs transactions through shield policies correctly

### I.3 ERC-8004 Identity Bridge — _exploratory / research_

> **High risk, high reward.** Cross-chain identity bridging via Wormhole Queries is genuinely hard and the ERC-8004 standard is still evolving. Treat as research — don't commit to shipping until feasibility is proven.

- [ ] Research ERC-8004 spec status and Wormhole Queries Solana support
- [ ] Prototype: read EVM identity attestation from Solana via Wormhole Queries
- [ ] If feasible: map cross-chain identity to trust score for dynamic spending caps
- [ ] Write findings doc — go/no-go decision before full implementation

### I.4 Civic Pass Trust Score Adapter
- [ ] Read Civic Gateway token state for on-chain identity verification
- [ ] Define `TrustScoreProvider` interface for pluggable identity providers
- [ ] Trust tiers: Unverified (1x), Basic (1.5x), Verified (2x), Established (3x)
- [ ] Falls back to base cap if no trust score provided

### I.5 On-Chain Reputation System — _requires program upgrade_

> **This modifies the on-chain program.** Adding ReputationScore PDA and changing `finalize_session` requires a program upgrade on mainnet. Must include: devnet testing of upgraded program, security review of changes, and coordinated mainnet upgrade via retained upgrade authority.

- [ ] New PDA account: `ReputationScore` with seeds `[b"reputation", vault]`
  - `policy_compliant_days: u32` — consecutive compliant days
  - `total_transactions_compliant: u64`
  - `total_transactions_denied: u64`
  - `compliance_ratio: u16` — BPS (e.g., 9950 = 99.5%)
  - `reputation_tier: u8` — 0=New, 1=Established, 2=Trusted, 3=Exemplary
- [ ] Update `finalize_session` to increment compliant transaction count
- [ ] Daily crank instruction: `update_reputation`
- [ ] Dynamic spending cap multipliers based on reputation tier
- [ ] SDK: `client.getReputationScore(vault)` + dashboard badge
- [ ] Tests: score accumulation, tier progression, compliance ratio

---

## Phase J: Scale & Advanced Features

> **Goal:** Long-term features that unlock enterprise adoption and deeper protocol composability. Audit and LiteSVM now happen in Phase G (before mainnet). TEE adapters consolidated into Phase I.2.

### J.1 Multi-sig Vault Support (Squads)
- [ ] Replace single `owner: Pubkey` with Squads V4 multisig support
- [ ] Policy changes require N-of-M signatures
- [ ] Emergency kill switch can be single-sig (configurable threshold)
- [ ] Integration with Squads SDK for proposal creation
- [ ] Tests: multi-sig policy updates, emergency revoke

### J.2 Time-locked Policy Changes
- [ ] Add `policy_change_delay` field to vault (e.g., 24h timelock)
- [ ] `propose_policy_change` instruction — queues change with timestamp
- [ ] `execute_policy_change` instruction — executes after delay expires
- [ ] Prevents rug-pull scenarios where owner suddenly removes all limits
- [ ] Tests: timelock creation, execution, cancellation

### J.3 Protocol Partnerships
- [ ] Partner with Drift for native AgentShield integration
- [ ] Partner with Jupiter for perps integration
- [ ] Partner with Squads for multi-sig vault support
- [ ] Co-marketing with custody providers (Turnkey, Privy, Coinbase)

---

## Implementation Critical Path

```
Phase A (wrapper SDK) ✅
    ↓
Phase 0.1 (pnpm) → Phase 0.2 (core + publish) → Phase 0.3 (CI)
    ↓
┌───────────────┬──────────────────┬──────────────────────┐
│               │                  │                      │
Phase B         Phase C.1-C.3     Phase F                 Phase G.2
(plugins v2)   (MCP standalone)   (Drift + Jup Perps     (TEE research)
│               │                  + GOAT + VersionedTx)  │
└───────────────┴──────────────────┴──────────────────────┘
                    ↓                                      │
              Phase G.0 (LiteSVM — fast tests)             │
                    ↓                                      │
              Phase G.1 (harden)                           │
                    ↓                                      │
              Phase G.3 (security review) ←────────────────┘
                    ↓ gates
              Phase G.4 (security audit)
                ↓ parallel ↓
              Phase G.5 (ops, publishing, DX)
                    ↓ both complete
              Phase G.6 (mainnet deploy, audited ✓)
                    ↓
         ┌──────────┴──────────┐
         │                     │
    Phase C.4              Phase I
    (MCP proxy)            (x402 + TEE adapters +
         │                  identity + reputation)
         │                     │
         └──────────┬──────────┘
                    ↓
              Phase J (squads + timelocks + partnerships)
```

**What was folded or dropped:**
- Pre-flight validation (old 6.2) → already built into `shield()` wrapper
- SDK DX improvements (old 6.4) → already built into wrapper error handling
- @solana/kit compatibility (old 8.2) → migrate when Anchor migrates, no shim needed
- Cauldron/Frostbite (old 9.3) → too speculative, revisit when Cauldron ships
