# Source-Backed Dashboard Provenance Inventory

**Date:** 2026-03-12  
**Status:** Draft  
**Phase:** Source-Backed Remediation Phase 1 / Task 1  
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
- 8 placements currently qualify as `source_backed`
- 8 placements currently qualify as `derived`
- 0 placements currently qualify as `illustrative`
- 0 of 16 placements hardcode source/date text in the frontend
- All current public placements consume backend-provided provenance metadata

## Shared Component Map

| Component | Placements | Inventory Risk |
| --- | --- | --- |
| `CpiCalendar` | `overview.cpi-calendar`, `labor.cpi-calendar` | One provenance fix must update two page placements consistently. |
| `EconomicFunnel` | `overview.economic-funnel`, `labor.economic-funnel` | One derived methodology gap is repeated on two pages. |
| `GdpWaffle` | `overview.gdp-waffle`, `markets.gdp-waffle` | One shared BEA-backed endpoint powers two public placements and must stay contract-stable across both. |

## Inventory

### Overview

| Chart ID | Location | Component | Endpoint | Current source/date claim | Actual upstream dataset | Storage path | Methodology | Remediation status | Integrity gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `overview.gdp-waterfall` | Overview / grid card 1 | `GdpWaterfall` | `/api/v1/gdp/components` | `Source: BEA · Q4 2025` | `A191RL1Q225SBEA` from `economic_series`, redistributed into hardcoded 45/25/15/-5/20 component shares in `backend/app/api/v1/gdp.py` | `economic_series` + `series_metadata` for `A191RL1Q225SBEA` | `derived` | Reclassify as derived and add methodology note in Phase 3 | UI implies direct BEA component observations, but backend fabricates component contributions from a single stored growth series. |
| `overview.gdp-quarterly` | Overview / grid card 2 | `GdpQuarterly` | `/api/v1/gdp/quarterly` | `Source: BEA · Q4 2025` | Stored quarterly growth series `A191RL1Q225SBEA` (seeded as `source = FRED`, BEA-origin economic release) | `economic_series` + `series_metadata` for `A191RL1Q225SBEA` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Data is traceable, but the source/date footer is hardcoded in the frontend instead of coming from the payload. |
| `overview.cpi-calendar` | Overview / grid card 3 | `CpiCalendar` | `/api/v1/cpi/calendar` | `Source: BLS · Jan 2026` | Stored monthly CPI index `CPIAUCSL` transformed into YoY values at response time | `economic_series` + `series_metadata` for `CPIAUCSL` | `source_backed` | Keep public; add shared provenance payload/footer in Phase 1 | Underlying data is stored and traceable, but the displayed month is hardcoded and never validated against the payload. |
| `overview.economic-funnel` | Overview / grid card 4 | `EconomicFunnel` | `/api/v1/labor/funnel` | `Source: BEA, BLS · Q4 2025` | Stored GDP level `GDP` multiplied by fixed stage shares (`0.68`, `0.18`, `0.17`, `0.03`) in backend code | `economic_series` + `series_metadata` for `GDP`; no persisted funnel dataset | `derived` | Reclassify as derived and document methodology in Phase 3 | Footer claims BEA and BLS inputs, but the backend only reads GDP and synthesizes the rest of the funnel. |
| `overview.bullet-targets` | Overview / grid card 5 | `BulletTargets` | `/api/v1/kpi/summary` plus frontend target map | `Source: Federal Reserve · Mar 2026` | KPI summary derived from stored `GDP`, `CPIAUCSL`, `UNRATE`, and `FEDFUNDS`; target thresholds are hardcoded in `frontend/src/components/charts/BulletTargets.tsx` | `economic_series` + `series_metadata` for KPI series; hardcoded target thresholds in frontend | `derived` | Reclassify as derived; move provenance and target logic under explicit methodology | Footer implies a single Federal Reserve source, but the chart mixes multiple stored series with frontend-only target assumptions. |
| `overview.gdp-waffle` | Overview / grid card 6 | `GdpWaffle` | `/api/v1/sectors/gdp` | `Source: BEA · Q4 2025` | Stored BEA GDP-by-industry hierarchy snapshot transformed into public percentage shares at response time | `sector_gdp_snapshots`; derivation logic in `backend/app/services/sector_gdp.py` | `derived` | Restored to public with payload-driven provenance in Phase 2 | Public chart now uses stored BEA inputs; the remaining caveat is explicit derivation from current-dollar snapshot rows into share percentages. |

