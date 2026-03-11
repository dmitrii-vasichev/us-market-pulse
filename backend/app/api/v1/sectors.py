"""GDP by sector endpoint for treemap chart."""

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/sectors", tags=["Sectors"])


@router.get("/gdp")
async def sectors_gdp():
    """GDP breakdown by sector for treemap visualization."""
    # BEA industry data — approximate shares
    # In production, these would come from BEA API
    sectors = {
        "name": "US GDP",
        "children": [
            {
                "name": "Services",
                "children": [
                    {"name": "Finance & Insurance", "value": 8.2},
                    {"name": "Professional Services", "value": 7.5},
                    {"name": "Healthcare", "value": 7.3},
                    {"name": "Information Tech", "value": 5.8},
                    {"name": "Retail Trade", "value": 5.6},
                    {"name": "Wholesale Trade", "value": 5.5},
                    {"name": "Real Estate", "value": 11.8},
                ],
            },
            {
                "name": "Industry",
                "children": [
                    {"name": "Manufacturing", "value": 10.8},
                    {"name": "Construction", "value": 4.2},
                    {"name": "Mining & Utilities", "value": 3.5},
                ],
            },
            {
                "name": "Government",
                "children": [
                    {"name": "Federal", "value": 6.8},
                    {"name": "State & Local", "value": 9.5},
                ],
            },
            {
                "name": "Other",
                "children": [
                    {"name": "Transportation", "value": 3.1},
                    {"name": "Education", "value": 1.2},
                    {"name": "Arts & Entertainment", "value": 1.0},
                    {"name": "Agriculture", "value": 0.9},
                    {"name": "Other Services", "value": 7.3},
                ],
            },
        ],
    }
    return {"tree": sectors}
