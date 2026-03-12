"use client";

import { useEffect, useState } from "react";
import { ResponsiveFunnel } from "@nivo/funnel";
import { api } from "@/lib/api";
import { nivoTheme, colorScheme } from "@/lib/nivo-theme";
import { formatLargeNumber } from "@/lib/formatters";
import type { FunnelStage, LaborFunnelResponse } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

export default function EconomicFunnel() {
  const [response, setResponse] = useState<LaborFunnelResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getLaborFunnel().then(setResponse).catch(() => setError(true));
  }, []);

  const data: FunnelStage[] = response?.stages ?? [];

  if (error) return <ChartErrorFallback title="Economic Funnel" />;
  if (!data.length) return <ChartCardSkeleton />;

  const funnelData = data.map((s) => ({
    id: s.label,
    value: s.value,
    label: `${s.label}: $${formatLargeNumber(s.value)}`,
  }));

  const gdpStage = data.find((s) => s.label.toLowerCase().includes("gdp"));
  const compStage = data.find((s) => s.label.toLowerCase().includes("comp") || s.label.toLowerCase().includes("wage"));
  const insight =
    gdpStage && compStage
      ? `Each dollar of GDP generates $${(compStage.value / gdpStage.value).toFixed(2)} in worker compensation`
      : "Each dollar of GDP generates $0.19 in worker compensation";

  return (
    <ChartCard
      insight={insight}
      description="Consumer spending accounts for ~70% of US GDP. Each $1 of GDP flows through GNI to compensation, supporting the entire employed workforce."
      provenance={response ?? undefined}
      contextualNote="Each dollar of GDP flows through GNI (capturing domestic income) to employee compensation — about $0.62 per dollar. The remaining share goes to corporate profits, depreciation, and taxes, ultimately funding investment and government services."
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
