import { render, screen, fireEvent } from "@testing-library/react";
import ChartCard from "@/components/ChartCard";

describe("ChartCard", () => {
  it("renders insight title", () => {
    render(
      <ChartCard insight="Consumer spending drove growth">
        <div>chart</div>
      </ChartCard>
    );
    expect(screen.getByText("Consumer spending drove growth")).toBeTruthy();
  });

  it("renders without description when not provided", () => {
    const { container } = render(
      <ChartCard insight="Test Insight">
        <div>chart</div>
      </ChartCard>
    );
    const desc = container.querySelector("p.text-\\[12px\\]");
    expect(desc).toBeNull();
  });

  it("renders description when provided", () => {
    render(
      <ChartCard insight="Test Insight" description="This is a narrative description.">
        <div>chart</div>
      </ChartCard>
    );
    expect(screen.getByText("This is a narrative description.")).toBeTruthy();
  });

  it("renders source attribution when provided", () => {
    render(
      <ChartCard insight="Test" source="Source: BEA · Q4 2025">
        <div>chart</div>
      </ChartCard>
    );
    expect(screen.getByText("Source: BEA · Q4 2025")).toBeTruthy();
  });

  it("does not render source when not provided", () => {
    render(
      <ChartCard insight="Test">
        <div>chart</div>
      </ChartCard>
    );
    expect(screen.queryByText(/Source:/)).toBeNull();
  });

  it("renders structured provenance metadata with methodology badge", () => {
    render(
      <ChartCard
        insight="Test"
        provenance={{
          source: "Source: FRED · Jan 2026",
          methodology_type: "derived",
          methodology_note: "Derived from stored monthly observations.",
        }}
      >
        <div>chart</div>
      </ChartCard>
    );

    expect(screen.getByText("Source: FRED · Jan 2026")).toBeInTheDocument();
    expect(screen.getByText("Derived")).toBeInTheDocument();
    expect(screen.getByText("Derived from stored monthly observations.")).toBeInTheDocument();
  });

  it("renders freshness microcopy for stale provenance", () => {
    render(
      <ChartCard
        insight="Test"
        provenance={{
          source: "Source: FRED · Jan 2026",
          methodology_type: "source_backed",
          freshness_status: "stale",
        }}
      >
        <div>chart</div>
      </ChartCard>
    );

    expect(screen.getByText("Release window lagging")).toBeInTheDocument();
  });

  it("renders a custom freshness indicator when provided", () => {
    render(
      <ChartCard
        insight="Test"
        provenance={{
          source: "Source: FRED · Jan 2026",
          methodology_type: "source_backed",
        }}
        freshnessIndicator={<span>Manual freshness override</span>}
      >
        <div>chart</div>
      </ChartCard>
    );

    expect(screen.getByText("Manual freshness override")).toBeInTheDocument();
  });

  it("uses auto horizontal overflow by default", () => {
    render(
      <ChartCard insight="Test">
        <div>chart</div>
      </ChartCard>
    );
    expect(screen.getByTestId("chart-card-scroll-container")).toHaveClass("overflow-x-auto");
  });

  it("can hide horizontal overflow when requested", () => {
    render(
      <ChartCard insight="Test" horizontalOverflow="hidden">
        <div>chart</div>
      </ChartCard>
    );
    expect(screen.getByTestId("chart-card-scroll-container")).toHaveClass("overflow-hidden");
  });

  it("can keep chart overflow visible when requested", () => {
    render(
      <ChartCard insight="Test" horizontalOverflow="visible">
        <div>chart</div>
      </ChartCard>
    );
    expect(screen.getByTestId("chart-card-scroll-container")).toHaveClass("overflow-visible");
  });

  it("does not render ? button when contextualNote is not provided", () => {
    render(
      <ChartCard insight="Test">
        <div>chart</div>
      </ChartCard>
    );
    expect(screen.queryByRole("button", { name: /what this means/i })).toBeNull();
  });

  it("renders ? button when contextualNote is provided", () => {
    render(
      <ChartCard insight="Test" contextualNote="Some economic context here.">
        <div>chart</div>
      </ChartCard>
    );
    expect(screen.getByRole("button", { name: /what this means/i })).toBeTruthy();
  });

  it("tooltip is hidden by default", () => {
    render(
      <ChartCard insight="Test" contextualNote="Some economic context here.">
        <div>chart</div>
      </ChartCard>
    );
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("opens tooltip on ? button click", () => {
    render(
      <ChartCard insight="Test" contextualNote="Some economic context here.">
        <div>chart</div>
      </ChartCard>
    );
    fireEvent.click(screen.getByRole("button", { name: /what this means/i }));
    expect(screen.getByRole("tooltip")).toBeTruthy();
    expect(screen.getByText("Some economic context here.")).toBeTruthy();
  });

  it("closes tooltip on second click", () => {
    render(
      <ChartCard insight="Test" contextualNote="Some economic context here.">
        <div>chart</div>
      </ChartCard>
    );
    const btn = screen.getByRole("button", { name: /what this means/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("closes tooltip on Escape key", () => {
    render(
      <ChartCard insight="Test" contextualNote="Some economic context here.">
        <div>chart</div>
      </ChartCard>
    );
    fireEvent.click(screen.getByRole("button", { name: /what this means/i }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
