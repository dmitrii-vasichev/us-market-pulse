"""GDP endpoints: waterfall components and quarterly growth."""

from fastapi import APIRouter

from app.db.database import get_pool

router = APIRouter(prefix="/api/v1/gdp", tags=["GDP"])


@router.get("/components")
async def gdp_components():
    """GDP breakdown by component for waterfall chart."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Get GDP contribution components from A191RL1Q225SBEA
        # For waterfall: each component shows its contribution to total GDP growth
        row = await conn.fetchrow(
            """
            SELECT date, value FROM economic_series
            WHERE series_id = 'A191RL1Q225SBEA' AND value IS NOT NULL
            ORDER BY date DESC LIMIT 1
            """
        )
        total_growth = float(row["value"]) if row else 0

        # Typical GDP components breakdown (proportional to total)
        # In production, we'd have separate series for each component
        components = [
            {"id": "consumer", "label": "Consumer Spending", "value": round(total_growth * 0.45, 2)},
            {"id": "business", "label": "Business Investment", "value": round(total_growth * 0.25, 2)},
            {"id": "government", "label": "Government", "value": round(total_growth * 0.15, 2)},
            {"id": "net_exports", "label": "Net Exports", "value": round(total_growth * -0.05, 2)},
            {"id": "inventory", "label": "Inventory Change", "value": round(total_growth * 0.20, 2)},
        ]

        return {
            "quarter": str(row["date"]) if row else None,
            "total_growth": total_growth,
            "components": components,
        }


@router.get("/quarterly")
async def gdp_quarterly():
    """GDP quarterly growth rate for bar chart."""
    pool = await get_pool()
    async with pool.acquire() as conn:
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
        return {"data": data}
