import { render, screen, waitFor, act } from "@testing-library/react";

const mockResponsiveCalendar = jest.fn(() => <div data-testid="nivo-calendar" />);
const mockResponsiveBullet = jest.fn(() => <div data-testid="nivo-bullet" />);

// Mock all Nivo chart components
jest.mock("@nivo/bump", () => ({
  ResponsiveBump: () => <div data-testid="nivo-bump" />,
}));
jest.mock("@nivo/heatmap", () => ({
  ResponsiveHeatMap: () => <div data-testid="nivo-heatmap" />,
}));
jest.mock("@nivo/scatterplot", () => ({
  ResponsiveScatterPlot: () => <div data-testid="nivo-scatter" />,
}));
jest.mock("@nivo/line", () => ({
  ResponsiveLine: () => <div data-testid="nivo-line" />,
}));
jest.mock("@nivo/treemap", () => ({
  ResponsiveTreeMap: () => <div data-testid="nivo-treemap" />,
}));
jest.mock("@nivo/radar", () => ({
  ResponsiveRadar: () => <div data-testid="nivo-radar" />,
}));
jest.mock("@nivo/bar", () => ({
  ResponsiveBar: () => <div data-testid="nivo-bar" />,
}));
jest.mock("@nivo/calendar", () => ({
  ResponsiveCalendar: (props: unknown) => mockResponsiveCalendar(props),
}));
jest.mock("@nivo/funnel", () => ({
  ResponsiveFunnel: () => <div data-testid="nivo-funnel" />,
}));
jest.mock("@nivo/bullet", () => ({
  ResponsiveBullet: (props: unknown) => mockResponsiveBullet(props),
}));
jest.mock("@nivo/waffle", () => ({
  ResponsiveWaffle: () => <div data-testid="nivo-waffle" />,
}));

const mockApi = {
  getKpiSummary: jest.fn(),
  getLaborFunnel: jest.fn(),
  getLaborRanking: jest.fn(),
  getCpiCategories: jest.fn(),
  getCpiCalendar: jest.fn(),
  getGdpQuarterly: jest.fn(),
  getStatesComparison: jest.fn(),
  getRatesHistory: jest.fn(),
  getSectorsGdp: jest.fn(),
  getSentimentRadial: jest.fn(),
  getSeriesData: jest.fn(),
};

jest.mock("@/lib/api", () => ({ api: mockApi }));

jest.mock("@/lib/nivo-theme", () => ({
  nivoTheme: {},
  chartColors: {
    blue: "#3B82F6",
    red: "#EF4444",
    green: "#10B981",
    purple: "#8B5CF6",
    amber: "#F59E0B",
  },
  colorScheme: ["#3B82F6"],
}));

import UnemploymentBump from "@/components/charts/UnemploymentBump";
import CpiCalendar from "@/components/charts/CpiCalendar";
import CpiHeatmap from "@/components/charts/CpiHeatmap";
import GdpQuarterly from "@/components/charts/GdpQuarterly";
import StateScatter from "@/components/charts/StateScatter";
import RatesLine from "@/components/charts/RatesLine";
import SectorTreemap from "@/components/charts/SectorTreemap";
import SentimentRadial from "@/components/charts/SentimentRadial";
import Sp500Area from "@/components/charts/Sp500Area";
import GdpWaffle from "@/components/charts/GdpWaffle";
import EconomicFunnel from "@/components/charts/EconomicFunnel";
import BulletTargets from "@/components/charts/BulletTargets";

beforeEach(() => jest.clearAllMocks());

describe("UnemploymentBump", () => {
  it("renders chart after data loads", async () => {
    mockApi.getLaborRanking.mockResolvedValue({
      source: "Source: BLS · Dec 2025",
      methodology_type: "source_backed",
      data: [{ id: "Colorado", data: [{ x: "Jan", y: 1 }] }],
    });
    await act(async () => {
      render(<UnemploymentBump />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("nivo-bump")).toBeTruthy();
    });
    expect(screen.getByText("Source: BLS · Dec 2025")).toBeInTheDocument();
    expect(screen.getByText("Source-backed")).toBeInTheDocument();
  });

  it("shows error state on failure", async () => {
    mockApi.getLaborRanking.mockRejectedValue(new Error("fail"));
    await act(async () => {
      render(<UnemploymentBump />);
    });
    await waitFor(() => {
      expect(screen.getByText("Failed to load data")).toBeTruthy();
    });
  });
});

