import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch, MagicMock

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from data_collector import fetch_bls_series, fetch_fred_series, upsert_observations


@pytest.fixture
def mock_fred_response():
    return {
        "observations": [
            {"date": "2026-01-01", "value": "4.0"},
            {"date": "2026-02-01", "value": "3.9"},
            {"date": "2026-03-01", "value": "."},  # Missing value marker
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
        {"date": "2026-02-01", "value": "."},      # FRED missing marker
        {"date": "2026-03-01", "value": ""},        # Empty
        {"date": "2026-04-01", "value": "3.8"},
    ]

    count = await upsert_observations(mock_conn, "UNRATE", observations)
    assert count == 2  # Only 2 valid records
    mock_conn.executemany.assert_called_once()


async def test_upsert_observations_empty_list():
    mock_conn = AsyncMock()
    count = await upsert_observations(mock_conn, "UNRATE", [])
    assert count == 0
    mock_conn.executemany.assert_not_called()
