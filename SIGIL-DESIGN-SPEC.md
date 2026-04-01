# Sigil Design Specification

> **Supersedes:** `DASHBOARD-DESIGN-GAPS.md` and `DASHBOARD-PLAN.md`. This is the single source of truth for all Sigil visual design, landing page structure, dashboard application design, and implementation plan.

> **Reference site:** [sigil-smart-wallet.replit.app](https://sigil-smart-wallet.replit.app/) — vibe-coded prototype. This spec corrects branding, technical details, and adds production-grade component specifications.

---

## 1. Brand Identity

### 1.1 Name & Terminology

| Term | Usage | Replaces |
|------|-------|----------|
| **Sigil** | Brand name, product name, all user-facing references | Sigil |
| **Sealed** | Transaction verified and approved by policy | Wrapped, Authorized |
| **Blocked** | Transaction rejected by policy enforcement | — |
| **Vault** | User-owned smart wallet with policy enforcement | — |
| **Policy** | On-chain spending rules (caps, allowlists, permissions) | — |
| **Agent** | AI trading bot with scoped, revocable vault access | — |
| `@sealed/kit` | NPM SDK package | `@usesigil/kit` |
| `seal()` | Core API method — wraps a DeFi instruction with enforcement | `seal()` |
| `SigilClient` | Primary SDK class | `SigilClient` |
| `sigil.trade` | Domain | — |
| `app.sigil.trade` | Dashboard URL | — |

**Internal note:** The on-chain Solana program remains named `sigil` (program ID `4ZeVCqnjUgUtFrHHPG7jELUxvJeoVGHhGNgPrhBPwrHL`). All user-facing surfaces say "Sigil."

### 1.2 Logo

Abstract knight's shoulder plate / shield. Gold-amber body with teal accent stripes on dark background. Four approved variations:

1. **Flowing layered** — organic curves, 3 teal stripes fanning from lower-left
2. **Minimal convex** — simple convex shield, single teal edge accent
3. **Geometric stacked** — structured chevron/shield, horizontal teal stripes
4. **Knight visor** — helmet silhouette with crossed teal line

**Usage rules:**
- Dark backgrounds: full-color gradient (gold → amber → light gold)
- Light backgrounds: solid `#0F1523` silhouette with teal accent
- Favicon/small: geometric stacked (variant 3) — reads best at 16–32px
- Nav/header: any variant at 28px height, paired with "Sigil" wordmark

### 1.3 Voice & Tone

- **Professional, not corporate.** Mercury, not JPMorgan.
- **Technical, not jargon-heavy.** "Spending limits" not "configurable per-epoch rolling-window USD cap enforcement."
- **Confident, not hype.** "Zero added latency — verified across 200 devnet transactions." Not "blazing fast."
- **Fintech, not crypto.** "Log in" not "Connect Wallet." "Your account" not "Your wallet."

---

## 2. Design System

### 2.1 Color Tokens

#### Landing Page (Light Mode)

```css
:root {
  /* ─── Brand ───────────────────────────────────────── */
  --sigil-gold:            #C8962E;
  --sigil-amber:           #B87D0A;
  --sigil-amber-hover:     #A06E09;
  --sigil-teal:            #1A8A7D;
  --sigil-teal-light:      #2BA89A;

  /* ─── Surfaces ────────────────────────────────────── */
  --bg:                    #FFFFFF;
  --bg-subtle:             #F8F9FB;
  --bg-muted:              #F1F3F7;

  /* ─── Text ────────────────────────────────────────── */
  --text-primary:          #0F1523;
  --text-secondary:        #64748B;
  --text-muted:            #8A96A8;

  /* ─── Borders ─────────────────────────────────────── */
  --border:                #E2E8F0;
  --border-hover:          #CBD5E1;

  /* ─── Status ──────────────────────────────────────── */
  --sealed-text:           #047857;
  --sealed-bg:             rgba(4, 120, 87, 0.08);
  --blocked-text:          #B91C1C;
  --blocked-bg:            rgba(185, 28, 28, 0.06);

  /* ─── Shadows ─────────────────────────────────────── */
  --shadow-sm:             0 1px 2px rgba(15, 21, 35, 0.06);
  --shadow-md:             0 4px 12px rgba(15, 21, 35, 0.08);
  --shadow-lg:             0 8px 24px rgba(15, 21, 35, 0.12);
  --shadow-card:           0 1px 3px rgba(15, 21, 35, 0.04), 0 1px 2px rgba(15, 21, 35, 0.06);
}
```

#### Dashboard (Dark Mode)

```css
[data-theme="dark"] {
  /* ─── Brand (same) ────────────────────────────────── */
  --sigil-gold:            #C8962E;
  --sigil-amber:           #D4A442;  /* +10% lightness for dark bg */
  --sigil-teal:            #2BA89A;  /* lightened for contrast */

  /* ─── Surfaces ────────────────────────────────────── */
  --bg:                    #0A0E1A;
  --bg-subtle:             #111827;
  --bg-muted:              #1E293B;
  --bg-card:               #151B2B;

  /* ─── Text ────────────────────────────────────────── */
  --text-primary:          #F8FAFC;
  --text-secondary:        #94A3B8;
  --text-muted:            #64748B;

  /* ─── Borders ─────────────────────────────────────── */
  --border:                #1E293B;
  --border-hover:          #334155;

  /* ─── Status ──────────────────────────────────────── */
  --sealed-text:           #34D399;
  --sealed-bg:             rgba(52, 211, 153, 0.1);
  --blocked-text:          #F87171;
  --blocked-bg:            rgba(248, 113, 113, 0.1);

  /* ─── Shadows ─────────────────────────────────────── */
  --shadow-sm:             0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md:             0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg:             0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-card:           inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.3);
}
```

### 2.2 Typography

```css
/* Font: Inter — single family, all weights */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* ─── Type Scale ──────────────────────────────────── */
--font-xs:     12px;  /* labels, timestamps, status pills */
--font-sm:     13px;  /* table cells, monospace code */
--font-base:   14px;  /* body text, nav links */
--font-md:     16px;  /* body prose, input text */
--font-lg:     18px;  /* section subtext */
--font-xl:     24px;  /* section headings */
--font-2xl:    32px;  /* page titles */
--font-3xl:    40px;  /* hero subheadings */
--font-hero:   56px;  /* hero headline (desktop) */
--font-hero-sm: 36px; /* hero headline (mobile) */

/* ─── Weight Scale ────────────────────────────────── */
--weight-light:    300;  /* hero headlines — airy editorial */
--weight-regular:  400;  /* body, descriptions */
--weight-medium:   500;  /* nav, labels, table headers */
--weight-semibold: 600;  /* section headings, CTAs */
--weight-bold:     700;  /* metric values */

/* ─── Line Heights ────────────────────────────────── */
--leading-tight:   1.15; /* headlines */
--leading-snug:    1.3;  /* subheadings */
--leading-normal:  1.6;  /* body text */
--leading-relaxed: 1.75; /* long-form prose */

/* ─── Letter Spacing ──────────────────────────────── */
--tracking-tight:  -0.02em; /* headlines */
--tracking-caps:   0.06em;  /* section eyebrow labels (uppercase) */
--tracking-normal: 0;       /* body */
```

**Headline treatment:** Inter weight 300 (light) for hero and section headlines creates an airy, editorial feel. Bold is reserved for metric numbers only.

**Section eyebrow labels:** ALL CAPS, `--font-xs`, `--weight-medium`, `--tracking-caps`, `--text-muted` on landing / `--sigil-amber` on specific sections. These establish section identity before the headline.

### 2.3 Spacing Scale

```css
/* 4px base, doubling for major steps */
--space-1:   4px;   /* icon-to-text, tight gaps */
--space-2:   8px;   /* element internal padding */
--space-3:   12px;  /* compact card padding */
--space-4:   16px;  /* standard padding, gap between related items */
--space-5:   20px;  /* form field spacing */
--space-6:   24px;  /* card padding, section internal */
--space-8:   32px;  /* between card groups */
--space-10:  40px;  /* between sections (mobile) */
--space-12:  48px;  /* section padding top/bottom */
--space-16:  64px;  /* major section separators (desktop) */
--space-20:  80px;  /* landing page section gaps */
--space-24:  96px;  /* hero vertical padding */
--space-32:  120px; /* above-fold breathing room */
```

### 2.4 Breakpoints

```css
--bp-mobile:  375px;   /* small phone */
--bp-tablet:  768px;   /* tablet portrait */
--bp-desktop: 1024px;  /* laptop */
--bp-wide:    1280px;  /* desktop */
--bp-max:     1440px;  /* max content width */
```

### 2.5 Border Radius

```css
--radius-sm:   4px;   /* small inputs, pills */
--radius-md:   6px;   /* buttons, cards */
--radius-lg:   10px;  /* feature cards, modals */
--radius-xl:   16px;  /* hero sections, panels */
--radius-pill: 999px; /* status pills, nav buttons */
```

### 2.6 Z-Index Scale

```css
--z-base:     0;
--z-dropdown: 10;
--z-sticky:   20;
--z-modal:    40;
--z-toast:    50;
--z-tooltip:  60;
```

---

## 3. Landing Page (`/`)

**Mode:** Light. White background, dark navy text, amber CTAs.
**Pattern:** Product-as-hero (Real-Time / Operations Landing).
**Aesthetic:** Fintech — Mercury/Altitude energy. Typography is the hero, not images.

### 3.1 Navigation Bar

```css
.nav {
  position: fixed;
  top: 0;
  width: 100%;
  height: 56px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  z-index: var(--z-sticky);
}
```

**Left:** Sigil logo (28px height) + "Sigil" in Inter SemiBold 16px, `--text-primary`. Gap: 8px.

**Center:** Text links — "Docs", "SDK", "Protocols", "Pricing" — Inter Medium 14px, `--text-secondary`, no borders. Hover: `--text-primary`, 150ms transition. Gap: 32px.

**Right:**
- "Sign in" — ghost link, Inter Medium 14px, `--text-secondary`
- "Get started" — filled pill button, `background: var(--sigil-amber)`, white text, Inter Medium 14px, `padding: 8px 20px`, `border-radius: var(--radius-pill)`. Hover: `--sigil-amber-hover`, 150ms.

**Mobile (< 768px):** Hamburger menu replaces center links. Logo + "Get started" button remain visible.

### 3.2 Live Status Strip

Immediately below nav. Height: 32px. Background: `--bg-subtle`. Border-bottom: `--border`.

**Left:** Green pulsing dot (8px, `animation: pulse 2s infinite`) + "Live" in Inter Medium 12px `--sealed-text` + "Solana Mainnet · sigil.trade" in `--text-muted` 12px.

**Right:** Three stat badges:
- `0ms` / "Avg latency" — (verified benchmark claim)
- `34` / "Policies active"
- `4,812` / "Events today"

Numbers: Inter Bold 13px `--text-primary`. Labels: Inter Regular 11px `--text-muted`. Gap: 24px.

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### 3.3 Hero: Live Enforcement Feed

**This is the hero.** The product itself, not marketing copy, occupies the first ~60vh.

**Layout:** Full-width data table, max-width 1200px, centered. `padding-top: 24px`.

**Table columns:**

| Column | Width | Format |
|--------|-------|--------|
| Time | 120px | `HH:mm:ss.SSS` monospace, `--text-muted` |
| Tx hash | 100px | truncated `4…4` monospace, `--text-muted` |
| Vault | 110px | name in `--text-primary` |
| Agent | 100px | name in `--text-secondary` |
| Protocol | 90px | name in `--text-primary` |
| Amount | 120px | right-aligned, `--text-primary` |
| Detail | flex | `--text-muted`, smaller text |
| Status | 80px | `SEALED` or `BLOCKED` pill |

**Column headers:** Inter Medium 11px, `--text-muted`, uppercase, `letter-spacing: 0.06em`. Sort arrow on Time column (default: descending).

**Rows:** White background, `border-bottom: 1px solid var(--border)`. Row height: 44px. Hover: `background: var(--bg-subtle)`, 100ms.

**Status pills:**
```css
.pill-sealed {
  background: var(--sealed-bg);
  color: var(--sealed-text);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  letter-spacing: 0.04em;
}
.pill-blocked {
  background: var(--blocked-bg);
  color: var(--blocked-text);
  /* same structure */
}
```

**Table footer:** "Streaming next event…" in italic 12px `--text-muted`, left-aligned.

**Stats bar** (below table, 4 equal columns, `border-top: 1px solid var(--border)`, `padding: 16px 0`):

| Stat | Value Color | Label |
|------|-------------|-------|
| Sealed today | `--text-primary` | 4,761 |
| Blocked today | `--blocked-text` | 51 |
| Funds protected | `--sigil-amber` | $12M+ |
| Policy breaches | `--text-primary` | 0 |

Value: Inter Bold 28px. Label: Inter Regular 13px `--text-secondary`.

**Sample data (8 rows):**

```
17:37:38.769  1kRz…q7Xp  vault-alpha  arb-bot-7   Raydium   2,150 USDC  within policy · cap 5,000/day     SEALED
14:22:31.088  3xMf…k9Rp  vault-alpha  arb-bot-7   Jupiter   1,240 USDC  within policy · cap 5,000/day     SEALED
14:22:29.441  7rRq…e2Lz  vault-alpha  arb-bot-7   Orca        840 USDC  within policy · cap 5,000/day     SEALED
14:22:17.903  5pKs…n4Vc  vault-beta   mm-agent-2  Drift    12,000 USDC  cap exceeded · daily limit 10,000 BLOCKED
14:21:55.217  2bBt…e8Jx  vault-gamma  yield-1     Kamino    4,400 USDC  within policy · cap 5,000/day     SEALED
14:21:48.662  5yRu…h4Nk  vault-beta   mm-agent-2  Marginfi  3,100 USDC  protocol not in allowlist         BLOCKED
14:21:28.114  8cQa…b3Fy  vault-alpha  arb-bot-7   Phoenix     780 USDC  within policy · cap 5,000/day     SEALED
14:21:05.993  2mXn…k7Gz  vault-alpha  arb-bot-7   Meteora   1,950 USDC  within policy · cap 5,000/day     SEALED
```

### 3.4 Hero Headline + CTAs

Below the feed table. `padding: 64px 24px 48px`. Max-width 660px, left-aligned.

**Headline:**
```
Your agents trade.
Sigil watches.
```
- Line 1: Inter Light (300) 56px, `--text-primary`, `letter-spacing: -0.02em`, `line-height: 1.15`
- Line 2: Same, but "Sigil" rendered in `--sigil-amber`
- Mobile: 36px

**Body:** Inter Regular 16px, `--text-secondary`, `line-height: 1.6`, max-width 500px.
```
Every row above is real Sigil output — on-chain enforcement, policy decisions, immutable audit records. No additional confirmation latency.
```

**Sealed/Blocked inline highlights:** Within body text, "Sealed" gets green underline decoration (`border-bottom: 2px solid var(--sealed-text)`), "Blocked" gets red.

**CTAs:** Flex row, `gap: 12px`, `margin-top: 32px`.
- Primary: "Seal your first vault →" — `background: var(--sigil-amber)`, white text, Inter SemiBold 15px, `padding: 14px 28px`, `border-radius: var(--radius-md)`. Hover: `--sigil-amber-hover`, `translateY(-1px)`, `--shadow-md`.
- Secondary: "Read the docs" — `background: transparent`, `border: 1px solid var(--border)`, `--text-primary`, same dimensions. Hover: `border-color: var(--sigil-amber)`.

### 3.5 How It Works

**Layout:** Two columns on desktop (text left, steps right). `padding: 80px 24px`. Mobile: single column.

**Section eyebrow:** "HOW IT WORKS" — uppercase, 11px, `--text-muted`, `letter-spacing: 0.06em`.

**Three numbered steps:**

```
01  Agent submits a transaction
    Your agent prepares any Solana transaction — swap, lend, stake,
    anything. No SDK changes required.

02  Policy checked on-chain
    Sigil evaluates the transaction against your vault's policy:
    spending caps, protocol allowlist, agent permissions.

03  Sealed or blocked in <30ms
    Passes: executes with on-chain proof attached.
    Fails: reverts with a policy violation record.
    Both paths are logged forever.
```

**Step numbers:** Inter Light 32px, `--bg-muted` color (very faint), acting as visual anchors.
**Step titles:** Inter SemiBold 16px, `--text-primary`.
**Step descriptions:** Inter Regular 14px, `--text-secondary`, `line-height: 1.6`.

### 3.6 Protocol Strip

Full-width, `background: var(--bg-subtle)`, `padding: 16px 24px`, `border-top: 1px solid var(--border)`, `border-bottom: 1px solid var(--border)`.

**Label:** "WITH" in 11px uppercase `--text-muted`, left side.
**Protocols:** Jupiter, Orca, Drift, Kamino, Marginfi, Phoenix, Meteora, Raydium — Inter Medium 14px, `--text-secondary`, `gap: 32px`. Horizontal scroll on mobile.

### 3.7 Inside Your Workspace

**Layout:** Two columns. Text left (40%), browser mockup right (60%). `padding: 80px 24px`. Mobile: stacked.

**Section eyebrow:** "INSIDE YOUR WORKSPACE" — uppercase 11px, `--sigil-amber`, `letter-spacing: 0.06em`.

**Headline:** "This is the workspace you get on day one." — Inter Light 36px, `--text-primary`, `line-height: 1.2`.

**Body:** Inter Regular 15px, `--text-secondary`, `line-height: 1.6`.
```
A real-time view of every policy decision across all your vaults and agents.
The feed above isn't a demo — it's the same data stream you'll see the moment you connect.
```

**Feature bullets (3):**
- Green dot: "Live enforcement feed with filter tabs and sort controls"
- Amber diamond: "Policy status per vault — sealed, blocked, and cap progress"
- Gray circle: "Full audit history exportable by vault, agent, or time range"

Bullet icons: 8px solid circles in respective colors. Text: Inter Regular 14px, `--text-primary`.

**CTA:** "Get access →" — amber filled button, same style as hero primary.

**Browser mockup (right side):**
```css
.browser-frame {
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.browser-chrome {
  background: var(--bg-subtle);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--border);
}
```
- Traffic lights: 12px circles (red `#FF5F57`, yellow `#FFBD2E`, green `#28C840`)
- Address bar: `app.sigil.trade/feed` in Inter 12px `--text-muted`
- Content: miniature version of the live feed table (6 rows), matching the hero data

### 3.8 Capabilities Grid

`padding: 80px 24px`. Max-width 1120px.

**Section eyebrow:** "CAPABILITIES" — uppercase 11px, `--text-muted`.

**Layout:** 2×2 grid, `gap: 1px`, `border: 1px solid var(--border)`. Cards separated by hairline borders, not gaps. `background: var(--border)` on container to create the grid lines.

**Each card:**
```css
.capability-card {
  background: var(--bg);
  padding: 32px 28px;
}
```

**4 capabilities with Lucide icons (20px, `--sigil-amber`):**

| Icon | Title | Description |
|------|-------|-------------|
| `◈` Diamond | Smart Wallet policies | Define spending caps, protocol allowlists, agent permissions, and time-based rules. Policies are stored on-chain — not in a database. |
| `⚡` Zap | Zero added latency | Every transaction is evaluated in the same atomic transaction — no round trips, no additional confirmation time. Verified across 200 devnet transactions. |
| `◎` Target | Immutable audit trail | Every SEALED and BLOCKED event is written to Solana with the policy snapshot attached. Disputes are settled by chain state, not logs. |
| `✦` Sparkles | Agent authorization | Grant agents scoped, revocable access. One agent can run your arbitrage strategy; another manages yield. Neither can exceed its mandate. |

**Title:** Inter SemiBold 16px, `--text-primary`, `margin-top: 12px`.
**Description:** Inter Regular 14px, `--text-secondary`, `line-height: 1.5`, max 3 lines.

### 3.9 Developer Integration

**Layout:** Split panel. Left: white background (text). Right: `--bg-subtle` (code). `padding: 80px 0`.

**Left panel (`padding: 80px 48px 80px 24px`):**

**Section eyebrow:** "DEVELOPER INTEGRATION" — uppercase 11px, `--sigil-amber`.

**Headline:**
```
Two lines.
Full enforcement.
```
Inter Light 48px, `--text-primary`, `line-height: 1.15`, `letter-spacing: -0.02em`.

**Body:** Inter Regular 15px, `--text-secondary`, `line-height: 1.6`.
```
Sigil seals any existing Solana transaction. No new wallet, no protocol changes.
Point it at your vault and every agent call is automatically evaluated against your policy.
```

**Integration methods (list, `margin-top: 32px`):**

| Method | Install | Monospace |
|--------|---------|-----------|
| TypeScript SDK | `npm install @sealed/kit` | Yes |
| Rust crate | `cargo add sealed-trade` | Yes |
| REST API | OpenAPI · JSON · sub-10ms P99 | Yes |

Each row: `border-bottom: 1px solid var(--border)`, `padding: 12px 0`. Label: Inter Medium 14px `--text-primary`. Value: Inter Regular 13px `--text-muted`, monospace.

**Right panel (code block):**
```css
.code-panel {
  background: var(--bg-subtle);
  padding: 48px 32px;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 13px;
  line-height: 1.7;
}
```

Traffic lights + filename "agent.ts" in `--text-muted` 12px, right-aligned.

```typescript
import { Sigil } from "@sealed/kit";

const sigil = new Sigil({
  wallet: "vault-alpha.sigil",
});

const sealed = await sigil.seal(transaction);

// sealed.status    → "SEALED" | "BLOCKED"
// sealed.policyRef → on-chain proof address
// sealed.latencyMs → enforcement time in ms
```

Code: `--text-primary` for tokens, `--text-muted` for comments. Keywords/strings could use subtle syntax highlighting but NOT required — monochrome is fine.

### 3.10 Pricing

`padding: 80px 24px`. Max-width 960px, centered.

**Section eyebrow:** "PRICING" — uppercase 11px, `--text-muted`, centered.

**3-column card layout:** `gap: 24px`. Mobile: single column stack.

#### FREE

```
FREE
$0 forever
One vault. Test the enforcement layer before you commit.

✓ 1 Vault
✓ 500 events/day
✓ 7-day audit history
✓ Community support

[ Start free ]  ← outlined button
```

#### PRO (highlighted)

```
PRO                              Most popular ← amber pill badge
$149 /month
For teams running multiple agents across production strategies.

✓ 10 Vaults
✓ Unlimited events
✓ Full audit history
✓ Priority support
✓ Webhook alerts
✓ Custom policy templates

[ Start 14-day trial ]  ← amber filled button
```

#### ENTERPRISE

```
ENTERPRISE
Custom
Institutional-grade SLA, dedicated infrastructure, and custom authoring.

✓ Unlimited vaults
✓ Dedicated RPC node
✓ On-call support
✓ Audit export API
✓ SOC 2 report
✓ Custom integrations

[ Talk to us ]  ← outlined button
```

**Card styles:**
```css
.pricing-card {
  padding: 32px 28px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg);
}
.pricing-card--pro {
  border-color: var(--sigil-amber);
  box-shadow: 0 0 0 1px var(--sigil-amber), var(--shadow-md);
}
```

**Tier label:** Inter Medium 11px uppercase `--text-muted`.
**Price:** Inter Light 48px `--text-primary` (PRO uses `--sigil-amber`). "/month" in Inter Regular 14px `--text-muted`.
**Description:** Inter Regular 14px `--text-secondary`, 2 lines.
**Features:** checkmarks in `--sigil-teal`, text in Inter Regular 14px `--text-primary`. `gap: 8px` between items.
**"Most popular" badge:** amber pill — `background: rgba(200, 150, 46, 0.1)`, `color: var(--sigil-amber)`, Inter Medium 11px, `padding: 3px 10px`, `border-radius: var(--radius-pill)`.

### 3.11 Final CTA

`padding: 96px 24px`. Centered text. White background.

**Section eyebrow:** "READY TO SEAL YOUR FIRST VAULT?" — uppercase 11px, `--text-muted`, centered, `letter-spacing: 0.06em`.

**Headline:**
```
Your agents are running.
Add a policy layer.
```
- Line 1: Inter Light 52px, `--text-primary`, centered
- Line 2: Inter Light 52px, `--sigil-amber`, centered
- Mobile: 32px

**Subtext:** Inter Regular 16px, `--text-secondary`, centered, `margin-top: 16px`.
```
Takes 10 minutes. One npm install. First vault is free, no card required.
```

**CTAs:** Centered row, `gap: 12px`, `margin-top: 32px`. Same styles as hero CTAs.

**Trust signals (below CTAs, `margin-top: 24px`):** Horizontal row, centered, `gap: 32px`.
- "✓ No credit card required"
- "✓ Free for first vault"
- "✓ Zero added latency"
- "✓ Open audit trail"

Checkmarks: `--sigil-teal`. Text: Inter Regular 13px `--text-muted`.

### 3.12 Footer

`background: var(--bg)`. `border-top: 1px solid var(--border)`. `padding: 48px 24px 24px`.

**5-column grid** (brand + 4 link groups). Mobile: 2-column with brand full-width above.

**Column 1 — Brand:**
- Logo + "Sigil" wordmark
- "On-chain security layer for AI trading agents on Solana. Seal every trade."
- "sigil.trade" link

**Column 2 — PRODUCT:** How it works, Pricing, Changelog, Status, Security
**Column 3 — DEVELOPERS:** Docs, SDK reference, REST API, Rust crate, GitHub
**Column 4 — COMPANY:** About, Blog, Careers, Contact
**Column 5 — LEGAL:** Privacy, Terms, Cookie policy

**Column headers:** Inter SemiBold 12px uppercase `--text-muted`, `letter-spacing: 0.04em`.
**Links:** Inter Regular 14px `--text-secondary`. Hover: `--text-primary`.

**Bottom bar:** `padding-top: 24px`, `border-top: 1px solid var(--border)`.
- Left: "© 2026 Sigil Technologies Inc. · sigil.trade" in 12px `--text-muted`
- Right: Social icons (X, GitHub, Discord) — 18px, `--text-muted`, hover: `--text-primary`

---

## 4. Dashboard Application (Authenticated)

**Mode:** Dark. `--bg: #0A0E1A`. Same Sigil color system.
**Auth:** "Log in" not "Connect Wallet." Email + password or SSO. No wallet jargon.

### 4.1 Authenticated Routes

| Route | Purpose |
|-------|---------|
| `/dashboard` | Overview — vault list, aggregate stats, recent activity |
| `/vault/:id` | Vault detail — balance, policy config, agent list, feed |
| `/vault/:id/feed` | Live enforcement feed for single vault |
| `/vault/:id/policy` | Policy editor (spending caps, protocols, agents) |
| `/vault/:id/agents` | Agent management (add, revoke, permissions) |
| `/vault/:id/analytics` | Spending charts, P&L, agent leaderboard |
| `/vault/:id/audit` | Full audit trail, exportable |
| `/settings` | Account, API keys, notifications |

### 4.2 Dashboard Design Rules

1. **Data tables** use the same styling as the landing feed — consistent across landing and app
2. **Metric cards** show numbers prominently (Inter Bold, `--text-primary`) with labels below (Inter Regular 13px, `--text-muted`)
3. **Charts** use `--sigil-amber` for primary series, `--sigil-teal` for secondary, `--text-muted` for gridlines
4. **Navigation:** Left sidebar (desktop), bottom tab bar (mobile ≤5 items)
5. **Forms:** Visible labels (never placeholder-only), validation on blur, errors below field
6. **Empty states:** Helpful message + single action CTA ("Create your first vault")
7. **Status terminology:** Always "Sealed" (green) / "Blocked" (red) — never "Success" / "Failure"
8. **WebSocket status:** `ConnectionBanner` component — green "Connected", yellow "Reconnecting…", red "Connection lost"
9. **All monetary values:** `tabular-nums` for alignment, USD format with 2 decimal places
10. **All times:** Relative ("3m ago") with absolute on hover tooltip

### 4.3 Key Dashboard Components

**VaultCard:** `background: var(--bg-card)`, `border: 1px solid var(--border)`, `border-radius: var(--radius-lg)`, `padding: 24px`. Shows vault name, balance, status badge, agent count, last activity.

**PolicyEditor:** Form with sections for spending caps (daily/per-tx), protocol allowlist (multi-select), agent permissions (toggle grid). Pending changes show yellow banner with countdown and Apply/Cancel.

**EnforcementFeed:** Same table component as landing page, dark-mode themed. Filter tabs: All / Sealed / Blocked. Real-time via Helius Enhanced WebSocket.

**AnalyticsCharts:** Spending velocity (area chart), agent leaderboard (bar chart), protocol distribution (donut). All charts: `--sigil-amber` primary, `--sigil-teal` secondary. Tooltips on hover/tap.

---

## 5. Implementation Plan

### 5.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + CSS custom properties |
| Components | shadcn/ui (customized with Sigil tokens) |
| Charts | Recharts or Tremor |
| Icons | Lucide React |
| State | TanStack Query (server state) + Zustand (client state) |
| Auth | NextAuth.js (email + wallet adapter) |
| Real-time | Helius Enhanced WebSocket (LaserStream) |
| Deployment | Vercel |
| RPC | Helius (devnet → mainnet) |

### 5.2 Phases

| Phase | Scope | Weeks |
|-------|-------|-------|
| **1: Landing** | Landing page (all sections), static content, responsive | 1-2 |
| **2: Auth + Shell** | Login, dashboard layout, sidebar, empty states | 3-4 |
| **3: Vault Core** | Create vault, deposit, policy editor, agent management | 5-6 |
| **4: Live Feed** | WebSocket integration, enforcement feed, filter/sort | 7-8 |
| **5: Analytics** | Spending charts, P&L, agent leaderboard, audit export | 9-10 |
| **6: Polish** | Performance optimization, error states, responsive fixes, Lighthouse > 90 | 11-12 |

### 5.3 File Structure

```
app/
├── (landing)/
│   └── page.tsx                        # Landing page
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/
│   ├── layout.tsx                      # Dashboard shell (sidebar, topbar)
│   ├── dashboard/page.tsx              # Overview
│   └── vault/
│       └── [id]/
│           ├── page.tsx                # Vault detail
│           ├── feed/page.tsx
│           ├── policy/page.tsx
│           ├── agents/page.tsx
│           ├── analytics/page.tsx
│           └── audit/page.tsx
├── settings/page.tsx
components/
├── landing/
│   ├── Nav.tsx
│   ├── LiveFeed.tsx
│   ├── HowItWorks.tsx
│   ├── ProtocolStrip.tsx
│   ├── WorkspacePreview.tsx
│   ├── Capabilities.tsx
│   ├── DevIntegration.tsx
│   ├── Pricing.tsx
│   ├── FinalCTA.tsx
│   └── Footer.tsx
├── dashboard/
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── VaultCard.tsx
│   ├── EnforcementFeed.tsx
│   ├── PolicyEditor.tsx
│   ├── AgentManager.tsx
│   └── AnalyticsCharts.tsx
├── shared/
│   ├── StatusPill.tsx                  # SEALED / BLOCKED
│   ├── MetricCard.tsx
│   ├── ConnectionBanner.tsx
│   └── EmptyState.tsx
lib/
├── sigil-client.ts                     # SigilClient wrapper
├── websocket.ts                        # Helius WS connection
├── formatting.ts                       # USD, percent, time formatting
└── constants.ts                        # Program ID, protocol list
```

---

## 6. Anti-Patterns (Never Do)

- ❌ Dark backgrounds on the landing page
- ❌ "Connect Wallet" — always "Log in" or "Get started"
- ❌ Blockchain jargon in user-facing copy (no "PDA", "CPI", "lamports")
- ❌ Centered hero text (left-aligned, like Altitude)
- ❌ Card grids for features (use the 2×2 hairline-border grid)
- ❌ Emojis as icons (use Lucide SVGs)
- ❌ Gradient backgrounds or neon accents
- ❌ Animated counters on landing (they feel crypto, not fintech)
- ❌ "Sigil" anywhere user-facing — always "Sigil"
- ❌ `seal()` in code examples — always `seal()`
- ❌ Stock photos or 3D illustrations
- ❌ Multiple CTA colors (amber only for primary actions)
- ❌ Stat counters or KPI numbers on landing (that's dashboard energy)

---

## 7. Verified Claims for Marketing Copy

| Claim | Source | Safe to use? |
|-------|--------|-------------|
| "Zero added latency" | 200-tx devnet benchmark (Mar 2026): bare avg 902ms, wrapped avg 863ms, delta within noise | Yes — "no additional confirmation latency" |
| "0ms added latency" | Same benchmark — metrics row tooltip | Yes with tooltip explaining methodology |
| "Sub-30ms enforcement" | On-chain compute time for validate+finalize, not wall-clock | Yes — refers to compute, not confirmation |
| "$12M+ protected" | Placeholder for launch — update with real getProgramAccounts data | Update before launch |
| "8 protocols supported" | Jupiter, Orca, Drift, Kamino, Marginfi, Phoenix, Meteora, Raydium | Yes — currently in KNOWN_PROTOCOLS |
| "On-chain enforcement" | Program `4ZeVCq…` deployed on devnet with 29 instructions | Yes |
| "Immutable audit trail" | All instructions emit Anchor events (31 event types) | Yes |
