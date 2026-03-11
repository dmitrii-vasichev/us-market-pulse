"""CPI endpoints: calendar heatmap and category breakdown."""

from fastapi import APIRouter

from app.db.database import get_pool

router = APIRouter(prefix="/api/v1/cpi", tags=["CPI"])


@router.get("/calendar")
async def cpi_calendar():
    """CPI data for calendar heatmap (Nivo @nivo/calendar format)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT date, value FROM economic_series
            WHERE series_id = 'CPIAUCSL' AND value IS NOT NULL
            ORDER BY date ASC
            """
        )
        if len(rows) < 13:
            return {"data": [], "from_date": None, "to_date": None}

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

        return {
            "data": calendar_data,
            "from_date": calendar_data[0]["day"] if calendar_data else None,
            "to_date": calendar_data[-1]["day"] if calendar_data else None,
        }


@router.get("/categories")
async def cpi_categories():
    """CPI breakdown by category for waffle chart."""
    # BLS CPI categories — using approximate weights
    # In production, these would come from BLS API
    categories = [
        {"id": "housing", "label": "Housing", "value": 34.9},
        {"id": "food", "label": "Food & Beverages", "value": 14.3},
        {"id": "transport", "label": "Transportation", "value": 16.7},
        {"id": "medical", "label": "Medical Care", "value": 8.9},
        {"id": "education", "label": "Education & Communication", "value": 6.1},
        {"id": "recreation", "label": "Recreation", "value": 5.6},
        {"id": "apparel", "label": "Apparel", "value": 2.6},
        {"id": "other", "label": "Other", "value": 10.9},
    ]
    return {"categories": categories, "total": 100.0}
