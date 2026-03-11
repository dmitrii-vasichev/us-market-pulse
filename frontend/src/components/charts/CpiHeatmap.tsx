"use client";

import { useEffect, useState } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { api } from "@/lib/api";
import { nivoTheme } from "@/lib/nivo-theme";
import type { CpiCategory } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

export default function CpiHeatmap() {
  const [data, setData] = useState<CpiCategory[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getCpiCategories().then((d) => setData(d.categories)).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="CPI by Category" height={300} />;
  if (!data.length) return <ChartCardSkeleton height={300} />;

  const heatmapData = data.map((cat) => ({
    id: cat.label,
    data: [{ x: "Weight (%)", y: cat.value }],
  }));

  return (
    <ChartCard insight="CPI Category Weights" height={300}>
      <ResponsiveHeatMap
        data={heatmapData}
        theme={nivoTheme}
        margin={{ top: 30, right: 30, bottom: 30, left: 120 }}
        axisTop={{
          tickSize: 0,
          tickPadding: 8,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
        }}
        colors={{
          type: "sequential",
          scheme: "oranges",
        }}
        borderRadius={4}
        borderWidth={2}
        borderColor="#1A1D27"
        labelTextColor={{ from: "color", modifiers: [["darker", 3]] }}
        animate={true}
      />
    </ChartCard>
  );
}
