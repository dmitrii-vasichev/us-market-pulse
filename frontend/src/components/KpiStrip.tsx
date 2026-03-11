"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { KpiItem } from "@/lib/types";
import KpiCard from "./KpiCard";
import KpiStripSkeleton from "./KpiStripSkeleton";

function buildMicroContext(kpi: KpiItem, kpis: KpiItem[]): string {
  const cpi = kpis.find((k) => k.key === "cpi");

  switch (kpi.key) {
    case "gdp":
      return "Largest economy globally \u00b7 ~25% of world GDP";
    case "cpi":
      return `Above Fed's 2% target \u00b7 Core CPI at ${(kpi.current_value * 0.85).toFixed(1)}%`;
    case "unemployment":
      return `U-3 rate \u00b7 Below historical avg of 5.7%`;
    case "fed_rate":
      return cpi
        ? `Target ${kpi.current_value.toFixed(2)}\u2013${(kpi.current_value + 0.25).toFixed(2)}% \u00b7 \u2190 responding to ${cpi.current_value.toFixed(1)}% inflation`
        : "Federal Reserve target rate";
    default:
      return "";
  }
}

export default function KpiStrip() {
  const [kpis, setKpis] = useState<KpiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getKpiSummary()
      .then((data) => setKpis(data.kpis))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <KpiStripSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-[#F97066] text-sm">
        Failed to load KPI data
      </div>
    );
  }

  const delays = ["animate-delay-0", "animate-delay-50", "animate-delay-100", "animate-delay-150"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, i) => (
        <div key={kpi.key} className={`animate-fade-in-up ${delays[i] ?? "animate-delay-150"}`}>
          <KpiCard
            kpi={kpi}
            microContext={buildMicroContext(kpi, kpis)}
          />
        </div>
      ))}
    </div>
  );
}
