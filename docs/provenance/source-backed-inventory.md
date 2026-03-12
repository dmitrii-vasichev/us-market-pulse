# Source-Backed Dashboard Provenance Inventory

**Date:** 2026-03-12  
**Status:** Active baseline with Phase 2 contract addendum  
**Phase:** Source-Backed Remediation Phase 1 audit, updated during Phase 2 / Task 1  
**Reference PRD:** `docs/prd-source-backed-dashboard-remediation.md`

## Scope

This inventory audits every public chart placement currently rendered on:

- `frontend/src/app/page.tsx`
- `frontend/src/app/labor/page.tsx`
- `frontend/src/app/markets/page.tsx`

The goal is to document, for each placement:

- a stable chart ID for future manifest enforcement
- the page location and frontend component in use
- the API endpoint currently backing the chart
- the current source/date claim visible in the UI
- the actual upstream dataset or inline approximation behind the payload
- the current storage path in the repository/database
- the methodology classification required by the remediation PRD
- the remediation status and integrity gap

## Methodology Legend

- `source_backed`: rendered from traceable ingested observations already stored by the application
- `derived`: built from source-backed inputs, but transformed with explicit calculation logic that is not raw source output
- `illustrative`: currently backed by hardcoded or approximate values and not acceptable for public production after remediation

## Placement Summary

- 16 public chart placements audited
- 7 placements currently qualify as `source_backed`
- 4 placements currently qualify as `derived`
- 5 placements currently qualify as `illustrative`
- 15 of 16 placements still hardcode source/date text in the frontend
- `labor.unemployment-bump` is the only current placement already consuming backend-provided source/latest-month metadata

## Shared Component Map

| Component | Placements | Inventory Risk |
| --- | --- | --- |
| `CpiCalendar` | `overview.cpi-calendar`, `labor.cpi-calendar` | One provenance fix must update two page placements consistently. |
| `EconomicFunnel` | `overview.economic-funnel`, `labor.economic-funnel` | One derived methodology gap is repeated on two pages. |
| `GdpWaffle` | `overview.gdp-waffle`, `markets.gdp-waffle` | One illustrative endpoint creates two misleading public placements. |

## Inventory

### Overview

| Chart ID | Location | Component | Endpoint | Current source/date claim | Actual upstream dataset | Storage path | Methodology | Remediation status | Integrity gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `overview.gdp-waterfall` | Overview / grid card 1 | `GdpWaterfall` | `/api/v1/gdp/components` | `Source: BEA · Q4 2025` | `A191RL1Q225SBEA` from `economic_series`, redistributed into hardcoded 45/25/15/-5/20 component shares in `backend/app/api/v1/gdp.py` | `economic_series` + `series_metadata` for `A191RL1Q225SBEA` | `derived` | Reclassify as derived and add methodology note in Phase 3 | UI implies direct BEA component observations, but backend fabricates component contributions from a single stored growth series. |
| `overview.gdp-quarterly` | Overview / grid card 2 | `GdpQuarterly` | `/api/v1/gdp/quarterly` | `Source: BEA · Q4 2025` | Stored quarterly growth series `A191RL1Q225SBEA` (seeded as `source = FRED`, BEA-origin economic release) | `economic_series` + `series_metadata` for `A191RL1Q225SBEA` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Data is traceable, but the source/date footer is hardcoded in the frontend instead of coming from the payload. |
| `overview.cpi-calendar` | Overview / grid card 3 | `CpiCalendar` | `/api/v1/cpi/calendar` | `Source: BLS · Jan 2026` | Stored monthly CPI index `CPIAUCSL` transformed into YoY values at response time | `economic_series` + `series_metadata` for `CPIAUCSL` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Underlying data is stored and traceable, but the displayed month is hardcoded and never validated against the payload. |
| `overview.economic-funnel` | Overview / grid card 4 | `EconomicFunnel` | `/api/v1/labor/funnel` | `Source: BEA, BLS · Q4 2025` | Stored GDP level `GDP` multiplied by fixed stage shares (`0.68`, `0.18`, `0.17`, `0.03`) in backend code | `economic_series` + `series_metadata` for `GDP`; no persisted funnel dataset | `derived` | Reclassify as derived and document methodology in Phase 3 | Footer claims BEA and BLS inputs, but the backend only reads GDP and synthesizes the rest of the funnel. |
| `overview.bullet-targets` | Overview / grid card 5 | `BulletTargets` | `/api/v1/kpi/summary` plus frontend target map | `Source: Federal Reserve · Mar 2026` | KPI summary derived from stored `GDP`, `CPIAUCSL`, `UNRATE`, and `FEDFUNDS`; target thresholds are hardcoded in `frontend/src/components/charts/BulletTargets.tsx` | `economic_series` + `series_metadata` for KPI series; hardcoded target thresholds in frontend | `derived` | Reclassify as derived; move provenance and target logic under explicit methodology | Footer implies a single Federal Reserve source, but the chart mixes multiple stored series with frontend-only target assumptions. |
| `overview.gdp-waffle` | Overview / grid card 6 | `GdpWaffle` | `/api/v1/sectors/gdp` | `Source: BEA · Q4 2025` | Inline approximate GDP sector tree returned directly from backend code | No persisted dataset; inline values in `backend/app/api/v1/sectors.py` | `illustrative` | Replace with sourced implementation or hide from public production in Phase 2 | Public UI presents official-looking BEA attribution while the endpoint returns hardcoded percentages. |

