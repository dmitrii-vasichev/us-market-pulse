"""Collectors for state-level unemployment, GDP, and population snapshots."""

from __future__ import annotations

from datetime import date
from typing import Any

import httpx

from app.services.labor_ranking import BLS_TIMESERIES_URL

from collectors.bea import fetch_bea_data, fetch_bea_parameter_values, parse_bea_numeric_value

CENSUS_POPULATION_URL_TEMPLATE = "https://api.census.gov/data/{vintage}/pep/charv"
STATE_GDP_TABLE_NAME = "SAGDP1"

CURATED_STATE_SPECS = [
    {"state_code": "CA", "state_name": "California", "state_fips": "06", "series_id": "LASST060000000000003", "display_order": 1},
    {"state_code": "TX", "state_name": "Texas", "state_fips": "48", "series_id": "LASST480000000000003", "display_order": 2},
    {"state_code": "NY", "state_name": "New York", "state_fips": "36", "series_id": "LASST360000000000003", "display_order": 3},
    {"state_code": "FL", "state_name": "Florida", "state_fips": "12", "series_id": "LASST120000000000003", "display_order": 4},
    {"state_code": "IL", "state_name": "Illinois", "state_fips": "17", "series_id": "LASST170000000000003", "display_order": 5},
    {"state_code": "PA", "state_name": "Pennsylvania", "state_fips": "42", "series_id": "LASST420000000000003", "display_order": 6},
    {"state_code": "OH", "state_name": "Ohio", "state_fips": "39", "series_id": "LASST390000000000003", "display_order": 7},
    {"state_code": "CO", "state_name": "Colorado", "state_fips": "08", "series_id": "LASST080000000000003", "display_order": 8},
    {"state_code": "WA", "state_name": "Washington", "state_fips": "53", "series_id": "LASST530000000000003", "display_order": 9},
    {"state_code": "MA", "state_name": "Massachusetts", "state_fips": "25", "series_id": "LASST250000000000003", "display_order": 10},
    {"state_code": "NV", "state_name": "Nevada", "state_fips": "32", "series_id": "LASST320000000000003", "display_order": 11},
    {"state_code": "MI", "state_name": "Michigan", "state_fips": "26", "series_id": "LASST260000000000003", "display_order": 12},
]

STATE_BY_SERIES_ID = {item["series_id"]: item for item in CURATED_STATE_SPECS}
STATE_BY_NAME = {item["state_name"]: item for item in CURATED_STATE_SPECS}
STATE_BY_FIPS = {item["state_fips"]: item for item in CURATED_STATE_SPECS}


def parse_bls_annual_average_payload(payload: dict[str, Any]) -> dict[int, dict[str, float]]:
    if payload.get("status") != "REQUEST_SUCCEEDED":
        raise ValueError("BLS API request failed")

    parsed: dict[int, dict[str, float]] = {}
    for series in payload.get("Results", {}).get("series", []):
        series_id = series.get("seriesID")
        state_spec = STATE_BY_SERIES_ID.get(str(series_id))
        if not state_spec:
            continue

        for item in series.get("data", []):
            if item.get("period") != "M13":
                continue
            raw_value = item.get("value")
            if raw_value in (None, "", ".", "-"):
                continue

            year = int(item["year"])
            parsed.setdefault(year, {})[state_spec["state_code"]] = float(raw_value)

    return parsed


async def fetch_state_unemployment_annual_averages(
    client: httpx.AsyncClient,
    years: list[int],
) -> dict[int, dict[str, float]]:
    response = await client.post(
        BLS_TIMESERIES_URL,
        json={
            "seriesid": [item["series_id"] for item in CURATED_STATE_SPECS],
            "startyear": str(min(years)),
            "endyear": str(max(years)),
            "annualaverage": True,
        },
    )
    response.raise_for_status()
    return parse_bls_annual_average_payload(response.json())


def parse_census_population_response(
    rows: list[list[str]],
    target_year: int,
) -> dict[int, dict[str, int]]:
    if not rows:
        raise ValueError("Census population response was empty")

    header = rows[0]
    header_index = {name: idx for idx, name in enumerate(header)}
    required = {"NAME", "POP", "STATE"}
    if not required.issubset(header_index):
        raise ValueError("Census population response missing required columns")

    parsed: dict[int, dict[str, int]] = {target_year: {}}
    for row in rows[1:]:
        fips = row[header_index["STATE"]]
        state_spec = STATE_BY_FIPS.get(fips)
        if not state_spec:
            continue

        parsed[target_year][state_spec["state_code"]] = int(float(row[header_index["POP"]]))

    return parsed


