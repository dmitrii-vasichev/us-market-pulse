"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { KpiItem } from "@/lib/types";
import NarrativeHeader from "./NarrativeHeader";

export default function NarrativeHeaderLabor() {
  const [kpis, setKpis] = useState<KpiItem[]>([]);

  useEffect(() => {
    api.getKpiSummary().then((d) => setKpis(d.kpis)).catch(() => {});
  }, []);

  const unemployment = kpis.find((k) => k.key === "unemployment");
  const cpi = kpis.find((k) => k.key === "cpi");

  const direction = unemployment
    ? unemployment.change_percent < 0
      ? "falling"
      : "holding steady"
    : "holding steady";

  const narrative =
    unemployment && cpi
      ? `The US labor market remains resilient, with unemployment ${direction} at ${unemployment.current_value.toFixed(1)}%. Inflation at ${cpi.change_percent.toFixed(1)}% YoY is ${cpi.change_percent > 3 ? "squeezing" : "moderately affecting"} real purchasing power, though wage growth is outpacing CPI for the first time since 2021.`
      : "The US labor market remains resilient with historically low unemployment. Wage growth is outpacing inflation for the first time since 2021, improving real purchasing power.";

  return (
    <NarrativeHeader
      sectionLabel="LABOR MARKET · JAN 2026"
      narrative={narrative}
      updatedLine="Updated: Mar 2026 · Sources: BLS, Census Bureau"
    />
  );
}
