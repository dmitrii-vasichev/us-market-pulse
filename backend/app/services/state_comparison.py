"""Service helpers for the state comparison endpoint."""

from __future__ import annotations

from datetime import date
from typing import Any, Mapping, Sequence

from app.db.queries import get_latest_state_indicator_snapshot
from app.services.provenance import build_provenance

CURATED_PUBLIC_STATES = [
    {"state_code": "CA", "state_name": "California", "highlighted": False},
    {"state_code": "TX", "state_name": "Texas", "highlighted": False},
    {"state_code": "NY", "state_name": "New York", "highlighted": False},
    {"state_code": "FL", "state_name": "Florida", "highlighted": False},
    {"state_code": "IL", "state_name": "Illinois", "highlighted": False},
    {"state_code": "PA", "state_name": "Pennsylvania", "highlighted": False},
    {"state_code": "OH", "state_name": "Ohio", "highlighted": False},
    {"state_code": "CO", "state_name": "Colorado", "highlighted": True},
    {"state_code": "WA", "state_name": "Washington", "highlighted": False},
    {"state_code": "MA", "state_name": "Massachusetts", "highlighted": False},
    {"state_code": "NV", "state_name": "Nevada", "highlighted": False},
    {"state_code": "MI", "state_name": "Michigan", "highlighted": False},
]

CURATED_STATE_CODES = [item["state_code"] for item in CURATED_PUBLIC_STATES]
SOURCE_DATASET = (
    "Local Area Unemployment Statistics annual average unemployment rate by state; "
    "Annual current-dollar GDP by state; Annual state population estimates"
)
METHODOLOGY_NOTE = (
    "GDP per capita is computed from stored annual GDP and population inputs for the "
    "curated public state set."
)


def _coerce_date(value: Any) -> date | None:
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        return date.fromisoformat(value)
    return None


def _read_field(row: Mapping[str, Any], key: str) -> Any:
    try:
        return row[key]
    except (KeyError, TypeError):
        return None


def build_state_comparison_response(snapshot_rows: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    rows_by_state = {
        str(_read_field(row, "state_code")): row
        for row in snapshot_rows
        if _read_field(row, "state_code")
    }

    points: list[dict[str, Any]] = []
    latest_date: date | None = None
    for spec in CURATED_PUBLIC_STATES:
        row = rows_by_state.get(spec["state_code"])
        if row is None:
            continue

        snapshot_date = _coerce_date(_read_field(row, "snapshot_date"))
        if snapshot_date and (latest_date is None or snapshot_date > latest_date):
            latest_date = snapshot_date

        unemployment_rate = float(_read_field(row, "unemployment_rate") or 0.0)
        gdp_current_dollars = float(_read_field(row, "gdp_current_dollars") or 0.0)
        population = float(_read_field(row, "population") or 0.0)
        if population <= 0:
            continue

        gdp_per_capita = gdp_current_dollars / population
        points.append(
            {
                "x": round(unemployment_rate, 2),
                "y": round(gdp_per_capita, 2),
                "size": round(population / 1_000_000, 2),
                "label": spec["state_name"],
                "highlighted": spec["highlighted"],
            }
        )

    provenance = build_provenance(
        source_name="BLS, BEA, Census",
        methodology_type="derived",
        latest_date=latest_date,
        period_kind="year",
        methodology_note=METHODOLOGY_NOTE,
        source_dataset=SOURCE_DATASET,
    )

    return {
        "data": [
            {
                "id": "states",
                "data": points,
            }
        ],
        **provenance.model_dump(),
    }


async def get_state_comparison_response(conn) -> dict[str, Any]:
    snapshot_rows = await get_latest_state_indicator_snapshot(conn)
    return build_state_comparison_response(snapshot_rows)