describe("CpiHeatmap", () => {
  it("renders chart after data loads", async () => {
    mockApi.getCpiCategories.mockResolvedValue({
      categories: [{ label: "Food", value: 13.4 }],
    });
    await act(async () => {
      render(<CpiHeatmap />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("nivo-heatmap")).toBeTruthy();
    });
  });

  it("renders payload-driven provenance when the endpoint is source-backed", async () => {
    mockApi.getCpiCategories.mockResolvedValue({
      source: "Source: BLS CPI Relative Importance · Dec 2025",
      methodology_type: "source_backed",
      categories: [{ label: "Housing", value: 34.9 }],
    });

    await act(async () => {
      render(<CpiHeatmap />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("nivo-heatmap")).toBeInTheDocument();
    });

    expect(screen.getByText("Source: BLS CPI Relative Importance · Dec 2025")).toBeInTheDocument();
    expect(screen.getByText("Source-backed")).toBeInTheDocument();
  });
});

describe("CpiCalendar", () => {
  it("renders without clipping chart overflow and provides contextual tooltip content", async () => {
    mockApi.getCpiCalendar.mockResolvedValue({
      source: "Source: FRED · Jan 2026",
      methodology_type: "source_backed",
      data: [
        { day: "2024-01-01", value: 3.4 },
        { day: "2025-02-01", value: 3.1 },
        { day: "2026-01-01", value: 2.9 },
      ],
    });

    await act(async () => {
      render(<CpiCalendar />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("nivo-calendar")).toBeTruthy();
    });

    expect(screen.getByTestId("chart-card-scroll-container")).toHaveClass("overflow-visible");
    expect(screen.getByText("Source: FRED · Jan 2026")).toBeInTheDocument();
    expect(screen.getByText("Source-backed")).toBeInTheDocument();

    const calendarProps = mockResponsiveCalendar.mock.calls[0]?.[0] as {
      tooltip: (props: { day: string; value: string; color: string }) => React.JSX.Element | null;
    };

    render(calendarProps.tooltip({ day: "2026-01-01", value: "2.9", color: "#F97066" }));

    expect(screen.getByText("January 2026 observation")).toBeTruthy();
    expect(screen.getByText("Annual CPI change")).toBeTruthy();
    expect(screen.getByText("2.90%")).toBeTruthy();
    expect(screen.getByText("YoY CPI-U, all items, versus January 2025.")).toBeTruthy();
  });
});

describe("EconomicFunnel", () => {
  it("renders derived provenance metadata alongside the chart", async () => {
    mockApi.getLaborFunnel.mockResolvedValue({
      source: "Source: BEA, BLS · Q4 2025",
      methodology_type: "derived",
      methodology_inputs: [
        { key: "gross_domestic_product", label: "Gross Domestic Product", source: "BEA via FRED", unit: "Billions of Dollars" },
        { key: "gross_national_income", label: "Gross National Income", source: "BEA via FRED", unit: "Billions of Dollars" },
        { key: "employee_compensation", label: "Compensation of Employees", source: "BEA via FRED", unit: "Billions of Dollars" },
        { key: "nonfarm_payroll_employment", label: "Nonfarm Payroll Employment", source: "BLS via FRED", unit: "Thousands of Persons" },
        { key: "aligned_stage_mapping_policy", label: "Quarterly stage alignment policy", source: "Backend policy", kind: "derived_policy" },
      ],
      methodology_note:
        "Funnel stages are built from stored GDP, gross national income, compensation of employees, and payroll inputs. GDP, GNI, and compensation use the latest quarter with all BEA series present, while payroll employment uses the latest PAYEMS month inside that same quarter and is converted from thousands to millions of persons for the final stage.",
      stages: [
        { id: "gross_domestic_product", label: "Gross Domestic Product", value: 29610.4, unit: "billions_usd" },
        { id: "gross_national_income", label: "Gross National Income", value: 29042.8, unit: "billions_usd" },
        { id: "employee_compensation", label: "Employee Compensation", value: 17188.5, unit: "billions_usd" },
        { id: "nonfarm_payroll_employment", label: "Nonfarm Payroll Employment", value: 159.2, unit: "millions_persons" },
      ],
    });

    await act(async () => {
      render(<EconomicFunnel />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("nivo-funnel")).toBeInTheDocument();
    });

    expect(screen.getByText("Source: BEA, BLS · Q4 2025")).toBeInTheDocument();
    expect(screen.getByText("Derived")).toBeInTheDocument();
    expect(
      screen.getByText(/latest PAYEMS month inside that same quarter/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Aligned funnel stages are built from payload inputs for Gross Domestic Product, Gross National Income, Compensation of Employees, Nonfarm Payroll Employment."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Inputs: Gross Domestic Product • Gross National Income • Compensation of Employees • Nonfarm Payroll Employment • Quarterly stage alignment policy"),
    ).toBeInTheDocument();
  });
});

