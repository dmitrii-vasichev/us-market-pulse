"""Consumer sentiment endpoint for radial bar chart."""

from fastapi import APIRouter

from app.db.database import get_pool

router = APIRouter(prefix="/api/v1/sentiment", tags=["Sentiment"])


@router.get("/radial")
async def sentiment_radial():
    """Consumer sentiment for radial bar: current, 6mo ago, 1yr ago."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT date, value FROM economic_series
            WHERE series_id = 'UMCSENT' AND value IS NOT NULL
            ORDER BY date DESC LIMIT 13
            """
        )

        if not rows:
            return {"data": [], "max_value": 100}

        current = float(rows[0]["value"])
        six_mo = float(rows[min(6, len(rows) - 1)]["value"])
        one_yr = float(rows[min(12, len(rows) - 1)]["value"])

        data = [
            {"id": "Current", "data": [{"x": "Sentiment", "y": round(current, 1)}]},
            {"id": "6 Months Ago", "data": [{"x": "Sentiment", "y": round(six_mo, 1)}]},
            {"id": "1 Year Ago", "data": [{"x": "Sentiment", "y": round(one_yr, 1)}]},
        ]

        return {"data": data, "max_value": 100, "current": round(current, 1)}
