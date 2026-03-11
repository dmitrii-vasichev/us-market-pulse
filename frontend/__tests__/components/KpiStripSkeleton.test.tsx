import { render } from "@testing-library/react";
import KpiStripSkeleton from "@/components/KpiStripSkeleton";

describe("KpiStripSkeleton", () => {
  it("renders 4 skeleton cards", () => {
    const { container } = render(<KpiStripSkeleton />);
    const cards = container.querySelectorAll(".animate-pulse");
    expect(cards).toHaveLength(4);
  });
});