describe("GdpQuarterly", () => {
  it("renders chart with payload-driven provenance", async () => {
    mockApi.getGdpQuarterly.mockResolvedValue({
      source: "Source: FRED · Q4 2025",
      methodology_type: "source_backed",
      data: [{ quarter: "2025-10-01", value: 2.3 }],
    });

    await act(async () => {
      render(<GdpQuarterly />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("nivo-bar")).toBeInTheDocument();
    });

    expect(screen.getByText("Source: FRED · Q4 2025")).toBeInTheDocument();
    expect(screen.getByText("Source-backed")).toBeInTheDocument();
  });
});

describe("StateScatter", () => {
  it("renders chart after data loads", async () => {
    mockApi.getStatesComparison.mockResolvedValue({
      data: [{ id: "States", data: [{ x: 3.5, y: 65000 }] }],
    });
    await act(async () => {
      render(<StateScatter />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("nivo-scatter")).toBeTruthy();
    });
  });

  it("renders derived provenance metadata when the endpoint is restored", async () => {
    mockApi.getStatesComparison.mockResolvedValue({
      source: "Source: BLS, BEA, Census · 2025",
      methodology_type: "derived",
      methodology_note: "GDP per capita is computed from stored annual GDP and population inputs for the curated public state set.",
      data: [{ id: "States", data: [{ x: 3.5, y: 65000, label: "Colorado", highlighted: true }] }],
    });

    await act(async () => {
      render(<StateScatter />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("nivo-scatter")).toBeInTheDocument();
    });

    expect(screen.getByText("Source: BLS, BEA, Census · 2025")).toBeInTheDocument();
    expect(screen.getByText("Derived")).toBeInTheDocument();
    expect(screen.getByText(/GDP per capita is computed/)).toBeInTheDocument();
  });
});

describe("RatesLine", () => {
  it("renders chart after data loads", async () => {
    mockApi.getRatesHistory.mockResolvedValue({
      source: "Source: FRED · Jan 2026",
      methodology_type: "source_backed",
      series: [{ id: "Fed Funds Rate", data: [{ x: "2025-01", y: 5.25 }] }],
    });
    await act(async () => {
      render(<RatesLine />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("nivo-line")).toBeTruthy();
    });
    expect(screen.getByText("Source: FRED · Jan 2026")).toBeInTheDocument();
    expect(screen.getByText("Source-backed")).toBeInTheDocument();
  });
});

