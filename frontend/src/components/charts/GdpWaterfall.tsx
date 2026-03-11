"use client";

import { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { GdpComponentsResponse } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

export default function GdpWaterfall() {
  const [data, setData] = useState<GdpComponentsResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getGdpComponents().then(setData).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="GDP Components" />;
  if (!data) return <ChartCardSkeleton />;

  const barData = data.components.map((c) => ({
    id: c.label,
    value: c.value,
    color: c.value >= 0 ? chartColors.teal : chartColors.coral,
  }));

  const consumer = data.components.find((c) =>
    c.label.toLowerCase().includes("consumer") || c.label.toLowerCase().includes("personal"),
  );
  const consumerShare =
    consumer && data.total_growth !== 0
      ? Math.round((consumer.value / data.total_growth) * 100)
      : null;
  const insight = consumerShare !== null
    ? `Consumer spending drove ${consumerShare}% of Q4 growth (${data.total_growth}% total)`
    : "Consumer spending drove nearly half of Q4 growth";

  return (
    <ChartCard
      insight={insight}
      description="While overall GDP grew, the composition shifted notably: consumers led growth, while net exports dragged — the first negative contribution in 3 quarters."
      source="Source: BEA · Q4 2025"
    >
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
