"use client";

import { useEffect, useState } from "react";
import { ResponsiveRadar } from "@nivo/radar";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { SentimentRadialResponse } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

export default function SentimentRadial() {
  const [response, setResponse] = useState<SentimentRadialResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getSentimentRadial().then(setResponse).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="Consumer Sentiment" />;
  if (!response || !response.data.length) return <ChartCardSkeleton />;

  // Transform to radar format
  const radarData = response.data[0]?.data.map((_, i) => {
    const point: Record<string, string | number> = {
      metric: response.data[0].data[i].x,
    };
    response.data.forEach((series) => {
      point[series.id] = series.data[i]?.y || 0;
    });
    return point;
  }) || [];

  const keys = response.data.map((s) => s.id);

  return (
    <ChartCard
      insight={response.current
        ? `Consumer sentiment at ${response.current} — recovering from 2022 lows`
        : "Consumer sentiment has recovered 23% from its 2022 low"}
      provenance={response}
    >
      <ResponsiveRadar
        data={radarData}
        keys={keys}
        indexBy="metric"
        theme={nivoTheme}
        colors={[chartColors.blue, chartColors.teal, chartColors.amber]}
        margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
        borderWidth={2}
        borderColor={{ from: "color" }}
        dotSize={8}
        dotColor={{ theme: "background" }}
        dotBorderWidth={2}
        dotBorderColor={{ from: "color" }}
        fillOpacity={0.15}
        blendMode="multiply"
        animate={true}
        legends={[
          {
            anchor: "top-left",
            direction: "column",
            translateX: -50,
            translateY: -30,
            itemWidth: 100,
            itemHeight: 16,
            symbolSize: 10,
            symbolShape: "circle",
          },
        ]}
      />
    </ChartCard>
  );
}
