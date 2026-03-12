# Source-Backed Dashboard Provenance Inventory

**Date:** 2026-03-12  
**Status:** Active baseline with Phase 2 rollout and Phase 3 contract addendum  
**Phase:** Source-Backed Remediation baseline, updated through Phase 3 / Task 1  
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
- 9 placements currently qualify as `source_backed`
- 7 placements currently qualify as `derived`
- 0 placements currently qualify as `illustrative`
- 0 of 16 placements hardcode source/date text in the frontend
- All current public placements consume backend-provided provenance metadata

## Shared Component Map

| Component | Placements | Inventory Risk |
| --- | --- | --- |
| `CpiCalendar` | `overview.cpi-calendar`, `labor.cpi-calendar` | One provenance fix must update two page placements consistently. |
| `EconomicFunnel` | `overview.economic-funnel`, `labor.economic-funnel` | One documented derived methodology now powers two public placements. |
| `GdpWaffle` | `overview.gdp-waffle`, `markets.gdp-waffle` | One shared BEA-backed endpoint powers two public placements and must stay contract-stable across both. |

## Inventory

### Overview

| Chart ID | Location | Component | Endpoint | Current source/date claim | Actual upstream dataset | Storage path | Methodology | Remediation status | Integrity gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `overview.gdp-waterfall` | Overview / grid card 1 | `GdpWaterfall` | `/api/v1/gdp/components` | `Source: BEA Contributions to Real GDP Growth · Q4 2025` | Stored BEA/FRED contribution component series for consumer spending, business investment, government, net exports, and inventory selected from the latest complete shared quarter | `economic_series` + `series_metadata` for `DPCERY2Q224SBEA`, `A007RY2Q224SBEA`, `A822RY2Q224SBEA`, `A019RY2Q224SBEA`, `A014RY2Q224SBEA`; response builder in `backend/app/services/gdp_waterfall.py` | `source_backed` | Phase 3 implementation completed in Task 4; runtime now matches the approved stored-series contract | The chart no longer redistributes a single growth reading across fixed shares. It now renders the stored contribution inputs directly and falls back to the latest complete quarter if a newer partial quarter exists. |
| `overview.gdp-quarterly` | Overview / grid card 2 | `GdpQuarterly` | `/api/v1/gdp/quarterly` | `Source: BEA · Q4 2025` | Stored quarterly growth series `A191RL1Q225SBEA` (seeded as `source = FRED`, BEA-origin economic release) | `economic_series` + `series_metadata` for `A191RL1Q225SBEA` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Data is traceable, but the source/date footer is hardcoded in the frontend instead of coming from the payload. |
| `overview.cpi-calendar` | Overview / grid card 3 | `CpiCalendar` | `/api/v1/cpi/calendar` | `Source: BLS · Jan 2026` | Stored monthly CPI index `CPIAUCSL` transformed into YoY values at response time | `economic_series` + `series_metadata` for `CPIAUCSL` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Underlying data is stored and traceable, but the displayed month is hardcoded and never validated against the payload. |
| `overview.economic-funnel` | Overview / grid card 4 | `EconomicFunnel` | `/api/v1/labor/funnel` | `Source: BEA, BLS · Q4 2025` | Stored quarterly `GDP`, `A023RC1Q027SBEA`, and `COE` inputs aligned with the latest stored `PAYEMS` month inside the same quarter | `economic_series` + `series_metadata` for `GDP`, `A023RC1Q027SBEA`, `COE`, `PAYEMS`; response builder in `backend/app/services/labor_funnel.py` | `derived` | Phase 3 implementation completed in Task 5; runtime now matches the approved multi-input methodology contract | The chart remains derived because it maps mixed-frequency stored inputs into one storytelling funnel, but the stage ordering, unit conversions, and quarterly alignment are now explicit in the backend provenance payload. |
| `overview.bullet-targets` | Overview / grid card 5 | `BulletTargets` | `/api/v1/kpi/summary` plus frontend target map | `Source: Federal Reserve · Mar 2026` | KPI summary derived from stored `GDP`, `CPIAUCSL`, `UNRATE`, and `FEDFUNDS`; target thresholds are hardcoded in `frontend/src/components/charts/BulletTargets.tsx` | `economic_series` + `series_metadata` for KPI series; hardcoded target thresholds in frontend | `derived` | Phase 3 target contract locked in Task 1; remain derived with backend-owned KPI target policy | Current footer implies a single Federal Reserve source, but the chart mixes multiple stored series with frontend-only target assumptions. The approved target state keeps the shared KPI endpoint and moves target bands/markers into the backend contract. |
| `overview.gdp-waffle` | Overview / grid card 6 | `GdpWaffle` | `/api/v1/sectors/gdp` | `Source: BEA · Q4 2025` | Stored BEA GDP-by-industry hierarchy snapshot transformed into public percentage shares at response time | `sector_gdp_snapshots`; derivation logic in `backend/app/services/sector_gdp.py` | `derived` | Restored to public with payload-driven provenance in Phase 2 | Public chart now uses stored BEA inputs; the remaining caveat is explicit derivation from current-dollar snapshot rows into share percentages. |

