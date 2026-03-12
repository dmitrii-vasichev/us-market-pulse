import { render, screen } from "@testing-library/react";

import ChartUnavailableState from "@/components/ChartUnavailableState";

describe("ChartUnavailableState", () => {
  it("renders the unavailable message and provenance badge", () => {
    render(
      <ChartUnavailableState
        insight="GDP by sector"
        provenance={{
          source: "Source: Illustrative placeholder",
          methodology_type: "illustrative",
          methodology_note: "Static sector share approximation.",
        }}
      />
    );

    expect(screen.getByText("Temporarily unavailable")).toBeInTheDocument();
    expect(screen.getByText("Upgrading to source-backed methodology")).toBeInTheDocument();
    expect(screen.getByText("Source: Illustrative placeholder")).toBeInTheDocument();
    expect(screen.getByText("Illustrative")).toBeInTheDocument();
    expect(screen.getByText("Static sector share approximation.")).toBeInTheDocument();
  });
});
