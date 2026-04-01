# ⚠️ SUPERSEDED — See SIGIL-DESIGN-SPEC.md

> **This file is obsolete.** The Sigil → Sigil rebrand (2026-03-27) replaced this file with `SIGIL-DESIGN-SPEC.md`, which contains the complete design system, landing page spec, dashboard spec, and implementation plan in one document.

---

# Sigil Dashboard — Complete Website Roadmap (ARCHIVED)

> **Version:** 5.0 (Warm Palette — Phalanx Identity) | **Date:** 2026-03-24
> **Status:** Planning — implementation-ready
> **Approach:** Next.js 14 App Router + @usesigil/kit + shadcn/ui + Tailwind + Archivo (display) + Inter (body)
> **Design standard:** Altitude.xyz (Squads) — trust, security, calm through whitespace + institutional copy
> **Prerequisite:** SDK Phase 3 complete + Phase 0 SDK additions (see Section 9)
> **Security audit:** Red-teamed with 19 attack vectors — see Section 8.1
> **Persona-validated:** 7 user personas walked full plan — see Section 13
> **Technical audit:** 8 critical fixes applied — see MEMORY/WORK/20260322-040729_dashboard-technical-audit/

---

## 1. Product Vision

> *"Your agent has the autonomy. Sigil has the control."*

Sigil Dashboard is the control center for AI agent security on Solana. It lets vault owners configure spending limits, manage agents, monitor trading activity in real-time, and respond to security events — all backed by verified enforcement via the Sigil program.

**What makes this different from every other DeFi dashboard:** No existing product combines vault permission management (Altitude/Squads pattern) + trading/spending analytics (institutional fintech pattern) + AI agent performance monitoring + on-chain security enforcement. Sigil occupies this unique intersection.

---

## 2. Target Audience

| Persona | Role | Primary Need | Key Pages |
|---------|------|-------------|-----------|
| **Vault Owner (Non-Technical)** | Owns funds, hired a dev to set up bot | See if money is safe, stop bot if needed | Simple Mode, Overview, Emergency Controls |
| **Agent Developer** | Deploys AI trading bots | Configure vaults, register agents, monitor behavior | Create Vault, Vault Detail, Agent Detail |
| **Treasury Manager** | Oversees agent spending for institution | Set caps, review spending, produce compliance reports, delegate view access | Portfolio, Spending Analytics, Policy Editor, Export |
| **SDK Integrator** | Builds products on top of Sigil | Programmatic vault management, testing, API access | REST API, SDK docs, @usesigil/kit/testing |
| **Protocol Team** | Offers secured agent access | Track agent usage on their protocol, grow volume | Protocol Analytics (public), Protocol API |
| **Security Auditor** | Reviews vault security posture | Inspect constraints, audit trail, export evidence, verify on-chain | Security Tab, Audit Trail, Export, Verification Mode |
| **Power User** | Runs multiple vaults with complex strategies | Cross-vault analytics, agent labeling, constraint builder, Squads multi-sig | Portfolio Analytics, Constraint Builder, Bulk Operations |

---

## 3. Design System

> **Design philosophy: The Phalanx Principle.**
>
> Sigil is named after the phalanx — the ancient Greek shield-wall formation. The user is INSIDE the formation: protected, calm, surrounded by interlocking defenses. Every design decision serves this feeling. The colors are warm (bronze, earth, parchment — not cold blue/purple). The typography is heavy and grounded (Archivo Black). The whitespace is generous (room to breathe inside the wall). The copy is measured and confident (no hype, no urgency).
>
> **What the user should feel in 3 seconds:** "This is beautiful. This is serious. I trust this."
>
> **Two visual languages:**
> - **Landing page (public):** LIGHT MODE. Warm cream/parchment background. Bronze-brown text. No color accent except forest green for "safety" signals. Feels like walking into a well-built stone building.
> - **Dashboard (authenticated):** DARK MODE with warm tones. Not blue-black — warm charcoal and bronze. The dashboard is the inside of the fortress: focused, powerful, data-rich.
>
> **Fintech-first UX principle:** Sigil looks and feels like a fintech platform (Mercury, Ramp, Altitude), **not a crypto dApp**. Users "log in" — they don't "connect a wallet." Blockchain is the backbone, not the brand. No jargon at the door. No "gm" energy. Think: "a platform that happens to run on Solana" not "a Solana dApp."

### Color Palette

**The Sigil palette is WARM. No cold blue. No purple. No indigo.** The warmth communicates safety — the feeling of being inside the shield wall, not staring at it from outside.

#### Landing Page Palette (Light Mode — Public Pages)

| Token | Hex | Usage |
|-------|-----|-------|
| `--landing-bg` | `#FFFCF8` | Page background — warm cream, not blue-white |
| `--landing-bg-subtle` | `#F7F3EE` | Alternate section background — parchment |
| `--landing-text` | `#1C1A17` | Headlines — warm near-black, not pure black |
| `--landing-text-body` | `#5C4A32` | Body text — bronze-brown |
| `--landing-text-muted` | `#8C7E6A` | Captions, labels — aged metal |
| `--landing-border` | `#E2D9CE` | Dividers — warm linen |
| `--landing-cta` | `#1C1A17` | Buttons — warm black (NOT colored) |
| `--landing-safe` | `#4A6741` | "0 Breaches", health indicators — muted forest green |

#### Dashboard Palette (Dark Mode — Authenticated Pages)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#1C1A17` | Main app background — warm charcoal, NOT blue-black |
| `--bg-surface` | `#262220` | Cards, panels, elevated surfaces |
| `--bg-elevated` | `#332E2A` | Hover states, active selections, sidebar active |
| `--bg-input` | `#211F1C` | Form inputs, text areas |
| `--border-default` | `#3D3529` | Card borders, dividers — warm, not cool gray |
| `--border-focus` | `#9E7C4E` | Focus ring — bronze accent |
| `--accent-primary` | `#9E7C4E` | CTAs, active states, links — aged bronze |
| `--accent-hover` | `#B8943F` | Hover states on accent elements — lighter bronze |
| `--accent-muted` | `#7A6340` | Pressed/active accent states |
| `--status-secure` | `#4A6741` | Active/secure, within-cap, healthy — forest green |
| `--status-warning` | `#C4922A` | Approaching limits (>80%), pending — warm amber |
| `--status-danger` | `#B84233` | Exceeded caps, blocked, critical — warm red (not neon) |
| `--status-info` | `#5A7E8C` | Informational badges — muted teal |
| `--text-primary` | `#F0EAE0` | Headlines, primary content — warm white |
| `--text-secondary` | `#A89B8A` | Labels, descriptions — warm gray |
| `--text-muted` | `#7A6F62` | Timestamps, metadata — aged bronze |
| `--text-disabled` | `#4A433B` | Disabled inputs, inactive elements |

**Rationale:** Warm brown-black backgrounds feel like a fortress interior — stone, wood, bronze. Cold blue-black feels like a tech tool. Sigil is a place you trust with your money, not a coding environment. Bronze accent is the shield color. Forest green is the safety signal. No blue, no purple, no indigo anywhere in the brand.

### shadcn/ui CSS Variables (OKLCH — Implementation)

> **Why OKLCH:** shadcn/ui v4 uses OKLCH (perceptually uniform) for all CSS variables. The hex palette above maps into shadcn's variable system below. All OKLCH hues are warm (60-80 range = bronze/amber) instead of cool (250-270 = blue/indigo).

```css
/* globals.css — Sigil warm palette, mapped to shadcn variable system */
@import "tailwindcss";
@import "tw-animate-css";

:root {
  --radius: 0.625rem;
}

/* ─── Landing page (light mode — public pages) ─────────────────────── */
.light, :root {
  --background: oklch(0.99 0.005 80);             /* #FFFCF8 — warm cream */
  --foreground: oklch(0.15 0.02 60);              /* #1C1A17 — warm near-black */
  --card: oklch(0.96 0.008 75);                   /* #F7F3EE — parchment */
  --card-foreground: oklch(0.15 0.02 60);         /* #1C1A17 */
  --popover: oklch(0.99 0.005 80);
  --popover-foreground: oklch(0.15 0.02 60);
  --primary: oklch(0.15 0.02 60);                 /* #1C1A17 — black buttons */
  --primary-foreground: oklch(0.99 0.005 80);     /* cream text on black buttons */
  --secondary: oklch(0.96 0.008 75);
  --secondary-foreground: oklch(0.40 0.04 60);    /* #5C4A32 — bronze body */
  --muted: oklch(0.90 0.01 70);                   /* #E2D9CE — linen */
  --muted-foreground: oklch(0.58 0.03 65);        /* #8C7E6A — aged metal */
  --accent: oklch(0.90 0.01 70);
  --accent-foreground: oklch(0.15 0.02 60);
  --destructive: oklch(0.50 0.15 25);             /* #B84233 — warm red */
  --destructive-foreground: oklch(0.99 0 0);
  --border: oklch(0.90 0.01 70);                  /* #E2D9CE — linen */
  --input: oklch(0.99 0.005 80);
  --ring: oklch(0.55 0.10 70);                    /* #9E7C4E — bronze focus ring */
}

/* ─── Dashboard (dark mode — authenticated pages) ──────────────────── */
.dark {
  /* Core — warm charcoal, NOT blue-black */
  --background: oklch(0.15 0.015 60);             /* #1C1A17 — warm charcoal */
  --foreground: oklch(0.94 0.01 70);              /* #F0EAE0 — warm white */
  --card: oklch(0.19 0.015 55);                   /* #262220 — warm surface */
  --card-foreground: oklch(0.94 0.01 70);
  --popover: oklch(0.23 0.015 55);                /* #332E2A — warm elevated */
  --popover-foreground: oklch(0.94 0.01 70);
  --primary: oklch(0.60 0.10 70);                 /* #9E7C4E — bronze accent */
  --primary-foreground: oklch(0.99 0 0);
  --secondary: oklch(0.23 0.015 55);              /* #332E2A */
  --secondary-foreground: oklch(0.94 0.01 70);
  --muted: oklch(0.23 0.015 55);
  --muted-foreground: oklch(0.52 0.03 60);        /* #7A6F62 — warm muted */
  --accent: oklch(0.23 0.015 55);
  --accent-foreground: oklch(0.94 0.01 70);
  --destructive: oklch(0.50 0.15 25);             /* #B84233 — warm red */
  --destructive-foreground: oklch(0.99 0 0);
  --border: oklch(0.28 0.02 55);                  /* #3D3529 — warm border */
  --input: oklch(0.17 0.015 58);                  /* #211F1C */
  --ring: oklch(0.60 0.10 70);                    /* bronze focus ring */

  /* Chart palette — 8 warm-toned perceptually distinct colors */
  --chart-1: oklch(0.60 0.10 70);                 /* bronze — primary series */
  --chart-2: oklch(0.55 0.12 150);                /* forest green — safety */
  --chart-3: oklch(0.72 0.12 75);                 /* warm amber */
  --chart-4: oklch(0.55 0.08 200);                /* muted teal */
  --chart-5: oklch(0.65 0.12 50);                 /* warm copper */
  --chart-6: oklch(0.50 0.15 25);                 /* warm coral/red */
  --chart-7: oklch(0.68 0.10 90);                 /* warm gold */
  --chart-8: oklch(0.50 0.08 170);                /* deep sage */

  /* Sidebar (warm dark) */
  --sidebar: oklch(0.13 0.012 55);
  --sidebar-foreground: oklch(0.94 0.01 70);
  --sidebar-primary: oklch(0.60 0.10 70);         /* bronze */
  --sidebar-primary-foreground: oklch(0.99 0 0);
  --sidebar-accent: oklch(0.23 0.015 55);
  --sidebar-accent-foreground: oklch(0.94 0.01 70);
  --sidebar-border: oklch(0.28 0.02 55);
  --sidebar-ring: oklch(0.60 0.10 70);

  /* Radius (unchanged) */
  --radius-sm: calc(var(--radius) * 0.6);         /* 6px */
  --radius-md: calc(var(--radius) * 0.8);         /* 8px */
  --radius-lg: var(--radius);                      /* 10px */
  --radius-xl: calc(var(--radius) * 1.4);         /* 14px */
  --radius-2xl: calc(var(--radius) * 1.8);        /* 18px */

  /* Shadows (warm-toned) */
  --shadow-sm: 0 1px 3px oklch(0.08 0.01 55 / 0.3), 0 1px 2px oklch(0.08 0.01 55 / 0.2);
  --shadow-md: 0 4px 8px oklch(0.08 0.01 55 / 0.35), 0 2px 4px oklch(0.08 0.01 55 / 0.25);
  --shadow-lg: 0 8px 24px oklch(0.08 0.01 55 / 0.45), 0 4px 8px oklch(0.08 0.01 55 / 0.3);
  --shadow-xl: 0 16px 48px oklch(0.08 0.01 55 / 0.55), 0 8px 16px oklch(0.08 0.01 55 / 0.35);

  /* Gradients (warm bronze tones) */
  --gradient-accent: linear-gradient(135deg, oklch(0.55 0.10 70), oklch(0.65 0.10 75));
  --gradient-surface: linear-gradient(180deg, oklch(0.21 0.015 55), oklch(0.15 0.015 60));

  /* Glow effects (warm-toned) */
  --glow-accent: 0 0 20px oklch(0.60 0.10 70 / 0.20);
  --glow-success: 0 0 16px oklch(0.55 0.12 150 / 0.20);
  --glow-danger: 0 0 16px oklch(0.50 0.15 25 / 0.25);
  --glow-warning: 0 0 16px oklch(0.72 0.12 75 / 0.20);

  /* Glass morphism (warm dark) */
  --glass-bg: oklch(0.19 0.015 55 / 0.80);
  --glass-border: oklch(1 0 0 / 0.04);
  --glass-blur: 16px;
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

> **Shadow note:** Warm-toned shadows use OKLCH hue 55 (brown) instead of 0 (neutral black). This prevents cool-gray shadow artifacts on warm backgrounds.

> **Chart palette note:** 8 colors with warm base. Primary series uses bronze (--chart-1). Safety/health uses forest green (--chart-2). All hues stay in the warm-to-neutral range (25-200). No purple, no blue-violet. Color-blind safe via varying lightness (L: 0.50-0.72).

### Typography

**Two typeface system:** Archivo for display/headings (brand weight, protection feeling), Inter for body/UI (readability, familiarity).

| Role | Font | Weight | Size | Line Height | Letter Spacing |
|------|------|--------|------|-------------|----------------|
| **Logo / Brand** | Archivo | 900 (Black) | 20px (nav), scalable | 1.0 | **-0.03em** |
| Page Title | Archivo | 800 (Extra Bold) | 28-32px | 1.1 | **-0.03em** |
| Section Heading | Archivo | 700 (Bold) | 20-24px | 1.2 | **-0.02em** |
| KPI Numbers | Archivo | 800 (Extra Bold) | 32-40px | 1.1 | **-0.03em** |
| Card Title | Inter | 600 (SemiBold) | 16-18px | 1.4 | -0.01em |
| Body | Inter | 400 (Regular) | 14-15px | 1.65 | 0 |
| Small / Labels | Inter | 500 (Medium) | 12-13px | 1.5 | **0.06em** (uppercase) |
| Monospace (addresses, TX sigs) | SF Mono / Fira Code | 400 | 13px | 1.5 | 0 |

> **Font choices:**
> - **Archivo Black** for display: Industrial grotesque. Heavy weight feels like steel plates — communicates protection through typography alone. The "x" ending in "Sigil" has a decisive termination in this face. All headings, KPIs, and the logo use Archivo.
> - **Inter** for body/UI: The standard for readability in web applications. Used for all body text, form labels, table cells, descriptions. Familiar and invisible — lets Archivo be the voice.
> - **SF Mono / Fira Code** for monospace: Addresses, transaction signatures, code blocks. NOT Geist Mono — we're not in the Vercel ecosystem visually anymore.

> **Critical: `font-variant-numeric: tabular-nums`** — ALL number displays MUST use `tabular-nums`. Without it, layout shifts when digits change width during live updates. Apply globally:
> ```css
> .tabular-nums { font-variant-numeric: tabular-nums lining-nums; }
> ```
> Apply to: `KPICard`, `BalanceCard`, `SpendGauge`, `CapBar`, `TokenAmount`, `AnimatedNumber`, and all table amount columns.

> **Google Fonts import:**
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Inter:wght@400;450;500;600&display=swap" rel="stylesheet">
> ```

### Spacing System

8px base grid. All spacing uses multiples of 8:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight inline spacing (icon + label) |
| `--space-2` | 8px | Component internal padding, gap between related items |
| `--space-3` | 12px | Small card padding |
| `--space-4` | 16px | Standard card padding, section gaps |
| `--space-5` | 24px | Card padding (desktop), section separators |
| `--space-6` | 32px | Section padding, large gaps |
| `--space-8` | 48px | Page section breaks |
| `--space-10` | 64px | Major section separators (landing page) |

> **Altitude principle:** Generous whitespace communicates calm and trust. Dense UIs feel chaotic. When in doubt, add more space.

### Component States

Every interactive component must define ALL 6 states:

| State | Visual Treatment |
|-------|-----------------|
| **Default** | `--bg-surface` background, `--border-default` border, `--text-primary` text |
| **Hover** | `--bg-elevated` background, border brightens to `--border-focus`, subtle 150ms ease transition |
| **Focus** | 2px `--border-focus` ring (bronze `#9E7C4E`), visible on keyboard tab. Never remove outline. |
| **Active/Pressed** | `--accent-muted` background, scale(0.98) for 100ms |
| **Disabled** | 40% opacity, `cursor: not-allowed`, `--text-disabled` text |
| **Loading** | Pulse animation on skeleton, 1.5s ease-in-out infinite |

**Error states:** Red left-border accent (4px `--status-danger`), red text for field errors, red toast for action failures.

**Empty states:** Centered illustration + heading + description + CTA. Never show an empty table with headers and no rows.

### Surface Composition Hierarchy

How the 3 background levels compose in practice:

```
Page background: --background (#1C1A17 warm charcoal)
  └── Card: --card (#262220) + 1px --border (#3D3529) + --shadow-sm
        └── Nested element (table row): transparent, hover → --bg-elevated (#332E2A)
              └── Active/selected: --bg-selected (rgba(158,124,78,0.12)) /* bronze at 12% */
```

Cards get BOTH `border-default` AND `shadow-sm`. The border provides structure, the shadow provides depth. Without the shadow, the visual hierarchy collapses on dark backgrounds.

**Inner light edge** (premium technique — barely perceptible top highlight on cards):
```css
.card { box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.04), var(--shadow-sm); }
```

### Accessibility Contract

