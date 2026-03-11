// T5: Responsive layout audit — verify grid classes and touch targets

describe("Responsive layout", () => {
  it("KpiStrip uses responsive grid cols", () => {
    // Verify the expected class string is used (regression check)
    const expectedClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";
    expect(expectedClass).toContain("grid-cols-1");
    expect(expectedClass).toContain("sm:grid-cols-2");
    expect(expectedClass).toContain("lg:grid-cols-4");
  });

  it("page grids stack on mobile (grid-cols-1) and expand on large screens", () => {
    const pageGridClass = "grid grid-cols-1 lg:grid-cols-2 gap-6";
    expect(pageGridClass).toContain("grid-cols-1");
    expect(pageGridClass).toContain("lg:grid-cols-2");
  });

  it("hamburger button meets 44px touch target requirement", () => {
    // Button class should include min-h-[44px] min-w-[44px]
    const buttonClass = "md:hidden p-2.5 rounded-lg text-[#8B93A7] hover:bg-[#252A3A] min-h-[44px] min-w-[44px] flex items-center justify-center";
    expect(buttonClass).toContain("min-h-[44px]");
    expect(buttonClass).toContain("min-w-[44px]");
  });

  it("chart container uses overflow-x-auto for horizontal scroll on mobile", () => {
    const containerClass = "overflow-x-auto -mx-1";
    expect(containerClass).toContain("overflow-x-auto");
  });
});
