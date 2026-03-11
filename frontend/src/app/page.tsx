import KpiStrip from "@/components/KpiStrip";
import GdpWaterfall from "@/components/charts/GdpWaterfall";
import GdpQuarterly from "@/components/charts/GdpQuarterly";
import CpiCalendar from "@/components/charts/CpiCalendar";
import EconomicFunnel from "@/components/charts/EconomicFunnel";
import BulletTargets from "@/components/charts/BulletTargets";
import GdpWaffle from "@/components/charts/GdpWaffle";

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