**Contrast fixes (from Designer audit):**
- `--text-disabled` (#334155): **FAILS** — 2.3:1 on `--bg-surface`. **Fix:** raise to `#475569` (3.8:1), then apply `opacity: 0.5` at component level
- `--text-muted` (#64748B) on `--bg-surface`: 3.1:1 — **FAILS for body text**. Restrict to metadata labels (timestamps, secondary descriptions) at 13px+ medium weight, OR raise to `#708090` (4.5:1)
- `--accent-primary` (#9E7C4E bronze) on `--bg-primary` (#1C1A17): 4.8:1 — passes WCAG AA. For body text links, bronze is readable on warm charcoal.

**Focus indicators (exact implementation):**
```css
*:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  border-radius: inherit;
}
/* Double-ring for visibility on all backgrounds */
*:focus-visible {
  box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--border-focus);
}
```

**ARIA requirements:**
- `aria-live="polite"` on `ConnectionBanner` (screen reader announces WS status changes)
- `aria-live="assertive"` on `AlertToast` with CRITICAL severity
- `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` on `SpendGauge` and `CapBar`
- `aria-label` on `AnimatedNumber` with final value (screen readers can't follow spring animations)
- Skip-to-content link before sidebar navigation: `<a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>`
- Every chart must have a visually-hidden `sr-only` data table fallback for screen readers

**Text rendering (apply globally in `globals.css`):**
```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

### Skeleton Loading Pattern

Use gradient shimmer (not basic pulse) for premium feel:

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton-shimmer {
  background: linear-gradient(90deg, var(--card) 0%, var(--bg-elevated) 50%, var(--card) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

Content swap: skeleton fades out, real content fades in via `AnimatePresence mode="wait"`. No layout shift.

### Missing Components (from Designer + Research audit)

| Component | Purpose | Phase |
|-----------|---------|-------|
| `CommandPalette` | Cmd+K quick navigation (search vaults, jump to agent, trigger actions). **Phase 1 — not optional.** Linear made this standard for technical products. Altitude-level users expect it. | **1** |
| `RelativeTime` | "2h 15m until budget resets" — human-readable countdowns | 1 |
| `CopyButton` | Standardized copy-to-clipboard with checkmark feedback (AddressChip, TX sigs) | 1 |
| `Breadcrumb` | Listed in layout but not in component library — formalize | 1 |
| `Skeleton` variants | Per-component shapes: `KPICardSkeleton`, `VaultCardSkeleton`, `ChartSkeleton` | 1 |
| `DataTable` | Shared sortable/filterable table with inline filter chips (NOT filter dialog — Linear pattern). Pagination, sort, column resize. | 1 |
| `NumberTicker` | Spring-animated count-up for KPI values on page load / data change | 1 |
| `WalletAvatar` | Deterministic avatar from wallet pubkey for TopBar (distinct from AgentAvatar) | 1 |
| `KeyboardShortcutTooltip` | Hover any action for 2s → tooltip shows keyboard shortcut. Linear's progressive disclosure pattern. Teaches power-user path without cluttering UI for casual users. | 1 |
| `InlineFilterChips` | Pill-shaped filter indicators that appear inline in data tables. Click to modify, X to remove. No filter dialogs. Mercury/Linear pattern. | 1 |

### Interaction Patterns (from Altitude/Mercury/Linear research)

**Command Palette (Cmd+K):**
The command palette is the keyboard-first navigation hub. It must support:
- Search vaults by name/ID/address
- Jump to any agent detail page
- Quick actions: "Freeze vault", "Pause agent", "Create vault"
- Navigate to any tab on the current vault
- Search activity by TX signature

Implementation: Use `cmdk` package (same as Linear). Render as a centered overlay with blur backdrop. Input auto-focuses. Results grouped by category (Vaults, Agents, Actions, Navigation). Each result shows a keyboard shortcut hint on the right.

**Keyboard Shortcuts:**
| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open command palette |
| `Cmd+Shift+N` | Create new vault |
| `Cmd+1-7` | Switch vault detail tabs (Overview=1, Agents=2, etc.) |
| `Cmd+F` | Focus Activity tab search/filter |
| `Escape` | Close any dialog/sheet/palette |
| `Cmd+.` | Toggle Simple/Advanced mode |
| `?` | Show all keyboard shortcuts |

**Sidebar Dimming (Linear pattern):**
When the user is interacting with the main content area, the sidebar visually recedes:
```css
.sidebar-dimmed {
  opacity: 0.7;
  transition: opacity 300ms ease;
}
.sidebar-dimmed:hover,
.sidebar-dimmed:focus-within {
  opacity: 1;
}
```
This lets the content area dominate without hiding navigation. On hover/focus, the sidebar returns to full opacity instantly.

**Bidirectional Chart ↔ Table Filtering (Mercury pattern):**
On the Spending tab:
- Clicking a bar in the Per-Agent chart filters the Activity table below to that agent's events
- Filtering the Activity table by date range updates the 24h Spending chart to show only that range
- Clicking a segment in the Protocol donut filters both the chart and table to that protocol
- A "Clear filters" pill appears when any cross-filter is active

This creates the Mercury-style "every interaction updates everything" experience. Implementation: use TanStack Query's `queryKey` arrays with filter state. When a chart segment is clicked, update the filter state in Zustand → React Query re-fetches with the new filter → charts and tables re-render.
| `KeyboardShortcutTooltip` | Hover any action for 2s → tooltip shows keyboard shortcut. Linear's progressive disclosure pattern. Teaches power-user path without cluttering UI for casual users. | 1 |
| `InlineFilterChips` | Pill-shaped filter indicators that appear inline in data tables. Click to modify, X to remove. No filter dialogs. Mercury/Linear pattern. | 1 |

### Interaction Patterns (from Altitude/Mercury/Linear research)

**Command Palette (Cmd+K):**
The command palette is the keyboard-first navigation hub. It must support:
- Search vaults by name/ID/address
- Jump to any agent detail page
- Quick actions: "Freeze vault", "Pause agent", "Create vault"
- Navigate to any tab on the current vault
- Search activity by TX signature

Implementation: Use `cmdk` package (same as Linear). Render as a centered overlay with blur backdrop. Input auto-focuses. Results grouped by category (Vaults, Agents, Actions, Navigation). Each result shows a keyboard shortcut hint on the right.

**Keyboard Shortcuts:**
| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open command palette |
| `Cmd+Shift+N` | Create new vault |
| `Cmd+1-7` | Switch vault detail tabs (Overview=1, Agents=2, etc.) |
| `Cmd+F` | Focus Activity tab search/filter |
| `Escape` | Close any dialog/sheet/palette |
| `Cmd+.` | Toggle Simple/Advanced mode |
| `?` | Show all keyboard shortcuts |

**Sidebar Dimming (Linear pattern):**
When the user is interacting with the main content area, the sidebar visually recedes:
```css
.sidebar-dimmed {
  opacity: 0.7;
  transition: opacity 300ms ease;
}
.sidebar-dimmed:hover,
.sidebar-dimmed:focus-within {
  opacity: 1;
}
```
This lets the content area dominate without hiding navigation. On hover/focus, the sidebar returns to full opacity instantly.

**Bidirectional Chart ↔ Table Filtering (Mercury pattern):**
On the Spending tab:
- Clicking a bar in the Per-Agent chart filters the Activity table below to that agent's events
- Filtering the Activity table by date range updates the 24h Spending chart to show only that range
- Clicking a segment in the Protocol donut filters both the chart and table to that protocol
- A "Clear filters" pill appears when any cross-filter is active

This creates the Mercury-style "every interaction updates everything" experience. Implementation: use TanStack Query's `queryKey` arrays with filter state. When a chart segment is clicked, update the filter state in Zustand → React Query re-fetches with the new filter → charts and tables re-render.

### Confirmation Dialog Pattern

All destructive or irreversible actions use the same dialog:
```
┌──────────────────────────────────────────┐
│  [Icon]  Action Title                     │
│                                           │
│  Description of what will happen and      │
│  any consequences.                        │
│                                           │
│  ┌─────────────────────────────────┐     │
│  │ Affected items (vault, agent)   │     │
│  └─────────────────────────────────┘     │
│                                           │
│         [Cancel]    [Confirm Action]      │
│                    (danger-red for        │
│                     destructive ops)      │
└──────────────────────────────────────────┘
```

- **Non-destructive** (deposit, update policy): accent-primary confirm button
- **Destructive** (freeze, revoke, withdraw, close): danger-red confirm button, requires explicit confirmation text (e.g., type vault name to confirm close)
- **All dialogs** use `TransactionPreview` for on-chain actions before wallet popup

### Toast/Notification Positioning

- Position: **bottom-right** (desktop), **top-center** (mobile)
- Max visible: 3 stacked, newest on top
- Auto-dismiss: 5s for INFO/SUCCESS, 10s for WARNING, persist until dismissed for CRITICAL
- Click action: navigates to relevant vault/agent detail page

### Layout Pattern

```
┌────────────────────────────────────────────────────────────────────┐
│ Top Bar (h-14): Logo | Network pill | [bell icon] | Wallet button │
├────────┬───────────────────────────────────────────────────────────┤
│        │                                                           │
│Sidebar │  Breadcrumb: Portfolio > Vault 7Kp3... > Spending         │
│ (w-60) │                                                           │
│        │  ┌──────────────────────────────────────────────────────┐ │
│ Logo   │  │  Page content with generous padding (--space-6)      │ │
│        │  │                                                      │ │
│ Vaults │  │  Cards use --space-5 padding internally              │ │
│ Create │  │  --space-4 gap between cards                         │ │
│Analyt. │  │  --space-8 between page sections                     │ │
│ Docs   │  │                                                      │ │
│        │  │  Max content width: 1280px, centered                 │ │
│ ────── │  │                                                      │ │
│Settings│  └──────────────────────────────────────────────────────┘ │
│        │                                                           │
└────────┴───────────────────────────────────────────────────────────┘
```

- **Left sidebar** (w-60 = 240px, collapsible to w-16 = 64px icons): Navigation + vault quick-switch
- **Top bar** (h-14 = 56px): Logo, network pill (devnet/mainnet with color indicator), notification bell with unread badge, **account button** (shows truncated address + avatar when logged in, "Sign in" when logged out)
- **Breadcrumb** below top bar on all dashboard pages for navigation context
- **Main content**: max-w-7xl (1280px), centered, `--space-6` page padding
- **Mobile (≤768px)**: Sidebar collapses to bottom tab bar (5 tabs: Vaults, Create, Analytics, Alerts, Settings). Top bar shrinks to logo + wallet only.

### Voice & Copy Guidelines

> **Altitude principle:** Institutional-grade copy communicates competence. Every label should make the user feel their money is managed by professionals, not a hackathon project.

| Context | Wrong | Right |
|---|---|---|
| Vault status | "Vault is active" | "Your vault is secured and operational" |
| Cap approaching | "Cap at 80%" | "Daily budget 80% used — $100 remaining" |
| Freeze action | "Freeze vault" | "Pause all agent activity" |
| Error message | "Error 6006: DailyCapExceeded" | "This trade would exceed your daily budget. $50 remains of your $500 limit." |
| Empty state | "No vaults" | "Create your first vault to start protecting your AI agents" |
| Loading | Spinner only | "Loading vault data..." (always explain WHAT is loading) |
| Success | "TX confirmed" | "Agent paused successfully. No trades will execute until you resume." |
| Balance display | "$5,230.45 USDC" | "$5,230.45" with small USDC label below (amount is hero, token is context) |

**Rules:**
1. **Lead with the amount.** "$5,230" first, token symbol second, change arrow third.
2. **Explain consequences.** "This will stop all trading" not just "Freeze vault?"
3. **Use time context.** "2h 15m until budget resets" not "rolling 24h window"
4. **Never show raw error codes** to non-developers. Use `toAgentError()` for all user-facing errors.
5. **Capitalize only the first word** of labels (sentence case, not Title Case). Exception: proper nouns (USDC, Solana, Jupiter).
6. **Blockchain abstraction (CRITICAL).** The UI never uses blockchain jargon as primary language. Blockchain concepts are visible as *details* once logged in, not as the entry point or primary framing.

**Blockchain Abstraction Map (user-facing UI only — SDK/developer docs keep technical terms):**

| Crypto/Blockchain Term | Fintech Replacement | Notes |
|---|---|---|
| Connect Wallet | **Log in** / **Sign in** | Entry point must feel like any SaaS platform |
| Wallet (as identity) | **Account** | "Your account" not "Your wallet" |
| Wallet disconnected | **Signed out** / **Session expired** | Familiar language |
| TX / Transaction (in UI labels) | **Action** / **Trade** / **Operation** | Use the specific verb when possible |
| TX Signature | **Reference ID** | In activity tables, link text says "View details" |
| pubkey (in UI labels) | **Address** or **ID** | Code stays `pubkey`; UI shows "Agent address" |
| On-chain | **Verified** / **Secured** / omit | "Verified on-chain" → "Verified" |
| DeFi activity | **Trading activity** | Or "Financial activity" for lending/borrowing |
| dApp | **Never use** | We are "a platform" or "the dashboard" |
| Token (generic) | **Asset** or the specific name | "$5,230 USDC" not "$5,230 of USDC tokens" |
| SPL Token | **Never in UI** | Internal only |
| Solana Explorer (link text) | **View details** | Links to explorer but label is generic |
| Wallet popup | **Confirmation prompt** | "You'll be asked to confirm" |
| Sign a transaction | **Confirm this action** | "Confirm & sign" → "Confirm" |
| Gas / Priority fee | **Network fee** | If shown at all; ideally hidden or footnoted |
| Mint address | **Asset ID** | For advanced/developer views only |
| Airdrop | **Test funds** (devnet) | "Get test funds" not "Request airdrop" |
| Lamports / SOL fee | **Processing fee** | Approximate in USD when possible |

**The test:** Show any screen to someone who has used Mercury or Ramp but never used crypto. Can they understand what to do? If not, the language needs work.

### 404 / Error Pages

**404 — Vault Not Found:**
```
[Sigil shield icon]

Vault not found

The vault address you're looking for doesn't exist or hasn't been
created yet. Double-check the address or go back to your vaults.

[Go to Portfolio]
```

**Network Error:**
```
[Warning icon]

Unable to connect

We couldn't reach the Solana network. This is usually temporary.
Check your internet connection and try again.

[Retry]  [Check Solana Status →]
```

**Session Expired (on dashboard pages):**
```
[Lock icon]

Your session has expired

Please sign in again to access your vaults.

[Sign in]
```

### Component Library

Built on shadcn/ui (Radix primitives + Tailwind). Key components:

| Component | Purpose | Based On |
|-----------|---------|----------|
| `VaultCard` | Vault summary in portfolio list | shadcn Card |
| `KPICard` | Single metric with label + trend | Custom |
| `SpendGauge` | Semicircle utilization gauge (green/yellow/red) | Custom SVG |
| `PermissionMatrix` | 21-action × N-agent grid with toggles | Custom Table |
| `ActivityRow` | Single event in activity stream | shadcn Table Row |
| `AddressChip` | Truncated address with copy + explorer link | Custom |
| `StatusBadge` | Active/Frozen/Closed/Paused with color | shadcn Badge |
| `CapBar` | Horizontal progress bar (spent/cap) with thresholds | shadcn Progress |
| `TokenAmount` | Amount with token icon + USD conversion | Custom |
| `TxFlowDiagram` | Composed TX visualization (validate→DeFi→finalize) | Custom SVG |
| `PolicyCard` | Policy parameter with current value + edit | shadcn Card |
| `AlertToast` | Security alert with severity + action button | shadcn Toast |
| `AgentAvatar` | Agent pubkey → deterministic avatar + name | Custom |
| `TransactionPreview` | Human-readable action summary before confirmation prompt | Custom |
| `ConnectionBanner` | WebSocket status: connected/reconnecting/lost | Custom |
| `SecurityChecklist` | Binary pass/fail security posture items | Custom |

---

## 3.5 Visual Specifications (Masterclass Addendum)

> **Added:** 2026-03-24 | **Purpose:** Bridge the gap between design tokens and pixel-perfect implementation. These specs eliminate ambiguity for the implementing agent or developer.
> **Design references:** Altitude.xyz (Squads), Mercury.com, Linear.app, Ramp.com. **NOT Drift** — its dashboard is poor.
> **Deep spec companion:** `DASHBOARD-DESIGN-GAPS.md` — 730 lines of additional Recharts JSX code, per-chart-type ghost states, KPI card 3-variant system, and responsive transition animations. Read that file for implementation-ready React code; this section covers the design system decisions.

### 3.5.1 Chart Design System

All charts render inside cards (`--card` background). The chart area itself is transparent against the card.

**Area Chart (24h Spending — the primary visualization):**
```css
/* Line */
stroke: var(--chart-1);              /* #9E7C4E bronze */
stroke-width: 2px;
stroke-linecap: round;
stroke-linejoin: round;

/* Fill gradient (below line) */
fill: linear-gradient(180deg,
  oklch(0.60 0.10 70 / 0.20) 0%,    /* bronze at 20% opacity */
  oklch(0.60 0.10 70 / 0.02) 100%   /* bronze at 2% → effectively transparent */
);

/* Gridlines */
stroke: var(--border);               /* #1E293B */
stroke-width: 1px;
stroke-dasharray: 4 4;               /* Dashed, subtle */
opacity: 0.5;

/* Y-axis labels (dollar values) */
font-family: 'Inter', sans-serif;
font-size: 11px;
font-weight: 500;
fill: var(--text-muted);             /* #64748B */
text-anchor: end;

/* X-axis labels (timestamps) */
font-size: 11px;
font-weight: 400;
fill: var(--text-muted);

/* Cap overlay line (daily budget limit) */
stroke: var(--status-warning);       /* #F59E0B */
stroke-width: 1.5px;
stroke-dasharray: 6 4;               /* Longer dash — distinguishable from gridlines */
/* Label positioned at right edge of chart */
/* "Daily budget: $1,000" in --text-muted, 11px */
```

**Tooltip (shared across all chart types):**
```css
.chart-tooltip {
  background: var(--card);            /* #262220 warm surface */
  border: 1px solid var(--border);    /* #1E293B */
  border-radius: var(--radius-md);    /* 8px */
  padding: 8px 12px;
  box-shadow: var(--shadow-md);
  min-width: 120px;
}
.chart-tooltip-label {
  font-size: 12px;
  color: var(--text-muted);           /* timestamp or category */
  margin-bottom: 4px;
}
.chart-tooltip-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);         /* #F8FAFC */
  font-variant-numeric: tabular-nums;
}
```

**Bar Chart (Per-Agent Spend Comparison):**
```css
/* Bars */
border-radius: 4px 4px 0 0;          /* Rounded top corners only */
gap: 4px;                             /* Between bars in same group */
/* Colors: sequential from chart palette (--chart-1 through --chart-8) */
/* Hover: opacity 1.0 on hovered bar, 0.4 on all other bars (dim, not hide) */
/* Min bar height: 2px (even for near-zero values — shows activity) */
```

**Donut Chart (Protocol Breakdown):**
```css
/* Donut */
outer-radius: 100%;
inner-radius: 65%;                    /* 65% hole — shows center label */
segment-gap: 2px;                     /* Subtle gap between segments */
/* Colors: --chart-1 through --chart-8, sequential by spend rank */

/* Center label (inside the donut hole) */
font-family: 'Archivo', sans-serif;
/* Line 1: total spend, 24px semibold, --text-primary */
/* Line 2: "total spent", 12px regular, --text-muted */

/* Hover: segment expands outward by 4px, tooltip appears */
/* Legend: horizontal below chart, colored dot + label + percentage */
```

**SpendGauge (Semicircle Utilization):**
```css
/* Track (background arc) */
stroke: var(--bg-elevated);           /* #332E2A warm elevated */
stroke-width: 12px;
stroke-linecap: round;

/* Fill arc */
stroke-width: 12px;
stroke-linecap: round;
/* Color by threshold:
   0-59%:  var(--status-secure)   #10B981 (green)
   60-79%: var(--status-warning)  #F59E0B (amber)
   80-94%: #F97316                        (orange — interpolated)
   95%+:   var(--status-danger)   #EF4444 (red)
*/
/* Animated: spring(stiffness: 80, damping: 15) — fills on mount */

/* Center label */
/* Line 1: percentage, 28px bold, --text-primary, tabular-nums */
/* Line 2: "$remaining left" or "Budget used", 12px, --text-muted */

/* Responsive: min-width 120px. Below that, collapse to horizontal CapBar */
```

**Empty Chart State:**
```
┌──────────────────────────────────────────────┐
│                                               │
│         ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐          │
│         │  Ghost chart outline    │          │
│         │  (dashed gridlines      │          │
│         │   at 20% opacity,       │          │
│         │   no data line)         │          │
│         └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘          │
│                                               │
│     Your vault hasn't traded yet              │
│     Activity will appear here after           │
│     your agent's first transaction.           │
│                                               │
└──────────────────────────────────────────────┘
```
- Ghost gridlines at 20% opacity create visual continuity (chart shape is recognizable)
- No Y-axis values (would be "$0" repeatedly — pointless)
- Text is centered, `--text-secondary` (#94A3B8), 14px
- Distinct from loading state: loading = shimmer animation, empty = static illustration + text

### 3.5.2 KPI Card Component Spec

The most repeated component in the dashboard — appears on Portfolio (5 cards), Vault Detail Overview (6 cards), and Agent Detail (4 cards).

```
┌──────────────────────────────────────┐
│  Daily budget used                    │  ← label: 12px, --text-muted, uppercase, 0.04em tracking
│                                       │
│  $4,230.50                            │  ← value: 32px, bold (700), --text-primary, tabular-nums
│                                       │
│  ▲ +12.3%  ·  of $10,000             │  ← trend: 13px, badge + context
│                                       │
│  ████████████████░░░░░░░  84%         │  ← optional: inline CapBar (4px height)
└──────────────────────────────────────┘
```

```css
.kpi-card {
  min-width: 200px;
  padding: var(--space-5);             /* 24px */
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);     /* 10px */
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.04), var(--shadow-sm);
}

