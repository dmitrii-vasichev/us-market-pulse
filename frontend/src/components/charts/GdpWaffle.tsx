"use client";

import { useEffect, useState } from "react";
import { ResponsiveWaffle } from "@nivo/waffle";
import { api } from "@/lib/api";
import { nivoTheme, colorScheme } from "@/lib/nivo-theme";
import type { TreeNode } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

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
  const [data, setData] = useState<{ id: string; label: string; value: number }[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getSectorsGdp().then((d) => setData(flattenTree(d.tree))).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="GDP by Sector" />;
  if (!data.length) return <ChartCardSkeleton />;

  const services = data.find((d) => d.id.toLowerCase().includes("service"));
  const insight = services
    ? `Services sectors dominate at ${services.value.toFixed(0)}% of GDP; manufacturing leads goods`
    : "Services sectors dominate at 78% of GDP; manufacturing at 11%";

  return (
    <ChartCard insight={insight} source="Source: BEA · Q4 2025">
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
