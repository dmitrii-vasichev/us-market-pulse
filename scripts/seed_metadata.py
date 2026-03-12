"""Seed series_metadata table with dashboard series metadata."""

import asyncio
import os
import ssl
import sys

import asyncpg


def _get_ssl(url: str):
    if "railway" in url or "proxy.rlwy.net" in url:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return ctx
    return None

# Allow running from project root or scripts/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.services.labor_ranking import STATE_UNEMPLOYMENT_SERIES

SERIES = [
    {
        "series_id": "GDP",
        "title": "Real Gross Domestic Product",
        "units": "Billions of Chained 2017 Dollars",
        "frequency": "Quarterly",
        "seasonal_adjustment": "Seasonally Adjusted Annual Rate",
        "source": "FRED",
        "category": "gdp",
        "display_order": 1,
    },
    {
        "series_id": "A191RL1Q225SBEA",
        "title": "Real GDP Growth Rate (Contributions by Component)",
        "units": "Percent",
        "frequency": "Quarterly",
        "seasonal_adjustment": "Seasonally Adjusted Annual Rate",
        "source": "FRED",
        "category": "gdp",
        "display_order": 2,
    },
    {
        "series_id": "CPIAUCSL",
        "title": "Consumer Price Index for All Urban Consumers",
        "units": "Index 1982-1984=100",
        "frequency": "Monthly",
        "seasonal_adjustment": "Seasonally Adjusted",
        "source": "FRED",
        "category": "inflation",
        "display_order": 3,
    },
    {
        "series_id": "UNRATE",
        "title": "Unemployment Rate",
        "units": "Percent",
        "frequency": "Monthly",
        "seasonal_adjustment": "Seasonally Adjusted",
        "source": "FRED",
        "category": "labor",
        "display_order": 4,
    },
    {
        "series_id": "FEDFUNDS",
        "title": "Federal Funds Effective Rate",
        "units": "Percent",
        "frequency": "Daily",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "source": "FRED",
        "category": "rates",
        "display_order": 5,
    },
    {
        "series_id": "MORTGAGE30US",
        "title": "30-Year Fixed Rate Mortgage Average",
        "units": "Percent",
        "frequency": "Weekly",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "source": "FRED",
        "category": "rates",
        "display_order": 6,
    },
    {
        "series_id": "DGS10",
        "title": "10-Year Treasury Constant Maturity Rate",
        "units": "Percent",
        "frequency": "Daily",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "source": "FRED",
        "category": "rates",
        "display_order": 7,
    },
    {
        "series_id": "MSPUS",
        "title": "Median Sales Price of Houses Sold",
        "units": "Dollars",
        "frequency": "Quarterly",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "source": "FRED",
        "category": "housing",
        "display_order": 8,
    },
    {
        "series_id": "HOUST",
        "title": "Housing Starts: Total New Privately Owned",
        "units": "Thousands of Units",
        "frequency": "Monthly",
        "seasonal_adjustment": "Seasonally Adjusted Annual Rate",
        "source": "FRED",
        "category": "housing",
        "display_order": 9,
    },
    {
        "series_id": "RSAFS",
        "title": "Advance Retail Sales: Retail and Food Services",
        "units": "Millions of Dollars",
        "frequency": "Monthly",
        "seasonal_adjustment": "Seasonally Adjusted",
        "source": "FRED",
        "category": "markets",
        "display_order": 10,
    },
    {
        "series_id": "PAYEMS",
        "title": "All Employees, Total Nonfarm",
        "units": "Thousands of Persons",
        "frequency": "Monthly",
        "seasonal_adjustment": "Seasonally Adjusted",
        "source": "FRED",
        "category": "labor",
        "display_order": 11,
    },
    {
        "series_id": "DCOILWTICO",
        "title": "Crude Oil Prices: West Texas Intermediate (WTI)",
        "units": "Dollars per Barrel",
        "frequency": "Daily",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "source": "FRED",
        "category": "markets",
        "display_order": 12,
    },
    {
        "series_id": "SP500",
        "title": "S&P 500 Index",
        "units": "Index",
        "frequency": "Daily",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "source": "FRED",
        "category": "markets",
        "display_order": 13,
    },
    {
        "series_id": "UMCSENT",
        "title": "University of Michigan: Consumer Sentiment",
        "units": "Index 1966:Q1=100",
        "frequency": "Monthly",
        "seasonal_adjustment": "Not Seasonally Adjusted",
        "source": "FRED",
        "category": "sentiment",
        "display_order": 14,
    },
    {
        "series_id": "JTSJOL",
        "title": "Job Openings: Total Nonfarm (JOLTS)",
        "units": "Thousands",
        "frequency": "Monthly",
        "seasonal_adjustment": "Seasonally Adjusted",
        "source": "FRED",
        "category": "labor",
        "display_order": 15,
    },
    {
        "series_id": "INDPRO",
        "title": "Industrial Production: Total Index",
        "units": "Index 2017=100",
        "frequency": "Monthly",
        "seasonal_adjustment": "Seasonally Adjusted",
        "source": "FRED",
        "category": "markets",
        "display_order": 16,
    },
] + [
    {
        "series_id": item["series_id"],
        "title": f"{item['state']} Unemployment Rate",
        "units": "Percent",
        "frequency": "Monthly",
        "seasonal_adjustment": "Seasonally Adjusted",
        "source": "BLS",
        "category": "labor",
        "display_order": item["display_order"],
    }
    for item in STATE_UNEMPLOYMENT_SERIES
]


async def seed(database_url: str | None = None) -> int:
    url = database_url or os.environ.get("DATABASE_URL", "")
    if not url:
        print("ERROR: DATABASE_URL not set")
        sys.exit(1)

    conn = await asyncpg.connect(url, ssl=_get_ssl(url))
    try:
        count = 0
        for s in SERIES:
            await conn.execute(
                """
                INSERT INTO series_metadata
                    (series_id, title, units, frequency, seasonal_adjustment, source, category, display_order, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
                ON CONFLICT (series_id) DO UPDATE SET
                    title = EXCLUDED.title,
                    units = EXCLUDED.units,
                    frequency = EXCLUDED.frequency,
                    seasonal_adjustment = EXCLUDED.seasonal_adjustment,
                    source = EXCLUDED.source,
                    category = EXCLUDED.category,
                    display_order = EXCLUDED.display_order
                """,
                s["series_id"],
                s["title"],
                s["units"],
                s["frequency"],
                s["seasonal_adjustment"],
                s["source"],
                s["category"],
                s["display_order"],
            )
            count += 1
            print(f"  [{count:2d}/{len(SERIES)}] {s['series_id']:20s} — {s['title']}")

        print(f"\nSeeded {count} series.")
        return count
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed())
