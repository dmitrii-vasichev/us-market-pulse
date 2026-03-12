"""One-time backfill: fetches 5 years of historical data for all active series."""

import asyncio
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from data_collector import collect

BACKFILL_YEARS = 5


async def backfill(
    database_url: str | None = None,
    fred_api_key: str | None = None,
    bea_api_key: str | None = None,
    census_api_key: str | None = None,
    census_vintage: int | None = None,
) -> dict:
    start_date = (datetime.now() - timedelta(days=BACKFILL_YEARS * 365)).strftime("%Y-%m-%d")
    print(f"Backfilling {BACKFILL_YEARS} years of data (from {start_date})...")

    result = await collect(
        database_url=database_url,
        fred_api_key=fred_api_key,
        bea_api_key=bea_api_key,
        census_api_key=census_api_key,
        census_vintage=census_vintage,
        observation_start=start_date,
        fetch_limit=10000,  # Large enough to get all data
    )
    return result


if __name__ == "__main__":
    asyncio.run(backfill())
