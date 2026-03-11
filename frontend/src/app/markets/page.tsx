import RatesLine from "@/components/charts/RatesLine";
import SectorTreemap from "@/components/charts/SectorTreemap";
import SentimentRadial from "@/components/charts/SentimentRadial";
import Sp500Area from "@/components/charts/Sp500Area";
import GdpWaffle from "@/components/charts/GdpWaffle";

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <RatesLine />
        </div>
        <SectorTreemap />
        <SentimentRadial />
        <Sp500Area />
        <GdpWaffle />
      </div>
    </div>
  );
}
