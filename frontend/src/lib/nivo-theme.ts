import type { PartialTheme } from "@nivo/theming";

export const nivoTheme: PartialTheme = {
  text: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: 11,
    fill: "#555D73",
  },
  grid: {
    line: {
      stroke: "rgba(255,255,255,0.06)",
      strokeWidth: 1,
    },
  },
  axis: {
    ticks: {
      text: {
        fontSize: 10,
        fill: "#555D73",
      },
    },
    legend: {
      text: {
        fontSize: 11,
        fill: "#555D73",
        fontWeight: 600,
      },
    },
  },
  tooltip: {
    container: {
      background: "#252A3A",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
      border: "1px solid rgba(255,255,255,0.08)",
      fontSize: "12px",
      fontFamily: "DM Sans, sans-serif",
      color: "#E8ECF1",
    },
  },
  labels: {
    text: {
      fontSize: 11,
      fontWeight: 600,
      fill: "#E8ECF1",
    },
  },
};

export const chartColors = {
  teal:   "#2DD4A8",
  coral:  "#F97066",
  amber:  "#F5B731",
  blue:   "#60A5FA",
  purple: "#A78BFA",
  slate:  "#94A3B8",
} as const;

export const colorScheme = [
  chartColors.teal,
  chartColors.coral,
  chartColors.blue,
  chartColors.amber,
  chartColors.purple,
  chartColors.slate,
];

export const positive = "#2DD4A8";
export const negative = "#F97066";
