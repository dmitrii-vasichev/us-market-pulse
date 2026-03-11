from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import close_pool, get_pool
from app.api.v1.kpi import router as kpi_router
from app.api.v1.series import router as series_router
from app.api.v1.meta import router as meta_router


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


@app.get("/health")
async def health():
    return {"status": "ok"}
