-- 001_initial_schema.sql
-- US Market Pulse — initial database schema

CREATE TABLE IF NOT EXISTS series_metadata (
    id SERIAL PRIMARY KEY,
    series_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    units VARCHAR(200),
    frequency VARCHAR(50),
    seasonal_adjustment VARCHAR(100),
    source VARCHAR(200),
    category VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    last_updated DATE
);

CREATE TABLE IF NOT EXISTS economic_series (
    id SERIAL PRIMARY KEY,
    series_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    value DECIMAL(20, 4),
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(series_id, date)
);

CREATE TABLE IF NOT EXISTS collection_runs (
    id SERIAL PRIMARY KEY,
    run_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL,
    series_collected INTEGER,
    records_inserted INTEGER,
    error_message TEXT,
    duration_seconds FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpi_snapshots (
    id SERIAL PRIMARY KEY,
    computed_at TIMESTAMPTZ NOT NULL,
    kpi_key VARCHAR(50) NOT NULL,
    current_value DECIMAL(20, 4),
    previous_value DECIMAL(20, 4),
    change_absolute DECIMAL(20, 4),
    change_percent DECIMAL(10, 4),
    period_label VARCHAR(100),
    UNIQUE(computed_at, kpi_key)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_economic_series_lookup
    ON economic_series(series_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_series_metadata_active
    ON series_metadata(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_key
    ON kpi_snapshots(kpi_key, computed_at DESC);

CREATE INDEX IF NOT EXISTS idx_collection_runs_date
    ON collection_runs(run_date DESC);
