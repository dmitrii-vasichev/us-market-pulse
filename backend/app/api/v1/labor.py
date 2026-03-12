"""Labor market endpoints: funnel and bump ranking."""

import httpx
from fastapi import APIRouter

from app.db.database import get_pool
from app.models.schemas import LaborFunnelResponse, LaborRankingResponse
from app.services.labor_funnel import get_labor_funnel_response
from app.services.labor_ranking import (
    STATE_UNEMPLOYMENT_SERIES_IDS,
    build_labor_ranking_response,
    fetch_bls_series,
    get_bls_year_range,
)

router = APIRouter(prefix="/api/v1/labor", tags=["Labor"])


@router.get("/funnel", response_model=LaborFunnelResponse)
async def labor_funnel():
    """Economic flow funnel: GDP → income → compensation → payroll employment."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        response = await get_labor_funnel_response(conn)
        return LaborFunnelResponse(**response)


@router.get("/ranking", response_model=LaborRankingResponse)
async def labor_ranking():
    """State unemployment rankings over time for bump chart.
    Shows top 8-10 states ranked by unemployment rate over 12 months.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT series_id, date, value
            FROM economic_series
            WHERE series_id = ANY($1::varchar[]) AND value IS NOT NULL
            ORDER BY date DESC
            LIMIT 240
            """,
            STATE_UNEMPLOYMENT_SERIES_IDS,
        )

    response = build_labor_ranking_response(rows)
    if response["data"]:
        return response

    try:
        start_year, end_year = get_bls_year_range()
        async with httpx.AsyncClient(timeout=30.0) as client:
            observations_by_series = await fetch_bls_series(
                client,
                STATE_UNEMPLOYMENT_SERIES_IDS,
                start_year,
                end_year,
            )
    except Exception:
        return response

    fallback_rows = [
        {"series_id": series_id, "date": item["date"], "value": item["value"]}
        for series_id, items in observations_by_series.items()
        for item in items
    ]
    return build_labor_ranking_response(fallback_rows)
