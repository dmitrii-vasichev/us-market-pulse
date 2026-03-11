# Phase 2: Frontend Shell + Tab 1 (Overview)

## Overview
Set up the Next.js frontend with Tailwind CSS, Nivo charts, and DM Sans font. Build the app shell (header, tab navigation, footer) and implement Tab 1 (Overview) with KPI strip and 6 chart components.

## Dependencies
- Phase 1 backend must be deployed and accessible (✅ done)
- Backend API base URL: `https://backend-production-abef2.up.railway.app`

---

## Tasks

### Task 1: Next.js Project Setup
**Description:** Initialize Next.js 14+ app with TypeScript, Tailwind CSS, DM Sans font, and all required Nivo packages.
**Files:**
- `frontend/package.json`
- `frontend/tailwind.config.ts`
- `frontend/app/layout.tsx`
- `frontend/app/globals.css`
- `frontend/tsconfig.json`
- `frontend/next.config.ts`
**Acceptance Criteria:**
- [x] Next.js app runs with `npm run dev`
- [x] Tailwind CSS configured with project color palette
- [x] DM Sans font loaded via Google Fonts (next/font)
- [x] All Nivo packages installed (@nivo/bar, @nivo/line, @nivo/calendar, @nivo/funnel, @nivo/waffle, @nivo/bullet, @nivo/treemap, @nivo/radar, @nivo/bump, @nivo/heatmap, @nivo/pie, @nivo/stream)
**Verification:** `cd frontend && npm run dev` starts without errors

### Task 2: Nivo Theme, API Client, Types, Formatters
**Description:** Create shared utilities: Nivo theme config (from design brief), API client with base URL, TypeScript types for all API responses, and number/date formatters.
**Files:**
- `frontend/lib/nivo-theme.ts`
- `frontend/lib/api.ts`
- `frontend/lib/types.ts`
- `frontend/lib/formatters.ts`
**Acceptance Criteria:**
- [x] Nivo theme matches design brief exactly (colors, fonts, tooltip style)
- [x] API client fetches from backend with proper error handling
- [x] Types cover KPI, series, GDP, CPI, labor, rates, sentiment, overview responses
- [x] Formatters: formatCurrency, formatPercent, formatLargeNumber, formatDate
**Verification:** Types compile without errors, imports work

### Task 3: Layout Shell — Header + Tab Navigation + Footer
**Description:** Build the app shell with sticky header (logo + title), 3-tab navigation (Overview | Labor & Economy | Markets & Sectors), and minimal footer.
**Files:**
- `frontend/app/layout.tsx` (update)
- `frontend/components/Header.tsx`
- `frontend/components/TabNavigation.tsx`
- `frontend/components/Footer.tsx`
- `frontend/app/page.tsx` (Overview tab — default)
- `frontend/app/labor/page.tsx` (placeholder)
- `frontend/app/markets/page.tsx` (placeholder)
**Acceptance Criteria:**
- [x] Header is sticky, shows "US Market Pulse" title
- [x] Tab navigation highlights active tab
- [x] Tabs route to /, /labor, /markets
- [x] Footer shows data source attribution
- [x] Page background is #F9FAFB, max-w-7xl centered
- [x] Responsive: works on desktop (1280px+)
**Verification:** Visual inspection, tab switching works

### Task 4: KPI Strip with Sparklines
**Description:** Build KPI strip component showing 4 KPIs (GDP, CPI, Unemployment, Fed Rate) with current value, change indicator (color-coded), period label, and sparkline mini-charts.
**Files:**
- `frontend/components/KpiStrip.tsx`
- `frontend/components/KpiCard.tsx`
- `frontend/components/Sparkline.tsx`
**Acceptance Criteria:**
- [x] Fetches data from /api/v1/kpi/summary
- [x] Shows 4 KPIs in a row (grid)
- [x] Each KPI: label, value (formatted), change with arrow, sparkline
- [x] Color coding: green for positive change (when positive_is_good), red for negative
- [x] Sparkline: 80x32px Nivo ResponsiveLine, no axes/grid
- [x] NO card borders — plain numbers on white bg (Scalix style)
- [x] KPI values: 28-32px, weight 700, DM Sans
**Verification:** KPI strip renders with real data from API

