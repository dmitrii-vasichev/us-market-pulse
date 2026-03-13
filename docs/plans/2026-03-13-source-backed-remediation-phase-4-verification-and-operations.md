# Source-Backed Remediation Phase 4: Verification and Operations

**Date:** 2026-03-13
**Status:** Planned
**Phase:** Source-Backed Remediation Phase 4 / 4
**PRD:** docs/prd-source-backed-dashboard-remediation.md
**Design Brief:** docs/design-brief-source-backed-remediation.md
**Phasing:** docs/plans/2026-03-12-source-backed-remediation-phasing.md

## Goal

Turn the completed remediation work into an operational standard by making freshness, collector coverage, and production provenance audit repeatable and test-enforced.

## Context

Phases 1 through 3 moved the dashboard to a truthful provenance model:

- public charts now declare `source_backed` or `derived` methodology explicitly
- all previously illustrative public surfaces were either replaced or hidden
- remaining derived charts now use backend-owned methodology instead of frontend assumptions

The remaining risk is no longer chart truthfulness itself. It is operational drift:

- the repository has no single hardening layer that proves every public chart still has an ingestion path
- `freshness_status` exists in the shared contract, but the runtime does not systematically compute it
- production verification still depends on manual spot checks instead of a reusable manifest-backed audit command

Phase 4 should close those gaps without redesigning the product or reopening methodology debates already settled in Phase 3.

## Implementation Constraints

- Keep the current Next.js, FastAPI, PostgreSQL, and Nivo stack.
- Reuse the existing provenance manifest and chart methodology definitions instead of inventing a second parallel contract.
- Prefer additive operational metadata and scripts over breaking API or UI changes.
- Do not introduce live upstream API reads during request handling as part of verification.
- Keep the audit tooling runnable against either a local backend or the deployed production backend.
- Treat freshness warnings as informational hardening, not as a reason to silently hide otherwise valid source-backed charts.

## Stack Decisions

1. **Single hardening issue:** Phase 4 will ship as one umbrella implementation issue so freshness, audit, and ops enforcement land together.
2. **Shared freshness helper:** backend provenance formatting should compute `freshness_status` from explicit cadence rules instead of leaving the field mostly unused.
3. **Repository-owned coverage registry:** public chart ingestion coverage should be declared in code/config and validated in tests, not inferred ad hoc during reviews.
4. **Manifest-backed runtime audit:** an audit script should read `config/provenance-manifest.json`, hit the configured chart endpoints, and report mismatches against the approved public contract.
5. **Runbook over guesswork:** deployment verification must live in a short operational document that can be followed after each rollout.

## Deliverables

- shared freshness status calculation for public chart provenance
- a repository-level public chart coverage registry tied to manifest chart IDs
- a provenance audit script for local or deployed backend verification
- regression tests covering freshness, coverage, and audit behavior
- a final Phase 4 rollout and operations runbook

## Tasks

### T1 - Lock the Phase 4 hardening contract

**Files:** `docs/context/decision-log.md`, `docs/provenance/source-backed-inventory.md`, `config/provenance-manifest.json`

Record the operational expectations that now define success after the methodology work is done: which public charts require freshness signals, how coverage is declared, and what the production audit must verify.

**Acceptance Criteria:**
- [ ] Decision log records the approved Phase 4 hardening direction.
- [ ] Inventory and manifest language describe the post-remediation runtime as an operational baseline.
- [ ] Any new operational metadata keys are documented against stable chart IDs.

---

### T2 - Implement shared freshness and coverage enforcement

**Files:** `backend/app/services/provenance.py`, `backend/app/services/*.py`, `backend/tests/test_provenance.py`, `backend/tests/test_specialized_api.py`, `backend/tests/test_core_api.py`

Add a shared freshness classifier and a repository-owned coverage registry for public charts. Freshness should be derived from cadence-aware rules, and coverage should explicitly state which collector family or stored-series inputs back each public chart.

**Acceptance Criteria:**
- [ ] `freshness_status` is computed consistently as `current`, `stale`, or `unknown`.
- [ ] Public chart coverage is declared against manifest chart IDs and validated in tests.
- [ ] Source-backed and derived endpoints expose truthful freshness metadata without breaking existing payload shape.

---

### T3 - Add a manifest-backed provenance audit command

**Files:** `scripts/provenance_audit.py`, `backend/tests/*.py` or `scripts/tests/*.py`

Create a runnable audit script that reads the manifest, checks public chart endpoints against a provided backend base URL, and reports mismatches in methodology classification, required methodology notes, freshness fields, and collector coverage declarations.

**Acceptance Criteria:**
- [ ] The audit command can run against local or deployed backend URLs.
- [ ] Public chart endpoint responses are compared against the manifest contract.
- [ ] Failures are reported with chart IDs and actionable mismatch messages.

---

### T4 - Add the final Phase 4 runbook and regression verification

**Files:** `docs/provenance/phase-4-operations-verification.md`, `frontend/__tests__/components/ChartCard.test.tsx`, `frontend/__tests__/provenance-manifest.test.ts`

Document the rollout flow and add final enforcement for freshness warnings and audit prerequisites so the dashboard cannot regress silently after the remediation initiative is complete.

**Acceptance Criteria:**
- [ ] A short runbook exists for deployed overview, labor, and markets verification.
- [ ] Frontend tests cover freshness messaging and manifest-backed hardening expectations.
- [ ] The final verification suite can be run from the repository with clear commands.

## Dependencies

```text
T1 -> T2, T3, T4
T2 -> T3, T4
T3 -> T4
```

## Order of Execution

1. T1 - Lock the hardening contract
2. T2 - Implement freshness and coverage enforcement
3. T3 - Add the provenance audit command
4. T4 - Add the runbook and final regression verification

## Verification

For backend and scripts:

```bash
cd backend && pytest
python scripts/provenance_audit.py --base-url http://localhost:8000
```

For frontend:

```bash
cd frontend && npm run lint && npm run build && npm test
```

Before closing Phase 4:

- confirm every public chart ID in the manifest has a declared operational coverage entry
- confirm freshness status is present or explicitly `unknown` where cadence cannot be asserted
- run the provenance audit against the target backend environment
- verify `/`, `/labor`, and `/markets` with the final rollout checklist
