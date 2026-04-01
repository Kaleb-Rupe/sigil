# Admin Dashboard — Protocol Cockpit

**Status:** PROPOSED — Pending approval
**Created:** 2026-03-25
**Depends on:** STORAGE-IMPLEMENTATION-PLAN.md (event pipeline), DASHBOARD-PLAN.md (design system)
**Lives in:** Private `sigil-infra` repo at `apps/admin/` (NOT in public `agent-middleware` repo — see STORAGE-IMPLEMENTATION-PLAN.md Section 3)
**Council review:** 4/4 consensus — SIWS + separate origin + short JWT + Squads for irreversible ops
**Architecture basis:** FirstPrinciples decomposition — 3 panels, command palette, composable forms

---

## 1. What This Is

A private, owner-only web dashboard that replaces 100% of CLI/terminal operations for the Sigil protocol. This is the **protocol operator's control center** — distinct from the user-facing vault dashboard in DASHBOARD-PLAN.md.

**One sentence:** Everything you do via `solana program`, `anchor`, `npx tsx scripts/`, and `psql` — in a single authenticated UI.

---

## 2. Feasibility: YES — 100% Possible

Every operation the admin needs is already buildable:

| Operation Category | SDK Support | How |
|--------------------|------------|-----|
| 25 owner instructions | `buildOwnerTransaction()` in `sdk/kit/src/owner-transaction.ts` | Codama-generated instruction builders + wallet signing |
| ALT management | `@solana/web3.js` `AddressLookupTableProgram` | Standard Solana SDK |
| Program upgrade | `solana-program` or Squads SDK proposal | BPF loader instruction or Squads `createProposal()` |
| IDL management | `@coral-xyz/anchor` CLI programmatic equivalent | Anchor IDL instructions |
| Vault state reads | `resolveVaultState()`, `resolveVaultStateForOwner()` | Already built in `@usesigil/kit` |
| Analytics | 42 functions across 11 modules | Phase 6 complete |
| Infrastructure metrics | Postgres SQL + Arweave REST + Helius API | Server-side queries |

**Nothing needs to be invented.** The admin dashboard is a UI shell over existing SDK functions.

---

