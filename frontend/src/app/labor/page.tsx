import UnemploymentBump from "@/components/charts/UnemploymentBump";
import CpiHeatmap from "@/components/charts/CpiHeatmap";
import StateScatter from "@/components/charts/StateScatter";
import EconomicFunnel from "@/components/charts/EconomicFunnel";
import CpiCalendar from "@/components/charts/CpiCalendar";

export default function LaborPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <UnemploymentBump />
        </div>
        <CpiHeatmap />
        <StateScatter />
        <EconomicFunnel />
        <CpiCalendar />
      </div>
    </div>
  );
}
