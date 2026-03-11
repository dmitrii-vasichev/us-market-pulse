"""Shared test fixtures."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app


def make_mock_pool():
    """Create a mock connection pool with a mock connection."""
    mock_conn = AsyncMock()
    mock_conn.fetch = AsyncMock(return_value=[])
    mock_conn.fetchrow = AsyncMock(return_value=None)

    mock_pool = AsyncMock()
    mock_pool.acquire = MagicMock()

    # Make async context manager work
    ctx = AsyncMock()
    ctx.__aenter__ = AsyncMock(return_value=mock_conn)
    ctx.__aexit__ = AsyncMock(return_value=False)
    mock_pool.acquire.return_value = ctx

    return mock_pool, mock_conn


@pytest_asyncio.fixture
async def mock_db():
    """Fixture providing mock pool and connection."""
    mock_pool, mock_conn = make_mock_pool()

    modules_with_pool = [
        "app.db.database",
        "app.api.v1.kpi",
        "app.api.v1.series",
        "app.api.v1.meta",
        "app.api.v1.gdp",
        "app.api.v1.cpi",
        "app.api.v1.labor",
        "app.api.v1.rates",
        "app.api.v1.sentiment",
        "app.api.v1.overview",
    ]
    patches = [patch(f"{m}.get_pool", new_callable=AsyncMock, return_value=mock_pool) for m in modules_with_pool]
    patches.append(patch("app.db.database.close_pool", new_callable=AsyncMock))

    for p in patches:
        p.start()
    yield mock_pool, mock_conn
    for p in patches:
        p.stop()


@pytest_asyncio.fixture
async def client(mock_db):
    """HTTP test client with mocked DB."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c, mock_db[1]  # client, mock_conn
