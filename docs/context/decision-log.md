# Decision Log

## 2026-03-12

### Source-Backed Remediation Phase 2 Dataset Contracts

- `labor.cpi-heatmap` will move to a `source_backed` annual contract backed by the BLS Consumer Price Index Relative Importance tables for U.S. city average major groups, using the December release as the stored public snapshot in `postgres.cpi_category_snapshots`.
- `labor.state-scatter` will move to a `derived` annual contract backed by BLS Local Area Unemployment Statistics annual average unemployment rates by state, BEA annual current-dollar GDP by state, and Census Population Estimates annual state population. GDP per capita remains an explicit deterministic computation from stored GDP and population inputs, materialized in `postgres.state_indicator_snapshots`.
- `overview.gdp-waffle`, `markets.sector-treemap`, and `markets.gdp-waffle` will share one `derived` quarterly contract backed by BEA GDP by Industry current-dollar value added. The public chart payload will map official BEA industry rows into one shared display hierarchy stored in `postgres.sector_gdp_snapshots`.
- The manifest keeps current runtime provenance fields unchanged for still-illustrative charts during implementation sequencing, while `phase_2_target_contract` records the approved production contract that later Phase 2 tasks must satisfy.

### Source-Backed Remediation Phase 3 Methodology Contracts

- `overview.gdp-waterfall` is approved to move from `derived` to `source_backed` in Phase 3, using stored BEA contribution component inputs instead of redistributing one GDP growth series through fixed backend shares.
- `overview.economic-funnel` and `labor.economic-funnel` are approved to remain `derived`, but only if the funnel is rebuilt from stored BEA income inputs plus a stored BLS workforce input with documented unit conversions and stage mapping.
- `overview.bullet-targets` is approved to remain `derived` on top of `/api/v1/kpi/summary`; the chart should keep the shared KPI endpoint and move its target bands, markers, and policy explanation into a backend-owned contract.
- The manifest now records `phase_3_target_contract` for the unresolved methodology charts so implementation can keep current runtime classifications unchanged while Phase 3 endpoint and UI work is still in progress.
