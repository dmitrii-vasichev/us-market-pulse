"use client";

import { useEffect, useState } from "react";
import { ResponsiveBullet } from "@nivo/bullet";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { KpiItem, KpiSummaryResponse } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

const targets: Record<string, { target: number; max: number }> = {
  gdp: { target: 3.0, max: 5.0 },
  cpi: { target: 2.0, max: 10.0 },
  unemployment: { target: 4.0, max: 10.0 },
  fed_rate: { target: 3.0, max: 6.0 },
};

export default function BulletTargets() {
  const [response, setResponse] = useState<KpiSummaryResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getKpiSummary().then(setResponse).catch(() => setError(true));
  }, []);

  const kpis: KpiItem[] = response?.kpis ?? [];

  if (error) return <ChartErrorFallback title="KPI Targets" height={220} />;
  if (!kpis.length) return <ChartCardSkeleton height={220} />;

  const bulletData = kpis
    .filter((k) => targets[k.key])
    .map((k) => {
      const t = targets[k.key];
      // GDP: use change_percent (QoQ % growth); CPI: use change_percent (YoY %); others: current_value is already in %
      const actual = k.format === "trillions" || k.format === "percent_change" ? k.change_percent : k.current_value;
      return {
        id: k.label,
        ranges: [0, t.max * 0.5, t.max * 0.75, t.max],
        measures: [actual],
        markers: [t.target],
      };
    });

  const cpi = kpis.find((k) => k.key === "cpi");
  const fedRate = kpis.find((k) => k.key === "fed_rate");
  const insight =
    cpi && fedRate
      ? `Fed hits rate target; inflation at ${cpi.change_percent.toFixed(1)}% — ${Math.round((cpi.change_percent / 2 - 1) * 100)}% above 2% goal`
      : "Fed hits rate target; inflation still 35% above 2% goal";

  return (
    <ChartCard
      insight={insight}
      source={response?.source}
      contextualNote={response?.methodology_note ?? undefined}
      height={220}
    >
      <ResponsiveBullet
        data={bulletData}
        theme={nivoTheme}
        margin={{ top: 10, right: 30, bottom: 10, left: 120 }}
        spacing={30}
        titleOffsetX={-110}
        measureColors={[chartColors.teal]}
        markerColors={[chartColors.coral]}
        rangeColors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.07)", "rgba(255,255,255,0.10)", "rgba(255,255,255,0.14)"]}
        animate={true}
      />
    </ChartCard>
  );
}
