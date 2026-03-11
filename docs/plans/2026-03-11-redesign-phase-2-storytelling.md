# Redesign Phase 2: Storytelling Layer
**Date:** 2026-03-11
**Status:** Draft — awaiting approval
**Phase:** Redesign Phase 2 / 3

## Goal

Transform the dashboard from a "collection of charts" into an analytical story. Each page should answer "so what?" — insight titles that form conclusions, narrative headers that frame context, key takeaways that synthesize the data.

## Context

Phase 1 delivered the Dark Editorial Finance design system (dark theme, typography, colors, all 13 chart components). Phase 2 builds the editorial intelligence layer on top of it.

## Tasks

---

### T1: NarrativeHeader component
**Issue label:** `task`
**Files:** `frontend/src/components/NarrativeHeader.tsx`

Create a reusable `NarrativeHeader` component placed at the top of each tab (below KPI strip on Overview, at top on Labor/Markets). Renders:
- Section label: `"ECONOMIC OVERVIEW · Q4 2025"` (uppercase, muted, 11px)
- Narrative body: 2–3 sentences describing current economic state (editorial tone)
- Footer line: `"Updated: Mar 2026 · Sources: BEA, BLS, Federal Reserve"` (muted, 10px)

Use template strings with real data values (gdpGrowth, cpiValue, unemploymentRate, fedRate) fetched from the existing API. Styled with subtle left-border accent line in `--data-teal`, slightly elevated card (`--bg-elevated`), Instrument Serif for the text body.

**Acceptance criteria:**
- [ ] Component renders correctly on all 3 pages
- [ ] Uses real data values (not hardcoded) via props
- [ ] Matches Dark Editorial Finance style (no generic AI look)
- [ ] Tests: renders without errors, narrative text includes expected values

---

### T2: Insight-driven chart titles — Overview page
**Issue label:** `task`
**Files:** `frontend/src/app/page.tsx`

Update all `insight` props on ChartCard instances in Overview page from descriptive labels to insight-oriented conclusions:

| Chart | Before | After |
|---|---|---|
| GdpWaterfall | "GDP Growth Components — 1.4% Total" | "Consumer spending drove nearly half of Q4 growth" |
| GdpQuarterly | "Quarterly GDP Growth (%)" | "Growth decelerated sharply after Q3's 4.4% surge" |
| CpiCalendar | "CPI Monthly Values" | "Inflation has stayed above the Fed's 2% target since mid-2024" |
| CpiHeatmap | "CPI Category Weights" | "Shelter costs remain the stickiest inflation driver" |
| EconomicFunnel | "Economic Funnel — GDP to Employment" | "$31.5T economy supports 160M jobs at $197/hr GDP per worker" |
| BulletTargets | "Economic Targets vs Actuals" | "Fed hits rate target; inflation still 35% above 2% goal" |

Add `source` prop to all ChartCard instances: "Source: BEA · Q4 2025", "Source: BLS · Jan 2026", etc.

**Acceptance criteria:**
- [ ] All 6 Overview charts have insight-oriented titles
- [ ] All 6 charts have source attribution
- [ ] Titles use actual data values where applicable (dynamic, not hardcoded strings)
- [ ] Tests: page renders, chart titles visible

---

### T3: Insight-driven chart titles — Labor + Markets pages
**Issue label:** `task`
**Files:** `frontend/src/app/labor/page.tsx`, `frontend/src/app/markets/page.tsx`

Same pattern as T2 for the remaining 11 chart instances across Labor and Markets pages:

**Labor page (5 charts):**
- UnemploymentBump → "State unemployment rankings have shifted as labor market tightened"
- CpiHeatmap → "Shelter costs remain the stickiest inflation driver"
- StateScatter → "High-wage states show lower unemployment — but the gap is narrowing"
- EconomicFunnel → "Each dollar of GDP generates $0.19 in worker compensation"
- CpiCalendar → "Monthly price increases clustered in Jan–Mar seasonally"