### Labor

| Chart ID | Location | Component | Endpoint | Current source/date claim | Actual upstream dataset | Storage path | Methodology | Remediation status | Integrity gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `labor.unemployment-bump` | Labor / hero card | `UnemploymentBump` | `/api/v1/labor/ranking` | Dynamic payload value, currently `Source: BLS · <latest month>` | Ten state unemployment series (`LASST...`) ranked from stored monthly observations; falls back to live BLS API if the database has no complete set | `economic_series` + `series_metadata` for BLS state series; optional runtime BLS API fallback | `source_backed` | Keep public; formalize provenance fields in shared contract | This is the only placement already using payload-driven source/date, but methodology type is missing and the fallback path is implicit rather than explicitly classified. |
| `labor.cpi-heatmap` | Labor / grid card 2 | `CpiHeatmap` | `/api/v1/cpi/categories` | `Source: BLS CPI Relative Importance · Dec 2025` | Stored annual CPI relative importance snapshot rows served directly from the latest category snapshot | `cpi_category_snapshots`; response builder in `backend/app/services/cpi_categories.py` | `source_backed` | Restored to public with payload-driven provenance in Phase 2 | Public chart now renders stored BLS category weights and no longer depends on static backend approximations. |
| `labor.state-scatter` | Labor / grid card 3 | `StateScatter` | `/api/v1/states/comparison` | `Source: BLS, BEA, Census · 2025` | Stored annual unemployment, GDP, and population snapshot rows combined into GDP-per-capita scatter points for the curated state set | `state_indicator_snapshots`; derivation logic in `backend/app/services/state_comparison.py` | `derived` | Restored to public with payload-driven provenance in Phase 2 | Public chart now uses stored state inputs; the remaining caveat is explicit GDP-per-capita derivation rather than a raw source-issued scatter dataset. |
| `labor.economic-funnel` | Labor / grid card 4 | `EconomicFunnel` | `/api/v1/labor/funnel` | `Source: BEA, BLS · Q4 2025` | Stored quarterly `GDP`, `A023RC1Q027SBEA`, and `COE` inputs aligned with the latest stored `PAYEMS` month inside the same quarter | `economic_series` + `series_metadata` for `GDP`, `A023RC1Q027SBEA`, `COE`, `PAYEMS`; response builder in `backend/app/services/labor_funnel.py` | `derived` | Phase 3 implementation completed in Task 5; runtime now matches the approved multi-input methodology contract | Same runtime contract as `overview.economic-funnel`: the shared derived endpoint now documents stage mapping and mixed-unit conversions instead of synthesizing downstream stages from one GDP level. |
| `labor.cpi-calendar` | Labor / grid card 5 | `CpiCalendar` | `/api/v1/cpi/calendar` | `Source: BLS · Jan 2026` | Stored monthly CPI index `CPIAUCSL` transformed into YoY values at response time | `economic_series` + `series_metadata` for `CPIAUCSL` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Same integrity gap as `overview.cpi-calendar`: source/date are hardcoded in the component rather than emitted by the API. |

### Markets

| Chart ID | Location | Component | Endpoint | Current source/date claim | Actual upstream dataset | Storage path | Methodology | Remediation status | Integrity gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `markets.rates-line` | Markets / hero card | `RatesLine` | `/api/v1/rates/history` | `Source: Federal Reserve, Freddie Mac · Mar 2026` | Stored time series `FEDFUNDS`, `MORTGAGE30US`, and `DGS10` combined into one payload | `economic_series` + `series_metadata` for `FEDFUNDS`, `MORTGAGE30US`, `DGS10` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Data is stored and traceable, but the footer is hardcoded and omits the Treasury leg of the chart inputs. |
| `markets.sector-treemap` | Markets / grid card 2 | `SectorTreemap` | `/api/v1/sectors/gdp` | `Source: BEA · Q4 2025` | Stored BEA GDP-by-industry hierarchy snapshot transformed into public percentage shares at response time | `sector_gdp_snapshots`; derivation logic in `backend/app/services/sector_gdp.py` | `derived` | Restored to public with payload-driven provenance in Phase 2 | Same contract as `overview.gdp-waffle`: the chart now renders stored BEA inputs with an explicit derived-share methodology note. |
| `markets.sentiment-radial` | Markets / grid card 3 | `SentimentRadial` | `/api/v1/sentiment/radial` | `Source: University of Michigan · Mar 2026` | Stored `UMCSENT` series, seeded as `source = FRED`, representing the Michigan sentiment release | `economic_series` + `series_metadata` for `UMCSENT` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Underlying data is traceable, but the card bypasses stored metadata and hardcodes the visible month/source string. |
| `markets.sp500-area` | Markets / grid card 4 | `Sp500Area` | `/api/v1/series/SP500` | `Source: S&P · Mar 2026` | Stored `SP500` series served through the generic series endpoint | `economic_series` + `series_metadata` for `SP500` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Data is traceable, but the displayed source/date are hardcoded and not validated against the API response. |
| `markets.gdp-waffle` | Markets / grid card 5 | `GdpWaffle` | `/api/v1/sectors/gdp` | `Source: BEA · Q4 2025` | Stored BEA GDP-by-industry hierarchy snapshot transformed into public percentage shares at response time | `sector_gdp_snapshots`; derivation logic in `backend/app/services/sector_gdp.py` | `derived` | Restored to public with payload-driven provenance in Phase 2 | Same contract as `overview.gdp-waffle`: one stored endpoint now safely powers two public placements with explicit derived-share attribution. |

