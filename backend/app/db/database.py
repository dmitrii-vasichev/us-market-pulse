import ssl

import asyncpg

from app.config import settings

pool: asyncpg.Pool | None = None


def _get_ssl_context() -> ssl.SSLContext | None:
    url = settings.asyncpg_url
    if "railway" in url or "proxy.rlwy.net" in url:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return ctx
    return None


async def get_pool() -> asyncpg.Pool:
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(
            settings.asyncpg_url,
            min_size=2,
            max_size=10,
            ssl=_get_ssl_context(),
        )
    return pool


async def close_pool() -> None:
    global pool
    if pool is not None:
        await pool.close()
        pool = None
