"use client";

import { useEffect, useState } from "react";
import { ResponsiveFunnel } from "@nivo/funnel";
import { api } from "@/lib/api";
import { nivoTheme, colorScheme } from "@/lib/nivo-theme";
import { formatLargeNumber } from "@/lib/formatters";
import type { FunnelStage } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

export default function EconomicFunnel() {
  const [data, setData] = useState<FunnelStage[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getLaborFunnel().then((d) => setData(d.stages)).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="Economic Funnel" />;
  if (!data.length) return <ChartCardSkeleton />;

  const funnelData = data.map((s) => ({
    id: s.label,
    value: s.value,
    label: `${s.label}: $${formatLargeNumber(s.value)}`,
  }));

  return (
    <ChartCard title="Economic Funnel \u2014 GDP to Employment">
      <ResponsiveFunnel
        data={funnelData}
        theme={nivoTheme}
        colors={colorScheme}
        margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
        valueFormat={(v) => `$${formatLargeNumber(v)}`}
        labelColor="#FFFFFF"
        borderWidth={0}
        animate={true}
      />
    </ChartCard>
  );
}
