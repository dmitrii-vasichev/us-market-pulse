"""Reusable database queries."""

import asyncpg


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
        "SELECT series_id, title, units, frequency, category, last_updated FROM series_metadata WHERE series_id = $1",
        series_id,
    )
    if not row:
        return None
    return dict(row)


async def get_all_metadata(conn: asyncpg.Connection) -> list[dict]:
    rows = await conn.fetch(
        """
        SELECT series_id, title, units, frequency, category, last_updated
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
