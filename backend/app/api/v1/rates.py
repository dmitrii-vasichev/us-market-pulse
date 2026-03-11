"""Interest rates endpoint for multi-line chart."""

from fastapi import APIRouter, Query

from app.db.database import get_pool

router = APIRouter(prefix="/api/v1/rates", tags=["Rates"])


@router.get("/history")
async def rates_history(
    months: int = Query(24, description="Number of months of history"),
):
    """Fed Funds Rate, 30Y Mortgage, 10Y Treasury for multi-line chart."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        series_config = [
            {"series_id": "FEDFUNDS", "label": "Fed Funds Rate", "curve": "step"},
            {"series_id": "MORTGAGE30US", "label": "30Y Mortgage", "curve": "monotoneX"},
            {"series_id": "DGS10", "label": "10Y Treasury", "curve": "monotoneX"},
        ]

        result = []
        for config in series_config:
            rows = await conn.fetch(
                """
                SELECT date, value FROM economic_series
                WHERE series_id = $1 AND value IS NOT NULL
                ORDER BY date DESC LIMIT $2
                """,
                config["series_id"],
                months * 30,  # Approximate daily records for N months
            )
            data_points = [
                {"x": str(r["date"]), "y": float(r["value"])}
                for r in reversed(rows)
            ]
            result.append({
                "id": config["label"],
                "curve": config["curve"],
                "data": data_points,
            })

        return {"series": result}
