"use client";

import { useEffect, useState } from "react";
import { ResponsiveFunnel } from "@nivo/funnel";
import { api } from "@/lib/api";
import { nivoTheme, colorScheme } from "@/lib/nivo-theme";
import { formatCurrency, formatLargeNumber } from "@/lib/formatters";
import type { FunnelStage, LaborFunnelResponse } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

function formatStageValue(stage: FunnelStage) {
  if (stage.unit === "billions_usd") {
    return formatCurrency(stage.value, 1);
  }

  if (stage.unit === "millions_persons") {
    return `${stage.value.toFixed(1)}M workers`;
  }

  return formatLargeNumber(stage.value);
}

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
    label: `${s.label}: ${formatStageValue(s)}`,
  }));

  const gdpStage = data.find((stage) => stage.id === "gross_domestic_product");
  const compensationStage = data.find((stage) => stage.id === "employee_compensation");
  const payrollStage = data.find((stage) => stage.id === "nonfarm_payroll_employment");
  const compensationRatio =
    gdpStage && compensationStage && gdpStage.value > 0
      ? (compensationStage.value / gdpStage.value).toFixed(2)
      : null;
  const insight = compensationRatio && payrollStage
    ? `Each dollar of GDP lines up with $${compensationRatio} in employee compensation and ${payrollStage.value.toFixed(1)}M payroll jobs`
    : "Stored GDP, income, compensation, and payroll inputs are aligned to the same quarter.";

  return (
    <ChartCard
      insight={insight}
      description="Stored GDP, GNI, compensation, and payroll inputs trace how national output becomes income, wages, and jobs in the same aligned quarter."
      provenance={response ?? undefined}
      contextualNote="GDP, GNI, and employee compensation use quarterly annual-rate dollars. The final workforce stage uses the latest PAYEMS month inside that same quarter and converts thousands of persons into millions for display."
    >
      <ResponsiveFunnel
        data={funnelData}
        theme={nivoTheme}
        colors={colorScheme}
        margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
        labelColor="#FFFFFF"
        borderWidth={0}
        animate={true}
      />
    </ChartCard>
  );
}
