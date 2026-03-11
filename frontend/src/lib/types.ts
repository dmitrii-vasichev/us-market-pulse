// KPI
export interface SparklinePoint {
  date: string;
  value: number;
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
}

export interface KpiSummaryResponse {
  kpis: KpiItem[];
}

// GDP
export interface GdpComponent {
  id: string;
  label: string;
  value: number;
}

export interface GdpComponentsResponse {
  quarter: string;
  total_growth: number;
  components: GdpComponent[];
}

export interface GdpQuarterlyItem {
  quarter: string;
  value: number;
}

export interface GdpQuarterlyResponse {
  data: GdpQuarterlyItem[];
}

// CPI
export interface CpiCalendarItem {
  day: string;
  value: number;
}

export interface CpiCalendarResponse {
  data: CpiCalendarItem[];
}

export interface CpiCategory {
  id: string;
  label: string;
  value: number;
}

export interface CpiCategoriesResponse {
  categories: CpiCategory[];
  total: number;
}

// Labor
export interface FunnelStage {
  id: string;
  label: string;
  value: number;
}

export interface LaborFunnelResponse {
  stages: FunnelStage[];
}

export interface LaborRankingSeries {
  id: string;
  data: { x: string; y: number }[];
}

export interface LaborRankingResponse {
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

export interface StatesComparisonResponse {
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

export interface RatesHistoryResponse {
  series: RateSeries[];
}

// Sectors
export interface TreeNode {
  name: string;
  value?: number;
  children?: TreeNode[];
}

export interface SectorsGdpResponse {
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

export interface SentimentRadialResponse {
  data: SentimentSeries[];
  current: number | null;
}

// Overview (combined)
export interface OverviewResponse {
  kpis: KpiItem[];
}
