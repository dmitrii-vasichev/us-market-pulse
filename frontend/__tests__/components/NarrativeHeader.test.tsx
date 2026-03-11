import { render, screen } from "@testing-library/react";
import NarrativeHeader from "@/components/NarrativeHeader";

describe("NarrativeHeader", () => {
  const props = {
    sectionLabel: "ECONOMIC OVERVIEW · Q4 2025",
    narrative:
      "The US economy grew 1.4% in Q4 2025, decelerating from 3.1% in Q3. Inflation remains elevated at 2.7% YoY while the Fed held rates at 4.25%. The labor market stays resilient with unemployment at 4.4%.",
    updatedLine: "Updated: Mar 2026 · Sources: BEA, BLS, Federal Reserve",
  };

  it("renders without errors", () => {
    render(<NarrativeHeader {...props} />);
    expect(screen.getByText(props.sectionLabel)).toBeTruthy();
  });

  it("displays section label", () => {
    render(<NarrativeHeader {...props} />);
    expect(screen.getByText("ECONOMIC OVERVIEW · Q4 2025")).toBeTruthy();
  });

  it("displays narrative text with data values", () => {
    render(<NarrativeHeader {...props} />);
    expect(screen.getByText(/1\.4%/)).toBeTruthy();
    expect(screen.getByText(/2\.7%/)).toBeTruthy();
    expect(screen.getByText(/4\.4%/)).toBeTruthy();
  });

  it("displays updated line", () => {
    render(<NarrativeHeader {...props} />);
    expect(screen.getByText(/Updated: Mar 2026/)).toBeTruthy();
  });
});
