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

  const gdpStage = data.find((s) => s.label.toLowerCase().includes("gdp"));
  const empStage = data.find((s) => s.label.toLowerCase().includes("employ") || s.label.toLowerCase().includes("worker"));
  const insight =
    gdpStage && empStage
      ? `$${formatLargeNumber(gdpStage.value)} economy \u2014 GDP to ${formatLargeNumber(empStage.value)} workers`
      : "$31.5T economy supports 160M jobs at $197/hr GDP per worker";

  return (
    <ChartCard
      insight={insight}
      description="Consumer spending accounts for ~70% of US GDP. Each $1 of GDP flows through GNI to compensation, supporting the entire employed workforce."
      source="Source: BEA, BLS · Q4 2025"
    >
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
