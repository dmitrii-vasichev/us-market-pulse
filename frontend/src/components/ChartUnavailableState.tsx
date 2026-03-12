"use client";

import type { ProvenanceFields } from "@/lib/types";

import ChartCard from "./ChartCard";

interface ChartUnavailableStateProps {
  insight: string;
  description?: string;
  provenance?: ProvenanceFields;
  height?: number;
  reason?: string;
}

export default function ChartUnavailableState({
  insight,
  description,
  provenance,
  height = 300,
  reason = "This chart is temporarily unavailable while we replace an illustrative implementation with a source-backed dataset.",
}: ChartUnavailableStateProps) {
  return (
    <ChartCard
      insight={insight}
      description={description}
      provenance={provenance}
      height={height}
      horizontalOverflow="hidden"
    >
      <div className="flex h-full items-center justify-center">
        <div className="mx-auto w-full max-w-[260px] rounded-2xl border border-white/[0.08] bg-[#13161F] px-5 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F59E0B]/25 bg-[#F59E0B]/10 text-[18px] font-semibold text-[#FCD34D]">
            !
          </div>
          <p className="text-[13px] font-medium text-[#E8ECF1]">
            Temporarily unavailable
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-[#8B93A7]">
            {reason}
          </p>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#555D73]">
            Upgrading to source-backed methodology
          </p>
        </div>
      </div>
    </ChartCard>
  );
}
