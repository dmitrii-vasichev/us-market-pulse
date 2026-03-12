"""CPI endpoints: calendar heatmap and category breakdown."""

from fastapi import APIRouter

from app.db.database import get_pool
from app.db.queries import get_series_metadata
from app.models.schemas import CpiCalendarResponse, CpiCategoriesResponse
from app.services.cpi_categories import get_cpi_categories_response
from app.services.provenance import build_metadata_provenance

router = APIRouter(prefix="/api/v1/cpi", tags=["CPI"])


@router.get("/calendar", response_model=CpiCalendarResponse)
async def cpi_calendar():
    """CPI data for calendar heatmap (Nivo @nivo/calendar format)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        meta = await get_series_metadata(conn, "CPIAUCSL")
        rows = await conn.fetch(
            """
            SELECT date, value FROM economic_series
            WHERE series_id = 'CPIAUCSL' AND value IS NOT NULL
            ORDER BY date ASC
            """
        )
        latest_date = rows[-1]["date"] if rows else None
        provenance = build_metadata_provenance(
            [meta] if meta else [],
            methodology_type="source_backed",
            latest_date=latest_date,
            period_kind="month",
            fallback_source_name="BLS",
            fallback_dataset="Consumer Price Index for All Urban Consumers",
            source_series_ids=["CPIAUCSL"],
        )
        if len(rows) < 13:
            return CpiCalendarResponse(
                data=[],
                from_date=None,
                to_date=None,
                **provenance.model_dump(),
            )

        # Compute YoY % change for each month
        values = [(r["date"], float(r["value"])) for r in rows]
        calendar_data = []
        for i in range(12, len(values)):
            current_date, current_val = values[i]
            _, prev_val = values[i - 12]
            if prev_val > 0:
                yoy_change = ((current_val - prev_val) / prev_val) * 100
                calendar_data.append({
                    "day": str(current_date),
                    "value": round(yoy_change, 2),
                })

        return CpiCalendarResponse(
            data=calendar_data,
            from_date=calendar_data[0]["day"] if calendar_data else None,
            to_date=calendar_data[-1]["day"] if calendar_data else None,
            **provenance.model_dump(),
        )


@router.get("/categories", response_model=CpiCategoriesResponse)
async def cpi_categories():
    """CPI breakdown by category for the labor heatmap card."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        payload = await get_cpi_categories_response(conn)
        return CpiCategoriesResponse(**payload)
