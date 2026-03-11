"use client";

import { useEffect, useState } from "react";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { api } from "@/lib/api";
import { nivoTheme, colorScheme } from "@/lib/nivo-theme";
import type { TreeNode } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

export default function SectorTreemap() {
  const [data, setData] = useState<TreeNode | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getSectorsGdp().then((d) => setData(d.tree)).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="GDP by Sector" height={400} />;
  if (!data) return <ChartCardSkeleton height={400} />;

  return (
    <ChartCard insight="US GDP Composition by Sector" height={400}>
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
