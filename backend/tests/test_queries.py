from datetime import date
from unittest.mock import AsyncMock

import pytest

from app.db.queries import (
    get_latest_cpi_category_snapshot,
    get_latest_sector_gdp_snapshot,
    get_latest_snapshot_date,
    get_latest_state_indicator_snapshot,
)


@pytest.mark.asyncio
async def test_get_latest_snapshot_date_uses_supported_snapshot_table():
    conn = AsyncMock()
    conn.fetchrow.return_value = {"latest_date": date(2025, 12, 1)}

    latest_date = await get_latest_snapshot_date(conn, "cpi_category_snapshots")

    assert latest_date == date(2025, 12, 1)
    conn.fetchrow.assert_awaited_once()
    assert "FROM cpi_category_snapshots" in conn.fetchrow.await_args.args[0]


@pytest.mark.asyncio
async def test_get_latest_snapshot_date_rejects_unsupported_table():
    conn = AsyncMock()

    with pytest.raises(ValueError, match="Unsupported snapshot table"):
        await get_latest_snapshot_date(conn, "unknown_snapshots")  # type: ignore[arg-type]

    conn.fetchrow.assert_not_awaited()


@pytest.mark.asyncio
async def test_get_latest_cpi_category_snapshot_returns_dict_rows():
    conn = AsyncMock()
    conn.fetch.return_value = [
        {
            "snapshot_date": date(2025, 12, 1),
            "period_label": "Dec 2025",
            "category_key": "housing",
            "category_label": "Housing",
            "display_order": 1,
            "relative_importance": 44.2,
            "source_provider": "BLS",
            "source_dataset": "Relative Importance",
            "source_metadata": {"release": "2025-12"},
            "collected_at": None,
        }
    ]

    rows = await get_latest_cpi_category_snapshot(conn)

    assert rows == conn.fetch.return_value
    conn.fetch.assert_awaited_once()
    assert "FROM cpi_category_snapshots" in conn.fetch.await_args.args[0]


@pytest.mark.asyncio
async def test_get_latest_state_indicator_snapshot_returns_dict_rows():
    conn = AsyncMock()
    conn.fetch.return_value = [
        {
            "snapshot_date": date(2025, 1, 1),
            "period_label": "2025",
            "state_code": "CO",
            "state_name": "Colorado",
            "display_order": 1,
            "unemployment_rate": 4.1,
            "gdp_current_dollars": 493000000000.0,
            "population": 5893634,
            "source_providers": ["BLS", "BEA", "Census"],
            "source_datasets": ["LAUS", "GDP by State", "Population Estimates"],
            "source_metadata": {"year": 2025},
            "collected_at": None,
        }
    ]

    rows = await get_latest_state_indicator_snapshot(conn)

    assert rows == conn.fetch.return_value
    conn.fetch.assert_awaited_once()
    assert "FROM state_indicator_snapshots" in conn.fetch.await_args.args[0]


@pytest.mark.asyncio
async def test_get_latest_sector_gdp_snapshot_returns_dict_rows():
    conn = AsyncMock()
    conn.fetch.return_value = [
        {
            "snapshot_date": date(2025, 10, 1),
            "period_label": "Q4 2025",
            "node_key": "services",
            "parent_node_key": "root",
            "node_label": "Services",
            "depth": 1,
            "display_order": 1,
            "value_current_dollars": 19500.0,
            "source_provider": "BEA",
            "source_dataset": "GDP by Industry",
            "source_metadata": {"quarter": "2025-Q4"},
            "collected_at": None,
        }
    ]

    rows = await get_latest_sector_gdp_snapshot(conn)

    assert rows == conn.fetch.return_value
    conn.fetch.assert_awaited_once()
    assert "FROM sector_gdp_snapshots" in conn.fetch.await_args.args[0]
