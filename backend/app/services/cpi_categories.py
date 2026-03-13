"""Service helpers for the CPI category endpoint."""

from __future__ import annotations

from datetime import date
from typing import Any, Mapping, Sequence

from app.db.queries import get_latest_cpi_category_snapshot
from app.services.provenance import build_provenance

FALLBACK_SOURCE_NAME = "BLS CPI Relative Importance"
FALLBACK_SOURCE_DATASET = (
    "Consumer Price Index Relative Importance tables, U.S. city average, major groups"
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


def build_cpi_categories_response(snapshot_rows: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    sorted_rows = sorted(
        snapshot_rows,
        key=lambda row: (
            int(_read_field(row, "display_order") or 0),
            str(_read_field(row, "category_key") or ""),
        ),
    )

    categories = [
        {
            "id": str(_read_field(row, "category_key")),
            "label": str(_read_field(row, "category_label")),
            "value": float(_read_field(row, "relative_importance") or 0.0),
        }
        for row in sorted_rows
    ]

    latest_date = max(
        (_coerce_date(_read_field(row, "snapshot_date")) for row in sorted_rows),
        default=None,
    )
    source_dataset = next(
        (
            str(_read_field(row, "source_dataset"))
            for row in sorted_rows
            if _read_field(row, "source_dataset")
        ),
        FALLBACK_SOURCE_DATASET,
    )

    provenance = build_provenance(
        source_name=FALLBACK_SOURCE_NAME,
        methodology_type="source_backed",
        latest_date=latest_date,
        period_kind="month",
        freshness_cadence="annual",
        source_dataset=source_dataset,
    )

    return {
        "categories": categories,
        "total": round(sum(item["value"] for item in categories), 2),
        **provenance.model_dump(),
    }


async def get_cpi_categories_response(conn) -> dict[str, Any]:
    snapshot_rows = await get_latest_cpi_category_snapshot(conn)
    return build_cpi_categories_response(snapshot_rows)
