"""Full overview payload endpoint — optimized single call for Tab 1."""

from fastapi import APIRouter

from app.db.database import get_pool
from app.db.queries import get_last_collection_run, get_series_metadata, get_latest_series_observation_date
from app.models.schemas import OverviewResponse
from app.services.kpi_calculator import KPI_DEFINITIONS, compute_all_kpis
from app.services.provenance import build_metadata_provenance

router = APIRouter(prefix="/api/v1", tags=["Overview"])


@router.get("/overview", response_model=OverviewResponse)
async def overview():
    """Full overview payload combining KPIs and key metrics for Tab 1."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        kpis = await compute_all_kpis(conn)
        last_run = await get_last_collection_run(conn)
        series_ids = [definition["series_id"] for definition in KPI_DEFINITIONS.values()]
        metadata_rows = [
            meta
            for sid in series_ids
            if (meta := await get_series_metadata(conn, sid))
        ]
        latest_dates = [
            latest_date
            for sid in series_ids
            if (latest_date := await get_latest_series_observation_date(conn, sid))
        ]

        updated_at = None
        if last_run and last_run.get("run_date"):
            updated_at = str(last_run["run_date"])

        latest_date = max(latest_dates, default=None)
        provenance = build_metadata_provenance(
            metadata_rows,
            methodology_type="source_backed",
            latest_date=latest_date,
            fallback_dataset="Overview KPI Summary",
            source_series_ids=series_ids,
        )

        return OverviewResponse(
            kpis=kpis,
            updated_at=updated_at,
            **provenance.model_dump(),
        )
