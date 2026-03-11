"""Series data endpoints."""

from fastapi import APIRouter, HTTPException, Query

from app.db.database import get_pool
from app.db.queries import get_series_data, get_series_metadata
from app.models.schemas import SeriesResponse, MultiSeriesResponse

router = APIRouter(prefix="/api/v1/series", tags=["Series"])


@router.get("/multi", response_model=MultiSeriesResponse)
async def multi_series(
    ids: str = Query(..., description="Comma-separated series IDs"),
    start: str | None = Query(None, description="Start date (YYYY-MM-DD)"),
    end: str | None = Query(None, description="End date (YYYY-MM-DD)"),
):
    series_ids = [s.strip() for s in ids.split(",") if s.strip()]
    if not series_ids:
        raise HTTPException(status_code=400, detail="No series IDs provided")

    pool = await get_pool()
    async with pool.acquire() as conn:
        result = []
        for sid in series_ids:
            meta = await get_series_metadata(conn, sid)
            if not meta:
                continue
            data = await get_series_data(conn, sid, start=start, end=end)
            result.append(SeriesResponse(
                series_id=sid,
                title=meta["title"],
                units=meta.get("units"),
                data=data,
            ))
        return MultiSeriesResponse(series=result)


@router.get("/{series_id}", response_model=SeriesResponse)
async def single_series(
    series_id: str,
    start: str | None = Query(None, description="Start date (YYYY-MM-DD)"),
    end: str | None = Query(None, description="End date (YYYY-MM-DD)"),
):
    pool = await get_pool()
    async with pool.acquire() as conn:
        meta = await get_series_metadata(conn, series_id)
        if not meta:
            raise HTTPException(status_code=404, detail=f"Series '{series_id}' not found")
        data = await get_series_data(conn, series_id, start=start, end=end)
        return SeriesResponse(
            series_id=series_id,
            title=meta["title"],
            units=meta.get("units"),
            data=data,
        )
