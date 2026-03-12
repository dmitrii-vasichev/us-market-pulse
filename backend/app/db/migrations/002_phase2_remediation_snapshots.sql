-- 002_phase2_remediation_snapshots.sql
-- Source-Backed Remediation Phase 2 dimensional snapshot storage

CREATE TABLE IF NOT EXISTS cpi_category_snapshots (
    id SERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    period_label VARCHAR(100) NOT NULL,
    category_key VARCHAR(100) NOT NULL,
    category_label VARCHAR(200) NOT NULL,
    display_order INTEGER DEFAULT 0,
    relative_importance DECIMAL(10, 4) NOT NULL,
    source_provider VARCHAR(100) NOT NULL,
    source_dataset VARCHAR(255) NOT NULL,
    source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_cpi_category_snapshots UNIQUE (snapshot_date, category_key),
    CONSTRAINT chk_cpi_relative_importance_nonnegative CHECK (relative_importance >= 0)
);

CREATE TABLE IF NOT EXISTS state_indicator_snapshots (
    id SERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    period_label VARCHAR(100) NOT NULL,
    state_code CHAR(2) NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    unemployment_rate DECIMAL(10, 4) NOT NULL,
    gdp_current_dollars DECIMAL(20, 2) NOT NULL,
    population BIGINT NOT NULL,
    source_providers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    source_datasets TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_state_indicator_snapshots UNIQUE (snapshot_date, state_code),
    CONSTRAINT chk_state_indicator_unemployment_nonnegative CHECK (unemployment_rate >= 0),
    CONSTRAINT chk_state_indicator_gdp_nonnegative CHECK (gdp_current_dollars >= 0),
    CONSTRAINT chk_state_indicator_population_positive CHECK (population > 0)
);

CREATE TABLE IF NOT EXISTS sector_gdp_snapshots (
    id SERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    period_label VARCHAR(100) NOT NULL,
    node_key VARCHAR(120) NOT NULL,
    parent_node_key VARCHAR(120),
    node_label VARCHAR(200) NOT NULL,
    depth INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    value_current_dollars DECIMAL(20, 2) NOT NULL,
    source_provider VARCHAR(100) NOT NULL,
    source_dataset VARCHAR(255) NOT NULL,
    source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_sector_gdp_snapshots UNIQUE (snapshot_date, node_key),
    CONSTRAINT chk_sector_gdp_depth_nonnegative CHECK (depth >= 0),
    CONSTRAINT chk_sector_gdp_value_nonnegative CHECK (value_current_dollars >= 0)
);

CREATE INDEX IF NOT EXISTS idx_cpi_category_snapshots_latest
    ON cpi_category_snapshots(snapshot_date DESC, display_order ASC, category_key ASC);

CREATE INDEX IF NOT EXISTS idx_state_indicator_snapshots_latest
    ON state_indicator_snapshots(snapshot_date DESC, display_order ASC, state_code ASC);

CREATE INDEX IF NOT EXISTS idx_sector_gdp_snapshots_latest
    ON sector_gdp_snapshots(snapshot_date DESC, parent_node_key, display_order ASC, node_key ASC);
