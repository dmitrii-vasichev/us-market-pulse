# Phase 1: Backend Foundation + Data Pipeline

**Date:** 2026-03-11
**Phase:** 1 of 4
**Goal:** Fully functional backend with all API endpoints serving real economic data from PostgreSQL.

---

## Task 1: FastAPI Project Scaffold + Config

**Description:** Initialize backend project with FastAPI, create project structure, config module with environment variables, and database connection setup.

**Files:**
- `backend/app/__init__.py`
- `backend/app/main.py` — FastAPI app with CORS, health check
- `backend/app/config.py` — Settings via pydantic-settings (DATABASE_URL, FRED_API_KEY, CORS origins)
- `backend/app/db/__init__.py`
- `backend/app/db/database.py` — asyncpg connection pool or SQLAlchemy async
- `backend/requirements.txt` — fastapi, uvicorn, asyncpg, pydantic-settings, httpx, pandas
- `backend/.env.example`

**Acceptance Criteria:**
- [ ] `uvicorn app.main:app` starts without errors
- [ ] `GET /health` returns `{"status": "ok"}`
- [ ] Config reads from environment variables
- [ ] Tests: health endpoint returns 200

**Verification:** `cd backend && uvicorn app.main:app --port 8000` → `curl localhost:8000/health`

---

## Task 2: PostgreSQL Schema + Migration Script

**Description:** Create SQL migration script with all 4 tables from PRD (economic_series, series_metadata, collection_runs, kpi_snapshots). Create indexes for query performance.

**Files:**
- `backend/app/db/migrations/001_initial_schema.sql`
- `backend/app/db/migrate.py` — script to run migrations against DATABASE_URL

**Acceptance Criteria:**
- [ ] All 4 tables created with correct types and constraints
- [ ] Indexes on: `economic_series(series_id, date)`, `series_metadata(series_id)`, `kpi_snapshots(kpi_key)`
- [ ] Migration script is idempotent (can run twice safely)
- [ ] Tests: migration runs without errors on clean DB

**Verification:** `python -m app.db.migrate` → check tables exist via `psql`

---

## Task 3: Seed Metadata Script

**Description:** Script to populate `series_metadata` with all 16 FRED series from PRD Section 3. Includes series_id, title, units, frequency, category, display_order.

**Files:**
- `scripts/seed_metadata.py`

**Acceptance Criteria:**
- [ ] 16 series inserted into series_metadata
- [ ] Categories assigned: gdp, inflation, labor, rates, housing, markets, sentiment
- [ ] Script is idempotent (UPSERT)
- [ ] Tests: verify all 16 series present after run

**Verification:** `python scripts/seed_metadata.py` → `SELECT count(*) FROM series_metadata` = 16

---

## Task 4: FRED Data Collector

**Description:** Script that fetches latest observations from FRED API for all active series, upserts into `economic_series`, logs to `collection_runs`.

**Files:**
- `scripts/data_collector.py`
- `backend/requirements-collector.txt` — requests, psycopg2-binary, pandas

**Acceptance Criteria:**
- [ ] Fetches data for all active series from FRED API
- [ ] UPSERT into economic_series (no duplicates)
- [ ] Logs run to collection_runs (status, count, duration)
- [ ] Handles API errors gracefully (logs error, continues with other series)
- [ ] Rate limiting: respects 120 req/min
- [ ] Tests: collector runs with mock FRED responses

**Verification:** `FRED_API_KEY=xxx DATABASE_URL=xxx python scripts/data_collector.py`

---

## Task 5: Backfill Script (5 Years)

**Description:** One-time script to fetch 5 years of historical data for all series. Similar to collector but with larger date range.

**Files:**
- `scripts/backfill.py`

**Acceptance Criteria:**
- [ ] Fetches 5 years of data for all active series
- [ ] UPSERT (safe to re-run)
- [ ] Progress logging (series N/16, records inserted)
- [ ] Tests: verify data range covers 5 years

**Verification:** `python scripts/backfill.py` → `SELECT min(date), max(date) FROM economic_series`

---

## Task 6: KPI Calculator Service

**Description:** Service that computes KPI snapshots from raw data: current value, previous value, change (absolute + percent), period label. Handles economic-specific logic (QoQ for GDP, YoY for CPI, MoM for unemployment).

**Files:**
- `backend/app/services/__init__.py`
- `backend/app/services/kpi_calculator.py`

**Acceptance Criteria:**
- [ ] Computes KPIs: GDP, CPI, UNRATE, FEDFUNDS
- [ ] Correct change calculation per indicator type (QoQ, YoY, MoM)
- [ ] Stores snapshots in kpi_snapshots table
- [ ] Tests: KPI calculation with known input → expected output

