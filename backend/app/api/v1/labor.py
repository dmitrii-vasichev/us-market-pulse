"""Labor market endpoints: funnel and bump ranking."""

from fastapi import APIRouter

from app.db.database import get_pool

router = APIRouter(prefix="/api/v1/labor", tags=["Labor"])


@router.get("/funnel")
async def labor_funnel():
    """Economic flow funnel: GDP → Consumer → Business → Government → Net Exports."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        gdp_row = await conn.fetchrow(
            "SELECT value FROM economic_series WHERE series_id = 'GDP' AND value IS NOT NULL ORDER BY date DESC LIMIT 1"
        )
        gdp_val = float(gdp_row["value"]) if gdp_row else 28000

        # GDP components as funnel stages (approximate shares)
        stages = [
            {"id": "total_gdp", "label": "Total GDP", "value": round(gdp_val)},
            {"id": "consumer", "label": "Consumer Spending", "value": round(gdp_val * 0.68)},
            {"id": "business", "label": "Business Investment", "value": round(gdp_val * 0.18)},
            {"id": "government", "label": "Government Spending", "value": round(gdp_val * 0.17)},
            {"id": "net_exports", "label": "Net Exports", "value": round(gdp_val * 0.03)},
        ]
        return {"stages": stages}


@router.get("/ranking")
async def labor_ranking():
    """State unemployment rankings over time for bump chart.
    Shows top 8-10 states ranked by unemployment rate over 12 months.
    """
    # In production, this would come from BLS state-level data
    # For MVP, we simulate with representative state data
    states = ["California", "New York", "Texas", "Florida", "Illinois",
              "Pennsylvania", "Ohio", "Colorado", "Nevada", "Michigan"]

    # Generate 12 months of rankings
    months = []
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT date, value FROM economic_series
            WHERE series_id = 'UNRATE' AND value IS NOT NULL
            ORDER BY date DESC LIMIT 12
            """
        )

    base_rates = [4.2, 4.5, 4.0, 3.5, 4.8, 4.1, 3.9, 3.2, 5.1, 4.3]

    data = []
    for i, state in enumerate(states):
        state_data = {
            "id": state,
            "data": []
        }
        for j, row in enumerate(reversed(rows if rows else [])):
            # Simulate slight variations
            rank = ((i + j) % len(states)) + 1
            state_data["data"].append({
                "x": str(row["date"]),
                "y": rank,
            })
        if not rows:
            for month_idx in range(12):
                state_data["data"].append({"x": f"Month {month_idx + 1}", "y": ((i + month_idx) % len(states)) + 1})
        data.append(state_data)

    return {"data": data, "states": states}
