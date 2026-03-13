"""Phase 3 rollout verification regressions."""

from datetime import date, datetime
from decimal import Decimal
from unittest.mock import AsyncMock, patch


async def test_post_phase3_remaining_derived_endpoints_keep_documented_methodology_contracts(client):
    c, mock_conn = client
    mock_conn.fetch.side_effect = [
        [
            {
                "series_id": "GDP",
                "title": "Gross Domestic Product",
                "source": "FRED",
                "units": "Billions of Dollars",
            },
            {
                "series_id": "A023RC1Q027SBEA",
                "title": "Gross National Income",
                "source": "FRED",
                "units": "Billions of Dollars",
            },
            {
                "series_id": "COE",
                "title": "National Income: Compensation of Employees, Paid",
                "source": "FRED",
                "units": "Billions of Dollars",
            },
            {
                "series_id": "PAYEMS",
                "title": "All Employees, Total Nonfarm",
                "source": "FRED",
                "units": "Thousands of Persons",
            },
        ],
        [
            {"series_id": "GDP", "date": date(2025, 10, 1), "value": Decimal("29610.4")},
            {"series_id": "A023RC1Q027SBEA", "date": date(2025, 10, 1), "value": Decimal("29042.8")},
            {"series_id": "COE", "date": date(2025, 10, 1), "value": Decimal("17188.5")},
            {"series_id": "PAYEMS", "date": date(2025, 12, 1), "value": Decimal("159230")},
        ],
        [
            {
                "snapshot_date": date(2025, 1, 1),
                "period_label": "2025",
                "state_code": "CA",
                "state_name": "California",
                "display_order": 1,
                "unemployment_rate": Decimal("5.1"),
                "gdp_current_dollars": Decimal("3239000000000"),
                "population": 39500000,
                "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
                "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
                "source_metadata": {"year": 2025},
                "collected_at": None,
            },
            {
                "snapshot_date": date(2025, 1, 1),
                "period_label": "2025",
                "state_code": "CO",
                "state_name": "Colorado",
                "display_order": 8,
                "unemployment_rate": Decimal("3.2"),
                "gdp_current_dollars": Decimal("435000000000"),
                "population": 5800000,
                "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
                "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
                "source_metadata": {"year": 2025},
                "collected_at": None,
            },
        ],
        [
            {
                "snapshot_date": date(2025, 10, 1),
                "period_label": "Q4 2025",
                "node_key": "root",
                "parent_node_key": None,
                "node_label": "US GDP",
                "depth": 0,
                "display_order": 0,
                "value_current_dollars": Decimal("1000"),
                "source_provider": "BEA",
                "source_dataset": "GDP by Industry, current-dollar value added by industry",
                "source_metadata": {},
                "collected_at": None,
            },
            {
                "snapshot_date": date(2025, 10, 1),
                "period_label": "Q4 2025",
                "node_key": "services",
                "parent_node_key": "root",
                "node_label": "Services",
                "depth": 1,
                "display_order": 1,
                "value_current_dollars": Decimal("1000"),
                "source_provider": "BEA",
                "source_dataset": "GDP by Industry, current-dollar value added by industry",
                "source_metadata": {},
                "collected_at": None,
            },
            {
                "snapshot_date": date(2025, 10, 1),
                "period_label": "Q4 2025",
                "node_key": "services.finance",
                "parent_node_key": "services",
                "node_label": "Finance & Insurance",
                "depth": 2,
                "display_order": 1,
                "value_current_dollars": Decimal("600"),
                "source_provider": "BEA",
                "source_dataset": "GDP by Industry, current-dollar value added by industry",
                "source_metadata": {},
                "collected_at": None,
            },
            {
                "snapshot_date": date(2025, 10, 1),
                "period_label": "Q4 2025",
                "node_key": "services.real-estate",
                "parent_node_key": "services",
                "node_label": "Real Estate",
                "depth": 2,
                "display_order": 2,
                "value_current_dollars": Decimal("400"),
                "source_provider": "BEA",
                "source_dataset": "GDP by Industry, current-dollar value added by industry",
                "source_metadata": {},
                "collected_at": None,
            },
        ],
    ]
    mock_conn.fetchrow.side_effect = [
        {"run_date": datetime(2026, 3, 10, 6, 0), "status": "success", "series_collected": 16, "records_inserted": 480},
        {"series_id": "GDP", "title": "Real Gross Domestic Product", "units": "Billions", "frequency": "Quarterly", "source": "FRED", "category": "gdp", "last_updated": None},
        {"series_id": "CPIAUCSL", "title": "Consumer Price Index for All Urban Consumers", "units": "Index", "frequency": "Monthly", "source": "FRED", "category": "inflation", "last_updated": None},
        {"series_id": "UNRATE", "title": "Unemployment Rate", "units": "Percent", "frequency": "Monthly", "source": "FRED", "category": "labor", "last_updated": None},
        {"series_id": "FEDFUNDS", "title": "Federal Funds Effective Rate", "units": "Percent", "frequency": "Daily", "source": "FRED", "category": "rates", "last_updated": None},
        {"latest_date": date(2025, 10, 1)},
        {"latest_date": date(2026, 1, 1)},
        {"latest_date": date(2026, 1, 1)},
        {"latest_date": date(2026, 3, 10)},
    ]

    sample_kpis = [
        {
            "key": "gdp",
            "label": "Total GDP",
            "current_value": 28000.0,
            "previous_value": 27800.0,
            "change_absolute": 200.0,
            "change_percent": 0.72,
            "period_label": "QoQ",
            "positive_is_good": True,
            "format": "trillions",
            "sparkline": [{"date": "2025-10-01", "value": 28000.0}],
        },
        {
            "key": "cpi",
            "label": "Inflation Rate",
            "current_value": 309.0,
            "previous_value": 301.0,
            "change_absolute": 8.0,
            "change_percent": 2.7,
            "period_label": "YoY",
            "positive_is_good": False,
            "format": "percent_change",
            "sparkline": [{"date": "2026-01-01", "value": 309.0}],
        },
        {
            "key": "unemployment",
            "label": "Unemployment",
            "current_value": 4.1,
            "previous_value": 4.0,
            "change_absolute": 0.1,
            "change_percent": 2.5,
            "period_label": "MoM",
            "positive_is_good": False,
            "format": "percent",
            "sparkline": [{"date": "2026-01-01", "value": 4.1}],
        },
        {
            "key": "fed_rate",
            "label": "Fed Funds Rate",
            "current_value": 4.5,
            "previous_value": 4.5,
            "change_absolute": 0.0,
            "change_percent": 0.0,
            "period_label": "Current",
            "positive_is_good": False,
            "format": "percent",
            "sparkline": [{"date": "2026-03-10", "value": 4.5}],
        },
    ]

    with patch("app.api.v1.kpi.compute_all_kpis", new=AsyncMock(return_value=sample_kpis)):
        responses = {
            "/api/v1/labor/funnel": await c.get("/api/v1/labor/funnel"),
            "/api/v1/states/comparison": await c.get("/api/v1/states/comparison"),
            "/api/v1/sectors/gdp": await c.get("/api/v1/sectors/gdp"),
            "/api/v1/kpi/summary": await c.get("/api/v1/kpi/summary"),
        }

    expectations = {
        "/api/v1/labor/funnel": {
            "source": "Source: BEA, BLS · Q4 2025",
            "latest_observation_date": "2025-12-01",
            "methodology_key": "labor_funnel_multi_input_alignment",
            "note_fragment": "converted from thousands to millions of persons",
        },
        "/api/v1/states/comparison": {
            "source": "Source: BLS, BEA, Census · 2025",
            "latest_observation_date": "2025-01-01",
            "methodology_key": None,
            "note_fragment": "GDP per capita is computed",
        },
        "/api/v1/sectors/gdp": {
            "source": "Source: BEA · Q4 2025",
            "latest_observation_date": "2025-10-01",
            "methodology_key": None,
            "note_fragment": "percent shares",
        },
        "/api/v1/kpi/summary": {
            "source": "Source: BEA, BLS, Federal Reserve · Mar 10, 2026",
            "latest_observation_date": "2026-03-10",
            "methodology_key": "kpi_summary_current_threshold_policy",
            "note_fragment": "backend-owned target bands",
        },
    }

    for path, expectation in expectations.items():
        response = responses[path]
        assert response.status_code == 200
        payload = response.json()
        assert payload["methodology_type"] == "derived"
        assert payload["source"] == expectation["source"]
        assert payload["latest_observation_date"] == expectation["latest_observation_date"]
        assert payload["methodology_note"] is not None
        assert expectation["note_fragment"] in payload["methodology_note"]
        assert payload["methodology_key"] == expectation["methodology_key"]

    labor_payload = responses["/api/v1/labor/funnel"].json()
    assert [item["key"] for item in labor_payload["methodology_inputs"]] == [
        "gross_domestic_product",
        "gross_national_income",
        "employee_compensation",
        "nonfarm_payroll_employment",
        "aligned_stage_mapping_policy",
    ]
    assert labor_payload["stages"][-1]["unit"] == "millions_persons"

    kpi_payload = responses["/api/v1/kpi/summary"].json()
    assert [item["key"] for item in kpi_payload["methodology_inputs"]] == [
        "gross_domestic_product",
        "consumer_price_index",
        "unemployment_rate",
        "fed_funds_rate",
        "bullet_target_policy",
    ]
    assert all(kpi["target_policy"] is not None for kpi in kpi_payload["kpis"])
    assert all(kpi["target_policy"]["policy_note"] for kpi in kpi_payload["kpis"])
