import type { Metadata } from "next";
import dynamic from "next/dynamic";
import KpiStrip from "@/components/KpiStrip";
import KeyTakeaways from "@/components/KeyTakeaways";
import ChartCardSkeleton from "@/components/ChartCardSkeleton";
import LazyChartWrapper from "@/components/LazyChartWrapper";

export const metadata: Metadata = {
  title: "Overview — GDP, Inflation & Labor Market",
  description:
    "US economic overview: GDP growth, CPI inflation, unemployment rate, and Federal Reserve interest rates. Interactive charts updated daily.",
};

const NarrativeHeaderOverview = dynamic(
  () => import("@/components/NarrativeHeaderOverview"),
);

const GdpWaterfall = dynamic(
  () => import("@/components/charts/GdpWaterfall"),
  { loading: () => <ChartCardSkeleton /> },
);
const GdpQuarterly = dynamic(
  () => import("@/components/charts/GdpQuarterly"),
  { loading: () => <ChartCardSkeleton /> },
);
const CpiCalendar = dynamic(
  () => import("@/components/charts/CpiCalendar"),
  { loading: () => <ChartCardSkeleton height={820} /> },
);
const EconomicFunnel = dynamic(
  () => import("@/components/charts/EconomicFunnel"),
  { loading: () => <ChartCardSkeleton /> },
);
const BulletTargets = dynamic(
  () => import("@/components/charts/BulletTargets"),
  { loading: () => <ChartCardSkeleton height={220} /> },
);
const GdpWaffle = dynamic(
  () => import("@/components/charts/GdpWaffle"),
  { loading: () => <ChartCardSkeleton /> },
);

const overviewTakeaways = [
  "Growth is slowing — Q4's 1.4% is the lowest since Q1's contraction, signaling a cooling economy.",
  "Inflation remains sticky at 2.7% — 35% above the Fed's 2% target, limiting room for rate cuts.",
  "The labor market is the bright spot — 4.4% unemployment with steady job creation.",
  "Consumer spending resilience is the key risk variable to watch in Q1 2026.",
];

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <KpiStrip />
      <NarrativeHeaderOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First 2 charts: eager (above fold) */}
        <div className="animate-fade-in-up animate-delay-200"><LazyChartWrapper eager><GdpWaterfall /></LazyChartWrapper></div>
        <div className="animate-fade-in-up animate-delay-250"><LazyChartWrapper eager><GdpQuarterly /></LazyChartWrapper></div>
        {/* Below fold: lazy */}
        <div className="animate-fade-in-up animate-delay-300"><LazyChartWrapper height={820}><CpiCalendar /></LazyChartWrapper></div>
        <div className="animate-fade-in-up animate-delay-350"><LazyChartWrapper><EconomicFunnel /></LazyChartWrapper></div>
        <div className="animate-fade-in-up animate-delay-300"><LazyChartWrapper height={220}><BulletTargets /></LazyChartWrapper></div>
        <div className="animate-fade-in-up animate-delay-350"><LazyChartWrapper><GdpWaffle /></LazyChartWrapper></div>
      </div>

      <KeyTakeaways takeaways={overviewTakeaways} />
    </div>
  );
}
