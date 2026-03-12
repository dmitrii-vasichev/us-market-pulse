"""Shared provenance formatting helpers for chart-oriented API responses."""

from __future__ import annotations

import calendar
from datetime import date
from typing import Any, Literal, Mapping, Sequence

from app.models.schemas import (
    FreshnessStatus,
    MethodologyInput,
    MethodologyType,
    ProvenancePayload,
)
from app.services.methodology import (
    ChartMethodologyDefinition,
    MethodologyInputDefinition,
)

PeriodKind = Literal["date", "month", "quarter", "year"]


def format_display_period(
    latest_date: date | None,
    period_kind: PeriodKind,
) -> str | None:
    """Return a consistent human-readable label for a latest observation."""
    if latest_date is None:
        return None

    if period_kind == "date":
        month_name = calendar.month_abbr[latest_date.month]
        return f"{month_name} {latest_date.day}, {latest_date.year}"

    if period_kind == "month":
        month_name = calendar.month_abbr[latest_date.month]
        return f"{month_name} {latest_date.year}"

    if period_kind == "year":
        return str(latest_date.year)

    quarter = ((latest_date.month - 1) // 3) + 1
    return f"Q{quarter} {latest_date.year}"


def build_source_label(
    source_name: str,
    latest_date: date | None = None,
    period_kind: PeriodKind = "month",
) -> str:
    """Return a consistent chart footer source label."""
    period_label = format_display_period(latest_date, period_kind)
    if period_label is None:
        return f"Source: {source_name}"
    return f"Source: {source_name} · {period_label}"


def infer_period_kind_from_frequency(frequency: str | None) -> PeriodKind:
    if not frequency:
        return "month"

    normalized = frequency.strip().lower()
    if "quarter" in normalized:
        return "quarter"
    if "month" in normalized:
        return "month"
    return "date"


def infer_period_kind_from_frequencies(frequencies: Sequence[str | None]) -> PeriodKind:
    kinds = {infer_period_kind_from_frequency(frequency) for frequency in frequencies if frequency}
    if "date" in kinds:
        return "date"
    if "month" in kinds:
        return "month"
    if "quarter" in kinds:
        return "quarter"
    return "month"


def _dedupe_preserve(values: Sequence[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def _serialize_methodology_input(
    definition: MethodologyInputDefinition,
    metadata_row: Mapping[str, Any] | None,
) -> MethodologyInput:
    dataset = definition.dataset
    source = definition.source
    unit = definition.unit
    if metadata_row is not None:
        dataset = str(metadata_row["title"]) if metadata_row.get("title") else dataset
        if (metadata_source := metadata_row.get("source")) and source in {"", "FRED"}:
            source = str(metadata_source)
        if unit is None and metadata_row.get("units"):
            unit = str(metadata_row["units"])

    return MethodologyInput(
        key=definition.key,
        label=definition.label,
        source=source,
        dataset=dataset,
        series_id=definition.series_id,
        unit=unit,
        kind=definition.kind,
        role=definition.role,
    )


def build_methodology_inputs(
    methodology: ChartMethodologyDefinition,
    metadata_rows: Sequence[Mapping[str, Any]],
) -> list[MethodologyInput]:
    metadata_by_series_id = {
        str(row["series_id"]): row
        for row in metadata_rows
        if row.get("series_id")
    }
    return [
        _serialize_methodology_input(
            definition,
            metadata_by_series_id.get(definition.series_id) if definition.series_id else None,
        )
        for definition in methodology.inputs
    ]


def build_metadata_provenance(
    metadata_rows: Sequence[Mapping[str, Any]],
    *,
    methodology_type: MethodologyType,
    latest_date: date | None = None,
    period_kind: PeriodKind | None = None,
    methodology_note: str | None = None,
    methodology_key: str | None = None,
    methodology_inputs: list[MethodologyInput] | None = None,
    freshness_status: FreshnessStatus | None = None,
    fallback_source_name: str = "Unknown",
    fallback_dataset: str | None = None,
    source_series_ids: list[str] | None = None,
) -> ProvenancePayload:
    source_names = _dedupe_preserve(
        [str(row["source"]) for row in metadata_rows if row.get("source")]
    )
    source_name = ", ".join(source_names) if source_names else fallback_source_name

    datasets = _dedupe_preserve(
        [str(row["title"]) for row in metadata_rows if row.get("title")]
    )
    source_dataset = "; ".join(datasets) if datasets else fallback_dataset

    if source_series_ids is None:
        source_series_ids = _dedupe_preserve(
            [str(row["series_id"]) for row in metadata_rows if row.get("series_id")]
        )

    if period_kind is None:
        period_kind = infer_period_kind_from_frequencies(
            [row.get("frequency") for row in metadata_rows]
        )

    return build_provenance(
        source_name=source_name,
        methodology_type=methodology_type,
        latest_date=latest_date,
        period_kind=period_kind,
        methodology_note=methodology_note,
        methodology_key=methodology_key,
        methodology_inputs=methodology_inputs,
        source_dataset=source_dataset,
        source_series_ids=source_series_ids or None,
        freshness_status=freshness_status,
    )


def build_chart_methodology_provenance(
    methodology: ChartMethodologyDefinition,
    metadata_rows: Sequence[Mapping[str, Any]],
    *,
    latest_date: date | None = None,
    period_kind: PeriodKind | None = None,
    freshness_status: FreshnessStatus | None = None,
) -> ProvenancePayload:
    return build_metadata_provenance(
        metadata_rows,
        methodology_type=methodology.methodology_type,
        latest_date=latest_date,
        period_kind=period_kind,
        methodology_note=methodology.methodology_note,
        methodology_key=methodology.key,
        methodology_inputs=build_methodology_inputs(methodology, metadata_rows),
        freshness_status=freshness_status,
        fallback_source_name=methodology.fallback_source_name,
        fallback_dataset=methodology.fallback_dataset,
        source_series_ids=list(methodology.source_series_ids),
    )


def build_provenance(
    *,
    source_name: str,
    methodology_type: MethodologyType,
    latest_date: date | None = None,
    period_kind: PeriodKind = "month",
    methodology_note: str | None = None,
    methodology_key: str | None = None,
    methodology_inputs: list[MethodologyInput] | None = None,
    source_dataset: str | None = None,
    source_series_ids: list[str] | None = None,
    freshness_status: FreshnessStatus | None = None,
) -> ProvenancePayload:
    """Build the normalized provenance payload shared across chart responses."""
    latest_observation_date = latest_date.isoformat() if latest_date else None
    latest_month = None
    if latest_date and period_kind in {"month", "quarter", "year"}:
        latest_month = format_display_period(latest_date, period_kind)

    return ProvenancePayload(
        source=build_source_label(source_name, latest_date, period_kind),
        methodology_type=methodology_type,
        latest_observation_date=latest_observation_date,
        latest_month=latest_month,
        methodology_note=methodology_note,
        methodology_key=methodology_key,
        methodology_inputs=methodology_inputs or None,
        source_dataset=source_dataset,
        source_series_ids=source_series_ids or None,
        freshness_status=freshness_status,
    )