### Labor

| Chart ID | Location | Component | Endpoint | Current source/date claim | Actual upstream dataset | Storage path | Methodology | Remediation status | Integrity gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `labor.unemployment-bump` | Labor / hero card | `UnemploymentBump` | `/api/v1/labor/ranking` | Dynamic payload value, currently `Source: BLS · <latest month>` | Ten state unemployment series (`LASST...`) ranked from stored monthly observations; falls back to live BLS API if the database has no complete set | `economic_series` + `series_metadata` for BLS state series; optional runtime BLS API fallback | `source_backed` | Keep public; formalize provenance fields in shared contract | This is the only placement already using payload-driven source/date, but methodology type is missing and the fallback path is implicit rather than explicitly classified. |
| `labor.cpi-heatmap` | Labor / grid card 2 | `CpiHeatmap` | `/api/v1/cpi/categories` | `Source: BLS · Jan 2026` | Inline approximate CPI category weights returned directly from backend code | No persisted dataset; inline values in `backend/app/api/v1/cpi.py` | `illustrative` | Replace with sourced implementation or hide from public production in Phase 2 | The UI claims a current BLS release, but the endpoint serves a fixed static category list with no ingested dataset behind it. |
| `labor.state-scatter` | Labor / grid card 3 | `StateScatter` | `/api/v1/states/comparison` | `Source: BEA, BLS · 2024` | Inline approximate state unemployment, GDP-per-capita, and population values returned directly from backend code | No persisted dataset; inline values in `backend/app/api/v1/states.py` | `illustrative` | Replace with sourced implementation or hide from public production in Phase 2 | Footer implies official BEA/BLS-backed state comparisons, but the scatter is built from hardcoded sample rows. |
| `labor.economic-funnel` | Labor / grid card 4 | `EconomicFunnel` | `/api/v1/labor/funnel` | `Source: BEA, BLS · Q4 2025` | Stored GDP level `GDP` multiplied by fixed stage shares (`0.68`, `0.18`, `0.17`, `0.03`) in backend code | `economic_series` + `series_metadata` for `GDP`; no persisted funnel dataset | `derived` | Reclassify as derived and document methodology in Phase 3 | Same integrity gap as `overview.economic-funnel`: claimed multi-source funnel, actual single-series GDP approximation. |
| `labor.cpi-calendar` | Labor / grid card 5 | `CpiCalendar` | `/api/v1/cpi/calendar` | `Source: BLS · Jan 2026` | Stored monthly CPI index `CPIAUCSL` transformed into YoY values at response time | `economic_series` + `series_metadata` for `CPIAUCSL` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Same integrity gap as `overview.cpi-calendar`: source/date are hardcoded in the component rather than emitted by the API. |

### Markets

