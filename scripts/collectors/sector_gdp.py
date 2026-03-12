"""Collector for BEA GDP-by-industry sector hierarchy snapshots."""

from __future__ import annotations

import re
from datetime import date
from typing import Any

import httpx

from collectors.bea import fetch_bea_data, fetch_bea_parameter_values, parse_bea_numeric_value

SECTOR_TABLE_DESCRIPTION_HINT = "Value Added by Industry"

SECTOR_LEAF_SPECS = [
    {
        "node_key": "services.finance-insurance",
        "node_label": "Finance & Insurance",
        "parent_node_key": "services",
        "display_order": 1,
        "aliases": ["finance and insurance"],
    },
    {
        "node_key": "services.professional-services",
        "node_label": "Professional Services",
        "parent_node_key": "services",
        "display_order": 2,
        "aliases": ["professional, scientific, and technical services", "management of companies and enterprises", "administrative and support and waste management and remediation services"],
    },
    {
        "node_key": "services.healthcare",
        "node_label": "Healthcare",
        "parent_node_key": "services",
        "display_order": 3,
        "aliases": ["health care and social assistance"],
    },
    {
        "node_key": "services.information-tech",
        "node_label": "Information Tech",
        "parent_node_key": "services",
        "display_order": 4,
        "aliases": ["information"],
    },
    {
        "node_key": "services.retail-trade",
        "node_label": "Retail Trade",
        "parent_node_key": "services",
        "display_order": 5,
        "aliases": ["retail trade"],
    },
    {
        "node_key": "services.wholesale-trade",
        "node_label": "Wholesale Trade",
        "parent_node_key": "services",
        "display_order": 6,
        "aliases": ["wholesale trade"],
    },
    {
        "node_key": "services.real-estate",
        "node_label": "Real Estate",
        "parent_node_key": "services",
        "display_order": 7,
        "aliases": ["real estate and rental and leasing"],
    },
    {
        "node_key": "industry.manufacturing",
        "node_label": "Manufacturing",
        "parent_node_key": "industry",
        "display_order": 1,
        "aliases": ["manufacturing"],
    },
    {
        "node_key": "industry.construction",
        "node_label": "Construction",
        "parent_node_key": "industry",
        "display_order": 2,
        "aliases": ["construction"],
    },
    {
        "node_key": "industry.mining-utilities",
        "node_label": "Mining & Utilities",
        "parent_node_key": "industry",
        "display_order": 3,
        "aliases": ["mining, quarrying, and oil and gas extraction", "utilities"],
    },
    {
        "node_key": "government.federal",
        "node_label": "Federal",
        "parent_node_key": "government",
        "display_order": 1,
        "aliases": ["federal military", "federal civilian"],
    },
    {
        "node_key": "government.state-local",
        "node_label": "State & Local",
        "parent_node_key": "government",
        "display_order": 2,
        "aliases": ["state and local"],
    },
    {
        "node_key": "other.transportation",
        "node_label": "Transportation",
        "parent_node_key": "other",
        "display_order": 1,
        "aliases": ["transportation and warehousing"],
    },
    {
        "node_key": "other.education",
        "node_label": "Education",
        "parent_node_key": "other",
        "display_order": 2,
        "aliases": ["educational services"],
    },
    {
        "node_key": "other.arts-entertainment",
        "node_label": "Arts & Entertainment",
        "parent_node_key": "other",
        "display_order": 3,
        "aliases": ["arts, entertainment, and recreation", "accommodation and food services"],
    },
    {
        "node_key": "other.agriculture",
        "node_label": "Agriculture",
        "parent_node_key": "other",
        "display_order": 4,
        "aliases": ["agriculture, forestry, fishing, and hunting"],
    },
    {
        "node_key": "other.other-services",
        "node_label": "Other Services",
        "parent_node_key": "other",
        "display_order": 5,
        "aliases": ["other services, except government"],
    },
]

SECTOR_GROUP_SPECS = [
    {"node_key": "services", "node_label": "Services", "parent_node_key": "root", "display_order": 1},
    {"node_key": "industry", "node_label": "Industry", "parent_node_key": "root", "display_order": 2},
    {"node_key": "government", "node_label": "Government", "parent_node_key": "root", "display_order": 3},
    {"node_key": "other", "node_label": "Other", "parent_node_key": "root", "display_order": 4},
]


