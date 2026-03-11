"use client";

import { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import { formatQuarter } from "@/lib/formatters";
import type { GdpQuarterlyItem } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

export default function GdpQuarterly() {
  const [data, setData] = useState<GdpQuarterlyItem[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getGdpQuarterly().then((d) => setData(d.data)).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="Quarterly GDP Growth" />;
  if (!data.length) return <ChartCardSkeleton />;

  const barData = data.map((d) => ({
    quarter: formatQuarter(d.quarter),
    value: d.value,
    color: d.value >= 0 ? chartColors.blue : chartColors.red,
  }));

  return (
    <ChartCard title="Quarterly GDP Growth (%)">
      <ResponsiveBar
        data={barData}
        keys={["value"]}
        indexBy="quarter"
        theme={nivoTheme}
        colors={({ data }) => (data as { color: string }).color}
        margin={{ top: 10, right: 20, bottom: 40, left: 50 }}
        padding={0.3}
        axisBottom={{
          tickSize: 0,
          tickPadding: 8,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          format: (v) => `${v}%`,
        }}
        labelFormat={(v) => `${Number(v).toFixed(1)}%`}
        labelTextColor="#FFFFFF"
        animate={true}
        enableGridY={true}
      />
    </ChartCard>
  );
}
