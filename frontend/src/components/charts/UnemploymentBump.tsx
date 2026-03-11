"use client";

import { useEffect, useState } from "react";
import { ResponsiveBump } from "@nivo/bump";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

interface BumpData {
  id: string;
  data: { x: string; y: number }[];
  [key: string]: unknown;
}

export default function UnemploymentBump() {
  const [data, setData] = useState<BumpData[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getLaborRanking().then((d) => setData(d.data as unknown as BumpData[])).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="Unemployment Ranking" height={400} />;
  if (!data.length) return <ChartCardSkeleton height={400} />;

  return (
    <ChartCard insight="State Unemployment Ranking (12 Months)" height={400}>
      <ResponsiveBump
        data={data}
        theme={nivoTheme}
        colors={({ id }) =>
          id === "Colorado" ? chartColors.teal : "#3A4055"
        }
        lineWidth={2}
        activeLineWidth={4}
        inactiveLineWidth={1}
        inactiveOpacity={0.3}
        pointSize={6}
        activePointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serie.color" }}
        margin={{ top: 20, right: 100, bottom: 40, left: 60 }}
        axisTop={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 8,
          format: (v: string) => {
            const d = new Date(v + "T00:00:00");
            return d.toLocaleDateString("en-US", { month: "short" });
          },
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
        }}
        animate={true}
      />
    </ChartCard>
  );
}
