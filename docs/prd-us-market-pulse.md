# PRD: US Market Pulse v2 (FINAL — Approved)

> **Project:** US Market Pulse — Economy & Market Intelligence Dashboard
> **Author:** Dmitrii Vasichev
> **Date:** March 10, 2026 (v2)
> **Status:** ✅ APPROVED — Ready for implementation
> **Language:** All project artifacts in English, communication in Russian
> **Design reference:** Scalix SaaS Dashboard (Dribbble) — clean white cards, airy spacing, diverse chart types on one screen
> **Mockup reference:** `US_Market_Pulse_v3.jsx` (layout structure; charts will be rebuilt with Nivo)

---

## 1. Overview

### 1.1 What
A public interactive dashboard visualizing key US economic indicators using **12+ distinct chart types** powered by the Nivo visualization library. Data auto-updates daily via GitHub Actions from official US government sources (FRED, BLS, Census).

### 1.2 Why
Portfolio piece demonstrating:
- Classic BI/data engineering: ETL from government APIs → PostgreSQL → FastAPI → interactive dashboard
- **12+ distinct visualization types** — shows mastery of data visualization
- Business-relevant KPIs that executives and analysts track daily
- Full-stack production app using AI-assisted development
- Live URL for LinkedIn, Upwork, recruiter conversations

### 1.3 Success Criteria
- Live URL, page load <3s
- Daily auto-update without manual intervention
- **12+ distinct chart/visualization types** (portfolio showpiece)
- Professional, polished UI inspired by Scalix design language
- Mobile-responsive
- Clean GitHub repo with comprehensive README

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js + TypeScript | Matches existing projects |
| **Charts** | **Nivo** (`@nivo/*`) | 30+ chart types, beautiful animations, built-in color schemes, responsive |
| **Styling** | Tailwind CSS | Fast development, matches Scalix aesthetic |
| **Backend** | FastAPI (Python) | Matches existing stack, ideal for data processing |
| **Database** | PostgreSQL | Time-series storage, matches existing stack |
| **Data Collection** | Python (requests, pandas) | ETL pipeline |
| **Scheduler** | GitHub Actions cron | Free for public repos |
| **Deploy Frontend** | Vercel | Matches existing workflow |
| **Deploy Backend** | Railway | Matches existing workflow |
| **Repository** | `us-market-pulse` (new, public) | Standalone portfolio project |

### Nivo Packages to Install
```bash
npm install @nivo/core @nivo/line @nivo/bar @nivo/pie @nivo/funnel @nivo/calendar @nivo/heatmap @nivo/treemap @nivo/bump @nivo/bullet @nivo/waffle @nivo/radar @nivo/scatterplot @nivo/radial-bar @nivo/tooltip
```

---

## 3. Data Sources

### FRED API (Primary — covers ~90% of data needs)
- **URL:** `https://api.stlouisfed.org/fred/series/observations`
- **Auth:** Free API key (instant registration)
- **Rate limit:** 120 req/min

| ID | Name | Freq | Used In |
|----|------|------|---------|
| GDP | Real GDP | Quarterly | KPI, waterfall, bar |
| CPIAUCSL | CPI (inflation) | Monthly | KPI, calendar heatmap |
| UNRATE | Unemployment Rate | Monthly | KPI, bump, bullet |
| FEDFUNDS | Fed Funds Rate | Daily | KPI, line |
| MORTGAGE30US | 30Y Mortgage Rate | Weekly | Line |
| DGS10 | 10Y Treasury Yield | Daily | Line |
| MSPUS | Median Home Sale Price | Quarterly | Composed |
| HOUST | Housing Starts | Monthly | Composed |
| RSAFS | Retail Sales | Monthly | Bar, waffle |
| PAYEMS | Nonfarm Payrolls | Monthly | Composed, bullet |
| DCOILWTICO | Crude Oil (WTI) | Daily | Line |
| SP500 | S&P 500 | Daily | Area |
| UMCSENT | Consumer Sentiment | Monthly | Radial bar |
| JTSJOL | Job Openings (JOLTS) | Monthly | Funnel, line |
| INDPRO | Industrial Production | Monthly | Line |
| A191RL1Q225SBEA | GDP contributions by component | Quarterly | Waterfall |

