"use client";

import { ResponsiveLine } from "@nivo/line";
import type { SparklinePoint } from "@/lib/types";

interface SparklineProps {
  data: SparklinePoint[];
  color: string;
  width?: number;
  height?: number;
}

export default function Sparkline({
  data,
  color,
  width = 80,
  height = 32,
}: SparklineProps) {
  const lineData = [
    {
      id: "sparkline",
      data: data.map((d) => ({ x: d.date, y: d.value })),
    },
  ];

  return (
    <div style={{ width, height }}>
      <ResponsiveLine
        data={lineData}
        colors={[color]}
        margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: "auto", max: "auto" }}
        enableGridX={false}
        enableGridY={false}
        enablePoints={false}
        enableArea={true}
        areaOpacity={0.1}
        lineWidth={1.5}
        isInteractive={false}
        animate={false}
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={null}
      />
    </div>
  );
}