def normalize_industry_label(label: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", label.lower()).strip()


def select_sector_table_id(param_values: list[dict[str, Any]]) -> str:
    for value in param_values:
        desc = str(value.get("Desc", "")).lower()
        if SECTOR_TABLE_DESCRIPTION_HINT.lower() in desc:
            return str(value.get("Key"))
    raise ValueError("Unable to determine BEA GDP-by-industry table for value-added data")


def _match_leaf_spec(industry_label: str) -> dict[str, Any] | None:
    normalized = normalize_industry_label(industry_label)
    for spec in SECTOR_LEAF_SPECS:
        if normalized in {normalize_industry_label(alias) for alias in spec["aliases"]}:
            return spec
    return None


def _parse_quarter_period(time_period: str) -> tuple[date, str] | None:
    match = re.fullmatch(r"(\d{4})Q([1-4])", time_period.replace(":", "").strip())
    if not match:
        return None

    year = int(match.group(1))
    quarter = int(match.group(2))
    month = {1: 1, 2: 4, 3: 7, 4: 10}[quarter]
    return date(year, month, 1), f"Q{quarter} {year}"


def parse_sector_gdp_response(payload_rows: list[dict[str, Any]]) -> list[dict]:
    parsed_rows: list[dict] = []
    for row in payload_rows:
        time_period = str(
            row.get("TimePeriod")
            or row.get("Year")
            or row.get("Quarter")
            or ""
        )
        parsed_period = _parse_quarter_period(time_period)
        if not parsed_period:
            continue

        industry_label = str(
            row.get("Industries")
            or row.get("Industry")
            or row.get("IndustryDescription")
            or row.get("Description")
            or ""
        ).strip()
        value = parse_bea_numeric_value(row.get("DataValue"))
        if not industry_label or value is None:
            continue

        parsed_rows.append(
            {
                "snapshot_date": parsed_period[0],
                "period_label": parsed_period[1],
                "industry_label": industry_label,
                "value_current_dollars": value,
            }
        )

    return parsed_rows


def aggregate_sector_gdp_snapshot_rows(raw_rows: list[dict]) -> list[dict]:
    grouped: dict[tuple[date, str], dict[str, float]] = {}
    for row in raw_rows:
        leaf_spec = _match_leaf_spec(row["industry_label"])
        if not leaf_spec:
            continue

        group_key = (row["snapshot_date"], row["period_label"])
        grouped.setdefault(group_key, {})
        grouped[group_key][leaf_spec["node_key"]] = grouped[group_key].get(
            leaf_spec["node_key"],
            0.0,
        ) + float(row["value_current_dollars"])

    if not grouped:
        raise ValueError("No BEA GDP-by-industry rows matched the configured public sector hierarchy")

    records: list[dict] = []
    for (snapshot_date, period_label), leaf_totals in sorted(grouped.items()):
        top_level_totals = {group["node_key"]: 0.0 for group in SECTOR_GROUP_SPECS}
        for leaf_spec in SECTOR_LEAF_SPECS:
            value = leaf_totals.get(leaf_spec["node_key"], 0.0)
            top_level_totals[leaf_spec["parent_node_key"]] += value
            records.append(
                {
                    "snapshot_date": snapshot_date,
                    "period_label": period_label,
                    "node_key": leaf_spec["node_key"],
                    "parent_node_key": leaf_spec["parent_node_key"],
                    "node_label": leaf_spec["node_label"],
                    "depth": 2,
                    "display_order": leaf_spec["display_order"],
                    "value_current_dollars": value,
                    "source_provider": "BEA",
                    "source_dataset": "GDP by Industry, current-dollar value added by industry",
                    "source_metadata": {
                        "matched_aliases": leaf_spec["aliases"],
                    },
                }
            )

        root_total = 0.0
        for group_spec in SECTOR_GROUP_SPECS:
            group_value = top_level_totals[group_spec["node_key"]]
            root_total += group_value
            records.append(
                {
                    "snapshot_date": snapshot_date,
                    "period_label": period_label,
                    "node_key": group_spec["node_key"],
                    "parent_node_key": group_spec["parent_node_key"],
                    "node_label": group_spec["node_label"],
                    "depth": 1,
                    "display_order": group_spec["display_order"],
                    "value_current_dollars": group_value,
                    "source_provider": "BEA",
                    "source_dataset": "GDP by Industry, current-dollar value added by industry",
                    "source_metadata": {},
                }
            )

        records.append(
            {
                "snapshot_date": snapshot_date,
                "period_label": period_label,
                "node_key": "root",
                "parent_node_key": None,
                "node_label": "US GDP",
                "depth": 0,
                "display_order": 0,
                "value_current_dollars": root_total,
                "source_provider": "BEA",
                "source_dataset": "GDP by Industry, current-dollar value added by industry",
                "source_metadata": {},
            }
        )

    return records


async def fetch_sector_gdp_snapshots(
    client: httpx.AsyncClient,
    years: list[int],
    bea_api_key: str,
) -> list[dict]:
    table_id = select_sector_table_id(
        await fetch_bea_parameter_values(
            client,
            bea_api_key,
            "GDPbyIndustry",
            parameter_name="TableID",
        )
    )
    payload_rows = await fetch_bea_data(
        client,
        bea_api_key,
        "GDPbyIndustry",
        TableID=table_id,
        Industry="ALL",
        Frequency="Q",
        Year=",".join(str(year) for year in sorted(set(years))),
    )
    return aggregate_sector_gdp_snapshot_rows(parse_sector_gdp_response(payload_rows))
