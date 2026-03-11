import type { Metadata } from "next";
import dynamic from "next/dynamic";
import KeyTakeaways from "@/components/KeyTakeaways";
import ChartCardSkeleton from "@/components/ChartCardSkeleton";

const NarrativeHeaderLabor = dynamic(
  () => import("@/components/NarrativeHeaderLabor"),
);

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

const laborTakeaways = [
  "Unemployment at 4.4% remains historically low — below the 5.7% post-2000 average.",
  "Wage growth is outpacing inflation for the first time since 2021, boosting real purchasing power.",
  "Labor force participation at 62.6% is still 1.2pp below pre-pandemic levels.",
  "State-level divergence is widening — top 10 states average 3.1% vs bottom 10 at 5.8%.",
];

export default function LaborPage() {
  return (
    <div className="space-y-6">
      <NarrativeHeaderLabor />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <UnemploymentBump />
        </div>
        <CpiHeatmap />
        <StateScatter />
        <EconomicFunnel />
        <CpiCalendar />
      </div>

      <KeyTakeaways takeaways={laborTakeaways} />
    </div>
  );
}
