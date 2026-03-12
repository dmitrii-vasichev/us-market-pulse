"""Shared methodology and policy definitions for derived dashboard charts."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from app.models.schemas import KpiTargetPolicy, MethodologyInputKind, MethodologyType

LaborFunnelValueTransform = Literal["identity", "thousands_to_millions"]


@dataclass(frozen=True)
class MethodologyInputDefinition:
    key: str
    label: str
    source: str
    dataset: str
    series_id: str | None = None
    unit: str | None = None
    kind: MethodologyInputKind = "stored_series"
    role: str | None = None


@dataclass(frozen=True)
class ChartMethodologyDefinition:
    key: str
    methodology_type: MethodologyType
    methodology_note: str | None
    fallback_source_name: str
    fallback_dataset: str
    source_series_ids: tuple[str, ...]
    inputs: tuple[MethodologyInputDefinition, ...]


@dataclass(frozen=True)
class LaborFunnelStageDefinition:
    id: str
    label: str
    input_key: str
    source_series_id: str
    unit: str
    description: str
    value_transform: LaborFunnelValueTransform = "identity"


@dataclass(frozen=True)
class GdpWaterfallComponentDefinition:
    id: str
    label: str
    series_id: str
    input_key: str


@dataclass(frozen=True)
class SeriesMetadataDefinition:
    series_id: str
    title: str
    units: str
    frequency: str
    seasonal_adjustment: str
    source: str
    category: str
    display_order: int


GDP_WATERFALL_COMPONENTS: tuple[GdpWaterfallComponentDefinition, ...] = (
    GdpWaterfallComponentDefinition(
        "consumer",
        "Consumer Spending",
        "DPCERY2Q224SBEA",
        "consumer_spending_contribution",
    ),
    GdpWaterfallComponentDefinition(
        "business",
        "Business Investment",
        "A007RY2Q224SBEA",
        "business_investment_contribution",
    ),
    GdpWaterfallComponentDefinition(
        "government",
        "Government",
        "A822RY2Q224SBEA",
        "government_contribution",
    ),
    GdpWaterfallComponentDefinition(
        "net_exports",
        "Net Exports",
        "A019RY2Q224SBEA",
        "net_exports_contribution",
    ),
    GdpWaterfallComponentDefinition(
        "inventory",
        "Inventory Change",
        "A014RY2Q224SBEA",
        "inventory_contribution",
    ),
)

LABOR_FUNNEL_STAGE_DEFINITIONS: tuple[LaborFunnelStageDefinition, ...] = (
    LaborFunnelStageDefinition(
        id="gross_domestic_product",
        label="Gross Domestic Product",
        input_key="gross_domestic_product",
        source_series_id="GDP",
        unit="billions_usd",
        description="Latest stored quarterly GDP level used as the top-of-funnel output stage.",
    ),
    LaborFunnelStageDefinition(
        id="gross_national_income",
        label="Gross National Income",
        input_key="gross_national_income",
        source_series_id="A023RC1Q027SBEA",
        unit="billions_usd",
        description="Latest stored quarterly GNI level aligned to the same quarter as GDP.",
    ),
    LaborFunnelStageDefinition(
        id="employee_compensation",
        label="Employee Compensation",
        input_key="employee_compensation",
        source_series_id="COE",
        unit="billions_usd",
        description="Quarterly compensation of employees taken from the same aligned income quarter.",
    ),
    LaborFunnelStageDefinition(
        id="nonfarm_payroll_employment",
        label="Nonfarm Payroll Employment",
        input_key="nonfarm_payroll_employment",
        source_series_id="PAYEMS",
        unit="millions_persons",
        description=(
            "Latest stored payroll employment month within the aligned quarter, normalized from "
            "thousands to millions of persons."
        ),
        value_transform="thousands_to_millions",
    ),
)


PHASE_3_GDP_WATERFALL_SERIES: tuple[SeriesMetadataDefinition, ...] = (
    SeriesMetadataDefinition(
        series_id="DPCERY2Q224SBEA",
        title="Contributions to percent change in real gross domestic product: Personal consumption expenditures",
        units="Percentage Points at Annual Rate",
        frequency="Quarterly",
        seasonal_adjustment="Seasonally Adjusted Annual Rate",
        source="FRED",
        category="gdp",
        display_order=27,
    ),
    SeriesMetadataDefinition(
        series_id="A007RY2Q224SBEA",
        title="Contributions to percent change in real gross domestic product: Gross private domestic investment: Fixed investment",
        units="Percentage Points at Annual Rate",
        frequency="Quarterly",
        seasonal_adjustment="Seasonally Adjusted Annual Rate",
        source="FRED",
        category="gdp",
        display_order=28,
    ),
    SeriesMetadataDefinition(
        series_id="A822RY2Q224SBEA",
        title="Contributions to percent change in real gross domestic product: Government consumption expenditures and gross investment",
        units="Percentage Points at Annual Rate",
        frequency="Quarterly",
        seasonal_adjustment="Seasonally Adjusted Annual Rate",
        source="FRED",
        category="gdp",
        display_order=29,
    ),
    SeriesMetadataDefinition(
        series_id="A019RY2Q224SBEA",
        title="Contributions to percent change in real gross domestic product: Net exports of goods and services",
        units="Percentage Points at Annual Rate",
        frequency="Quarterly",
        seasonal_adjustment="Seasonally Adjusted Annual Rate",
        source="FRED",
        category="gdp",
        display_order=30,
    ),
    SeriesMetadataDefinition(
        series_id="A014RY2Q224SBEA",
        title="Contributions to percent change in real gross domestic product: Gross private domestic investment: Change in private inventories",
        units="Percentage Points at Annual Rate",
        frequency="Quarterly",
        seasonal_adjustment="Seasonally Adjusted Annual Rate",
        source="FRED",
        category="gdp",
        display_order=31,
    ),
)

PHASE_3_LABOR_FUNNEL_SERIES: tuple[SeriesMetadataDefinition, ...] = (
    SeriesMetadataDefinition(
        series_id="A023RC1Q027SBEA",
        title="Gross National Income",
        units="Billions of Dollars",
        frequency="Quarterly",
        seasonal_adjustment="Seasonally Adjusted Annual Rate",
        source="FRED",
        category="gdp",
        display_order=32,
    ),
    SeriesMetadataDefinition(
        series_id="COE",
        title="National Income: Compensation of Employees, Paid",
        units="Billions of Dollars",
        frequency="Quarterly",
        seasonal_adjustment="Seasonally Adjusted Annual Rate",
        source="FRED",
        category="labor",
        display_order=33,
    ),
)

PHASE_3_APPROVED_SERIES: tuple[SeriesMetadataDefinition, ...] = (
    *PHASE_3_GDP_WATERFALL_SERIES,
    *PHASE_3_LABOR_FUNNEL_SERIES,
)

PHASE_3_APPROVED_SERIES_IDS: tuple[str, ...] = tuple(
    series.series_id for series in PHASE_3_APPROVED_SERIES
)
GDP_WATERFALL_TARGET_SERIES_IDS: tuple[str, ...] = tuple(
    component.series_id for component in GDP_WATERFALL_COMPONENTS
)
LABOR_FUNNEL_TARGET_SERIES_IDS: tuple[str, ...] = (
    "GDP",
    "A023RC1Q027SBEA",
    "COE",
    "PAYEMS",
)


def _build_target_policy(target: float, max_value: float) -> KpiTargetPolicy:
    return KpiTargetPolicy(
        target=target,
        max=max_value,
        ranges=[0.0, round(max_value * 0.5, 2), round(max_value * 0.75, 2), max_value],
    )


KPI_TARGET_POLICIES: dict[str, KpiTargetPolicy] = {
    "gdp": _build_target_policy(3.0, 5.0),
    "cpi": _build_target_policy(2.0, 10.0),
    "unemployment": _build_target_policy(4.0, 10.0),
    "fed_rate": _build_target_policy(3.0, 6.0),
}


GDP_WATERFALL_SOURCE_BACKED_METHODOLOGY = ChartMethodologyDefinition(
    key="gdp_waterfall_component_series",
    methodology_type="source_backed",
    methodology_note=None,
    fallback_source_name="BEA Contributions to Real GDP Growth",
    fallback_dataset="NIPA Table 1.1.2 Contributions to Percent Change in Real Gross Domestic Product",
    source_series_ids=GDP_WATERFALL_TARGET_SERIES_IDS,
    inputs=tuple(
        MethodologyInputDefinition(
            key=component.input_key,
            label=component.label,
            source="FRED",
            dataset=next(
                series.title
                for series in PHASE_3_GDP_WATERFALL_SERIES
                if series.series_id == component.series_id
            ),
            series_id=component.series_id,
            role="component_contribution",
        )
        for component in GDP_WATERFALL_COMPONENTS
    ),
)

LABOR_FUNNEL_DOCUMENTED_METHODOLOGY = ChartMethodologyDefinition(
    key="labor_funnel_multi_input_alignment",
    methodology_type="derived",
    methodology_note=(
        "Funnel stages are built from stored GDP, gross national income, compensation of "
        "employees, and payroll inputs. GDP, GNI, and compensation use the latest quarter with "
        "all BEA series present, while payroll employment uses the latest PAYEMS month inside "
        "that same quarter and is converted from thousands to millions of persons for the final "
        "stage."
    ),
    fallback_source_name="BEA, BLS",
    fallback_dataset=(
        "Gross Domestic Product; Gross National Income; Compensation of employees; "
        "All Employees, Total Nonfarm"
    ),
    source_series_ids=LABOR_FUNNEL_TARGET_SERIES_IDS,
    inputs=(
        MethodologyInputDefinition(
            key="gross_domestic_product",
            label="Gross Domestic Product",
            source="BEA via FRED",
            dataset="Gross Domestic Product",
            series_id="GDP",
            unit="Billions of Dollars",
            role="stage_input",
        ),
        MethodologyInputDefinition(
            key="gross_national_income",
            label="Gross National Income",
            source="BEA via FRED",
            dataset="Gross National Income",
            series_id="A023RC1Q027SBEA",
            unit="Billions of Dollars",
            role="stage_input",
        ),
        MethodologyInputDefinition(
            key="employee_compensation",
            label="Compensation of Employees",
            source="BEA via FRED",
            dataset="National Income: Compensation of Employees, Paid",
            series_id="COE",
            unit="Billions of Dollars",
            role="stage_input",
        ),
        MethodologyInputDefinition(
            key="nonfarm_payroll_employment",
            label="Nonfarm Payroll Employment",
            source="BLS via FRED",
            dataset="All Employees, Total Nonfarm",
            series_id="PAYEMS",
            unit="Thousands of Persons",
            role="stage_input",
        ),
        MethodologyInputDefinition(
            key="aligned_stage_mapping_policy",
            label="Quarterly stage alignment policy",
            source="Backend policy",
            dataset="Align quarterly GDP, GNI, and compensation inputs, then map the latest PAYEMS month in that quarter to a workforce stage after unit normalization",
            kind="derived_policy",
            role="stage_alignment",
        ),
    ),
)

KPI_SUMMARY_CURRENT_METHODOLOGY = ChartMethodologyDefinition(
    key="kpi_summary_current_threshold_policy",
    methodology_type="derived",
    methodology_note=(
        "KPI summary values are computed from stored GDP, CPIAUCSL, UNRATE, and FEDFUNDS "
        "observations, and downstream bullet targets compare those measures against backend-owned "
        "threshold bands."
    ),
    fallback_source_name="FRED",
    fallback_dataset="Dashboard KPI Summary",
    source_series_ids=("GDP", "CPIAUCSL", "UNRATE", "FEDFUNDS"),
    inputs=(
        MethodologyInputDefinition(
            key="gross_domestic_product",
            label="Gross Domestic Product",
            source="FRED",
            dataset="Gross Domestic Product",
            series_id="GDP",
            role="kpi_input",
        ),
        MethodologyInputDefinition(
            key="consumer_price_index",
            label="Consumer Price Index",
            source="FRED",
            dataset="Consumer Price Index for All Urban Consumers",
            series_id="CPIAUCSL",
            role="kpi_input",
        ),
        MethodologyInputDefinition(
            key="unemployment_rate",
            label="Unemployment Rate",
            source="FRED",
            dataset="Unemployment Rate",
            series_id="UNRATE",
            role="kpi_input",
        ),
        MethodologyInputDefinition(
            key="fed_funds_rate",
            label="Federal Funds Rate",
            source="FRED",
            dataset="Federal Funds Effective Rate",
            series_id="FEDFUNDS",
            role="kpi_input",
        ),
        MethodologyInputDefinition(
            key="bullet_target_policy",
            label="Backend KPI target policy",
            source="Backend policy",
            dataset="Bullet target bands and marker thresholds",
            kind="derived_policy",
            role="target_policy",
        ),
    ),
)
