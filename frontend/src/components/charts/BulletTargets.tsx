"use client";

import { useEffect, useState } from "react";
import { ResponsiveBullet } from "@nivo/bullet";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { KpiItem, KpiSummaryResponse } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

export default function BulletTargets() {
  const [response, setResponse] = useState<KpiSummaryResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getKpiSummary().then(setResponse).catch(() => setError(true));
  }, []);

  const kpis: KpiItem[] = response?.kpis ?? [];

  if (error) return <ChartErrorFallback title="KPI Targets" height={220} />;
  if (!kpis.length) return <ChartCardSkeleton height={220} />;

  const bulletData = kpis
    .filter((k) => k.target_policy)
    .map((k) => {
      const policy = k.target_policy!;
      return {
        id: k.label,
        ranges: policy.ranges,
        measures: [policy.measure],
        markers: policy.markers,
      };
    });

  const cpiPolicy = kpis.find((k) => k.key === "cpi")?.target_policy;
  const fedPolicy = kpis.find((k) => k.key === "fed_rate")?.target_policy;
  const cpiGapPercent = cpiPolicy && cpiPolicy.target !== 0
    ? Math.round(((cpiPolicy.measure / cpiPolicy.target) - 1) * 100)
    : null;
  const fedGap = fedPolicy ? fedPolicy.measure - fedPolicy.target : null;
  const policyLabels = kpis
    .flatMap((kpi) => (kpi.target_policy ? [kpi.target_policy.measure_label] : []))
    .join(", ");
  const policyNotes = kpis
    .flatMap((kpi) => (kpi.target_policy?.policy_note ? [kpi.target_policy.policy_note] : []))
    .slice(0, 2)
    .join(" ");
  const insight =
    cpiPolicy && cpiGapPercent !== null && fedPolicy && fedGap !== null
      ? `Fed funds rate is ${Math.abs(fedGap).toFixed(1)} pts ${fedGap >= 0 ? "above" : "below"} the ${fedPolicy.target.toFixed(1)}% policy target; inflation is ${Math.abs(cpiGapPercent)}% ${cpiGapPercent >= 0 ? "above" : "below"} its ${cpiPolicy.target.toFixed(1)}% goal`
      : "Stored KPI measures are benchmarked against backend-owned targets and bands.";

  return (
    <ChartCard
      insight={insight}
      description={
        policyLabels
          ? `Bullet measures are rendered from payload policy selections for ${policyLabels}.`
          : "Bullet measures are rendered from payload policy selections."
      }
      provenance={response ?? undefined}
      height={220}
      contextualNote={policyNotes || undefined}
    >
      <ResponsiveBullet
        data={bulletData}
        theme={nivoTheme}
        margin={{ top: 10, right: 30, bottom: 10, left: 120 }}
        spacing={30}
        titleOffsetX={-110}
        measureColors={[chartColors.teal]}
        markerColors={[chartColors.coral]}
        rangeColors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.07)", "rgba(255,255,255,0.10)", "rgba(255,255,255,0.14)"]}
        animate={true}
      />
    </ChartCard>
  );
}
