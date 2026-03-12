# Phase 2 Rollout Verification

**Date:** 2026-03-12  
**Scope:** Restored public chart coverage for CPI category weights, state comparison, and GDP sector hierarchy surfaces.

## Automated Verification

Run the full Phase 2 regression suite before merge:

- `cd backend && pytest`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `cd frontend && npm test -- --runInBand`

The key automated assertions for Phase 2 are:

- dimensional collector tests for `cpi_category_snapshots`, `state_indicator_snapshots`, and `sector_gdp_snapshots`
- endpoint provenance tests for `/api/v1/cpi/categories`, `/api/v1/states/comparison`, and `/api/v1/sectors/gdp`
- frontend chart rendering tests for `CpiHeatmap`, `StateScatter`, `SectorTreemap`, and `GdpWaffle`
- manifest enforcement preventing those restored public charts from being reclassified as `illustrative`

## Collector Rollout Checklist

Before the first production rollout, confirm the dimensional collectors can run with real credentials:

1. Export `DATABASE_URL`, `FRED_API_KEY`, `BEA_API_KEY`, `CENSUS_API_KEY`, and `CENSUS_PEP_VINTAGE`.
2. Run `python scripts/data_collector.py`.
3. Confirm the collector logs contain:
   - `[DIM/CPI] cpi_category_snapshots`
   - `[DIM/STATE] state_indicator_snapshots`
   - `[DIM/SECTOR] sector_gdp_snapshots`
4. Verify the latest snapshot dates in PostgreSQL:
   - `SELECT MAX(snapshot_date) FROM cpi_category_snapshots;`
   - `SELECT MAX(snapshot_date) FROM state_indicator_snapshots;`
   - `SELECT MAX(snapshot_date) FROM sector_gdp_snapshots;`

## Backfill Verification

Run `python scripts/backfill.py` when a new environment needs historical dimensional coverage.

After backfill completes:

1. Confirm the run used the expected five-year window from `scripts/backfill.py`.
2. Verify each snapshot table spans more than one release period:
   - `SELECT MIN(snapshot_date), MAX(snapshot_date), COUNT(*) FROM cpi_category_snapshots;`
   - `SELECT MIN(snapshot_date), MAX(snapshot_date), COUNT(*) FROM state_indicator_snapshots;`
   - `SELECT MIN(snapshot_date), MAX(snapshot_date), COUNT(*) FROM sector_gdp_snapshots;`
3. Confirm no restored public chart endpoint falls back to an empty payload because snapshot tables were never backfilled.

## Deployed Page Checks

After deployment, manually verify the following public routes:

- `/`
  - `GdpWaffle` renders a waffle chart instead of the unavailable state
  - provenance footer shows `Source: BEA · <latest quarter>` with a `Derived` badge
- `/labor`
  - `CpiHeatmap` renders the heatmap with a `Source-backed` badge
  - `StateScatter` renders points with a `Derived` badge and methodology note
- `/markets`
  - `SectorTreemap` renders the tree map instead of the unavailable state
  - `GdpWaffle` renders the same `/api/v1/sectors/gdp` payload contract as the overview page

## Rollback Signal

Rollback the restored public surfaces if any of the following occur:

- snapshot tables fail to update and public charts lose `latest_observation_date`
- `/api/v1/cpi/categories`, `/api/v1/states/comparison`, or `/api/v1/sectors/gdp` reverts to `illustrative`
- public pages reintroduce `ChartUnavailableState` branches for restored Phase 2 charts
