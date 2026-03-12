"""Reusable database queries."""

from datetime import date
from typing import Literal

import asyncpg

SnapshotTableName = Literal[
    "cpi_category_snapshots",
    "state_indicator_snapshots",
    "sector_gdp_snapshots",
]

_ALLOWED_SNAPSHOT_TABLES: set[SnapshotTableName] = {
    "cpi_category_snapshots",
    "state_indicator_snapshots",
    "sector_gdp_snapshots",
}


def _validate_snapshot_table_name(table_name: SnapshotTableName) -> SnapshotTableName:
    if table_name not in _ALLOWED_SNAPSHOT_TABLES:
        raise ValueError(f"Unsupported snapshot table: {table_name}")
    return table_name


async def get_series_data(
    conn: asyncpg.Connection,
    series_id: str,
    start: str | None = None,
    end: str | None = None,
    limit: int = 500,
) -> list[dict]:
    conditions = ["series_id = $1", "value IS NOT NULL"]
    params: list = [series_id]
    idx = 2

    if start:
        conditions.append(f"date >= ${idx}::date")
        params.append(start)
        idx += 1
    if end:
        conditions.append(f"date <= ${idx}::date")
        params.append(end)
        idx += 1

    where = " AND ".join(conditions)
    query = f"""
        SELECT date, value
        FROM economic_series
        WHERE {where}
        ORDER BY date ASC
        LIMIT {limit}
    """
    rows = await conn.fetch(query, *params)
    return [{"date": str(r["date"]), "value": float(r["value"])} for r in rows]


async def get_series_metadata(
    conn: asyncpg.Connection, series_id: str
) -> dict | None:
    row = await conn.fetchrow(
        """
        SELECT series_id, title, units, frequency, source, category, last_updated
        FROM series_metadata
        WHERE series_id = $1
        """,
        series_id,
    )
    if not row:
        return None
    return dict(row)


async def get_series_metadata_many(
    conn: asyncpg.Connection,
    series_ids: list[str],
) -> list[dict]:
    if not series_ids:
        return []

    rows = await conn.fetch(
        """
        SELECT series_id, title, units, frequency, source, category, last_updated
        FROM series_metadata
        WHERE series_id = ANY($1::varchar[])
        ORDER BY display_order
        """,
        series_ids,
    )
    return [dict(r) for r in rows]


async def get_latest_series_observation_date(
    conn: asyncpg.Connection,
    series_id: str,
) -> date | None:
    row = await conn.fetchrow(
        """
        SELECT MAX(date) AS latest_date
        FROM economic_series
        WHERE series_id = $1 AND value IS NOT NULL
        """,
        series_id,
    )
    if not row:
        return None
    return row["latest_date"]


async def get_latest_series_observation_dates(
    conn: asyncpg.Connection,
    series_ids: list[str],
) -> dict[str, date]:
    if not series_ids:
        return {}

    rows = await conn.fetch(
        """
        SELECT series_id, MAX(date) AS latest_date
        FROM economic_series
        WHERE series_id = ANY($1::varchar[]) AND value IS NOT NULL
        GROUP BY series_id
        """,
        series_ids,
    )
    return {
        r["series_id"]: r["latest_date"]
        for r in rows
        if r["latest_date"] is not None
    }


async def get_all_metadata(conn: asyncpg.Connection) -> list[dict]:
    rows = await conn.fetch(
        """
        SELECT series_id, title, units, frequency, source, category, last_updated
        FROM series_metadata
        WHERE is_active = TRUE
        ORDER BY display_order
        """
    )
    return [dict(r) for r in rows]


async def get_last_collection_run(conn: asyncpg.Connection) -> dict | None:
    row = await conn.fetchrow(
        "SELECT run_date, status, series_collected, records_inserted FROM collection_runs ORDER BY run_date DESC LIMIT 1"
    )
    if not row:
        return None
    return dict(row)


async def get_latest_snapshot_date(
    conn: asyncpg.Connection,
    table_name: SnapshotTableName,
) -> date | None:
    safe_table_name = _validate_snapshot_table_name(table_name)
    row = await conn.fetchrow(
        f"""
        SELECT MAX(snapshot_date) AS latest_date
        FROM {safe_table_name}
        """
    )
    if not row:
        return None
    return row["latest_date"]


async def get_latest_cpi_category_snapshot(
    conn: asyncpg.Connection,
) -> list[dict]:
    rows = await conn.fetch(
        """
        WITH latest AS (
            SELECT MAX(snapshot_date) AS snapshot_date
            FROM cpi_category_snapshots
        )
        SELECT
            snapshot_date,
            period_label,
            category_key,
            category_label,
            display_order,
            relative_importance,
            source_provider,
            source_dataset,
            source_metadata,
            collected_at
        FROM cpi_category_snapshots
        WHERE snapshot_date = (SELECT snapshot_date FROM latest)
        ORDER BY display_order ASC, category_key ASC
        """
    )
    return [dict(r) for r in rows]


async def get_latest_state_indicator_snapshot(
    conn: asyncpg.Connection,
) -> list[dict]:
    rows = await conn.fetch(
        """
        WITH latest AS (
            SELECT MAX(snapshot_date) AS snapshot_date
            FROM state_indicator_snapshots
        )
        SELECT
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
            source_metadata,
            collected_at
        FROM state_indicator_snapshots
        WHERE snapshot_date = (SELECT snapshot_date FROM latest)
        ORDER BY display_order ASC, state_code ASC
        """
    )
    return [dict(r) for r in rows]


async def get_latest_sector_gdp_snapshot(
    conn: asyncpg.Connection,
) -> list[dict]:
    rows = await conn.fetch(
        """
        WITH latest AS (
            SELECT MAX(snapshot_date) AS snapshot_date
            FROM sector_gdp_snapshots
        )
        SELECT
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
            source_metadata,
            collected_at
        FROM sector_gdp_snapshots
        WHERE snapshot_date = (SELECT snapshot_date FROM latest)
        ORDER BY depth ASC, display_order ASC, node_key ASC
        """
    )
    return [dict(r) for r in rows]
