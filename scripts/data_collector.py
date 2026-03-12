"""Daily data collector: fetches latest observations from FRED and BLS for active series."""

import asyncio
import os
import ssl
import sys
import time
from datetime import date, datetime, timezone

import asyncpg
import httpx

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.services.labor_ranking import fetch_bls_series, get_bls_year_range


def _get_ssl(url: str):
    if "railway" in url or "proxy.rlwy.net" in url:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return ctx
    return None

FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations"
FETCH_LIMIT = 30  # Latest N observations per series


async def get_active_series(conn: asyncpg.Connection) -> list[dict]:
    rows = await conn.fetch(
        "SELECT series_id, title, source FROM series_metadata WHERE is_active = TRUE ORDER BY display_order"
    )
    return [dict(r) for r in rows]


async def fetch_fred_series(
    client: httpx.AsyncClient,
    series_id: str,
    api_key: str,
    limit: int = FETCH_LIMIT,
    observation_start: str | None = None,
) -> list[dict]:
    params = {
        "series_id": series_id,
        "api_key": api_key,
        "file_type": "json",
        "sort_order": "desc",
        "limit": limit,
    }
    if observation_start:
        params["observation_start"] = observation_start
        params.pop("limit", None)
        params["sort_order"] = "asc"

    resp = await client.get(FRED_BASE_URL, params=params)
    resp.raise_for_status()
    data = resp.json()
    return data.get("observations", [])


async def upsert_observations(
    conn: asyncpg.Connection, series_id: str, observations: list[dict]
) -> int:
    if not observations:
        return 0

    records = []
    for obs in observations:
        if obs.get("value") in (None, "", "."):
            continue
        try:
            records.append((series_id, date.fromisoformat(obs["date"]), float(obs["value"])))
        except (ValueError, KeyError):
            continue

    if not records:
        return 0

    inserted = await conn.executemany(
        """
        INSERT INTO economic_series (series_id, date, value)
        VALUES ($1, $2::date, $3)
        ON CONFLICT (series_id, date) DO UPDATE SET
            value = EXCLUDED.value,
            collected_at = NOW()
        """,
        records,
    )
    return len(records)


async def update_last_updated(conn: asyncpg.Connection, series_id: str) -> None:
    await conn.execute(
        "UPDATE series_metadata SET last_updated = CURRENT_DATE WHERE series_id = $1",
        series_id,
    )


async def log_collection_run(
    conn: asyncpg.Connection,
    status: str,
    series_collected: int,
    records_inserted: int,
    duration: float,
    error_message: str | None = None,
) -> None:
    await conn.execute(
        """
        INSERT INTO collection_runs (run_date, status, series_collected, records_inserted, duration_seconds, error_message)
        VALUES (NOW(), $1, $2, $3, $4, $5)
        """,
        status,
        series_collected,
        records_inserted,
        duration,
        error_message,
    )


def _group_observations_by_series(
    observations_by_series: dict[str, list[dict[str, str]]],
) -> list[tuple[str, list[dict[str, str]]]]:
    return list(observations_by_series.items())


async def collect(
    database_url: str | None = None,
    fred_api_key: str | None = None,
    observation_start: str | None = None,
    fetch_limit: int = FETCH_LIMIT,
) -> dict:
    db_url = database_url or os.environ.get("DATABASE_URL", "")
    api_key = fred_api_key or os.environ.get("FRED_API_KEY", "")

    if not db_url:
        print("ERROR: DATABASE_URL not set")
        sys.exit(1)
    if not api_key:
        print("ERROR: FRED_API_KEY not set")
        sys.exit(1)

    conn = await asyncpg.connect(db_url, ssl=_get_ssl(db_url))
    start_time = time.time()
    total_records = 0
    series_ok = 0
    errors = []

    try:
        series_list = await get_active_series(conn)
        print(f"Collecting data for {len(series_list)} series...")
        fred_series = [series for series in series_list if series.get("source") != "BLS"]
        bls_series = [series for series in series_list if series.get("source") == "BLS"]

        async with httpx.AsyncClient(timeout=30.0) as client:
            for i, s in enumerate(fred_series, 1):
                sid = s["series_id"]
                try:
                    observations = await fetch_fred_series(
                        client, sid, api_key,
                        limit=fetch_limit,
                        observation_start=observation_start,
                    )
                    count = await upsert_observations(conn, sid, observations)
                    await update_last_updated(conn, sid)
                    total_records += count
                    series_ok += 1
                    print(f"  [{i:2d}/{len(series_list)}] {sid:20s} — {count} records")

                    # Rate limiting: ~2 requests/sec to stay under 120/min
                    await asyncio.sleep(0.5)

                except Exception as e:
                    error_msg = f"{sid}: {e}"
                    errors.append(error_msg)
                    print(f"  [{i:2d}/{len(series_list)}] {sid:20s} — ERROR: {e}")

            if bls_series:
                start_year, end_year = get_bls_year_range(observation_start)
                series_ids = [series["series_id"] for series in bls_series]
                try:
                    observations_by_series = await fetch_bls_series(
                        client,
                        series_ids,
                        start_year,
                        end_year,
                    )
                    for sid, observations in _group_observations_by_series(observations_by_series):
                        count = await upsert_observations(conn, sid, observations)
                        await update_last_updated(conn, sid)
                        total_records += count
                        series_ok += 1
                        print(
                            f"  [BLS/{series_ok:2d}] {sid:20s} — {count} records"
                        )
                except Exception as e:
                    error_msg = f"BLS state series: {e}"
                    errors.append(error_msg)
                    print(f"  [BLS] ERROR: {e}")

        duration = time.time() - start_time
        status = "success" if not errors else "partial"
        error_text = "\n".join(errors) if errors else None

        await log_collection_run(conn, status, series_ok, total_records, duration, error_text)

        print(f"\nCollection complete: {series_ok}/{len(series_list)} series, {total_records} records in {duration:.1f}s")
        if errors:
            print(f"Errors ({len(errors)}):")
            for e in errors:
                print(f"  - {e}")

        return {
            "status": status,
            "series_collected": series_ok,
            "records_inserted": total_records,
            "duration_seconds": duration,
            "errors": errors,
        }
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(collect())
