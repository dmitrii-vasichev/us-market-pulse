"use client";

import { useEffect, useState } from "react";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { api } from "@/lib/api";
import { nivoTheme, colorScheme } from "@/lib/nivo-theme";
import type { SectorsGdpResponse } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";
import ChartUnavailableState from "../ChartUnavailableState";

export default function SectorTreemap() {
  const [response, setResponse] = useState<SectorsGdpResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getSectorsGdp().then(setResponse).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="GDP by Sector" height={400} />;
  if (!response) return <ChartCardSkeleton height={400} />;
  if (response.methodology_type === "illustrative") {
    return (
      <ChartUnavailableState
        insight="Services sectors dominate at 78% of GDP; manufacturing leads goods at 11%"
        provenance={response}
        height={400}
        reason="This treemap is temporarily unavailable while we replace an illustrative sector share tree with a source-backed BEA sector dataset."
      />
    );
  }

  const data = response?.tree ?? null;
  if (!data) return <ChartCardSkeleton height={400} />;

  return (
    <ChartCard
      insight="Services sectors dominate at 78% of GDP; manufacturing leads goods at 11%"
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
