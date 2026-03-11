"use client";

import { useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { RateSeries } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";

const seriesColors: Record<string, string> = {
  "Fed Funds Rate": chartColors.blue,
  "30Y Mortgage": chartColors.purple,
  "10Y Treasury": chartColors.green,
};

export default function RatesLine() {
  const [data, setData] = useState<RateSeries[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getRatesHistory().then((d) => setData(d.series)).catch(() => setError(true));
  }, []);

  if (error) return <ChartCard title="Interest Rates" height={350}><p className="text-sm text-accent-red">Failed to load</p></ChartCard>;
  if (!data.length) return <ChartCardSkeleton height={350} />;

  return (
    <ChartCard title="Interest Rates History" height={350}>
      <ResponsiveLine
        data={data}
        theme={nivoTheme}
        colors={({ id }) => seriesColors[id as string] || chartColors.blue}
        margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
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
          format: (v) => `${v}%`,
        }}
        pointSize={0}
        lineWidth={2}
        enableArea={false}
        useMesh={true}
        legends={[
          {
            anchor: "top-left",
            direction: "row",
            translateY: -15,
            itemWidth: 120,
            itemHeight: 16,
            symbolSize: 10,
            symbolShape: "circle",
          },
        ]}
        animate={true}
      />
    </ChartCard>
  );
}
