"use client";

import type { MethodologyType } from "@/lib/types";

interface ProvenanceBadgeProps {
  methodologyType: MethodologyType;
}

const BADGE_COPY: Record<MethodologyType, string> = {
  source_backed: "Source-backed",
  derived: "Derived",
  illustrative: "Illustrative",
};

const BADGE_TONE: Record<MethodologyType, string> = {
  source_backed: "border-[#2DD4A8]/25 bg-[#2DD4A8]/10 text-[#8EF0D1]",
  derived: "border-[#F59E0B]/25 bg-[#F59E0B]/10 text-[#FCD34D]",
  illustrative: "border-[#F87171]/25 bg-[#F87171]/10 text-[#FCA5A5]",
};

export default function ProvenanceBadge({ methodologyType }: ProvenanceBadgeProps) {
  return (
    <span
      data-testid="provenance-badge"
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.01em] ${BADGE_TONE[methodologyType]}`}
    >
      {BADGE_COPY[methodologyType]}
    </span>
  );
}
