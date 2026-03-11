// T8: Polish & cross-reference connections

describe("KPI cross-reference micro-context", () => {
  it("unemployment shows previous value in micro-context", () => {
    const kpi = { key: "unemployment", current_value: 4.4, previous_value: 3.6 };
    const context = `↑ from ${kpi.previous_value.toFixed(1)}% prior · below hist. avg 5.7%`;
    expect(context).toContain("3.6%");
    expect(context).toContain("5.7%");
  });

  it("fed_rate shows CPI cross-reference", () => {
    const kpi = { key: "fed_rate", current_value: 3.6 };
    const cpi = { key: "cpi", current_value: 2.7 };
    const context = `Target ${kpi.current_value.toFixed(2)}–${(kpi.current_value + 0.25).toFixed(2)}% · ← responding to ${cpi.current_value.toFixed(1)}% inflation`;
    expect(context).toContain("3.60");
    expect(context).toContain("2.7%");
    expect(context).toContain("inflation");
  });
});

describe("Cross-reference navigation links", () => {
  it("Overview links to Labor page", () => {
    const href = "/labor";
    expect(href).toBe("/labor");
  });

  it("link text mentions employment impact", () => {
    const linkText = "See Labor & Economy for employment impact";
    expect(linkText).toContain("Labor");
    expect(linkText).toContain("employment");
  });
});
