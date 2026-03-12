"use client";

import { useEffect, useState } from "react";
import { ResponsiveBump } from "@nivo/bump";
import { api } from "@/lib/api";
import type { LaborRankingResponse, LaborRankingSeries } from "@/lib/types";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

interface BumpData extends LaborRankingSeries {
  [key: string]: unknown;
}

export default function UnemploymentBump() {
  const [response, setResponse] = useState<LaborRankingResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getLaborRanking()
      .then((nextResponse: LaborRankingResponse) => setResponse(nextResponse))
      .catch(() => setError(true));
  }, []);

  const data: BumpData[] = (response?.data as BumpData[] | undefined) ?? [];

  if (error) return <ChartErrorFallback title="Unemployment Ranking" height={400} />;
  if (!data.length) return <ChartCardSkeleton height={400} />;

  return (
    <ChartCard
      insight="State unemployment rankings have shifted as labor market tightened"
      provenance={response ?? undefined}
      height={400}
    >
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