### BLS API (Supplementary) — CPI by category, wages by industry
### Census API (Supplementary) — State-level GDP for bubble/scatter

---

## 4. Database Schema

```sql
CREATE TABLE economic_series (
    id SERIAL PRIMARY KEY,
    series_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    value DECIMAL(20, 4),
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(series_id, date)
);

CREATE TABLE series_metadata (
    id SERIAL PRIMARY KEY,
    series_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    units VARCHAR(200),
    frequency VARCHAR(50),
    seasonal_adjustment VARCHAR(100),
    source VARCHAR(200),
    category VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    last_updated DATE
);

CREATE TABLE collection_runs (
    id SERIAL PRIMARY KEY,
    run_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL,
    series_collected INTEGER,
    records_inserted INTEGER,
    error_message TEXT,
    duration_seconds FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kpi_snapshots (
    id SERIAL PRIMARY KEY,
    computed_at TIMESTAMPTZ NOT NULL,
    kpi_key VARCHAR(50) NOT NULL,
    current_value DECIMAL(20, 4),
    previous_value DECIMAL(20, 4),
    change_absolute DECIMAL(20, 4),
    change_percent DECIMAL(10, 4),
    period_label VARCHAR(100),
    UNIQUE(computed_at, kpi_key)
);
```

---

## 5. API Endpoints

```
GET /api/v1/kpi/summary              → KPI cards + sparkline data
GET /api/v1/series/{series_id}       → Time series (?start=&end=)
GET /api/v1/series/multi             → Multiple series (?ids=UNRATE,PAYEMS)
GET /api/v1/gdp/components           → GDP breakdown for waterfall
GET /api/v1/gdp/quarterly            → GDP quarterly growth for bar chart
GET /api/v1/cpi/calendar             → CPI daily/monthly for calendar heatmap
GET /api/v1/cpi/categories           → CPI by category for waffle
GET /api/v1/labor/funnel             → Labor market funnel data
GET /api/v1/labor/ranking            → Monthly unemployment rankings for bump
GET /api/v1/states/comparison        → State-level for scatter/bubble
GET /api/v1/rates/history            → Fed+Mortgage+Treasury for multi-line
GET /api/v1/sectors/gdp              → GDP by sector for treemap
GET /api/v1/sentiment/radial         → Consumer sentiment for radial bar
GET /api/v1/overview                 → Full overview payload (optimized)
GET /api/v1/meta/last-update         → Last collection timestamp
GET /api/v1/meta/series              → All tracked series metadata
```

---

## 6. DESIGN BRIEF — Exact Layout & Chart Specification

### 6.1 Design System

**Inspired by:** Scalix SaaS Dashboard (Dribbble reference)
- Clean white cards on light gray background
- Generous whitespace, airy layout
- Diverse chart types visible at once
- Subtle shadows, thin borders
- KPIs as clean numbers (not boxed heavy), with colored deltas

**Colors:**
```
--bg:          #F9FAFB (very light gray)
--card:        #FFFFFF
--card-border: #F3F4F6 (almost invisible)
--card-shadow: 0 1px 3px rgba(0,0,0,0.04)
--text-primary:   #111827
--text-secondary: #6B7280  
--text-muted:     #9CA3AF
--accent-blue:    #3B82F6
--accent-green:   #10B981
--accent-red:     #EF4444
--accent-amber:   #F59E0B
--accent-purple:  #8B5CF6
--accent-pink:    #EC4899
--accent-orange:  #F97316
```

**Nivo color scheme:** Use `'set2'` or `'paired'` for multi-series charts. Custom single-color gradients for area/line.

