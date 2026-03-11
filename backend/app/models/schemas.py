"""Pydantic response models for the API."""

from datetime import date, datetime
from pydantic import BaseModel


class SparklinePoint(BaseModel):
    date: str
    value: float


class KpiItem(BaseModel):
    key: str
    label: str
    current_value: float
    previous_value: float
    change_absolute: float
    change_percent: float
    period_label: str
    positive_is_good: bool
    format: str
    sparkline: list[SparklinePoint]


class KpiSummaryResponse(BaseModel):
    kpis: list[KpiItem]
    updated_at: str | None = None


class SeriesPoint(BaseModel):
    date: str
    value: float


class SeriesResponse(BaseModel):
    series_id: str
    title: str
    units: str | None = None
    data: list[SeriesPoint]


class MultiSeriesResponse(BaseModel):
    series: list[SeriesResponse]


class SeriesMetadataItem(BaseModel):
    series_id: str
    title: str
    units: str | None = None
    frequency: str | None = None
    category: str
    last_updated: str | None = None


class MetaSeriesResponse(BaseModel):
    series: list[SeriesMetadataItem]
    count: int


class LastUpdateResponse(BaseModel):
    last_collection: str | None = None
    status: str | None = None
    series_collected: int | None = None
    records_inserted: int | None = None
