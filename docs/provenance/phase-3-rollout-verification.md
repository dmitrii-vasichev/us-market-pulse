# Phase 3 Rollout Verification

**Date:** 2026-03-12  
**Scope:** Final methodology verification for the post-Phase-3 runtime state across `GdpWaterfall`, both `EconomicFunnel` placements, `BulletTargets`, and the remaining derived public endpoints.

## Automated Verification

Run the full Phase 3 regression suite before merge:

- `cd backend && pytest`
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- `cd frontend && npm test -- --runInBand`

The key automated assertions for Phase 3 are:

- backend regressions verifying that `/api/v1/labor/funnel`, `/api/v1/states/comparison`, `/api/v1/sectors/gdp`, and `/api/v1/kpi/summary` all retain their final derived methodology notes and runtime classification
- frontend chart tests verifying payload-driven methodology badges, notes, input summaries, and bullet target policy rendering
- manifest enforcement keeping all Phase 3 charts aligned with their approved `phase_3_target_contract`
- source scans preventing `ChartUnavailableState`, illustrative gating, or frontend-owned bullet-policy data from reappearing in the Phase 3 chart components

## Deployed Overview Checks

After deployment, manually verify the `/` route:

1. `GdpWaterfall` renders bars from the live payload, shows a `Source-backed` badge, and does not show an unavailable state or derived methodology warning.
2. `EconomicFunnel` renders with a `Derived` badge, methodology note, and input summary listing GDP, GNI, compensation, payroll, and the backend alignment policy.
3. `BulletTargets` renders the bullet chart with a `Derived` badge, methodology note, and payload-driven bullet ranges/markers for GDP, CPI, unemployment, and fed funds.
4. The contextual tooltip on `BulletTargets` explains the backend policy notes rather than any frontend-authored threshold copy.

## Deployed Labor Checks

After deployment, manually verify the `/labor` route:

1. `EconomicFunnel` matches the same source/date footer, methodology badge, and methodology note contract as the overview placement.
2. `StateScatter` still renders with a `Derived` badge and the GDP-per-capita methodology note.
3. No Phase 3 chart surface falls back to an unavailable state or loses its provenance footer after hydration.

## Rollback Signal

Rollback the Phase 3 methodology state if any of the following occur:

- `/api/v1/labor/funnel`, `/api/v1/states/comparison`, `/api/v1/sectors/gdp`, or `/api/v1/kpi/summary` loses `methodology_note` for a `derived` payload
- `GdpWaterfall`, `EconomicFunnel`, or `BulletTargets` regains frontend-only provenance or policy literals that are no longer sourced from the API payload
- overview or labor pages stop rendering methodology badges or payload-driven source/date text for the remediated Phase 3 charts
