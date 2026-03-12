"""Shared provenance formatting helpers for chart-oriented API responses."""

from __future__ import annotations

import calendar
from datetime import date
from typing import Literal

from app.models.schemas import (
    FreshnessStatus,
    MethodologyType,
    ProvenancePayload,
)

PeriodKind = Literal["date", "month", "quarter"]


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


def build_provenance(
    *,
    source_name: str,
    methodology_type: MethodologyType,
    latest_date: date | None = None,
    period_kind: PeriodKind = "month",
    methodology_note: str | None = None,
    source_dataset: str | None = None,
    source_series_ids: list[str] | None = None,
    freshness_status: FreshnessStatus | None = None,
) -> ProvenancePayload:
    """Build the normalized provenance payload shared across chart responses."""
    latest_observation_date = latest_date.isoformat() if latest_date else None
    latest_month = None
    if latest_date and period_kind in {"month", "quarter"}:
        latest_month = format_display_period(latest_date, period_kind)

    return ProvenancePayload(
        source=build_source_label(source_name, latest_date, period_kind),
        methodology_type=methodology_type,
        latest_observation_date=latest_observation_date,
        latest_month=latest_month,
        methodology_note=methodology_note,
        source_dataset=source_dataset,
        source_series_ids=source_series_ids or None,
        freshness_status=freshness_status,
    )
