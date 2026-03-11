from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import close_pool, get_pool
from app.api.v1.kpi import router as kpi_router
from app.api.v1.series import router as series_router
from app.api.v1.meta import router as meta_router
from app.api.v1.gdp import router as gdp_router
from app.api.v1.cpi import router as cpi_router
from app.api.v1.labor import router as labor_router
from app.api.v1.states import router as states_router
from app.api.v1.rates import router as rates_router
from app.api.v1.sectors import router as sectors_router
from app.api.v1.sentiment import router as sentiment_router
from app.api.v1.overview import router as overview_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_pool()
    yield
    await close_pool()


app = FastAPI(
    title="US Market Pulse API",
    description="Economy & Market Intelligence Dashboard API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


app.include_router(kpi_router)
app.include_router(series_router)
app.include_router(meta_router)
app.include_router(gdp_router)
app.include_router(cpi_router)
app.include_router(labor_router)
app.include_router(states_router)
app.include_router(rates_router)
app.include_router(sectors_router)
app.include_router(sentiment_router)
app.include_router(overview_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
