# Phase 4 Operations Verification

**Date:** 2026-03-13  
**Status:** Active runbook  
**Phase:** Source-Backed Remediation Phase 4 / 4  
**Reference artifacts:** `config/provenance-manifest.json`, `config/provenance-operations.json`, `scripts/provenance_audit.py`

## Goal

Provide one repeatable verification flow that proves the public dashboard still matches the approved source-backed provenance contract after deployment.

## Preconditions

- The backend is reachable through either a local URL or the target deployed environment.
- The frontend build for the target revision completed successfully.
- Database collectors or backfill jobs already loaded the series and snapshot families required by `config/provenance-operations.json`.

## Repository Verification

Run the required regression suites before or immediately after deployment:

```bash
cd backend && pytest
cd frontend && npm run lint
cd frontend && npm run build
cd frontend && npm test -- --runInBand
```

## Runtime Provenance Audit

Run the manifest-backed audit against the backend that serves the public dashboard:

```bash
python scripts/provenance_audit.py --base-url http://localhost:8000
```

For a deployed environment, replace `http://localhost:8000` with the target backend URL.

The audit must finish with:

- zero registry alignment errors between the manifest and operations registry
- zero public payload regressions to `illustrative`
- zero missing methodology notes for charts whose manifest contract requires them
- zero missing series-coverage IDs for `coverage_type = "series"`

## Manual Page Checks

Verify the three public surfaces after a successful audit:

### Overview (`/`)

- `overview.gdp-waterfall` shows a BEA contributions source label and no fallback copy about fixed shares.
- `overview.economic-funnel` and `overview.bullet-targets` show backend-provided methodology details in the chart footer.
- `overview.gdp-waffle` uses the shared `/api/v1/sectors/gdp` payload and shows derived provenance rather than an unavailable state.

### Labor (`/labor`)

- `labor.unemployment-bump` renders payload-driven BLS provenance and a non-empty freshness indicator when the backend marks it `stale` or `unknown`.
- `labor.cpi-heatmap` and `labor.state-scatter` stay public and show stored snapshot provenance.
- `labor.economic-funnel` matches the same methodology footer contract used on the overview page.

### Markets (`/markets`)

- `markets.rates-line`, `markets.sentiment-radial`, and `markets.sp500-area` show payload-driven source labels from the backend.
- `markets.sector-treemap` and `markets.gdp-waffle` still share the audited sector GDP payload without diverging methodology copy.

## Operational Follow-Up

If the audit fails:

1. Inspect the reported chart ID and endpoint mismatch.
2. Compare the live response with `config/provenance-manifest.json` and `config/provenance-operations.json`.
3. Fix the backend payload or registry drift before treating the deploy as complete.

If the audit passes but a chart looks wrong:

1. Confirm the chart is using the expected endpoint from the manifest.
2. Confirm the required collector artifacts and series/snapshot coverage still exist in the repository.
3. Capture the failing page state and open a follow-up issue rather than changing the manifest by hand.