**Verification:** Unit tests with fixture data

---

## Task 7: API Endpoints — Core (KPI, Series, Meta)

**Description:** Implement core API endpoints: KPI summary, single/multi series, metadata, last update.

**Files:**
- `backend/app/api/__init__.py`
- `backend/app/api/v1/__init__.py`
- `backend/app/api/v1/kpi.py` — GET /api/v1/kpi/summary
- `backend/app/api/v1/series.py` — GET /api/v1/series/{id}, GET /api/v1/series/multi
- `backend/app/api/v1/meta.py` — GET /api/v1/meta/last-update, GET /api/v1/meta/series
- `backend/app/models/__init__.py`
- `backend/app/models/schemas.py` — Pydantic response models
- `backend/app/db/queries.py` — SQL queries

**Acceptance Criteria:**
- [ ] KPI summary returns 4 KPIs with sparkline data
- [ ] Series endpoint returns time series with date filtering
- [ ] Multi-series returns multiple series in one call
- [ ] Meta endpoints return last update time and series list
- [ ] All endpoints return proper Pydantic models
- [ ] Tests: each endpoint returns 200 with correct schema

**Verification:** `curl localhost:8000/api/v1/kpi/summary`

---

## Task 8: API Endpoints — Specialized (GDP, CPI, Labor, Rates, Sectors, Sentiment)

**Description:** Implement all remaining specialized endpoints that transform raw data for specific chart types.

**Files:**
- `backend/app/api/v1/gdp.py` — components (waterfall), quarterly
- `backend/app/api/v1/cpi.py` — calendar, categories (waffle)
- `backend/app/api/v1/labor.py` — funnel, ranking (bump)
- `backend/app/api/v1/states.py` — comparison (scatter)
- `backend/app/api/v1/rates.py` — history (multi-line)
- `backend/app/api/v1/sectors.py` — GDP by sector (treemap)
- `backend/app/api/v1/sentiment.py` — radial bar data
- `backend/app/api/v1/overview.py` — full overview payload

**Acceptance Criteria:**
- [ ] Each endpoint returns data shaped for its Nivo chart type
- [ ] GDP waterfall returns components with positive/negative values
- [ ] CPI calendar returns date→value pairs for @nivo/calendar
- [ ] Labor funnel returns stages with values
- [ ] Bump returns state rankings by month
- [ ] All endpoints documented with response examples
- [ ] Tests: each endpoint returns 200 with correct structure

**Verification:** `curl localhost:8000/api/v1/gdp/components`

---

## Task 9: Backend Tests

**Description:** Comprehensive test suite for all backend components.

**Files:**
- `backend/tests/__init__.py`
- `backend/tests/conftest.py` — fixtures, test DB setup
- `backend/tests/test_health.py`
- `backend/tests/test_kpi.py`
- `backend/tests/test_series.py`
- `backend/tests/test_gdp.py`
- `backend/tests/test_endpoints.py`

**Acceptance Criteria:**
- [ ] All endpoints tested (status code + response schema)
- [ ] KPI calculator tested with known data
- [ ] Tests run without external DB (mocked or test DB)
- [ ] `pytest` passes with 0 failures

**Verification:** `cd backend && python -m pytest tests/ -v`

---

## Task 10: Deploy Backend to Railway

**Description:** Dockerize backend and deploy to Railway. Configure environment variables.

**Files:**
- `backend/Dockerfile`
- `backend/Procfile` (if needed)

**Acceptance Criteria:**
- [ ] Docker build succeeds
- [ ] Railway deployment accessible via public URL
- [ ] `/health` returns 200
- [ ] `/api/v1/kpi/summary` returns real data
- [ ] CORS allows Vercel domain

**Verification:** `curl https://<railway-url>/api/v1/kpi/summary`

---

## Dependencies

```
Task 1 (scaffold) → Task 2 (schema) → Task 3 (seed) → Task 4 (collector) → Task 5 (backfill)
                                                                ↓
Task 6 (KPI calc) ← depends on Task 3 + data in DB
                                                                ↓
Task 7 (core API) ← depends on Task 6 + Task 2
Task 8 (specialized API) ← depends on Task 7
Task 9 (tests) ← parallel with Task 7-8 (write tests alongside)
Task 10 (deploy) ← depends on all above
```

## Execution Order
1. Task 1 → 2 → 3 → 4 → 5 (sequential: foundation → data)
2. Task 6 (KPI calculator)
3. Task 7 → 8 (API endpoints)
4. Task 9 (tests — written alongside 7-8)
5. Task 10 (deploy)