.kpi-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: var(--space-2);       /* 8px */
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums lining-nums;
  line-height: 1.1;
  margin-bottom: var(--space-2);
}

/* Trend badge */
.kpi-trend-up {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);     /* 6px */
  background: oklch(0.65 0.17 165 / 0.12);  /* emerald at 12% */
  color: var(--status-secure);         /* #10B981 */
  font-size: 13px;
  font-weight: 500;
}
.kpi-trend-down {
  background: oklch(0.60 0.23 25 / 0.12);   /* coral at 12% */
  color: var(--status-danger);         /* #EF4444 */
}
```

**Loading skeleton:**
```
┌──────────────────────────────────────┐
│  ████████                             │  ← label skeleton: 80px × 12px
│                                       │
│  ██████████████████                   │  ← value skeleton: 160px × 28px
│                                       │
│  ████████  ████████                   │  ← trend skeleton: 2 blocks
└──────────────────────────────────────┘
```
Skeleton blocks use `shimmer` animation from Section 3. Exact dimensions match real content to prevent layout shift on load.

**Hover state** (for clickable KPIs like "24h Spent" → opens Spending tab):
```css
.kpi-card-clickable:hover {
  border-color: var(--border-focus);    /* #9E7C4E bronze */
  cursor: pointer;
  transition: border-color 150ms ease;
}
```

### 3.5.3 Create Vault Wizard Spec

**Progress Stepper:**
```
   ①──────②──────③──────④
 Policy   Agent   Fund   Review

 Active step: filled circle, bronze (#9E7C4E) background, white number
 Completed: filled circle, emerald background, white checkmark
 Upcoming: outlined circle, --border color, --text-muted number
 Connector: 2px line, --border for upcoming, emerald for completed
```

```css
.step-active { background: var(--accent-primary); color: white; }
.step-completed { background: var(--status-secure); color: white; }
.step-upcoming { border: 2px solid var(--border); color: var(--text-muted); }
.step-connector-done { background: var(--status-secure); height: 2px; }
.step-connector-pending { background: var(--border); height: 2px; }
/* All circles: 32px diameter. Step labels: 12px, below circle. */
```

**Step transition:** Slide content left (forward) or right (backward). 200ms, `[0.16, 1, 0.3, 1]` easing. Same as tab transitions.

**Form validation:** Inline real-time validation for critical fields (pubkey format, numeric ranges). Non-critical fields (agent name) validate on step advance. Error messages appear 4px below the input in `--status-danger` at 13px.

**Estimated rent cost:** Shown on Step 4 (Review) below the summary table. Format: "Account creation fee: ~0.02 SOL ($0.004)" with info tooltip: "This one-time fee reserves space on Solana for your vault accounts. It's refundable if you close the vault."

**Preset cards** (Step 1, before custom config):
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  🔄               │  │  📈               │  │  🏦               │  │  ⚙️               │
│  Swap Bot          │  │  Perps Trader     │  │  Treasury         │  │  Custom            │
│                    │  │                    │  │                    │  │                    │
│  $500/day cap     │  │  $2,000/day cap   │  │  $10,000/day cap  │  │  Configure from    │
│  Swap-only perms  │  │  Full perps perms │  │  Multi-agent      │  │  scratch            │
│  Jupiter only     │  │  Jupiter + Flash  │  │  All protocols    │  │                    │
│                    │  │                    │  │                    │  │                    │
│  [Select]          │  │  [Select]          │  │  [Select]          │  │  [Select]          │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘

Card: 200px wide, --card background, --border, --radius-lg
Selected: --accent-primary border (2px), subtle bronze glow
Icon: 24px, centered, --text-muted (unselected) / --accent-primary (selected)
```

**Abandon behavior:** No drafts saved. If user navigates away mid-wizard, show confirmation dialog: "You haven't finished creating your vault. Your progress will be lost." [Continue Setup] [Discard].

### 3.5.4 Responsive Breakpoint Spec

| Element | Mobile (375px) | Tablet (768px) | Laptop (1024px) | Desktop (1280px+) |
|---------|---------------|---------------|----------------|-------------------|
| **Navigation** | Bottom tab bar (5 tabs) | Collapsed sidebar (icons, 64px) | Full sidebar (240px) | Full sidebar (240px) |
| **KPI cards** | 1 column, full width | 2 columns | 3 columns | 4+ columns (flex wrap) |
| **Vault cards** | 1 column, stacked | 2 columns | 3 columns | 3 columns |
| **Vault detail tabs** | Horizontal scroll (swipeable) | Horizontal scroll | Full tab bar | Full tab bar |
| **SpendGauge** | Horizontal CapBar (full width) | Semicircle (compact, 120px) | Semicircle (160px) | Semicircle (200px) |
| **Activity table** | Card list (1 event per card) | 2-column table (truncated) | Full table | Full table |
| **Permission Matrix** | Accordion per agent (expand to see 21 toggles) | Horizontal scroll table | Full grid | Full grid |
| **Charts** | Full width, 200px min-height, hide X-axis labels | Full width, 240px, show every 3rd label | Card-contained, 280px | Card-contained, 320px |
| **SpendingBreakdown** | Stacked: chart above, table below | Side-by-side: chart left, table right | Side-by-side | Side-by-side |

**Critical mobile patterns:**
- Bottom tab bar: 5 items max. Icons only (no labels unless active tab). Height: 56px + safe area padding.
- Touch targets: minimum 44×44px (Apple HIG). All buttons, table rows, tab items.
- Vault detail tabs: use `overflow-x: auto` with `scroll-snap-type: x mandatory` for native-feeling swipe. Active tab indicator slides with spring animation.
- Permission Matrix on mobile: Each agent becomes an expandable accordion section. Tapping expands to show the 21 toggles in a 3-column grid (7 rows × 3 columns). This avoids the impossible 21-column table on a phone.

### 3.5.5 Error & Edge Case UX

**Partial load failure** (1 of 4 RPC calls fails):
- Show the data that DID load normally. In the failed section, show a subtle inline error:
```
┌──────────────────────────────────────┐
│  ⚠️  Couldn't load spending data     │
│  Tap to retry                        │
└──────────────────────────────────────┘
```
- Uses `--status-warning` left border (4px), `--bg-elevated` background.
- "Tap to retry" calls the failed query only, not the entire page.
- Never block the whole page for one failed section.

**WebSocket disconnect during TX signing:**
- Yellow banner: "Connection interrupted — your action may still be processing."
- Don't cancel the TX. Show a "Check status" button that opens Solana Explorer with the TX signature.
- On reconnect, auto-refresh the vault state to confirm the TX landed.

**Optimistic update rollback:**
- On TX failure, the component that was optimistically updated reverts with a subtle red flash (100ms):
```css
@keyframes rollback-flash {
  0% { background: oklch(0.60 0.23 25 / 0.15); }
  100% { background: transparent; }
}
```
- Toast appears: "Action failed — your vault was not changed. [View details]"

**Rate limit (429 from RPC proxy):**
- Replace all loading skeletons with a single message: "Too many requests — waiting to retry..."
- Auto-retry with exponential backoff (2s, 4s, 8s, max 30s). Show countdown: "Retrying in 4s..."
- Never show a raw 429 error to the user.

**Wallet disconnects mid-session:**
- If on a dashboard page: show modal "Your session has ended. Sign in again to continue."
- If in the Create Wizard: show the abandon confirmation dialog first, THEN the sign-in modal.
- Never silently redirect — the user might have unsaved work.

### 3.5.6 Landing Page — Light Mode (Altitude Aesthetic)

> **CRITICAL DESIGN DECISION:** The landing page uses a COMPLETELY SEPARATE design language from the dashboard. The landing page is **light mode** — warm cream backgrounds, bronze-brown text, typography hero, maximum whitespace. The dashboard (logged-in app) is **dark mode** with the warm bronze/charcoal palette defined in Section 3. These are two different products visually. Altitude does this exact split. So does Mercury.
>
> **Why light:** Light communicates trust, transparency, professionalism. Dark communicates "power tool for insiders." The landing page speaks to EVERYONE (vault owners, treasury managers, non-technical people). The dashboard speaks to people who already signed up. Different audiences, different visual language.

#### Landing Page Color Tokens

```css
/* Landing page ONLY — separate from dashboard dark theme */
.landing {
  --landing-bg: #FFFFFF;
  --landing-bg-subtle: #F9FAFB;       /* Very light gray for alternate sections */
  --landing-text: #1C1A17;             /* Warm near-black for headlines */
  --landing-text-body: #4B5563;        /* Dark gray for body text */
  --landing-text-muted: #9CA3AF;       /* Light gray for labels, captions */
  --landing-border: #E5E7EB;           /* Very subtle divider */
  --landing-accent: #1C1A17;           /* Warm black — buttons and CTAs */
  --landing-accent-hover: #374151;     /* Dark gray on hover */
}
```

**Why black CTAs, not indigo:** Altitude uses solid black buttons ("Open an account", "Go to app"). Indigo is for the dashboard's interactive elements. The landing page communicates authority through black — the most confident color in design. Indigo appears only once logged in.

#### Layout: Typography Hero with Atmospheric Background

> **The image is NOT the hero. The headline is the hero.** The background image (Parthenon at sunset) is a muted atmospheric texture that gives the page warmth and depth — visible but never competing with the text. Think watermark, not billboard.

**Hero image treatment:**
- **Image:** Parthenon temple at sunset from Philopappos Hill, Athens (Unsplash: `photo-1603565816030-6b389eeb23cb`)
- **Why this image:** The Parthenon is where the phalanx was born — Greek civilization, strength through formation, the origin of Western concepts of defense. It connects "Sigil" to its name without being literal.
- **Opacity:** `0.18` — visible enough to feel the warm stone columns and golden sky, muted enough that text is perfectly readable
- **Filter:** `saturate(0.4) sepia(0.15)` — desaturates most color, adds warm sepia tone to match the parchment/bronze palette
- **Position:** `object-position: center 60%` — shows the temple and Acropolis hill, crops the sky
- **Fade:** Bottom 45% gradient fades to `#FFFCF8` (cream background) — the image dissolves into the page, no hard edge
- **Coverage:** Top 75vh of the page — behind nav and hero text, gone before the metrics section

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░░ Parthenon image at 18% opacity, warm sepia ░░░░░░░░░░░░░░░░░░░░░░░░░░│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│  Sigil    Solutions  Product  Company              [Book a demo] [Go to app]│
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│                                                                              │
│  The shield wall for                                                         │  ← Archivo Black 68px, #1C1A17
│  autonomous agents                                                           │     Left-aligned, max-width 660px
│                                                                              │
│  Spending limits, permissions, and real-time                                 │  ← Inter 18px, #5C4A32
│  monitoring for AI agents managing DeFi                                      │     max-width 460px
│  positions on Solana.                                                        │
│                                                                              │
│  [Enter your business email   ] [Get started]                                │  ← pill input + #1C1A17 pill button
│                                                                              │
│  Already using the SDK?  Read the docs →                                     │  ← Inter 14px, #8C7E6A + underlined link
│ ─────────────────────────────────────────────────── (image faded to cream) ──│
│                                                                              │
│  $2.4M    47          12          0                                          │  ← Archivo 800, metrics section
│  Protected  Agents     Active      Breaches                                  │     (below the image fade — clean cream bg)
│                                Trusted by leading teams | Solana-native      │
│                                [logo] [logo] [logo] [logo]                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Exact CSS for the hero background:**
```css
.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 75vh;
  overflow: hidden;
  z-index: 0;
}
.hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 60%;
  opacity: 0.18;
  filter: saturate(0.4) sepia(0.15);
}
.hero-bg .fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(to bottom, transparent 0%, #FFFCF8 100%);
}
```

**The nav, headline, body text, email input, and buttons all sit ON TOP of this (z-index: 5+).** The background is purely atmospheric — it adds warmth and depth without demanding attention. If you removed it entirely, the page would still work. That's the test.

#### Hero Background: Video Enhancement (Recommended)

> **The image treatment above is the baseline.** For a breathtaking first impression, replace the static Parthenon image with a muted drone video of the Acropolis. Same opacity, same sepia, same fade — but the clouds drift, the light shifts, and the page feels alive.

**Video source (free, no attribution required):**
- **Primary:** [Drone Footage of the Acropolis of Athens — Matheus Bertelli (Pexels)](https://www.pexels.com/video/drone-footage-of-the-acropolis-of-athens-15171884/) — sunrise drone shot, golden warm tones, slow pan. 1080p available.
- **Alternative:** [Stunning Aerial Footage of Athens Acropolis — Ekaterina Rodina (Pexels)](https://www.pexels.com/video/stunning-aerial-footage-of-athens-acropolis-32388963/) — wider aerial view, city context.
- **License:** Pexels License — free for commercial use, no attribution required.

**Video treatment (same muting as the image):**
```css
.hero-video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 50%;
  opacity: 0.15;                           /* Slightly lower than image (0.18) — video movement adds perceived brightness */
  filter: saturate(0.35) sepia(0.2) contrast(0.95);
}
```

**Implementation (single `<video>` element — no separate image, no fade, no shift):**

> **CRITICAL: The poster IS frame 1 of the video.** Extract it with FFmpeg from the exact same source. When the video starts playing, it begins on the identical frame the poster shows. The user sees a still image that seamlessly begins moving. Zero transition. Zero layout shift. Zero visual discontinuity.

```html
<div class="hero-video-container">
  <!-- poster = exact first frame of the video. No separate <img>. No fade. -->
  <video
    muted
    autoplay
    loop
    playsinline
    preload="auto"
    poster="/video/acropolis-frame1.webp"
  >
    <source src="/video/acropolis-hero.webm" type="video/webm">
    <source src="/video/acropolis-hero.mp4" type="video/mp4">
  </video>

  <div class="fade-bottom"></div>
</div>
```

**What this does NOT have:**
- ❌ No separate `<img>` element for the poster
- ❌ No CSS fade transition between poster and video
- ❌ No JavaScript `playing` event listener to swap images
- ❌ No `.video-playing` class toggle
- ❌ No visual difference between "loading" and "playing" states

**What happens:**
1. Browser renders `poster` attribute instantly — shows frame 1 of the video as a static image
2. Video downloads in background (`preload="auto"` — start loading immediately, this is above-the-fold content)
3. When ready, video begins playing FROM frame 1 — identical to what the poster showed
4. The still image silently becomes a moving video. The user never sees a transition.
5. If video never loads (error, slow connection) — the poster stays. It IS the first frame. It looks correct either way.

**Optimization requirements (CRITICAL for Core Web Vitals):**

| Requirement | Target | Why |
|---|---|---|
| **Duration** | 12-20 seconds loop | Longer = larger file. 15s is the sweet spot. |
| **Resolution** | 720p (1280×720) | At 15% opacity with sepia, 4K is wasted. 720p is indistinguishable. |
| **Bitrate** | 1.0-1.5 Mbps | Keeps file size under 3MB for a 15s clip |
| **File size** | < 3MB (WebM), < 4MB (MP4) | Loads in ~2s on broadband. |
| **Audio** | Removed entirely | Saves ~30% file size. `muted` is required for autoplay. |
| **Format** | WebM (VP9) primary, MP4 (H.264) fallback | WebM is 30-50% smaller at same quality |
| **Poster** | WebP, < 60KB, **exact first frame of the video** | Extracted via FFmpeg `-vframes 1`. Must be pixel-identical to frame 1. |
| **CDN** | Serve from Vercel Edge or Cloudflare R2 | Long cache headers (`max-age=31536000`). Range requests enabled. |
| **Mobile data saver** | Remove `<video>` via JS, poster stays | `if (navigator.connection?.saveData) video.remove();` |
| **Reduced motion** | Pause video, poster stays | `@media (prefers-reduced-motion: reduce) { video { display: none; } }` |

**FFmpeg commands (for the implementing agent):**
```bash
# Download the Pexels video first, then:

# 1. Extract exact first frame as poster (MUST be frame 1 — not a random frame)
ffmpeg -i acropolis-raw.mp4 -vframes 1 -vf "scale=1280:720" -quality 75 acropolis-frame1.webp

# 2. Trim to 15 seconds, remove audio, scale to 720p — WebM (primary)
ffmpeg -i acropolis-raw.mp4 -t 15 -an -vf "scale=1280:720" -c:v libvpx-vp9 -b:v 1200k -crf 35 acropolis-hero.webm

# 3. Same but MP4 fallback (H.264 for Safari)
ffmpeg -i acropolis-raw.mp4 -t 15 -an -vf "scale=1280:720" -c:v libx264 -preset slow -b:v 1500k -crf 28 acropolis-hero.mp4

# VERIFY: Open acropolis-frame1.webp and play acropolis-hero.webm side by side.
# Frame 1 of the video MUST be visually identical to the poster. If not, re-extract.
```

**Reference mockup:** `~/Downloads/sigil-video.html` — open in browser to see live video with warm sepia treatment.

#### Component Specifications

**Navigation (transparent, floats over hero image):**
```css
.landing-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 48px;
  /* No background — transparent over the hero image */
}
.landing-nav-logo {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
}
.landing-nav-links a {
  font-size: 15px;
  font-weight: 450;
  color: #374151;
  margin-left: 32px;
}
.landing-nav-cta-secondary {
  padding: 10px 20px;
  border: 1px solid #D1D5DB;
  border-radius: 999px;               /* Full pill shape — Altitude pattern */
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  background: white;
}
.landing-nav-cta-primary {
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background: #111827;                 /* Black, not indigo */
}
```

**Hero Image:**
- Full-bleed: `width: 100vw; height: 60vh; object-fit: cover;`
- Bottom fade: gradient overlay `linear-gradient(to bottom, transparent 60%, white 100%)`
- The nav floats on top with transparent background
- Image selection: Use aspirational, abstract photography that communicates scale and frontier. NOT blockchain imagery. NOT abstract geometric patterns. Think: aerial landscapes, architectural photography, expansive horizons. Commission or license from Unsplash/Getty.
- The image IS the first impression. Get it right.

**Headline + Body (below image, left-aligned):**
```css
.landing-headline {
  font-family: 'Inter', sans-serif;
  font-size: 42px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.025em;
  line-height: 1.15;
  max-width: 480px;                    /* Never wider — text needs to feel compact */
  margin: 0 0 16px 0;
}
.landing-body {
  font-size: 16px;
  font-weight: 400;
  color: #4B5563;
  line-height: 1.6;
  max-width: 520px;
  margin-bottom: 32px;
}
```

**Email Capture (Altitude pattern — email input + CTA inline):**
```css
.landing-email-group {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}
.landing-email-input {
  padding: 12px 20px;
  border: 1px solid #D1D5DB;
  border-radius: 999px;               /* Pill */
  font-size: 15px;
  color: #111827;
  background: white;
  width: 260px;
  outline: none;
}
.landing-email-input::placeholder {
  color: #9CA3AF;
}
.landing-email-input:focus {
  border-color: #111827;
}
.landing-email-submit {
  padding: 12px 24px;
  border-radius: 999px;
  background: #111827;
  color: white;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 150ms;
}
.landing-email-submit:hover {
  background: #374151;
}
```

**Social Proof (right-aligned, understated):**
```css
.landing-social-proof {
  position: absolute;
  bottom: 48px;
  right: 48px;
  text-align: right;
}
.landing-social-proof-text {
  font-size: 13px;
  color: #9CA3AF;
  margin-bottom: 12px;
}
.landing-social-proof-logos {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: flex-end;
}
.landing-social-proof-logos img {
  height: 20px;
  filter: grayscale(100%);
  opacity: 0.4;
  transition: opacity 200ms;
}
.landing-social-proof-logos img:hover {
  opacity: 0.8;
}
```

#### Below the Fold (Scroll Pages)

The first viewport is the hero. Below the fold, additional sections appear — but with the SAME restraint. No card grids, no 4-column features. One concept per section with maximum whitespace.

**Section 2: Product Overview (SDK focus)**
- White background
- Left: Headline "Build with @usesigil/kit" + 2-line description + "Read the docs →" link
- Right: Code block with syntax highlighting on a near-black `#0D1117` background
- This section targets developers. It's the ONE section that mentions code.

**Section 3: How It Works (if needed)**
- Only include if conversion data shows people need more context
- Three numbered items, vertically stacked (NOT cards in a row), left-aligned
- Each: number + one-line heading + one-line description
- No icons, no cards, no boxes. Just text. Altitude confidence.

**Section 4: Footer**
```css
.landing-footer {
  padding: 60px 48px 40px;
  max-width: 1280px;
  margin: 0 auto;
  border-top: 1px solid #E5E7EB;
}
/* Same structure as dark theme footer but with light colors */
/* --landing-text for links, --landing-text-muted for labels */
/* "Built on Solana" in --landing-text-muted, bottom-right, small */
```

#### What This Page Does NOT Have

- ❌ No dark background anywhere on the landing page
- ❌ No card grids or feature boxes
- ❌ No stat counters or KPI numbers (that's dashboard energy, not marketing energy)
- ❌ No indigo accent color (save it for the app)
- ❌ No "How It Works" 3-column layout (basic web design)
- ❌ No emojis as icons
- ❌ No gradient buttons
- ❌ No centered hero text (Altitude left-aligns everything)
- ❌ No "Connect Wallet" anywhere
- ❌ No blockchain imagery, chain logos, or protocol diagrams

#### What This Page DOES Have

- ✅ One stunning hero image that communicates frontier/scale
- ✅ One confident headline, left-aligned, under 10 words
- ✅ One body sentence (not paragraph)
- ✅ Email capture with black pill button
- ✅ Understated social proof with grayscale logos
- ✅ Extreme whitespace
- ✅ A page that could be for any premium fintech — you'd never know it's crypto until you sign in

---

## 4. Page Architecture

### 4.1 Public Pages (No Wallet Required)

#### `/` — Landing Page (Light Mode — Warm Phalanx Aesthetic)

**Purpose:** Convert visitors to users. Feels like a premium fintech marketing site, not a dApp or crypto project.

**CRITICAL: This page is LIGHT MODE with warm cream palette.** Typography is the hero. Parthenon background is atmospheric (18% opacity, sepia). See Section 3.5.6 for full visual spec, exact CSS, and image treatment.

**Above the fold (first viewport — ~100vh):**
1. **Nav:** Floats over atmospheric background. "Sigil" in Archivo Black (left), text links in bronze-brown (center), "Book a demo" (ghost pill with backdrop-blur) + "Go to app" (warm black pill) buttons (right).
2. **Atmospheric background:** Parthenon at sunset (Unsplash `photo-1603565816030-6b389eeb23cb`) at 18% opacity with `saturate(0.4) sepia(0.15)`. Covers top 75vh. Fades to cream at bottom. NOT a hero image — atmospheric texture only.
3. **Headline:** "The shield wall for autonomous agents" — Archivo Black 68px, `#1C1A17`, left-aligned, max-width 660px. This is the hero. Not the image.
4. **Body:** "Spending limits, permissions, and real-time monitoring for AI agents managing DeFi positions on Solana. No additional confirmation latency -- our security layer executes within the same Solana slot as your trade." — Inter 18px, `#5C4A32`, max-width 460px.
5. **Email capture:** Pill input ("Enter your business email") with backdrop-blur + warm black pill button ("Get started").
6. **Secondary CTA:** "Already using the SDK? **Read the docs →**" — Inter 14px, `#8C7E6A` with underlined link.
7. **Below the fold (cream background, no image):** Metrics row ($2.4M / 47 / 12 / 0 / 0ms), features grid, SDK code section, social proof, footer. The "0ms" metric reads "0ms added latency" with tooltip: "Verified across 200 devnet transactions. Sigil executes within the same Solana slot as your trade -- no additional confirmation time."
8. **Social proof:** Fixed bottom-right. "Trusted by leading teams | Solana-native" + partner logos at 15% opacity in Archivo Bold.

**Below the fold (scroll):**
9. **SDK section:** White background. Left: headline + 2-line description + docs link. Right: code block (dark background) with `seal()` example.
10. **Footer:** Light gray background, 4-column grid, "Built on Solana" badge bottom-right.

**What this page does NOT have:** Dark backgrounds, card grids, stat counters, feature boxes, emojis, indigo buttons, "Connect Wallet", centered text, or anything that looks like a crypto dApp.

#### `/docs` — Documentation
**Purpose:** SDK reference, integration guides, API docs.
**Implementation:** MDX pages or external docs site (Mintlify/Docusaurus).

---

### 4.2 Dashboard Pages (Authenticated)

#### `/dashboard` — Portfolio Overview
**Purpose:** All vaults at a glance. The home page after signing in.

**KPI Cards (top row):**
| Metric | Source | Update |
|--------|--------|--------|
| Total Value Protected | Sum of all vault token balances | WebSocket live (30s poll fallback) |
| Active Vaults | Count of vaults with status=Active | WebSocket live |
| Total Agents | Sum of agent counts across vaults | WebSocket live |
| 24h Volume | Sum of `vault.totalVolume` deltas | WebSocket live |
| 24h Fees Collected | Sum of `vault.totalFeesCollected` deltas | WebSocket live |

**Vault List:**
- Card grid (desktop: 3 columns, tablet: 2, mobile: 1)
- Each card shows: vault name/ID, status badge, balance, cap utilization bar, agent count, last activity timestamp
- Sort by: balance, spending, agents, activity
- Filter by: status (Active/Frozen/Closed)

**Data flow:**
```typescript
// Step 1: Discover all vaults for the connected owner
const vaultAddresses = await findVaultsByOwner(rpc, ownerPubkey);

// Step 2: Resolve full state for each vault (use owner variant for multi-agent budget views)
const states = await Promise.all(
  vaultAddresses.map(v => resolveVaultStateForOwner(rpc, v.vaultAddress))
);

// Step 3: Subscribe to real-time updates via Helius Enhanced WebSocket
// (subscribeToVault is dashboard-side, in lib/websocket.ts)
vaultAddresses.forEach(v => {
  subscribeToVault(enhancedWs, v.vaultAddress, (updatedState) => {
    queryClient.setQueryData(['vault', v.vaultAddress], updatedState);
  });
});
```

**Actions:** Create New Vault button, click vault → detail page

**Empty state (0 vaults):**
```
┌─────────────────────────────────────────────────────┐
│                                                      │
│        [Shield illustration]                         │
│                                                      │
│   Secure your first AI agent                         │
│                                                      │
│   Create a vault to set spending limits,             │
│   manage permissions, and monitor your               │
│   agent's DeFi activity in real-time.                │
│                                                      │
│   [Create Your First Vault]                          │
│                                                      │
│   Using the SDK?  npm install @usesigil/kit →          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

#### `/dashboard/create` — Create Vault Wizard
**Purpose:** Step-by-step vault provisioning.

**Steps:**
1. **Configure Policy** — Daily cap (USD slider), max TX size, protocol mode (allow all / allowlist), max slippage
2. **Register Agent** — Agent pubkey input, permission checkboxes (21 ActionTypes), per-agent spending limit
3. **Fund Vault** — Token selector, amount input, balance display
4. **Review & Create** — Summary of all settings, estimated rent cost, Create Vault button

**Data flow:**
```typescript
const result = await createVault({
  rpc, network, owner, agent,
  dailySpendingCapUsd, maxTransactionSizeUsd,
  permissions, spendingLimitUsd,
  protocols, protocolMode,
});
// Returns: vaultAddress, initializeVaultIx, registerAgentIx
```

**Post-creation:** Redirect to vault detail page with success toast.

---

#### `/dashboard/vault/[address]` — Vault Detail (THE CORE PAGE)
**Purpose:** Complete vault management. 7 tabs.

**Header (persistent across tabs):**
- Vault address (truncated + copy)
- Status badge (Active/Frozen/Closed)
- Total balance (with token breakdown)
- 24h cap utilization gauge
- Quick actions: Freeze/Reactivate, Deposit, Withdraw
- WebSocket connection status indicator (green dot / yellow reconnecting / red lost)

**Action confirmation flow (ALL owner actions):**
Every action button opens a `TransactionPreview` dialog before the confirmation prompt:
```
┌──────────────────────────────────────────┐
│ Confirm Action                           │
│                                          │
│ Action: Pause Agent                      │
│ Vault:  7Kp3...xQ2m                      │
│ Agent:  FjR9...2nPk                      │
│ Network fee: < $0.01                     │
│                                          │
│ [Confirm]  [Cancel]                      │
└──────────────────────────────────────────┘
```
This catches XSS modifications and browser extension injection before the confirmation prompt. Network fee shown in USD (approximate), not SOL/lamports. Program ID hidden from this view — it's in the "Advanced details" expandable section for developers.

##### Tab: Overview
**KPI Cards:**
| Metric | Source |
|--------|--------|
| Balance | Token account query |
| 24h Spent / Cap | `globalBudget.spent24h` / `globalBudget.cap` |
| Active Agents | `vault.agents.length` |
| Open Positions | `vault.openPositions` |
| Total TXs | `vault.totalTransactions` |
| Total Volume | `vault.totalVolume` |

**Charts:**
- 24h Spending Area Chart (144 SpendTracker buckets, 10-min resolution)
- Per-Agent Spending Bars (from AgentSpendOverlay)
- Recent Activity Feed (last 10 events)

##### Tab: Agents
**Agent List Table:**
| Column | Source |
|--------|--------|
| Agent Address | `vault.agents[i].pubkey` |
| Status | `vault.agents[i].paused` |
| Permissions | `permissionsToStrings(vault.agents[i].permissions)` |
| Spending Limit | `vault.agents[i].spendingLimitUsd` |
| 24h Spent | `agentBudget.spent24h` |
| Actions | Pause/Unpause, Edit Permissions, Revoke |

**Actions:**
- Register New Agent (dialog)
- Edit Permission Matrix (21 toggles per agent)
- Update Spending Limit
- Pause/Unpause Agent
- Revoke Agent (with confirmation)

**SDK calls:**
```typescript
registerAgent({ owner, vault, agent, permissions, spendingLimitUsd })
pauseAgent({ owner, vault, agentAddr })
unpauseAgent({ owner, vault, agentAddr })
updateAgentPermissions({ owner, vault, agentAddr, newPermissions })
revokeAgent({ owner, vault, agentAddr })
```

##### Tab: Policy
**Policy Cards:**

| Setting | Current Value | Edit |
|---------|-------------|------|
| Daily Spending Cap | `policy.dailySpendingCapUsd` | Slider + input |
| Max Transaction Size | `policy.maxTransactionSizeUsd` | Input |
| Protocol Mode | Allowlist / Denylist / Allow All | Radio |
| Allowed Protocols | `policy.protocols[]` | Add/remove |
| Max Slippage | `policy.maxSlippageBps` / 100 + "%" | Slider |
| Max Leverage | `policy.maxLeverageBps` | Input |
| Max Positions | `policy.maxConcurrentPositions` | Stepper |
| Developer Fee Rate | `policy.developerFeeRate` BPS | Input |
| Timelock Duration | `policy.timelockDuration` seconds | Input |

**Timelock flow:** If timelock > 0, changes go through queue → wait → apply:
```typescript
queuePolicyUpdate({ owner, vault, newPolicy })
// Wait timelockDuration seconds...
applyPendingPolicy({ owner, vault })
// Or cancel:
cancelPendingPolicy({ owner, vault })
```

**Pending changes banner:** Yellow banner when `hasPendingPolicy` is true, showing queued changes + countdown + Apply/Cancel buttons.

##### Tab: Activity
**Transaction History Table:**

| Column | Source |
|--------|--------|
| Timestamp | Block time |
| Type | Event name (ActionAuthorized, FundsDeposited, etc.) |
| Agent | `event.agent` address |
| Amount | `event.amount` (formatted with token symbol) |
| Status | Success / Failed / Expired |
| Reference ID | "View details" link (opens Solana Explorer, but label is generic) |

**Filters:** Event type, agent, date range, status
**Data source:** Helius Enhanced Transactions API or `parseSigilEvents()` from TX logs

##### Tab: Spending
**Analytics dashboard for this vault.**

**Charts:**
1. **24h Rolling Spend** — Area chart, 144 buckets, cap overlay line
2. **Per-Agent Spend Comparison** — Stacked bar chart (hourly)
3. **Per-Protocol Breakdown** — Donut chart from `protocolBudgets[]`
4. **Cap Utilization Gauges** — Vault-level + per-agent semicircle gauges
5. **Spend Forecast** — "At current rate" projection to cap hit time
   - Only shown when >= 12 buckets (2+ hours) have data (minimum statistical basis)
   - Labeled "At current rate" — not "Forecast" (avoid false precision)
   - Shows confidence band (low/mid/high), not a single line
   - Based on weighted moving average, not raw linear regression from last 60 min

**Data transformation:**
```typescript
// Use getSpendingHistory() from SDK (handles bigint → display conversion safely)
// NOTE: Requires both tracker AND current timestamp (for window calculation)
const history = getSpendingHistory(state.tracker, state.resolvedAtTimestamp);
// Returns: SpendingEpoch[] = { epochIndex: number, timestamp: number, usdAmount: bigint, usdDisplay: string }[]
// usdDisplay is pre-formatted string ("$123.45") — no Number(bigint) precision loss

// For chart libraries that require number input:
const chartData = history.map(h => ({
  timestamp: h.timestamp,
  amount: Number(h.usdAmount) / 1e6, // Safe for per-epoch values (< $9T per 10-min bucket)
  label: h.usdDisplay, // "$123.45" — for tooltips
}));
```

##### Tab: Escrow
**Escrow Management:**

| Column | Source |
|--------|--------|
| Escrow ID | `escrow.escrowId` |
| Destination Vault | `escrow.destinationVault` |
| Amount | `escrow.amount` |
| Status | Active / Settled / Refunded |
| Expires | `escrow.expiresAt` countdown |
| Actions | Refund (owner) / Close Settled (owner) |

> **Note:** Escrow creation and settlement are AGENT actions (require agent signer), not owner actions. The dashboard shows escrows as read-only with owner-only actions (refund expired, close settled). Agents create and settle escrows programmatically via `seal()` or MCP tools.

**SDK calls (owner-only):**
```typescript
refundEscrow({ owner, escrow })      // Refund expired escrow back to source vault
closeSettledEscrow({ owner, escrow }) // Close settled escrow, reclaim rent
```

##### Tab: Security
**Security Controls:**

1. **Emergency Controls**
   - Freeze Vault (big red button, confirms with dialog)
   - Reactivate Vault (shows after freeze)

2. **Instruction Constraints** (if configured)
   - Constraint entries table (program, operator, operand)
   - Queue/Apply/Cancel constraint updates

3. **Simulation Preview**
   - Paste a base64 TX → `simulateBeforeSend()` → show risk flags, CU, balance deltas
   - `detectDrainAttempt()` visualization

4. **Security Checklist** (binary pass/fail — not a score)
   - [ ] No agent has FULL_PERMISSIONS (21/21 bits)
   - [ ] Daily spending cap is configured (not unlimited)
   - [ ] Per-agent spending limits set for all agents
   - [ ] Protocol mode is Allowlist (not Allow All)
   - [ ] Timelock duration > 0 (policy changes require waiting period)
   - [ ] Max slippage below 10%
   - [ ] Instruction constraints configured (advanced, optional)
   - Each item is binary, actionable, and non-misleading. A composite score creates false confidence — a single FULL_PERMISSIONS agent can drain the vault regardless of a "85/100" score.

5. **Audit Trail**
   - Policy change history
   - Agent permission change history
   - Emergency events (freezes, revocations)

---

#### `/dashboard/vault/[address]/agent/[agentAddress]` — Agent Detail
**Purpose:** Deep dive into a single agent's behavior.

**KPI Cards:** 24h Spent / Limit, TX Count, Success Rate, Last Active
**Charts:** Agent spending over time, error breakdown, permission utilization heatmap
**Actions:** Pause, Edit Permissions, Revoke

---

#### `/dashboard/settings` — User Settings
**Purpose:** App preferences.

**Sections:**
- Network selector (devnet / mainnet)
- Notification preferences (in-app, email, webhook URL)
- Theme (dark only for v1)
- Explorer preference (Solana Explorer, Solscan, SolanaFM)

> **Security note:** RPC endpoint is NOT user-configurable. Hardcoded to Helius (devnet/mainnet) via Edge Function proxy. Custom RPC allows attackers to control all dashboard data (Red Team Vector 5B). If needed for power users in the future, gate behind a "Developer Mode" toggle with a prominent red warning banner.

---

## 5. Data Architecture

### Data Tiers

| Tier | Source | Latency | Retention | Use | Phase |
|------|--------|---------|-----------|-----|-------|
| **L0** | Helius Enhanced WebSocket `accountSubscribe` | ~200-400ms | Real-time stream | Live KPI cards, gauges, status, activity feed | Phase 1 |
| **L0-fallback** | `resolveVaultState()` RPC poll | 30s | Snapshot on reconnect | Recovery after WebSocket drops | Phase 1 |
| **L1** | Helius Enhanced Transactions API | ~1-2s | Last 100 TXs | Transaction history on page load, historical activity tab | Phase 2 |
| **L2** | On-chain SpendTracker (144 epochs) | On-demand RPC | 24h rolling | Spending time-series charts | Phase 2 |
| **L3** | `VelocityTracker` in-memory | 5s | Session only | Velocity gauges, rapid-fire detection | Phase 2 |
| **L4** | Helius webhooks → PostgreSQL | ~2s | 90 days raw, 1yr aggregated | Historical analytics (7d/30d/90d), email alerts | Phase 4 (backend) |
| **L5** | PostHog/Plausible | Async | Indefinite | Product analytics, funnel metrics | Phase 5 |

> **Architecture decision:** Phases 1-3 are fully client-side (no backend). All real-time data comes from Helius Enhanced WebSocket + RPC. 24h history is on-chain in SpendTracker. TX history via Helius Enhanced Transactions API (REST, browser-callable). PostgreSQL indexer deferred to Phase 4 — only needed for data older than 24h and email alerts.

### Real-Time Strategy — Helius Enhanced WebSocket + TanStack Query

Standard Solana WebSockets (`accountSubscribe`) are documented as "quite brittle and unreliable" (Helius). Use Helius Enhanced WebSockets (LaserStream backend) instead — 1.5-2x faster, server-side filtering, reliable delivery.

**Architecture: WebSocket → TanStack Query cache → React (single source of truth)**

All vault state lives in TanStack Query's cache. WebSocket updates push directly into the cache via `queryClient.setQueryData()`. Components read from React Query hooks — never from raw WebSocket state. This gives us: automatic deduplication, stale-while-revalidate on reconnect, Suspense integration, and DevTools inspection.

```typescript
// hooks/useVaultState.ts — the primary data hook
'use client';

import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useVaultState(vaultAddress: string) {
  const queryClient = useQueryClient();

  // Initial fetch via RPC (Suspense-compatible — shows loading.tsx skeleton)
  const { data: vaultState } = useSuspenseQuery({
    queryKey: ['vault', vaultAddress],
    queryFn: () => resolveVaultState(rpc, vaultAddress),
    staleTime: 10_000, // 10s — WebSocket updates keep it fresh between refetches
  });

  // WebSocket subscription pushes updates directly into React Query cache
  useEffect(() => {
    const ws = getWebSocket(); // Singleton WebSocket manager
    const unsubscribe = subscribeToVault(ws, vaultAddress, {
      onStateChange: (newState) => {
        // Push WebSocket update directly into the query cache
        queryClient.setQueryData(['vault', vaultAddress], newState);
      },
      onEvent: (decodedEvent) => {
        // Prepend to activity feed cache
        queryClient.setQueryData(
          ['vault-events', vaultAddress],
          (old: DecodedEvent[] = []) => [decodedEvent, ...old].slice(0, 100)
        );
      },
    });
    return unsubscribe;
  }, [vaultAddress, queryClient]);

  return vaultState;
}
```

**Prefetching pattern (vault list → vault detail):**
```typescript
// components/portfolio/VaultCard.tsx — prefetch on hover
function VaultCard({ address }: { address: string }) {
  const queryClient = useQueryClient();

  return (
    <Link
      href={`/dashboard/vault/${address}`}
      onMouseEnter={() => {
        // Start fetching before the user clicks — feels instant
        queryClient.prefetchQuery({
          queryKey: ['vault', address],
          queryFn: () => resolveVaultState(rpc, address),
          staleTime: 30_000,
        });
      }}
    >
      {/* ... card content ... */}
    </Link>
  );
}
```

**Optimistic updates for TX signing (instant UI feedback):**
```typescript
// hooks/useSigilTransaction.ts — optimistic update pattern
export function useFreezeVault(vaultAddress: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: FreezeArgs) => signAndSendFreezeTransaction(args),

    // Optimistic: update UI immediately before TX confirms
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['vault', vaultAddress] });
      const previous = queryClient.getQueryData(['vault', vaultAddress]);

      queryClient.setQueryData(['vault', vaultAddress], (old: VaultState) => ({
        ...old,
        vault: { ...old.vault, status: 'Frozen' },
      }));

      return { previous }; // Snapshot for rollback
    },

    // Rollback on TX failure
    onError: (_err, _args, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['vault', vaultAddress], context.previous);
      }
    },

    // Refresh from chain after TX settles (whether success or rollback)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vault', vaultAddress] });
    },
  });
}
```

**Fallback polling (fires ONLY when WebSocket is disconnected):**
```typescript
// hooks/useVaultState.ts — fallback polling
useEffect(() => {
  if (wsConnected) return; // Skip polling when WS is live
  const interval = setInterval(async () => {
    const state = await resolveVaultState(rpc, vaultAddress);
    queryClient.setQueryData(['vault', vaultAddress], state);
  }, 30_000);
  return () => clearInterval(interval);
}, [vaultAddress, wsConnected, queryClient]);
```

**Velocity tracking (5s, client-side — separate from React Query):**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const stats = velocityTracker.getStats();
    setVelocityStats(stats);
  }, 5_000);
  return () => clearInterval(interval);
}, []);
```