**Typography:**
- Font: `DM Sans` (load from Google Fonts) — clean, modern, distinctive
- KPI values: 28-32px, font-weight 700
- Labels: 11px, font-weight 600, uppercase tracking-wide, text-muted
- Axis labels: 10-11px, text-secondary

**Cards:**
- `bg-white rounded-2xl border border-gray-100 shadow-sm p-5`
- Hover: `shadow-md` transition
- Title: uppercase, tracking-wide, 10-11px, muted color, with optional "View more" link

### 6.2 Page Structure

3 tabs. Header sticky with tab navigation. Footer with tech credits.

```
┌──────────────────────────────────────────────────────┐
│ [US] US Market Pulse           ● Updated Mar 10 2026 │
│ [Overview]  [Labor & Economy]  [Markets & Sectors]   │
├──────────────────────────────────────────────────────┤
│ Content area (max-w-7xl)                             │
├──────────────────────────────────────────────────────┤
│ Footer: FastAPI + Next.js + Nivo | FRED · BLS        │
└──────────────────────────────────────────────────────┘
```

---

### 6.3 Tab 1: Economic Overview

**Row 1 — KPI Strip (no cards, Scalix style)**
```
Total GDP          Inflation Rate       Unemployment       Fed Funds Rate
$28.27T            3.1% YoY             4.0%               4.25%
↗ 2.3% QoQ         ↘ -0.2pp             ↗ +0.1pp           ↘ -50bp YTD
```
- Style like Scalix: plain numbers on white bg, no card borders for KPIs
- Colored arrows: green/red based on economic meaning (see Section 9)
- Small sparkline BELOW each number (Nivo `@nivo/line` mini, 80px × 32px)
- Period label in muted text

**Row 2 — GDP Waterfall (2/3) + GDP Quarterly Bar (1/3)**
```
┌─────────────────────────────────┐ ┌───────────────────┐
│ GDP COMPONENTS — WATERFALL      │ │ GDP QUARTERLY     │
│ @nivo/bar (horizontal/vertical) │ │ @nivo/bar         │
│ Blue+ / Red- / Green=Total      │ │ 8 quarters        │
│ Animated entry                  │ │ Color by strength │
└─────────────────────────────────┘ └───────────────────┘
```
- **Waterfall:** `@nivo/bar` with custom colors per bar. Positive = blue shades, negative = red, total = green. Labels on bars showing `+X.Xpp`.
- **GDP Bar:** `@nivo/bar` with gradient fill. Taller bars = darker blue.

**Row 3 — Bullet Chart (1/2) + Calendar Heatmap (1/2)**
```
┌─────────────────────────────────┐ ┌───────────────────────────────┐
│ TARGETS vs ACTUAL — BULLET      │ │ CPI INFLATION — CALENDAR      │
│ @nivo/bullet                    │ │ @nivo/calendar                │
│ 4 metrics: GDP, CPI, Unemp,    │ │ GitHub-style calendar         │
│ Payrolls                        │ │ Color: green(low) → red(high) │
│ Built-in Nivo bullet chart!     │ │ 2 years of daily-ish data     │
└─────────────────────────────────┘ └───────────────────────────────┘
```
- **Bullet:** `@nivo/bullet` — ranges (poor/ok/good), measures (actual), markers (target). Horizontal layout.
- **Calendar:** `@nivo/calendar` — 2 years. Each day colored by CPI level. Green = near 2% target, red = high. Exactly like GitHub contribution chart but for inflation.

