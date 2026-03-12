"""Consumer sentiment endpoint for radial bar chart."""

from fastapi import APIRouter

from app.db.database import get_pool
from app.db.queries import get_series_metadata
from app.models.schemas import SentimentRadialResponse
from app.services.provenance import build_metadata_provenance

router = APIRouter(prefix="/api/v1/sentiment", tags=["Sentiment"])


@router.get("/radial", response_model=SentimentRadialResponse)
async def sentiment_radial():
    """Consumer sentiment for radial bar: current, 6mo ago, 1yr ago."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        meta = await get_series_metadata(conn, "UMCSENT")
        rows = await conn.fetch(
            """
            SELECT date, value FROM economic_series
            WHERE series_id = 'UMCSENT' AND value IS NOT NULL
            ORDER BY date DESC LIMIT 13
            """
        )
        latest_date = rows[0]["date"] if rows else None
        provenance = build_metadata_provenance(
            [meta] if meta else [],
            methodology_type="source_backed",
            latest_date=latest_date,
            fallback_source_name="FRED",
            fallback_dataset="University of Michigan: Consumer Sentiment",
            source_series_ids=["UMCSENT"],
        )

        if not rows:
            return SentimentRadialResponse(
                data=[],
                max_value=100,
                current=None,
                **provenance.model_dump(),
            )

        current = float(rows[0]["value"])
        six_mo = float(rows[min(6, len(rows) - 1)]["value"])
        one_yr = float(rows[min(12, len(rows) - 1)]["value"])

        data = [
            {"id": "Current", "data": [{"x": "Sentiment", "y": round(current, 1)}]},
            {"id": "6 Months Ago", "data": [{"x": "Sentiment", "y": round(six_mo, 1)}]},
            {"id": "1 Year Ago", "data": [{"x": "Sentiment", "y": round(one_yr, 1)}]},
        ]

        return SentimentRadialResponse(
            data=data,
            max_value=100,
            current=round(current, 1),
            **provenance.model_dump(),
        )
