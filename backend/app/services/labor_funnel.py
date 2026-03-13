"""Service helpers for the labor funnel endpoint."""

from __future__ import annotations

from datetime import date
from typing import Any, Mapping, Sequence

from app.db.queries import get_series_metadata_many
from app.services.methodology import (
    LABOR_FUNNEL_DOCUMENTED_METHODOLOGY,
    LABOR_FUNNEL_STAGE_DEFINITIONS,
    LABOR_FUNNEL_TARGET_SERIES_IDS,
)
from app.services.provenance import build_methodology_inputs, build_provenance

SOURCE_NAME = "BEA, BLS"
SOURCE_DATASET = (
    "Gross Domestic Product; Gross National Income; National Income: Compensation of Employees, "
    "Paid; All Employees, Total Nonfarm"
)
LATEST_ROWS_PER_SERIES = 12
QUARTERLY_SERIES_IDS = ("GDP", "A023RC1Q027SBEA", "COE")
PAYROLL_SERIES_ID = "PAYEMS"


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


def _quarter_key(obs_date: date) -> tuple[int, int]:
    return obs_date.year, ((obs_date.month - 1) // 3) + 1


def _select_latest_aligned_funnel_inputs(
    series_rows: Sequence[Mapping[str, Any]],
) -> tuple[date | None, dict[str, float], date | None, float | None]:
    quarterly_values_by_date: dict[date, dict[str, float]] = {}
    payroll_by_quarter: dict[tuple[int, int], list[tuple[date, float]]] = {}

    for row in series_rows:
        series_id = str(_read_field(row, "series_id") or "")
        obs_date = _coerce_date(_read_field(row, "date"))
        value = _read_field(row, "value")
        if obs_date is None or value is None:
            continue

        if series_id in QUARTERLY_SERIES_IDS:
            quarterly_values_by_date.setdefault(obs_date, {})[series_id] = float(value)
            continue

        if series_id == PAYROLL_SERIES_ID:
            payroll_by_quarter.setdefault(_quarter_key(obs_date), []).append((obs_date, float(value)))

    for quarter_values in payroll_by_quarter.values():
        quarter_values.sort(key=lambda item: item[0], reverse=True)

    for quarter_date in sorted(quarterly_values_by_date, reverse=True):
        quarter_values = quarterly_values_by_date[quarter_date]
        if not all(series_id in quarter_values for series_id in QUARTERLY_SERIES_IDS):
            continue

        payroll_candidates = payroll_by_quarter.get(_quarter_key(quarter_date))
        if not payroll_candidates:
            continue

        payroll_date, payroll_value = payroll_candidates[0]
        return quarter_date, quarter_values, payroll_date, payroll_value

    return None, {}, None, None


def _transform_stage_value(series_id: str, raw_value: float) -> float:
    if series_id == PAYROLL_SERIES_ID:
        return raw_value / 1000.0
    return raw_value


def build_labor_funnel_response(
    series_rows: Sequence[Mapping[str, Any]],
    metadata_rows: Sequence[Mapping[str, Any]],
) -> dict[str, Any]:
    quarter_date, quarterly_values, payroll_date, payroll_value = _select_latest_aligned_funnel_inputs(
        series_rows
    )

    latest_date = payroll_date or quarter_date
    stages = []
    if quarter_date is not None and payroll_value is not None:
        for stage in LABOR_FUNNEL_STAGE_DEFINITIONS:
            if stage.source_series_id == PAYROLL_SERIES_ID:
                raw_value = payroll_value
            else:
                raw_value = quarterly_values[stage.source_series_id]

            stages.append(
                {
                    "id": stage.id,
                    "label": stage.label,
                    "value": round(_transform_stage_value(stage.source_series_id, raw_value), 2),
                    "unit": stage.unit,
                    "source_input_key": stage.input_key,
                }
            )

    provenance = build_provenance(
        source_name=SOURCE_NAME,
        methodology_type="derived",
        latest_date=latest_date,
        period_kind="quarter",
        freshness_cadence="mixed",
        methodology_note=LABOR_FUNNEL_DOCUMENTED_METHODOLOGY.methodology_note,
        methodology_key=LABOR_FUNNEL_DOCUMENTED_METHODOLOGY.key,
        methodology_inputs=build_methodology_inputs(
            LABOR_FUNNEL_DOCUMENTED_METHODOLOGY,
            metadata_rows,
        ),
        source_dataset=SOURCE_DATASET,
        source_series_ids=list(LABOR_FUNNEL_TARGET_SERIES_IDS),
    )

    return {
        "stages": stages,
        **provenance.model_dump(),
    }


async def get_labor_funnel_response(conn) -> dict[str, Any]:
    metadata_rows = await get_series_metadata_many(conn, list(LABOR_FUNNEL_TARGET_SERIES_IDS))
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
        list(LABOR_FUNNEL_TARGET_SERIES_IDS),
        LATEST_ROWS_PER_SERIES,
    )
    return build_labor_funnel_response(series_rows, metadata_rows)
