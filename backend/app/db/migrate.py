"""Run database migrations."""

import asyncio
import ssl
from pathlib import Path

import asyncpg

from app.config import settings

MIGRATIONS_DIR = Path(__file__).parent / "migrations"


def _get_ssl_context(url: str):
    """Create SSL context for external DB connections."""
    if "railway" in url or "proxy.rlwy.net" in url:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return ctx
    return None


async def run_migrations() -> None:
    ssl_ctx = _get_ssl_context(settings.asyncpg_url)
    conn = await asyncpg.connect(settings.asyncpg_url, ssl=ssl_ctx)
    try:
        # Create migrations tracking table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                applied_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)

        # Get already applied migrations
        applied = set(
            row["filename"]
            for row in await conn.fetch("SELECT filename FROM _migrations ORDER BY filename")
        )

        # Run pending migrations in order
        migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
        for migration_file in migration_files:
            if migration_file.name in applied:
                print(f"  Skip: {migration_file.name} (already applied)")
                continue

            print(f"  Apply: {migration_file.name}")
            sql = migration_file.read_text()
            await conn.execute(sql)
            await conn.execute(
                "INSERT INTO _migrations (filename) VALUES ($1)",
                migration_file.name,
            )
            print(f"  Done: {migration_file.name}")

        print("Migrations complete.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(run_migrations())
