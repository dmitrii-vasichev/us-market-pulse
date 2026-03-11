"use client";

import { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import type { BarCustomLayerProps } from "@nivo/bar";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import { formatQuarter } from "@/lib/formatters";
import type { GdpQuarterlyItem } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

type BarDatum = { quarter: string; value: number; color: string };

// Annotation: callout on Q1 2025 contraction bar
function Q1ContractionAnnotation({ bars, innerWidth }: BarCustomLayerProps<BarDatum>) {
  if (innerWidth < 400) return null;

  const q1Bar = bars.find(
    (b) => (b.data as unknown as BarDatum).quarter === "Q1 2025",
  );
  if (!q1Bar) return null;

  const x = q1Bar.x + q1Bar.width / 2;
  // For negative bars, y is at zero line, height extends downward
  const barBottom = q1Bar.y + q1Bar.height;
  const lineEndY = barBottom + 20;

  return (
    <g>
      <line x1={x} y1={barBottom + 2} x2={x} y2={lineEndY} stroke="#555D73" strokeWidth={1} />
      <text x={x} y={lineEndY + 11} textAnchor="middle" fontSize={11} fill="#555D73">
        Contraction driven by
      </text>
      <text x={x} y={lineEndY + 24} textAnchor="middle" fontSize={11} fill="#555D73">
        inventory drawdown
      </text>
    </g>
  );
}

export default function GdpQuarterly() {
  const [data, setData] = useState<GdpQuarterlyItem[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getGdpQuarterly().then((d) => setData(d.data)).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="Quarterly GDP Growth" />;
  if (!data.length) return <ChartCardSkeleton />;

  const barData: BarDatum[] = data.map((d) => ({
    quarter: formatQuarter(d.quarter),
    value: d.value,
    color: d.value >= 0 ? chartColors.teal : chartColors.coral,
  }));

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const peak = sorted[0];
  const latest = data[data.length - 1];
  const insight =
    peak && latest && peak.quarter !== latest.quarter
      ? `Growth decelerated sharply after ${formatQuarter(peak.quarter)}'s ${peak.value.toFixed(1)}% surge`
      : "Quarterly GDP Growth (%)";

  return (
    <ChartCard
      insight={insight}
      description="Q1 2025 marked a contraction driven by inventory drawdown. The subsequent recovery was unusually strong, setting a high baseline for Q4 comparisons."
      source="Source: BEA · Q4 2025"
    >
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
        layers={["grid", "axes", "bars", "markers", "legends", Q1ContractionAnnotation]}
      />
    </ChartCard>
  );
}
