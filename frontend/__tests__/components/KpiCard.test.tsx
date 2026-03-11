import { render, screen } from "@testing-library/react";
import KpiCard from "@/components/KpiCard";
import type { KpiItem } from "@/lib/types";

jest.mock("@nivo/line", () => ({
  ResponsiveLine: () => <div data-testid="nivo-line" />,
}));

const mockKpi: KpiItem = {
  key: "gdp",
  label: "GDP Growth",
  current_value: 1.4,
  previous_value: 3.1,
  change_absolute: -1.7,
  change_percent: -54.8,
  period_label: "vs Q3 2025",
  positive_is_good: true,
  format: "percent",
  sparkline: [],
};

describe("KpiCard", () => {
  it("renders without errors", () => {
    render(<KpiCard kpi={mockKpi} />);
    expect(screen.getByText("GDP Growth")).toBeTruthy();
  });

  it("renders with provided microContext prop", () => {
    render(
      <KpiCard
        kpi={mockKpi}
        microContext="Largest economy globally · ~25% of world GDP"
      />
    );
    expect(
      screen.getByText("Largest economy globally · ~25% of world GDP")
    ).toBeTruthy();
  });

  it("does not render micro context section when not provided", () => {
    const { container } = render(<KpiCard kpi={mockKpi} />);
    const microEl = container.querySelector("p.text-\\[11px\\]");
    expect(microEl).toBeNull();
  });
});
