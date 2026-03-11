"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { KpiItem } from "@/lib/types";
import NarrativeHeader from "./NarrativeHeader";

export default function NarrativeHeaderMarkets() {
  const [kpis, setKpis] = useState<KpiItem[]>([]);

  useEffect(() => {
    api.getKpiSummary().then((d) => setKpis(d.kpis)).catch(() => {});
  }, []);

  const fedRate = kpis.find((k) => k.key === "fed_rate");
  const cpi = kpis.find((k) => k.key === "cpi");

  const narrative =
    fedRate && cpi
      ? `The Federal Reserve held its target rate at ${fedRate.current_value.toFixed(2)}% at its latest FOMC meeting, signaling confidence in the disinflation trajectory. With inflation at ${cpi.change_percent.toFixed(1)}%, markets are pricing in 2 rate cuts in H1 2026 as the Fed approaches its 2% target.`
      : "The Federal Reserve held its target rate steady, signaling confidence in the disinflation trajectory. Markets are pricing in rate cuts in H1 2026.";

  return (
    <NarrativeHeader
      sectionLabel="MARKETS & RATES · MAR 2026"
      narrative={narrative}
      updatedLine="Updated: Mar 2026 · Sources: Federal Reserve, S&P, University of Michigan"
    />
  );
}
