import {
  formatCurrency,
  formatPercent,
  formatLargeNumber,
  formatKpiValue,
  formatDate,
  formatQuarter,
} from "@/lib/formatters";

describe("formatCurrency", () => {
  it("formats trillions", () => {
    expect(formatCurrency(1_500_000)).toBe("$1.5T");
  });

  it("formats billions", () => {
    expect(formatCurrency(1_500)).toBe("$1.5B");
  });

  it("formats small values", () => {
    expect(formatCurrency(42.5)).toBe("$42.5");
  });
});

describe("formatPercent", () => {
  it("adds + for positive", () => {
    expect(formatPercent(2.5)).toBe("+2.5%");
  });

  it("shows - for negative", () => {
    expect(formatPercent(-1.3)).toBe("-1.3%");
  });

  it("handles zero", () => {
    expect(formatPercent(0)).toBe("+0.0%");
  });
});

describe("formatLargeNumber", () => {
  it("formats billions", () => {
    expect(formatLargeNumber(2_500_000_000)).toBe("2.5B");
  });

  it("formats millions", () => {
    expect(formatLargeNumber(1_200_000)).toBe("1.2M");
  });

  it("formats thousands", () => {
    expect(formatLargeNumber(5_500)).toBe("5.5K");
  });
});

describe("formatKpiValue", () => {
  it("formats trillions", () => {
    expect(formatKpiValue(28500, "trillions")).toBe("$28.5T");
  });

  it("formats percent", () => {
    expect(formatKpiValue(3.7, "percent")).toBe("3.7%");
  });

  it("formats index", () => {
    expect(formatKpiValue(67.5, "index")).toBe("67.5");
  });
});

describe("formatDate", () => {
  it("formats date string", () => {
    expect(formatDate("2026-01-15")).toBe("Jan 2026");
  });
});

describe("formatQuarter", () => {
  it("formats Q1", () => {
    expect(formatQuarter("2026-01-01")).toBe("Q1 2026");
  });

  it("formats Q3", () => {
    expect(formatQuarter("2025-07-01")).toBe("Q3 2025");
  });
});
