"""GDP endpoints: waterfall components and quarterly growth."""

from fastapi import APIRouter

from app.db.database import get_pool
from app.db.queries import get_series_metadata
from app.models.schemas import GdpComponentsResponse, GdpQuarterlyResponse
from app.services.gdp_waterfall import get_gdp_waterfall_response
from app.services.provenance import build_metadata_provenance

router = APIRouter(prefix="/api/v1/gdp", tags=["GDP"])


@router.get("/components", response_model=GdpComponentsResponse)
async def gdp_components():
    """GDP breakdown by component for waterfall chart."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        response = await get_gdp_waterfall_response(conn)
        return GdpComponentsResponse(**response)


@router.get("/quarterly", response_model=GdpQuarterlyResponse)
async def gdp_quarterly():
    """GDP quarterly growth rate for bar chart."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        meta = await get_series_metadata(conn, "A191RL1Q225SBEA")
        rows = await conn.fetch(
            """
            SELECT date, value FROM economic_series
            WHERE series_id = 'A191RL1Q225SBEA' AND value IS NOT NULL
            ORDER BY date DESC LIMIT 8
            """
        )
        data = [
            {"quarter": str(r["date"]), "value": float(r["value"])}
            for r in reversed(rows)
        ]
        latest_date = rows[0]["date"] if rows else None
        provenance = build_metadata_provenance(
            [meta] if meta else [],
            methodology_type="source_backed",
            latest_date=latest_date,
            period_kind="quarter",
            fallback_source_name="BEA",
            fallback_dataset="Real GDP Growth Rate (Contributions by Component)",
            source_series_ids=["A191RL1Q225SBEA"],
        )
        return GdpQuarterlyResponse(
            data=data,
            **provenance.model_dump(),
        )
