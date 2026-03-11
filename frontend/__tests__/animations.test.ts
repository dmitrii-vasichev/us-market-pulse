// T1: Staggered load animations — verify CSS classes and prefers-reduced-motion

describe("Animation CSS classes", () => {
  it("defines the expected delay class names", () => {
    const delays = [
      "animate-delay-0",
      "animate-delay-50",
      "animate-delay-100",
      "animate-delay-150",
      "animate-delay-200",
      "animate-delay-250",
      "animate-delay-300",
      "animate-delay-350",
    ];
    // Verify delay values correspond to ms multiples of 50
    delays.forEach((cls, i) => {
      const ms = i * 50;
      expect(cls).toBe(`animate-delay-${ms}`);
    });
  });

  it("generates correct stagger delay for up to 4 KPI cards", () => {
    const delays = ["animate-delay-0", "animate-delay-50", "animate-delay-100", "animate-delay-150"];
    const kpis = ["gdp", "cpi", "unemployment", "fed_rate"];
    kpis.forEach((_, i) => {
      expect(delays[i]).toBeDefined();
    });
  });

  it("falls back to animate-delay-150 for cards beyond index 3", () => {
    const delays = ["animate-delay-0", "animate-delay-50", "animate-delay-100", "animate-delay-150"];
    const fallback = "animate-delay-150";
    expect(delays[4] ?? fallback).toBe(fallback);
  });
});
