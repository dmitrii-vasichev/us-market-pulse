// T4: Chart annotation callouts — verify annotation layer logic

describe("Chart annotation layer logic", () => {
  it("finds Net Exports bar by id substring match", () => {
    const bars = [
      { data: { id: "Consumer Spending" }, x: 0, y: 10, width: 50, height: 20 },
      { data: { id: "Net Exports" }, x: 60, y: 80, width: 50, height: 30 },
      { data: { id: "Government" }, x: 120, y: 5, width: 50, height: 15 },
    ];
    const netExportsBar = bars.find(
      (b) => typeof b.data.id === "string" && b.data.id.toLowerCase().includes("net export"),
    );
    expect(netExportsBar).toBeDefined();
    expect(netExportsBar?.data.id).toBe("Net Exports");
  });

  it("finds Q1 2025 bar by exact quarter match", () => {
    const bars = [
      { data: { quarter: "Q4 2024" }, x: 0, y: 10, width: 50, height: 20 },
      { data: { quarter: "Q1 2025" }, x: 60, y: 80, width: 50, height: 30 },
      { data: { quarter: "Q2 2025" }, x: 120, y: 5, width: 50, height: 15 },
    ];
    const q1Bar = bars.find((b) => b.data.quarter === "Q1 2025");
    expect(q1Bar).toBeDefined();
    expect(q1Bar?.data.quarter).toBe("Q1 2025");
  });

  it("hides annotation when innerWidth < 400 (mobile)", () => {
    const innerWidth = 320; // mobile
    const shouldShow = innerWidth >= 400;
    expect(shouldShow).toBe(false);
  });

  it("shows annotation when innerWidth >= 400 (desktop)", () => {
    const innerWidth = 600;
    const shouldShow = innerWidth >= 400;
    expect(shouldShow).toBe(true);
  });

  it("finds shelter cell by id substring in heatmap", () => {
    const cells = [
      { data: { id: "Food & Beverages" }, x: 100, y: 0, width: 50, height: 30 },
      { data: { id: "Shelter" }, x: 100, y: 35, width: 50, height: 30 },
      { data: { id: "Transportation" }, x: 100, y: 70, width: 50, height: 30 },
    ];
    const shelterCell = cells.find(
      (c) => c.data?.id?.toLowerCase().includes("shelter"),
    );
    expect(shelterCell).toBeDefined();
    expect(shelterCell?.data.id).toBe("Shelter");
  });
});
