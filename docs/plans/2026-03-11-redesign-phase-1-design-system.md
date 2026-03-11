# Redesign Phase 1: Design System

**Date:** 2026-03-11
**Status:** Approved
**PRD:** docs/prd-redesign.md
**Design Brief:** docs/design-brief-redesign.md

## Goal

Replace the current light-theme generic design with a "Dark Editorial Finance" design system.
After this phase: dark theme is applied everywhere, new typography is loaded, Nivo charts use
the dark palette, and ChartCard/KpiCard components are ready to accept storytelling props
(for Phase 2).

## Tasks

---

### T1 — Dark theme CSS variables

**Issue:** TBD
**Files:** `frontend/src/app/globals.css`

**Description:**
Replace all light-theme CSS variables with the new dark editorial palette.
Add `--bg-*`, `--text-*`, `--data-*` and `--positive`/`--negative`/`--neutral` variables.
Remove old accent-blue-dominant palette.

**Acceptance Criteria:**
- [ ] All CSS variables from design-brief-redesign.md are defined
- [ ] Body background uses `--bg-primary` (#0F1117)
- [ ] No legacy light colors remain as defaults
- [ ] Tailwind `@theme` block updated to dark tokens

**Verification:** `npm run build` passes. Visual check: page background is dark.

---

### T2 — Typography: load Instrument Serif + JetBrains Mono

**Issue:** TBD
**Files:** `frontend/src/app/layout.tsx`, `frontend/src/app/globals.css`

**Description:**
Add `Instrument_Serif` and `JetBrains_Mono` from `next/font/google`.
Define CSS variables `--font-display` and `--font-mono`.
Apply `--font-mono` to numeric KPI values via `.font-mono` class and
`font-variant-numeric: tabular-nums`.

**Acceptance Criteria:**
- [ ] `Instrument_Serif` loaded with `variable: "--font-display"`, subset latin
- [ ] `JetBrains_Mono` loaded with `variable: "--font-mono"`, subset latin
- [ ] `@theme` block exposes `--font-display` and `--font-mono`
- [ ] Body still uses DM Sans (or Satoshi if available), display font available for use
- [ ] `tabular-nums` utility available in CSS

**Verification:** `npm run build` passes. Network tab shows font files loading.

---

### T3 — Nivo dark theme + new color palette

**Issue:** TBD
**Files:** `frontend/src/lib/nivo-theme.ts`

**Description:**
Rewrite `nivoTheme` for dark backgrounds. Update `chartColors` and `colorScheme`
to use the new `--data-*` palette (teal, coral, amber, blue, purple, slate).
Update tooltip to dark style.

**Acceptance Criteria:**
- [ ] `nivoTheme` grid lines: `rgba(255,255,255,0.06)`
- [ ] `nivoTheme` axis text: `#555D73` (--text-muted)
- [ ] `nivoTheme` tooltip: dark bg `#252A3A`, light text `#E8ECF1`
- [ ] `chartColors` replaced: teal `#2DD4A8`, coral `#F97066`, amber `#F5B731`, blue `#60A5FA`, purple `#A78BFA`, slate `#94A3B8`
- [ ] `colorScheme` array updated to use new palette (teal first)
- [ ] `positive`/`negative` colors exported: `#2DD4A8` / `#F97066`

**Verification:** No TS errors. Charts visually use new colors.

---

### T4 — ChartCard: dark style + insight title + source props

**Issue:** TBD
**Files:** `frontend/src/components/ChartCard.tsx`, `frontend/src/components/ChartCardSkeleton.tsx`

**Description:**
Redesign `ChartCard` component:
- Dark card background (`--bg-card`)
- Rename `title` to `insight` (the conclusion/insight text, 14–15px, normal weight)
- Add `subtitle` prop (chart type descriptor, 10–11px, uppercase, muted) — displayed above insight
- Add `source` prop (attribution string, 10px, bottom of card)
- Hover: subtle lift + enhanced shadow
- Update `ChartCardSkeleton` to dark background

**Acceptance Criteria:**
- [ ] `ChartCard` accepts: `insight: string`, `subtitle?: string`, `source?: string`, `height?: number`, `children`
- [ ] `subtitle` renders above `insight` in uppercase muted style
- [ ] `insight` renders as sentence-case readable insight title
- [ ] `source` renders bottom-left in muted 10px text
- [ ] Card background: `bg-[#1A1D27]`, border `border-white/[0.06]`
- [ ] Hover: `hover:-translate-y-0.5 hover:shadow-lg`
- [ ] `ChartCardSkeleton` dark: bg `#1A1D27`, pulse on `#252A3A`
- [ ] All existing chart usages updated to pass `insight` (reuse current title text for now — Phase 2 updates content)

**Verification:** `npm run build`. All chart pages render. No white card backgrounds.

---

### T5 — KpiCard: dark style + micro-context line

**Issue:** TBD
**Files:** `frontend/src/components/KpiCard.tsx`, `frontend/src/components/KpiStripSkeleton.tsx`

**Description:**
Redesign `KpiCard`:
- Dark card style (standalone dark card, not strip item)
- Typography hierarchy: label (10px uppercase muted) → value (36px bold mono tabular) → change (12px colored) → micro-context (11px secondary)
- Add `micro_context` field support from `KpiItem` type (or use hardcoded map by key for now)
- Sparkline: adapt colors to dark theme
- Update `KpiStripSkeleton` to dark

**Acceptance Criteria:**
- [ ] Value uses `font-mono` class and `tabular-nums`
- [ ] Value size: 36px, font-weight 600
- [ ] Change arrow + percent colored with `--positive`/`--negative`/`--neutral`
- [ ] Micro-context line: 11px, `--text-secondary`, below change indicator
- [ ] Card itself: dark bg, slight border, hover lift
- [ ] `KpiStripSkeleton` dark background

**Verification:** KPI strip renders on dark background. Font is monospace for values.

---

### T6 — Header: dark theme redesign

**Issue:** TBD
**Files:** `frontend/src/components/Header.tsx`

**Description:**
Redesign Header for dark theme:
- Background: `--bg-card` with bottom border `rgba(255,255,255,0.06)`
- Logo icon: teal accent `--data-teal`
- Site name: `--text-primary`, slight display font feel
- Active tab: teal text + `bg-[#2DD4A8]/10`
- Inactive tab hover: `--text-primary` on `--bg-elevated`
- Mobile menu: dark overlay

**Acceptance Criteria:**
- [ ] Header background `bg-[#1A1D27]` sticky
- [ ] Bottom border `border-white/[0.06]`
- [ ] Logo accent `text-[#2DD4A8]`
- [ ] Active nav tab: `text-[#2DD4A8] bg-[#2DD4A8]/10`
- [ ] No white/gray-50 backgrounds remain
- [ ] Mobile menu dark styled

**Verification:** Header renders dark. Active tab is teal-highlighted.

---

### T7 — Footer: dark + methodology + about section

**Issue:** TBD
**Files:** `frontend/src/components/Footer.tsx`

**Description:**
Redesign Footer for dark theme and richer content per PRD:
- Background: `--bg-card`, top border subtle
- **Methodology note**: "Data sourced from BEA, BLS, FRED via public APIs. Updated quarterly for GDP, monthly for employment and inflation."
- **About section**: "Built as a portfolio project to demonstrate data analytics, visualization, and economic storytelling skills."
- Links: GitHub, LinkedIn (placeholder hrefs)
- Built by / year

**Acceptance Criteria:**
- [ ] Footer background `bg-[#1A1D27]`
- [ ] Methodology paragraph present
- [ ] About paragraph present
- [ ] GitHub + LinkedIn links (can be `#` placeholder)
- [ ] "Built by DK · 2026" attribution
- [ ] No white backgrounds

**Verification:** Footer renders dark. Methodology and About text visible.

---

### T8 — Chart components: apply dark nivo theme + new palette

**Issue:** TBD
**Files:** All `frontend/src/components/charts/*.tsx`

**Description:**
Update all 12 chart components to:
1. Use updated `nivoTheme` (already dark after T3)
2. Replace hardcoded color strings with values from updated `chartColors`
3. Update chart-specific color props to use new palette
4. Wrap in updated `ChartCard` with `insight` prop (reuse current title text as-is; Phase 2 will update content)
5. Ensure `animate={true}` on all Nivo charts

**Charts to update:**
- `GdpWaterfall`, `GdpQuarterly`, `GdpWaffle`, `EconomicFunnel`
- `CpiCalendar`, `CpiHeatmap`, `BulletTargets`
- `UnemploymentBump`, `StateScatter`
- `RatesLine`, `SectorTreemap`, `SentimentRadial`, `Sp500Area`

**Acceptance Criteria:**
- [ ] No hardcoded `#3B82F6` (old blue) in any chart file
- [ ] Positive values use `--data-teal` (#2DD4A8), negative use `--data-coral` (#F97066)
- [ ] All charts wrapped in `ChartCard` with `insight` prop
- [ ] `animate={true}` on all charts
- [ ] `npm run build` passes with no TS errors

**Verification:** All 3 pages load. Charts render in dark palette. No blue dominance.

---

## Order of Execution

T1 → T2 (CSS/fonts foundation) → T3 (nivo theme) → T4 (ChartCard) → T5 (KpiCard) → T6 (Header) → T7 (Footer) → T8 (charts)

T1–T2 can be done in one commit. T3–T7 are independent after T1–T2. T8 depends on T3 and T4.

## Tests

Each task: `npm run lint && npm run build` before commit.
Visual regression: all 3 pages (/, /labor, /markets) must render without errors.
No unit tests needed for pure styling tasks — build + visual check is sufficient.