async def fetch_state_population_estimates(
    client: httpx.AsyncClient,
    years: list[int],
    census_vintage: int,
    census_api_key: str | None = None,
) -> dict[int, dict[str, int]]:
    results: dict[int, dict[str, int]] = {}
    for year in sorted(set(years)):
        params = {
            "get": "NAME,POP,STATE",
            "for": "state:*",
            "YEAR": str(year),
        }
        if census_api_key:
            params["key"] = census_api_key

        response = await client.get(
            CENSUS_POPULATION_URL_TEMPLATE.format(vintage=census_vintage),
            params=params,
        )
        response.raise_for_status()
        payload = response.json()
        results.update(parse_census_population_response(payload, year))

    return results


def select_state_gdp_line_code(param_values: list[dict[str, Any]]) -> str:
    for value in param_values:
        desc = str(value.get("Desc", "")).lower()
        if "gross domestic product" in desc and "current" in desc:
            return str(value.get("Key"))
    raise ValueError("Unable to determine BEA line code for current-dollar state GDP")


def parse_state_gdp_response(payload_rows: list[dict[str, Any]]) -> dict[int, dict[str, float]]:
    parsed: dict[int, dict[str, float]] = {}
    for row in payload_rows:
        state_spec = STATE_BY_NAME.get(str(row.get("GeoName")))
        value = parse_bea_numeric_value(row.get("DataValue"))
        if not state_spec or value is None:
            continue

        time_period = str(row.get("TimePeriod", "")).strip()
        if not time_period.isdigit():
            continue
        year = int(time_period)
        parsed.setdefault(year, {})[state_spec["state_code"]] = value

    return parsed


async def fetch_state_gdp_snapshots(
    client: httpx.AsyncClient,
    years: list[int],
    bea_api_key: str,
) -> dict[int, dict[str, float]]:
    line_code = select_state_gdp_line_code(
        await fetch_bea_parameter_values(
            client,
            bea_api_key,
            "Regional",
            target_parameter="LineCode",
            TableName=STATE_GDP_TABLE_NAME,
        )
    )
    data_rows = await fetch_bea_data(
        client,
        bea_api_key,
        "Regional",
        TableName=STATE_GDP_TABLE_NAME,
        LineCode=line_code,
        Year=",".join(str(year) for year in sorted(set(years))),
        GeoFips="STATE",
    )
    return parse_state_gdp_response(data_rows)


def build_state_indicator_snapshot_rows(
    unemployment_by_year: dict[int, dict[str, float]],
    population_by_year: dict[int, dict[str, int]],
    gdp_by_year: dict[int, dict[str, float]],
) -> list[dict]:
    years = sorted(set(unemployment_by_year) & set(population_by_year) & set(gdp_by_year))
    rows: list[dict] = []
    for year in years:
        missing_states = [
            spec["state_code"]
            for spec in CURATED_STATE_SPECS
            if spec["state_code"] not in unemployment_by_year.get(year, {})
            or spec["state_code"] not in population_by_year.get(year, {})
            or spec["state_code"] not in gdp_by_year.get(year, {})
        ]
        if missing_states:
            raise ValueError(
                f"Incomplete state indicator inputs for {year}: {', '.join(missing_states)}"
            )

        for spec in CURATED_STATE_SPECS:
            state_code = spec["state_code"]
            rows.append(
                {
                    "snapshot_date": date(year, 1, 1),
                    "period_label": str(year),
                    "state_code": state_code,
                    "state_name": spec["state_name"],
                    "display_order": spec["display_order"],
                    "unemployment_rate": unemployment_by_year[year][state_code],
                    "gdp_current_dollars": gdp_by_year[year][state_code],
                    "population": population_by_year[year][state_code],
                    "source_providers": ["BLS", "BEA", "Census Population Estimates Program"],
                    "source_datasets": [
                        "Local Area Unemployment Statistics annual average unemployment rate by state",
                        "Annual current-dollar GDP by state",
                        "Annual state population estimates",
                    ],
                    "source_metadata": {
                        "year": year,
                        "state_fips": spec["state_fips"],
                        "bls_series_id": spec["series_id"],
                    },
                }
            )

    return rows


async def fetch_state_indicator_snapshots(
    client: httpx.AsyncClient,
    years: list[int],
    bea_api_key: str,
    census_vintage: int,
    census_api_key: str | None = None,
) -> list[dict]:
    unemployment_by_year = await fetch_state_unemployment_annual_averages(client, years)
    population_by_year = await fetch_state_population_estimates(
        client,
        years,
        census_vintage,
        census_api_key=census_api_key,
    )
    gdp_by_year = await fetch_state_gdp_snapshots(client, years, bea_api_key)
    return build_state_indicator_snapshot_rows(
        unemployment_by_year,
        population_by_year,
        gdp_by_year,
    )
