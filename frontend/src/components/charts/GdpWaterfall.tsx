"use client";

import { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import type { BarCustomLayerProps } from "@nivo/bar";
import type { AxisTickProps } from "@nivo/axes";
import { api } from "@/lib/api";
import { nivoTheme, chartColors } from "@/lib/nivo-theme";
import type { GdpComponentsResponse } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

type BarDatum = { id: string; value: number; color: string };

const GDP_WATERFALL_BOTTOM_MARGIN = 78;
const GDP_WATERFALL_X_AXIS_TICK_PADDING = 14;
const GDP_WATERFALL_TICK_LINE_HEIGHT = 14;

export function splitGdpWaterfallAxisLabel(label: string) {
  const words = label.split(/\s+/).filter(Boolean);

  if (words.length <= 1) return [label];

  let bestSplitIndex = 1;
  let smallestLengthDifference = Number.POSITIVE_INFINITY;

  for (let index = 1; index < words.length; index += 1) {
    const firstLine = words.slice(0, index).join(" ");
    const secondLine = words.slice(index).join(" ");
    const lengthDifference = Math.abs(firstLine.length - secondLine.length);

    if (lengthDifference < smallestLengthDifference) {
      bestSplitIndex = index;
      smallestLengthDifference = lengthDifference;
    }
  }

  return [
    words.slice(0, bestSplitIndex).join(" "),
    words.slice(bestSplitIndex).join(" "),
  ];
}

function WaterfallAxisTick({
  value,
  lineX,
  lineY,
  x,
  y,
  textX,
  textY,
  theme,
}: AxisTickProps<string>) {
  const lines = splitGdpWaterfallAxisLabel(String(value));

  return (
    <g transform={`translate(${x},${y})`}>
      <line x1={0} x2={lineX} y1={0} y2={lineY} style={theme.line} />
      <text
        transform={`translate(${textX},${textY})`}
        dominantBaseline="text-before-edge"
        textAnchor="middle"
        style={theme.text}
      >
        {lines.map((line, index) => (
          <tspan key={`${line}-${index}`} x={0} dy={index === 0 ? 0 : GDP_WATERFALL_TICK_LINE_HEIGHT}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

export function getGdpWaterfallValueScale(values: number[]) {
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 0);
  const valueRange = maxValue - minValue || 1;
  const positiveHeadroom = Math.max(maxValue * 0.08, valueRange * 0.06, 0.04);
  const negativeFootroom =
    minValue < 0
      ? Math.max(Math.abs(minValue) * 0.75, valueRange * 0.1, 0.04)
      : 0;

  return {
    type: "linear" as const,
    min: minValue < 0 ? minValue - negativeFootroom : 0,
    max: maxValue + positiveHeadroom,
    nice: false,
  };
}

// Annotation: callout on Net Exports bar
// Hidden on mobile (innerWidth < 400 ~ viewport < 640px)
function NetExportsAnnotation({ bars, innerWidth }: BarCustomLayerProps<BarDatum>) {
  if (innerWidth < 400) return null;

  const netExportsBar = bars.find(
    (b) => typeof b.data.id === "string" && b.data.id.toLowerCase().includes("net export"),
  );
  if (!netExportsBar) return null;

  const cx = netExportsBar.x + netExportsBar.width / 2;
  const barTop = netExportsBar.y;
  // Place annotation above the negative bar (pointing up from the bar top)
  const lineStartY = barTop - 4;
  const lineEndY = barTop - 22;

  return (
    <g>
      <line x1={cx} y1={lineStartY} x2={cx} y2={lineEndY} stroke="#555D73" strokeWidth={1} />
      <text x={cx} y={lineEndY - 6} textAnchor="middle" fontSize={11} fill="#555D73">
        First drag in 3 quarters
      </text>
    </g>
  );
}

export default function GdpWaterfall() {
  const [data, setData] = useState<GdpComponentsResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getGdpComponents().then(setData).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="GDP Components" />;
  if (!data) return <ChartCardSkeleton />;

  const barData: BarDatum[] = data.components.map((c) => ({
    id: c.label,
    value: c.value,
    color: c.value >= 0 ? chartColors.teal : chartColors.coral,
  }));
  const valueScale = getGdpWaterfallValueScale(barData.map((item) => item.value));

  const consumer = data.components.find((c) =>
    c.label.toLowerCase().includes("consumer") || c.label.toLowerCase().includes("personal"),
  );
  const consumerShare =
    consumer && data.total_growth !== 0
      ? Math.round((consumer.value / data.total_growth) * 100)
      : null;
  const insight = consumerShare !== null
    ? `Consumer spending drove ${consumerShare}% of Q4 growth (${data.total_growth}% total)`
    : "Consumer spending drove nearly half of Q4 growth";

  return (
    <ChartCard
      insight={insight}
      description="While overall GDP grew, the composition shifted notably: consumers led growth, while net exports dragged — the first negative contribution in 3 quarters."
      source="Source: BEA · Q4 2025"
      contextualNote="While consumers drove growth, the negative net exports contribution reflects import demand outpacing exports — typical of an accelerating domestic economy. Watch this spread as global demand shifts in 2026."
    >
      <ResponsiveBar
        data={barData}
        keys={["value"]}
        indexBy="id"
        theme={nivoTheme}
        colors={({ data }) => (data as { color: string }).color}
        margin={{ top: 10, right: 20, bottom: GDP_WATERFALL_BOTTOM_MARGIN, left: 50 }}
        padding={0.4}
        valueScale={valueScale}
        axisBottom={{
          tickSize: 0,
          tickPadding: GDP_WATERFALL_X_AXIS_TICK_PADDING,
          renderTick: WaterfallAxisTick,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          format: (v) => `${v}%`,
        }}
        labelFormat={(v) => `${Number(v).toFixed(2)}%`}
        labelTextColor="#FFFFFF"
        animate={true}
        enableGridY={true}
        layers={["grid", "bars", "axes", "markers", "legends", NetExportsAnnotation]}
      />
    </ChartCard>
  );
}