### WebSocket Reconnection Strategy

```
WebSocket drops → show yellow "Reconnecting..." banner
  → Exponential backoff with jitter (1s, 2s, 4s, 8s, max 30s)
  → On reconnect:
    1. Full resolveVaultState() via RPC
    2. Compare against cached pre-disconnect state
    3. Diff → if state changed, show "X events occurred while disconnected"
    4. Re-subscribe to all vault accounts
  → If disconnected > 2 min:
    Red "CONNECTION LOST — data may be stale. Verify on Solana Explorer." banner
    Link to explorer with vault PDA address
```

### Vault Discovery

```typescript
// findVaultsByOwner() — getProgramAccounts with owner filter
// AgentVault layout: [8 bytes discriminator, 32 bytes owner, ...]
// Filter: owner pubkey at byte offset 8, 32 bytes, memcmp
const vaultAddresses = await findVaultsByOwner(rpc, ownerPubkey);
// Cache result in React Query with 5-minute stale time
```

### Event Decoding

All 31 on-chain events have Codama-generated typed decoders. The `decodeSigilEvent()` dispatcher maps discriminator → decoder:

```typescript
// parseSigilEvents(logs) returns { name: string, data: Uint8Array }
// decodeSigilEvent() adds typed field decoding:
const rawEvents = parseSigilEvents(txLogs);
const decodedEvents = rawEvents.map(e => decodeSigilEvent(e));
// → { name: "ActionAuthorized", fields: { vault, agent, actionType, amount, usdAmount, protocol, ... } }
```