### Task 5: GDP Charts — Waterfall + Quarterly Bar
**Description:** Build GDP waterfall chart (components breakdown) and quarterly GDP growth bar chart.
**Files:**
- `frontend/components/charts/GdpWaterfall.tsx`
- `frontend/components/charts/GdpQuarterly.tsx`
**Acceptance Criteria:**
- [x] GdpWaterfall: fetches /api/v1/gdp/components, shows GDP component contributions
- [x] GdpQuarterly: fetches /api/v1/gdp/quarterly, shows quarterly GDP growth as bar chart
- [x] Both use Nivo theme, responsive containers
- [x] Card wrapper: rounded-2xl, white bg, shadow-sm, p-5
- [x] Card title: uppercase, 10-11px, weight 600, letter-spacing wide
**Verification:** Charts render with real data

### Task 6: CPI Calendar + Economic Funnel
**Description:** Build CPI calendar heatmap and economic funnel (labor market pipeline).
**Files:**
- `frontend/components/charts/CpiCalendar.tsx`
- `frontend/components/charts/EconomicFunnel.tsx`
**Acceptance Criteria:**
- [x] CpiCalendar: fetches /api/v1/cpi/calendar, shows YoY inflation as calendar heatmap
- [x] EconomicFunnel: fetches /api/v1/labor/funnel, shows labor market stages
- [x] Both use Nivo theme, responsive containers
- [x] Card wrapper with title styling per design brief
**Verification:** Charts render with real data

### Task 7: Bullet Targets + GDP Waffle
**Description:** Build bullet chart for KPI targets and waffle chart for GDP sector composition.
**Files:**
- `frontend/components/charts/BulletTargets.tsx`
- `frontend/components/charts/GdpWaffle.tsx`
**Acceptance Criteria:**
- [x] BulletTargets: shows KPI actual vs target using Nivo Bullet
- [x] GdpWaffle: fetches /api/v1/sectors/gdp, shows sector shares as waffle grid
- [x] Both use Nivo theme, responsive containers
- [x] Card wrapper with title styling per design brief
**Verification:** Charts render with data

### Task 8: Overview Page Assembly + Loading States
**Description:** Assemble all Tab 1 components into the Overview page with proper grid layout, loading skeletons, and error states.
**Files:**
- `frontend/app/page.tsx` (update)
- `frontend/components/ChartCard.tsx`
- `frontend/components/LoadingSkeleton.tsx`
**Acceptance Criteria:**
- [x] Overview page shows: KPI Strip (top) → 2-column grid of 6 charts
- [x] Loading skeletons while data fetches
- [x] Error state if API is unreachable
- [x] Grid layout: 2 columns on desktop, 1 on mobile
- [x] All charts inside ChartCard wrapper (consistent styling)
**Verification:** Full page renders with all components, loading states work

### Task 9: Environment Config + CORS
**Description:** Configure environment variables for API URL, update backend CORS to allow frontend origin.
**Files:**
- `frontend/.env.local`
- `frontend/.env.example`
- Update backend CORS if needed
**Acceptance Criteria:**
- [x] NEXT_PUBLIC_API_URL env var configured
- [x] .env.example documents required vars
- [x] Backend CORS allows frontend origin
- [x] API calls work in development (localhost) and production
**Verification:** No CORS errors in browser console

### Task 10: Basic Frontend Tests
**Description:** Write basic tests for key components and utilities.
**Files:**
- `frontend/__tests__/formatters.test.ts`
- `frontend/__tests__/KpiStrip.test.tsx`
- `frontend/__tests__/api.test.ts`
**Acceptance Criteria:**
- [x] Formatter tests: currency, percent, large numbers, dates
- [x] KpiStrip renders without errors with mock data
- [x] API client tests with mocked fetch
- [x] All tests pass with `npm test`
**Verification:** `npm test` passes

---

## Execution Order
1. Task 1 (project setup) — foundation
2. Task 2 (theme, API, types) — depends on Task 1
3. Task 9 (env config) — can run parallel with Task 2
4. Task 3 (layout shell) — depends on Task 1
5. Task 4 (KPI strip) — depends on Tasks 2, 3
6. Tasks 5, 6, 7 (charts) — depend on Task 2, can run in parallel
7. Task 8 (page assembly) — depends on Tasks 4-7
8. Task 10 (tests) — depends on Tasks 4-8

## Estimated Scope
- 10 tasks, ~25-30 new files
- All frontend code in `frontend/` directory
