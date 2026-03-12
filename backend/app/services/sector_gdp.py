"""Service helpers for the sector GDP endpoint."""

from __future__ import annotations

import math
from datetime import date
from typing import Any, Mapping, Sequence

from app.db.queries import get_latest_sector_gdp_snapshot
from app.services.provenance import build_provenance

FALLBACK_ROOT_LABEL = "US GDP"
FALLBACK_SOURCE_NAME = "BEA"
FALLBACK_SOURCE_DATASET = "GDP by Industry, current-dollar value added by industry"
METHODOLOGY_NOTE = (
    "Sector leaf values are derived as percent shares of the latest stored BEA "
    "current-dollar GDP-by-industry snapshot using the configured public hierarchy."
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


def _sorted_rows(snapshot_rows: Sequence[Mapping[str, Any]]) -> list[Mapping[str, Any]]:
    return sorted(
        snapshot_rows,
        key=lambda row: (
            int(_read_field(row, "depth") or 0),
            int(_read_field(row, "display_order") or 0),
            str(_read_field(row, "node_key") or ""),
        ),
    )


def _allocate_leaf_share_percentages(
    leaf_rows: Sequence[Mapping[str, Any]],
    root_total: float,
) -> dict[str, float]:
    if root_total <= 0 or not leaf_rows:
        return {
            str(_read_field(row, "node_key")): 0.0
            for row in leaf_rows
            if _read_field(row, "node_key")
        }

    allocations: dict[str, int] = {}
    remainders: list[tuple[float, int, str]] = []
    allocated_basis_points = 0
    total_basis_points = 10_000

    for row in leaf_rows:
        node_key = str(_read_field(row, "node_key") or "")
        raw_value = float(_read_field(row, "value_current_dollars") or 0.0)
        raw_basis_points = (raw_value / root_total) * total_basis_points
        floor_basis_points = math.floor(raw_basis_points)
        allocations[node_key] = floor_basis_points
        allocated_basis_points += floor_basis_points
        remainders.append(
            (
                raw_basis_points - floor_basis_points,
                int(_read_field(row, "display_order") or 0),
                node_key,
            )
        )

    remaining_basis_points = total_basis_points - allocated_basis_points
    for _, _, node_key in sorted(
        remainders,
        key=lambda item: (-item[0], item[1], item[2]),
    )[:remaining_basis_points]:
        allocations[node_key] += 1

    return {
        node_key: round(basis_points / 100, 2)
        for node_key, basis_points in allocations.items()
    }


def build_sector_gdp_response(snapshot_rows: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    sorted_rows = _sorted_rows(snapshot_rows)

    latest_date = max(
        (_coerce_date(_read_field(row, "snapshot_date")) for row in sorted_rows),
        default=None,
    )
    source_name = next(
        (
            str(_read_field(row, "source_provider"))
            for row in sorted_rows
            if _read_field(row, "source_provider")
        ),
        FALLBACK_SOURCE_NAME,
    )
    source_dataset = next(
        (
            str(_read_field(row, "source_dataset"))
            for row in sorted_rows
            if _read_field(row, "source_dataset")
        ),
        FALLBACK_SOURCE_DATASET,
    )

    root_row = next((row for row in sorted_rows if int(_read_field(row, "depth") or 0) == 0), None)
    group_rows = [
        row for row in sorted_rows if int(_read_field(row, "depth") or 0) == 1
    ]
    leaf_rows = [
        row for row in sorted_rows if int(_read_field(row, "depth") or 0) >= 2
    ]

    root_total = float(_read_field(root_row, "value_current_dollars") or 0.0)
    if root_total <= 0:
        root_total = sum(float(_read_field(row, "value_current_dollars") or 0.0) for row in group_rows)
    if root_total <= 0:
        root_total = sum(float(_read_field(row, "value_current_dollars") or 0.0) for row in leaf_rows)

    leaf_share_percentages = _allocate_leaf_share_percentages(leaf_rows, root_total)
    leaves_by_parent: dict[str, list[dict[str, Any]]] = {}
    for row in leaf_rows:
        parent_node_key = str(_read_field(row, "parent_node_key") or "")
        node_key = str(_read_field(row, "node_key") or "")
        leaves_by_parent.setdefault(parent_node_key, []).append(
            {
                "name": str(_read_field(row, "node_label") or node_key),
                "value": leaf_share_percentages.get(node_key, 0.0),
                "_display_order": int(_read_field(row, "display_order") or 0),
                "_node_key": node_key,
            }
        )

    tree_children: list[dict[str, Any]] = []
    for row in group_rows:
        node_key = str(_read_field(row, "node_key") or "")
        raw_children = leaves_by_parent.get(node_key, [])
        children = [
            {
                "name": child["name"],
                "value": child["value"],
            }
            for child in sorted(
                raw_children,
                key=lambda child: (child["_display_order"], child["_node_key"]),
            )
        ]
        tree_children.append(
            {
                "name": str(_read_field(row, "node_label") or node_key),
                "children": children,
            }
        )

    provenance = build_provenance(
        source_name=source_name,
        methodology_type="derived",
        latest_date=latest_date,
        period_kind="quarter",
        methodology_note=METHODOLOGY_NOTE,
        source_dataset=source_dataset,
    )

    return {
        "tree": {
            "name": str(_read_field(root_row, "node_label") or FALLBACK_ROOT_LABEL),
            "children": tree_children,
        },
        **provenance.model_dump(),
    }


async def get_sector_gdp_response(conn) -> dict[str, Any]:
    snapshot_rows = await get_latest_sector_gdp_snapshot(conn)
    return build_sector_gdp_response(snapshot_rows)