## 3. Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     ADMIN DASHBOARD                             │
│              (separate Next.js deployment)                       │
│              admin.sigil.xyz or localhost:3001                  │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐    │
│  │   PANEL 1   │  │   PANEL 2   │  │      PANEL 3          │    │
│  │  OPERATIONS  │  │    STATE    │  │   INFRASTRUCTURE      │    │
│  │             │  │             │  │                        │    │
│  │ Command     │  │ Vault list  │  │ Helius credits         │    │
│  │ palette +   │  │ Agent feed  │  │ Postgres metrics       │    │
│  │ category    │  │ Event stream│  │ Arweave status         │    │
│  │ sidebar     │  │ ALT viewer  │  │ Pipeline health        │    │
│  │             │  │ Program info│  │ Arweave wallet balance │    │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬─────────────┘    │
│         │                │                      │                 │
│    Wallet Adapter   RPC + Postgres API    SIWS-authenticated     │
│    (client-side      (read-only,           server-side API       │
│     signing)         public data)         (secret credentials)   │
└────────────────────────────────────────────────────────────────┘
```

### Auth Layers

| Layer | What It Protects | How |
|-------|-----------------|-----|
| **Wallet Adapter** | On-chain operations (Panel 1) | Standard Solana wallet-standard. Transaction built client-side via `buildOwnerTransaction()`, signed by wallet, submitted to RPC. |
| **Pubkey Allowlist** | Route access | Client-side check: if `wallet.publicKey` not in `ADMIN_PUBKEYS` env var, show "unauthorized" page. Defense-in-depth only — real auth is wallet signing. |
| **SIWS + JWT** | Server-side API (Panel 3) | Sign In With Solana challenge → server issues 15-minute JWT → JWT sent with every API request. Nonce replay protection. |

### Why Separate Deployment (Council Unanimous)

| Reason | Detail |
|--------|--------|
| **Different attack surface** | Admin API has Postgres credentials, Arweave wallet key, Helius API key. Public dashboard has none of these. |
| **Origin isolation** | XSS on public dashboard cannot reach admin API (different origin, different CSP). |
| **No session leakage** | No shared localStorage/cookies between admin and public. |
| **Access control** | Admin can be IP-restricted or VPN-only in production. Public dashboard cannot. |
| **Independent scaling** | Admin serves 1 user. Public dashboard serves thousands. Different infra needs. |

---

## 4. Panel 1: Protocol Operations

The command center. Every on-chain operation the owner does.

### 4.1 Operation Categories (sidebar navigation)

| Category | Operations | Count |
|----------|-----------|-------|
| **Vaults** | Create vault, Freeze vault, Reactivate vault, Close vault | 4 |
| **Agents** | Register agent, Revoke agent, Pause agent, Unpause agent, Update permissions | 5 |
| **Funds** | Deposit funds, Withdraw funds | 2 |
| **Policy** | Update policy, Queue policy change, Apply policy change, Cancel policy change | 4 |
| **Constraints** | Create constraints, Update constraints, Close constraints, Queue update, Apply update, Cancel update | 6 |
| **Escrow** | Create escrow, Settle escrow, Refund escrow, Close settled escrow | 4 |
| **Infrastructure** | Create ALT, Extend ALT, Deactivate ALT, Close ALT, Upgrade program, Deploy IDL | 6 |
| **Total** | | **31** |

### 4.2 Unified Operation Flow

Every operation follows the same pattern — no unique UX per instruction:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  1. SELECT   │───▶│  2. FILL     │───▶│  3. SIMULATE │───▶│  4. SIGN     │
│              │    │              │    │              │    │              │
│ Category +   │    │ Dynamic form │    │ Tx preview:  │    │ Wallet popup │
│ operation    │    │ from IDL     │    │ • Accounts   │    │ → submit     │
│ from sidebar │    │ schema       │    │ • Estimated  │    │ → confirm tx │
│ or ⌘K        │    │              │    │   CU + fee   │    │              │
│              │    │ Pre-filled   │    │ • Simulation │    │ Toast:       │
│              │    │ from context │    │   result     │    │ ✓ success    │
│              │    │ (vault addr) │    │ • Human-     │    │ ✗ error +    │
│              │    │              │    │   readable   │    │   details    │
│              │    │              │    │   summary    │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### 4.3 Command Palette (⌘K / Ctrl+K)

Quick access to any operation without navigating sidebar:

```
┌─────────────────────────────────────────┐
│  ⌘K  Search operations...               │
│                                          │
│  🔒 Freeze vault BtRL...4aTw            │
│  👤 Register agent on vault BtRL...      │
│  💰 Deposit 1000 USDC to vault...        │
│  📋 Update policy on vault...            │
│  🔧 Extend ALT with new addresses       │
│  ⬆️  Upgrade program (Squads proposal)   │
│                                          │
│  Recent: Freeze vault • Deposit funds    │
└─────────────────────────────────────────┘
```

### 4.4 Destructive Operation Safeguards

Operations that are irreversible or high-impact get escalated UI treatment:

| Severity | Operations | UI Treatment |
|----------|-----------|-------------|
| **CRITICAL** (irreversible) | Program freeze, Close vault, ALT deactivate | Red accent, typed confirmation ("type FREEZE to confirm"), 10-second countdown, Squads multisig required on mainnet |
| **HIGH** (hard to reverse) | Revoke agent, Cancel policy, Close constraints | Orange accent, confirmation modal with simulation preview |
| **NORMAL** (reversible) | Freeze vault, Pause agent, Queue policy change | Standard confirmation with simulation |
| **LOW** (safe) | Deposit, Register agent, Create escrow | One-click with simulation preview |

### 4.5 Infrastructure Operations (ALT, Program, IDL)

These are NOT standard Sigil instructions — they use Solana system programs:

| Operation | SDK | Notes |
|-----------|-----|-------|
| **Create ALT** | `AddressLookupTableProgram.createLookupTable()` | Returns new ALT address. Store in config. |
| **Extend ALT** | `AddressLookupTableProgram.extendLookupTable()` | Add addresses. Show current contents + diff. |
| **Deactivate ALT** | `AddressLookupTableProgram.deactivateLookupTable()` | CRITICAL — requires confirmation gate. |
| **Close ALT** | `AddressLookupTableProgram.closeLookupTable()` | Only after deactivation + cooldown. |
| **Upgrade program** | Squads `createProposal()` or direct `BPFLoader.upgrade()` | Show current program hash, new binary hash, diff. |
| **Deploy IDL** | Anchor IDL instruction builder | Show IDL diff (instructions added/removed/changed). |

---

## 5. Panel 2: Protocol State

Read-only view of everything on-chain. No auth needed beyond wallet connection (all data is public).

### 5.1 Vaults Overview

| Element | Data Source | Update Frequency |
|---------|-----------|-----------------|
| Vault list with health badges | `resolveVaultStateForOwner()` | On page load + 30s poll |
| Per-vault: agent count, cap usage, status | `getVaultHealth()` | Same |
| Per-vault: 24h spend, P&L | `getVaultPnL()`, `getRolling24hUsd()` | Same |
| Vault detail drill-down | `getVaultSummary()` | On click |

### 5.2 Agent Activity Feed

| Element | Data Source | Update Frequency |
|---------|-----------|-----------------|
| Real-time event stream | `events` table (Postgres) via server API | WebSocket or 5s poll |
| Event descriptions | `describeEvent()` from `event-analytics.ts` | Client-side |
| Category filters | `categorizeEvent()` | Client-side |

### 5.3 ALT Viewer

| Element | Data Source |
|---------|-----------|
| Current ALT address | `alt-config.ts` constants |
| ALT contents (addresses) | `rpc.getAddressLookupTable()` |
| Expected vs actual diff | Compare against `EXPECTED_ALT_CONTENTS` |

### 5.4 Program Info

| Element | Data Source |
|---------|-----------|
| Program ID | `4ZeVCqnjUgUtFrHHPG7jELUxvJeoVGHhGNgPrhBPwrHL` |
| Upgrade authority | `rpc.getAccountInfo(programId)` → parse BPF loader data |
| Last upgrade slot | Parse program account data |
| IDL hash | `anchor idl fetch` equivalent |
| Deployed binary hash | Program data account |

---

## 6. Panel 3: Infrastructure Monitoring

Server-side metrics. Requires SIWS-authenticated JWT. This is the "ops cockpit."

### 6.1 Helius Metrics

| Metric | Source | Display |
|--------|--------|---------|
| Credits used this month | Helius API (verify availability) or manual config | Progress bar: used/total |
| Current plan tier | Config | Badge: Developer/Business/Professional |
| Rate limit status | Helius response headers (`X-RateLimit-Remaining`) | Gauge |
| LaserStream connection status | Indexer health endpoint | Connected/Disconnected indicator |

**Fallback if Helius has no billing API:** Manual credit tracking in admin config, updated periodically.

### 6.2 Postgres Metrics

| Metric | SQL Query | Display |
|--------|----------|---------|
| `events` table row count | `SELECT count(*) FROM events` | Number + daily growth rate |
| `events` table size | `SELECT pg_total_relation_size('events')` | Size in MB/GB |
| `spend_snapshots` row count | Same pattern | Number |
| `balance_snapshots` row count | Same pattern | Number |
| `tee_proofs` row count | Same pattern | Number |
| `event_archives` count | Same pattern | Number |
| Total database size | `SELECT pg_database_size(current_database())` | Size + % of limit |
| Active connections | `SELECT count(*) FROM pg_stat_activity` | Number / pool max |
| Oldest un-archived event | `SELECT MIN(block_time) FROM events WHERE NOT archived` | Date |

### 6.3 Arweave Status

| Metric | Source | Display |
|--------|--------|---------|
| Arweave wallet address | Config (env var) | Truncated address with copy button |
| AR balance | `https://arweave.net/wallet/{addr}/balance` | AR + USD equivalent |
| Low balance alert | Balance < 0.1 AR | Red warning banner |
| Last archive date | `event_archives` table | Date + "X days ago" |
| Total archives | `event_archives` count | Number |
| Total archived events | `SUM(event_count) FROM event_archives` | Number |
| Total archive size | `SUM(byte_size) FROM event_archives` | Size in MB |
| Next archive ETA | Based on archive schedule | Countdown |

