import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

sys.path.insert(0, str(REPO_ROOT / "scripts"))
sys.path.insert(0, str(REPO_ROOT / "backend"))

import provenance_audit
from seed_metadata import SERIES

MANIFEST_PATH = REPO_ROOT / "config" / "provenance-manifest.json"
OPERATIONS_PATH = REPO_ROOT / "config" / "provenance-operations.json"


def test_operations_registry_aligns_with_public_manifest():
    manifest = provenance_audit.load_json(MANIFEST_PATH)
    operations = provenance_audit.load_json(OPERATIONS_PATH)

    assert provenance_audit.validate_registry_alignment(manifest, operations) == []


def test_operations_registry_artifacts_and_seeded_series_exist():
    operations = provenance_audit.load_json(OPERATIONS_PATH)
    seeded_series_ids = {entry["series_id"] for entry in SERIES}

    for chart in operations["charts"]:
        assert chart["collector_artifacts"], f"{chart['id']} must declare collector_artifacts"
        for artifact in chart["collector_artifacts"]:
            assert (REPO_ROOT / artifact).exists(), f"{chart['id']} references missing artifact {artifact}"

        if chart["coverage_type"] == "series":
            assert chart["required_series_ids"], f"{chart['id']} must declare required series coverage"
            assert set(chart["required_series_ids"]) <= seeded_series_ids

        if chart["coverage_type"] == "snapshot":
            assert chart["required_snapshot_tables"], f"{chart['id']} must declare required snapshot tables"


def test_audit_chart_payload_reports_contract_mismatches():
    manifest = provenance_audit.load_json(MANIFEST_PATH)
    operations = provenance_audit.load_json(OPERATIONS_PATH)
    chart = next(entry for entry in manifest["charts"] if entry["id"] == "overview.bullet-targets")
    ops_entry = provenance_audit.index_operations_registry(operations)["overview.bullet-targets"]

    errors = provenance_audit.audit_chart_payload(
        chart,
        ops_entry,
        {
            "source": "Source: Test",
            "methodology_type": "illustrative",
            "freshness_status": "pending",
            "source_series_ids": ["GDP"],
        },
    )

    assert any("methodology_type mismatch" in error for error in errors)
    assert any("methodology_note is required" in error for error in errors)
    assert any("freshness_status must be one of" in error for error in errors)
    assert any("regressed to illustrative methodology" in error for error in errors)
    assert any("payload source_series_ids missing required coverage IDs" in error for error in errors)
