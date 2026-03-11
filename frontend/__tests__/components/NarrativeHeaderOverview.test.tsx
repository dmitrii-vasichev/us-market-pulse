import { render, screen } from "@testing-library/react";
import NarrativeHeader from "@/components/NarrativeHeader";

// Test the presentational NarrativeHeader component with Overview-style props
describe("NarrativeHeader (Overview page)", () => {
  it("renders section label", () => {
    render(
      <NarrativeHeader
        sectionLabel="ECONOMIC OVERVIEW · Q4 2025"
        narrative="The US economy grew 1.4% in Q4 2025, decelerating from 3.1% in Q3."
        updatedLine="Updated: Mar 2026 · Sources: BEA, BLS, Federal Reserve"
      />
    );
    expect(screen.getByText("ECONOMIC OVERVIEW · Q4 2025")).toBeTruthy();
  });

  it("renders narrative text with data values", () => {
    render(
      <NarrativeHeader
        sectionLabel="ECONOMIC OVERVIEW · Q4 2025"
        narrative="The US economy grew 1.4% in Q4 2025."
        updatedLine="Updated: Mar 2026"
      />
    );
    expect(screen.getByText(/1\.4%/)).toBeTruthy();
  });
});

describe("NarrativeHeader (Labor page)", () => {
  it("renders labor section label", () => {
    render(
      <NarrativeHeader
        sectionLabel="LABOR MARKET · JAN 2026"
        narrative="The US labor market remains resilient with unemployment at 4.4%."
        updatedLine="Updated: Mar 2026 · Sources: BLS"
      />
    );
    expect(screen.getByText("LABOR MARKET · JAN 2026")).toBeTruthy();
  });
});

describe("NarrativeHeader (Markets page)", () => {
  it("renders markets section label", () => {
    render(
      <NarrativeHeader
        sectionLabel="MARKETS & RATES · MAR 2026"
        narrative="The Federal Reserve held its target rate at 4.25%."
        updatedLine="Updated: Mar 2026 · Sources: Federal Reserve"
      />
    );
    expect(screen.getByText("MARKETS & RATES · MAR 2026")).toBeTruthy();
  });
});