**Arweave wallet funding flow:**
- Display QR code for the Arweave wallet address
- Show "Fund wallet" button that copies address
- Alert when balance drops below 0.1 AR (~$0.17)

### 6.4 Pipeline Health

| Metric | Source | Display |
|--------|--------|---------|
| Pipeline status | Indexer health endpoint | Green/Yellow/Red indicator |
| Current lag | `MAX(slot) FROM events` vs `rpc.getSlot()` | Slots behind + seconds |
| Events/minute (5min avg) | `events` table window query | Sparkline chart |
| Last event processed | `MAX(block_time) FROM events` | Relative time ("3s ago") |
| Cron statuses | Indexer health endpoint | Per-cron: last run, next run, last error |
| Failed events (24h) | Decoder error log count | Number (should be 0) |

---

## 7. Authentication Deep Dive

### 7.1 SIWS (Sign In With Solana) Flow

```
Client                          Server
  │                                │
  │  1. GET /auth/challenge        │
  │  ◄──────────────────────────── │  Server generates nonce + timestamp
  │                                │
  │  2. Wallet signs message:      │
  │     "Sign in to Sigil Admin"  │
  │     "Nonce: abc123"            │
  │     "Issued At: 2026-03-25..." │
  │     "Expiration: +15min"       │
  │                                │
  │  3. POST /auth/verify          │
  │     { signature, message,      │
  │       publicKey }              │
  │  ────────────────────────────► │  Server verifies:
  │                                │  • Signature valid for publicKey
  │                                │  • publicKey in ADMIN_PUBKEYS
  │                                │  • Nonce not reused
  │                                │  • Timestamp within 30s
  │                                │  • Message format matches
  │                                │
  │  4. JWT response               │
  │  ◄──────────────────────────── │  Issues JWT:
  │     { token, expiresAt }       │  • sub: publicKey
  │                                │  • exp: 15 minutes
  │                                │  • iss: "sigil-admin"
  │                                │
  │  5. API calls with JWT         │
  │  Authorization: Bearer <jwt>   │
  │  ────────────────────────────► │  Validates JWT on every request
```