### Indexer Schema (Phase 4 — Backend, NOT in v1)

> Deferred to Phase 4. The client-side approach using Helius Enhanced Transactions API + on-chain SpendTracker provides 24h of history. The PostgreSQL indexer is for historical analytics (7d/30d/90d) and email alerting — features that can wait until the dashboard has users.

```sql
-- Raw events from Helius webhooks (Phase 4+)
CREATE TABLE sigil_events (
  id BIGSERIAL PRIMARY KEY,
  vault_address TEXT NOT NULL,
  agent_address TEXT,
  event_type TEXT NOT NULL,
  tx_signature TEXT NOT NULL,
  block_time TIMESTAMPTZ NOT NULL,
  slot BIGINT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hourly aggregates (auto-computed)
CREATE TABLE spending_hourly (
  vault_address TEXT NOT NULL,
  agent_address TEXT,
  hour TIMESTAMPTZ NOT NULL,
  total_usd BIGINT NOT NULL,
  tx_count INT NOT NULL,
  success_count INT NOT NULL,
  fail_count INT NOT NULL,
  PRIMARY KEY (vault_address, agent_address, hour)
);

-- Daily aggregates
CREATE TABLE spending_daily (
  vault_address TEXT NOT NULL,
  agent_address TEXT,
  day DATE NOT NULL,
  total_usd BIGINT NOT NULL,
  tx_count INT NOT NULL,
  fees_collected BIGINT NOT NULL,
  PRIMARY KEY (vault_address, agent_address, day)
);

CREATE INDEX idx_events_vault_time ON sigil_events (vault_address, block_time DESC);
CREATE INDEX idx_events_type ON sigil_events (event_type, block_time DESC);
CREATE INDEX idx_hourly_vault ON spending_hourly (vault_address, hour DESC);
```

---

## 6. Alerting System

### Alert Triggers

| Alert | Threshold | Severity | Action |
|-------|-----------|----------|--------|
| Cap approaching | spent > 80% of cap | WARNING | Review spending |
| Cap critical | spent > 95% of cap | CRITICAL | Adjust cap or freeze |
| Agent paused | Any agent paused | INFO | Review agent |
| High velocity | > 2x normal TX rate | WARNING | Check agent behavior |
| Drain detected | > 50% cap in < 1hr | CRITICAL | Freeze vault |
| Escrow expiring | < 1hr to expiry | WARNING | Settle or refund |
| Policy change pending | Timelock active | INFO | Review + approve |
| Simulation failure | TX simulation fails | WARNING | Investigate error |
| Session expired | Session not finalized | WARNING | Check agent health |
| Vault frozen | Owner froze vault | CRITICAL | Investigate + reactivate |

### Delivery Channels

1. **In-app:** Toast notification + bell icon with unread count + inbox page
2. **Email:** Batched (hourly) for WARNING, immediate for CRITICAL
3. **Webhook:** POST to user-configured URL with HMAC signature

---

## 7. User Flows

### Flow 1: New User → First Vault
```
Landing Page → Sign In → Dashboard (empty) → "Create Your First Vault" CTA
→ Create Wizard Step 1 (Policy) → Step 2 (Agent) → Step 3 (Fund) → Step 4 (Review)
→ Confirm 2 actions (initializeVault + registerAgent) → Vault Detail Page
→ Deposit funds → Agent starts trading
```

### Flow 2: Monitor Agent Spending
```
Dashboard → Click vault card → Vault Detail (Overview tab)
→ See 24h spending chart → Notice agent approaching cap
→ Click Spending tab → See per-agent breakdown
→ Click Policy tab → Increase daily cap → Queue update (if timelocked)
→ Wait for timelock → Apply update → Cap increased
```

### Flow 3: Emergency Response
```
Alert: "Drain detected — agent spending at 3x normal rate"
→ Click alert → Vault Detail → Security tab
→ Review activity feed — see unusual transactions
→ Click "Freeze Vault" → Confirm dialog → Vault frozen
→ Investigate: check agent permissions, review TX history
→ Decision: Revoke agent OR Reactivate vault with adjusted policy
```

### Flow 4: Escrow Settlement
```
Dashboard → Vault Detail → Escrow tab
→ See active escrow (amount, destination, expiry countdown)
→ Destination agent provides preimage proof
→ Click "Settle" → Enter proof → Sign TX → Tokens released to destination
→ Close settled escrow → Rent reclaimed
```

---

## 8. Technical Stack

| Layer | Technology | Reason | Phase |
|-------|-----------|--------|-------|
| Framework | Next.js 14+ App Router | SSR, API routes, file-based routing, React 19 Suspense | 1 |
| UI Components | shadcn/ui + Radix | Accessible, composable, Tailwind-native, OKLCH theming | 1 |
| Styling | Tailwind CSS 3.4+ | Utility-first, design token support via CSS variables | 1 |
| Animation | Motion (Framer Motion) | Page transitions, AnimatePresence exit animations, spring physics, layout animations | 1 |
| Charts | Recharts 2.12+ | React-native, responsive, built-in screen reader support (live region tooltips) | 2 |
| Wallet | @solana/wallet-adapter-react | Standard Solana wallet connect (Wallet Standard auto-discovery) | 1 |
| SDK | @usesigil/kit | All on-chain interaction | 1 |
| Client State | Zustand | User preferences, mode toggle, agent labels ONLY | 1 |
| Server State | TanStack Query v5 | ALL RPC/API data. WebSocket → `setQueryData()`. `useSuspenseQuery` for Suspense. Optimistic updates for TX signing. | 1 |
| Testing | Vitest + @testing-library/react + Playwright | Unit, component, E2E. No phase ships without tests. | 1 |
| Real-Time | Helius Enhanced WebSocket | LaserStream backend, 1.5-2x faster than standard WS, reliable | 1 |
| RPC Proxy | Vercel Edge Function | Holds Helius API key server-side, per-IP rate limiting | 1 |
| Product Analytics | PostHog (self-hosted) or Plausible | Privacy-respecting, open source | 5 |
| Hosting | Vercel | Next.js native, edge functions | 1 |
| Indexer | Helius webhooks → PostgreSQL | Historical analytics (>24h), email alerts | 4 |
| Database | Supabase PostgreSQL | Managed Postgres, real-time subscriptions | 4 |

### 8.2 Animation & Motion Design

> **Library:** Motion (the successor to Framer Motion) — 120fps GPU-accelerated animations, springs, layout transitions, scroll-linked effects. Added as a core dependency, not an afterthought.

**Page Transitions (AnimatePresence):**
```typescript
// app/dashboard/layout.tsx — wrap page content with AnimatePresence
'use client';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

**Staggered Content Reveal (loading choreography):**
```typescript
// components/shared/StaggerChildren.tsx — KPI cards, vault grid, table rows
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

function StaggerChildren({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {React.Children.map(children, (child) => (
        <motion.div variants={item}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
```

**Micro-Interaction Tokens:**

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Button hover | `scale: 1.02` | 150ms | `ease-out` |
| Button press | `scale: 0.98` | 100ms | `ease-in-out` |
| Card hover | `y: -2px`, shadow elevation +1 level | 200ms | `spring(stiffness: 400, damping: 25)` |
| Tab switch | Content crossfade + slide | 200ms | `[0.16, 1, 0.3, 1]` (custom ease-out) |
| Dialog open | `opacity: 0→1`, `scale: 0.95→1` | 250ms | `spring(stiffness: 300, damping: 24)` |
| Dialog close | `opacity: 1→0`, `scale: 1→0.95` | 150ms | `ease-in` |
| Toast enter | Slide in from right + fade | 300ms | `spring(stiffness: 400, damping: 30)` |
| Toast exit | Slide out right + fade | 200ms | `ease-in` |
| Number count-up | KPI values animate from 0 to actual | 600ms | `[0.16, 1, 0.3, 1]` |
| Gauge fill | Arc draws from 0° to target | 800ms | `spring(stiffness: 80, damping: 15)` |
| Chart line draw | SVG path length animation | 1000ms | `ease-out` |
| Skeleton pulse | `opacity: 0.4→1→0.4` | 1500ms | `ease-in-out`, infinite |

**Reduced Motion (accessibility — ISC-17):**
```typescript
// lib/motion.ts — respect prefers-reduced-motion globally
import { useReducedMotion } from 'motion/react';

export function useMotionSafe() {
  const prefersReduced = useReducedMotion();
  return {
    animate: prefersReduced ? false : undefined, // Disables all animations
    transition: prefersReduced ? { duration: 0 } : undefined,
  };
}
```
```css
/* globals.css — CSS fallback for non-Motion elements */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Mobile Sheet Component (panels/drawers):**

On mobile (≤768px), detail panels that open as sidepanels on desktop open as bottom sheets instead. Uses shadcn's `Sheet` component (Radix Dialog primitive) with `side="bottom"`:
```typescript
// components/shared/ResponsivePanel.tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/useMediaQuery';

function ResponsivePanel({ open, onClose, title, children }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader><SheetTitle>{title}</SheetTitle></SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: render as side panel or inline
  return <div className="rounded-xl border border-border bg-card p-6">{children}</div>;
}
```

### 8.3 Chart Accessibility

Recharts v3 has built-in screen reader support — the default `<Tooltip>` component renders as an ARIA live region, so screen readers announce data point values on hover/focus. Additionally:

- All charts include `<desc>` and `<title>` SVG elements for screen reader context
- Custom tooltips styled with `--card` background + `--border` + `--card-foreground` text (matching dark theme)
- Color-blind safe: chart palette uses varying lightness (OKLCH L channel) in addition to hue. Never rely on color alone — pair with labels, patterns, or icons
- Keyboard navigation: Recharts supports keyboard focus on data points (Tab through series)

```typescript
// components/charts/ThemedTooltip.tsx — dark-theme custom tooltip
function ThemedTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatUsd(entry.value)}
        </p>
      ))}
    </div>
  );
}
```

### 8.1 Security Architecture

**Content Security Policy (deploy from Phase 1):**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  connect-src 'self' wss://*.helius-rpc.com https://*.helius-rpc.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self'
```

**Security requirements (all phases):**
- CSP headers in `vercel.json` from first deploy (blocks XSS payload execution)
- Subresource Integrity (SRI) on all script bundles
- Helius API key held in Vercel Edge Function — never in client-side JavaScript
- RPC endpoints hardcoded to Helius — not user-configurable (Vector 5B defense)
- `TransactionPreview` component on ALL owner signing flows (Vector 1A/1D defense)
- Re-verify state via fresh RPC call before building any owner action TX (not from WS cache)
- No raw SOL or SPL Token transfers constructed — only Sigil program instructions

**On-chain prerequisite (before dashboard launch):**
- Post-finalize instruction check in `finalize_session.rs` — verify no unauthorized instructions follow finalize in the transaction. Defense-in-depth against Vector 8B (instruction appending after the scan window).
- SDK assertion that finalize is always the last non-infrastructure instruction in `composeSigilTransaction()`

### 8.2 Animation & Motion Design

> **Library:** Motion (the successor to Framer Motion) — 120fps GPU-accelerated animations, springs, layout transitions, scroll-linked effects. Added as a core dependency, not an afterthought.

**Page Transitions (AnimatePresence):**
```typescript
// app/dashboard/layout.tsx — wrap page content with AnimatePresence
'use client';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

**Staggered Content Reveal (loading choreography):**
```typescript
// components/shared/StaggerChildren.tsx — KPI cards, vault grid, table rows
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

function StaggerChildren({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {React.Children.map(children, (child) => (
        <motion.div variants={item}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
```

**Micro-Interaction Tokens:**

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Button hover | `scale: 1.02` | 150ms | `ease-out` |
| Button press | `scale: 0.98` | 100ms | `ease-in-out` |
| Card hover | `y: -2px`, shadow elevation +1 level | 200ms | `spring(stiffness: 400, damping: 25)` |
| Tab switch | Content crossfade + slide | 200ms | `[0.16, 1, 0.3, 1]` (custom ease-out) |
| Dialog open | `opacity: 0→1`, `scale: 0.95→1` | 250ms | `spring(stiffness: 300, damping: 24)` |
| Dialog close | `opacity: 1→0`, `scale: 1→0.95` | 150ms | `ease-in` |
| Toast enter | Slide in from right + fade | 300ms | `spring(stiffness: 400, damping: 30)` |
| Toast exit | Slide out right + fade | 200ms | `ease-in` |
| Number count-up | KPI values animate from 0 to actual | 600ms | `[0.16, 1, 0.3, 1]` |
| Gauge fill | Arc draws from 0° to target | 800ms | `spring(stiffness: 80, damping: 15)` |
| Chart line draw | SVG path length animation | 1000ms | `ease-out` |
| Skeleton pulse | `opacity: 0.4→1→0.4` | 1500ms | `ease-in-out`, infinite |

**Reduced Motion (accessibility — ISC-17):**
```typescript
// lib/motion.ts — respect prefers-reduced-motion globally
import { useReducedMotion } from 'motion/react';

export function useMotionSafe() {
  const prefersReduced = useReducedMotion();
  return {
    animate: prefersReduced ? false : undefined, // Disables all animations
    transition: prefersReduced ? { duration: 0 } : undefined,
  };
}
```
```css
/* globals.css — CSS fallback for non-Motion elements */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Mobile Sheet Component (panels/drawers):**

On mobile (≤768px), detail panels that open as sidepanels on desktop open as bottom sheets instead. Uses shadcn's `Sheet` component (Radix Dialog primitive) with `side="bottom"`:
```typescript
// components/shared/ResponsivePanel.tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/useMediaQuery';

function ResponsivePanel({ open, onClose, title, children }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader><SheetTitle>{title}</SheetTitle></SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: render as side panel or inline
  return <div className="rounded-xl border border-border bg-card p-6">{children}</div>;
}
```

### 8.3 Chart Accessibility

Recharts v3 has built-in screen reader support — the default `<Tooltip>` component renders as an ARIA live region, so screen readers announce data point values on hover/focus. Additionally:

- All charts include `<desc>` and `<title>` SVG elements for screen reader context
- Custom tooltips styled with `--card` background + `--border` + `--card-foreground` text (matching dark theme)
- Color-blind safe: chart palette uses varying lightness (OKLCH L channel) in addition to hue. Never rely on color alone — pair with labels, patterns, or icons
- Keyboard navigation: Recharts supports keyboard focus on data points (Tab through series)

```typescript
// components/charts/ThemedTooltip.tsx — dark-theme custom tooltip
function ThemedTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatUsd(entry.value)}
        </p>
      ))}
    </div>
  );
}
```

### 8.1 Security Architecture

**Content Security Policy (deploy from Phase 1 via Next.js middleware, NOT static vercel.json):**

Next.js App Router injects inline scripts for hydration — static `script-src 'self'` breaks the app. Use nonce-based CSP via middleware:
```typescript
// middleware.ts — generates per-request nonce
import { NextResponse } from 'next/server';
export function middleware(request) {
  const nonce = crypto.randomUUID();
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `connect-src 'self' wss://*.helius-rpc.com https://*.helius-rpc.com`,
    `style-src 'self' 'unsafe-inline'`,  // Required for Tailwind runtime styles
    `img-src 'self' data: https:`,
    `font-src 'self'`,
  ].join('; ');
  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('x-nonce', nonce);
  return response;
}
```

**API Key Architecture (split model):**
- **REST/RPC calls** → proxied through Vercel Edge Function (`app/api/rpc/route.ts`). Helius API key is server-side only.
- **WebSocket connections** → direct to Helius (`wss://atlas-*.helius-rpc.com?api-key=KEY`). Key is in client-side JS — this is unavoidable for WebSocket. Mitigated by: CSP `connect-src` whitelist, Helius origin-locked API key (restricted to dashboard domain), separate API key for WebSocket vs RPC.

