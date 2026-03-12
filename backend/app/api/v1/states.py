"""State comparison endpoint for scatter/bubble chart."""

from fastapi import APIRouter

from app.db.database import get_pool
from app.models.schemas import StatesComparisonResponse
from app.services.state_comparison import get_state_comparison_response

router = APIRouter(prefix="/api/v1/states", tags=["States"])


@router.get("/comparison", response_model=StatesComparisonResponse)
async def states_comparison():
    """State-level GDP vs unemployment for scatter plot.
    X: unemployment rate, Y: GDP per capita, Size: population.
    Colorado highlighted.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        payload = await get_state_comparison_response(conn)
        return StatesComparisonResponse(**payload)
