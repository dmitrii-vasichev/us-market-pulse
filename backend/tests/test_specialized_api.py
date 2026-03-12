"""Tests for specialized API endpoints."""

from decimal import Decimal
from datetime import date

import pytest


async def test_gdp_components(client):
    c, mock_conn = client
    mock_conn.fetchrow.side_effect = [
        {
            "series_id": "A191RL1Q225SBEA",
            "title": "Real GDP Growth Rate (Contributions by Component)",
            "units": "Percent",
            "frequency": "Quarterly",
            "source": "FRED",
            "category": "gdp",
            "last_updated": None,
        },
        {"date": date(2026, 1, 1), "value": Decimal("2.5")},
    ]

    resp = await c.get("/api/v1/gdp/components")
    assert resp.status_code == 200
    data = resp.json()
    assert "components" in data
    assert len(data["components"]) == 5
    assert data["total_growth"] == 2.5
    assert data["source"] == "Source: FRED · Q1 2026"
    assert data["methodology_type"] == "derived"
    assert data["latest_observation_date"] == "2026-01-01"
    assert data["latest_month"] == "Q1 2026"
    assert data["source_series_ids"] == ["A191RL1Q225SBEA"]
    assert "fixed backend share assumptions" in data["methodology_note"]


async def test_gdp_quarterly(client):
    c, mock_conn = client
    mock_conn.fetchrow.return_value = {
        "series_id": "A191RL1Q225SBEA",
        "title": "Real GDP Growth Rate (Contributions by Component)",
        "units": "Percent",
        "frequency": "Quarterly",
        "source": "FRED",
        "category": "gdp",
        "last_updated": None,
    }
    mock_conn.fetch.return_value = [
        {"date": date(2025, 10, 1), "value": Decimal("2.3")},
        {"date": date(2025, 7, 1), "value": Decimal("2.1")},
    ]

    resp = await c.get("/api/v1/gdp/quarterly")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["data"]) == 2
    assert data["source"] == "Source: FRED · Q4 2025"
    assert data["methodology_type"] == "source_backed"
    assert data["latest_observation_date"] == "2025-10-01"
    assert data["latest_month"] == "Q4 2025"
    assert data["source_series_ids"] == ["A191RL1Q225SBEA"]


async def test_cpi_calendar(client):
    c, mock_conn = client
    mock_conn.fetchrow.return_value = {
        "series_id": "CPIAUCSL",
        "title": "Consumer Price Index for All Urban Consumers",
        "units": "Index 1982-1984=100",
        "frequency": "Monthly",
        "source": "FRED",
        "category": "inflation",
        "last_updated": None,
    }
    # Need at least 13 months of data for YoY calculation
    rows = [
        {"date": date(2025, i, 1), "value": Decimal(str(300 + i * 0.3))}
        for i in range(1, 13)
    ] + [
        {"date": date(2026, 1, 1), "value": Decimal("310")}
    ]
    mock_conn.fetch.return_value = rows

    resp = await c.get("/api/v1/cpi/calendar")
    assert resp.status_code == 200
    data = resp.json()
    assert "data" in data
    assert data["source"] == "Source: FRED · Jan 2026"
    assert data["methodology_type"] == "source_backed"
    assert data["latest_observation_date"] == "2026-01-01"
    assert data["latest_month"] == "Jan 2026"
    assert data["source_series_ids"] == ["CPIAUCSL"]