**Security requirements (all phases):**
- Nonce-based CSP via Next.js middleware from first deploy (blocks XSS without breaking hydration)
- Helius REST/RPC API key in Edge Function (server-side). WebSocket key in client (origin-locked, separate key).
- RPC endpoints hardcoded to Helius — not user-configurable (Vector 5B defense)
- `TransactionPreview` component on ALL owner signing flows (Vector 1A/1D defense)
- Re-verify state via fresh RPC call before building any owner action TX (not from WS cache)
- No raw SOL or SPL Token transfers constructed — only Sigil program instructions

**On-chain prerequisite (before dashboard launch):**
- Post-finalize instruction check in `finalize_session.rs` — verify no unauthorized instructions follow finalize in the transaction. Defense-in-depth against Vector 8B (instruction appending after the scan window).
- SDK assertion that finalize is always the last non-infrastructure instruction in `composeSigilTransaction()`

---

## 9. Implementation Phases

### Phase 0: SDK Additions + On-Chain Fix (Before Dashboard)
**Goal:** Build the foundation the dashboard depends on
**Duration:** 4-5 days
**Cross-reference:** SEAL-ARCHITECTURE-PLAN.md Phase 5 (Steps 5.1–5.9)

**SDK additions (from WRAP Phase 5):**
- `decodeSigilEvent()` — dispatcher mapping discriminator → 31 Codama decoders — **DONE** (WRAP Step 2.7)
- `findVaultsByOwner()` — `getProgramAccounts` with owner pubkey filter — **DONE** (WRAP Step 2.8)
- `buildOwnerTransaction()` — owner-side TX composer: instruction(s) + compute budget + ALT + blockhash — **TODO** (WRAP Step 5.7)
- `getSpendingHistory()` — SpendTracker 144 epochs → `{epochId, timestamp, usdAmount}[]` for charts — **TODO** (WRAP Step 5.8)
- `getVaultTokenBalances()` — `getTokenAccountsByOwner` on vault PDA → all ATAs with balances — **TODO** (WRAP Step 5.2)
- `resolveVaultStateForOwner()` — multi-agent variant, returns all agents' budgets at once — **TODO** (WRAP Step 5.1)
- `formatUsd()` / `formatUsdCompact()` — USD formatting from bigint (avoid reimplementing in dashboard) — **TODO** (WRAP Step 5.5)
- `VAULT_PRESETS` — pre-built vault configs ("Jupiter Swap Bot", "Perps Trader") for Create Wizard — **TODO** (WRAP Step 5.6)
- ATA replacement in `seal()` — **DONE** (composability fix, 553 Kit tests passing)

**Dashboard-side (NOT in SDK — built in `apps/dashboard/`):**
- `subscribeToVault()` — Helius Enhanced WebSocket wrapper with auto-reconnect + state decoding → `lib/websocket.ts` + `hooks/useVaultSubscription.ts` (Helius-specific, not provider-agnostic enough for SDK)
- `BalanceSnapshotStore` — client-side P&L tracking, snapshots on each WS update → `lib/balance-tracker.ts` (session-scoped, not SDK responsibility)

**On-chain fix (WRAP Step 5.9):**
- Post-finalize instruction check in `finalize_session.rs` — verify no unauthorized instructions follow finalize. New error code 6070. Defense-in-depth against instruction appending after scan window.
- SDK assertion in `composeSigilTransaction()` — finalize is always last non-infrastructure instruction

### Phase 1: Foundation (Week 1-2)
**Goal:** App shell + wallet connect + vault list + real-time WebSocket + security + mobile-first

**Deliverables:**
- Next.js app scaffold with App Router
- Tailwind + shadcn/ui component library setup — **mobile-first** (design at 375px, scale up)
- Design tokens (colors, typography, spacing)
- Wallet adapter integration (Wallet Standard auto-discovery + Ledger manual adapter)
- Network selector (devnet/mainnet)
- Layout: sidebar + top bar + **bottom tab bar for mobile (≤768px)**
- `.env.example` with required environment variables
- `middleware.ts` for nonce-based CSP (not static vercel.json — Next.js needs nonces for hydration scripts)
- Vercel Edge Function for Helius REST/RPC proxy (`app/api/rpc/route.ts`)
- Helius Enhanced WebSocket setup (`subscribeToVault()` integration)
- WebSocket connection status indicator (`ConnectionBanner` component)
- Portfolio page: vault discovery via `findVaultsByOwner()` + live state via WebSocket
- Simple Mode as default view (balance + P&L + Stop Bot button) — Section 13.1
- VaultCard, BalanceCard, StopBotButton components
- AddressChip, StatusBadge, TokenAmount, TransactionPreview shared components
- React Error Boundaries at page and tab level
- Suspense boundaries with `loading.tsx` per route segment
- **Test setup:** Vitest + @testing-library/react + Playwright (E2E skeleton)
- React Error Boundaries at page and tab level
- Suspense boundaries with `loading.tsx` per route segment
- **Test setup:** See Section 15 (Production Testing Strategy). Three tiers: unit (pure logic), integration (real devnet RPC), E2E (Playwright against deployed devnet). No mocks, no stubs. Pre-deploy CI gate blocks deployment on any test failure.

**Phase 1 Gate — must pass before starting Phase 2:**
- [ ] `pnpm dev` runs without errors, `pnpm build` produces production bundle
- [ ] Sign-in works (Phantom + at least one other wallet) on devnet
- [ ] `findVaultsByOwner()` returns vaults for a known owner address
- [ ] WebSocket subscription receives live account updates (verified in browser console)
- [ ] WebSocket disconnection shows yellow banner, reconnection restores state
- [ ] Simple Mode displays balance with P&L arrow and Stop Bot button
- [ ] Stop Bot button successfully freezes a devnet vault (TX confirmed on-chain)
- [ ] CSP nonce headers present in response (verify via browser DevTools → Network → Response Headers)
- [ ] Helius API key NOT in client-side JS bundle (verify via `grep` on `.next/static/`)
- [ ] Mobile layout renders correctly at 375px (bottom tab bar, stacked cards)
- [ ] All component tests pass (`pnpm test`)
- [ ] Lighthouse accessibility score > 90

### Phase 2: Vault Management (Week 3-4)
**Goal:** Create vault + vault detail (Overview + Agents + Policy tabs) + pre-sign TX preview

**Deliverables:**
- Create Vault wizard (4 steps)
- Vault detail page with tab navigation + persistent header with WS status
- Overview tab: KPI cards, spending chart (from `getSpendingHistory()`), activity feed (decoded events)
- Agents tab: agent table, register/pause/revoke dialogs — ALL with `TransactionPreview` before signing
- Policy tab: policy cards, edit dialogs, timelock flow — ALL with `TransactionPreview`
- Permission Matrix component (21 actions × N agents)
- SpendGauge, CapBar components
- WebSocket reconnection strategy (banner, backoff, state reconciliation)
- SecurityChecklist component (binary pass/fail, not composite score)

**Phase 2 Gate — must pass before starting Phase 3:**
- [ ] Create Vault wizard completes (2-TX flow: create vault → deposit) on devnet
- [ ] Vault detail page loads with correct data from `resolveVaultState()`
- [ ] All 7 tabs render with correct content (or empty states for unused features)
- [ ] Agent pause/unpause/revoke works with TransactionPreview → wallet sign → on-chain confirmation
- [ ] Policy update works (direct if no timelock, queue/apply/cancel if timelocked)
- [ ] Permission Matrix grouped by risk level with tooltips on each permission
- [ ] Data export produces valid CSV for Activity table and Agent table
- [ ] Audit Package downloads as valid JSON with SHA-256 hash
- [ ] All E2E tests pass (Playwright: create vault, pause agent, freeze vault, export data)

### Phase 3: Analytics + Activity (Week 5-6)
**Goal:** Spending analytics + transaction history (client-side, no backend)

**Deliverables:**
- Activity tab: transaction history from Helius Enhanced Transactions API (client-side) + decoded events
- Spending tab: 24h chart (from SpendTracker 144 epochs), per-agent bars, per-protocol donut
- Spend forecast ("At current rate" with guardrails: >= 2h data, confidence bands)
- Agent detail page with per-agent spending, error breakdown, permission heatmap
- Cap utilization gauges (global + per-agent + per-protocol)
- Escrow tab: escrow listing + refund/close flows (read-only — creation/settlement are agent actions)

