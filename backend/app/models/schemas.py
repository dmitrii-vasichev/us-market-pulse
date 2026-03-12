"""Pydantic response models for the API."""

from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel


MethodologyType = Literal["source_backed", "derived", "illustrative"]
FreshnessStatus = Literal["current", "stale", "unknown"]


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


class ProvenancePayload(BaseModel):
    source: str
    methodology_type: MethodologyType
    latest_observation_date: str | None = None
    latest_month: str | None = None
    methodology_note: str | None = None
    source_dataset: str | None = None
    source_series_ids: list[str] | None = None
    freshness_status: FreshnessStatus | None = None


class KpiSummaryResponse(ProvenancePayload):
    kpis: list[KpiItem]
    updated_at: str | None = None


class SeriesPoint(BaseModel):
    date: str
    value: float


class SeriesResponse(ProvenancePayload):
    series_id: str
    title: str
    units: str | None = None
    data: list[SeriesPoint]


class MultiSeriesResponse(BaseModel):
    series: list[SeriesResponse]


class GdpQuarterlyItem(BaseModel):
    quarter: str
    value: float


class GdpQuarterlyResponse(ProvenancePayload):
    data: list[GdpQuarterlyItem]


class CpiCalendarItem(BaseModel):
    day: str
    value: float


class CpiCalendarResponse(ProvenancePayload):
    data: list[CpiCalendarItem]
    from_date: str | None = None
    to_date: str | None = None


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


class RatePoint(BaseModel):
    x: str
    y: float


class RateSeries(BaseModel):
    id: str
    curve: str
    data: list[RatePoint]


class RatesHistoryResponse(ProvenancePayload):
    series: list[RateSeries]


class SentimentDataPoint(BaseModel):
    x: str
    y: float


class SentimentSeries(BaseModel):
    id: str
    data: list[SentimentDataPoint]


class SentimentRadialResponse(ProvenancePayload):
    data: list[SentimentSeries]
    max_value: float
    current: float | None = None


class LaborRankingPoint(BaseModel):
    x: str
    y: int


class LaborRankingSeries(BaseModel):
    id: str
    data: list[LaborRankingPoint]


class LaborRankingResponse(ProvenancePayload):
    data: list[LaborRankingSeries]
    states: list[str]


class OverviewResponse(ProvenancePayload):
    kpis: list[KpiItem]
    updated_at: str | None = None
