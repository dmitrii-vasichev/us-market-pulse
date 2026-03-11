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
import ContextualSidebar from "../ContextualSidebar";

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
  const compStage = data.find((s) => s.label.toLowerCase().includes("comp") || s.label.toLowerCase().includes("wage"));
  const insight =
    gdpStage && compStage
      ? `Each dollar of GDP generates $${(compStage.value / gdpStage.value).toFixed(2)} in worker compensation`
      : "Each dollar of GDP generates $0.19 in worker compensation";

  return (
    <div>
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
      <ContextualSidebar content="Each dollar of GDP flows through GNI (capturing domestic income) to employee compensation — about $0.62 per dollar. The remaining share goes to corporate profits, depreciation, and taxes, ultimately funding investment and government services." />
    </div>
  );
}
