"""Metadata endpoints."""

from fastapi import APIRouter

from app.db.database import get_pool
from app.db.queries import get_all_metadata, get_last_collection_run
from app.models.schemas import MetaSeriesResponse, LastUpdateResponse, SeriesMetadataItem

router = APIRouter(prefix="/api/v1/meta", tags=["Meta"])


@router.get("/series", response_model=MetaSeriesResponse)
async def list_series():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await get_all_metadata(conn)
        items = [
            SeriesMetadataItem(
                series_id=r["series_id"],
                title=r["title"],
                units=r.get("units"),
                frequency=r.get("frequency"),
                category=r["category"],
                last_updated=str(r["last_updated"]) if r.get("last_updated") else None,
            )
            for r in rows
        ]
        return MetaSeriesResponse(series=items, count=len(items))


@router.get("/last-update", response_model=LastUpdateResponse)
async def last_update():
    pool = await get_pool()
    async with pool.acquire() as conn:
        run = await get_last_collection_run(conn)
        if not run:
            return LastUpdateResponse()
        return LastUpdateResponse(
            last_collection=str(run["run_date"]),
            status=run.get("status"),
            series_collected=run.get("series_collected"),
            records_inserted=run.get("records_inserted"),
        )
