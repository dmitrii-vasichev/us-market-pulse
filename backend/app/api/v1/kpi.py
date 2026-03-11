"""KPI summary endpoint."""

from fastapi import APIRouter, HTTPException

from app.db.database import get_pool
from app.db.queries import get_last_collection_run
from app.models.schemas import KpiSummaryResponse
from app.services.kpi_calculator import compute_all_kpis

router = APIRouter(prefix="/api/v1/kpi", tags=["KPI"])


@router.get("/summary", response_model=KpiSummaryResponse)
async def kpi_summary():
    pool = await get_pool()
    async with pool.acquire() as conn:
        kpis = await compute_all_kpis(conn)
        last_run = await get_last_collection_run(conn)

        updated_at = None
        if last_run and last_run.get("run_date"):
            updated_at = str(last_run["run_date"])

        return KpiSummaryResponse(kpis=kpis, updated_at=updated_at)
