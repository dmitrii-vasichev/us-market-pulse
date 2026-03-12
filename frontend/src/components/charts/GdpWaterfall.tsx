"use client";

import { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import type { BarCustomLayerProps } from "@nivo/bar";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { GdpComponentsResponse } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

type BarDatum = { id: string; value: number; color: string };

// Annotation: callout on Net Exports bar
// Hidden on mobile (innerWidth < 400 ~ viewport < 640px)
function NetExportsAnnotation({ bars, innerWidth }: BarCustomLayerProps<BarDatum>) {
  if (innerWidth < 400) return null;

  const netExportsBar = bars.find(
    (b) => typeof b.data.id === "string" && b.data.id.toLowerCase().includes("net export"),
  );
  if (!netExportsBar) return null;

  const x = netExportsBar.x + netExportsBar.width / 2;
  // For negative bars, y is at zero line, height extends down
  const barBottom = netExportsBar.y + netExportsBar.height;
  const lineEndY = barBottom + 20;

  return (
    <g>
      <line x1={x} y1={barBottom + 2} x2={x} y2={lineEndY} stroke="#555D73" strokeWidth={1} />
      <text x={x} y={lineEndY + 12} textAnchor="middle" fontSize={11} fill="#555D73">
        First drag in 3 quarters
      </text>
    </g>
  );
}

export default function GdpWaterfall() {
  const [data, setData] = useState<GdpComponentsResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getGdpComponents().then(setData).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="GDP Components" />;
  if (!data) return <ChartCardSkeleton />;

  const barData: BarDatum[] = data.components.map((c) => ({
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
      contextualNote="While consumers drove growth, the negative net exports contribution reflects import demand outpacing exports — typical of an accelerating domestic economy. Watch this spread as global demand shifts in 2026."
    >
      <ResponsiveBar
        data={barData}
        keys={["value"]}
        indexBy="id"
        theme={nivoTheme}
        colors={({ data }) => (data as { color: string }).color}
        margin={{ top: 10, right: 20, bottom: 80, left: 50 }}
        padding={0.4}
        valueScale={{ type: "linear" }}
        axisBottom={{
          tickRotation: -45,
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
        layers={["grid", "bars", "axes", "markers", "legends", NetExportsAnnotation]}
      />
    </ChartCard>
  );
}
