import { render } from "@testing-library/react";
import ChartCardSkeleton from "@/components/ChartCardSkeleton";

describe("ChartCardSkeleton", () => {
  it("renders with default height", () => {
    const { container } = render(<ChartCardSkeleton />);
    const skeleton = container.querySelector("[style*='height']") as HTMLElement;
    expect(skeleton?.style.height).toBe("300px");
  });

  it("renders with custom height", () => {
    const { container } = render(<ChartCardSkeleton height={400} />);
    const skeleton = container.querySelector("[style*='height']") as HTMLElement;
    expect(skeleton?.style.height).toBe("400px");
  });

  it("has animate-pulse class", () => {
    const { container } = render(<ChartCardSkeleton />);
    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
