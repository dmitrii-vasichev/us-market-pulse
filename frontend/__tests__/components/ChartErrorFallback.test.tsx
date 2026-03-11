import { render, screen, fireEvent } from "@testing-library/react";
import ChartErrorFallback from "@/components/ChartErrorFallback";

describe("ChartErrorFallback", () => {
  it("renders title and error message", () => {
    render(<ChartErrorFallback title="GDP Growth" />);
    expect(screen.getByText("GDP Growth")).toBeTruthy();
    expect(screen.getByText("Failed to load data")).toBeTruthy();
  });

  it("renders with custom height", () => {
    const { container } = render(
      <ChartErrorFallback title="Test" height={400} />
    );
    const inner = container.querySelector("[style*='height']") as HTMLElement;
    expect(inner?.style.height).toBe("400px");
  });

  it("shows retry button when onRetry is provided", () => {
    const onRetry = jest.fn();
    render(<ChartErrorFallback title="Test" onRetry={onRetry} />);
    const btn = screen.getByText("Retry");
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("hides retry button without onRetry", () => {
    render(<ChartErrorFallback title="Test" />);
    expect(screen.queryByText("Retry")).toBeNull();
  });
});