**Row 4 — Funnel (1/2) + Waffle (1/2)**
```
┌─────────────────────────────────┐ ┌───────────────────────────────┐
│ ECONOMIC FLOW — FUNNEL          │ │ GDP COMPOSITION — WAFFLE      │
│ @nivo/funnel                    │ │ @nivo/waffle                  │
│ GDP → Consumer → Business →     │ │ Grid of colored squares       │
│ Government → Net Exports        │ │ Each square = % of GDP        │
│ Like Scalix funnel reference    │ │ By sector (Services, Mfg...)  │
└─────────────────────────────────┘ └───────────────────────────────┘
```
- **Funnel:** `@nivo/funnel` with smooth interpolation. Shows how GDP flows: Total economy → Consumer spending → Business → Government → Net exports. Gradient orange like Scalix reference.
- **Waffle:** `@nivo/waffle` — 10×10 grid (100 squares), each colored by sector. Visual way to show "52% services, 19% government..." More interesting than pie chart.

---

### 6.4 Tab 2: Labor & Economy

**Row 1 — Bump Chart: Unemployment Rankings (full width)**
```
┌──────────────────────────────────────────────────────┐
│ UNEMPLOYMENT RANKING BY STATE — BUMP CHART           │
│ @nivo/bump                                           │
│ Shows how states change ranking over 12 months       │
│ Colorado highlighted                                 │
│ Beautiful flowing lines showing rank changes          │
└──────────────────────────────────────────────────────┘
```
- **Bump:** `@nivo/bump` — 8-10 states, 12 months. Each line = one state. When lines cross = ranking changed. Colorado in bold/red. Gorgeous flowing visualization.

**Row 2 — Dual-axis: Unemployment + Payrolls (full width)**
```
┌──────────────────────────────────────────────────────┐
│ UNEMPLOYMENT RATE vs PAYROLLS                        │
│ @nivo/line (unemployment) overlaid on @nivo/bar      │
│ Or: use @nivo/line with two Y-axes                   │
│ 12 months                                            │
└──────────────────────────────────────────────────────┘
```
- Since Nivo doesn't have native ComposedChart, use `@nivo/bar` for payrolls + overlay `@nivo/line` for unemployment, OR use `@nivo/line` with area fill for one metric.

**Row 3 — Heatmap: CPI by Category (1/2) + Scatter: States (1/2)**
```
┌─────────────────────────────────┐ ┌───────────────────────────────┐
│ CPI BY CATEGORY — HEATMAP       │ │ STATE COMPARISON — SCATTER    │
│ @nivo/heatmap                   │ │ @nivo/scatterplot             │
│ Rows: Food, Housing, Transport, │ │ X: Unemployment               │
│ Medical, Energy, Apparel        │ │ Y: GDP                        │
│ Cols: months                    │ │ Size: Population              │
│ Color: diverging scale          │ │ Colorado = red highlight      │
└─────────────────────────────────┘ └───────────────────────────────┘
```
- **Heatmap:** `@nivo/heatmap` — rows = CPI categories, columns = months. Color intensity = inflation rate. Shows which sectors drive inflation.
- **Scatter:** `@nivo/scatterplot` with node size = population. Custom tooltip per state. Colorado highlighted.

**Row 4 — Table: Labor Market Summary**

---

### 6.5 Tab 3: Markets & Sectors

**Row 1 — Interest Rates Multi-line (full width)**
```
┌──────────────────────────────────────────────────────┐
│ INTEREST RATES — FED POLICY vs MARKET RATES          │
│ @nivo/line                                           │
│ 3 lines: Fed Funds (step), Mortgage (solid),         │
│ Treasury (dashed)                                    │
│ Point layer for FOMC meeting dates                   │
└──────────────────────────────────────────────────────┘
```
- `@nivo/line` with `curve: 'step'` for Fed Funds, `'monotoneX'` for others. Enable area fill for Fed Funds. Add custom point layer marking FOMC meeting dates.

