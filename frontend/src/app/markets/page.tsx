import type { Metadata } from "next";
import dynamic from "next/dynamic";
import KeyTakeaways from "@/components/KeyTakeaways";
import ChartCardSkeleton from "@/components/ChartCardSkeleton";
import LazyChartWrapper from "@/components/LazyChartWrapper";

const NarrativeHeaderMarkets = dynamic(
  () => import("@/components/NarrativeHeaderMarkets"),
);

export const metadata: Metadata = {
  title: "Markets & Sectors",
  description:
    "US market data: interest rates, S&P 500 trends, GDP sector breakdown, and economic sentiment analysis.",
};

const RatesLine = dynamic(
  () => import("@/components/charts/RatesLine"),
  { loading: () => <ChartCardSkeleton height={350} /> },
);
const SectorTreemap = dynamic(
  () => import("@/components/charts/SectorTreemap"),
  { loading: () => <ChartCardSkeleton height={400} /> },
);
const SentimentRadial = dynamic(
  () => import("@/components/charts/SentimentRadial"),
  { loading: () => <ChartCardSkeleton /> },
);
const Sp500Area = dynamic(
  () => import("@/components/charts/Sp500Area"),
  { loading: () => <ChartCardSkeleton height={350} /> },
);
const GdpWaffle = dynamic(
  () => import("@/components/charts/GdpWaffle"),
  { loading: () => <ChartCardSkeleton /> },
);

const marketsTakeaways = [
  "The Fed's rate pause is signaling confidence in disinflation progress.",
  "S&P 500 valuations remain elevated at 22x forward earnings — above 15-year average of 17x.",
  "The yield curve remains partially inverted — historically a recession signal with 12–18 month lag.",
  "Consumer sentiment recovery is incomplete — still 8% below 2021 peak.",
];

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      <NarrativeHeaderMarkets />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First chart: eager (above fold) */}
        <div className="lg:col-span-2 animate-fade-in-up animate-delay-100">
          <LazyChartWrapper eager height={350}><RatesLine /></LazyChartWrapper>
        </div>
        {/* Below fold: lazy */}
        <div className="animate-fade-in-up animate-delay-200"><LazyChartWrapper height={400}><SectorTreemap /></LazyChartWrapper></div>
        <div className="animate-fade-in-up animate-delay-250"><LazyChartWrapper><SentimentRadial /></LazyChartWrapper></div>
        <div className="animate-fade-in-up animate-delay-300"><LazyChartWrapper height={350}><Sp500Area /></LazyChartWrapper></div>
        <div className="animate-fade-in-up animate-delay-350"><LazyChartWrapper><GdpWaffle /></LazyChartWrapper></div>
      </div>

      <KeyTakeaways takeaways={marketsTakeaways} />
    </div>
  );
}
