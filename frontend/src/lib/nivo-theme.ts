import type { PartialTheme } from "@nivo/theming";

export const nivoTheme: PartialTheme = {
  text: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: 11,
    fill: "#6B7280",
  },
  grid: {
    line: {
      stroke: "#F3F4F6",
      strokeWidth: 1,
    },
  },
  axis: {
    ticks: {
      text: {
        fontSize: 10,
        fill: "#9CA3AF",
      },
    },
    legend: {
      text: {
        fontSize: 11,
        fill: "#6B7280",
        fontWeight: 600,
      },
    },
  },
  tooltip: {
    container: {
      background: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      border: "1px solid #F3F4F6",
      fontSize: "12px",
      fontFamily: "DM Sans, sans-serif",
    },
  },
  labels: {
    text: {
      fontSize: 11,
      fontWeight: 600,
    },
  },
};

export const chartColors = {
  blue: "#3B82F6",
  green: "#10B981",
  red: "#EF4444",
  amber: "#F59E0B",
  purple: "#8B5CF6",
  pink: "#EC4899",
  orange: "#F97316",
} as const;

export const colorScheme = [
  chartColors.blue,
  chartColors.green,
  chartColors.purple,
  chartColors.amber,
  chartColors.pink,
  chartColors.orange,
  chartColors.red,
];