**Row 2 — Treemap (1/2) + Radial Bar (1/2)**
```
┌─────────────────────────────────┐ ┌───────────────────────────────┐
│ GDP BY SECTOR — TREEMAP         │ │ CONSUMER SENTIMENT — RADIAL   │
│ @nivo/treemap                   │ │ @nivo/radial-bar              │
│ Colored nested rectangles       │ │ Circular progress bars        │
│ Services > Manufacturing > ...  │ │ Current: 67.8 / 100           │
│ Label + percentage inside       │ │ vs 6mo ago, vs 1yr ago        │
└─────────────────────────────────┘ └───────────────────────────────┘
```
- **Treemap:** `@nivo/treemap` — nested, colored by sector. Labels inside cells. Animated transitions.
- **Radial Bar:** `@nivo/radial-bar` — 3 concentric rings: current month, 6 months ago, 1 year ago. Shows sentiment recovery/decline visually.

**Row 3 — Housing Dual-axis (1/2) + S&P 500 Area (1/2)**
```
┌─────────────────────────────────┐ ┌───────────────────────────────┐
│ HOUSING — PRICE & STARTS        │ │ S&P 500 — AREA CHART          │
│ @nivo/bar (starts) +            │ │ @nivo/line with area fill     │
│ @nivo/line overlay (price)      │ │ Gradient fill, YTD            │
│ Or: @nivo/line with 2 series    │ │ Green if YTD positive         │
└─────────────────────────────────┘ └───────────────────────────────┘
```

**Row 4 — Table: Market Indicators Summary**

---

## 7. Visualization Types Summary (12+ types)

| # | Type | Nivo Package | Where | Visual Impact |
|---|------|-------------|-------|---------------|
| 1 | KPI + Mini Sparkline | `@nivo/line` (tiny) | Tab 1, Row 1 | Clean numbers with trend |
| 2 | Waterfall Bar | `@nivo/bar` (custom colors) | Tab 1, Row 2 | GDP decomposition |
| 3 | Bar Chart | `@nivo/bar` | Tab 1, Row 2 | Quarterly GDP |
| 4 | Bullet Chart | `@nivo/bullet` | Tab 1, Row 3 | Targets vs actual |
| 5 | Calendar Heatmap | `@nivo/calendar` | Tab 1, Row 3 | GitHub-style CPI calendar |
| 6 | Funnel | `@nivo/funnel` | Tab 1, Row 4 | Economic flow (Scalix-style!) |
| 7 | Waffle | `@nivo/waffle` | Tab 1, Row 4 | GDP composition grid |
| 8 | Bump Chart | `@nivo/bump` | Tab 2, Row 1 | State unemployment ranking |
| 9 | Line/Area overlay | `@nivo/line` + `@nivo/bar` | Tab 2, Row 2 | Unemployment + Payrolls |
| 10 | Heatmap | `@nivo/heatmap` | Tab 2, Row 3 | CPI by category × month |
| 11 | Scatter/Bubble | `@nivo/scatterplot` | Tab 2, Row 3 | State GDP vs unemployment |
| 12 | Multi-line (curves) | `@nivo/line` | Tab 3, Row 1 | Interest rates |
| 13 | Treemap | `@nivo/treemap` | Tab 3, Row 2 | GDP sectors |
| 14 | Radial Bar | `@nivo/radial-bar` | Tab 3, Row 2 | Consumer sentiment |
| + | Data Tables | Custom HTML | All tabs | Summary tables |

**Total: 14 distinct visualization types + data tables**

---

## 8. Data Collection Pipeline

### Collection (`data_collector.py`)
```
Trigger: GitHub Actions cron daily at 06:00 UTC

1. Connect to PostgreSQL (Railway)
2. For each active series in series_metadata:
   GET FRED: /fred/series/observations?series_id={id}&sort_order=desc&limit=30
   UPSERT into economic_series
3. Compute KPI snapshots
4. Log to collection_runs
```

### Backfill (`backfill.py`)
- 5 years of history for all series (one-time run)

### GitHub Actions
```yaml
name: Daily Data Collection
on:
  schedule:
    - cron: '0 6 * * *'
  workflow_dispatch:
jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r requirements-collector.txt
      - run: python scripts/data_collector.py
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          FRED_API_KEY: ${{ secrets.FRED_API_KEY }}
```

