"use client";

import { useEffect, useState } from "react";
import { ResponsiveWaffle } from "@nivo/waffle";
import { api } from "@/lib/api";
import { nivoTheme, colorScheme } from "@/lib/nivo-theme";
import type { SectorsGdpResponse, TreeNode } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";
import ChartUnavailableState from "../ChartUnavailableState";

function flattenTree(node: TreeNode): { id: string; label: string; value: number }[] {
  if (node.children) {
    return node.children.map((child) => ({
      id: child.name,
      label: child.name,
      value: child.children
        ? child.children.reduce((sum, c) => sum + (c.value || 0), 0)
        : child.value || 0,
    }));
  }
  return [];
}

export default function GdpWaffle() {
  const [response, setResponse] = useState<SectorsGdpResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getSectorsGdp().then(setResponse).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="GDP by Sector" />;
  if (!response) return <ChartCardSkeleton />;
  if (response.methodology_type === "illustrative") {
    return (
      <ChartUnavailableState
        insight="Services sectors dominate at 78% of GDP; manufacturing leads goods"
        provenance={response}
        reason="This GDP waffle is temporarily unavailable while we replace an illustrative sector share tree with a source-backed sector dataset."
      />
    );
  }

  const data = response ? flattenTree(response.tree) : [];
  if (!data.length) return <ChartCardSkeleton />;

  const services = data.find((d) => d.id.toLowerCase().includes("service"));
  const insight = services
    ? `Services sectors dominate at ${services.value.toFixed(0)}% of GDP; manufacturing leads goods`
    : "Services sectors dominate at 78% of GDP; manufacturing at 11%";

  return (
    <ChartCard
      insight={insight}
      provenance={response}
    >
      <ResponsiveWaffle
        data={data}
        total={100}
        rows={10}
        columns={10}
        theme={nivoTheme}
        colors={colorScheme}
        margin={{ top: 10, right: 120, bottom: 10, left: 10 }}
        borderRadius={3}
        borderWidth={1}
        borderColor="#1A1D27"
        animate={true}
        legends={[
          {
            anchor: "right",
            direction: "column",
            translateX: 110,
            itemWidth: 100,
            itemHeight: 18,
            itemsSpacing: 4,
            symbolSize: 12,
            symbolShape: "square",
          },
        ]}
      />
    </ChartCard>
  );
}
