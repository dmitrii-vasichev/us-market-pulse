"""Shared helpers for BEA API access."""

from __future__ import annotations

from typing import Any

import httpx

BEA_API_URL = "https://apps.bea.gov/api/data"


def _normalize_list(value: Any) -> list[dict[str, Any]]:
    if value is None:
        return []
    if isinstance(value, list):
        return [item for item in value if isinstance(item, dict)]
    if isinstance(value, dict):
        return [value]
    return []


def _extract_results(payload: dict[str, Any]) -> dict[str, Any]:
    results = payload.get("BEAAPI", {}).get("Results", {})
    error = results.get("Error")
    if isinstance(error, dict):
        raise ValueError(error.get("APIErrorDescription", "BEA API request failed"))
    if isinstance(error, list) and error:
        first = error[0]
        if isinstance(first, dict):
            raise ValueError(first.get("APIErrorDescription", "BEA API request failed"))
    return results if isinstance(results, dict) else {}


async def fetch_bea_parameter_values(
    client: httpx.AsyncClient,
    api_key: str,
    dataset_name: str,
    parameter_name: str | None = None,
    target_parameter: str | None = None,
    **filters: str,
) -> list[dict[str, Any]]:
    method = "GetParameterValuesFiltered" if target_parameter else "GetParameterValues"
    params: dict[str, str] = {
        "UserID": api_key,
        "method": method,
        "datasetname": dataset_name,
        "ResultFormat": "json",
    }
    if parameter_name:
        params["ParameterName"] = parameter_name
    if target_parameter:
        params["TargetParameter"] = target_parameter
    params.update(filters)

    response = await client.get(BEA_API_URL, params=params)
    response.raise_for_status()
    results = _extract_results(response.json())
    return _normalize_list(results.get("ParamValue"))


async def fetch_bea_data(
    client: httpx.AsyncClient,
    api_key: str,
    dataset_name: str,
    **params: str,
) -> list[dict[str, Any]]:
    request_params = {
        "UserID": api_key,
        "method": "GetData",
        "datasetname": dataset_name,
        "ResultFormat": "json",
        **params,
    }
    response = await client.get(BEA_API_URL, params=request_params)
    response.raise_for_status()
    results = _extract_results(response.json())
    return _normalize_list(results.get("Data"))


def parse_bea_numeric_value(raw_value: Any) -> float | None:
    if raw_value in (None, "", "(NA)", "(D)", "(L)", "NA"):
        return None
    cleaned = str(raw_value).replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None
