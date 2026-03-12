"""GDP by sector endpoint for treemap and waffle charts."""

from fastapi import APIRouter

from app.db.database import get_pool
from app.models.schemas import SectorsGdpResponse
from app.services.sector_gdp import get_sector_gdp_response

router = APIRouter(prefix="/api/v1/sectors", tags=["Sectors"])


@router.get("/gdp", response_model=SectorsGdpResponse)
async def sectors_gdp():
    """GDP sector share tree derived from the latest stored BEA snapshot."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        payload = await get_sector_gdp_response(conn)
        return SectorsGdpResponse(**payload)
