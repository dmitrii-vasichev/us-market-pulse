from datetime import date

from app.services.methodology import (
    KPI_SUMMARY_CURRENT_METHODOLOGY,
    LABOR_FUNNEL_CURRENT_METHODOLOGY,
)
from app.services.provenance import (
    build_chart_methodology_provenance,
    build_provenance,
    build_source_label,
    format_display_period,
)


def test_build_provenance_formats_monthly_metadata():
    provenance = build_provenance(
        source_name="BLS",
        methodology_type="source_backed",
        latest_date=date(2025, 12, 1),
        period_kind="month",
        source_dataset="BLS State Unemployment Rates",
        source_series_ids=["LASST080000000000003"],
    )

    assert provenance.source == "Source: BLS · Dec 2025"
    assert provenance.latest_observation_date == "2025-12-01"
    assert provenance.latest_month == "Dec 2025"
    assert provenance.source_dataset == "BLS State Unemployment Rates"
    assert provenance.source_series_ids == ["LASST080000000000003"]


def test_build_provenance_formats_quarterly_metadata():
    provenance = build_provenance(
        source_name="BEA",
        methodology_type="derived",
        latest_date=date(2025, 10, 1),
        period_kind="quarter",
        methodology_note="Derived from stored GDP growth inputs.",
    )

    assert provenance.source == "Source: BEA · Q4 2025"
    assert provenance.latest_observation_date == "2025-10-01"
    assert provenance.latest_month == "Q4 2025"
    assert provenance.methodology_note == "Derived from stored GDP growth inputs."


def test_build_provenance_formats_annual_metadata():
    provenance = build_provenance(
        source_name="BLS, BEA, Census",
        methodology_type="derived",
        latest_date=date(2025, 1, 1),
        period_kind="year",
        methodology_note="Computed from stored annual inputs.",
    )

    assert provenance.source == "Source: BLS, BEA, Census · 2025"
    assert provenance.latest_observation_date == "2025-01-01"
    assert provenance.latest_month == "2025"
    assert provenance.methodology_note == "Computed from stored annual inputs."


def test_build_provenance_omits_latest_fields_when_date_missing():
    provenance = build_provenance(
        source_name="BLS",
        methodology_type="source_backed",
        latest_date=None,
        period_kind="month",
    )

    assert provenance.source == "Source: BLS"
    assert provenance.latest_observation_date is None
    assert provenance.latest_month is None


def test_build_source_label_formats_full_dates_consistently():
    assert format_display_period(date(2026, 3, 15), "date") == "Mar 15, 2026"
    assert build_source_label("Federal Reserve", date(2026, 3, 15), "date") == "Source: Federal Reserve · Mar 15, 2026"


def test_build_chart_methodology_provenance_serializes_structured_inputs():
    provenance = build_chart_methodology_provenance(
        KPI_SUMMARY_CURRENT_METHODOLOGY,
        [
            {
                "series_id": "GDP",
                "title": "Real Gross Domestic Product",
                "source": "FRED",
                "frequency": "Quarterly",
            },
            {
                "series_id": "FEDFUNDS",
                "title": "Federal Funds Effective Rate",
                "source": "FRED",
                "frequency": "Daily",
            },
        ],
        latest_date=date(2026, 3, 10),
    )

    assert provenance.source == "Source: FRED · Mar 10, 2026"
    assert provenance.methodology_key == "kpi_summary_current_threshold_policy"
    assert provenance.methodology_inputs is not None
    assert provenance.methodology_inputs[0].dataset == "Real Gross Domestic Product"
    assert provenance.methodology_inputs[0].series_id == "GDP"
    assert provenance.methodology_inputs[-1].kind == "derived_policy"
    assert provenance.methodology_inputs[-1].source == "Backend policy"


def test_build_chart_methodology_provenance_uses_definition_fallbacks_when_metadata_missing():
    provenance = build_chart_methodology_provenance(
        LABOR_FUNNEL_CURRENT_METHODOLOGY,
        [],
        latest_date=None,
        period_kind="quarter",
    )

    assert provenance.source == "Source: FRED"
    assert provenance.source_dataset == "Gross Domestic Product"
    assert provenance.methodology_key == "labor_funnel_current_share_split"
    assert provenance.methodology_inputs is not None
    assert provenance.methodology_inputs[0].dataset == "Gross Domestic Product"
    assert provenance.methodology_inputs[1].kind == "derived_policy"