**Markets page (5 charts):**
- RatesLine → "The Fed's rate hikes are transmitting into mortgage costs — up 2.1pp"
- SectorTreemap → "Services sectors dominate at 78% of GDP; manufacturing at 11%"
- SentimentRadial → "Consumer sentiment has recovered 23% from its 2022 low"
- Sp500Area → "S&P 500 has returned to pre-2022 highs despite rate headwinds"
- BulletTargets → "Housing starts lagging targets by 18% — a key market watch item"

Add `source` prop to all chart instances.

**Acceptance criteria:**
- [ ] All 10 Labor/Markets charts have insight-oriented titles
- [ ] All charts have source attribution
- [ ] Tests: both pages render

---

### T4: ChartCard description prop + narrative paragraphs
**Issue label:** `task`
**Files:** `frontend/src/components/ChartCard.tsx`, `frontend/src/app/page.tsx`

Extend ChartCard with optional `description` prop — a 1–2 sentence narrative paragraph displayed below the insight title, above the chart. Use `text-[#8B93A7] text-[12px] leading-relaxed` style. Cap at 2 lines (line-clamp-2 on mobile).

Add descriptions to 4 key Overview charts:
- **GdpWaterfall**: "While overall GDP grew 1.4%, the composition shifted notably: consumers led at 0.63pp, while net exports dragged growth down by 0.07pp — the first negative contribution in 3 quarters."
- **GdpQuarterly**: "Q1 2025 marked a contraction (-0.6%), driven by inventory drawdown. The subsequent recovery in Q2–Q3 was unusually strong, setting a high baseline for Q4 comparisons."
- **RatesLine** (if present): "The Federal Reserve has held the target range at 3.50–3.75% since November 2025. Markets are pricing in 2 cuts in H1 2026."
- **EconomicFunnel**: "Consumer spending accounts for ~70% of US GDP. Each $1 of GDP flows through GNI ($0.97) to compensation ($0.62), supporting 160M workers."

**Acceptance criteria:**
- [ ] ChartCard accepts and renders optional `description` prop
- [ ] Description text is styled correctly (secondary color, small size)
- [ ] 4 charts on Overview page have descriptions
- [ ] Tests: ChartCard renders with and without description prop

---

### T5: ContextualSidebar component
**Issue label:** `task`
**Files:** `frontend/src/components/ContextualSidebar.tsx`, `frontend/src/app/page.tsx`

Create a `ContextualSidebar` component — a collapsible "What this means" block placed below a chart. Renders:
- Toggle button: "What this means ↓" / "Hide ↑" (10px uppercase, teal)
- Content: paragraph text with left-border accent line (`--data-teal` / `--bg-elevated`)
- Collapsed by default, animated expand/collapse

Add to 2 charts on Overview page:
- **GdpWaterfall**: explains consumption vs net exports contribution logic
- **EconomicFunnel**: explains what GDP→GNI→Compensation flow means for workers

**Acceptance criteria:**
- [ ] Component is collapsible with smooth animation
- [ ] Styled with left-border accent, muted background
- [ ] Renders on 2 Overview charts
- [ ] Tests: renders collapsed by default, toggles on click

---

### T6: KeyTakeaways component + all pages
**Issue label:** `task`
**Files:** `frontend/src/components/KeyTakeaways.tsx`, all 3 page files

Create a `KeyTakeaways` component — a highlighted box with 3–4 numbered insights placed at the bottom of each page (above footer). Props: `title` (default "Key Takeaways"), `takeaways: string[]`.

Styling: slightly elevated card, numbered items with `--data-teal` numbers, body text in `--text-secondary`, subtle top border in teal.

Add to all 3 pages with static takeaways (updated when data changes):

**Overview:**
1. "Growth is slowing — Q4's 1.4% is the lowest since Q1's contraction, signaling a cooling economy."
2. "Inflation remains sticky at 2.7% — 35% above the Fed's 2% target, limiting room for rate cuts."
3. "The labor market is the bright spot — 4.4% unemployment with steady job creation."
4. "Consumer spending resilience is the key risk variable to watch in Q1 2026."

**Labor:**
1. "Unemployment at 4.4% remains historically low — below the 5.7% post-2000 average."
2. "Wage growth is outpacing inflation for the first time since 2021, boosting real purchasing power."
3. "Labor force participation at 62.6% is still 1.2pp below pre-pandemic levels."
4. "State-level divergence is widening — top 10 states average 3.1% vs bottom 10 at 5.8%."

