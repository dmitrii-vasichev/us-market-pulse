from datetime import date

from app.services.gdp_waterfall import build_gdp_waterfall_response


def test_build_gdp_waterfall_response_uses_stored_component_values():
    response = build_gdp_waterfall_response(
        [
            {"series_id": "DPCERY2Q224SBEA", "date": date(2025, 10, 1), "value": 1.12},
            {"series_id": "A007RY2Q224SBEA", "date": date(2025, 10, 1), "value": 0.48},
            {"series_id": "A822RY2Q224SBEA", "date": date(2025, 10, 1), "value": 0.31},
            {"series_id": "A019RY2Q224SBEA", "date": date(2025, 10, 1), "value": -0.26},
            {"series_id": "A014RY2Q224SBEA", "date": date(2025, 10, 1), "value": 0.52},
        ],
        [
            {
                "series_id": "DPCERY2Q224SBEA",
                "title": "Contributions to percent change in real gross domestic product: Personal consumption expenditures",
                "source": "FRED",
            },
            {
                "series_id": "A007RY2Q224SBEA",
                "title": "Contributions to percent change in real gross domestic product: Gross private domestic investment: Fixed investment",
                "source": "FRED",
            },
            {
                "series_id": "A822RY2Q224SBEA",
                "title": "Contributions to percent change in real gross domestic product: Government consumption expenditures and gross investment",
                "source": "FRED",
            },
            {
                "series_id": "A019RY2Q224SBEA",
                "title": "Contributions to percent change in real gross domestic product: Net exports of goods and services",
                "source": "FRED",
            },
            {
                "series_id": "A014RY2Q224SBEA",
                "title": "Contributions to percent change in real gross domestic product: Gross private domestic investment: Change in private inventories",
                "source": "FRED",
            },
        ],
    )

    assert response["quarter"] == "2025-10-01"
    assert response["total_growth"] == 2.17
    assert response["components"] == [
        {"id": "consumer", "label": "Consumer Spending", "value": 1.12},
        {"id": "business", "label": "Business Investment", "value": 0.48},
        {"id": "government", "label": "Government", "value": 0.31},
        {"id": "net_exports", "label": "Net Exports", "value": -0.26},
        {"id": "inventory", "label": "Inventory Change", "value": 0.52},
    ]
    assert response["source"] == "Source: BEA Contributions to Real GDP Growth · Q4 2025"
    assert response["methodology_type"] == "source_backed"
    assert response["methodology_note"] is None
    assert response["methodology_key"] == "gdp_waterfall_component_series"
    assert [item["series_id"] for item in response["methodology_inputs"]] == [
        "DPCERY2Q224SBEA",
        "A007RY2Q224SBEA",
        "A822RY2Q224SBEA",
        "A019RY2Q224SBEA",
        "A014RY2Q224SBEA",
    ]


def test_build_gdp_waterfall_response_falls_back_to_latest_complete_quarter():
    response = build_gdp_waterfall_response(
        [
            {"series_id": "DPCERY2Q224SBEA", "date": date(2026, 1, 1), "value": 1.05},
            {"series_id": "A007RY2Q224SBEA", "date": date(2026, 1, 1), "value": 0.33},
            {"series_id": "A822RY2Q224SBEA", "date": date(2026, 1, 1), "value": 0.24},
            {"series_id": "A019RY2Q224SBEA", "date": date(2026, 1, 1), "value": -0.11},
            {"series_id": "DPCERY2Q224SBEA", "date": date(2025, 10, 1), "value": 0.97},
            {"series_id": "A007RY2Q224SBEA", "date": date(2025, 10, 1), "value": 0.41},
            {"series_id": "A822RY2Q224SBEA", "date": date(2025, 10, 1), "value": 0.18},
            {"series_id": "A019RY2Q224SBEA", "date": date(2025, 10, 1), "value": -0.22},
            {"series_id": "A014RY2Q224SBEA", "date": date(2025, 10, 1), "value": 0.37},
        ],
        [],
    )

    assert response["quarter"] == "2025-10-01"
    assert response["total_growth"] == 1.71
    assert response["components"][-1] == {
        "id": "inventory",
        "label": "Inventory Change",
        "value": 0.37,
    }


def test_build_gdp_waterfall_response_returns_empty_payload_without_complete_set():
    response = build_gdp_waterfall_response(
        [
            {"series_id": "DPCERY2Q224SBEA", "date": date(2026, 1, 1), "value": 1.05},
            {"series_id": "A007RY2Q224SBEA", "date": date(2026, 1, 1), "value": 0.33},
        ],
        [],
    )

    assert response["quarter"] is None
    assert response["total_growth"] == 0
    assert response["components"] == []
    assert response["source"] == "Source: BEA Contributions to Real GDP Growth"
