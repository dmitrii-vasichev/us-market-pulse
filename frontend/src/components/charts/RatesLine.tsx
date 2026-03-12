"use client";

import { useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { RateSeries, RatesHistoryResponse } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

const seriesColors: Record<string, string> = {
  "Fed Funds Rate": chartColors.blue,
  "30Y Mortgage": chartColors.purple,
  "10Y Treasury": chartColors.teal,
};

export default function RatesLine() {
  const [response, setResponse] = useState<RatesHistoryResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getRatesHistory().then(setResponse).catch(() => setError(true));
  }, []);

  const data: RateSeries[] = response?.series ?? [];

  if (error) return <ChartErrorFallback title="Interest Rates" height={350} />;
  if (!data.length) return <ChartCardSkeleton height={350} />;

  return (
    <ChartCard
      insight="The Fed's rate hikes are transmitting into mortgage costs — watch spread compression"
      provenance={response ?? undefined}
      height={350}
    >
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