async def test_cpi_categories(client):
    c, mock_conn = client
    mock_conn.fetch.return_value = [
        {
            "snapshot_date": date(2025, 12, 1),
            "period_label": "Dec 2025",
            "category_key": "housing",
            "category_label": "Housing",
            "display_order": 1,
            "relative_importance": Decimal("34.9"),
            "source_provider": "BLS",
            "source_dataset": "Consumer Price Index Relative Importance tables, U.S. city average, major groups",
            "source_metadata": {"release_year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 12, 1),
            "period_label": "Dec 2025",
            "category_key": "food",
            "category_label": "Food & Beverages",
            "display_order": 2,
            "relative_importance": Decimal("14.3"),
            "source_provider": "BLS",
            "source_dataset": "Consumer Price Index Relative Importance tables, U.S. city average, major groups",
            "source_metadata": {"release_year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 12, 1),
            "period_label": "Dec 2025",
            "category_key": "transport",
            "category_label": "Transportation",
            "display_order": 3,
            "relative_importance": Decimal("16.7"),
            "source_provider": "BLS",
            "source_dataset": "Consumer Price Index Relative Importance tables, U.S. city average, major groups",
            "source_metadata": {"release_year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 12, 1),
            "period_label": "Dec 2025",
            "category_key": "medical",
            "category_label": "Medical Care",
            "display_order": 4,
            "relative_importance": Decimal("8.9"),
            "source_provider": "BLS",
            "source_dataset": "Consumer Price Index Relative Importance tables, U.S. city average, major groups",
            "source_metadata": {"release_year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 12, 1),
            "period_label": "Dec 2025",
            "category_key": "education",
            "category_label": "Education & Communication",
            "display_order": 5,
            "relative_importance": Decimal("6.1"),
            "source_provider": "BLS",
            "source_dataset": "Consumer Price Index Relative Importance tables, U.S. city average, major groups",
            "source_metadata": {"release_year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 12, 1),
            "period_label": "Dec 2025",
            "category_key": "recreation",
            "category_label": "Recreation",
            "display_order": 6,
            "relative_importance": Decimal("5.6"),
            "source_provider": "BLS",
            "source_dataset": "Consumer Price Index Relative Importance tables, U.S. city average, major groups",
            "source_metadata": {"release_year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 12, 1),
            "period_label": "Dec 2025",
            "category_key": "apparel",
            "category_label": "Apparel",
            "display_order": 7,
            "relative_importance": Decimal("2.6"),
            "source_provider": "BLS",
            "source_dataset": "Consumer Price Index Relative Importance tables, U.S. city average, major groups",
            "source_metadata": {"release_year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 12, 1),
            "period_label": "Dec 2025",
            "category_key": "other",
            "category_label": "Other Goods & Services",
            "display_order": 8,
            "relative_importance": Decimal("10.6"),
            "source_provider": "BLS",
            "source_dataset": "Consumer Price Index Relative Importance tables, U.S. city average, major groups",
            "source_metadata": {"release_year": 2025},
            "collected_at": None,
        },
    ]

    resp = await c.get("/api/v1/cpi/categories")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["categories"]) == 8
    assert data["categories"][0] == {"id": "housing", "label": "Housing", "value": 34.9}
    assert data["total"] == 99.7
    assert data["source"] == "Source: BLS CPI Relative Importance · Dec 2025"
    assert data["methodology_type"] == "source_backed"
    assert data["latest_observation_date"] == "2025-12-01"
    assert data["latest_month"] == "Dec 2025"
    assert data["source_dataset"] == "Consumer Price Index Relative Importance tables, U.S. city average, major groups"
    assert data["source_series_ids"] is None
    assert data["methodology_note"] is None


async def test_cpi_categories_empty_snapshot_stays_source_backed(client):
    c, mock_conn = client
    mock_conn.fetch.return_value = []

    resp = await c.get("/api/v1/cpi/categories")
    assert resp.status_code == 200
    data = resp.json()
    assert data["categories"] == []
    assert data["total"] == 0.0
    assert data["source"] == "Source: BLS CPI Relative Importance"
    assert data["methodology_type"] == "source_backed"
    assert data["latest_observation_date"] is None
    assert data["methodology_note"] is None


async def test_labor_funnel(client):
    c, mock_conn = client
    mock_conn.fetchrow.side_effect = [
        {
            "series_id": "GDP",
            "title": "Gross Domestic Product",
            "units": "Billions of Dollars",
            "frequency": "Quarterly",
            "source": "FRED",
            "category": "gdp",
            "last_updated": None,
        },
        {"date": date(2025, 10, 1), "value": Decimal("28000")},
    ]

    resp = await c.get("/api/v1/labor/funnel")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["stages"]) == 5
    assert data["stages"][0]["label"] == "Total GDP"
    assert data["source"] == "Source: FRED · Q4 2025"
    assert data["methodology_type"] == "derived"
    assert data["latest_observation_date"] == "2025-10-01"
    assert data["latest_month"] == "Q4 2025"
    assert data["source_series_ids"] == ["GDP"]
    assert "fixed backend shares" in data["methodology_note"]


async def test_labor_ranking(client):
    c, mock_conn = client
    mock_conn.fetch.return_value = [
        {"series_id": "LASST060000000000003", "date": date(2025, 11, 1), "value": Decimal("5.6")},
        {"series_id": "LASST360000000000003", "date": date(2025, 11, 1), "value": Decimal("4.8")},
        {"series_id": "LASST480000000000003", "date": date(2025, 11, 1), "value": Decimal("4.4")},
        {"series_id": "LASST120000000000003", "date": date(2025, 11, 1), "value": Decimal("4.4")},
        {"series_id": "LASST170000000000003", "date": date(2025, 11, 1), "value": Decimal("4.6")},
        {"series_id": "LASST420000000000003", "date": date(2025, 11, 1), "value": Decimal("4.2")},
        {"series_id": "LASST390000000000003", "date": date(2025, 11, 1), "value": Decimal("4.6")},
        {"series_id": "LASST080000000000003", "date": date(2025, 11, 1), "value": Decimal("3.9")},
        {"series_id": "LASST320000000000003", "date": date(2025, 11, 1), "value": Decimal("5.3")},
        {"series_id": "LASST260000000000003", "date": date(2025, 11, 1), "value": Decimal("5.0")},
        {"series_id": "LASST060000000000003", "date": date(2025, 12, 1), "value": Decimal("5.5")},
        {"series_id": "LASST360000000000003", "date": date(2025, 12, 1), "value": Decimal("4.6")},
        {"series_id": "LASST480000000000003", "date": date(2025, 12, 1), "value": Decimal("4.3")},
        {"series_id": "LASST120000000000003", "date": date(2025, 12, 1), "value": Decimal("4.3")},
        {"series_id": "LASST170000000000003", "date": date(2025, 12, 1), "value": Decimal("4.6")},
        {"series_id": "LASST420000000000003", "date": date(2025, 12, 1), "value": Decimal("4.2")},
        {"series_id": "LASST390000000000003", "date": date(2025, 12, 1), "value": Decimal("4.5")},
        {"series_id": "LASST080000000000003", "date": date(2025, 12, 1), "value": Decimal("3.8")},
        {"series_id": "LASST320000000000003", "date": date(2025, 12, 1), "value": Decimal("5.2")},
        {"series_id": "LASST260000000000003", "date": date(2025, 12, 1), "value": Decimal("5.0")},
    ]

    resp = await c.get("/api/v1/labor/ranking")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["data"]) == 10
    assert "Colorado" in data["states"]
    assert data["source"] == "Source: BLS · Dec 2025"
    assert data["methodology_type"] == "source_backed"
    assert data["latest_observation_date"] == "2025-12-01"
    assert data["latest_month"] == "Dec 2025"
    assert data["source_dataset"] == "BLS State Unemployment Rates"
    assert len(data["source_series_ids"]) == 10
    assert data["freshness_status"] is None
    december_ranks = {
        item["id"]: item["data"][-1]["y"]
        for item in data["data"]
    }
    assert december_ranks["California"] == 1
    assert december_ranks["Nevada"] == 2
    assert december_ranks["Michigan"] == 3
    assert december_ranks["Colorado"] == 10


async def test_states_comparison(client):
    c, mock_conn = client
    mock_conn.fetch.return_value = [
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
            "state_code": "TX",
            "state_name": "Texas",
            "display_order": 2,
            "unemployment_rate": Decimal("4.0"),
            "gdp_current_dollars": Decimal("2040000000000"),
            "population": 30000000,
            "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
            "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
            "source_metadata": {"year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 1, 1),
            "period_label": "2025",
            "state_code": "NY",
            "state_name": "New York",
            "display_order": 3,
            "unemployment_rate": Decimal("4.5"),
            "gdp_current_dollars": Decimal("1818000000000"),
            "population": 20200000,
            "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
            "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
            "source_metadata": {"year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 1, 1),
            "period_label": "2025",
            "state_code": "FL",
            "state_name": "Florida",
            "display_order": 4,
            "unemployment_rate": Decimal("3.3"),
            "gdp_current_dollars": Decimal("1221000000000"),
            "population": 22200000,
            "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
            "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
            "source_metadata": {"year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 1, 1),
            "period_label": "2025",
            "state_code": "IL",
            "state_name": "Illinois",
            "display_order": 5,
            "unemployment_rate": Decimal("4.8"),
            "gdp_current_dollars": Decimal("921600000000"),
            "population": 12800000,
            "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
            "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
            "source_metadata": {"year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 1, 1),
            "period_label": "2025",
            "state_code": "PA",
            "state_name": "Pennsylvania",
            "display_order": 6,
            "unemployment_rate": Decimal("4.1"),
            "gdp_current_dollars": Decimal("819000000000"),
            "population": 13000000,
            "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
            "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
            "source_metadata": {"year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 1, 1),
            "period_label": "2025",
            "state_code": "OH",
            "state_name": "Ohio",
            "display_order": 7,
            "unemployment_rate": Decimal("3.9"),
            "gdp_current_dollars": Decimal("684400000000"),
            "population": 11800000,
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
        {
            "snapshot_date": date(2025, 1, 1),
            "period_label": "2025",
            "state_code": "WA",
            "state_name": "Washington",
            "display_order": 9,
            "unemployment_rate": Decimal("3.8"),
            "gdp_current_dollars": Decimal("616000000000"),
            "population": 7700000,
            "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
            "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
            "source_metadata": {"year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 1, 1),
            "period_label": "2025",
            "state_code": "MA",
            "state_name": "Massachusetts",
            "display_order": 10,
            "unemployment_rate": Decimal("3.5"),
            "gdp_current_dollars": Decimal("665000000000"),
            "population": 7000000,
            "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
            "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
            "source_metadata": {"year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 1, 1),
            "period_label": "2025",
            "state_code": "NV",
            "state_name": "Nevada",
            "display_order": 11,
            "unemployment_rate": Decimal("5.5"),
            "gdp_current_dollars": Decimal("161200000000"),
            "population": 3100000,
            "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
            "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
            "source_metadata": {"year": 2025},
            "collected_at": None,
        },
        {
            "snapshot_date": date(2025, 1, 1),
            "period_label": "2025",
            "state_code": "MI",
            "state_name": "Michigan",
            "display_order": 12,
            "unemployment_rate": Decimal("4.3"),
            "gdp_current_dollars": Decimal("540000000000"),
            "population": 10000000,
            "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
            "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
            "source_metadata": {"year": 2025},
            "collected_at": None,
        },
    ]

    resp = await c.get("/api/v1/states/comparison")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["data"]) == 1
    assert len(data["data"][0]["data"]) == 12
    assert data["data"][0]["id"] == "states"
    assert data["data"][0]["data"][0]["label"] == "California"
    assert data["data"][0]["data"][0]["x"] == 5.1
    assert data["data"][0]["data"][0]["y"] == 82_000.0
    assert data["data"][0]["data"][0]["size"] == 39.5
    colorado = next(item for item in data["data"][0]["data"] if item["label"] == "Colorado")
    assert colorado["highlighted"] is True
    assert colorado["y"] == 75_000.0
    assert data["source"] == "Source: BLS, BEA, Census · 2025"
    assert data["methodology_type"] == "derived"
    assert data["latest_observation_date"] == "2025-01-01"
    assert data["latest_month"] == "2025"
    assert data["source_dataset"] == (
        "Local Area Unemployment Statistics annual average unemployment rate by state; "
        "Annual current-dollar GDP by state; Annual state population estimates"
    )
    assert "GDP per capita is computed" in data["methodology_note"]
    assert data["source_series_ids"] is None


async def test_states_comparison_empty_snapshot_keeps_curated_group(client):
    c, mock_conn = client
    mock_conn.fetch.return_value = []

    resp = await c.get("/api/v1/states/comparison")

    assert resp.status_code == 200
    data = resp.json()
    assert data["data"] == [{"id": "states", "data": []}]
    assert data["source"] == "Source: BLS, BEA, Census"
    assert data["methodology_type"] == "derived"
    assert data["latest_observation_date"] is None
    assert data["latest_month"] is None
    assert "GDP per capita is computed" in data["methodology_note"]


async def test_rates_history(client):
    c, mock_conn = client
    mock_conn.fetch.side_effect = [
        [
            {
                "series_id": "FEDFUNDS",
                "title": "Federal Funds Effective Rate",
                "units": "Percent",
                "frequency": "Daily",
                "source": "FRED",
                "category": "rates",
                "last_updated": None,
            },
            {
                "series_id": "MORTGAGE30US",
                "title": "30-Year Fixed Rate Mortgage Average",
                "units": "Percent",
                "frequency": "Weekly",
                "source": "FRED",
                "category": "rates",
                "last_updated": None,
            },
            {
                "series_id": "DGS10",
                "title": "10-Year Treasury Constant Maturity Rate",
                "units": "Percent",
                "frequency": "Daily",
                "source": "FRED",
                "category": "rates",
                "last_updated": None,
            },
        ],
        [
            {"date": date(2026, 1, i), "value": Decimal("4.25")}
            for i in range(5, 0, -1)
        ],
        [
            {"date": date(2026, 1, i), "value": Decimal("6.80")}
            for i in range(5, 0, -1)
        ],
        [
            {"date": date(2026, 1, i), "value": Decimal("4.10")}
            for i in range(5, 0, -1)
        ],
    ]

    resp = await c.get("/api/v1/rates/history")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["series"]) == 3
    assert data["series"][0]["id"] == "Fed Funds Rate"
    assert data["source"] == "Source: FRED · Jan 5, 2026"
    assert data["methodology_type"] == "source_backed"
    assert data["latest_observation_date"] == "2026-01-05"
    assert data["latest_month"] is None
    assert data["source_series_ids"] == ["FEDFUNDS", "MORTGAGE30US", "DGS10"]


async def test_sectors_gdp(client):
    c, _ = client
    resp = await c.get("/api/v1/sectors/gdp")
    assert resp.status_code == 200
    data = resp.json()
    assert "tree" in data
    assert data["tree"]["name"] == "US GDP"
    assert len(data["tree"]["children"]) == 4
    assert data["source"] == "Source: Illustrative placeholder"
    assert data["methodology_type"] == "illustrative"
    assert "static illustrative tree" in data["methodology_note"]


async def test_sentiment_radial_empty(client):
    c, mock_conn = client
    mock_conn.fetchrow.return_value = {
        "series_id": "UMCSENT",
        "title": "University of Michigan: Consumer Sentiment",
        "units": "Index",
        "frequency": "Monthly",
        "source": "FRED",
        "category": "sentiment",
        "last_updated": None,
    }
    mock_conn.fetch.return_value = []

    resp = await c.get("/api/v1/sentiment/radial")
    assert resp.status_code == 200
    data = resp.json()
    assert data["data"] == []
    assert data["source"] == "Source: FRED"
    assert data["methodology_type"] == "source_backed"
    assert data["latest_observation_date"] is None


async def test_sentiment_radial_with_data(client):
    c, mock_conn = client
    mock_conn.fetchrow.return_value = {
        "series_id": "UMCSENT",
        "title": "University of Michigan: Consumer Sentiment",
        "units": "Index",
        "frequency": "Monthly",
        "source": "FRED",
        "category": "sentiment",
        "last_updated": None,
    }
    mock_conn.fetch.return_value = [
        {"date": date(2026, 3, 1), "value": Decimal("67.8")},
        {"date": date(2026, 2, 1), "value": Decimal("66.5")},
        {"date": date(2026, 1, 1), "value": Decimal("65.0")},
    ]

    resp = await c.get("/api/v1/sentiment/radial")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["data"]) == 3
    assert data["current"] == 67.8
    assert data["source"] == "Source: FRED · Mar 2026"
    assert data["methodology_type"] == "source_backed"
    assert data["latest_observation_date"] == "2026-03-01"
    assert data["latest_month"] == "Mar 2026"
    assert data["source_series_ids"] == ["UMCSENT"]


async def test_overview(client):
    c, mock_conn = client
    mock_conn.fetch.return_value = []
    mock_conn.fetchrow.side_effect = [
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None,
        None,
    ]

    resp = await c.get("/api/v1/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert "kpis" in data
    assert data["methodology_type"] == "source_backed"


@pytest.mark.parametrize(
    ("path", "note_fragment"),
    [
        ("/api/v1/sectors/gdp", "static illustrative tree"),
    ],
)
async def test_illustrative_endpoints_keep_provenance_dates_empty(client, path, note_fragment):
    c, _ = client

    resp = await c.get(path)

    assert resp.status_code == 200
    data = resp.json()
    assert data["methodology_type"] == "illustrative"
    assert data["latest_observation_date"] is None
    assert data["latest_month"] is None
    assert note_fragment in data["methodology_note"]
