from pathlib import Path


def test_migration_files_exist():
    migrations_dir = Path(__file__).parent.parent / "app" / "db" / "migrations"
    files = sorted(migrations_dir.glob("*.sql"))
    assert len(files) >= 1
    assert files[0].name == "001_initial_schema.sql"


def test_migration_sql_contains_all_tables():
    sql_path = Path(__file__).parent.parent / "app" / "db" / "migrations" / "001_initial_schema.sql"
    sql = sql_path.read_text()
    assert "economic_series" in sql
    assert "series_metadata" in sql
    assert "collection_runs" in sql
    assert "kpi_snapshots" in sql


def test_migration_sql_contains_indexes():
    sql_path = Path(__file__).parent.parent / "app" / "db" / "migrations" / "001_initial_schema.sql"
    sql = sql_path.read_text()
    assert "idx_economic_series_lookup" in sql
    assert "idx_kpi_snapshots_key" in sql


def test_migration_sql_is_idempotent():
    sql_path = Path(__file__).parent.parent / "app" / "db" / "migrations" / "001_initial_schema.sql"
    sql = sql_path.read_text()
    # All CREATE statements should use IF NOT EXISTS
    for line in sql.split("\n"):
        line_stripped = line.strip().upper()
        if line_stripped.startswith("CREATE TABLE"):
            assert "IF NOT EXISTS" in line_stripped, f"Missing IF NOT EXISTS: {line.strip()}"
        if line_stripped.startswith("CREATE INDEX"):
            assert "IF NOT EXISTS" in line_stripped, f"Missing IF NOT EXISTS: {line.strip()}"
