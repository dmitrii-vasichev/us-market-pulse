import sys
from datetime import date
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

SCRIPTS_DIR = Path(__file__).parent.parent.parent / "scripts"
BACKEND_DIR = Path(__file__).parent.parent

sys.path.insert(0, str(SCRIPTS_DIR))
sys.path.insert(0, str(BACKEND_DIR))

from collectors.cpi_categories import parse_cpi_relative_importance_html
from collectors.sector_gdp import aggregate_sector_gdp_snapshot_rows
from collectors.state_indicators import (
    build_state_indicator_snapshot_rows,
    parse_bls_annual_average_payload,
    parse_census_population_response,
    parse_state_gdp_response,
)
from data_collector import (
    collect_dimensional_snapshots,
    fetch_bls_series,
    fetch_fred_series,
    upsert_cpi_category_snapshots,
    upsert_observations,
    upsert_sector_gdp_snapshots,
    upsert_state_indicator_snapshots,
)


@pytest.fixture
def mock_fred_response():
    return {
        "observations": [
            {"date": "2026-01-01", "value": "4.0"},
            {"date": "2026-02-01", "value": "3.9"},
            {"date": "2026-03-01", "value": "."},
        ]
    }


async def test_fetch_fred_series(mock_fred_response):
    mock_response = MagicMock()
    mock_response.json.return_value = mock_fred_response
    mock_response.raise_for_status = MagicMock()

    mock_client = AsyncMock()
    mock_client.get.return_value = mock_response

    result = await fetch_fred_series(mock_client, "UNRATE", "test_key")
    assert len(result) == 3
    assert result[0]["date"] == "2026-01-01"
    assert result[0]["value"] == "4.0"


async def test_fetch_bls_series():
    mock_response = MagicMock()
    mock_response.json.return_value = {
        "status": "REQUEST_SUCCEEDED",
        "Results": {
            "series": [
                {
                    "seriesID": "LASST080000000000003",
                    "data": [
                        {"year": "2025", "period": "M12", "value": "3.8"},
                        {"year": "2025", "period": "M10", "value": "-"},
                    ],
                }
            ]
        },
    }
    mock_response.raise_for_status = MagicMock()

    mock_client = AsyncMock()
    mock_client.post.return_value = mock_response

    result = await fetch_bls_series(
        mock_client,
        ["LASST080000000000003"],
        "2025",
        "2026",
    )
    assert result == {
        "LASST080000000000003": [
            {"date": "2025-12-01", "value": "3.8"},
        ]
    }
    mock_client.post.assert_called_once()


async def test_upsert_observations_filters_invalid():
    mock_conn = AsyncMock()
    mock_conn.executemany = AsyncMock()

    observations = [
        {"date": "2026-01-01", "value": "4.0"},
        {"date": "2026-02-01", "value": "."},
        {"date": "2026-03-01", "value": ""},
        {"date": "2026-04-01", "value": "3.8"},
    ]

    count = await upsert_observations(mock_conn, "UNRATE", observations)
    assert count == 2
    mock_conn.executemany.assert_called_once()


async def test_upsert_observations_empty_list():
    mock_conn = AsyncMock()
    count = await upsert_observations(mock_conn, "UNRATE", [])
    assert count == 0
    mock_conn.executemany.assert_not_called()


def test_parse_cpi_relative_importance_html():
    html = """
    <table>
      <tr><th>Item</th><th>Relative importance</th></tr>
      <tr><td>Housing</td><td>34.9</td></tr>
      <tr><td>Food and beverages</td><td>14.3</td></tr>
      <tr><td>Transportation</td><td>16.7</td></tr>
      <tr><td>Medical care</td><td>8.9</td></tr>
      <tr><td>Education and communication</td><td>6.1</td></tr>
      <tr><td>Recreation</td><td>5.6</td></tr>
      <tr><td>Apparel</td><td>2.6</td></tr>
      <tr><td>Other goods and services</td><td>10.9</td></tr>
    </table>
    """

    rows = parse_cpi_relative_importance_html(html, 2025)

    assert len(rows) == 8
    assert rows[0]["snapshot_date"] == date(2025, 12, 1)
    assert rows[0]["category_key"] == "housing"
    assert rows[-1]["category_key"] == "other"


def test_parse_bls_annual_average_payload():
    payload = {
        "status": "REQUEST_SUCCEEDED",
        "Results": {
            "series": [
                {
                    "seriesID": "LASST060000000000003",
                    "data": [
                        {"year": "2025", "period": "M13", "value": "5.1"},
                        {"year": "2025", "period": "M12", "value": "5.0"},
                    ],
                },
                {
                    "seriesID": "LASST080000000000003",
                    "data": [
                        {"year": "2025", "period": "M13", "value": "3.2"},
                    ],
                },
            ]
        },
    }

    parsed = parse_bls_annual_average_payload(payload)

    assert parsed == {2025: {"CA": 5.1, "CO": 3.2}}


def test_parse_census_population_response():
    payload = [
        ["NAME", "POP", "STATE"],
        ["California", "39500000", "06"],
        ["Colorado", "5800000", "08"],
    ]

    parsed = parse_census_population_response(payload, 2025)

    assert parsed == {2025: {"CA": 39500000, "CO": 5800000}}


