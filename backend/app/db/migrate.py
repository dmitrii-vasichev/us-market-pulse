"""Run database migrations."""

import asyncio
from pathlib import Path

import asyncpg

from app.config import settings

MIGRATIONS_DIR = Path(__file__).parent / "migrations"


async def run_migrations() -> None:
    conn = await asyncpg.connect(settings.asyncpg_url)
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
