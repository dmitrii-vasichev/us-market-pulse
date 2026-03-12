export type MethodologyType = "source_backed" | "derived" | "illustrative";
export type FreshnessStatus = "current" | "stale" | "unknown";

export interface ProvenanceFields {
  source: string;
  methodology_type: MethodologyType;
  latest_observation_date?: string | null;
  latest_month?: string | null;
  methodology_note?: string | null;
  source_dataset?: string | null;
  source_series_ids?: string[] | null;
  freshness_status?: FreshnessStatus | null;
}

// KPI
export interface SparklinePoint {
  date: string;
  value: number;
}

export type KpiTargetMeasureField = "current_value" | "change_percent";

export interface KpiTargetPolicy {
  target: number;
  max: number;
  ranges: number[];
  markers: number[];
  measure: number;
  measure_field: KpiTargetMeasureField;
  measure_label: string;
  policy_note?: string | null;
}

export interface KpiItem {
  key: string;
  label: string;
  current_value: number;
  previous_value: number;
  change_absolute: number;
  change_percent: number;
  period_label: string;
  positive_is_good: boolean;
  format: string;
  sparkline: SparklinePoint[];
  target_policy?: KpiTargetPolicy | null;
}

export interface KpiSummaryResponse extends ProvenanceFields {
  kpis: KpiItem[];
  updated_at?: string | null;
}

// GDP
export interface GdpComponent {
  id: string;
  label: string;
  value: number;
}

export interface GdpComponentsResponse extends ProvenanceFields {
  quarter: string | null;
  total_growth: number;
  components: GdpComponent[];
}

export interface GdpQuarterlyItem {
  quarter: string;
  value: number;
}

export interface GdpQuarterlyResponse extends ProvenanceFields {
  data: GdpQuarterlyItem[];
}

// CPI
export interface CpiCalendarItem {
  day: string;
  value: number;
}

export interface CpiCalendarResponse extends ProvenanceFields {
  data: CpiCalendarItem[];
  from_date?: string | null;
  to_date?: string | null;
}

export interface CpiCategory {
  id: string;
  label: string;
  value: number;
}

export interface CpiCategoriesResponse extends ProvenanceFields {
  categories: CpiCategory[];
  total: number;
}

// Labor
export interface FunnelStage {
  id: string;
  label: string;
  value: number;
  unit?: string | null;
  source_input_key?: string | null;
}

export interface LaborFunnelResponse extends ProvenanceFields {
  stages: FunnelStage[];
}

export interface LaborRankingSeries {
  id: string;
  data: { x: string; y: number }[];
}

export interface LaborRankingResponse extends ProvenanceFields {
  data: LaborRankingSeries[];
  states: string[];
}

// States
export interface StatePoint {
  x: number;
  y: number;
  size: number;
  label: string;
  highlighted: boolean;
}

export interface StatesGroup {
  id: string;
  data: StatePoint[];
}

export interface StatesComparisonResponse extends ProvenanceFields {
  data: StatesGroup[];
}

// Rates
export interface RatePoint {
  x: string;
  y: number;
}

export interface RateSeries {
  id: string;
  curve: string;
  data: RatePoint[];
}

export interface RatesHistoryResponse extends ProvenanceFields {
  series: RateSeries[];
}

// Sectors
export interface TreeNode {
  name: string;
  value?: number;
  children?: TreeNode[];
}

export interface SectorsGdpResponse extends ProvenanceFields {
  tree: TreeNode;
}

// Sentiment
export interface SentimentDataPoint {
  x: string;
  y: number;
}

export interface SentimentSeries {
  id: string;
  data: SentimentDataPoint[];
}

export interface SentimentRadialResponse extends ProvenanceFields {
  data: SentimentSeries[];
  max_value: number;
  current: number | null;
}

// Series (generic)
export interface SeriesDataResponse extends ProvenanceFields {
  series_id: string;
  title: string;
  units: string | null;
  data: { date: string; value: number }[];
}

// Overview (combined)
export interface OverviewResponse extends ProvenanceFields {
  kpis: KpiItem[];
  updated_at?: string | null;
}
