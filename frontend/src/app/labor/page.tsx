import type { Metadata } from "next";
import dynamic from "next/dynamic";
import ChartCardSkeleton from "@/components/ChartCardSkeleton";

export const metadata: Metadata = {
  title: "Labor & Economy",
  description:
    "US labor market data: unemployment trends, CPI inflation heatmap, state-level statistics, and economic funnel analysis.",
};

const UnemploymentBump = dynamic(
  () => import("@/components/charts/UnemploymentBump"),
  { loading: () => <ChartCardSkeleton height={400} /> },
);
const CpiHeatmap = dynamic(
  () => import("@/components/charts/CpiHeatmap"),
  { loading: () => <ChartCardSkeleton /> },
);
const StateScatter = dynamic(
  () => import("@/components/charts/StateScatter"),
  { loading: () => <ChartCardSkeleton /> },
);
const EconomicFunnel = dynamic(
  () => import("@/components/charts/EconomicFunnel"),
  { loading: () => <ChartCardSkeleton /> },
);
const CpiCalendar = dynamic(
  () => import("@/components/charts/CpiCalendar"),
  { loading: () => <ChartCardSkeleton height={200} /> },
);

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
