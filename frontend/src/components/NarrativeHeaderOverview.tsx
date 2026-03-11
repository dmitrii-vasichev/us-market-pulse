"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { KpiItem } from "@/lib/types";
import NarrativeHeader from "./NarrativeHeader";

export default function NarrativeHeaderOverview() {
  const [kpis, setKpis] = useState<KpiItem[]>([]);

  useEffect(() => {
    api.getKpiSummary().then((d) => setKpis(d.kpis)).catch(() => {});
  }, []);

  const gdp = kpis.find((k) => k.key === "gdp");
  const cpi = kpis.find((k) => k.key === "cpi");
  const unemployment = kpis.find((k) => k.key === "unemployment");
  const fedRate = kpis.find((k) => k.key === "fed_rate");

  const narrative =
    gdp && cpi && unemployment && fedRate
      ? `The US economy grew ${gdp.change_percent.toFixed(1)}% in Q4 2025, ${gdp.change_percent < 0 ? "decelerating" : "accelerating"} vs Q3. Inflation remains ${cpi.change_percent > 2.5 ? "elevated" : "easing"} at ${cpi.change_percent.toFixed(1)}% YoY while the Fed held rates at ${fedRate.current_value.toFixed(2)}%. The labor market stays resilient with unemployment at ${unemployment.current_value.toFixed(1)}%.`
      : "The US economy continued its expansion in Q4 2025. Inflation remains above the Fed's 2% target while the labor market stays resilient.";

  return (
    <NarrativeHeader
      sectionLabel="ECONOMIC OVERVIEW · Q4 2025"
      narrative={narrative}
      updatedLine="Updated: Mar 2026 · Sources: BEA, BLS, Federal Reserve"
    />
  );
}