---

## 9. KPI Color Logic

| Indicator | Number Up | Color | Logic |
|-----------|-----------|-------|-------|
| GDP Growth | ▲ | 🟢 Green | Growth = good |
| Inflation | ▲ | 🔴 Red | Rising inflation = bad |
| Inflation | ▼ | 🟢 Green | Falling = good |
| Unemployment | ▲ | 🔴 Red | Rising = bad |
| Unemployment | ▼ | 🟢 Green | Falling = good |
| Fed Rate | ▼ | 🟢 Green | Easing = positive |
| Payrolls | ▲ | 🟢 Green | More jobs = good |
| Sentiment | ▲ | 🟢 Green | Confidence = good |
| Oil Price | ▼ | 🟢 Green | Lower cost = good |

---

## 10. Project Structure

```
us-market-pulse/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Tab 1: Overview
│   │   │   ├── labor/page.tsx        # Tab 2: Labor
│   │   │   ├── markets/page.tsx      # Tab 3: Markets
│   │   │   └── layout.tsx            # Header + tabs + footer
│   │   ├── components/
│   │   │   ├── kpi/
│   │   │   │   └── KpiStrip.tsx      # 4 KPIs with sparklines
│   │   │   ├── charts/
│   │   │   │   ├── GdpWaterfall.tsx   # @nivo/bar waterfall
│   │   │   │   ├── GdpQuarterly.tsx   # @nivo/bar simple
│   │   │   │   ├── BulletTargets.tsx  # @nivo/bullet
│   │   │   │   ├── CpiCalendar.tsx    # @nivo/calendar
│   │   │   │   ├── EconomicFunnel.tsx # @nivo/funnel
│   │   │   │   ├── GdpWaffle.tsx      # @nivo/waffle
│   │   │   │   ├── UnemploymentBump.tsx # @nivo/bump
│   │   │   │   ├── LaborComposed.tsx  # @nivo/line + @nivo/bar
│   │   │   │   ├── CpiHeatmap.tsx     # @nivo/heatmap
│   │   │   │   ├── StateScatter.tsx   # @nivo/scatterplot
│   │   │   │   ├── RatesLine.tsx      # @nivo/line multi
│   │   │   │   ├── SectorTreemap.tsx  # @nivo/treemap
│   │   │   │   ├── SentimentRadial.tsx # @nivo/radial-bar
│   │   │   │   ├── HousingComposed.tsx # bar + line overlay
│   │   │   │   └── Sp500Area.tsx      # @nivo/line area
│   │   │   └── DataTable.tsx          # Reusable table
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── formatters.ts
│   │   │   └── theme.ts              # Nivo theme config
│   │   └── types/index.ts
│   ├── package.json
│   └── tailwind.config.ts
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/v1/
│   │   │   ├── kpi.py
│   │   │   ├── series.py
│   │   │   ├── gdp.py
│   │   │   ├── cpi.py
│   │   │   ├── labor.py
│   │   │   ├── states.py
│   │   │   ├── rates.py
│   │   │   ├── sectors.py
│   │   │   └── meta.py
│   │   ├── models/schemas.py
│   │   ├── db/database.py
│   │   ├── db/queries.py
│   │   ├── services/kpi_calculator.py
│   │   └── config.py
│   ├── requirements.txt
│   └── Dockerfile
├── scripts/
│   ├── data_collector.py
│   ├── backfill.py
│   └── seed_metadata.py
├── .github/workflows/collect-data.yml
├── README.md
└── .gitignore
```

---

## 11. Implementation Phases

### Phase 1: Backend + Data (Day 1)
1. Init repo, FastAPI structure
2. PostgreSQL on Railway, migrations
3. FRED API key registration
4. `seed_metadata.py` — 16 series
5. `data_collector.py` — FRED fetch + upsert
6. `backfill.py` — 5 years
7. KPI calculator + all API endpoints
8. Deploy backend to Railway

