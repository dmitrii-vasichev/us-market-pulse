"use client";

import type { KpiItem } from "@/lib/types";
import { formatKpiValue, formatPercent } from "@/lib/formatters";
import Sparkline from "./Sparkline";
import { useCountUp } from "@/hooks/useCountUp";

interface KpiCardProps {
  kpi: KpiItem;
  microContext?: string;
}

export default function KpiCard({ kpi, microContext }: KpiCardProps) {
  const isPositive = kpi.change_percent >= 0;
  const isGood = kpi.positive_is_good ? isPositive : !isPositive;
  const color = isGood ? "#2DD4A8" : "#F97066";
  const neutralColor = "#94A3B8";
  const displayColor = kpi.change_percent === 0 ? neutralColor : color;

  const animatedValue = useCountUp(kpi.current_value, 1200);

  return (
    <div className="bg-[#1A1D27] rounded-2xl border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:bg-[#22263A]">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555D73] mb-2">
        {kpi.label}
      </p>
      <div className="flex items-end justify-between gap-3">
        <p className="text-[36px] font-semibold text-[#E8ECF1] leading-none tabular-nums font-mono">
          {formatKpiValue(animatedValue, kpi.format)}
        </p>
        <Sparkline data={kpi.sparkline} color={displayColor} />
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[13px] font-medium" style={{ color: displayColor }}>
          {isPositive ? "\u2191" : "\u2193"}{" "}
          {formatPercent(kpi.change_percent)}
        </span>
        <span className="text-[10px] text-[#555D73]">{kpi.period_label}</span>
      </div>
      {microContext && (
        <p className="text-[11px] text-[#8B93A7] mt-2 leading-snug">
          {microContext}
        </p>
      )}
    </div>
  );
}
