import dynamic from "next/dynamic";
import KpiStrip from "@/components/KpiStrip";
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
    </div>
  );
}
