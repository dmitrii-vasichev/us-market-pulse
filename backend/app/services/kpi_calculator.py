"""KPI calculator: computes current values, changes, and sparkline data for dashboard KPIs."""

from decimal import Decimal

import asyncpg

# KPI definitions: series_id, comparison method, display config
KPI_DEFINITIONS = {
    "gdp": {
        "series_id": "GDP",
        "label": "Total GDP",
        "comparison": "qoq",  # Quarter over quarter
        "format": "trillions",
        "positive_is_good": True,
    },
    "cpi": {
        "series_id": "CPIAUCSL",
        "label": "Inflation Rate",
        "comparison": "yoy",  # Year over year (% change)
        "format": "percent_change",
        "positive_is_good": False,  # Rising inflation is bad
    },
    "unemployment": {
        "series_id": "UNRATE",
        "label": "Unemployment",
        "comparison": "mom",  # Month over month (level change)
        "format": "percent",
        "positive_is_good": False,  # Rising unemployment is bad
    },
    "fed_rate": {
        "series_id": "FEDFUNDS",
        "label": "Fed Funds Rate",
        "comparison": "ytd",  # Year to date
        "format": "percent",
        "positive_is_good": False,  # Rising rate = tightening = negative
    },
}


async def get_latest_values(
    conn: asyncpg.Connection, series_id: str, limit: int = 2
) -> list[dict]:
    rows = await conn.fetch(
        """
        SELECT date, value
        FROM economic_series
        WHERE series_id = $1 AND value IS NOT NULL
        ORDER BY date DESC
        LIMIT $2
        """,
        series_id,
        limit,
    )
    return [{"date": r["date"], "value": r["value"]} for r in rows]


async def get_sparkline_data(
    conn: asyncpg.Connection, series_id: str, points: int = 12
) -> list[dict]:
    rows = await conn.fetch(
        """
        SELECT date, value
        FROM economic_series
        WHERE series_id = $1 AND value IS NOT NULL
        ORDER BY date DESC
        LIMIT $2
        """,
        series_id,
        points,
    )
    # Return in chronological order
    return [{"date": str(r["date"]), "value": float(r["value"])} for r in reversed(rows)]


async def get_yoy_value(
    conn: asyncpg.Connection, series_id: str
) -> dict | None:
    """Get latest value and value from ~12 months ago for YoY calculation."""
    rows = await conn.fetch(
        """
        SELECT date, value
        FROM economic_series
        WHERE series_id = $1 AND value IS NOT NULL
        ORDER BY date DESC
        LIMIT 13
        """,
        series_id,
    )
    if len(rows) < 2:
        return None
    current = rows[0]
    previous = rows[-1]  # ~12 months ago
    return {
        "current": {"date": current["date"], "value": current["value"]},
        "previous": {"date": previous["date"], "value": previous["value"]},
    }


async def get_ytd_value(
    conn: asyncpg.Connection, series_id: str
) -> dict | None:
    """Get latest value and value from Jan 1 of current year."""
    rows = await conn.fetch(
        """
        SELECT date, value
        FROM economic_series
        WHERE series_id = $1 AND value IS NOT NULL
        ORDER BY date DESC
        LIMIT 1
        """,
        series_id,
    )
    if not rows:
        return None

    current = rows[0]
    year_start = current["date"].replace(month=1, day=1)

    jan_rows = await conn.fetch(
        """
        SELECT date, value
        FROM economic_series
        WHERE series_id = $1 AND value IS NOT NULL AND date >= $2
        ORDER BY date ASC
        LIMIT 1
        """,
        series_id,
        year_start,
    )
    if not jan_rows:
        return None

    return {
        "current": {"date": current["date"], "value": current["value"]},
        "previous": {"date": jan_rows[0]["date"], "value": jan_rows[0]["value"]},
    }


def compute_change(
    current: Decimal, previous: Decimal, comparison: str
) -> dict:
    """Compute absolute and percentage change."""
    if previous == 0:
        return {"absolute": 0, "percent": 0}

    if comparison == "yoy":
        # YoY percentage change for CPI
        pct = float((current - previous) / previous * 100)
        return {"absolute": round(pct, 1), "percent": round(pct, 2)}

    absolute = float(current - previous)
    percent = float((current - previous) / previous * 100)
    return {"absolute": round(absolute, 4), "percent": round(percent, 2)}


def format_period_label(comparison: str) -> str:
    labels = {
        "qoq": "QoQ",
        "yoy": "YoY",
        "mom": "MoM",
        "ytd": "YTD",
    }
    return labels.get(comparison, "")


async def compute_kpi(conn: asyncpg.Connection, kpi_key: str) -> dict | None:
    defn = KPI_DEFINITIONS.get(kpi_key)
    if not defn:
        return None

    series_id = defn["series_id"]
    comparison = defn["comparison"]

    if comparison == "yoy":
        pair = await get_yoy_value(conn, series_id)
    elif comparison == "ytd":
        pair = await get_ytd_value(conn, series_id)
    else:
        # qoq or mom: use latest 2 values
        values = await get_latest_values(conn, series_id, limit=2)
        if len(values) < 2:
            return None
        pair = {"current": values[0], "previous": values[1]}

    if not pair:
        return None

    current_val = pair["current"]["value"]
    previous_val = pair["previous"]["value"]
    change = compute_change(current_val, previous_val, comparison)

    sparkline = await get_sparkline_data(conn, series_id)

    return {
        "key": kpi_key,
        "label": defn["label"],
        "current_value": float(current_val),
        "previous_value": float(previous_val),
        "change_absolute": change["absolute"],
        "change_percent": change["percent"],
        "period_label": format_period_label(comparison),
        "positive_is_good": defn["positive_is_good"],
        "format": defn["format"],
        "sparkline": sparkline,
    }


async def compute_all_kpis(conn: asyncpg.Connection) -> list[dict]:
    kpis = []
    for key in KPI_DEFINITIONS:
        kpi = await compute_kpi(conn, key)
        if kpi:
            kpis.append(kpi)
    return kpis
