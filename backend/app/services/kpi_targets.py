"""Helpers for backend-owned KPI target policy contracts."""

from __future__ import annotations

from datetime import date
from typing import Any, Mapping, Sequence

from app.models.schemas import KpiTargetPolicy
from app.services.methodology import (
    KPI_SUMMARY_CURRENT_METHODOLOGY,
    KPI_TARGET_POLICY_DEFINITIONS,
)
from app.services.provenance import build_methodology_inputs, build_provenance

KPI_SUMMARY_SOURCE_NAME = "BEA, BLS, Federal Reserve"


def _dedupe_preserve(values: Sequence[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def build_kpi_target_policy(kpi: Mapping[str, Any]) -> KpiTargetPolicy | None:
    definition = KPI_TARGET_POLICY_DEFINITIONS.get(str(kpi.get("key") or ""))
    if definition is None:
        return None

    measure_value = kpi.get(definition.measure_field)
    if measure_value is None:
        return None

    max_value = definition.max_value
    return KpiTargetPolicy(
        target=definition.target,
        max=max_value,
        ranges=[0.0, round(max_value * 0.5, 2), round(max_value * 0.75, 2), max_value],
        markers=[definition.target],
        measure=round(float(measure_value), 2),
        measure_field=definition.measure_field,
        measure_label=definition.measure_label,
        policy_note=definition.policy_note,
    )


def attach_kpi_target_policies(kpis: Sequence[Mapping[str, Any]]) -> list[dict[str, Any]]:
    kpis_with_policy: list[dict[str, Any]] = []
    for kpi in kpis:
        target_policy = build_kpi_target_policy(kpi)
        kpis_with_policy.append(
            {
                **kpi,
                "target_policy": target_policy.model_dump() if target_policy else None,
            }
        )
    return kpis_with_policy


def build_kpi_summary_provenance(
    metadata_rows: Sequence[Mapping[str, Any]],
    latest_date: date | None,
):
    datasets = _dedupe_preserve(
        [str(row["title"]) for row in metadata_rows if row.get("title")]
    )
    source_dataset = "; ".join(datasets) if datasets else KPI_SUMMARY_CURRENT_METHODOLOGY.fallback_dataset

    return build_provenance(
        source_name=KPI_SUMMARY_SOURCE_NAME,
        methodology_type=KPI_SUMMARY_CURRENT_METHODOLOGY.methodology_type,
        latest_date=latest_date,
        period_kind="date",
        freshness_cadence="mixed",
        methodology_note=KPI_SUMMARY_CURRENT_METHODOLOGY.methodology_note,
        methodology_key=KPI_SUMMARY_CURRENT_METHODOLOGY.key,
        methodology_inputs=build_methodology_inputs(
            KPI_SUMMARY_CURRENT_METHODOLOGY,
            metadata_rows,
        ),
        source_dataset=source_dataset,
        source_series_ids=list(KPI_SUMMARY_CURRENT_METHODOLOGY.source_series_ids),
    )
