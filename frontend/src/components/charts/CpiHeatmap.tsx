"use client";

import { useEffect, useState } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import type { DefaultHeatMapDatum } from "@nivo/heatmap";
import { api } from "@/lib/api";
import { nivoTheme } from "@/lib/nivo-theme";
import type { CpiCategory } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

type HeatmapItem = { id: string; data: DefaultHeatMapDatum[] };

interface HeatmapCell {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: { id: string };
}

// Annotation layer: callout on Shelter row
function ShelterAnnotation(props: Record<string, unknown>) {
  const cells = props.cells as HeatmapCell[] | undefined;
  const innerWidth = props.innerWidth as number | undefined;

  if (!cells || (innerWidth !== undefined && innerWidth < 400)) return null;

  const shelterCell = cells.find(
    (c) => c.data?.id?.toLowerCase().includes("shelter"),
  );
  if (!shelterCell) return null;

  const cx = shelterCell.x + shelterCell.width / 2;
  const cy = shelterCell.y;
  const lineEndX = shelterCell.x + shelterCell.width + 8;

  return (
    <g>
      <line x1={cx + shelterCell.width / 2} y1={cy} x2={lineEndX} y2={cy} stroke="#555D73" strokeWidth={1} />
      <text x={lineEndX + 4} y={cy + 4} fontSize={11} fill="#555D73">
        Shelter costs remained elevated
      </text>
    </g>
  );
}

export default function CpiHeatmap() {
  const [data, setData] = useState<CpiCategory[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getCpiCategories().then((d) => setData(d.categories)).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="CPI by Category" height={300} />;
  if (!data.length) return <ChartCardSkeleton height={300} />;

  const heatmapData: HeatmapItem[] = data.map((cat) => ({
    id: cat.label,
    data: [{ x: "Weight (%)", y: cat.value }],
  }));

  return (
    <ChartCard
      insight="Shelter costs remain the stickiest inflation driver"
      source="Source: BLS · Jan 2026"
      height={300}
    >
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
        layers={[
          "grid",
          "axes",
          "cells",
          "legends",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ShelterAnnotation as any,
        ]}
      />
    </ChartCard>
  );
}
