const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  getKpiSummary: () => fetchApi<KpiSummaryResponse>("/api/v1/kpi/summary"),
  getGdpComponents: () => fetchApi<GdpComponentsResponse>("/api/v1/gdp/components"),
  getGdpQuarterly: () => fetchApi<GdpQuarterlyResponse>("/api/v1/gdp/quarterly"),
  getCpiCalendar: () => fetchApi<CpiCalendarResponse>("/api/v1/cpi/calendar"),
  getCpiCategories: () => fetchApi<CpiCategoriesResponse>("/api/v1/cpi/categories"),
  getLaborFunnel: () => fetchApi<LaborFunnelResponse>("/api/v1/labor/funnel"),
  getLaborRanking: () => fetchApi<LaborRankingResponse>("/api/v1/labor/ranking"),
  getStatesComparison: () => fetchApi<StatesComparisonResponse>("/api/v1/states/comparison"),
  getRatesHistory: () => fetchApi<RatesHistoryResponse>("/api/v1/rates/history"),
  getSectorsGdp: () => fetchApi<SectorsGdpResponse>("/api/v1/sectors/gdp"),
  getSentimentRadial: () => fetchApi<SentimentRadialResponse>("/api/v1/sentiment/radial"),
  getOverview: () => fetchApi<OverviewResponse>("/api/v1/overview"),
};

// Re-export types for convenience
import type {
  KpiSummaryResponse,
  GdpComponentsResponse,
  GdpQuarterlyResponse,
  CpiCalendarResponse,
  CpiCategoriesResponse,
  LaborFunnelResponse,
  LaborRankingResponse,
  StatesComparisonResponse,
  RatesHistoryResponse,
  SectorsGdpResponse,
  SentimentRadialResponse,
  OverviewResponse,
} from "./types";
