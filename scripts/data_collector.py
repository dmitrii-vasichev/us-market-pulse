"""Daily data collector: fetches latest observations from FRED and BLS for active series."""

import asyncio
import json
import os
import ssl
import sys
import time
from datetime import date, datetime, timezone

import asyncpg
import httpx

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.services.labor_ranking import fetch_bls_series, get_bls_year_range
from collectors.cpi_categories import fetch_cpi_category_snapshots
from collectors.sector_gdp import fetch_sector_gdp_snapshots
from collectors.state_indicators import fetch_state_indicator_snapshots


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


def _build_collection_years(
    observation_start: str | None,
    latest_year: int,
) -> list[int]:
    start_year = date.fromisoformat(observation_start).year if observation_start else latest_year
    return list(range(start_year, latest_year + 1))


async def upsert_cpi_category_snapshots(
    conn: asyncpg.Connection,
    snapshot_rows: list[dict],
) -> int:
    if not snapshot_rows:
        return 0

    records = [
        (
            row["snapshot_date"],
            row["period_label"],
            row["category_key"],
            row["category_label"],
            row["display_order"],
            row["relative_importance"],
            row["source_provider"],
            row["source_dataset"],
            json.dumps(row["source_metadata"]),
        )
        for row in snapshot_rows
    ]
    await conn.executemany(
        """
        INSERT INTO cpi_category_snapshots (
            snapshot_date,
            period_label,
            category_key,
            category_label,
            display_order,
            relative_importance,
            source_provider,
            source_dataset,
            source_metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
        ON CONFLICT (snapshot_date, category_key) DO UPDATE SET
            period_label = EXCLUDED.period_label,
            category_label = EXCLUDED.category_label,
            display_order = EXCLUDED.display_order,
            relative_importance = EXCLUDED.relative_importance,
            source_provider = EXCLUDED.source_provider,
            source_dataset = EXCLUDED.source_dataset,
            source_metadata = EXCLUDED.source_metadata,
            collected_at = NOW()
        """,
        records,
    )
    return len(records)


async def upsert_state_indicator_snapshots(
    conn: asyncpg.Connection,
    snapshot_rows: list[dict],
) -> int:
    if not snapshot_rows:
        return 0

    records = [
        (
            row["snapshot_date"],
            row["period_label"],
            row["state_code"],
            row["state_name"],
            row["display_order"],
            row["unemployment_rate"],
            row["gdp_current_dollars"],
            row["population"],
            row["source_providers"],
            row["source_datasets"],
            json.dumps(row["source_metadata"]),
        )
        for row in snapshot_rows
    ]
    await conn.executemany(
        """
        INSERT INTO state_indicator_snapshots (
            snapshot_date,
            period_label,
            state_code,
            state_name,
            display_order,
            unemployment_rate,
            gdp_current_dollars,
            population,
            source_providers,
            source_datasets,
            source_metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::text[], $10::text[], $11::jsonb)
        ON CONFLICT (snapshot_date, state_code) DO UPDATE SET
            period_label = EXCLUDED.period_label,
            state_name = EXCLUDED.state_name,
            display_order = EXCLUDED.display_order,
            unemployment_rate = EXCLUDED.unemployment_rate,
            gdp_current_dollars = EXCLUDED.gdp_current_dollars,
            population = EXCLUDED.population,
            source_providers = EXCLUDED.source_providers,
            source_datasets = EXCLUDED.source_datasets,
            source_metadata = EXCLUDED.source_metadata,
            collected_at = NOW()
        """,
        records,
    )
    return len(records)


async def upsert_sector_gdp_snapshots(
    conn: asyncpg.Connection,
    snapshot_rows: list[dict],
) -> int:
    if not snapshot_rows:
        return 0

    records = [
        (
            row["snapshot_date"],
            row["period_label"],
            row["node_key"],
            row["parent_node_key"],
            row["node_label"],
            row["depth"],
            row["display_order"],
            row["value_current_dollars"],
            row["source_provider"],
            row["source_dataset"],
            json.dumps(row["source_metadata"]),
        )
        for row in snapshot_rows
    ]
    await conn.executemany(
        """
        INSERT INTO sector_gdp_snapshots (
            snapshot_date,
            period_label,
            node_key,
            parent_node_key,
            node_label,
            depth,
            display_order,
            value_current_dollars,
            source_provider,
            source_dataset,
            source_metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
        ON CONFLICT (snapshot_date, node_key) DO UPDATE SET
            period_label = EXCLUDED.period_label,
            parent_node_key = EXCLUDED.parent_node_key,
            node_label = EXCLUDED.node_label,
            depth = EXCLUDED.depth,
            display_order = EXCLUDED.display_order,
            value_current_dollars = EXCLUDED.value_current_dollars,
            source_provider = EXCLUDED.source_provider,
            source_dataset = EXCLUDED.source_dataset,
            source_metadata = EXCLUDED.source_metadata,
            collected_at = NOW()
        """,
        records,
    )
    return len(records)


