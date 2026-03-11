"use client";

import { useEffect, useState } from "react";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { StatesGroup } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

export default function StateScatter() {
  const [data, setData] = useState<StatesGroup[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getStatesComparison().then((d) => setData(d.data)).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="States Comparison" />;
  if (!data.length) return <ChartCardSkeleton />;

  return (
    <ChartCard insight="State GDP per Capita vs Unemployment">
      <ResponsiveScatterPlot
        data={data}
        theme={nivoTheme}
        margin={{ top: 20, right: 20, bottom: 50, left: 70 }}
        xScale={{ type: "linear", min: "auto", max: "auto" }}
        yScale={{ type: "linear", min: "auto", max: "auto" }}
        nodeSize={(d) => (d.data as { size?: number }).size || 10}
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
            <div className="bg-white px-3 py-2 rounded-xl shadow-md border border-gray-100 text-xs">
              <strong>{d.label || "State"}</strong>
              <br />
              Unemployment: {d.x}% | GDP/cap: ${(d.y / 1000).toFixed(0)}K
            </div>
          );
        }}
        animate={true}
      />
    </ChartCard>
  );
}
