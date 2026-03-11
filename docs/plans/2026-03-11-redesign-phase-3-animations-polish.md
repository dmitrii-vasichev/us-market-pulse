# Redesign Phase 3: Animations & Polish

**Date:** 2026-03-11
**Status:** Approved
**Issues:** TBD

## Context

Phase 1 (Design System) and Phase 2 (Storytelling Layer) are complete.
Phase 3 finalizes the redesign with motion, polish, responsive fixes, and performance.

## Already Done (Phase 1 + 2)

- Dark theme, color palette, typography
- KpiCard / ChartCard hover effects (`-translate-y-0.5`, shadow, bg-transition)
- ContextualSidebar with `max-h` transition
- NarrativeHeader on all pages
- Insight-driven chart titles
- KPI micro-context, KeyTakeaways, Footer
- Nivo `animate={true}` on all charts

## Tasks

### T1: Staggered load animations + prefers-reduced-motion

**Issue:** TBD
**Files:** `src/app/globals.css`, `src/components/KpiStrip.tsx`, `src/components/KpiCard.tsx`

- Add `@keyframes fadeInUp` to globals.css
- KPI cards: `animation-delay: 0ms / 50ms / 100ms / 150ms`
- ChartCards: staggered reveal via CSS classes with `animation-delay`
- Respect `prefers-reduced-motion: reduce` — disable all entry animations

**Acceptance Criteria:**
- [ ] Cards appear in a wave on page load
- [ ] `prefers-reduced-motion` disables animations
- [ ] No layout shift during animation
- [ ] Tests pass

---

### T2: KPI counter animation (count-up)

**Issue:** TBD
**Files:** `src/hooks/useCountUp.ts` (new), `src/components/KpiCard.tsx`

- Create `useCountUp(target, duration, enabled)` hook using `requestAnimationFrame`
- Easing: `easeOutCubic`
- Duration: ~1200ms
- Disable when `prefers-reduced-motion` is true
- Handle numeric formatting (currency, percent, etc.) during animation

**Acceptance Criteria:**
- [ ] KPI values animate from 0 to final on mount
- [ ] Formatting applied correctly (e.g., $31.5T, 2.7%)
- [ ] Disabled with `prefers-reduced-motion`
- [ ] Tests for useCountUp hook

---

### T3: Page transition animations

**Issue:** TBD
**Files:** `src/components/PageTransition.tsx` (new), `src/app/layout.tsx`

- Create `<PageTransition>` wrapper component using `usePathname()`
- On route change: fade + subtle `translateY(8px → 0)` over 250ms `ease-out`
- Header and Footer are NOT animated (outside wrapper)
- Respect `prefers-reduced-motion`

**Acceptance Criteria:**
- [ ] Overview → Labor → Markets transitions are smooth
- [ ] Header/Footer don't flash
- [ ] No scroll position issues
- [ ] Tests pass

---

### T4: Chart annotation callouts

**Issue:** TBD
**Files:** `src/components/charts/GdpWaterfall.tsx`, `src/components/charts/GdpQuarterly.tsx`, `src/components/charts/CpiHeatmap.tsx`

Three annotations via Nivo custom layers (SVG overlay):
- **GdpWaterfall**: callout on Net Exports bar → `"First drag in 3 quarters"`
- **GdpQuarterly**: callout on Q1 2025 (-0.6%) → `"Contraction driven by inventory drawdown"`
- **CpiHeatmap**: highlight high-inflation area → `"Shelter costs remained elevated"`

Style: thin line from data point to text label, 11px, `--text-muted` color.
Hide annotations on mobile (`< 640px`).

**Acceptance Criteria:**
- [ ] 3 annotations rendered on desktop
- [ ] Hidden on mobile (no overflow)
- [ ] Positioned correctly relative to data
- [ ] Tests pass

---

### T5: Responsive layout audit & fixes

**Issue:** TBD
**Files:** all pages, `KpiStrip.tsx`, chart wrapper components

Audit and fix at 3 breakpoints: 375px, 768px, 1024px.

Specific fixes:
- Charts: wrap in `overflow-x: auto` container on mobile
- `KpiStrip.tsx`: verify `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- NarrativeHeader: readable text on 375px
- Tables/data grids: horizontal scroll
- Touch targets: min 44x44px for interactive elements

**Acceptance Criteria:**
- [ ] No horizontal page scroll on 375px
- [ ] KPI grid: 1 col (mobile), 2x2 (tablet), 4 col (desktop)
- [ ] Charts scrollable horizontally on mobile
- [ ] All 3 pages verified

---

### T6: Lazy-loading charts below fold

**Issue:** TBD
**Files:** `src/components/ChartCard.tsx`, all page files

- Use Intersection Observer to defer chart rendering
- Charts above fold (first viewport): load immediately
- Charts below fold: show `ChartCardSkeleton` until in viewport
- Use `next/dynamic` with `loading` prop or manual `useInView` hook

**Acceptance Criteria:**
- [ ] First 2 ChartCards on Overview load immediately
- [ ] Below-fold charts show skeleton then load on scroll
- [ ] No flash of unstyled content
- [ ] Tests pass

---

### T7: Lighthouse performance audit

**Issue:** TBD
**Files:** `src/app/layout.tsx`, `next.config.ts`, `globals.css`

1. Run Lighthouse (headless) on all 3 pages
2. Fix top issues:
   - Font loading: `font-display: swap` on all fonts
   - Unused CSS: purge unused Tailwind classes
   - Image optimization: next/image for any images
   - Meta tags: verify OG, description, title per page
3. Target: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90

**Acceptance Criteria:**
- [ ] Lighthouse scores ≥ 90 on Performance, Accessibility, Best Practices
- [ ] No critical console errors
- [ ] Proper meta tags on all pages

---

### T8: Polish & cross-reference connections

**Issue:** TBD
**Files:** `src/components/KpiCard.tsx`, `src/components/KpiStrip.tsx`, `src/app/page.tsx`

Cross-reference connections between blocks (per PRD):
- KPI "Fed Funds Rate: 3.6%" → sub-label: `"← responding to 2.7% inflation"`
- KPI "Unemployment 4.4%" → sub-label: `"↑ from 3.6% in 2023, below hist. avg 5.7%"`
- Overview GDP section → link: `"See Labor & Economy for employment impact →"`

Final visual QA: all 3 pages for inconsistencies, typos, misaligned elements.

**Acceptance Criteria:**
- [ ] Cross-reference labels visible on all KPI cards where applicable
- [ ] Navigation link from Overview to Labor page works
- [ ] No visual inconsistencies on final QA
- [ ] Workflow state updated to complete
