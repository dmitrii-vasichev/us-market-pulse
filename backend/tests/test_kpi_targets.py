from datetime import date

from app.services.kpi_targets import (
    build_kpi_summary_provenance,
    build_kpi_target_policy,
)


def test_build_kpi_target_policy_uses_backend_measure_selection():
    gdp_policy = build_kpi_target_policy(
        {
            "key": "gdp",
            "current_value": 28000.0,
            "change_percent": 0.72,
        }
    )
    fed_policy = build_kpi_target_policy(
        {
            "key": "fed_rate",
            "current_value": 4.5,
            "change_percent": 0.0,
        }
    )

    assert gdp_policy is not None
    assert gdp_policy.measure == 0.72
    assert gdp_policy.measure_field == "change_percent"
    assert gdp_policy.markers == [3.0]
    assert gdp_policy.policy_note.startswith("Compare quarterly GDP growth")

    assert fed_policy is not None
    assert fed_policy.measure == 4.5
    assert fed_policy.measure_field == "current_value"
    assert fed_policy.markers == [3.0]


def test_build_kpi_summary_provenance_uses_explicit_source_union():
    provenance = build_kpi_summary_provenance(
        [
            {
                "series_id": "GDP",
                "title": "Real Gross Domestic Product",
                "source": "FRED",
            },
            {
                "series_id": "FEDFUNDS",
                "title": "Federal Funds Effective Rate",
                "source": "FRED",
            },
        ],
        latest_date=date(2026, 3, 10),
    )

    assert provenance.source == "Source: BEA, BLS, Federal Reserve · Mar 10, 2026"
    assert provenance.methodology_inputs is not None
    assert provenance.methodology_inputs[0].source == "BEA via FRED"
    assert provenance.methodology_inputs[-1].source == "Backend policy"