### 7.2 Security Measures (Council-Validated)

| Measure | Implementation |
|---------|---------------|
| **Nonce replay protection** | Server stores used nonces in memory/Redis with 5-min TTL. Reject duplicates. |
| **Timestamp validation** | Reject SIWS messages older than 30 seconds. |
| **Short JWT TTL** | 15 minutes. Client auto-refreshes by re-signing SIWS challenge. |
| **Pubkey allowlist** | `ADMIN_PUBKEYS` env var. Checked at JWT issuance AND on every API request. |
| **CSRF protection** | `SameSite=Strict` cookies + `X-Sigil-Admin` custom header requirement. |
| **Origin restriction** | CORS allows only `admin.sigil.xyz` (or localhost in dev). |
| **Destructive op re-auth** | Critical operations (program freeze, ALT deactivate) require fresh wallet signature even with valid JWT. |
| **Audit log** | Every admin action logged with timestamp, pubkey, operation, and tx signature. |

### 7.3 Squads Multisig for Irreversible Ops

On mainnet, program upgrade authority transfers to a Squads 2-of-3 multisig. The admin dashboard integrates:

| Operation | Flow |
|-----------|------|
| Program upgrade | Admin creates Squads proposal → Other signers approve in Squads UI → Proposal executes |
| Program freeze | Same — Squads proposal for `set-authority --final` |
| ALT deactivate | Same — Squads proposal for deactivation |

