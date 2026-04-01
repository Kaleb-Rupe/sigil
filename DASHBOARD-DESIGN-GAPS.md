# ⚠️ SUPERSEDED — See SIGIL-DESIGN-SPEC.md

> **This file is obsolete.** The Sigil → Sigil rebrand (2026-03-27) replaced this file with `SIGIL-DESIGN-SPEC.md`, which contains the complete design system, landing page spec, dashboard spec, and implementation plan in one document.

---

# Sigil Dashboard -- Design Gap Specifications (ARCHIVED)

> **Version:** 3.0 (Final — Warm Phalanx Identity) | **Date:** 2026-03-24
> **Companion to:** DASHBOARD-PLAN.md v5.0
> **Hero image:** Parthenon at sunset (Unsplash `photo-1603565816030-6b389eeb23cb`) at 18% opacity, `saturate(0.4) sepia(0.15)`, atmospheric background behind typography hero. Reference mockup: `~/Downloads/sigil-G1.html`
> **Design standard:** Altitude.xyz (Squads) + Mercury + Linear interaction patterns. NOT Drift.
> **Emotional identity:** Phalanx — the feeling of being INSIDE the shield wall. Warm, protective, calm, permanent.
> **Stack:** Recharts 2.12+, shadcn/ui, Tailwind, Archivo + Inter, Motion
> **Typography:** Archivo Black (900) for headings/logo/KPIs. Inter (400-600) for body/UI.
>
> **Landing Palette (light):** `--landing-bg: #FFFCF8` (cream), `--landing-text: #1C1A17` (warm black), `--landing-text-body: #5C4A32` (bronze), `--landing-text-muted: #8C7E6A` (aged metal), `--landing-border: #E2D9CE` (linen), `--landing-safe: #4A6741` (forest green)
>
> **Dashboard Palette (dark):** `--bg-primary: #1C1A17` (warm charcoal), `--bg-surface: #262220`, `--bg-elevated: #332E2A`, `--border-default: #3D3529`, `--accent-primary: #9E7C4E` (bronze), `--status-secure: #4A6741` (forest green), `--status-warning: #C4922A` (warm amber), `--status-danger: #B84233` (warm red), `--text-primary: #F0EAE0` (warm white), `--text-secondary: #A89B8A`, `--text-muted: #7A6F62`
>
> **NO blue. NO purple. NO indigo. Anywhere.**

---

## GAP 1: Chart Design System

All charts use Recharts 2.12+ with a shared `<ChartThemeProvider>` that injects consistent tokens. Every chart component wraps `<ResponsiveContainer>` and includes a visually-hidden `<table>` for screen readers.

### 1.1 Area Chart (24h Spending)

**Fill gradient:**
```tsx
<defs>
  <linearGradient id="areaFillIndigo" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
    <stop offset="50%" stopColor="#6366F1" stopOpacity={0.08} />
    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
  </linearGradient>
</defs>
<Area fill="url(#areaFillIndigo)" />
```
- Three-stop gradient: 25% opacity at top, 8% at midpoint, 0% at baseline. The midpoint stop prevents the fill from looking like a solid blob on shallow curves.

**Line stroke:**
- Color: `#6366F1` (accent-primary)
- Width: `2px`
- Line join: `round`
- Line cap: `round`
- Dot: hidden by default. On hover/focus, show a 6px diameter solid circle with 2px white stroke (`stroke: #F8FAFC`, `strokeWidth: 2`, `fill: #6366F1`). The white ring ensures visibility against both the fill gradient and the dark background.

**Cap overlay line (daily budget limit):**
- Style: dashed, `strokeDasharray="6 4"` (6px dash, 4px gap)
- Color: `#F59E0B` (status-warning) at 80% opacity
- Width: `1.5px`
- Label: positioned at the right end of the line, right-aligned, `12px` Geist Sans Medium, color `#F59E0B`, content: `"Cap $X,XXX"`
- Implemented as a Recharts `<ReferenceLine>` with a custom label renderer

**Gridlines:**
- Horizontal only (no vertical gridlines -- they create visual noise on time-series)
- Color: `#1E293B` (border-default)
- Opacity: `0.5`
- Stroke width: `1px`
- Stroke dasharray: `none` (solid, subtle lines)
- Count: 4 horizontal lines (auto-calculated by Recharts tick count)

**Axis labels:**
- X-axis (time): `12px` Geist Sans Regular, color `#64748B` (text-muted), `tickMargin: 8`, format `"HH:mm"` for 24h view, `"MMM dd"` for 7d+ views
- Y-axis (USD): `12px` Geist Sans Regular, color `#64748B`, `tickMargin: 12`, format `"$X.Xk"` for values over 1000, `"$XXX"` below. Use `tickFormatter` from SDK `formatUsdCompact()`
- Axis line: hidden (`axisLine={false}`). Tick line: hidden (`tickLine={false}`). The gridlines provide sufficient horizontal reference.
- `font-variant-numeric: tabular-nums` on all axis label text

**Tooltip:**
```css
.chart-tooltip {
  background: #111827;               /* --card */
  border: 1px solid #1E293B;         /* --border-default */
  border-radius: 8px;                /* --radius-md */
  padding: 10px 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.45), 0 4px 8px rgba(0,0,0,0.3);
  min-width: 140px;
  max-width: 240px;
  pointer-events: none;
}
```
- Layout: vertical stack
  - Line 1: timestamp label, `12px` Geist Sans Medium, `#94A3B8`, format `"Mar 24, 14:30"`
  - Line 2: value, `14px` Geist Sans SemiBold, `#F8FAFC`, format `"$1,234.56"` (full precision in tooltip)
  - Line 3 (if cap overlay active): cap utilization, `12px` Geist Sans Regular, color dynamically set: `#10B981` if under 80%, `#F59E0B` if 80-95%, `#EF4444` if over 95%, format `"67% of daily cap"`
- Cursor line: vertical, `#6366F1` at 20% opacity, `1px` width
- Animation: `animationDuration={150}` -- snappy, not sluggish

### 1.2 Bar Chart (Per-Agent Spending)

**Bar styling:**
- Corner radius: `4px` top-left and top-right only (`radius={[4, 4, 0, 0]}`)
- Bar gap ratio: `barGap={4}` (4px between bars in a group), `barCategoryGap="20%"` (20% of category width as padding)
- Minimum bar width: `12px` (prevents hairline bars with many agents)
- Maximum bar width: `48px` (prevents barn-door bars with one agent)

**Hover highlight:**
- Active bar: full opacity (1.0) with subtle glow shadow (`filter: drop-shadow(0 0 6px currentColor)` at 30% opacity)
- Inactive bars (same group): reduce to `opacity: 0.35` with `transition: opacity 200ms ease`
- Background highlight: transparent rectangle behind the entire category, `fill: #1F2937` at 40% opacity, same corner radius as bars

**Multi-series color assignment (sequential from chart palette):**
```
Agent 1: #6366F1  (--chart-1, indigo)
Agent 2: #10B981  (--chart-2, emerald -- status-secure adjusted for chart use)
Agent 3: #F59E0B  (--chart-3, amber)
Agent 4: #A855F7  (--chart-4, violet)
Agent 5: #06B6D4  (--chart-5, cyan)
Agent 6: #EF4444  (--chart-6, coral)
Agent 7: #F97316  (--chart-7, orange)
Agent 8: #8B5CF6  (--chart-8, purple)
```
- Mapped from the OKLCH `--chart-N` CSS variables, hex values here for Recharts `fill` prop
- Agent 9-10 (max): cycle back to chart-1 and chart-2 with a striped SVG pattern (`<pattern>` with 45-degree 2px lines) to maintain distinction
- Agent labels use client-side names from `AgentLabel` (localStorage), falling back to truncated pubkey

**Gridlines + axes:** same spec as area chart (section 1.1)

### 1.3 Donut Chart (Per-Protocol Breakdown)