**Markets:**
1. "The Fed's rate pause is signaling confidence in disinflation progress."
2. "S&P 500 valuations remain elevated at 22x forward earnings — above 15-year average of 17x."
3. "The yield curve remains partially inverted — historically a recession signal with 12–18 month lag."
4. "Consumer sentiment recovery is incomplete — still 8% below 2021 peak."

**Acceptance criteria:**
- [ ] Component renders numbered takeaways with teal accent
- [ ] Added to all 3 pages
- [ ] Tests: renders correct number of takeaways, title displayed

---

### T7: Enhanced KPI micro-context with cross-references
**Issue label:** `task`
**Files:** `frontend/src/components/KpiCard.tsx`, `frontend/src/components/KpiStrip.tsx`

Update KpiCard micro-context from generic descriptions to data-aware, cross-referencing strings:

| KPI | Before | After |
|---|---|---|
| GDP | "Annualized GDP growth rate" | "Largest economy globally · ~25% of world GDP" |
| CPI | "Consumer prices, year-over-year" | "Above Fed's 2% target · Core CPI at 3.1%" |
| Unemployment | "Share of workforce seeking jobs" | "U-3 rate · Below historical avg of 5.7%" |
| Fed Rate | "Federal Reserve target rate" | "Target 3.50–3.75% · ← responding to 2.7% inflation" |

Make micro-context strings dynamic via props (passed from KpiStrip based on API data) rather than hardcoded lookup table, so they can update when data changes.

**Acceptance criteria:**
- [ ] All 4 KPI cards show updated micro-context
- [ ] Strings are passed as props (not hardcoded in KpiCard)
- [ ] KpiStrip passes correct strings based on API data
- [ ] Tests: KpiCard renders with provided micro-context prop

---

### T8: NarrativeHeader integration on all 3 pages
**Issue label:** `task`
**Files:** `frontend/src/app/page.tsx`, `frontend/src/app/labor/page.tsx`, `frontend/src/app/markets/page.tsx`

Integrate the NarrativeHeader component (built in T1) into all 3 pages with page-specific narrative text and data bindings.

**Overview:**
> "The US economy grew {gdpGrowth}% in Q4 2025, {decelerating/accelerating} from {prevGdpGrowth}% in Q3. Inflation remains {elevated/easing} at {cpiValue}% YoY while the Fed held rates at {fedRate}%. The labor market stays resilient with unemployment at {unemploymentRate}%."

**Labor:**
> "The US labor market added {jobsAdded}K jobs in {latestMonth}, with unemployment {direction} to {unemploymentRate}%. Wage growth at {wageGrowth}% YoY is {outpacing/lagging} inflation at {cpiValue}%, {improving/squeezing} real purchasing power."

**Markets:**
> "The Federal Reserve held its target rate at {fedRate}% in its {latestFOMCDate} meeting. The S&P 500 {direction} {sp500Change}% YTD. Markets are pricing in {expectedCuts} rate {cut/cuts} in H1 2026."

**Acceptance criteria:**
- [ ] NarrativeHeader visible on all 3 pages
- [ ] Narrative text uses dynamic values from API
- [ ] Styled consistently with Dark Editorial Finance theme
- [ ] Tests: each page renders with NarrativeHeader

---

## Dependencies

```
T1 (NarrativeHeader) → T8 (integration on all pages)
T4 (ChartCard description) — standalone
T5 (ContextualSidebar) — standalone
T6 (KeyTakeaways) — standalone
T7 (KPI micro-context) — standalone
T2, T3 (insight titles) — standalone
```

All tasks can be implemented independently except T8 depends on T1.

## Order of Implementation

1. T1 — NarrativeHeader component (foundation for T8)
2. T2 — Insight titles: Overview (highest visual impact)
3. T4 — ChartCard description prop
4. T6 — KeyTakeaways component
5. T5 — ContextualSidebar component
6. T7 — Enhanced KPI micro-context
7. T3 — Insight titles: Labor + Markets
8. T8 — NarrativeHeader on all pages

## Verification

For each task:
```bash
cd frontend && npm run lint && npm run build && npm test
```

Full test run before PR merge.
