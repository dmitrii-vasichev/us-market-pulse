import { render, screen } from "@testing-library/react";
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
});
