"use client";

import { useEffect, useState } from "react";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { StatesComparisonResponse, StatesGroup } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

export default function StateScatter() {
  const [response, setResponse] = useState<StatesComparisonResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getStatesComparison().then(setResponse).catch(() => setError(true));
  }, []);

  const data: StatesGroup[] = response?.data ?? [];

  if (error) return <ChartErrorFallback title="States Comparison" />;
  if (!data.length) return <ChartCardSkeleton />;

  // Normalize bubble sizes to a bounded pixel range to avoid invisible large hit areas
  const allSizes = data.flatMap((g) => g.data.map((pt) => (pt as { size?: number }).size ?? 1));
  const minSize = Math.min(...allSizes);
  const maxSize = Math.max(...allSizes);
  const MIN_RADIUS = 8;
  const MAX_RADIUS = 34;
  const normalizeSize = (s: number) =>
    minSize === maxSize
      ? (MIN_RADIUS + MAX_RADIUS) / 2
      : MIN_RADIUS + ((s - minSize) / (maxSize - minSize)) * (MAX_RADIUS - MIN_RADIUS);

  return (
    <ChartCard
      insight="High-wage states show lower unemployment — but the gap is narrowing"
      source={response?.source}
      contextualNote={response?.methodology_note ?? undefined}
    >
      <ResponsiveScatterPlot
        data={data}
        theme={nivoTheme}
        margin={{ top: 70, right: 20, bottom: 50, left: 70 }}
        xScale={{ type: "linear", min: "auto", max: "auto" }}
        yScale={{ type: "linear", min: "auto", max: "auto" }}
        nodeSize={(d) => normalizeSize((d.data as { size?: number }).size ?? 1)}
        colors={[chartColors.blue]}
        axisBottom={{
          tickSize: 0,
          tickPadding: 8,
          legend: "Unemployment Rate (%)",
          legendPosition: "middle",
          legendOffset: 40,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          legend: "GDP per Capita ($K)",
          legendPosition: "middle",
          legendOffset: -55,
          format: (v) => `$${Number(v) / 1000}K`,
        }}
        tooltip={({ node }) => {
          const d = node.data as { label?: string; x: number; y: number };
          return (
            <div className="bg-[#252A3A] px-3 py-2 rounded-xl shadow-md border border-white/[0.08] text-xs text-[#E8ECF1]">
              <strong>{d.label || "State"}</strong>
              <br />
              Unemployment: {d.x}% | GDP/cap: ${(d.y / 1000).toFixed(0)}K
            </div>
          );
        }}
        useMesh={false}
        animate={true}
      />
    </ChartCard>
  );
}