SDK: `@sqds/multisig` for proposal creation. Link to Squads UI for approval.

---

## 8. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14 App Router | Same as public dashboard — shared knowledge |
| **UI** | shadcn/ui + Tailwind | Same design system as DASHBOARD-PLAN |
| **Wallet** | `@solana/wallet-adapter-react` | Standard, supports Phantom/Backpack/etc |
| **Auth** | Custom SIWS + JWT (no third-party auth service) | Minimal attack surface |
| **State** | React Query (TanStack) | Caching, polling, optimistic updates |
| **API** | Next.js Route Handlers (server-side) | Co-located, typed, no separate backend |
| **Tx Building** | `@usesigil/kit` (`buildOwnerTransaction()`) | Already built |
| **Squads** | `@sqds/multisig` | Proposal creation for irreversible ops |
| **Charts** | Recharts or Tremor | Lightweight, matches dashboard |
| **Deployment** | Vercel (separate project from public dashboard) | Free tier sufficient for 1 user |

---

## 9. Implementation Phases

### Phase A: Auth + Shell (3 days)

| Step | Task | Deliverable |
|------|------|-------------|
| A.1 | Next.js project setup (`apps/admin/`) | Monorepo workspace member |
| A.2 | Wallet adapter + pubkey allowlist | Connect button, unauthorized page |
| A.3 | SIWS flow (challenge → verify → JWT) | `/api/auth/challenge`, `/api/auth/verify` |
| A.4 | Layout shell: sidebar + 3-panel structure | Navigation, responsive layout |
| A.5 | Command palette (⌘K) | Searchable operation list |

### Phase B: Protocol Operations (5 days)

| Step | Task | Deliverable |
|------|------|-------------|
| B.1 | Composable form builder from IDL schemas | Dynamic forms for all 25 owner instructions |
| B.2 | Transaction simulation preview | Show accounts, CU estimate, human-readable summary |
| B.3 | Wallet signing + submission + confirmation | Sign → submit → toast with explorer link |
| B.4 | Vault operations (create, freeze, reactivate, close) | 4 operation forms with safeguards |
| B.5 | Agent operations (register, revoke, pause, unpause, permissions) | 5 operation forms |
| B.6 | Policy + constraints operations | 10 operation forms |
| B.7 | Escrow + funds operations | 6 operation forms |
| B.8 | ALT operations (create, extend, deactivate, close) | 4 Solana system program forms |
| B.9 | Program management (upgrade proposal, IDL deploy) | Squads integration for mainnet |
| B.10 | Destructive operation safeguards | Typed confirmation, countdown, re-auth |

### Phase C: Protocol State (3 days)

| Step | Task | Deliverable |
|------|------|-------------|
| C.1 | Vault overview list with health badges | Table with drill-down |
| C.2 | Agent activity feed (real-time or polling) | Event stream with category filters |
| C.3 | ALT contents viewer with diff against expected | Table with address labels |
| C.4 | Program info panel | Authority, hash, IDL status |

### Phase D: Infrastructure Monitoring (3 days)

| Step | Task | Deliverable |
|------|------|-------------|
| D.1 | Server-side metrics API (SIWS-protected) | `/api/admin/metrics/*` endpoints |
| D.2 | Postgres metrics dashboard | Table sizes, row counts, connection pool |
| D.3 | Arweave status panel | Wallet balance, archive list, funding alerts |
| D.4 | Pipeline health panel | Lag indicator, events/min sparkline, cron statuses |
| D.5 | Helius usage panel | Credits used (manual or API), rate limit gauge |

### Phase E: Polish (2 days)

| Step | Task | Deliverable |
|------|------|-------------|
| E.1 | Mobile responsiveness | Emergency operations accessible on phone |
| E.2 | Admin audit log | All actions logged with timestamp + tx sig |
| E.3 | Error handling + retry logic | Failed txs show error details + retry button |
| E.4 | Keyboard shortcuts | ⌘K palette, Escape to close, Enter to confirm |

**Total estimated time: ~16 days** (1 developer)