async def collect_dimensional_snapshots(
    conn: asyncpg.Connection,
    client: httpx.AsyncClient,
    observation_start: str | None = None,
    bea_api_key: str | None = None,
    census_api_key: str | None = None,
    census_vintage: int | None = None,
) -> dict:
    errors: list[str] = []
    records_inserted = 0
    datasets_collected = 0
    current_year = datetime.now(timezone.utc).year
    latest_complete_year = current_year - 1
    annual_years = _build_collection_years(observation_start, latest_complete_year)
    sector_years = _build_collection_years(observation_start, current_year)

    try:
        cpi_rows = await fetch_cpi_category_snapshots(client, annual_years)
        count = await upsert_cpi_category_snapshots(conn, cpi_rows)
        datasets_collected += 1
        records_inserted += count
        print(f"  [DIM/CPI] cpi_category_snapshots — {count} records")
    except Exception as exc:
        errors.append(f"cpi_category_snapshots: {exc}")
        print(f"  [DIM/CPI] ERROR: {exc}")

    try:
        if not bea_api_key:
            raise RuntimeError("BEA_API_KEY not set")
        state_rows = await fetch_state_indicator_snapshots(
            client,
            annual_years,
            bea_api_key=bea_api_key,
            census_vintage=census_vintage or latest_complete_year,
            census_api_key=census_api_key,
        )
        count = await upsert_state_indicator_snapshots(conn, state_rows)
        datasets_collected += 1
        records_inserted += count
        print(f"  [DIM/STATE] state_indicator_snapshots — {count} records")
    except Exception as exc:
        errors.append(f"state_indicator_snapshots: {exc}")
        print(f"  [DIM/STATE] ERROR: {exc}")

    try:
        if not bea_api_key:
            raise RuntimeError("BEA_API_KEY not set")
        sector_rows = await fetch_sector_gdp_snapshots(
            client,
            sector_years,
            bea_api_key=bea_api_key,
        )
        count = await upsert_sector_gdp_snapshots(conn, sector_rows)
        datasets_collected += 1
        records_inserted += count
        print(f"  [DIM/SECTOR] sector_gdp_snapshots — {count} records")
    except Exception as exc:
        errors.append(f"sector_gdp_snapshots: {exc}")
        print(f"  [DIM/SECTOR] ERROR: {exc}")

    return {
        "datasets_collected": datasets_collected,
        "records_inserted": records_inserted,
        "errors": errors,
    }


async def collect(
    database_url: str | None = None,
    fred_api_key: str | None = None,
    bea_api_key: str | None = None,
    census_api_key: str | None = None,
    census_vintage: int | None = None,
    observation_start: str | None = None,
    fetch_limit: int = FETCH_LIMIT,
) -> dict:
    db_url = database_url or os.environ.get("DATABASE_URL", "")
    api_key = fred_api_key or os.environ.get("FRED_API_KEY", "")
    resolved_bea_api_key = bea_api_key or os.environ.get("BEA_API_KEY", "")
    resolved_census_api_key = census_api_key or os.environ.get("CENSUS_API_KEY")
    resolved_census_vintage = census_vintage or int(
        os.environ.get("CENSUS_PEP_VINTAGE", datetime.now(timezone.utc).year - 1)
    )

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
    dimensional_ok = 0
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

            dimensional_result = await collect_dimensional_snapshots(
                conn,
                client,
                observation_start=observation_start,
                bea_api_key=resolved_bea_api_key,
                census_api_key=resolved_census_api_key,
                census_vintage=resolved_census_vintage,
            )
            total_records += dimensional_result["records_inserted"]
            dimensional_ok += dimensional_result["datasets_collected"]
            errors.extend(dimensional_result["errors"])

        duration = time.time() - start_time
        status = "success" if not errors else "partial"
        error_text = "\n".join(errors) if errors else None

        await log_collection_run(conn, status, series_ok, total_records, duration, error_text)

        print(
            f"\nCollection complete: {series_ok}/{len(series_list)} series, "
            f"{dimensional_ok}/3 dimensional datasets, {total_records} records in {duration:.1f}s"
        )
        if errors:
            print(f"Errors ({len(errors)}):")
            for e in errors:
                print(f"  - {e}")

        return {
            "status": status,
            "series_collected": series_ok,
            "dimensional_datasets_collected": dimensional_ok,
            "records_inserted": total_records,
            "duration_seconds": duration,
            "errors": errors,
        }
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(collect())