def test_parse_state_gdp_response():
    payload = [
        {"GeoName": "California", "TimePeriod": "2025", "DataValue": "3,900,123"},
        {"GeoName": "Colorado", "TimePeriod": "2025", "DataValue": "490,456"},
    ]

    parsed = parse_state_gdp_response(payload)

    assert parsed == {2025: {"CA": 3900123.0, "CO": 490456.0}}


def test_build_state_indicator_snapshot_rows_requires_complete_curated_state_set():
    unemployment = {2025: {"CA": 5.1}}
    population = {2025: {"CA": 39500000}}
    gdp = {2025: {"CA": 3900123.0}}

    with pytest.raises(ValueError, match="Incomplete state indicator inputs"):
        build_state_indicator_snapshot_rows(unemployment, population, gdp)


def test_aggregate_sector_gdp_snapshot_rows():
    raw_rows = [
        {
            "snapshot_date": date(2025, 10, 1),
            "period_label": "Q4 2025",
            "industry_label": "Finance and insurance",
            "value_current_dollars": 100.0,
        },
        {
            "snapshot_date": date(2025, 10, 1),
            "period_label": "Q4 2025",
            "industry_label": "Real estate and rental and leasing",
            "value_current_dollars": 200.0,
        },
        {
            "snapshot_date": date(2025, 10, 1),
            "period_label": "Q4 2025",
            "industry_label": "Manufacturing",
            "value_current_dollars": 300.0,
        },
    ]

    rows = aggregate_sector_gdp_snapshot_rows(raw_rows)

    root = next(row for row in rows if row["node_key"] == "root")
    services = next(row for row in rows if row["node_key"] == "services")
    finance = next(row for row in rows if row["node_key"] == "services.finance-insurance")

    assert root["value_current_dollars"] == 600.0
    assert services["value_current_dollars"] == 300.0
    assert finance["value_current_dollars"] == 100.0


async def test_upsert_cpi_category_snapshots():
    conn = AsyncMock()
    conn.executemany = AsyncMock()

    rows = [
        {
            "snapshot_date": date(2025, 12, 1),
            "period_label": "Dec 2025",
            "category_key": "housing",
            "category_label": "Housing",
            "display_order": 1,
            "relative_importance": 34.9,
            "source_provider": "BLS",
            "source_dataset": "Relative Importance",
            "source_metadata": {"year": 2025},
        }
    ]

    count = await upsert_cpi_category_snapshots(conn, rows)

    assert count == 1
    conn.executemany.assert_awaited_once()


async def test_upsert_state_indicator_snapshots():
    conn = AsyncMock()
    conn.executemany = AsyncMock()

    rows = [
        {
            "snapshot_date": date(2025, 1, 1),
            "period_label": "2025",
            "state_code": "CO",
            "state_name": "Colorado",
            "display_order": 8,
            "unemployment_rate": 3.2,
            "gdp_current_dollars": 490456.0,
            "population": 5800000,
            "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
            "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
            "source_metadata": {"year": 2025},
        }
    ]

    count = await upsert_state_indicator_snapshots(conn, rows)

    assert count == 1
    conn.executemany.assert_awaited_once()


async def test_upsert_sector_gdp_snapshots():
    conn = AsyncMock()
    conn.executemany = AsyncMock()

    rows = [
        {
            "snapshot_date": date(2025, 10, 1),
            "period_label": "Q4 2025",
            "node_key": "root",
            "parent_node_key": None,
            "node_label": "US GDP",
            "depth": 0,
            "display_order": 0,
            "value_current_dollars": 600.0,
            "source_provider": "BEA",
            "source_dataset": "GDP by Industry",
            "source_metadata": {},
        }
    ]

    count = await upsert_sector_gdp_snapshots(conn, rows)

    assert count == 1
    conn.executemany.assert_awaited_once()


async def test_collect_dimensional_snapshots_reports_partial_failure():
    conn = AsyncMock()
    client = AsyncMock()

    with (
        patch(
            "data_collector.fetch_cpi_category_snapshots",
            new=AsyncMock(return_value=[{"snapshot_date": date(2025, 12, 1)}]),
        ),
        patch(
            "data_collector.upsert_cpi_category_snapshots",
            new=AsyncMock(return_value=8),
        ),
        patch(
            "data_collector.fetch_state_indicator_snapshots",
            new=AsyncMock(side_effect=RuntimeError("upstream join failed")),
        ),
        patch(
            "data_collector.fetch_sector_gdp_snapshots",
            new=AsyncMock(return_value=[{"snapshot_date": date(2025, 10, 1)}]),
        ),
        patch(
            "data_collector.upsert_sector_gdp_snapshots",
            new=AsyncMock(return_value=21),
        ),
    ):
        result = await collect_dimensional_snapshots(
            conn,
            client,
            observation_start="2021-01-01",
            bea_api_key="bea-key",
            census_vintage=2025,
        )

    assert result["datasets_collected"] == 2
    assert result["records_inserted"] == 29
    assert result["errors"] == ["state_indicator_snapshots: upstream join failed"]
