import dynamic from "next/dynamic";
import KpiStrip from "@/components/KpiStrip";
import KeyTakeaways from "@/components/KeyTakeaways";
import ChartCardSkeleton from "@/components/ChartCardSkeleton";

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GdpWaterfall />
        <GdpQuarterly />
        <CpiCalendar />
        <EconomicFunnel />
        <BulletTargets />
        <GdpWaffle />
      </div>

      <KeyTakeaways takeaways={overviewTakeaways} />
    </div>
  );
}