| Chart ID | Location | Component | Endpoint | Current source/date claim | Actual upstream dataset | Storage path | Methodology | Remediation status | Integrity gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `markets.rates-line` | Markets / hero card | `RatesLine` | `/api/v1/rates/history` | `Source: Federal Reserve, Freddie Mac · Mar 2026` | Stored time series `FEDFUNDS`, `MORTGAGE30US`, and `DGS10` combined into one payload | `economic_series` + `series_metadata` for `FEDFUNDS`, `MORTGAGE30US`, `DGS10` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Data is stored and traceable, but the footer is hardcoded and omits the Treasury leg of the chart inputs. |
| `markets.sector-treemap` | Markets / grid card 2 | `SectorTreemap` | `/api/v1/sectors/gdp` | `Source: BEA · Q4 2025` | Inline approximate GDP sector tree returned directly from backend code | No persisted dataset; inline values in `backend/app/api/v1/sectors.py` | `illustrative` | Replace with sourced implementation or hide from public production in Phase 2 | Same integrity gap as `overview.gdp-waffle`: the UI claims official BEA-backed sector shares, but the backend serves hand-authored percentages. |
| `markets.sentiment-radial` | Markets / grid card 3 | `SentimentRadial` | `/api/v1/sentiment/radial` | `Source: University of Michigan · Mar 2026` | Stored `UMCSENT` series, seeded as `source = FRED`, representing the Michigan sentiment release | `economic_series` + `series_metadata` for `UMCSENT` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Underlying data is traceable, but the card bypasses stored metadata and hardcodes the visible month/source string. |
| `markets.sp500-area` | Markets / grid card 4 | `Sp500Area` | `/api/v1/series/SP500` | `Source: S&P · Mar 2026` | Stored `SP500` series served through the generic series endpoint | `economic_series` + `series_metadata` for `SP500` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Data is traceable, but the displayed source/date are hardcoded and not validated against the API response. |
| `markets.gdp-waffle` | Markets / grid card 5 | `GdpWaffle` | `/api/v1/sectors/gdp` | `Source: BEA · Q4 2025` | Inline approximate GDP sector tree returned directly from backend code | No persisted dataset; inline values in `backend/app/api/v1/sectors.py` | `illustrative` | Replace with sourced implementation or hide from public production in Phase 2 | Same integrity gap as `overview.gdp-waffle`: one illustrative endpoint currently powers two misleading public placements. |

## Cross-Cutting Findings

1. The largest immediate integrity problem is not a single chart. It is the combination of hardcoded frontend attribution plus approximate backend endpoints that still present official-source footers.
2. `GdpWaffle`, `SectorTreemap`, `CpiHeatmap`, and `StateScatter` are the clearest public-production violations because they present hardcoded data as current official releases.
3. `GdpWaterfall`, `EconomicFunnel`, and `BulletTargets` already depend on source-backed inputs, but they need explicit `derived` classification and methodology notes before they can be considered honest.
4. The source/date footer pattern is currently decentralized. Most chart components own their own attribution string instead of consuming a backend contract.
5. `labor.unemployment-bump` is the best current template for dynamic attribution, but it still needs the same formal provenance fields and explicit methodology classification as the rest of the dashboard.

## Recommended Follow-On Mapping

- Use the chart IDs in this document as the canonical IDs for `config/provenance-manifest.json` in Task 2.
- Use the methodology classifications here to drive shared backend provenance fields in Tasks 3 and 4.
- Treat every row marked `illustrative` as not eligible for public production once Task 7 retrofits the chart UI.
- Treat every row marked `derived` as requiring methodology note support before public provenance work is considered complete.

## Approved Phase 2 Replacement Contracts

These contracts lock the production-source mapping for every chart that remains `illustrative` in the current runtime manifest. The runtime classification stays unchanged until the replacement datasets and endpoints ship in later Phase 2 tasks, but the target public contract is now fixed and test-enforced.

| Chart IDs | Target production methodology | Official upstream datasets | Freshness cadence | Deterministic transformation that remains part of the contract | Planned storage |
| --- | --- | --- | --- | --- | --- |
| `labor.cpi-heatmap` | `source_backed` | BLS Consumer Price Index Relative Importance tables, U.S. city average, major groups, using the official December annual release | `annual` | Normalize the stored December relative-importance snapshot into the public heatmap grouping without inventing category weights beyond the source release. | `postgres.cpi_category_snapshots` |
| `labor.state-scatter` | `derived` | BLS Local Area Unemployment Statistics annual average unemployment rate by state; BEA annual current-dollar GDP by state; Census Population Estimates Program annual state population estimates | `annual` | Compute GDP per capita from the stored annual GDP and population inputs, while keeping unemployment as the same-year annual average rate for the curated public state universe. | `postgres.state_indicator_snapshots` |
| `overview.gdp-waffle`, `markets.sector-treemap`, `markets.gdp-waffle` | `derived` | BEA GDP by Industry, current-dollar value added by industry | `quarterly` | Map the official BEA industry rows into one shared public sector hierarchy used by both the treemap and waffle surfaces, with no handcrafted percentage assumptions. | `postgres.sector_gdp_snapshots` |

### Manifest Alignment Notes

- `config/provenance-manifest.json` keeps the current runtime fields (`public`, `methodology_type`, `current_runtime_visibility`) untouched for still-illustrative charts.
- The new `phase_2_target_contract` field records the approved production contract that later Phase 2 tasks must implement.
- The approved target source claims are `Source: BLS CPI Relative Importance · Dec <year>` for `labor.cpi-heatmap`, `Source: BLS, BEA, Census · <year>` for `labor.state-scatter`, and `Source: BEA GDP by Industry · Q<quarter> <year>` for the shared sector GDP surfaces.