describe("BulletTargets", () => {
  it("renders payload-driven bullet policies without frontend threshold literals", async () => {
    mockApi.getKpiSummary.mockResolvedValue({
      source: "Source: BEA, BLS, Federal Reserve · Mar 10, 2026",
      methodology_type: "derived",
      methodology_inputs: [
        { key: "gross_domestic_product", label: "Gross Domestic Product", source: "BEA via FRED" },
        { key: "consumer_price_index", label: "Consumer Price Index", source: "BLS via FRED" },
        { key: "unemployment_rate", label: "Unemployment Rate", source: "BLS via FRED" },
        { key: "fed_funds_rate", label: "Federal Funds Rate", source: "Federal Reserve via FRED" },
        { key: "bullet_target_policy", label: "Backend KPI target policy", source: "Backend policy", kind: "derived_policy" },
      ],
      methodology_note:
        "KPI summary values are computed from stored GDP, CPIAUCSL, UNRATE, and FEDFUNDS observations, and downstream bullet targets compare backend-selected measures against backend-owned target bands, markers, and policy notes.",
      kpis: [
        {
          key: "gdp",
          label: "Total GDP",
          current_value: 28000,
          previous_value: 27800,
          change_absolute: 200,
          change_percent: 0.72,
          period_label: "QoQ",
          positive_is_good: true,
          format: "trillions",
          sparkline: [{ date: "2025-10-01", value: 28000 }],
          target_policy: {
            target: 3,
            max: 5,
            ranges: [0, 2.5, 3.75, 5],
            markers: [3],
            measure: 0.72,
            measure_field: "change_percent",
            measure_label: "QoQ GDP growth",
            policy_note: "Compare quarterly GDP growth against a 3.0% expansion target on a 0-5% dashboard scale.",
          },
        },
        {
          key: "cpi",
          label: "Inflation Rate",
          current_value: 309,
          previous_value: 301,
          change_absolute: 8,
          change_percent: 2.7,
          period_label: "YoY",
          positive_is_good: false,
          format: "percent_change",
          sparkline: [{ date: "2026-01-01", value: 309 }],
          target_policy: {
            target: 2,
            max: 10,
            ranges: [0, 5, 7.5, 10],
            markers: [2],
            measure: 2.7,
            measure_field: "change_percent",
            measure_label: "YoY inflation",
            policy_note: "Compare year-over-year CPI inflation against the 2.0% price-stability goal on a 0-10% dashboard scale.",
          },
        },
        {
          key: "unemployment",
          label: "Unemployment",
          current_value: 4.1,
          previous_value: 4.0,
          change_absolute: 0.1,
          change_percent: 2.5,
          period_label: "MoM",
          positive_is_good: false,
          format: "percent",
          sparkline: [{ date: "2026-01-01", value: 4.1 }],
          target_policy: {
            target: 4,
            max: 10,
            ranges: [0, 5, 7.5, 10],
            markers: [4],
            measure: 4.1,
            measure_field: "current_value",
            measure_label: "Current unemployment rate",
            policy_note: "Compare the latest unemployment rate against a 4.0% labor-market target on a 0-10% dashboard scale.",
          },
        },
        {
          key: "fed_rate",
          label: "Fed Funds Rate",
          current_value: 4.5,
          previous_value: 4.5,
          change_absolute: 0,
          change_percent: 0,
          period_label: "Current",
          positive_is_good: false,
          format: "percent",
          sparkline: [{ date: "2026-03-10", value: 4.5 }],
          target_policy: {
            target: 3,
            max: 6,
            ranges: [0, 3, 4.5, 6],
            markers: [3],
            measure: 4.5,
            measure_field: "current_value",
            measure_label: "Current fed funds rate",
            policy_note: "Compare the latest effective fed funds rate against a 3.0% dashboard policy target on a 0-6% scale.",
          },
        },
      ],
    });

    await act(async () => {
      render(<BulletTargets />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("nivo-bullet")).toBeInTheDocument();
    });

    expect(screen.getByText("Source: BEA, BLS, Federal Reserve · Mar 10, 2026")).toBeInTheDocument();
    expect(screen.getByText("Derived")).toBeInTheDocument();
    expect(
      screen.getByText(/backend-selected measures against backend-owned target bands/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Fed funds rate is 1.5 pts above the 3.0% policy target; inflation is 35% above its 2.0% goal"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Bullet measures are rendered from payload policy selections for QoQ GDP growth, YoY inflation, Current unemployment rate, Current fed funds rate."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Inputs: Gross Domestic Product • Consumer Price Index • Unemployment Rate • Federal Funds Rate • Backend KPI target policy"),
    ).toBeInTheDocument();

    const bulletProps = mockResponsiveBullet.mock.calls[0]?.[0] as {
      data: Array<{ id: string; ranges: number[]; measures: number[]; markers: number[] }>;
    };

    expect(bulletProps.data).toEqual([
      { id: "Total GDP", ranges: [0, 2.5, 3.75, 5], measures: [0.72], markers: [3] },
      { id: "Inflation Rate", ranges: [0, 5, 7.5, 10], measures: [2.7], markers: [2] },
      { id: "Unemployment", ranges: [0, 5, 7.5, 10], measures: [4.1], markers: [4] },
      { id: "Fed Funds Rate", ranges: [0, 3, 4.5, 6], measures: [4.5], markers: [3] },
    ]);
  });
});

describe("SectorTreemap", () => {
  it("renders chart after data loads", async () => {
    mockApi.getSectorsGdp.mockResolvedValue({
      tree: { name: "GDP", children: [{ name: "Services", children: [{ name: "Finance", value: 30 }] }] },
    });
    await act(async () => {
      render(<SectorTreemap />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("nivo-treemap")).toBeTruthy();
    });
  });

  it("renders derived provenance metadata when the sector endpoint is restored", async () => {
    mockApi.getSectorsGdp.mockResolvedValue({
      source: "Source: BEA · Q4 2025",
      methodology_type: "derived",
      methodology_note: "Sector leaf values are derived as percent shares of the latest stored BEA current-dollar GDP-by-industry snapshot using the configured public hierarchy.",
      tree: { name: "GDP", children: [{ name: "Services", children: [{ name: "Finance", value: 30 }] }] },
    });

    await act(async () => {
      render(<SectorTreemap />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("nivo-treemap")).toBeInTheDocument();
    });

    expect(screen.getByText("Source: BEA · Q4 2025")).toBeInTheDocument();
    expect(screen.getByText("Derived")).toBeInTheDocument();
    expect(screen.getByText(/Sector leaf values are derived/)).toBeInTheDocument();
  });
});

describe("GdpWaffle", () => {
  it("renders the source-backed sector payload instead of the unavailable state", async () => {
    mockApi.getSectorsGdp.mockResolvedValue({
      source: "Source: BEA · Q4 2025",
      methodology_type: "derived",
      methodology_note: "Sector leaf values are derived as percent shares of the latest stored BEA current-dollar GDP-by-industry snapshot using the configured public hierarchy.",
      tree: {
        name: "GDP",
        children: [
          { name: "Services", children: [{ name: "Finance", value: 60 }] },
          { name: "Industry", children: [{ name: "Manufacturing", value: 40 }] },
        ],
      },
    });

    await act(async () => {
      render(<GdpWaffle />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("nivo-waffle")).toBeInTheDocument();
    });

    expect(screen.getByText("Source: BEA · Q4 2025")).toBeInTheDocument();
    expect(screen.getByText("Derived")).toBeInTheDocument();
  });
});

describe("SentimentRadial", () => {
  it("renders chart after data loads", async () => {
    mockApi.getSentimentRadial.mockResolvedValue({
      source: "Source: FRED · Mar 2026",
      methodology_type: "source_backed",
      current: "67.5",
      data: [
        {
          id: "Current",
          data: [
            { x: "Overall", y: 67.5 },
            { x: "Expectations", y: 72 },
          ],
        },
      ],
    });
    await act(async () => {
      render(<SentimentRadial />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("nivo-radar")).toBeTruthy();
    });
    expect(screen.getByText("Source: FRED · Mar 2026")).toBeInTheDocument();
    expect(screen.getByText("Source-backed")).toBeInTheDocument();
  });
});

describe("Sp500Area", () => {
  it("renders chart after data loads", async () => {
    mockApi.getSeriesData.mockResolvedValue({
      source: "Source: FRED · Mar 2026",
      methodology_type: "source_backed",
      data: [
        { date: "2025-01-01", value: 4800 },
        { date: "2025-02-01", value: 4900 },
      ],
    });
    await act(async () => {
      render(<Sp500Area />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("nivo-line")).toBeTruthy();
    });
    expect(screen.getByText("Source: FRED · Mar 2026")).toBeInTheDocument();
    expect(screen.getByText("Source-backed")).toBeInTheDocument();
  });
});