### Phase 2: Frontend + Charts (Day 2-3)
1. Next.js + Tailwind + Nivo packages install
2. Create `theme.ts` with Nivo theme matching design system
3. Layout with sticky header, DM Sans font, tab navigation
4. Tab 1: KpiStrip, GdpWaterfall, GdpQuarterly, BulletTargets, CpiCalendar, EconomicFunnel, GdpWaffle
5. Tab 2: UnemploymentBump, LaborComposed, CpiHeatmap, StateScatter, DataTable
6. Tab 3: RatesLine, SectorTreemap, SentimentRadial, HousingComposed, Sp500Area, DataTable
7. Mobile responsive

### Phase 3: Deploy + Polish (Day 3-4)
1. Vercel deploy
2. GitHub Actions cron
3. Full pipeline test
4. Open Graph meta tags (screenshot as preview)
5. README with screenshot, architecture, tech stack
6. Lighthouse audit, loading skeletons, error states

---

## 12. Non-Functional Requirements

- Page load <3s, API <500ms
- 99%+ availability
- SEO: meta + Open Graph
- Responsive mobile-first
- Error: cached data + "last updated" notice
- Cost: ~$0 GH Actions + ~$5/mo Railway + $0 Vercel

---

## 13. Out of Scope (MVP)

- Authentication, dark mode, data export
- Custom date range picker
- Email/Telegram alerts
- International comparison
- Forecasting models
- Regional data

---

## 14. Notes for Claude Code

### Critical Implementation Notes
- **Use `/workflow`** for 8-step pipeline
- **Russian for communication, English for all artifacts**
- **Opus for architecture, Sonnet for implementation**
- **Nivo, NOT Recharts** — all charts from `@nivo/*` packages
- **Design reference: Scalix** — clean white, airy, diverse chart types at once
- **DM Sans font** — load from Google Fonts in layout.tsx
- **Every chart in its own component file** — see project structure
- **Create `theme.ts`** — shared Nivo theme (font, colors, tooltip style) for consistency across all charts
- **KPI strip WITHOUT card borders** — plain numbers on white background, like Scalix
- **Sparklines in KPIs: 80px × 32px, NOT stretched**
- **Delta colors: see Section 9** — unemployment rising = RED, inflation falling = GREEN
- **Nivo responsive wrappers** — always use `Responsive*` variants (ResponsiveBar, ResponsiveLine, etc.)
- **Nivo animate** — enable `animate={true}` on all charts for smooth transitions

### API Testing
```bash
# FRED
curl "https://api.stlouisfed.org/fred/series/observations?series_id=UNRATE&api_key=YOUR_KEY&file_type=json&sort_order=desc&limit=5"

# Nivo docs for each chart type
# https://nivo.rocks/bar/
# https://nivo.rocks/line/
# https://nivo.rocks/funnel/
# https://nivo.rocks/calendar/
# https://nivo.rocks/bump/
# https://nivo.rocks/bullet/
# https://nivo.rocks/waffle/
# https://nivo.rocks/heatmap/
# https://nivo.rocks/treemap/
# https://nivo.rocks/scatterplot/
# https://nivo.rocks/radial-bar/
```

### Nivo Theme Template
```typescript
// lib/theme.ts
export const nivoTheme = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 11,
  textColor: '#6B7280',
  grid: { line: { stroke: '#F3F4F6', strokeWidth: 1 } },
  axis: {
    ticks: { text: { fontSize: 10, fill: '#9CA3AF' } },
    legend: { text: { fontSize: 11, fill: '#6B7280', fontWeight: 600 } },
  },
  tooltip: {
    container: {
      background: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      border: '1px solid #F3F4F6',
      fontSize: '12px',
      fontFamily: 'DM Sans, sans-serif',
    },
  },
  labels: { text: { fontSize: 11, fontWeight: 600 } },
};
```
