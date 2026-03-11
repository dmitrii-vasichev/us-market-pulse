"use client";

import type { KpiItem } from "@/lib/types";
import { formatKpiValue, formatPercent } from "@/lib/formatters";
import Sparkline from "./Sparkline";

interface KpiCardProps {
  kpi: KpiItem;
}

export default function KpiCard({ kpi }: KpiCardProps) {
  const isPositive = kpi.change_percent >= 0;
  const isGood = kpi.positive_is_good ? isPositive : !isPositive;
  const color = isGood ? "#10B981" : "#EF4444";
  const neutralColor = "#F59E0B";
  const displayColor = kpi.change_percent === 0 ? neutralColor : color;

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {kpi.label}
        </p>
        <p className="text-[28px] font-bold text-text-primary leading-tight mt-0.5">
          {formatKpiValue(kpi.current_value, kpi.format)}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className="text-xs font-medium"
            style={{ color: displayColor }}
          >
            {isPositive ? "\u2191" : "\u2193"}{" "}
            {formatPercent(kpi.change_percent)}
          </span>
          <span className="text-[10px] text-text-muted">{kpi.period_label}</span>
        </div>
      </div>
      <Sparkline data={kpi.sparkline} color={displayColor} />
    </div>
  );
}
