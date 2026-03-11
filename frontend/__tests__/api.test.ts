import { api, ApiError } from "@/lib/api";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe("API client", () => {
  it("fetches KPI summary", async () => {
    const mockData = { kpis: [{ key: "gdp", label: "GDP" }] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await api.getKpiSummary();
    expect(result.kpis).toHaveLength(1);
    expect(result.kpis[0].key).toBe("gdp");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/kpi/summary"),
      expect.any(Object),
    );
  });

  it("throws ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(api.getKpiSummary()).rejects.toThrow(ApiError);
  });

  it("fetches GDP quarterly data", async () => {
    const mockData = { data: [{ quarter: "2026-01-01", value: 2.5 }] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await api.getGdpQuarterly();
    expect(result.data).toHaveLength(1);
  });
});