### Labor

| Chart ID | Location | Component | Endpoint | Current source/date claim | Actual upstream dataset | Storage path | Methodology | Remediation status | Integrity gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `labor.unemployment-bump` | Labor / hero card | `UnemploymentBump` | `/api/v1/labor/ranking` | Dynamic payload value, currently `Source: BLS · <latest month>` | Ten state unemployment series (`LASST...`) ranked from stored monthly observations; falls back to live BLS API if the database has no complete set | `economic_series` + `series_metadata` for BLS state series; optional runtime BLS API fallback | `source_backed` | Keep public; formalize provenance fields in shared contract | This is the only placement already using payload-driven source/date, but methodology type is missing and the fallback path is implicit rather than explicitly classified. |
| `labor.cpi-heatmap` | Labor / grid card 2 | `CpiHeatmap` | `/api/v1/cpi/categories` | `Source: BLS CPI Relative Importance · Dec 2025` | Stored annual CPI relative importance snapshot rows served directly from the latest category snapshot | `cpi_category_snapshots`; response builder in `backend/app/services/cpi_categories.py` | `source_backed` | Restored to public with payload-driven provenance in Phase 2 | Public chart now renders stored BLS category weights and no longer depends on static backend approximations. |
| `labor.state-scatter` | Labor / grid card 3 | `StateScatter` | `/api/v1/states/comparison` | `Source: BLS, BEA, Census · 2025` | Stored annual unemployment, GDP, and population snapshot rows combined into GDP-per-capita scatter points for the curated state set | `state_indicator_snapshots`; derivation logic in `backend/app/services/state_comparison.py` | `derived` | Restored to public with payload-driven provenance in Phase 2 | Public chart now uses stored state inputs; the remaining caveat is explicit GDP-per-capita derivation rather than a raw source-issued scatter dataset. |
| `labor.economic-funnel` | Labor / grid card 4 | `EconomicFunnel` | `/api/v1/labor/funnel` | `Source: BEA, BLS · Q4 2025` | Stored GDP level `GDP` multiplied by fixed stage shares (`0.68`, `0.18`, `0.17`, `0.03`) in backend code | `economic_series` + `series_metadata` for `GDP`; no persisted funnel dataset | `derived` | Reclassify as derived and document methodology in Phase 3 | Same integrity gap as `overview.economic-funnel`: claimed multi-source funnel, actual single-series GDP approximation. |
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
2. The remaining provenance nuance is concentrated in `derived` charts, where the dashboard transforms stored source-backed inputs into presentation-specific datasets and therefore must keep methodology notes visible.
3. The shared provenance footer pattern is now centralized through chart payloads rather than per-component source/date literals.
4. Shared endpoints such as `/api/v1/sectors/gdp` still require regression coverage because one payload contract powers multiple public surfaces.
5. `labor.unemployment-bump` is no longer a special-case template; public charts now consistently consume backend-provided provenance fields.

## Recommended Follow-On Mapping

- Use the chart IDs in this document as the canonical IDs for `config/provenance-manifest.json` in Task 2.
- Use the methodology classifications here to drive shared backend provenance fields in Tasks 3 and 4.
- No public chart placement remains on an `illustrative` methodology after Phase 2 Task 7.
- Treat every row marked `derived` as requiring methodology note support before public provenance work is considered complete.
