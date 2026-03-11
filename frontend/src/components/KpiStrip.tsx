"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { KpiItem } from "@/lib/types";
import KpiCard from "./KpiCard";
import KpiStripSkeleton from "./KpiStripSkeleton";

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
      <div className="text-center py-4 text-accent-red text-sm">
        Failed to load KPI data
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.key} kpi={kpi} />
      ))}
    </div>
  );
}
