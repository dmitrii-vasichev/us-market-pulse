"use client";

import { useEffect, useState } from "react";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { api } from "@/lib/api";
import { nivoTheme, colorScheme } from "@/lib/nivo-theme";
import type { TreeNode } from "@/lib/types";
import ChartCard from "../ChartCard";

export default function SectorTreemap() {
  const [data, setData] = useState<TreeNode | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getSectorsGdp().then((d) => setData(d.tree)).catch(() => setError(true));
  }, []);

  if (error) return <ChartCard title="GDP by Sector" height={400}><p className="text-sm text-accent-red">Failed to load</p></ChartCard>;
  if (!data) return <ChartCard title="GDP by Sector" height={400}><div className="animate-pulse h-full bg-gray-100 rounded-lg" /></ChartCard>;

  return (
    <ChartCard title="US GDP Composition by Sector" height={400}>
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
        borderColor="#FFFFFF"
        animate={true}
      />
    </ChartCard>
  );
}