**Ring geometry:**
- Outer radius: 80% of container half-height
- Inner radius (hole): 62% of outer radius. This produces a hole-to-outer ratio of 0.62, which is the sweet spot -- wide enough for the center label to breathe, narrow enough for the segments to carry visual weight.
- Segment gap: `paddingAngle={2}` (2 degrees between segments)
- Segment corner radius: `cornerRadius={3}` (slightly rounded segment ends)
- Starting angle: `startAngle={90}` (12 o'clock position, clockwise)

**Center label (inside the hole):**
- Line 1: total USD value, `24px` Geist Sans Bold, `#F8FAFC`, `tabular-nums`
- Line 2: "Total spent" or "Across N protocols", `12px` Geist Sans Regular, `#94A3B8`
- Positioned using a Recharts custom `<Label>` component at `position="center"`

**Legend:**
- Position: below the donut on mobile (< 768px), right side on desktop (>= 768px)
- Layout: vertical list, `16px` row height, `8px` gap between rows
- Each row: `10px` color circle + `8px` gap + protocol name (`13px` Geist Sans Medium, `#F8FAFC`) + right-aligned amount (`13px` Geist Sans Regular, `#94A3B8`)
- Max visible: 6 protocols. If more, show top 5 + "Other" aggregated row in `#64748B`

**Hover expansion:**
- Hovered segment: `outerRadius` increases by `6px` (scales outward), `opacity: 1.0`
- Other segments: `opacity: 0.5`, `transition: all 200ms ease`
- Center label updates to show hovered segment's protocol name + amount + percentage

**Color assignment:** same sequential palette as bar chart (section 1.2), mapped by descending spend amount (largest protocol gets indigo)

### 1.4 Gauge / Semicircle (Cap Utilization)

**Geometry:**
- Arc span: 180 degrees (semicircle, flat bottom)
- Stroke width (track and fill): `14px` for vault-level gauge, `10px` for per-agent gauges
- Background track: `#1E293B` (border-default) -- visible as the unfilled portion
- Line cap: `round` on both track and fill

**Fill gradient (threshold-based, not a smooth gradient):**
```
0% -- 79%:   #10B981 (status-secure, green)
80% -- 94%:  #F59E0B (status-warning, amber)
95% -- 100%: #EF4444 (status-danger, red)
```
- Color transitions are discrete, not interpolated. At exactly 80%, the entire filled arc snaps to amber. This matches the alert thresholds and avoids ambiguous yellow-green blends.
- Fill animation: draws from 0 degrees to target over 800ms, `spring(stiffness: 80, damping: 15)`

**Center label (below the arc, centered):**
- Line 1: percentage, `28px` Geist Sans Bold, color matches the current threshold color (green/amber/red), `tabular-nums`
- Line 2: absolute values, `13px` Geist Sans Regular, `#94A3B8`, format `"$X,XXX / $Y,YYY"`
- Line 3 (optional, vault-level only): time until reset, `12px` Geist Sans Regular, `#64748B`, format `"Resets in 4h 12m"` using `<RelativeTime>` component

**Size variants:**
- Large (vault-level, Overview tab): `160px` wide, `80px` tall (half of width)
- Small (per-agent, Spending tab): `100px` wide, `50px` tall
- Center label scales: Large uses `28px`/`13px`/`12px`, Small uses `20px`/`11px`/omit line 3

### 1.5 Empty Chart State

When a chart has zero data points (new vault, no transactions yet):

**Visual treatment:**
- The chart container maintains its exact dimensions (no layout collapse)
- Render a ghost chart: faint placeholder axes and a flat horizontal dashed line at the vertical midpoint
  - Ghost line: `#1E293B` at 40% opacity, `strokeDasharray="8 6"`, `strokeWidth: 1.5`
  - X-axis: show time labels for the current 24h window (even with no data)
  - Y-axis: show `$0` at bottom, `$500` at top (use the vault's daily cap as the top value, or `$500` default)
- Centered overlay message (on top of the ghost chart):
  - Icon: a chart-line icon from Lucide (`<TrendingUp>`), `32px`, `#64748B`
  - Heading: `14px` Geist Sans Medium, `#94A3B8`, content varies by chart type:
    - Spending chart: "No spending data yet"
    - Agent bars: "No agent activity recorded"
    - Protocol donut: "No protocol usage yet"
  - Body: `13px` Geist Sans Regular, `#64748B`, content:
    - Spending chart: "Activity will appear here once your agent makes its first trade"
    - Agent bars: "Register an agent and start trading to see per-agent breakdowns"
    - Protocol donut: "Protocol distribution will populate as trades execute"
  - CTA (only on charts that have an actionable next step): shadcn `Button` variant `outline`, size `sm`, content: "View setup guide"

**Distinction from loading state:**
- Loading: gradient shimmer animation (from skeleton pattern in DASHBOARD-PLAN.md section 3), fills the entire chart area as a single rectangular block with rounded corners matching `--radius-lg`
- Empty: static ghost chart with message (no animation, no shimmer)
- Error: red left-border accent (4px `--status-danger`), error icon + "Failed to load chart data" + Retry button

### 1.6 Chart Responsive Behavior

**Minimum heights by chart type:**

| Chart Type | Mobile (375px) | Tablet (768px) | Desktop (1024px+) |
|---|---|---|---|
| Area chart | 200px | 240px | 280px |
| Bar chart | 180px | 220px | 260px |
| Donut chart | 240px (includes legend below) | 200px (legend right) | 200px (legend right) |
| Gauge (large) | 100px | 120px | 120px |
| Gauge (small) | 64px | 72px | 72px |

**Aspect ratio:** Charts do NOT preserve a fixed aspect ratio. They use `<ResponsiveContainer width="100%" height={minHeight}>` where `minHeight` is the value from the table above. Charts stretch to fill card width, height is fixed per breakpoint.

**Axis label behavior at narrow widths:**
- Below 500px container width: Y-axis labels hidden entirely. Gridlines remain for reference. Tooltip shows exact values.
- Below 400px container width: X-axis labels show every other tick (`interval={1}` in Recharts)
- Below 375px container width: X-axis labels show every third tick (`interval={2}`)
- Axis label rotation: never. Rotated labels are unreadable. Reduce tick count instead.

**Touch interaction:**
- Tooltip triggers on touch-hold (300ms), not tap (tap navigates)
- Tooltip dismisses on touch-end
- No pinch-to-zoom on charts (use time range selector buttons instead: 1h, 6h, 12h, 24h)

---

## GAP 2: KPI Card Component Spec

The `KPICard` is the most-reused component across Portfolio and Vault Detail. It displays a single metric with optional trend indicator and optional sparkline.

### 2.1 Dimensions

```css
.kpi-card {
  min-width: 200px;
  max-width: 100%;                /* fills grid cell */
  padding: 20px 24px;             /* --space-5 vertical, --space-5 horizontal */
  border-radius: 10px;            /* --radius-lg */
  border: 1px solid #1E293B;      /* --border-default */
  background: #111827;            /* --card */
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.04),  /* inner light edge */
    0 1px 3px rgba(0,0,0,0.3),              /* --shadow-sm layer 1 */
    0 1px 2px rgba(0,0,0,0.2);              /* --shadow-sm layer 2 */
}
```

### 2.2 Internal Layout

Vertical stack with specific gaps:

```
+--------------------------------------------------+
|  [Label]                          [Trend badge]   |   <- Row 1: space-between
|                                                    |   gap: 4px
|  [Metric value]                                    |   <- Row 2
|                                                    |   gap: 12px
|  [Sparkline]                                       |   <- Row 3 (optional)
+--------------------------------------------------+
```

- Gap between label row and metric value: `4px` (--space-1)
- Gap between metric value and sparkline: `12px` (--space-3)
- Sparkline height: `32px`, full card width minus padding
- If no sparkline, card ends after metric value (no dead space)

### 2.3 Typography

**Metric value (the hero number):**
- Font: Geist Sans
- Weight: 700 (Bold)
- Size: `32px` (desktop), `28px` (tablet), `24px` (mobile)
- Line height: 1.1
- Letter spacing: `-0.02em`
- Color: `#F8FAFC` (text-primary)
- `font-variant-numeric: tabular-nums lining-nums`

**Label (above the metric):**
- Font: Geist Sans
- Weight: 500 (Medium)
- Size: `13px`
- Line height: 1.5
- Letter spacing: `0.04em` (uppercase tracking)
- Color: `#94A3B8` (text-secondary)
- Text transform: `uppercase`

**Trend badge:**
- Position: top-right corner of the card, vertically aligned with label
- Container:
  ```css
  .trend-badge {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px 8px;
    border-radius: 6px;           /* --radius-sm */
    font-size: 12px;
    font-weight: 500;
    font-family: 'Geist Sans';
    line-height: 1.5;
    font-variant-numeric: tabular-nums;
  }
  ```
- Positive (up): background `rgba(16, 185, 129, 0.12)`, text `#10B981`, arrow `↑` (Lucide `<TrendingUp size={12}>`)
- Negative (down): background `rgba(239, 68, 68, 0.12)`, text `#EF4444`, arrow `↓` (Lucide `<TrendingDown size={12}>`)
- Neutral (no change): background `rgba(148, 163, 184, 0.12)`, text `#94A3B8`, no arrow, content `"--"`
- Format: `"+12.5%"` or `"-3.2%"` (always show sign)

### 2.4 Sparkline (Optional)

- Type: Recharts `<AreaChart>` with no axes, no grid, no tooltip
- Line: `1.5px` stroke, color matches the trend direction (green for positive, red for negative, `#6366F1` for neutral/first load)
- Fill: matching color at 10% opacity, gradient to transparent
- Data: last 12 data points (2 hours at 10-min resolution)
- Animation: line draws in over 600ms on mount, `ease-out`

### 2.5 Loading Skeleton (KPICardSkeleton)

Matches the exact content layout with shimmer blocks:

```
+--------------------------------------------------+
|  [====== 80px x 12px ====]    [== 48px x 20px ==] |   <- label + badge
|                                                    |
|  [============= 140px x 28px ===============]      |   <- metric
|                                                    |
|  [=========================================]       |   <- sparkline (if variant includes it)
|  [     full-width x 32px                   ]       |
+--------------------------------------------------+
```
- Shimmer blocks use `--card` to `--bg-elevated` gradient animation (from DASHBOARD-PLAN.md skeleton pattern)
- Border radius on shimmer blocks: `4px`
- Card container renders immediately with real border + background (only inner content shimmers)

### 2.6 Hover State (Clickable KPI Cards)

KPI cards on the Vault Detail Overview tab are clickable (they navigate to the relevant tab, e.g., clicking "24h Spent" opens the Spending tab).

```css
.kpi-card--clickable {
  cursor: pointer;
  transition: all 200ms ease;
}
.kpi-card--clickable:hover {
  background: #1F2937;            /* --bg-elevated */
  border-color: #6366F1;          /* --border-focus */
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),
    0 4px 8px rgba(0,0,0,0.35),
    0 2px 4px rgba(0,0,0,0.25);   /* elevates to --shadow-md */
}
.kpi-card--clickable:active {
  transform: translateY(0) scale(0.98);
  transition-duration: 100ms;
}
```
- Focus ring: standard `box-shadow: 0 0 0 2px #0A0E1A, 0 0 0 4px #6366F1` (from accessibility contract)
- Non-clickable KPI cards (Portfolio page totals) have no hover state change beyond the standard subtle cursor default

### 2.7 KPI Card Variants

| Variant | Has sparkline | Has trend badge | Clickable | Used in |
|---|---|---|---|---|
| `summary` | No | Yes | No | Portfolio KPI row |
| `detail` | Yes | Yes | Yes | Vault Detail Overview |
| `compact` | No | No | No | Agent Detail, mobile |

---

## GAP 3: Create Vault Wizard UX

### 3.1 Progress Indicator (Horizontal Stepper)

**Layout:** horizontal bar across the top of the wizard card, full width, `56px` height.

```
  (1)-----(2)-----(3)-----(4)
 Config  Agent    Fund   Review
```

**Step circle dimensions:** `32px` diameter, `2px` border

**Step states:**

| State | Circle | Number | Label | Connector |
|---|---|---|---|---|
| **Completed** | `background: #6366F1`, `border: none` | replaced with Lucide `<Check size={16}>` in `#F8FAFC` | `13px` Geist Sans Medium, `#F8FAFC` | solid line, `2px`, `#6366F1` |
| **Active** | `background: transparent`, `border: 2px solid #6366F1`, glow: `0 0 12px rgba(99,102,241,0.3)` | `14px` Geist Sans SemiBold, `#6366F1` | `13px` Geist Sans SemiBold, `#F8FAFC` | n/a (no connector after active) |
| **Upcoming** | `background: transparent`, `border: 2px solid #1E293B` | `14px` Geist Sans Medium, `#64748B` | `13px` Geist Sans Regular, `#64748B` | dashed line, `2px`, `#1E293B`, `dasharray="4 4"` |

**Connector lines:** centered vertically through step circles, span the gap between circles. Completed-to-completed: solid indigo. Completed-to-active: solid indigo. Active-to-upcoming: dashed border-default. Upcoming-to-upcoming: dashed border-default.

**Mobile (below 640px):** labels hide, step circles shrink to `24px`, connector lines remain. Current step label appears below the stepper as a single centered text: `"Step 2 of 4 -- Register agent"`

### 3.2 Step Transitions

- Direction-aware slide: advancing slides content left (`x: 0 -> -20px, opacity: 1 -> 0` exit, `x: 20px -> 0, opacity: 0 -> 1` enter). Going back reverses direction.
- Duration: `250ms`, easing: `[0.16, 1, 0.3, 1]` (custom ease-out from DASHBOARD-PLAN.md)
- Implementation: Motion `<AnimatePresence mode="wait">` with `custom` prop for direction
- Step content container: `min-height: 400px` to prevent layout jumping between steps of different heights. Content is top-aligned within this container.

### 3.3 Form Validation

**Strategy:** hybrid -- real-time inline validation for format errors, on-step-advance validation for completeness.

**Inline (real-time, on blur + on change after first blur):**
- Agent pubkey: validate base58 format and length (32 bytes) on blur. Error appears immediately.
- Daily cap: validate numeric, min $1, max $10,000,000. Error on blur.
- Slippage: validate 0-50% range. Error on change.

**On-step-advance (when clicking "Next"):**
- All required fields populated
- No existing inline errors
- If validation fails: scroll to first error, shake the error field (`translateX` oscillation, 3 cycles over 300ms), set focus

**Error message positioning:**
- Below the input field, `4px` gap
- `12px` Geist Sans Regular, `#EF4444` (status-danger)
- Icon: Lucide `<AlertCircle size={12}>` inline before text
- Input border turns `#EF4444` (replaces `--border-default`)
- Error message animates in: `height: 0 -> auto`, `opacity: 0 -> 1`, `150ms ease`

### 3.4 Navigation Behavior

**Next button:** right-aligned, primary style (`bg: #6366F1`, `text: #F8FAFC`), label changes per step: "Continue", "Continue", "Continue", "Create vault"

**Back button:** left-aligned, ghost style (`bg: transparent`, `text: #94A3B8`, `border: none`), label: "Back"

**State preservation:** all form state lives in a single `useReducer` (not per-step state). Navigating back restores all previously entered values. No re-fetching, no reset.

**Keyboard:** Enter advances to next step (if valid). Escape does nothing (prevents accidental abandonment).

### 3.5 Estimated Rent Cost

**Position:** Step 4 (Review), inside a summary card below the settings review, above the "Create vault" button.

**Layout:**
```
+------------------------------------------------------+
|  Estimated network fees                     0.035 SOL |
|                                             (~$4.20)  |
|  [?] Rent is a refundable deposit...                  |
+------------------------------------------------------+
```

- Row layout: label left, SOL amount right-aligned
- USD equivalent below SOL amount, `12px` Geist Sans Regular, `#64748B`
- Info icon (`?` in a `16px` circle, `#64748B` border, `#94A3B8` text): on hover/click, shows a tooltip:
  - "Solana requires a small deposit (rent) to store your vault's data on-chain. This is fully refundable when the vault is closed."
  - Tooltip: `max-width: 280px`, standard chart tooltip styling (section 1.1)
- The estimate accounts for: AgentVault (634 bytes) + PolicyConfig (817 bytes) + SpendTracker (2840 bytes) + 1 ATA. Calculated via `getMinimumBalanceForRentExemption()`.

### 3.6 Preset Cards

**Layout:** 2x2 grid on desktop (2 columns), single column on mobile. 4 cards.

**Card dimensions:**
```css
.preset-card {
  padding: 20px;
  border-radius: 10px;            /* --radius-lg */
  border: 2px solid #1E293B;      /* thicker than standard card for selection affordance */
  background: #111827;
  cursor: pointer;
  transition: all 200ms ease;
  min-height: 140px;
}
```

**Card content:**
```
+------------------------------------------+
|  [Icon 24px]                              |
|                                           |  gap: 8px
|  Jupiter swap agent               [->]   |
|                                           |  gap: 4px
|  Swap-only permissions with a             |
|  conservative daily cap.                  |
|                                           |  gap: 12px
|  $500/day  -  1 protocol  -  3% slip     |
+------------------------------------------+
```

- Icon: Lucide icon, `24px`, `#6366F1`
  - "Jupiter swap agent": `<ArrowLeftRight>` (swap)
  - "Perps trader": `<TrendingUp>` (trading)
  - "Multi-agent treasury": `<Users>` (team)
  - "Custom": `<Settings>` (gear)
- Title: `15px` Geist Sans Medium, `#F8FAFC`
- Description: `13px` Geist Sans Regular, `#94A3B8`, max 2 lines
- Quick stats row: `12px` Geist Sans Regular, `#64748B`, separated by en-dashes
- Arrow: `<ChevronRight size={16}>`, `#64748B`, positioned top-right

**Selection state:**
```css
.preset-card--selected {
  border-color: #6366F1;
  background: rgba(99, 102, 241, 0.08);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);  /* --glow-accent, subtle */
}
```
- Check icon replaces arrow in top-right: Lucide `<CheckCircle size={16}>`, `#6366F1`
- Selecting a preset pre-fills Step 1 (policy) and Step 2 (permissions) form fields. User can still override any value.
- "Custom" preset: selects nothing, all fields start empty

**Hover state (unselected):**
```css
.preset-card:hover {
  border-color: #64748B;
  background: #1F2937;
  transform: translateY(-1px);
}
```

### 3.7 Abandon Behavior

**No draft persistence.** If the user navigates away mid-wizard:
- Clicking a sidebar nav link: show a confirmation dialog
  - Title: "Leave setup?"
  - Body: "Your vault configuration hasn't been saved. You'll need to start over."
  - Buttons: "Stay" (accent-primary, default focus) | "Leave" (ghost, text-secondary)
  - Uses the standard confirmation dialog pattern from DASHBOARD-PLAN.md section 3
- Browser back button / closing tab: `beforeunload` event with standard browser confirmation
- Completing step 4 (create): no confirmation needed, wizard state clears on success redirect

**Rationale:** Draft persistence adds complexity (localStorage serialization, stale draft detection, merge conflicts with SDK preset changes) for a wizard that takes under 2 minutes. The confirmation dialog catches accidental clicks. Intentional abandonment is fine -- vault creation is idempotent.

---

## GAP 4: Responsive Breakpoint Details

Four breakpoints matching Tailwind defaults: `375px` (mobile), `768px` (tablet/`md`), `1024px` (laptop/`lg`), `1280px` (desktop/`xl`).

### 4.1 KPI Card Reflow

| Breakpoint | Columns | Card min-width | Gap |
|---|---|---|---|
| 375px -- 767px | 1 column (full width stack) | `100%` | `12px` |
| 768px -- 1023px | 2 columns | `calc(50% - 8px)` | `16px` |
| 1024px -- 1279px | 3 columns (if 5-6 KPIs) or 4 columns (if 4 KPIs) | auto | `16px` |
| 1280px+ | 4 columns (Portfolio), 6 columns (Vault Detail -- 6 KPIs in one row) | auto | `16px` |

**Implementation:** CSS Grid with `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`. The `200px` minimum ensures cards never compress below readable width. `auto-fit` handles column count automatically.

**Mobile stacking:** on 1-column, KPI cards use the `compact` variant (no sparkline, reduced padding to `16px 16px`, metric size `24px`). This prevents the KPI row from consuming excessive vertical scroll space on mobile.

### 4.2 Vault Detail 7-Tab Navigation

| Breakpoint | Tab rendering |
|---|---|
| 1024px+ | Standard horizontal tab bar. All 7 tabs visible: Overview, Agents, Policy, Activity, Spending, Escrow, Security. Active tab: bottom `2px` border in `#6366F1`, text `#F8FAFC`. Inactive: text `#94A3B8`. |
| 768px -- 1023px | Horizontal scroll tab bar with fade indicators. Tabs render in a horizontal scroll container with `overflow-x: auto`, `-webkit-overflow-scrolling: touch`. Left/right edge fade gradients (`32px` wide, `--card` to transparent) indicate scrollability. First 4 tabs visible without scrolling. |
| 375px -- 767px | Dropdown selector. Replace tab bar with a `<Select>` component (shadcn). Shows current tab name with a `<ChevronDown>` icon. Dropdown menu lists all 7 tabs with active tab marked with a check icon. `40px` height, full width, `--bg-surface` background. Below the selector, tab content renders full-width. |

**Tab content transition:** same slide animation as wizard steps (section 3.2), direction-aware based on tab index.

### 4.3 SpendGauge at Small Sizes

| Breakpoint | Gauge variant | Dimensions | Center label |
|---|---|---|---|
| 375px -- 767px | Inline bar (not semicircle) | Full width, `8px` height, `4px` corner radius | Percentage + absolute values rendered as text below the bar, `14px`/`12px` |
| 768px -- 1023px | Small semicircle | `100px` wide, `50px` tall | `20px` percentage, `11px` absolute |
| 1024px+ | Large semicircle | `160px` wide, `80px` tall | `28px` percentage, `13px` absolute, `12px` reset timer |

**Mobile bar fallback rationale:** Semicircles below 80px width lose readability. A progress bar with text is clearer. The bar uses the same threshold colors (green/amber/red) and renders inside the KPI card for "24h Spent / Cap".

### 4.4 PermissionMatrix at Narrow Widths

The PermissionMatrix is a 21-row (action types) x N-column (agents) grid of toggle switches.

| Breakpoint | Rendering |
|---|---|
| 1024px+ | Full table. Row headers (action names) on the left, agent columns with toggles. Sticky first column. Grouped by risk level with section headers (Spending, Position Management, Risk-Reducing). |
| 768px -- 1023px | Horizontal scroll table with sticky first column. Agent columns scroll horizontally. Column count indicator: "3 of 5 agents visible - scroll for more". |
| 375px -- 767px | Card list (one card per agent). Each card shows agent name/address at top, then a vertical list of 21 permission toggles grouped by risk level. Collapsed by default -- show summary "14 of 21 permissions enabled" with expand button. Expanded: full toggle list within the card. |

**Toggle component:** shadcn `<Switch>`, `36px` wide, `20px` tall. On: `#6366F1`. Off: `#1E293B`. Disabled: `opacity: 0.4`.

### 4.5 Activity Table at Narrow Widths

| Breakpoint | Rendering |
|---|---|
| 1024px+ | Full `<DataTable>` with all 6 columns: Timestamp, Type, Agent, Amount, Status, Reference ID. Sortable headers, sticky header on scroll. |
| 768px -- 1023px | Reduced columns: Timestamp, Type, Amount, Status. Agent and Reference ID accessible via row expansion (click row to expand). |
| 375px -- 767px | Card list. Each activity entry renders as a card: |

**Mobile activity card layout:**
```
+----------------------------------------------+
|  [StatusDot] Swap                   2m ago   |
|  Agent: FjR9...2nPk                          |
|  $1,234.56 USDC                              |
|                                    View ->   |
+----------------------------------------------+
```
- `StatusDot`: `8px` circle, color by status (green=success, red=failed, amber=expired)
- Type: `14px` Geist Sans Medium, `#F8FAFC`
- Timestamp: `12px` Geist Sans Regular, `#64748B`, relative format ("2m ago")
- Agent: `12px` Geist Mono, `#94A3B8`, truncated
- Amount: `15px` Geist Sans SemiBold, `#F8FAFC`, `tabular-nums`
- "View": `12px` Geist Sans Medium, `#6366F1`, links to explorer
- Card padding: `14px 16px`
- Card gap: `8px` between cards
- Max initially visible: 10 cards, then "Load more" button (not infinite scroll -- conserves mobile bandwidth)

---

## GAP 5: Error and Edge Case UX

### 5.1 Partial Load Failure

When the dashboard makes multiple parallel RPC calls (e.g., vault state + spending history + token balances + events) and one or more fail:

**Strategy:** section-level degradation, not page-level error.

**Successful sections:** render normally with fresh data.

**Failed sections:** render their last-known-good data (from TanStack Query cache) with a stale data indicator:

```
+----------------------------------------------------------+
|  [Chart renders with cached data]                         |
|                                                           |
|  [!] Data may be stale -- last updated 2m ago   [Retry]  |
+----------------------------------------------------------+
```

- Stale banner: inside the affected card/section, bottom-aligned
- Background: `rgba(245, 158, 11, 0.08)` (warning at 8% opacity)
- Border-left: `3px solid #F59E0B`
- Icon: Lucide `<AlertTriangle size={14}>`, `#F59E0B`
- Text: `13px` Geist Sans Regular, `#F59E0B`
- Retry button: shadcn `Button` variant `ghost`, size `sm`, text `#F59E0B`

**If no cached data exists (first load failure):**
- Show section-level error state: centered error icon (`<ServerCrash size={24}>`, `#EF4444`), message "Unable to load [section name]", Retry button
- Other sections that succeeded still render normally

**Technical implementation:** TanStack Query `staleTime: 10_000` + `gcTime: 300_000` (5 min cache retention). Failed queries retain previous data via `keepPreviousData: true`.

### 5.2 WebSocket Disconnect During TX Signing

**Timeline of events:**

1. User clicks "Freeze vault" -- TransactionPreview dialog opens
2. User clicks "Confirm" -- wallet popup appears
3. WebSocket disconnects while wallet popup is open

**Behavior:**
- The TX signing flow is independent of WebSocket (TX goes through RPC, not WS)
- The ConnectionBanner updates to yellow "Reconnecting..." (visible behind the wallet popup overlay, or visible when popup closes)
- If TX succeeds: success toast appears, UI updates via the `onSettled` RPC refetch (not WebSocket). The optimistic update already applied in `onMutate`.
- If TX fails: standard error toast, optimistic update rolls back via `onError` handler
- When WebSocket reconnects: full state reconciliation fetches latest on-chain state, which now includes the freeze. No stale state.

**The user sees nothing alarming.** The wallet popup is modal -- the ConnectionBanner is behind it. On popup close, they see either a success toast (TX worked) or the reconnecting banner (which auto-resolves). No special treatment needed.

### 5.3 Optimistic Update Rollback

When an optimistic update needs to roll back (TX that the UI already reflected fails on-chain):

**Visual treatment:**

1. Card/component that was optimistically updated gets a `250ms` transition:
   - Subtle red flash: background pulses to `rgba(239, 68, 68, 0.08)` then fades back to `--card` over `400ms`
   - The value reverts (e.g., status badge changes back from "Frozen" to "Active")

2. Error toast appears with specific context:
   ```
   [X icon, red]  Action failed
   Vault freeze was not confirmed on-chain.
   The vault status has been restored.
   [View details]  (links to failed TX on explorer)
   ```
   - Toast persists until dismissed (does not auto-dismiss -- this is important information)
   - "View details" opens Solana Explorer in new tab

3. `onSettled` triggers a fresh `resolveVaultState()` RPC call to ensure UI matches actual on-chain state (defense against partial state inconsistency).

**Animation:** the reverted value uses the `AnimatedNumber` count-back animation (600ms spring) for numeric values, or a crossfade (200ms) for status badges.

### 5.4 Rate Limit Feedback (RPC Proxy Returns 429)

The Vercel Edge Function proxy returns `429 Too Many Requests` when per-IP rate limits are exceeded.

**User-facing treatment:**

1. A non-intrusive banner slides down from below the top bar:
   ```
   [Clock icon]  You're making requests too quickly. Slowing down automatically.
   ```
   - Background: `rgba(245, 158, 11, 0.08)` (warning-tinted)
   - Border-bottom: `1px solid rgba(245, 158, 11, 0.2)`
   - Text: `13px` Geist Sans Regular, `#F59E0B`
   - Height: `36px`
   - Auto-dismisses after `8s` if no further 429s

2. TanStack Query automatically retries with exponential backoff (`retry: 3`, `retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)`). The banner is informational -- the app self-heals.

3. If rate limiting persists (>3 consecutive 429s), escalate to a more prominent banner:
   ```
   [AlertTriangle icon]  Request limit reached. Please wait a moment before refreshing.
   ```
   - Same styling but with a "Retry now" button that appears after 30s

**What does NOT happen:** No redirect. No modal. No page-level error. The user can still interact with cached data. Only new RPC calls are delayed.

### 5.5 Wallet Disconnect Mid-Session

When the wallet adapter fires a `disconnect` event while the user is on a dashboard page:

**Immediate (within 200ms of disconnect):**
1. A modal dialog overlays the current page (not a redirect, not a banner):
   ```
   +--------------------------------------------+
   |                                             |
   |  [Lock icon, 32px, #94A3B8]                 |
   |                                             |
   |  Session ended                              |
   |                                             |
   |  Your wallet disconnected. Sign in          |
   |  again to continue managing your vaults.    |
   |                                             |
   |  Your data is safe -- all vault settings    |
   |  are stored on-chain.                       |
   |                                             |
   |         [Sign in again]                     |
   |                                             |
   +--------------------------------------------+
   ```
   - Modal uses standard dialog styling from DASHBOARD-PLAN.md
   - Backdrop: `rgba(10, 14, 26, 0.85)` (--background at 85%)
   - "Sign in again" button: accent-primary, triggers wallet connect flow
   - No "Cancel" or close button. The modal is blocking -- you must reconnect to use the dashboard.

2. The page behind the modal remains visible (blurred via backdrop) showing the last-loaded state. This provides continuity -- the user sees their vaults are still there.

3. WebSocket subscriptions are torn down (no point receiving updates for a disconnected owner).

4. TanStack Query cache is preserved (not cleared). On reconnect, if the same wallet connects, cached data serves immediately while fresh fetches complete. If a different wallet connects, cache is invalidated.

**Reconnection:** On successful wallet reconnect, the modal dismisses with a fade-out (200ms), the page re-initializes with a fresh `findVaultsByOwner()` call, and WebSocket subscriptions re-establish. No page navigation occurs -- the user stays on whatever vault detail / tab they were viewing.

---

## GAP 6: Landing Page Design Spec

The landing page is public (no wallet required), lives at `/`, and follows the Altitude.xyz design philosophy: trust, calm, institutional copy, generous whitespace.

### 6.1 Hero Section

**Layout:** centered text, no side illustration. The content is the hero. Altitude does not use stock illustrations -- typography and whitespace carry the message.

**Background:**
```css
.hero {
  background: linear-gradient(180deg,
    rgba(99, 102, 241, 0.06) 0%,    /* faint indigo wash at top */
    #0A0E1A 60%                      /* fades to background */
  );
  padding: 120px 24px 80px;          /* generous vertical space */
  text-align: center;
}
```
- Subtle radial glow centered behind the headline: `radial-gradient(ellipse 600px 300px at 50% 40%, rgba(99,102,241,0.08), transparent)`
- No illustration, no 3D graphic, no floating shapes. Clean.

**Content:**

- **Badge** (above headline): pill-shaped, `border: 1px solid #1E293B`, `background: rgba(99,102,241,0.06)`, `padding: 4px 14px`, `border-radius: 999px`, `12px` Geist Sans Medium, `#94A3B8`, content: "AI agent security for Solana"
- **Headline:** `48px` desktop / `36px` tablet / `28px` mobile, Geist Sans SemiBold, `#F8FAFC`, letter-spacing `-0.02em`, line-height `1.15`, content: "Your agent has autonomy. You have control."
- **Subtext:** `18px` desktop / `16px` mobile, Geist Sans Regular, `#94A3B8`, line-height `1.6`, max-width `560px`, margin `0 auto`, `margin-top: 20px`, content: "Set spending limits, approve protocols, and monitor every trade your AI agent makes -- backed by on-chain enforcement."
- **CTA button group:** `margin-top: 36px`, flex row, `gap: 12px`, centered
  - Primary: `padding: 14px 32px`, `border-radius: 10px`, `background: #6366F1`, `color: #F8FAFC`, `15px` Geist Sans SemiBold, `hover: #818CF8`, shadow: `--shadow-md` + `--glow-accent`, content: "Get started"
  - Secondary: same dimensions, `background: transparent`, `border: 1px solid #1E293B`, `color: #94A3B8`, `hover: border-color #6366F1, color #F8FAFC`, content: "Read the docs"

### 6.2 Social Proof

**Layout:** centered section below hero, `padding: 48px 24px`

**Copy:** `"Trusted by teams building autonomous finance"`, `14px` Geist Sans Medium, `#64748B`, uppercase, letter-spacing `0.06em`, centered, `margin-bottom: 32px`

**Logo strip:**
- Horizontal row of partner/user logos, `gap: 48px` desktop / `32px` mobile
- Logos: all rendered in monochrome at `opacity: 0.4`, transitioning to `opacity: 0.7` on hover (200ms ease)
- Logo height: `24px`, width auto (aspect ratio preserved)
- If logos exceed viewport: horizontal auto-scroll marquee, `40s` duration, `linear` timing, pauses on hover
- Separator line above: `1px solid #1E293B`, `max-width: 800px`, centered
- Separator line below: same

### 6.3 How It Works

**Layout:** centered section, `padding: 80px 24px`, max-width `960px`

**Section heading:** `24px` Geist Sans SemiBold, `#F8FAFC`, centered, content: "How it works"

**3-step cards:** horizontal row on desktop, vertical stack on mobile. `gap: 32px`.

**Each card:**
```css
.step-card {
  flex: 1;
  padding: 32px 24px;
  border-radius: 10px;
  border: 1px solid #1E293B;
  background: #111827;
  text-align: center;
  min-width: 240px;
}
```

**Step numbering:**
- Circle: `36px` diameter, `background: rgba(99,102,241,0.12)`, `border: 1px solid rgba(99,102,241,0.3)`, `border-radius: 50%`
- Number: `15px` Geist Sans SemiBold, `#6366F1`, centered in circle
- Positioned centered above the card title

**Step content:**
- Icon: Lucide icon, `28px`, `#6366F1`, centered, `margin-top: 16px`
  - Step 1: `<Shield>` -- "Create a vault"
  - Step 2: `<Sliders>` -- "Set your rules"
  - Step 3: `<Activity>` -- "Trade safely"
- Title: `16px` Geist Sans Medium, `#F8FAFC`, `margin-top: 12px`
- Description: `14px` Geist Sans Regular, `#94A3B8`, `margin-top: 8px`, max 2 lines, line-height `1.5`

**Connector lines between steps (desktop only):**
- Horizontal dashed line connecting the step number circles
- `strokeDasharray="6 4"`, `stroke: #1E293B`, `strokeWidth: 1.5`
- Positioned behind the cards using absolute positioning, vertically centered on the step circles
- Hidden on mobile (cards stack vertically, connector is not needed)

### 6.4 Security Features

**Layout:** 4-column grid on desktop, 2-column on tablet, 1-column on mobile. `padding: 80px 24px`, max-width `1120px`.

**Section heading:** `24px` Geist Sans SemiBold, `#F8FAFC`, centered, `margin-bottom: 48px`, content: "Built for security"

**Each feature card:**
```css
.feature-card {
  padding: 28px 24px;
  border-radius: 10px;
  border: 1px solid #1E293B;
  background: #111827;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.04),
    0 1px 3px rgba(0,0,0,0.3),
    0 1px 2px rgba(0,0,0,0.2);
  transition: all 200ms ease;
}
.feature-card:hover {
  border-color: rgba(99,102,241,0.3);
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),
    0 4px 8px rgba(0,0,0,0.35),
    0 2px 4px rgba(0,0,0,0.25);
}
```

- Icon: `32px`, `#6366F1`, top-left aligned
  - Spending limits: `<DollarSign>`
  - Approved apps: `<ShieldCheck>`
  - Outcome verification: `<ScanSearch>`
  - Atomic safety: `<Lock>`
  - Zero added latency: `<Zap>`
- Title: `15px` Geist Sans Medium, `#F8FAFC`, `margin-top: 14px`
- Description: `14px` Geist Sans Regular, `#94A3B8`, `margin-top: 6px`, 2 lines max, line-height `1.5`

**Feature descriptions (user-facing copy, no blockchain jargon):**
1. "Spending limits" -- "Set daily budgets and per-trade maximums. Your agent operates within the boundaries you define."
2. "Approved apps" -- "Choose exactly which protocols your agent can access. Nothing runs without your approval."
3. "Outcome verification" -- "Every trade result is measured against your rules. Violations are blocked before they settle."
4. "Atomic safety" -- "Authorization, execution, and verification happen as a single unit. All succeed or all revert."
5. "Zero added latency" -- "Sigil adds no additional confirmation latency. Our security layer executes within the same Solana slot as your trade -- verified across 200 devnet transactions with zero measurable overhead."
   - Icon: `<Zap>` (Lucide)
   - **Benchmark source:** 100 bare SPL transfers vs 100 Sigil-wrapped composed transactions on devnet (Helius RPC, March 2026). Bare avg: 902ms, Wrapped avg: 863ms. Delta is within noise (std dev ~165ms). Security is free from a latency perspective.

### 6.5 Live Stats

**Layout:** centered row of 3 KPI counters, `padding: 64px 24px`, full-width background with subtle `--gradient-surface` (top lighter, bottom darker).

**Counter cards:** inline-flex, `gap: 64px` desktop, `gap: 32px` tablet, vertical stack with `gap: 24px` mobile.

**Each counter:**
- Value: `40px` Geist Sans Bold, `#F8FAFC`, `tabular-nums`, `-0.02em` letter-spacing
- Label: `14px` Geist Sans Regular, `#94A3B8`, `margin-top: 4px`
- Values: "Total vaults created", "Volume protected", "Agents secured"

**Number animation:** `AnimatedNumber` component triggers when the section scrolls into viewport (Intersection Observer, `threshold: 0.3`). Counts up from 0 to actual value over `1200ms`, easing `[0.16, 1, 0.3, 1]`. Numbers use `formatUsdCompact()` for volume (e.g., "$1.2M"). Only animates once per page load (tracked via ref).

**Background treatment:**
```css
.stats-section {
  background: linear-gradient(180deg,
    #111827 0%,     /* slightly lighter top */
    #0A0E1A 100%    /* back to page background */
  );
  border-top: 1px solid #1E293B;
  border-bottom: 1px solid #1E293B;
}
```

### 6.6 SDK Section

**Layout:** centered, `padding: 80px 24px`, max-width `720px`

**Section heading:** `24px` Geist Sans SemiBold, `#F8FAFC`, centered, content: "Five lines of code"

**Subtext:** `15px` Geist Sans Regular, `#94A3B8`, centered, `margin-top: 8px`, content: "Wrap any DeFi instruction with Sigil security using @usesigil/kit"

**Install command (above code block):**
```css
.install-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  background: #0F172A;            /* --bg-input */
  border: 1px solid #1E293B;
  margin: 24px auto;
  font-family: 'Geist Mono';
  font-size: 14px;
  color: #94A3B8;
  cursor: pointer;
}
.install-pill:hover {
  border-color: #6366F1;
}
```
- Content: `npm install @usesigil/kit`
- Copy icon on the right (Lucide `<Copy size={14}>`), swaps to `<Check>` for 2s on click

**Code block:**
```css
.code-block {
  background: #0F172A;            /* --bg-input, slightly darker than card */
  border: 1px solid #1E293B;
  border-radius: 10px;
  padding: 24px;
  margin-top: 16px;
  overflow-x: auto;
  font-family: 'Geist Mono';
  font-size: 14px;
  line-height: 1.7;
}
```
- Syntax highlighting: use a custom theme matching the palette:
  - Keywords (`import`, `const`, `await`): `#818CF8` (accent-hover / light indigo)
  - Strings: `#10B981` (status-secure / green)
  - Functions/methods: `#F8FAFC` (text-primary)
  - Comments: `#64748B` (text-muted)
  - Punctuation/operators: `#94A3B8` (text-secondary)
  - Types: `#F59E0B` (status-warning / amber)
- Line numbers: `#334155` (text-disabled), right-aligned, `padding-right: 16px`, separated from code by `1px solid #1E293B` vertical line

### 6.7 Final CTA

**Layout:** centered section, `padding: 80px 24px`

- Heading: `28px` Geist Sans SemiBold, `#F8FAFC`, centered, content: "Start protecting your agents in under 2 minutes"
- CTA button: same as hero primary button (section 6.1)
- Docs link: below button, `14px` Geist Sans Regular, `#6366F1`, underline on hover, content: "Or read the documentation first"

### 6.8 Footer

**Layout:** `padding: 48px 24px 32px`, `border-top: 1px solid #1E293B`, max-width `1120px`, centered

**Desktop (1024px+):** 4-column grid

| Column 1 | Column 2 | Column 3 | Column 4 |
|---|---|---|---|
| **Sigil** (logo, `16px` bold) | **Product** | **Developers** | **Community** |
| `13px` tagline in `#64748B` | Dashboard | Documentation | Discord |
| | Create a vault | SDK reference | Twitter |
| | Security | GitHub | |

**Link styling:** `14px` Geist Sans Regular, `#94A3B8`, hover: `#F8FAFC`, transition `150ms ease`

**Column header:** `13px` Geist Sans Medium, `#64748B`, uppercase, `letter-spacing: 0.04em`, `margin-bottom: 16px`

**Bottom bar (below columns):** `margin-top: 32px`, `padding-top: 16px`, `border-top: 1px solid #1E293B`, flex row space-between:
- Left: "Built on Solana" badge -- `12px` Geist Sans Regular, `#64748B`, with Solana logo (monochrome, `14px` height) inline
- Right: copyright, `12px` Geist Sans Regular, `#64748B`

**Tablet (768px-1023px):** 2x2 grid for link columns, logo section full width above

**Mobile (375px-767px):** single column, accordion-style collapsible sections for each link group

---

## GAP 7: Data Visualization Empty States

Comprehensive spec for zero-data states across all chart types. These are distinct from loading states (shimmer) and error states (red border + retry).

### 7.1 General Empty State Pattern

Every chart empty state follows this structure:

```
+----------------------------------------------------------+
|                                                            |
|  [Ghost chart background -- faint axes + dashed line]     |
|                                                            |
|        [Icon, 32px, #64748B]                              |
|                                                            |
|        [Heading -- what's missing]                         |
|        [Body -- what to do about it]                       |
|                                                            |
|        [CTA button, optional]                              |
|                                                            |
+----------------------------------------------------------+
```

**Ghost chart background:** renders BEHIND the centered message. It provides spatial context (this is where a chart will be) without being blank.

- Y-axis: renders with `$0` at bottom, cap value at top (or `$500` default). `12px` Geist Sans Regular, `#1E293B` at 60% opacity (intentionally very faint)
- X-axis: renders with time labels for the current 24h window. Same faint styling.
- Gridlines: same as real chart but at `20%` opacity instead of `50%`
- Dashed reference line: horizontal, at vertical midpoint, `#1E293B` at 40% opacity, `strokeDasharray="8 6"`, `strokeWidth: 1.5`
- No plot line, no fill, no bars, no segments

**Centered overlay message:**
- Container: absolutely positioned, centered both axes, `max-width: 280px`, `text-align: center`
- Background: `rgba(17, 24, 39, 0.9)` (card at 90% opacity -- ensures text readability over ghost chart)
- Padding: `24px`
- Border-radius: `10px`

### 7.2 Per-Chart Empty States

**Spending area chart (24h):**
- Icon: `<TrendingUp size={32}>`, `#64748B`
- Heading: "No spending activity yet", `14px` Geist Sans Medium, `#94A3B8`
- Body: "Spending data will appear here once your agent executes its first trade", `13px` Geist Sans Regular, `#64748B`
- CTA: none (the user cannot force trading from here)
- Ghost chart: Y-axis shows `$0` to vault daily cap, X-axis shows current 24h window

**Per-agent bar chart:**
- Icon: `<Users size={32}>`, `#64748B`
- Heading: "No agent activity recorded", `14px` Geist Sans Medium, `#94A3B8`
- Body: "Register an agent and start trading to see per-agent spending comparisons", `13px` Geist Sans Regular, `#64748B`
- CTA: "Register an agent" button (ghost variant), navigates to Agents tab
- Ghost chart: Y-axis shows `$0` to `$100`, X-axis shows "Agent 1", "Agent 2" placeholder labels in `#1E293B`

**Protocol donut:**
- Icon: `<PieChart size={32}>`, `#64748B`
- Heading: "No protocol usage yet", `14px` Geist Sans Medium, `#94A3B8`
- Body: "Protocol distribution will populate as trades are executed across different platforms", `13px` Geist Sans Regular, `#64748B`
- CTA: none
- Ghost chart: a single complete circle ring in `#1E293B` at 30% opacity (the "background track" of the donut), same dimensions as the real donut

**Cap utilization gauge:**
- The gauge always renders, even at 0%. At 0%, the fill arc is empty (only the background track is visible), center label shows "0%" in `#10B981` (green -- 0% utilization is healthy), absolute values show "$0 / $X,XXX"
- No overlay message needed. A gauge at 0% is valid data, not empty data.

**Activity table:**
- Not a chart, but follows the same pattern: centered illustration + message
- Icon: `<Inbox size={32}>`, `#64748B`
- Heading: "No activity yet", `14px` Geist Sans Medium, `#94A3B8`
- Body: "Trades, deposits, and policy changes will appear here as they happen", `13px` Geist Sans Regular, `#64748B`
- CTA: none
- The table headers still render (Timestamp, Type, Agent, Amount, Status, Reference ID) with the empty state below them. This shows the user what columns to expect.

### 7.3 Loading vs Empty vs Error Summary

| State | Visual | Animation | Interaction |
|---|---|---|---|
| **Loading** | Full-area shimmer block (gradient sweep), matches chart container dimensions, `border-radius: 10px` | `shimmer` keyframe, 1.5s ease-in-out infinite | None -- not interactive |
| **Empty** | Ghost chart background + centered message overlay | None -- static | CTA button if applicable |
| **Error** | `4px` red left border on chart card, centered error icon + message + Retry button | None -- static | Retry button triggers refetch |

### 7.4 Transition Between States

When data arrives after an empty state (first trade executes while the user is watching):

1. Empty state message fades out: `opacity: 1 -> 0`, `150ms ease`
2. Ghost chart fades from 20% to 50% gridline opacity: `200ms ease`
3. Real chart data draws in: line draw animation (`1000ms ease-out` for area chart), bar grow animation (`600ms spring`) for bars, segment sweep (`800ms ease-out`) for donut
4. Total transition time: approximately `1200ms` from data arrival to fully rendered chart

This is handled by wrapping chart + empty state in `<AnimatePresence mode="wait">` with the chart data length as the key discriminator.

---

---

## GAP 8: Security Council Findings — UI Components (2026-03-25)

> **Source:** On-chain security council audit (4 members, 3 rounds). These are dashboard-specific design specs for security findings that need UI representation.

### 8.1 Mode ALL Critical Banner

When `policy.protocolMode === 0` (ALL) and no `InstructionConstraints` with `strict_mode = true`:

```tsx
// SecurityBanner.tsx — rendered at TOP of VaultDetail, above all other content
<div className="w-full px-4 py-3 rounded-lg flex items-center gap-3"
  style={{
    background: 'var(--status-danger)',  // #B84233
    color: 'var(--text-primary)',         // #F0EAE0
  }}>
  <ShieldAlert className="h-5 w-5 shrink-0" />
  <div>
    <p className="text-sm font-semibold font-archivo">Unrestricted Program Access</p>
    <p className="text-xs opacity-80 font-inter">
      Protocol mode is set to ALL — agents can call any program on Solana.
      Only spending caps limit agent actions.
    </p>
  </div>
  <Button variant="outline" size="sm" className="ml-auto shrink-0">
    Fix in Policy
  </Button>
</div>
```

- **Position:** Sticky top of vault detail view, above KPI cards
- **Dismiss:** Cannot be dismissed — persists until policy is changed
- **Simple Mode:** Same banner, simplified text: "Your vault is in open mode. Agents have broad access. We recommend restricting to specific protocols."

### 8.2 Non-Stablecoin Holdings Shield Icon

Token balance table rows need differentiated protection indicators:

```
USDC  $12,450.00   🛡️ Full protection    (forest green shield, solid)
USDT  $3,200.00    🛡️ Full protection    (forest green shield, solid)
SOL   45.2         🛡️⚠ Partial           (amber shield with gap)
wSOL  12.0         🛡️⚠ Partial           (amber shield with gap)
```

- **Full shield:** `--status-secure` (`#4A6741`), solid shield icon. Tooltip: "Spending-capped and fee-tracked"
- **Partial shield:** `--status-warning` (`#C4922A`), shield with notch/gap icon. Tooltip: "Not spending-capped — Sigil cannot value this token without a price oracle. Consider converting to USDC/USDT for full protection."
- **Icon size:** 16px, inline with token name
- **Simple Mode:** Replace icons with plain text badges: "Protected" (green) / "Limited protection" (amber)

### 8.3 Leverage Advisory Tooltip

On the Policy Editor's leverage field and in agent activity:

```tsx
// LeverageTooltip.tsx
<TooltipContent side="right" className="max-w-[280px]">
  <p className="text-sm font-semibold font-archivo mb-1">Advisory Only</p>
  <p className="text-xs font-inter text-[var(--text-secondary)]">
    Sigil checks the leverage value your agent declares, not the actual leverage
    in the DeFi instruction. For full enforcement, configure InstructionConstraints
    with byte-level checks on the protocol's leverage field.
  </p>
</TooltipContent>
```

- **Visual cue:** Small info icon (`ℹ️`) next to leverage input, `--text-muted` color
- **Policy Editor:** Shown next to the `max_leverage_bps` input field
- **Agent Activity feed:** When action is OpenPosition/IncreasePosition/SwapAndOpenPosition, show "Declared: 5x" with info icon

### 8.4 Constraint Staleness Warning Card

When `getSecurityPosture()` check `constraints-current` fails:

```tsx
// ConstraintStalenessCard.tsx — in Security tab
<Card className="border-[var(--status-warning)] bg-[var(--bg-surface)]">
  <CardHeader className="pb-2">
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-[var(--status-warning)]" />
      <CardTitle className="text-sm font-archivo">Constraint Review Needed</CardTitle>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-xs font-inter text-[var(--text-secondary)]">
      One or more protocol programs may have upgraded since your constraints were last updated.
      Outdated constraints may not match current instruction formats.
    </p>
    <Button variant="outline" size="sm" className="mt-3">
      Review Constraints
    </Button>
  </CardContent>
</Card>
```

- **Position:** Security tab, below security posture checklist
- **Visibility:** Only shown when check fails
- **Color:** Amber border (`--status-warning`), not red — this is a maintenance prompt, not a critical alert

### 8.5 Trust Model Summary (Security Tab)

Clean two-column layout showing what Sigil enforces vs. what it doesn't:

| Column 1: "Enforced On-Chain" | Column 2: "Your Responsibility" |
|---|---|
| ✅ Spending limits (daily + per-agent) | ⚠️ Trade quality (good vs. bad trades) |
| ✅ Protocol restrictions (allowlist) | ⚠️ Non-stablecoin token value |
| ✅ Direct theft prevention (SPL blocking) | ⚠️ Leverage accuracy (advisory only) |
| ✅ Jupiter slippage limits | ⚠️ Agent key security |
| ✅ Session expiry (auto-revoke) | ⚠️ Constraint updates after protocol upgrades |

- **Font:** Archivo for column headers, Inter for items
- **Colors:** Column 1 items in `--status-secure`. Column 2 items in `--status-warning`
- **Simple Mode:** Same content, friendlier language: "What we protect" / "What you manage"

---

## CRITICAL: Color and Typography Reconciliation (2026-03-24)

> **Source:** Persona readiness assessment (Sarah -- Non-Technical Vault Owner) found BLOCKING contradictions between this document and DASHBOARD-PLAN.md v5.0.

### The Indigo Problem

This document (`DASHBOARD-DESIGN-GAPS.md`) contradicts `DASHBOARD-PLAN.md` in two critical ways:

**1. Chart Colors:**
- This doc (GAP 1.1, line 29): Uses `#6366F1` (indigo) as the primary chart color
- This doc (GAP 1.2, line 101): Assigns `#6366F1` as `--chart-1`, `#A855F7` (violet) as `--chart-4`, `#8B5CF6` (purple) as `--chart-8`
- DASHBOARD-PLAN.md (Section 3, palette): Uses `#9E7C4E` (bronze) as `--accent-primary`
- DASHBOARD-PLAN.md (line 54): "No cold blue. No purple. No indigo."
- The header of THIS DOCUMENT (line 15): "NO blue. NO purple. NO indigo. Anywhere."

**CONTRADICTION:** This document's chart palette violates its own header rule.

**2. Typography:**
- This doc: References "Geist Sans" 47+ times throughout all GAP sections
- DASHBOARD-PLAN.md (Section 3, line 229): "Archivo Black (900) for headings. Inter (400-600) for body. NOT Geist Mono."

**RECONCILIATION REQUIRED:**

Every instance of these values in this document must be replaced:

| Find | Replace With |
|------|-------------|
| `#6366F1` (indigo) | `var(--accent-primary)` -> `#9E7C4E` (bronze) |
| `#A855F7` (violet) | `var(--chart-5)` from DASHBOARD-PLAN.md warm palette |
| `#8B5CF6` (purple) | `var(--chart-8)` from DASHBOARD-PLAN.md warm palette |
| `#06B6D4` (cyan) | `var(--status-info)` -> `#5A7E8C` (muted teal) |
| "Geist Sans" (all occurrences) | "Inter" (body/UI) or "Archivo" (display/KPIs) |
| `areaFillIndigo` (gradient ID) | `areaFillBronze` |

The DASHBOARD-PLAN.md warm OKLCH chart palette is the source of truth:

```
--chart-1: oklch(0.60 0.10 70)    /* #9E7C4E -- bronze */
--chart-2: oklch(0.48 0.10 145)   /* #4A6741 -- forest green */
--chart-3: oklch(0.65 0.12 75)    /* #C4922A -- warm amber */
--chart-4: oklch(0.52 0.05 200)   /* #5A7E8C -- muted teal */
--chart-5: oklch(0.55 0.08 50)    /* #A0664B -- warm copper */
--chart-6: oklch(0.55 0.12 25)    /* #B84233 -- warm red */
--chart-7: oklch(0.65 0.10 80)    /* #C4922A -- gold */
--chart-8: oklch(0.55 0.06 130)   /* #6B7F5C -- sage */
```

This reconciliation must happen BEFORE any dashboard code is written.

## Appendix A: Token Reference (Quick Lookup)

All CSS values in this document reference the design system defined in DASHBOARD-PLAN.md section 3. Quick reference:

```
Backgrounds:    #0A0E1A (page), #111827 (card), #1F2937 (elevated), #0F172A (input)
Borders:        #1E293B (default), #6366F1 (focus)
Accent:         #6366F1 (primary), #818CF8 (hover), #4F46E5 (pressed)
Status:         #10B981 (secure), #F59E0B (warning), #EF4444 (danger), #3B82F6 (info)
Text:           #F8FAFC (primary), #94A3B8 (secondary), #64748B (muted), #334155 (disabled)
Chart palette:  #6366F1, #10B981, #F59E0B, #A855F7, #06B6D4, #EF4444, #F97316, #8B5CF6
Radius:         6px (sm), 8px (md), 10px (lg), 14px (xl), 18px (2xl)
Spacing:        4/8/12/16/24/32/48/64px
Font:           Geist Sans (Regular 400, Medium 500, SemiBold 600, Bold 700)
                Geist Mono (Regular 400)
```

## Appendix B: Component Dependency Map

Which dashboard components consume which gap specifications:

| Gap | Components that use this spec |
|---|---|
| GAP 1 (Charts) | `SpendingChart.tsx`, `AgentSpendBars.tsx`, `ProtocolDonut.tsx`, `CapGauges.tsx`, `BalanceChart.tsx`, `ThemedTooltip.tsx` |
| GAP 2 (KPI Cards) | `KPICard.tsx`, `KPICardSkeleton.tsx`, `AggregateKPIs.tsx` |
| GAP 3 (Create Wizard) | `CreateWizard.tsx`, `StepPolicy.tsx`, `StepAgent.tsx`, `StepFund.tsx`, `StepReview.tsx` |
| GAP 4 (Responsive) | All components -- applied via Tailwind breakpoint prefixes |
| GAP 5 (Error/Edge) | `ConnectionBanner.tsx`, `AlertToast.tsx`, `useSigilTransaction.ts`, `useVaultState.ts` |
| GAP 6 (Landing) | `app/page.tsx` (landing page route) |
| GAP 7 (Empty States) | `EmptyState.tsx`, `ChartSkeleton.tsx`, all chart components |
