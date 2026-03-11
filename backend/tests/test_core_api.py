"""Tests for core API endpoints: KPI, Series, Meta."""

from datetime import date, datetime
from decimal import Decimal


async def test_kpi_summary_empty(client):
    c, mock_conn = client
    # No data → empty KPIs
    mock_conn.fetch.return_value = []
    mock_conn.fetchrow.return_value = None

    resp = await c.get("/api/v1/kpi/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert "kpis" in data
    assert isinstance(data["kpis"], list)


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


async def test_multi_series_no_ids(client):
    c, _ = client
    resp = await c.get("/api/v1/series/multi?ids=")
    assert resp.status_code == 400


async def test_multi_series_with_ids(client):
    c, mock_conn = client
    mock_conn.fetchrow.return_value = {
        "series_id": "UNRATE",
        "title": "Unemployment Rate",
        "units": "Percent",
        "frequency": "Monthly",
        "category": "labor",
        "last_updated": None,
    }
    mock_conn.fetch.return_value = [
        {"date": date(2026, 1, 1), "value": Decimal("4.0")},
    ]

    resp = await c.get("/api/v1/series/multi?ids=UNRATE,PAYEMS")
    assert resp.status_code == 200
    data = resp.json()
    assert "series" in data
