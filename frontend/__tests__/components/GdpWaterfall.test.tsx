import { render, screen, waitFor, act } from "@testing-library/react";

let latestBarProps: Record<string, unknown> | null = null;

jest.mock("@nivo/bar", () => ({
  ResponsiveBar: (props: Record<string, unknown>) => {
    latestBarProps = props;
    return <div data-testid="nivo-bar" />;
  },
}));

const mockApi = {
  getGdpComponents: jest.fn(),
};

jest.mock("@/lib/api", () => ({ api: mockApi }));

jest.mock("@/lib/nivo-theme", () => ({
  nivoTheme: {},
  chartColors: {
    teal: "#2DD4A8",
    coral: "#F87171",
  },
}));

import GdpWaterfall, { getGdpWaterfallValueScale } from "@/components/charts/GdpWaterfall";

describe("getGdpWaterfallValueScale", () => {
  it("adds lower breathing room when negative contributions are present", () => {
    const scale = getGdpWaterfallValueScale([0.63, 0.35, 0.21, -0.07, 0.28]);

    expect(scale.min).toBeLessThan(-0.07);
    expect(scale.max).toBeGreaterThan(0.63);
    expect(scale.nice).toBe(false);
  });

  it("keeps the baseline anchored at zero when all contributions are non-negative", () => {
    const scale = getGdpWaterfallValueScale([0.63, 0.35, 0.21, 0.07, 0.28]);

    expect(scale.min).toBe(0);
    expect(scale.max).toBeGreaterThan(0.63);
  });
});

describe("GdpWaterfall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latestBarProps = null;
  });

  it("passes extra spacing config to the bar chart for negative values", async () => {
    mockApi.getGdpComponents.mockResolvedValue({
      quarter: "2025-Q4",
      total_growth: 1.4,
      components: [
        { id: "consumer", label: "Consumer Spending", value: 0.63 },
        { id: "business", label: "Business Investment", value: 0.35 },
        { id: "government", label: "Government", value: 0.21 },
        { id: "exports", label: "Net Exports", value: -0.07 },
        { id: "inventory", label: "Inventory Change", value: 0.28 },
      ],
    });

    await act(async () => {
      render(<GdpWaterfall />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("nivo-bar")).toBeInTheDocument();
    });

    expect(latestBarProps).toMatchObject({
      margin: { bottom: 110 },
      axisBottom: { tickPadding: 24 },
    });

    expect(latestBarProps?.valueScale).toMatchObject({
      min: expect.any(Number),
      max: expect.any(Number),
      nice: false,
    });

    const valueScale = latestBarProps?.valueScale as { min: number; max: number };
    expect(valueScale.min).toBeLessThan(-0.07);
    expect(valueScale.max).toBeGreaterThan(0.63);
  });
});
