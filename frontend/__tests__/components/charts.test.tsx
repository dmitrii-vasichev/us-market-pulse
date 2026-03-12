import { render, screen, waitFor, act } from "@testing-library/react";

const mockResponsiveCalendar = jest.fn(() => <div data-testid="nivo-calendar" />);

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
  ResponsiveBullet: () => <div data-testid="nivo-bullet" />,
}));
jest.mock("@nivo/waffle", () => ({
  ResponsiveWaffle: () => <div data-testid="nivo-waffle" />,
}));

const mockApi = {
  getLaborRanking: jest.fn(),
  getCpiCategories: jest.fn(),
  getCpiCalendar: jest.fn(),
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
import StateScatter from "@/components/charts/StateScatter";
import RatesLine from "@/components/charts/RatesLine";
import SectorTreemap from "@/components/charts/SectorTreemap";
import SentimentRadial from "@/components/charts/SentimentRadial";
import Sp500Area from "@/components/charts/Sp500Area";

beforeEach(() => jest.clearAllMocks());

describe("UnemploymentBump", () => {
  it("renders chart after data loads", async () => {
    mockApi.getLaborRanking.mockResolvedValue({
      data: [{ id: "Colorado", data: [{ x: "Jan", y: 1 }] }],
    });
    await act(async () => {
      render(<UnemploymentBump />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("nivo-bump")).toBeTruthy();
    });
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
});

describe("CpiCalendar", () => {
  it("renders without horizontal scroll and provides contextual tooltip content", async () => {
    mockApi.getCpiCalendar.mockResolvedValue({
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

    expect(screen.getByTestId("chart-card-scroll-container")).toHaveClass("overflow-x-hidden");

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
});

describe("RatesLine", () => {
  it("renders chart after data loads", async () => {
    mockApi.getRatesHistory.mockResolvedValue({
      series: [{ id: "Fed Funds Rate", data: [{ x: "2025-01", y: 5.25 }] }],
    });
    await act(async () => {
      render(<RatesLine />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("nivo-line")).toBeTruthy();
    });
  });
});

describe("SectorTreemap", () => {
  it("renders chart after data loads", async () => {
    mockApi.getSectorsGdp.mockResolvedValue({
      tree: { name: "GDP", children: [{ name: "Tech", value: 30 }] },
    });
    await act(async () => {
      render(<SectorTreemap />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("nivo-treemap")).toBeTruthy();
    });
  });
});

describe("SentimentRadial", () => {
  it("renders chart after data loads", async () => {
    mockApi.getSentimentRadial.mockResolvedValue({
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
  });
});

describe("Sp500Area", () => {
  it("renders chart after data loads", async () => {
    mockApi.getSeriesData.mockResolvedValue({
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
  });
});
