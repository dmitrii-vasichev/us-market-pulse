"""Audit public chart provenance against the manifest and operations registry."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

import httpx

REPO_ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = REPO_ROOT / "config" / "provenance-manifest.json"
OPERATIONS_PATH = REPO_ROOT / "config" / "provenance-operations.json"
VALID_FRESHNESS_STATUSES = {"current", "stale", "unknown"}


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def get_public_manifest_charts(manifest: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        chart
        for chart in manifest.get("charts", [])
        if chart.get("public") is True and chart.get("current_runtime_visibility") == "public"
    ]


def index_operations_registry(operations: dict[str, Any]) -> dict[str, dict[str, Any]]:
    charts = operations.get("charts", [])
    return {str(chart["id"]): chart for chart in charts}


def validate_registry_alignment(
    manifest: dict[str, Any],
    operations: dict[str, Any],
) -> list[str]:
    errors: list[str] = []
    public_charts = get_public_manifest_charts(manifest)
    public_ids = {str(chart["id"]) for chart in public_charts}
    operations_index = index_operations_registry(operations)
    operation_ids = set(operations_index)

    missing_ids = sorted(public_ids - operation_ids)
    extra_ids = sorted(operation_ids - public_ids)
    if missing_ids:
        errors.append(
            f"operations registry missing public chart IDs: {', '.join(missing_ids)}"
        )
    if extra_ids:
        errors.append(
            f"operations registry contains non-public or unknown chart IDs: {', '.join(extra_ids)}"
        )

    for chart in public_charts:
        ops_entry = operations_index.get(str(chart["id"]))
        if not ops_entry:
            continue

        if ops_entry.get("endpoint") != chart.get("endpoint"):
            errors.append(
                f"{chart['id']}: endpoint mismatch between manifest and operations registry"
            )
        if ops_entry.get("freshness_cadence") != chart.get("freshness_cadence"):
            errors.append(
                f"{chart['id']}: freshness cadence mismatch between manifest and operations registry"
            )

    return errors


def audit_chart_payload(
    chart: dict[str, Any],
    ops_entry: dict[str, Any],
    payload: dict[str, Any],
) -> list[str]:
    errors: list[str] = []
    chart_id = str(chart["id"])

    if payload.get("methodology_type") != chart.get("methodology_type"):
        errors.append(
            f"{chart_id}: methodology_type mismatch ({payload.get('methodology_type')} != {chart.get('methodology_type')})"
        )

    if chart.get("methodology_note_required") and not payload.get("methodology_note"):
        errors.append(f"{chart_id}: methodology_note is required but missing")

    if not payload.get("source"):
        errors.append(f"{chart_id}: source label is missing")

    freshness_status = payload.get("freshness_status")
    if freshness_status not in VALID_FRESHNESS_STATUSES:
        errors.append(
            f"{chart_id}: freshness_status must be one of {sorted(VALID_FRESHNESS_STATUSES)}, received {freshness_status!r}"
        )

    if payload.get("methodology_type") == "illustrative":
        errors.append(f"{chart_id}: public payload regressed to illustrative methodology")

    if ops_entry.get("coverage_type") == "series":
        required_series_ids = set(ops_entry.get("required_series_ids") or [])
        response_series_ids = set(payload.get("source_series_ids") or [])
        if required_series_ids and not required_series_ids.issubset(response_series_ids):
            missing_ids = sorted(required_series_ids - response_series_ids)
            errors.append(
                f"{chart_id}: payload source_series_ids missing required coverage IDs: {', '.join(missing_ids)}"
            )

    return errors


def run_audit(
    *,
    base_url: str,
    manifest_path: Path = MANIFEST_PATH,
    operations_path: Path = OPERATIONS_PATH,
    timeout: float = 20.0,
) -> tuple[list[str], int]:
    manifest = load_json(manifest_path)
    operations = load_json(operations_path)
    errors = validate_registry_alignment(manifest, operations)
    charts = get_public_manifest_charts(manifest)
    operations_index = index_operations_registry(operations)
    endpoint_cache: dict[str, dict[str, Any]] = {}
    checked_endpoints = 0
    normalized_base_url = base_url.rstrip("/")

    with httpx.Client(timeout=timeout) as client:
        for chart in charts:
            endpoint = str(chart["endpoint"])
            payload = endpoint_cache.get(endpoint)
            if payload is None:
                checked_endpoints += 1
                response = client.get(f"{normalized_base_url}{endpoint}")
                if response.status_code != 200:
                    errors.append(
                        f"{chart['id']}: endpoint {endpoint} returned HTTP {response.status_code}"
                    )
                    continue
                payload = response.json()
                endpoint_cache[endpoint] = payload

            ops_entry = operations_index.get(str(chart["id"]))
            if not ops_entry:
                continue
            errors.extend(audit_chart_payload(chart, ops_entry, payload))

    return errors, checked_endpoints


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Audit public chart provenance against the manifest and operations registry.",
    )
    parser.add_argument(
        "--base-url",
        required=True,
        help="Backend base URL, for example http://localhost:8000 or https://backend.example.com",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=20.0,
        help="HTTP timeout in seconds.",
    )
    args = parser.parse_args()

    errors, checked_endpoints = run_audit(
        base_url=args.base_url,
        timeout=args.timeout,
    )

    if errors:
        print(
            f"Provenance audit failed with {len(errors)} issue(s) across {checked_endpoints} checked endpoint(s)."
        )
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        f"Provenance audit passed for {checked_endpoints} public endpoint(s) against the manifest and operations registry."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
