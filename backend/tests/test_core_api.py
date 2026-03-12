"""Tests for core API endpoints: KPI, Series, Meta."""

from datetime import date, datetime
from decimal import Decimal
from unittest.mock import AsyncMock, patch


async def test_kpi_summary_empty(client):
    c, mock_conn = client
    # No data → empty KPIs
    mock_conn.fetch.return_value = []
    mock_conn.fetchrow.side_effect = [
        None,
        {"series_id": "GDP", "title": "Real Gross Domestic Product", "units": "Billions", "frequency": "Quarterly", "source": "FRED", "category": "gdp", "last_updated": None},
        {"series_id": "CPIAUCSL", "title": "Consumer Price Index", "units": "Index", "frequency": "Monthly", "source": "FRED", "category": "inflation", "last_updated": None},
        {"series_id": "UNRATE", "title": "Unemployment Rate", "units": "Percent", "frequency": "Monthly", "source": "FRED", "category": "labor", "last_updated": None},
        {"series_id": "FEDFUNDS", "title": "Federal Funds Effective Rate", "units": "Percent", "frequency": "Daily", "source": "FRED", "category": "rates", "last_updated": None},
        None,
        None,
        None,
        None,
    ]

    resp = await c.get("/api/v1/kpi/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert "kpis" in data
    assert isinstance(data["kpis"], list)
    assert data["source"] == "Source: FRED"
    assert data["methodology_type"] == "derived"
    assert data["latest_observation_date"] is None
    assert data["latest_month"] is None
    assert "stored GDP, CPIAUCSL, UNRATE, and FEDFUNDS observations" in data["methodology_note"]


async def test_kpi_summary_with_provenance(client):
    c, mock_conn = client
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
        }
    ]

    with patch("app.api.v1.kpi.compute_all_kpis", new=AsyncMock(return_value=sample_kpis)):
        resp = await c.get("/api/v1/kpi/summary")

    assert resp.status_code == 200
    data = resp.json()
    assert data["source"] == "Source: FRED · Mar 10, 2026"
    assert data["methodology_type"] == "derived"
    assert data["latest_observation_date"] == "2026-03-10"
    assert data["latest_month"] is None
    assert data["source_series_ids"] == ["GDP", "CPIAUCSL", "UNRATE", "FEDFUNDS"]
    assert "Real Gross Domestic Product" in data["source_dataset"]
    assert "static dashboard thresholds" in data["methodology_note"]


async def test_meta_series_empty(client):
    c, mock_conn = client
    mock_conn.fetch.return_value = []

    resp = await c.get("/api/v1/meta/series")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 0
    assert data["series"] == []


async def test_meta_series_with_data(client):
    c, mock_conn = client
    mock_conn.fetch.return_value = [
        {
            "series_id": "UNRATE",
            "title": "Unemployment Rate",
            "units": "Percent",
            "frequency": "Monthly",
            "source": "FRED",
            "category": "labor",
            "last_updated": date(2026, 3, 10),
        }
    ]

    resp = await c.get("/api/v1/meta/series")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 1
    assert data["series"][0]["series_id"] == "UNRATE"


async def test_last_update_empty(client):
    c, mock_conn = client
    mock_conn.fetchrow.return_value = None

    resp = await c.get("/api/v1/meta/last-update")
    assert resp.status_code == 200
    data = resp.json()
    assert data["last_collection"] is None


async def test_last_update_with_data(client):
    c, mock_conn = client
    mock_conn.fetchrow.return_value = {
        "run_date": datetime(2026, 3, 10, 6, 0),
        "status": "success",
        "series_collected": 16,
        "records_inserted": 480,
    }

    resp = await c.get("/api/v1/meta/last-update")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["series_collected"] == 16


async def test_series_not_found(client):
    c, mock_conn = client
    mock_conn.fetchrow.return_value = None

    resp = await c.get("/api/v1/series/NONEXISTENT")
    assert resp.status_code == 404


async def test_series_with_data(client):
    c, mock_conn = client
    # First call: fetchrow for metadata
    mock_conn.fetchrow.return_value = {
        "series_id": "UNRATE",
        "title": "Unemployment Rate",
        "units": "Percent",
        "frequency": "Monthly",
        "source": "FRED",
        "category": "labor",
        "last_updated": None,
    }
    # Second call: fetch for data
    mock_conn.fetch.return_value = [
        {"date": date(2026, 1, 1), "value": Decimal("4.0")},
        {"date": date(2026, 2, 1), "value": Decimal("3.9")},
    ]

    resp = await c.get("/api/v1/series/UNRATE")
    assert resp.status_code == 200
    data = resp.json()
    assert data["series_id"] == "UNRATE"
    assert len(data["data"]) == 2
    assert data["source"] == "Source: FRED · Feb 2026"
    assert data["methodology_type"] == "source_backed"
    assert data["latest_observation_date"] == "2026-02-01"
    assert data["latest_month"] == "Feb 2026"
    assert data["source_dataset"] == "Unemployment Rate"
    assert data["source_series_ids"] == ["UNRATE"]


async def test_multi_series_no_ids(client):
    c, _ = client
    resp = await c.get("/api/v1/series/multi?ids=")
    assert resp.status_code == 400


async def test_multi_series_with_ids(client):
    c, mock_conn = client
    mock_conn.fetchrow.side_effect = [
        {
            "series_id": "UNRATE",
            "title": "Unemployment Rate",
            "units": "Percent",
            "frequency": "Monthly",
            "source": "FRED",
            "category": "labor",
            "last_updated": None,
        },
        {
            "series_id": "PAYEMS",
            "title": "All Employees, Total Nonfarm",
            "units": "Thousands of Persons",
            "frequency": "Monthly",
            "source": "FRED",
            "category": "labor",
            "last_updated": None,
        },
    ]
    mock_conn.fetch.side_effect = [
        [{"date": date(2026, 1, 1), "value": Decimal("4.0")}],
        [{"date": date(2026, 1, 1), "value": Decimal("159000")}],
    ]

    resp = await c.get("/api/v1/series/multi?ids=UNRATE,PAYEMS")
    assert resp.status_code == 200
    data = resp.json()
    assert "series" in data
    assert len(data["series"]) == 2
    assert data["series"][0]["source"] == "Source: FRED · Jan 2026"
    assert data["series"][0]["source_series_ids"] == ["UNRATE"]
    assert data["series"][1]["source_dataset"] == "All Employees, Total Nonfarm"


async def test_overview_with_provenance(client):
    c, mock_conn = client
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
            "key": "cpi",
            "label": "Inflation Rate",
            "current_value": 309.0,
            "previous_value": 301.0,
            "change_absolute": 2.7,
            "change_percent": 2.7,
            "period_label": "YoY",
            "positive_is_good": False,
            "format": "percent_change",
            "sparkline": [{"date": "2026-01-01", "value": 309.0}],
        }
    ]

    with patch("app.api.v1.overview.compute_all_kpis", new=AsyncMock(return_value=sample_kpis)):
        resp = await c.get("/api/v1/overview")

    assert resp.status_code == 200
    data = resp.json()
    assert data["source"] == "Source: FRED · Mar 10, 2026"
    assert data["methodology_type"] == "source_backed"
    assert data["latest_observation_date"] == "2026-03-10"
    assert data["source_series_ids"] == ["GDP", "CPIAUCSL", "UNRATE", "FEDFUNDS"]
