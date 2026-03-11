"""Full overview payload endpoint — optimized single call for Tab 1."""

from fastapi import APIRouter

from app.db.database import get_pool
from app.db.queries import get_last_collection_run
from app.services.kpi_calculator import compute_all_kpis

router = APIRouter(prefix="/api/v1", tags=["Overview"])


@router.get("/overview")
async def overview():
    """Full overview payload combining KPIs and key metrics for Tab 1."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        kpis = await compute_all_kpis(conn)
        last_run = await get_last_collection_run(conn)

        updated_at = None
        if last_run and last_run.get("run_date"):
            updated_at = str(last_run["run_date"])

        return {
            "kpis": kpis,
            "updated_at": updated_at,
        }
