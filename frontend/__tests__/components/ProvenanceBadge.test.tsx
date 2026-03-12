import { render, screen } from "@testing-library/react";

import ProvenanceBadge from "@/components/ProvenanceBadge";

describe("ProvenanceBadge", () => {
  it("renders source-backed copy", () => {
    render(<ProvenanceBadge methodologyType="source_backed" />);
    expect(screen.getByText("Source-backed")).toBeInTheDocument();
  });

  it("renders derived copy", () => {
    render(<ProvenanceBadge methodologyType="derived" />);
    expect(screen.getByText("Derived")).toBeInTheDocument();
  });

  it("renders illustrative copy", () => {
    render(<ProvenanceBadge methodologyType="illustrative" />);
    expect(screen.getByText("Illustrative")).toBeInTheDocument();
  });
});