**Phase 3 Gate — must pass before starting Phase 4:**
- [ ] Activity tab shows decoded events with human-readable fields (not raw bytes)
- [ ] Spending tab displays 24h area chart with cap overlay line from SpendTracker
- [ ] Per-agent spending bars render correctly for multi-agent vaults
- [ ] Agent detail page shows individual agent spending, errors, permission heatmap
- [ ] Cross-vault analytics page aggregates data across all vaults
- [ ] Escrow tab displays escrows with countdown timers, refund/close actions work
- [ ] All chart components have Error Boundaries (chart crash doesn't break page)

### Phase 4: Backend + Historical Data (Week 7-8)
**Goal:** PostgreSQL indexer + email alerts + historical analytics

**Deliverables:**
- Helius webhook integration → PostgreSQL indexer (Supabase)
- Historical data views (7d / 30d / 90d) from indexed events
- Email alerting system (CRITICAL: immediate, WARNING: hourly batched)
- Webhook delivery to user-configured URL with HMAC signature
- Security tab: emergency controls, simulation preview, audit trail
- In-app notification system (bell icon + inbox)

### Phase 5: Advanced Features + Polish (Week 9-10)
**Goal:** Power-user features + performance optimization

**Deliverables:**
- Constraint management UI (constraint builder with protocol templates — Section 13.13)
- Bulk operations (pause all agents, batch registration — Section 13.14)
- RBAC / view-only delegation (Section 13.12)
- Performance optimization (React Query caching, memoization, code splitting)
- Accessibility audit (keyboard navigation, screen reader labels, color-blind-safe indicators)
- Error handling with `toAgentError()` throughout (agent-friendly error messages)

> **Note:** Mobile responsive design is in Phase 1 (mobile-first from day 1). Loading/empty/error states are built per-component in their respective phases, not bolted on later.

### Phase 6: Landing + Docs (Week 11-12)
**Goal:** Public-facing pages + documentation

**Deliverables:**
- Landing page (hero, features, stats from `getProgramAccounts`, SDK snippet)
- Documentation pages (MDX or external Mintlify/Docusaurus)
- SEO optimization + OG images
- Product analytics integration (PostHog/Plausible)

---

## 10. SDK Function → Dashboard Feature Map

### Existing SDK Functions

| Dashboard Feature | SDK Function | Module |
|---|---|---|
| Vault balance | `resolveVaultState()` → token account balance | state-resolver |
| Vault status | `resolveVaultState()` → `vault.status` | state-resolver |
| Agent list | `resolveVaultState()` → `vault.agents[]` | state-resolver |
| 24h spending | `getRolling24hUsd(tracker, timestamp)` | state-resolver |
| Per-agent spending | `getAgentRolling24hUsd(overlay, timestamp)` | state-resolver |
| Per-protocol spending | `getProtocolSpend(tracker, protocol, timestamp)` | state-resolver |
| Permission display | `permissionsToStrings(bitmask)` | types |
| Permission check | `hasPermission(bitmask, actionType)` | types |
| Create vault | `createVault()` | create-vault |
| Wrap DeFi TX | `seal()` | wrap |
| Register agent | `getRegisterAgentInstruction()` | generated |
| Pause agent | `getPauseAgentInstruction()` | generated |
| Update permissions | `getUpdateAgentPermissionsInstruction()` | generated |
| Update policy | `getQueuePolicyUpdateInstructionAsync()` | generated |
| Deposit funds | `getDepositFundsInstructionAsync()` | generated |
| Withdraw funds | `getWithdrawFundsInstructionAsync()` | generated |
| Freeze vault | `getFreezeVaultInstruction()` | generated |
| Reactivate vault | `getReactivateVaultInstruction()` | generated |
| Create escrow | `getCreateEscrowInstructionAsync()` | generated |
| Settle escrow | `getSettleEscrowInstruction()` | generated |
| Simulate TX | `simulateBeforeSend()` | simulation |
| Drain detection | `detectDrainAttempt()` | simulation |
| Error handling | `toAgentError(code)` | agent-errors |
| Event parsing (raw) | `parseSigilEvents(logs)` | events |
| Token resolution | `resolveToken(mint, network)` | tokens |
| Priority fees | `PriorityFeeEstimator` | priority-fees |
| Velocity tracking | `VelocityTracker` | velocity-tracker |
| PDA derivation | `getVaultPDA()`, `getPolicyPDA()`, etc. | resolve-accounts |
| ALT resolution | `AltCache.resolve()` | alt-loader |

### New SDK Functions (Phase 0 — required before dashboard)

| Dashboard Feature | SDK Function | Module | Status |
|---|---|---|---|
| Vault discovery | `findVaultsByOwner(rpc, owner)` | NEW | Needed for portfolio page |
| Typed event decoding | `decodeSigilEvent(event)` | NEW | Dispatcher for 31 Codama decoders |
| Generic TX building | `buildOwnerTransaction(rpc, owner, ixs, network)` | NEW | Used by ALL owner action flows |
| Spending time-series | `getSpendingHistory(tracker)` | NEW | SpendTracker 144 epochs → chart data |
| Real-time subscription | `subscribeToVault(ws, vault, callbacks)` | NEW | Helius Enhanced WS wrapper |
| Vault token balances | `getVaultTokenBalances(rpc, vault)` | NEW | All ATAs with balances |
| USD display formatting | `formatUsd(amount)` / `formatUsdCompact(amount)` | tokens (WRAP 5.5) |
| Multi-agent state | `resolveVaultStateForOwner(rpc, vault)` | state-resolver (WRAP 5.1) |
| Vault presets | `VAULT_PRESETS` / `getPreset(name)` | presets (WRAP 5.6) |

### New SDK Functions (required before dashboard)

> **Cross-reference:** SDK additions live in two places in `SEAL-ARCHITECTURE-PLAN.md`:
> - **Phase 5** (Steps 5.1–5.9): Core SDK functions (P&L, state resolver, presets, etc.)
> - **Phase 6**: Analytics Data Layer — 42 convenience functions across 8 modules. Full spec: `ANALYTICS-DATA-LAYER-PLAN.md`
>
> The dashboard calls SDK functions. It never reads on-chain data directly.

**Phase 5 functions (core SDK):**

| Dashboard Feature | SDK Function | WRAP Step | Status |
|---|---|---|---|
| Vault discovery | `findVaultsByOwner(rpc, owner)` | 2.8 | **DONE** |
| Typed event decoding | `decodeSigilEvent(event)` | 2.7 | **DONE** |
| Multi-agent vault state | `resolveVaultStateForOwner(rpc, vault)` | 5.1 | **DONE** |
| Vault P&L (on-chain counters) | `getVaultPnL(rpc, vault)` | 5.2 | TODO (plan approved) |
| Vault token balances | `getVaultTokenBalances(rpc, vault)` | 5.2 | TODO (plan approved) |
| Owner TX building | `buildOwnerTransaction(rpc, owner, ixs, network)` | 5.7 | **DONE** |
| Vault presets | `VAULT_PRESETS` / `getPreset(name)` / `listPresets()` / `presetToCreateVaultFields()` | 5.6 | **DONE** |

**Phase 6 functions (analytics layer — see `ANALYTICS-DATA-LAYER-PLAN.md` for full type signatures):**

| Dashboard Feature | SDK Function | Phase 6 Module | Priority |
|---|---|---|---|
| USD display formatting | `formatUsd()` / `formatUsdCompact()` / `formatUsdSigned()` | `formatting.ts` | P0 |
| Time display | `formatDuration()` / `formatRelativeTime()` / `formatTimeUntil()` | `formatting.ts` | P0 |
| Spending time-series (24h chart) | `getSpendingHistory(tracker, timestamp)` | `spending-analytics.ts` | P0 |
| Spending velocity + forecast | `getSpendingVelocity(tracker, timestamp)` | `spending-analytics.ts` | P0 |
| Per-agent + per-protocol breakdown | `getSpendingBreakdown(state)` | `spending-analytics.ts` | P0 |
| Vault health + cap status | `getVaultHealth(rpc, vault)` | `vault-analytics.ts` | P1 |
| Vault detail page header | `getVaultSummary(rpc, vault)` | `vault-analytics.ts` | P1 |
| Activity feed | `getVaultActivity(rpc, vault, limit?)` | `event-analytics.ts` | P1 |
| Event categorization + descriptions | `categorizeEvent()` / `describeEvent()` | `event-analytics.ts` | P1 |
| Agent leaderboard + profiles | `getAgentLeaderboard()` / `getAgentProfile()` | `agent-analytics.ts` | P1 |
| Security posture checklist | `getSecurityPosture(state)` | `security-analytics.ts` | P2 |
| Audit trail | `getAuditTrail(rpc, vault, types?, limit?)` | `security-analytics.ts` | P2 |
| Alert triggers | `evaluateAlertConditions(state, prev?)` | `security-analytics.ts` | P2 |
| Portfolio overview (cross-vault) | `getPortfolioOverview(rpc, owner)` | `portfolio-analytics.ts` | P2 |
| Protocol usage breakdown | `getProtocolBreakdown(state)` | `protocol-analytics.ts` | P2 |
| Slippage efficiency | `getSlippageEfficiency(events)` | `advanced-analytics.ts` | P3 |
| Cap velocity + risk scoring | `getCapVelocity(tracker, timestamp)` | `advanced-analytics.ts` | P3 |
| Session deviation rate | `getSessionDeviationRate(events)` | `advanced-analytics.ts` | P3 |

**Dashboard-side (NOT SDK — built in `apps/dashboard/`):**

| Dashboard Feature | Dashboard Module | Why not SDK |
|---|---|---|
| Real-time subscription | `lib/websocket.ts` + `hooks/useVaultSubscription.ts` | Helius-specific, not provider-agnostic |
| Balance chart snapshots | `lib/balance-tracker.ts` | Wraps SDK `BalanceSnapshotStore` for chart rendering. Lifetime P&L uses SDK `getVaultPnL()` (on-chain counters) |

---

## 11. File Structure

```
apps/dashboard/
├── src/
│   ├── middleware.ts                      # Nonce-based CSP + rate limiting
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (sidebar + top bar)
│   │   ├── page.tsx                      # Landing page (public)
│   │   ├── api/
│   │   │   ├── rpc/route.ts             # Edge Function: Helius RPC proxy (holds API key)
│   │   │   └── v1/                      # REST API endpoints (Phase 3+)
│   │   │       ├── vault/[address]/route.ts
│   │   │       └── owner/[address]/vaults/route.ts
│   │   ├── docs/
│   │   │   └── [...slug]/page.tsx        # Documentation pages
│   │   └── dashboard/
│   │       ├── layout.tsx                # Dashboard layout (wallet-gated)
│   │       ├── loading.tsx               # Suspense boundary: portfolio skeleton
│   │       ├── page.tsx                  # Portfolio overview
│   │       ├── analytics/
│   │       │   └── page.tsx              # Cross-vault portfolio analytics (Phase 3)
│   │       ├── create/
│   │       │   └── page.tsx              # Create vault wizard
│   │       ├── vault/
│   │       │   └── [address]/
│   │       │       ├── page.tsx          # Vault detail (tabs)
│   │       │       ├── loading.tsx       # Suspense boundary: vault detail skeleton
│   │       │       ├── freeze/page.tsx   # Quick-freeze deep link (from alerts)
│   │       │       └── agent/
│   │       │           └── [agent]/
│   │       │               └── page.tsx  # Agent detail
│   │       └── settings/
│   │           └── page.tsx              # User preferences
│   ├── components/
│   │   ├── ui/                           # shadcn/ui primitives
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── WalletButton.tsx
│   │   │   └── NetworkSelector.tsx
│   │   ├── shared/
│   │   │   ├── AddressChip.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── TokenAmount.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── SpendGauge.tsx
│   │   │   ├── CapBar.tsx
│   │   │   ├── AgentAvatar.tsx
│   │   │   ├── AlertToast.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── TransactionPreview.tsx  # Pre-sign TX summary (security)
│   │   │   ├── ConnectionBanner.tsx    # WebSocket status indicator
│   │   │   ├── StaggerChildren.tsx     # Motion staggered reveal for card grids/lists
│   │   │   ├── ResponsivePanel.tsx     # Desktop: side panel / Mobile: bottom Sheet
│   │   │   ├── AnimatedNumber.tsx      # Count-up animation for KPI values
│   │   │   ├── CopyButton.tsx          # Copy-to-clipboard with checkmark feedback
│   │   │   ├── RelativeTime.tsx        # Human-readable countdowns ("2h 15m until reset")
│   │   │   ├── Breadcrumb.tsx          # Navigation breadcrumb trail
│   │   │   ├── WalletAvatar.tsx        # Deterministic avatar from wallet pubkey (TopBar)
│   │   │   ├── NumberTicker.tsx        # Spring-animated count-up for KPI values
│   │   │   ├── DataTable.tsx           # Shared sortable/filterable table with pagination
│   │   │   ├── KPICardSkeleton.tsx     # Skeleton loading shape for KPI cards
│   │   │   ├── VaultCardSkeleton.tsx   # Skeleton loading shape for vault cards
│   │   │   └── ChartSkeleton.tsx       # Skeleton loading shape for charts
│   │   ├── portfolio/
│   │   │   ├── VaultCard.tsx
│   │   │   └── VaultGrid.tsx
│   │   ├── create/
│   │   │   ├── CreateWizard.tsx
│   │   │   ├── StepPolicy.tsx
│   │   │   ├── StepAgent.tsx
│   │   │   ├── StepFund.tsx
│   │   │   └── StepReview.tsx
│   │   ├── vault/
│   │   │   ├── VaultHeader.tsx           # Persistent header with Stop Bot button
│   │   │   ├── VaultTabs.tsx
│   │   │   ├── SimpleVaultView.tsx       # Simple Mode: balance + P&L + stop button
│   │   │   ├── OverviewTab.tsx
│   │   │   ├── BalanceCard.tsx           # P&L: current balance + delta + percentage
│   │   │   ├── AgentsTab.tsx
│   │   │   ├── PolicyTab.tsx
│   │   │   ├── ActivityTab.tsx
│   │   │   ├── SpendingTab.tsx
│   │   │   ├── EscrowTab.tsx
│   │   │   └── SecurityTab.tsx
│   │   ├── agents/
│   │   │   ├── AgentTable.tsx
│   │   │   ├── AgentLabel.tsx            # Client-side naming (localStorage)
│   │   │   ├── PermissionMatrix.tsx      # Grouped by risk level with tooltips
│   │   │   ├── RegisterAgentDialog.tsx
│   │   │   └── AgentDetailPanel.tsx
│   │   ├── policy/
│   │   │   ├── PolicyCard.tsx
│   │   │   ├── PolicyEditor.tsx
│   │   │   └── TimelockBanner.tsx
│   │   ├── spending/
│   │   │   ├── SpendingChart.tsx
│   │   │   ├── AgentSpendBars.tsx
│   │   │   ├── ProtocolDonut.tsx
│   │   │   ├── SpendForecast.tsx
│   │   │   └── CapGauges.tsx
│   │   ├── activity/
│   │   │   ├── ActivityTable.tsx
│   │   │   ├── ActivityRow.tsx
│   │   │   └── ActivityFilters.tsx
│   │   ├── escrow/
│   │   │   ├── EscrowTable.tsx
│   │   │   ├── CreateEscrowDialog.tsx
│   │   │   └── SettleEscrowDialog.tsx
│   │   ├── security/
│   │   │   ├── EmergencyControls.tsx
│   │   │   ├── SecurityChecklist.tsx   # Binary pass/fail (replaces SecurityScore)
│   │   │   ├── SimulationPreview.tsx
│   │   │   ├── ConstraintsTable.tsx
│   │   │   └── AuditTrail.tsx
│   │   ├── analytics/                    # Cross-vault portfolio (Phase 3)
│   │   │   ├── AggregateKPIs.tsx
│   │   │   ├── VaultComparison.tsx
│   │   │   └── ProtocolAllocation.tsx
│   │   └── charts/
│   │       ├── AreaChart.tsx
│   │       ├── BalanceChart.tsx          # P&L balance over time
│   │       ├── BarChart.tsx
│   │       ├── DonutChart.tsx
│   │       ├── GaugeChart.tsx
│   │       └── ThemedTooltip.tsx         # Dark-theme Recharts tooltip (WCAG contrast)
│   ├── hooks/
│   │   ├── useVaultState.ts              # WebSocket subscription + RPC fallback
│   │   ├── useVaultList.ts               # findVaultsByOwner() + caching
│   │   ├── useVaultSubscription.ts       # Helius Enhanced WS lifecycle
│   │   ├── useVelocity.ts                # VelocityTracker integration
│   │   ├── useAlerts.ts                  # Alert trigger evaluation
│   │   ├── useSigilTransaction.ts       # buildOwnerTransaction + optimistic updates + preview + sign
│   │   ├── useTokenBalance.ts            # SPL token balance queries
│   │   ├── useConnectionStatus.ts        # WebSocket connected/reconnecting/lost
│   │   └── useMediaQuery.ts              # Responsive breakpoint detection (mobile Sheet)
│   ├── lib/
│   │   ├── sigil.ts                     # @usesigil/kit initialization
│   │   ├── rpc.ts                        # RPC client setup (hardcoded Helius)
│   │   ├── websocket.ts                  # Helius Enhanced WS manager + reconnect
│   │   ├── motion.ts                     # Motion config: spring presets, useMotionSafe(), reduced-motion
│   │   ├── balance-tracker.ts             # BalanceSnapshotStore for client-side P&L tracking
│   │   ├── alerts.ts                     # Alert trigger evaluation logic
│   │   ├── format.ts                     # Address truncation (import formatUsd from @usesigil/kit)
│   │   ├── export.ts                     # CSV/JSON export utilities
│   │   ├── audit-package.ts             # Audit Package bundler (Security tab)
│   │   └── squads.ts                     # Squads V4 multisig integration (Phase 3)
│   ├── stores/
│   │   ├── vault-store.ts               # Zustand vault state
│   │   ├── alert-store.ts               # Active alerts
│   │   └── preferences-store.ts         # User settings
│   └── styles/
│       └── globals.css                   # Tailwind + design tokens
├── public/
│   ├── tokens/                           # Token icon SVGs
│   └── og-image.png
├── .env.example                          # HELIUS_API_KEY, NEXT_PUBLIC_NETWORK, SIGIL_PROGRAM_ID
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts                      # Unit + component tests
└── playwright.config.ts                  # E2E tests
```

---

## 12. Dependencies

```json
{
  "dependencies": {
    "@usesigil/kit": "workspace:*",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/kit": "^2.1.0",
    "@tanstack/react-query": "^5.60.0",
    "motion": "^12.0.0",
    "next": "^14.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^2.12.0",
    "zustand": "^4.5.0",
    "date-fns": "^3.6.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.440.0",
    "idb-keyval": "^6.2.0",
    "geist": "^1.3.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@playwright/test": "^1.48.0"
  }
}
```

> **Dependency notes:**
> - `motion` (^12.0.0) — the Motion library (successor to Framer Motion). Import from `motion/react`. GPU-accelerated, 120fps, springs, layout animations, AnimatePresence for exit animations. ~18KB gzipped.
> - `geist` (^1.3.0) — Vercel's Geist Sans + Geist Mono typeface package. Purpose-built for Next.js dashboards.
> - `@solana/wallet-adapter-wallets` removed — deprecated. Use Wallet Standard auto-discovery. Only manually add non-standard wallets (Ledger).
> - `react` upgraded to ^19.0.0 — Server Components, `use()` hook, better Suspense integration with `useSuspenseQuery`.
> - `idb-keyval` added — IndexedDB for client-side balance snapshots (P&L tracking).
> - `vitest` + `@testing-library/react` + `@playwright/test` added — no code ships without tests.
> - `@sqds/multisig` added in Phase 3 when Squads integration begins.
> - **Tailwind CSS v4 note:** When Tailwind v4 stabilizes, OKLCH color tokens in `globals.css` will work natively without the `@theme inline` directive. No migration needed — CSS variables are the same.

---

## 13. Persona-Validated Additions (7-Persona Walkthrough, 2026-03-22)

> **Source:** 7 independent agents walked the full plan as distinct user personas. These additions address the gaps they found. Full report: `MEMORY/WORK/20260322-032401_persona-walkthrough-dashboard/PERSONA-WALKTHROUGH-REPORT.md`

### 13.1 Simple Owner Mode (Serves: Lisa, Marcus) — Phase 1

Non-technical vault owners need a different default view. The current plan shows 7 tabs, 21 permission checkboxes, and BPS values — overwhelming for someone who just wants to know "is my money safe?"

**Implementation:**
1. Add `SimpleMode` toggle in user preferences (Zustand `preferences-store.ts`). Default ON for new users.
2. When Simple Mode is ON, the vault detail page shows:
   - One large balance number with P&L arrow (green up / red down)
   - Plain-English status line: "Your bot is running. It traded 12 times today, all successful."
   - Persistent red "STOP BOT" button (calls `freezeVault` instruction)
   - "View Details" link to switch to Advanced Mode (full 7-tab view)
3. When Simple Mode is OFF, the full 7-tab dashboard appears (current plan)
4. The Create Vault wizard offers presets ("Jupiter Swap Bot") before custom configuration
5. Files: `components/vault/SimpleVaultView.tsx`, `components/shared/StopBotButton.tsx`

**Jargon glossary (apply throughout ALL modes — Simple AND Advanced):**
| Crypto Term | Plain English | Notes |
|---|---|---|
| BPS / basis points | Show as percentages ("2%" not "200 BPS") | |
| Slippage | "Maximum price difference" | |
| Protocol allowlist | "Approved apps" | |
| ActionType | Never shown — use descriptive labels ("Swap", "Lend") | |
| TX / transaction | "Trade" or "action" | See Blockchain Abstraction Map in Section 3 |
| TX Signature | "Reference ID" with "View details" link | |
| Velocity | "Trading speed" | |
| Session expired | "A trade did not complete" | |
| Cap | "Daily budget" | |
| Escrow | "Held payment" (hide tab entirely in Simple Mode) | |
| Connect Wallet | "Log in" / "Sign in" | **NEVER use "Connect Wallet" in UI** |
| Wallet | "Account" (when referring to user identity) | |
| Pubkey | "Address" or "ID" | |
| On-chain | "Verified" or omit | |
| Token | "Asset" or specific name (USDC, SOL) | |
| Gas / priority fee | "Network fee" or hide entirely | |
| Airdrop (devnet) | "Get test funds" | |

### 13.2 P&L / Balance Tracking (Serves: Marcus, Sarah, Lisa, Diego) — Phase 1

The #1 most requested feature across 4 of 7 personas.

**Architecture (2026-03-23):** On-chain cumulative counters in AgentVault — NOT event parsing. Stablecoin-only model enables O(1) lifetime P&L with zero infrastructure dependency. Council unanimous (4/4). Full analysis: `Plans/hashed-painting-hartmanis.md`.

**Implementation:**
1. Add balance card as PRIMARY metric on Overview tab (above spending chart)
2. Show: current balance, total deposited, total withdrawn, P&L (delta + percentage)
3. **Primary source:** `getVaultPnL()` from SDK — reads on-chain `total_deposited_usd` + `total_withdrawn_usd` from AgentVault + current stablecoin balance. O(1), single RPC call, works without indexer
4. **Chart source:** `BalanceSnapshotStore` (dashboard-side, `lib/balance-tracker.ts`) with baseline preservation for session-scoped line charts. Use `toJSON()`/`fromJSON()` to persist to `localStorage` across sessions
5. Formula: `P&L = currentBalance - totalDeposited + totalWithdrawn` (from on-chain AgentVault counters — NOT from event parsing)
6. Chart: Balance over time line chart alongside spending area chart
7. Files: `components/vault/BalanceCard.tsx`, `components/charts/BalanceChart.tsx`
8. SDK dependency: `getVaultPnL()` + `getVaultTokenBalances()` (WRAP Step 5.2). `BalanceSnapshotStore` is dashboard-side, not SDK. Per-agent lifetime spend available via `ResolvedVaultState.allAgentBudgets`

### 13.3 Persistent "Stop Bot" Button (Serves: Lisa, Marcus) — Phase 1

The Freeze button is currently in the Security tab (tab 7 of 7). In an emergency, users shouldn't navigate through tabs.

**Implementation:**
1. Add `StopBotButton` to `VaultHeader.tsx` — visible on EVERY tab, not just Security
2. Label: "STOP BOT" (not "Freeze Vault") with danger-red styling
3. On click: confirmation dialog → "This will stop all trading. Your funds stay in the vault. Continue?"
4. Builds `getFreezeVaultInstruction()` → `TransactionPreview` → wallet sign
5. After freeze: button changes to "Restart Bot" (calls `reactivateVault`)

### 13.4 Data Export Layer (Serves: Sarah, Chen, Diego) — Phase 2

The word "export" previously did not appear in this plan.

**Implementation:**
1. Add `ExportButton` component — renders a download icon on every data table and chart
2. Formats: CSV for tabular data, JSON for structured state
3. Export targets:
   - Activity table → CSV (timestamp, type, agent, amount, status, TX sig)
   - Spending chart → CSV (epoch, timestamp, amount)
   - Agent table → CSV (address, status, permissions, limit, spent)
   - Policy config → JSON (all policy fields with labels)
   - Permission matrix → CSV (agent × action grid)
4. **"Download Audit Package"** button on Security tab:
   - Bundles: vault state + policy + agents + permissions + last 100 TXs + spending history + Security Checklist results
   - Single JSON file with SHA-256 hash of on-chain account data at export time
   - Includes slot number for deterministic reproducibility
5. Files: `components/shared/ExportButton.tsx`, `lib/export.ts`, `lib/audit-package.ts`

### 13.5 Agent Labeling (Serves: Diego, all multi-agent users) — Phase 2

12 truncated base58 pubkeys are unreadable. Users need human names for their agents.

**Implementation:**
1. Store labels in `localStorage` keyed by `sigil:agent-labels:{vaultAddress}`
2. `AgentLabel` component: shows label if set, falls back to truncated pubkey + `AgentAvatar`
3. Inline edit: click agent name → text input → save to localStorage
4. Applied in: Agent table, Spending bars, Activity feed, Permission matrix
5. Sync across tabs via `BroadcastChannel` API
6. Files: `components/agents/AgentLabel.tsx`, `stores/agent-labels.ts`

### 13.6 Cross-Vault Portfolio Analytics (Serves: Sarah, Diego) — Phase 3

Multi-vault users can't see aggregate spending, protocol allocation, or agent comparison across vaults.

**Implementation:**
1. Add `/dashboard/analytics` page (new sidebar item)
2. Sections:
   - **Aggregate KPIs:** Total balance across all vaults, total 24h spend, total agents, aggregate cap utilization
   - **Protocol allocation:** Donut chart showing % of spend per protocol ACROSS all vaults
   - **Vault comparison table:** Side-by-side metrics (balance, spend, agents, cap %, status)
   - **Agent ranking:** All agents ranked by spend, with vault attribution
   - **Total fees paid:** Protocol + developer fees across all vaults
3. Data: aggregates `resolveVaultStateForOwner()` results for all vaults returned by `findVaultsByOwner()`
4. Files: `app/dashboard/analytics/page.tsx`, `components/analytics/` directory

### 13.7 Squads Multi-Sig Integration (Serves: Sarah, Diego) — Phase 3

High-value vaults ($100K+) need multi-sig approval for critical actions.

**Implementation:**
1. Detect when connected wallet is a Squads member (query Squads program for multisig PDA)
2. If vault owner is a Squads multisig PDA:
   - `TransactionPreview` shows "Requires X/Y approvals" instead of "Confirm & Sign"
   - "Sign" creates a Squads proposal instead of direct execution
   - Show pending proposals with approval count and "Approve" button for other signers
   - Emergency freeze shows: "This will create a proposal. Other signers must approve."
3. Add `SquadsProposalBanner` component for pending proposals on vault detail page
4. SDK dependency: `@sqds/multisig` for Squads V4 integration
5. Files: `lib/squads.ts`, `components/shared/SquadsProposalBanner.tsx`, `hooks/useSquads.ts`

### 13.8 Expanded Security Checklist (Serves: Chen) — Phase 2

Chen's audit identified 5 missing checklist items.

**Add to the existing 7 items in Security tab:**
- [ ] `fee_destination` matches expected address (immutable after creation)
- [ ] No pending policy update that relaxes security (cap increase, permission expansion, timelock reduction)
- [ ] All protocol allowlist entries are verified program IDs (not arbitrary addresses)
- [ ] Per-agent spending limits sum to ≤ vault-level cap (no cap bypass via agent-level limits)
- [ ] Vault has non-zero token balance (not abandoned)

### 13.9 Push Notifications (Serves: Marcus, Sarah) — Phase 4

In-app alerts are useless when the tab is closed. Marcus needs a 3am drain alert on his phone.

**Implementation:**
1. **Browser Push Notifications** (Phase 4, no backend needed):
   - Service Worker registration in Next.js
   - Request notification permission on first CRITICAL alert
   - Show browser notification with "Tap to open dashboard" action
2. **Telegram Bot** (Phase 4, requires backend):
   - `/connect` command links Telegram user to vault owner pubkey
   - Helius webhook → Edge Function → Telegram Bot API
   - Message format: "ALERT: Vault drain detected — $1,200 spent in 40 min. Tap to freeze: [deep link]"
3. **Quick-freeze deep link:** Alert notifications include `https://app.sigil.io/vault/{address}/freeze` that opens a confirm-and-sign screen directly
4. Files: `lib/notifications.ts`, `app/api/telegram/route.ts`, `public/sw.js`

### 13.10 Permission Matrix UX Improvements (Serves: Marcus, Lisa) — Phase 2

21 raw ActionType toggles without context are overwhelming for first-time users.

**Implementation:**
1. Group permissions by risk level:
   - **Trading** (green): Swap, PlaceLimitOrder, CancelLimitOrder, EditLimitOrder
   - **Positions** (yellow): OpenPosition, ClosePosition, IncreasePosition, DecreasePosition, SwapAndOpenPosition, CloseAndSwapPosition
   - **Collateral** (yellow): AddCollateral, RemoveCollateral
   - **Orders** (yellow): PlaceTriggerOrder, EditTriggerOrder, CancelTriggerOrder
   - **Transfers** (red): Transfer, Deposit, Withdraw
   - **Escrow** (red): CreateEscrow, SettleEscrow, RefundEscrow
2. Collapsible groups — show group name + "X/Y enabled" badge
3. Tooltip on each permission: "Swap — Allows the agent to swap tokens via DEX protocols"
4. Quick presets: "Swap Only", "Full Trading", "Read Only (Lending)"

### 13.11 Ledger Hardware Wallet UX (Serves: Sarah, Diego) — Phase 2

Institutional users overwhelmingly use hardware wallets with different UX constraints.

**Implementation:**
1. Add Ledger to the wallet adapter list (`@solana/wallet-adapter-wallets` includes `LedgerWalletAdapter`)
2. Detect Ledger connection → show longer timeout spinners during TX signing (30s vs 10s default)
3. Add "Signing on Ledger — please confirm on your device" modal during signing flow
4. Handle Ledger-specific errors: timeout, user rejected, blind signing warnings

### 13.12 RBAC / View-Only Delegation (Serves: Sarah) — Phase 4+

Sarah's risk analyst needs read-only dashboard access without the owner's Ledger.

**Implementation:**
1. Add "Viewers" management in Settings (per-vault)
2. Owner registers viewer pubkeys (stored client-side initially, on-chain in future)
3. Viewer connects their wallet → sees vault state, spending, activity, audit trail
4. Viewer CANNOT: sign transactions, see TransactionPreview, access any action buttons
5. UI: action buttons hidden/grayed for viewers with "Owner access required" tooltip
6. Files: `lib/rbac.ts`, `hooks/useViewerAccess.ts`

**Note:** v1 is client-side only (localStorage-based viewer list). Production RBAC requires either on-chain viewer registry or a backend auth layer.

### 13.13 Constraint Builder (Serves: Diego) — Phase 5

The flat "program, operator, operand" table doesn't capture constraint complexity (16 entries, 7 operators, byte offsets, OR/AND logic).

**Implementation:**
1. Structured builder UI with:
   - Protocol selector (dropdown of allowlisted protocols)
   - Discriminator auto-fill from `DISCRIMINATOR-TABLES.md`
   - Field offset + length + operator + value inputs with live hex preview
   - AND/OR logic visualization between entries
2. "Test constraint" button: paste a transaction, check if it passes the constraint rules
3. Protocol templates: pre-built constraint sets for Jupiter swap (discriminator + slippage field), Flash Trade (discriminator + leverage field)
4. Files: `components/security/ConstraintBuilder.tsx`, `lib/constraint-templates.ts`

### 13.14 Bulk Operations (Serves: Diego, Raj) — Phase 5

No way to perform batch actions across agents or vaults.

**Implementation:**
1. "Select all" checkbox on Agent table → "Pause Selected" / "Revoke Selected" bulk actions
2. "Freeze All Vaults" emergency button on Portfolio page (builds multiple freeze TXs)
3. Batch agent registration: upload CSV with `[pubkey, permissions, spendingLimit]` rows
4. Each bulk action shows a multi-TX `TransactionPreview` with all operations listed

---

## 14. Verification Checklist

Before each phase ships:

**Functional:**
- [ ] All pages render without errors (dev + build)
- [ ] Sign-in flow works with all major wallets (Phantom, Solflare, Backpack) — UI says "Sign in", not "Connect Wallet"
- [ ] Network switching works (devnet ↔ mainnet)
- [ ] All SDK calls succeed against devnet
- [ ] Transaction signing + confirmation works
- [ ] TransactionPreview shows correct decoded instruction before wallet popup
- [ ] WebSocket connection establishes and receives account updates
- [ ] WebSocket reconnection recovers state after simulated disconnect
- [ ] Vault discovery finds all vaults for connected owner
- [ ] Event decoding produces typed fields (not raw bytes) in activity feed

**Error handling:**
- [ ] Error states handled (network down, wallet disconnected, vault not found)
- [ ] Loading states present (skeletons, spinners)
- [ ] Empty states present (no vaults, no agents, no activity)
- [ ] WebSocket disconnect shows yellow/red banner with status

**Security:**
- [ ] CSP headers present in response (`script-src 'self'`, `connect-src` whitelist)
- [ ] Helius API key NOT visible in client-side JavaScript (proxied via Edge Function)
- [ ] No custom RPC endpoint option accessible to users
- [ ] Owner actions re-verify state via fresh RPC before building TX (not from WS cache)
- [ ] Only Sigil program instructions are constructed (no raw SOL/SPL transfers)

**Quality:**
- [ ] Mobile responsive (test at 375px, 768px, 1024px, 1440px)
- [ ] Lighthouse score > 90 (performance, accessibility)
- [ ] No console errors in production build
- [ ] `pnpm audit` shows no high/critical vulnerabilities

---

## 15. Production Testing Strategy (No Mocks, No Stubs)

> **Principle:** Everything runs against real infrastructure. Devnet is the staging environment. Helius WebSocket and RPC endpoints in `.env.test` with a dedicated API key. If a test can't pass against devnet, it's not a valid test — it's hiding a bug.

### 15.1 Three-Tier Testing Architecture

| Tier | Tool | Target | Network Required | Speed | When |
|------|------|--------|-----------------|-------|------|
| **T1: Unit** | Vitest | Pure functions (formatUsd, getSpendingHistory, alert evaluation, spending math, address formatting) | NO — pure logic, no I/O | <1s per test | On every save (watch mode) |
| **T2: Component Integration** | Vitest + @testing-library/react | React components with REAL @usesigil/kit calls against devnet RPC | YES — devnet RPC via Helius | 2-5s per test | On `pnpm test` |
| **T3: End-to-End** | Playwright | Full browser flows: sign in → create vault → freeze → verify | YES — devnet RPC + WebSocket | 10-30s per test | Pre-deploy CI gate + nightly |

### 15.2 Environment Configuration

```bash
# .env.test — committed to repo (devnet keys, not secrets)
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_HELIUS_WS_URL=wss://atlas-devnet.helius-rpc.com?api-key=YOUR_DEVNET_KEY
HELIUS_API_KEY=YOUR_DEVNET_KEY
SIGIL_PROGRAM_ID=4ZeVCqnjUgUtFrHHPG7jELUxvJeoVGHhGNgPrhBPwrHL
NEXT_PUBLIC_HELIUS_WS_ENABLED=true

# .env.test.local — NOT committed (actual API key)
HELIUS_API_KEY=real-devnet-api-key-here
NEXT_PUBLIC_HELIUS_WS_URL=wss://atlas-devnet.helius-rpc.com?api-key=real-devnet-api-key-here
```

### 15.3 Tier 1: Unit Tests (Pure Logic)

**Convention:** `*.test.ts` next to source file in `lib/` and `hooks/`.

| Test File | What It Tests | Network |
|---|---|---|
| `lib/format.test.ts` | `formatUsd()` import from @usesigil/kit, address truncation, date formatting | None |
| `lib/alerts.test.ts` | Alert threshold evaluation (cap 80%, 95%, drain detection math) | None |
| `lib/balance-tracker.test.ts` | BalanceSnapshotStore: add, retrieve, P&L calculation, max entries | None |
| `lib/motion.test.ts` | `useMotionSafe()` returns correct values for reduced-motion preference | None |

**Run:** `pnpm vitest run --config vitest.unit.config.ts`

### 15.4 Tier 2: Component Integration Tests (Real Devnet RPC)

**Convention:** `*.integration.test.tsx` in `__tests__/` directory per component group.

These tests render real React components that call real @usesigil/kit functions against devnet. They verify that the SDK → component → UI pipeline works end-to-end without mocking any layer.

| Test File | What It Tests | SDK Functions Called |
|---|---|---|
| `components/portfolio/__tests__/VaultCard.integration.test.tsx` | VaultCard renders real vault data from devnet | `findVaultsByOwner()`, `resolveVaultStateForOwner()` |
| `components/vault/__tests__/OverviewTab.integration.test.tsx` | KPI cards show real spending data | `resolveVaultState()`, `getSpendingHistory()` |
| `components/vault/__tests__/StopBot.integration.test.tsx` | Stop Bot button builds valid freeze TX | `buildOwnerTransaction()`, `getFreezeVaultInstruction()` |
| `components/shared/__tests__/TransactionPreview.integration.test.tsx` | Preview shows correct action details | `buildOwnerTransaction()` |
| `hooks/__tests__/useVaultState.integration.test.tsx` | Hook fetches and caches vault state | `resolveVaultState()`, WebSocket subscription |

**Setup:** Each integration test uses a known devnet vault address (pre-provisioned, never deleted). Tests read state — they don't mutate it (except Stop Bot which freezes/reactivates in a pair).

```typescript
// tests/setup/devnet-fixtures.ts — pre-provisioned devnet addresses
export const TEST_VAULT = 'YOUR_DEVNET_VAULT_ADDRESS' as Address;
export const TEST_OWNER_KEYPAIR = Keypair.fromSecretKey(/* devnet test wallet */);
export const TEST_AGENT = 'YOUR_DEVNET_AGENT_ADDRESS' as Address;
```

**Run:** `pnpm vitest run --config vitest.integration.config.ts`

**CI:** Runs on every PR. If Helius devnet is down, test fails and PR is blocked. This is intentional — we test what we ship.

### 15.5 Tier 3: End-to-End Tests (Playwright + Real Browser)

**Convention:** `e2e/*.spec.ts` in project root.

These tests launch a real browser, connect a real Phantom wallet (via Playwright's browser context with a pre-loaded extension), and interact with a deployed devnet dashboard.

| Test File | User Flow | Duration |
|---|---|---|
| `e2e/auth.spec.ts` | Sign in with Phantom → verify dashboard loads → sign out | ~10s |
| `e2e/portfolio.spec.ts` | Sign in → verify vault cards load → verify KPI numbers → verify WebSocket status green | ~15s |
| `e2e/create-vault.spec.ts` | Sign in → Create Vault wizard → configure policy → register agent → confirm → verify vault appears | ~25s |
| `e2e/freeze-vault.spec.ts` | Sign in → navigate to vault → click Stop Bot → confirm → verify frozen status badge | ~20s |
| `e2e/spending-chart.spec.ts` | Sign in → navigate to vault → Spending tab → verify chart renders with data | ~15s |
| `e2e/activity-feed.spec.ts` | Sign in → navigate to vault → Activity tab → verify decoded events display | ~15s |
| `e2e/mobile.spec.ts` | Set viewport 375px → sign in → verify bottom tab bar → navigate → verify responsive layout | ~15s |

**Wallet setup:** Playwright loads Phantom extension from a pre-built `.crx` file with a devnet test wallet pre-imported. The wallet auto-approves transactions in test mode (`--auto-approve` flag or pre-configured trusted site).

**Run:** `pnpm playwright test`
**CI:** Runs pre-deploy (Vercel deploy hook) and nightly. Blocks deployment if any test fails.

### 15.6 Pre-Deploy CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/dashboard-ci.yml
name: Dashboard CI
on:
  push:
    paths: ['apps/dashboard/**']
  pull_request:
    paths: ['apps/dashboard/**']

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter dashboard vitest run --config vitest.unit.config.ts

  integration:
    runs-on: ubuntu-latest
    env:
      HELIUS_API_KEY: ${{ secrets.HELIUS_DEVNET_KEY }}
      NEXT_PUBLIC_NETWORK: devnet
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter dashboard vitest run --config vitest.integration.config.ts

  e2e:
    runs-on: ubuntu-latest
    env:
      HELIUS_API_KEY: ${{ secrets.HELIUS_DEVNET_KEY }}
      NEXT_PUBLIC_HELIUS_WS_URL: ${{ secrets.HELIUS_DEVNET_WS_URL }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter dashboard build
      - run: pnpm --filter dashboard playwright install --with-deps
      - run: pnpm --filter dashboard playwright test

  deploy-gate:
    needs: [unit, integration, e2e]
    runs-on: ubuntu-latest
    steps:
      - run: echo "All gates passed — deploy to Vercel"
```

### 15.7 Devnet Test Fixtures (Pre-Provisioned)

Before Phase 1 starts, provision on devnet:
1. **Test vault** with known address, active status, USDC balance
2. **Test agent** registered to the vault with Swap + ClosePosition permissions
3. **Test policy** with $500 daily cap, 200 BPS max slippage, Jupiter allowlisted
4. **At least 1 completed seal() transaction** so SpendTracker has spending data
5. **At least 1 freeze + reactivate cycle** so SecurityChecklist has audit trail data

Store addresses in `tests/setup/devnet-fixtures.ts`. **Never delete these devnet accounts.**

---

## 16. Turnkey Signing Policy (Agent Deployment Prerequisite)

> **Why this exists:** Without a Turnkey signing policy, a compromised agent can sign ANY transaction — including raw SPL Transfers that bypass the Sigil validate→DeFi→finalize sandwich. The on-chain vault PDA holds tokens so direct drain requires active delegation, but the policy provides defense-in-depth at the custody layer.

### 16.1 Reference Policy JSON

```json
{
  "policyName": "sigil-agent-signing-policy",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.tags.contains('agent'))",
  "condition": "activity.resource == 'WALLET' && activity.action == 'SIGN_TRANSACTION'",
  "notes": "Restricts agent wallet to only sign transactions containing validate_and_authorize as the first non-ComputeBudget instruction",
  "parameters": {
    "transactionValidation": {
      "requiredInstructions": [
        {
          "programId": "4ZeVCqnjUgUtFrHHPG7jELUxvJeoVGHhGNgPrhBPwrHL",
          "discriminator": "validate_and_authorize",
          "position": "first_non_compute_budget",
          "required": true
        }
      ],
      "blockedPrograms": [
        {
          "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          "reason": "Block raw SPL Token program calls — all token operations must go through Sigil sandwich"
        }
      ]
    }
  }
}
```

### 16.2 Implementation Steps

1. Create Turnkey organization with agent sub-organization
2. Generate agent signing wallet within Turnkey
3. Apply the policy above to the agent's wallet
4. Verify: attempt to sign a raw SPL Transfer → Turnkey rejects
5. Verify: attempt to sign a Sigil sandwich TX → Turnkey approves
6. Document in `docs/DEPLOYMENT.md` with copy-paste instructions

### 16.3 Defense-in-Depth Stack

```
Layer 1: On-chain (hard)     — Tokens in vault PDA, not agent wallet. Delegation via SPL Approve only during active session.
Layer 2: Instruction scan    — validate_and_authorize blocks SPL Transfer/Approve between validate and finalize.
Layer 3: Custody policy      — Turnkey rejects transactions without Sigil sandwich.
Layer 4: TEE attestation     — Agent binary attested. Key never leaves enclave.
```

**All 4 layers must be configured before any agent signs production transactions.**
