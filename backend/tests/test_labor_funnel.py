from datetime import date

from app.services.labor_funnel import build_labor_funnel_response


def test_build_labor_funnel_response_uses_aligned_multi_input_values():
    response = build_labor_funnel_response(
        [
            {"series_id": "GDP", "date": date(2025, 10, 1), "value": 29610.4},
            {"series_id": "A023RC1Q027SBEA", "date": date(2025, 10, 1), "value": 29042.8},
            {"series_id": "COE", "date": date(2025, 10, 1), "value": 17188.5},
            {"series_id": "PAYEMS", "date": date(2025, 12, 1), "value": 159230.0},
            {"series_id": "PAYEMS", "date": date(2025, 11, 1), "value": 159010.0},
        ],
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
    )

    assert response["stages"] == [
        {
            "id": "gross_domestic_product",
            "label": "Gross Domestic Product",
            "value": 29610.4,
            "unit": "billions_usd",
            "source_input_key": "gross_domestic_product",
        },
        {
            "id": "gross_national_income",
            "label": "Gross National Income",
            "value": 29042.8,
            "unit": "billions_usd",
            "source_input_key": "gross_national_income",
        },
        {
            "id": "employee_compensation",
            "label": "Employee Compensation",
            "value": 17188.5,
            "unit": "billions_usd",
            "source_input_key": "employee_compensation",
        },
        {
            "id": "nonfarm_payroll_employment",
            "label": "Nonfarm Payroll Employment",
            "value": 159.23,
            "unit": "millions_persons",
            "source_input_key": "nonfarm_payroll_employment",
        },
    ]
    assert response["source"] == "Source: BEA, BLS · Q4 2025"
    assert response["methodology_type"] == "derived"
    assert response["latest_observation_date"] == "2025-12-01"
    assert response["latest_month"] == "Q4 2025"
    assert response["methodology_key"] == "labor_funnel_multi_input_alignment"
    assert response["source_series_ids"] == ["GDP", "A023RC1Q027SBEA", "COE", "PAYEMS"]
    assert [item["key"] for item in response["methodology_inputs"]] == [
        "gross_domestic_product",
        "gross_national_income",
        "employee_compensation",
        "nonfarm_payroll_employment",
        "aligned_stage_mapping_policy",
    ]
    assert response["methodology_inputs"][3]["unit"] == "Thousands of Persons"
    assert "latest PAYEMS month inside that same quarter" in response["methodology_note"]


def test_build_labor_funnel_response_falls_back_to_latest_aligned_quarter():
    response = build_labor_funnel_response(
        [
            {"series_id": "GDP", "date": date(2026, 1, 1), "value": 30010.0},
            {"series_id": "A023RC1Q027SBEA", "date": date(2026, 1, 1), "value": 29440.0},
            {"series_id": "PAYEMS", "date": date(2026, 3, 1), "value": 159880.0},
            {"series_id": "GDP", "date": date(2025, 10, 1), "value": 29610.4},
            {"series_id": "A023RC1Q027SBEA", "date": date(2025, 10, 1), "value": 29042.8},
            {"series_id": "COE", "date": date(2025, 10, 1), "value": 17188.5},
            {"series_id": "PAYEMS", "date": date(2025, 12, 1), "value": 159230.0},
        ],
        [],
    )

    assert response["source"] == "Source: BEA, BLS · Q4 2025"
    assert response["latest_observation_date"] == "2025-12-01"
    assert response["stages"][0]["value"] == 29610.4
    assert response["stages"][-1]["value"] == 159.23


def test_build_labor_funnel_response_returns_empty_payload_without_aligned_set():
    response = build_labor_funnel_response(
        [
            {"series_id": "GDP", "date": date(2025, 10, 1), "value": 29610.4},
            {"series_id": "A023RC1Q027SBEA", "date": date(2025, 10, 1), "value": 29042.8},
            {"series_id": "PAYEMS", "date": date(2025, 12, 1), "value": 159230.0},
        ],
        [],
    )

    assert response["stages"] == []
    assert response["source"] == "Source: BEA, BLS"
    assert response["latest_observation_date"] is None
