"""Helpers for BLS-backed state unemployment rankings."""

from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timezone
from typing import Any, Iterable, Mapping

import httpx

from app.services.provenance import build_provenance

BLS_TIMESERIES_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

STATE_UNEMPLOYMENT_SERIES = [
    {"state": "California", "series_id": "LASST060000000000003", "display_order": 17},
    {"state": "New York", "series_id": "LASST360000000000003", "display_order": 18},
    {"state": "Texas", "series_id": "LASST480000000000003", "display_order": 19},
    {"state": "Florida", "series_id": "LASST120000000000003", "display_order": 20},
    {"state": "Illinois", "series_id": "LASST170000000000003", "display_order": 21},
    {"state": "Pennsylvania", "series_id": "LASST420000000000003", "display_order": 22},
    {"state": "Ohio", "series_id": "LASST390000000000003", "display_order": 23},
    {"state": "Colorado", "series_id": "LASST080000000000003", "display_order": 24},
    {"state": "Nevada", "series_id": "LASST320000000000003", "display_order": 25},
    {"state": "Michigan", "series_id": "LASST260000000000003", "display_order": 26},
]

STATE_UNEMPLOYMENT_STATES = [item["state"] for item in STATE_UNEMPLOYMENT_SERIES]
STATE_TO_SERIES_ID = {item["state"]: item["series_id"] for item in STATE_UNEMPLOYMENT_SERIES}
SERIES_ID_TO_STATE = {item["series_id"]: item["state"] for item in STATE_UNEMPLOYMENT_SERIES}
STATE_UNEMPLOYMENT_SERIES_IDS = [item["series_id"] for item in STATE_UNEMPLOYMENT_SERIES]


def get_bls_year_range(observation_start: str | None = None) -> tuple[str, str]:
    current_year = datetime.now(timezone.utc).year
    start_year = date.fromisoformat(observation_start).year if observation_start else current_year - 2
    return str(start_year), str(current_year)


def _coerce_date(value: Any) -> date | None:
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        return date.fromisoformat(value)
    return None


def _read_field(row: Mapping[str, Any], key: str) -> Any:
    try:
        return row[key]
    except (KeyError, TypeError):
        return None


def parse_bls_series_payload(payload: Mapping[str, Any]) -> dict[str, list[dict[str, str]]]:
    if payload.get("status") != "REQUEST_SUCCEEDED":
        raise ValueError("BLS API request failed")

    parsed: dict[str, list[dict[str, str]]] = {}
    for series in payload.get("Results", {}).get("series", []):
        series_id = series.get("seriesID")
        if not series_id:
            continue

        observations: list[dict[str, str]] = []
        for item in series.get("data", []):
            period = item.get("period", "")
            value = item.get("value")
            if not period.startswith("M") or period == "M13":
                continue
            if value in (None, "", ".", "-"):
                continue

            obs_date = date(int(item["year"]), int(period[1:]), 1)
            observations.append({"date": obs_date.isoformat(), "value": str(value)})

        observations.sort(key=lambda item: item["date"])
        parsed[series_id] = observations

    return parsed


async def fetch_bls_series(
    client: httpx.AsyncClient,
    series_ids: list[str],
    start_year: str,
    end_year: str,
) -> dict[str, list[dict[str, str]]]:
    if not series_ids:
        return {}

    response = await client.post(
        BLS_TIMESERIES_URL,
        json={
            "seriesid": series_ids,
            "startyear": start_year,
            "endyear": end_year,
        },
    )
    response.raise_for_status()
    return parse_bls_series_payload(response.json())


def build_labor_ranking_response(
    observations: Iterable[Mapping[str, Any]],
) -> dict[str, Any]:
    values_by_date: dict[date, dict[str, float]] = defaultdict(dict)

    for row in observations:
        series_id = _read_field(row, "series_id")
        state = SERIES_ID_TO_STATE.get(str(series_id)) if series_id is not None else None
        obs_date = _coerce_date(_read_field(row, "date"))
        value = _read_field(row, "value")

        if state is None or obs_date is None or value is None:
            continue

        values_by_date[obs_date][state] = float(value)

    complete_dates = sorted(
        obs_date
        for obs_date, state_values in values_by_date.items()
        if len(state_values) == len(STATE_UNEMPLOYMENT_SERIES)
    )[-12:]

    series_data = {state: [] for state in STATE_UNEMPLOYMENT_STATES}
    for obs_date in complete_dates:
        ranked_states = sorted(
            values_by_date[obs_date].items(),
            key=lambda item: (-item[1], item[0]),
        )
        for rank, (state, _) in enumerate(ranked_states, start=1):
            series_data[state].append({"x": obs_date.isoformat(), "y": rank})

    data = [
        {"id": state, "data": series_data[state]}
        for state in STATE_UNEMPLOYMENT_STATES
        if series_data[state]
    ]
    latest_date = complete_dates[-1] if complete_dates else None
    provenance = build_provenance(
        source_name="BLS",
        methodology_type="source_backed",
        latest_date=latest_date,
        period_kind="month",
        source_dataset="BLS State Unemployment Rates",
        source_series_ids=STATE_UNEMPLOYMENT_SERIES_IDS,
    )

    return {
        "data": data,
        "states": STATE_UNEMPLOYMENT_STATES,
        **provenance.model_dump(),
    }
