"""Tests for specialized API endpoints."""

from decimal import Decimal
from datetime import date


async def test_gdp_components(client):
    c, mock_conn = client
    mock_conn.fetchrow.return_value = {"date": date(2026, 1, 1), "value": Decimal("2.5")}

    resp = await c.get("/api/v1/gdp/components")
    assert resp.status_code == 200
    data = resp.json()
    assert "components" in data
    assert len(data["components"]) == 5
    assert data["total_growth"] == 2.5


async def test_gdp_quarterly(client):
    c, mock_conn = client
    mock_conn.fetch.return_value = [
        {"date": date(2025, 7, 1), "value": Decimal("2.1")},
        {"date": date(2025, 10, 1), "value": Decimal("2.3")},
    ]

    resp = await c.get("/api/v1/gdp/quarterly")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["data"]) == 2


async def test_cpi_calendar(client):
    c, mock_conn = client
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


async def test_cpi_categories(client):
    c, _ = client
    resp = await c.get("/api/v1/cpi/categories")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["categories"]) == 8
    assert data["total"] == 100.0


async def test_labor_funnel(client):
    c, mock_conn = client
    mock_conn.fetchrow.return_value = {"value": Decimal("28000")}

    resp = await c.get("/api/v1/labor/funnel")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["stages"]) == 5
    assert data["stages"][0]["label"] == "Total GDP"


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
    december_ranks = {
        item["id"]: item["data"][-1]["y"]
        for item in data["data"]
    }
    assert december_ranks["California"] == 1
    assert december_ranks["Nevada"] == 2
    assert december_ranks["Michigan"] == 3
    assert december_ranks["Colorado"] == 10


async def test_states_comparison(client):
    c, _ = client
    resp = await c.get("/api/v1/states/comparison")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["data"]) == 1  # One group
    assert len(data["data"][0]["data"]) == 12  # 12 states


async def test_rates_history(client):
    c, mock_conn = client
    mock_conn.fetch.return_value = [
        {"date": date(2026, 1, i + 1), "value": Decimal("4.25")}
        for i in range(5)
    ]

    resp = await c.get("/api/v1/rates/history")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["series"]) == 3
    assert data["series"][0]["id"] == "Fed Funds Rate"


async def test_sectors_gdp(client):
    c, _ = client
    resp = await c.get("/api/v1/sectors/gdp")
    assert resp.status_code == 200
    data = resp.json()
    assert "tree" in data
    assert data["tree"]["name"] == "US GDP"
    assert len(data["tree"]["children"]) == 4


async def test_sentiment_radial_empty(client):
    c, mock_conn = client
    mock_conn.fetch.return_value = []

    resp = await c.get("/api/v1/sentiment/radial")
    assert resp.status_code == 200
    data = resp.json()
    assert data["data"] == []


async def test_sentiment_radial_with_data(client):
    c, mock_conn = client
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


async def test_overview(client):
    c, mock_conn = client
    mock_conn.fetch.return_value = []
    mock_conn.fetchrow.return_value = None

    resp = await c.get("/api/v1/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert "kpis" in data