---

## 10. Cost

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Vercel (admin app) | $0 | Free tier — single user, low traffic |
| Domain (admin.sigil.xyz) | ~$1 | Subdomain of existing domain |
| Helius (shared with indexer) | $0 incremental | Already paying for indexer |
| **Total incremental** | **~$1/mo** | |

The admin dashboard is effectively free because it reuses the existing Helius RPC, existing Postgres (from STORAGE-IMPLEMENTATION-PLAN), and existing Arweave wallet. No new infrastructure.

---

## 11. Security Checklist

- [ ] Separate Vercel project from public dashboard
- [ ] ADMIN_PUBKEYS environment variable (not hardcoded)
- [ ] SIWS nonce replay protection (in-memory or Redis)
- [ ] JWT secret in environment variables, rotated quarterly
- [ ] CORS restricted to admin origin only
- [ ] No Postgres credentials in client bundle (server-side Route Handlers only)
- [ ] No Arweave wallet key in client bundle (server-side only)
- [ ] Helius API key in server-side only
- [ ] Destructive operations require fresh wallet signature
- [ ] All admin actions logged to audit table
- [ ] CSP headers preventing inline scripts
- [ ] Rate limiting on auth endpoints (prevent brute-force nonce guessing)

---

## 12. What This Replaces (Terminal Command → Admin UI)

| Current CLI Command | Admin Dashboard Equivalent |
|--------------------|---------------------------|
| `solana program deploy target/deploy/sigil.so` | Panel 1 → Infrastructure → Upgrade Program |
| `solana program set-upgrade-authority --new-authority` | Panel 1 → Infrastructure → Transfer Authority |
| `solana address-lookup-table create` | Panel 1 → Infrastructure → Create ALT |
| `npx tsx scripts/extend-sigil-alt.ts` | Panel 1 → Infrastructure → Extend ALT |
| `anchor idl init/upgrade` | Panel 1 → Infrastructure → Deploy IDL |
| `npx ts-mocha tests/sigil.ts` (vault creation) | Panel 1 → Vaults → Create Vault |
| Manual `solana transfer` for deposits | Panel 1 → Funds → Deposit |
| `psql` for checking table sizes | Panel 3 → Postgres Metrics |
| Check Arweave balance via browser | Panel 3 → Arweave Status |
| `curl helius.dev/...` for API status | Panel 3 → Helius Metrics |
| `git log` + `solana program show` for deploy status | Panel 2 → Program Info |

**100% terminal replacement achieved.**

---

## 13. Open Questions

1. **Should the admin dashboard share the `apps/` directory with the public dashboard or be a completely separate repo?** Recommendation: same monorepo (`apps/admin/`), different Vercel project. Shares `@usesigil/kit` dependency.

2. **Helius billing API — does it exist?** Research pending. If not, manual credit tracking via admin config. Not a blocker.

3. **When to build this vs. the public dashboard?** Admin dashboard is simpler (1 user, no complex auth flows). Could be built first as a working prototype, then the public dashboard builds on the same patterns.

4. **Should we build a CLI companion alongside the web dashboard?** Some operations (program upgrade) may still be easier via CLI in certain scenarios. The admin dashboard should be the primary, CLI as fallback.

---

## 14. Success Criteria

- [ ] Owner connects wallet → sees full cockpit (Panels 1-3)
- [ ] Non-owner wallet → sees "Unauthorized" page, no data exposed
- [ ] All 25 owner instructions executable from UI with simulation preview
- [ ] ALT create/extend/deactivate/close works from UI
- [ ] Program upgrade creates Squads proposal (mainnet) or direct upgrade (devnet)
- [ ] Postgres table sizes and row counts visible in real-time
- [ ] Arweave wallet balance visible with low-balance alert
- [ ] Event pipeline lag visible with health indicator
- [ ] Destructive operations gated with typed confirmation
- [ ] All admin actions logged to audit table
- [ ] Mobile-responsive for emergency operations
- [ ] Zero terminal usage required for day-to-day protocol operations
