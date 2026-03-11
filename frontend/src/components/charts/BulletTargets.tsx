"use client";

import { useEffect, useState } from "react";
import { ResponsiveBullet } from "@nivo/bullet";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { KpiItem } from "@/lib/types";
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
  const [kpis, setKpis] = useState<KpiItem[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getKpiSummary().then((d) => setKpis(d.kpis)).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="KPI Targets" height={220} />;
  if (!kpis.length) return <ChartCardSkeleton height={220} />;

  const bulletData = kpis
    .filter((k) => targets[k.key])
    .map((k) => {
      const t = targets[k.key];
      const actual = k.format === "trillions" ? k.change_percent : k.current_value;
      return {
        id: k.label,
        ranges: [0, t.max * 0.5, t.max * 0.75, t.max],
        measures: [actual],
        markers: [t.target],
      };
    });

  return (
    <ChartCard title="KPI vs Target" height={220}>
      <ResponsiveBullet
        data={bulletData}
        theme={nivoTheme}
        margin={{ top: 10, right: 30, bottom: 10, left: 120 }}
        spacing={30}
        titleOffsetX={-110}
        measureColors={[chartColors.blue]}
        markerColors={[chartColors.coral]}
        rangeColors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.07)", "rgba(255,255,255,0.10)", "rgba(255,255,255,0.14)"]}
        animate={true}
      />
    </ChartCard>
  );
}
