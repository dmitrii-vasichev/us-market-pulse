# Decision Log

## 2026-03-12

### Source-Backed Remediation Phase 2 Dataset Contracts

- `labor.cpi-heatmap` will move to a `source_backed` annual contract backed by the BLS Consumer Price Index Relative Importance tables for U.S. city average major groups, using the December release as the stored public snapshot in `postgres.cpi_category_snapshots`.
- `labor.state-scatter` will move to a `derived` annual contract backed by BLS Local Area Unemployment Statistics annual average unemployment rates by state, BEA annual current-dollar GDP by state, and Census Population Estimates annual state population. GDP per capita remains an explicit deterministic computation from stored GDP and population inputs, materialized in `postgres.state_indicator_snapshots`.
- `overview.gdp-waffle`, `markets.sector-treemap`, and `markets.gdp-waffle` will share one `derived` quarterly contract backed by BEA GDP by Industry current-dollar value added. The public chart payload will map official BEA industry rows into one shared display hierarchy stored in `postgres.sector_gdp_snapshots`.
- The manifest keeps current runtime provenance fields unchanged for still-illustrative charts during implementation sequencing, while `phase_2_target_contract` records the approved production contract that later Phase 2 tasks must satisfy.