## Cross-Cutting Findings

1. Phase 2 removed the last public `illustrative` placements by restoring `GdpWaffle`, `SectorTreemap`, `CpiHeatmap`, and `StateScatter` to payload-driven rendering.
2. The only remaining unresolved methodology work is now `overview.bullet-targets`.
3. `overview.gdp-waterfall` and both `EconomicFunnel` placements now match their locked Phase 3 contracts at runtime.
4. The shared provenance footer pattern is now centralized through chart payloads rather than per-component source/date literals.
5. Shared endpoints such as `/api/v1/sectors/gdp` still require regression coverage because one payload contract powers multiple public surfaces.

## Recommended Follow-On Mapping

- Use the chart IDs in this document as the canonical IDs for `config/provenance-manifest.json` in Task 2.
- Use the methodology classifications and `phase_3_target_contract` entries here to drive Phase 3 backend contract work for the unresolved derived charts.
- No public chart placement remains on an `illustrative` methodology after Phase 2 Task 7.
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

## Approved Phase 3 Methodology Contracts

These contracts lock the post-Phase-3 target state for the remaining charts whose current runtime implementation is still methodologically unresolved after Phase 2. Runtime classification remains unchanged until the actual endpoint and UI work ships in later Phase 3 tasks.

| Chart IDs | Target production methodology | Approved upstream datasets | Freshness cadence | Deterministic transformation or policy that remains part of the contract | Planned storage | Assumptions removed in Phase 3 |
| --- | --- | --- | --- | --- | --- | --- |
| `overview.gdp-waterfall` | `source_backed` | BEA NIPA Table 1.1.2 contributions to percent change in real GDP, or equivalent stored FRED contribution component series for consumer spending, business investment, government, net exports, and inventory | `quarterly` | No synthetic share split remains in the target contract; the chart should render stored contribution inputs directly. | `postgres.economic_series` + `postgres.series_metadata` | Remove the fixed backend `45/25/15/-5/20` redistribution logic. |
| `overview.economic-funnel`, `labor.economic-funnel` | `derived` | Stored BEA GDP, gross national income, and compensation inputs plus a stored BLS employment input for the workforce stage | `mixed` | Build the GDP → income → compensation → workforce funnel from stored inputs with documented unit conversions and stage mapping, rather than a single-series GDP share split. | `postgres.economic_series` + `postgres.series_metadata` + backend methodology service | Remove the current single-GDP share split and unsupported multi-source source claim. |
| `overview.bullet-targets` | `derived` | Stored GDP, CPIAUCSL, UNRATE, and FEDFUNDS inputs served through `/api/v1/kpi/summary` | `mixed` | Compute KPI measures from stored inputs and attach backend-owned target bands and markers through the shared KPI payload, rather than a frontend-only threshold map. | `postgres.economic_series` + `postgres.series_metadata` + backend methodology service | Remove the hardcoded frontend target map and the misleading single-source Federal Reserve claim. |

### Manifest Alignment Notes

- `config/provenance-manifest.json` now records `phase_3_target_contract` for `overview.gdp-waterfall`, `overview.economic-funnel`, `labor.economic-funnel`, and `overview.bullet-targets`.
- `phase_3_target_contract` still captures the approved post-remediation methodology contract for the remaining unresolved charts, while `overview.gdp-waterfall` already matches its locked runtime state.
- The approved target source claims are `Source: BEA Contributions to Real GDP Growth · Q<quarter> <year>` for `overview.gdp-waterfall`, `Source: BEA, BLS · <latest aligned period>` for both `EconomicFunnel` placements, and `Source: BEA, BLS, Federal Reserve · <latest aligned period>` for `overview.bullet-targets`.
