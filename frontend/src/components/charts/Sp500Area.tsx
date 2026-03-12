"use client";

import { useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { SeriesDataResponse } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

export default function Sp500Area() {
  const [data, setData] = useState<SeriesDataResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getSeriesData("SP500").then(setData).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="S&P 500" height={350} />;
  if (!data) return <ChartCardSkeleton height={350} />;

  // Downsample for performance (take every Nth point)
  const step = Math.max(1, Math.floor(data.data.length / 200));
  const sampled = data.data.filter((_, i) => i % step === 0);

  const lineData = [
    {
      id: "S&P 500",
      data: sampled.map((d) => ({ x: d.date, y: d.value })),
    },
  ];

  const latest = sampled[sampled.length - 1];
  const first = sampled[0];
  const ytdReturn =
    latest && first && first.value
      ? (((latest.value - first.value) / first.value) * 100).toFixed(1)
      : null;
  const insight = ytdReturn
    ? `S&P 500 returned ${ytdReturn}% YTD — back to pre-2022 highs despite rate headwinds`
    : "S&P 500 has returned to pre-2022 highs despite rate headwinds";

  return (
    <ChartCard insight={insight} provenance={data} height={350}>
      <ResponsiveLine
        data={lineData}
        theme={nivoTheme}
        colors={[chartColors.blue]}
        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: "auto", max: "auto" }}
        axisBottom={{
          tickSize: 0,
          tickPadding: 8,
          tickValues: 6,
          format: (v: string) => {
            const d = new Date(v + "T00:00:00");
            return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          },
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          format: (v) => `${(Number(v) / 1000).toFixed(1)}K`,
        }}
        pointSize={0}
        lineWidth={1.5}
        enableArea={true}
        areaOpacity={0.1}
        useMesh={true}
        animate={true}
      />
    </ChartCard>
  );
}
