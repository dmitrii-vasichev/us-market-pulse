"""KPI summary endpoint."""

from fastapi import APIRouter

from app.db.database import get_pool
from app.db.queries import get_last_collection_run, get_series_metadata, get_latest_series_observation_date
from app.models.schemas import KpiSummaryResponse
from app.services.kpi_calculator import KPI_DEFINITIONS, compute_all_kpis
from app.services.kpi_targets import attach_kpi_target_policies, build_kpi_summary_provenance

router = APIRouter(prefix="/api/v1/kpi", tags=["KPI"])


@router.get("/summary", response_model=KpiSummaryResponse)
async def kpi_summary():
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

        kpis_with_policy = attach_kpi_target_policies(kpis)
        latest_date = max(latest_dates, default=None)
        provenance = build_kpi_summary_provenance(
            metadata_rows,
            latest_date=latest_date,
        )

        return KpiSummaryResponse(
            kpis=kpis_with_policy,
            updated_at=updated_at,
            **provenance.model_dump(),
        )
