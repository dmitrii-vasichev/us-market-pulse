"use client";

import { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { GdpComponentsResponse } from "@/lib/types";
import ChartCard from "../ChartCard";

export default function GdpWaterfall() {
  const [data, setData] = useState<GdpComponentsResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getGdpComponents().then(setData).catch(() => setError(true));
  }, []);

  if (error) return <ChartCard title="GDP Components"><p className="text-sm text-accent-red">Failed to load</p></ChartCard>;
  if (!data) return <ChartCard title="GDP Components"><div className="animate-pulse h-full bg-gray-100 rounded-lg" /></ChartCard>;

  const barData = data.components.map((c) => ({
    id: c.label,
    value: c.value,
    color: c.value >= 0 ? chartColors.blue : chartColors.red,
  }));

  return (
    <ChartCard title={`GDP Growth Components \u2014 ${data.total_growth}% Total`}>
      <ResponsiveBar
        data={barData}
        keys={["value"]}
        indexBy="id"
        theme={nivoTheme}
        colors={({ data }) => (data as { color: string }).color}
        margin={{ top: 10, right: 20, bottom: 60, left: 50 }}
        padding={0.4}
        valueScale={{ type: "linear" }}
        axisBottom={{
          tickRotation: -30,
          tickSize: 0,
          tickPadding: 8,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          format: (v) => `${v}%`,
        }}
        labelFormat={(v) => `${Number(v).toFixed(2)}%`}
        labelTextColor="#FFFFFF"
        animate={true}
        enableGridY={true}
      />
    </ChartCard>
  );
}
