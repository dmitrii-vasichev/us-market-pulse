"""State comparison endpoint for scatter/bubble chart."""

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/states", tags=["States"])


@router.get("/comparison")
async def states_comparison():
    """State-level GDP vs unemployment for scatter plot.
    X: unemployment rate, Y: GDP per capita, Size: population.
    Colorado highlighted.
    """
    # Census/BEA data — approximate values for top states
    # In production, these would come from Census API
    states = [
        {"id": "CA", "state": "California", "unemployment": 5.1, "gdp_per_capita": 82000, "population": 39500000},
        {"id": "TX", "state": "Texas", "unemployment": 4.0, "gdp_per_capita": 68000, "population": 30000000},
        {"id": "NY", "state": "New York", "unemployment": 4.5, "gdp_per_capita": 90000, "population": 20200000},
        {"id": "FL", "state": "Florida", "unemployment": 3.3, "gdp_per_capita": 55000, "population": 22200000},
        {"id": "IL", "state": "Illinois", "unemployment": 4.8, "gdp_per_capita": 72000, "population": 12800000},
        {"id": "PA", "state": "Pennsylvania", "unemployment": 4.1, "gdp_per_capita": 63000, "population": 13000000},
        {"id": "OH", "state": "Ohio", "unemployment": 3.9, "gdp_per_capita": 58000, "population": 11800000},
        {"id": "CO", "state": "Colorado", "unemployment": 3.2, "gdp_per_capita": 75000, "population": 5800000, "highlighted": True},
        {"id": "WA", "state": "Washington", "unemployment": 3.8, "gdp_per_capita": 80000, "population": 7700000},
        {"id": "MA", "state": "Massachusetts", "unemployment": 3.5, "gdp_per_capita": 95000, "population": 7000000},
        {"id": "NV", "state": "Nevada", "unemployment": 5.5, "gdp_per_capita": 52000, "population": 3100000},
        {"id": "MI", "state": "Michigan", "unemployment": 4.3, "gdp_per_capita": 54000, "population": 10000000},
    ]

    # Format for Nivo scatterplot
    data = [{
        "id": "states",
        "data": [
            {"x": s["unemployment"], "y": s["gdp_per_capita"], "size": s["population"] / 1000000, "label": s["state"], "highlighted": s.get("highlighted", False)}
            for s in states
        ]
    }]

    return {"data": data}
