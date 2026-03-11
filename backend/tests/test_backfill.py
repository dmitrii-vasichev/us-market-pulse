import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from backfill import BACKFILL_YEARS


def test_backfill_years_is_five():
    assert BACKFILL_YEARS == 5


async def test_backfill_calls_collect_with_start_date():
    with patch("backfill.collect", new_callable=AsyncMock) as mock_collect:
        mock_collect.return_value = {"status": "success", "records_inserted": 100}

        from backfill import backfill
        result = await backfill(database_url="test://db", fred_api_key="test_key")

        mock_collect.assert_called_once()
        call_kwargs = mock_collect.call_args[1]
        assert call_kwargs["database_url"] == "test://db"
        assert call_kwargs["fred_api_key"] == "test_key"
        assert call_kwargs["observation_start"] is not None
        assert call_kwargs["fetch_limit"] == 10000
