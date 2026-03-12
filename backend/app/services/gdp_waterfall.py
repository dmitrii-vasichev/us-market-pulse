"""Service helpers for the GDP waterfall endpoint."""

from __future__ import annotations

from datetime import date
from typing import Any, Mapping, Sequence

from app.db.queries import get_series_metadata_many
from app.services.methodology import (
    GDP_WATERFALL_COMPONENTS,
    GDP_WATERFALL_SOURCE_BACKED_METHODOLOGY,
    GDP_WATERFALL_TARGET_SERIES_IDS,
)
from app.services.provenance import build_methodology_inputs, build_provenance

SOURCE_NAME = "BEA Contributions to Real GDP Growth"
SOURCE_DATASET = "NIPA Table 1.1.2 Contributions to Percent Change in Real Gross Domestic Product"
LATEST_ROWS_PER_SERIES = 8


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


def _select_latest_complete_component_date(
    series_rows: Sequence[Mapping[str, Any]],
) -> tuple[date | None, dict[str, float]]:
    values_by_date: dict[date, dict[str, float]] = {}

    for row in series_rows:
        series_id = str(_read_field(row, "series_id") or "")
        obs_date = _coerce_date(_read_field(row, "date"))
        value = _read_field(row, "value")
        if series_id not in GDP_WATERFALL_TARGET_SERIES_IDS or obs_date is None or value is None:
            continue
        values_by_date.setdefault(obs_date, {})[series_id] = float(value)

    for obs_date in sorted(values_by_date, reverse=True):
        if all(series_id in values_by_date[obs_date] for series_id in GDP_WATERFALL_TARGET_SERIES_IDS):
            return obs_date, values_by_date[obs_date]

    return None, {}


def build_gdp_waterfall_response(
    series_rows: Sequence[Mapping[str, Any]],
    metadata_rows: Sequence[Mapping[str, Any]],
) -> dict[str, Any]:
    latest_date, component_values = _select_latest_complete_component_date(series_rows)
    components = [
        {
            "id": component.id,
            "label": component.label,
            "value": round(component_values[component.series_id], 2),
        }
        for component in GDP_WATERFALL_COMPONENTS
        if latest_date is not None
    ]
    total_growth = round(sum(component["value"] for component in components), 2)

    provenance = build_provenance(
        source_name=SOURCE_NAME,
        methodology_type="source_backed",
        latest_date=latest_date,
        period_kind="quarter",
        methodology_key=GDP_WATERFALL_SOURCE_BACKED_METHODOLOGY.key,
        methodology_inputs=build_methodology_inputs(
            GDP_WATERFALL_SOURCE_BACKED_METHODOLOGY,
            metadata_rows,
        ),
        source_dataset=SOURCE_DATASET,
        source_series_ids=list(GDP_WATERFALL_TARGET_SERIES_IDS),
    )

    return {
        "quarter": latest_date.isoformat() if latest_date else None,
        "total_growth": total_growth,
        "components": components,
        **provenance.model_dump(),
    }


async def get_gdp_waterfall_response(conn) -> dict[str, Any]:
    metadata_rows = await get_series_metadata_many(conn, list(GDP_WATERFALL_TARGET_SERIES_IDS))
    series_rows = await conn.fetch(
        """
        SELECT series_id, date, value
        FROM (
            SELECT
                series_id,
                date,
                value,
                ROW_NUMBER() OVER (PARTITION BY series_id ORDER BY date DESC) AS row_num
            FROM economic_series
            WHERE series_id = ANY($1::varchar[]) AND value IS NOT NULL
        ) ranked
        WHERE row_num <= $2
        ORDER BY date DESC, series_id ASC
        """,
        list(GDP_WATERFALL_TARGET_SERIES_IDS),
        LATEST_ROWS_PER_SERIES,
    )
    return build_gdp_waterfall_response(series_rows, metadata_rows)
