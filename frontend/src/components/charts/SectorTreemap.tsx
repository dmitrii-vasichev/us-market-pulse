"use client";

import { useEffect, useState } from "react";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { api } from "@/lib/api";
import { nivoTheme, colorScheme } from "@/lib/nivo-theme";
import type { SectorsGdpResponse } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

function sumChildValues(children: { value?: number }[] | undefined): number {
  return (children ?? []).reduce((sum, child) => sum + (child.value ?? 0), 0);
}

export default function SectorTreemap() {
  const [response, setResponse] = useState<SectorsGdpResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getSectorsGdp().then(setResponse).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="GDP by Sector" height={400} />;
  if (!response) return <ChartCardSkeleton height={400} />;

  const data = response?.tree ?? null;
  if (!data?.children?.length) return <ChartCardSkeleton height={400} />;
  const topGroup = [...data.children]
    .map((child) => ({ name: child.name, value: sumChildValues(child.children) }))
    .sort((a, b) => b.value - a.value)[0];
  const topLeaf = data.children
    .flatMap((child) => child.children ?? [])
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
  const insight = topGroup && topLeaf
    ? `${topGroup.name} account for ${topGroup.value.toFixed(0)}% of GDP; ${topLeaf.name} is the largest leaf sector`
    : "Stored BEA sector shares highlight the largest contributors to current-dollar GDP";

  return (
    <ChartCard
      insight={insight}
      provenance={response}
      height={400}
    >
      <ResponsiveTreeMap
        data={data}
        identity="name"
        value="value"
        theme={nivoTheme}
        colors={colorScheme}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        labelSkipSize={30}
        labelTextColor={{ from: "color", modifiers: [["darker", 2.5]] }}
        parentLabelTextColor={{ from: "color", modifiers: [["darker", 3]] }}
        borderWidth={2}
        borderColor="#1A1D27"
        animate={true}
      />
    </ChartCard>
  );
}
