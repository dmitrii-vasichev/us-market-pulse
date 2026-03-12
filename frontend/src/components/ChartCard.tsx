"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";

import type { ProvenanceFields } from "@/lib/types";

import ProvenanceBadge from "./ProvenanceBadge";

interface ChartCardProps {
  insight: string;
  subtitle?: string;
  description?: string;
  provenance?: ProvenanceFields;
  source?: string;
  height?: number;
  animationClass?: string;
  contextualNote?: string;
  freshnessIndicator?: ReactNode;
  horizontalOverflow?: "auto" | "hidden" | "visible";
  children: React.ReactNode;
}

function getFreshnessMicrocopy(status: ProvenanceFields["freshness_status"]) {
  if (status === "stale") return "Release window lagging";
  if (status === "unknown") return "Freshness unverified";
  return null;
}

export default function ChartCard({
  insight,
  subtitle,
  description,
  provenance,
  source,
  height = 300,
  animationClass,
  contextualNote,
  freshnessIndicator,
  horizontalOverflow = "auto",
  children,
}: ChartCardProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tooltipOpen) return;

    function handleOutsideClick(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setTooltipOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setTooltipOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [tooltipOpen]);

  const overflowClassName = horizontalOverflow === "auto"
    ? "overflow-x-auto -mx-1"
    : horizontalOverflow === "hidden"
      ? "overflow-hidden"
      : "overflow-visible";
  const sourceLabel = provenance?.source ?? source;
  const methodologyNote = provenance?.methodology_note ?? null;
  const freshnessNode = freshnessIndicator ?? (
    getFreshnessMicrocopy(provenance?.freshness_status) ? (
      <span
        data-testid="chart-card-freshness"
        className="inline-flex items-center rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2 py-0.5 text-[10px] font-medium text-[#FCD34D]"
      >
        {getFreshnessMicrocopy(provenance?.freshness_status)}
      </span>
    ) : null
  );
  const hasProvenanceRow = Boolean(sourceLabel || provenance?.methodology_type || freshnessNode || methodologyNote);

  return (
    <div className={`h-full flex flex-col bg-[#1A1D27] rounded-2xl border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:bg-[#22263A]${animationClass ? ` animate-fade-in-up ${animationClass}` : ""}`}>
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {subtitle && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555D73] mb-1">
                {subtitle}
              </p>
            )}
            <h3 className="text-[14px] font-medium text-[#E8ECF1] leading-snug">
              {insight}
            </h3>
          </div>
          {contextualNote && (
            <div className="relative flex-shrink-0" ref={tooltipRef}>
              <button
                onClick={() => setTooltipOpen((prev) => !prev)}
                aria-label="What this means"
                aria-expanded={tooltipOpen}
                className="w-5 h-5 rounded-full border border-[#555D73] text-[#555D73] text-[10px] font-bold flex items-center justify-center hover:border-[#2DD4A8] hover:text-[#2DD4A8] transition-colors mt-0.5"
              >
                ?
              </button>
              {tooltipOpen && (
                <div
                  role="tooltip"
                  className="absolute right-0 top-7 z-10 w-64 bg-[#13161F] border border-[#2DD4A8]/30 rounded-lg p-3 shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                >
                  <p className="text-[12px] text-[#8B93A7] leading-relaxed">{contextualNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
        {description && (
          <p className="text-[12px] text-[#8B93A7] leading-relaxed mt-1.5 line-clamp-2 md:line-clamp-none">
            {description}
          </p>
        )}
      </div>
      <div
        data-testid="chart-card-scroll-container"
        className={`flex-1 min-h-0 ${overflowClassName}`}
      >
        <div
          style={{ minHeight: height, minWidth: "280px" }}
          className={`relative h-full ${horizontalOverflow === "auto" ? "px-1" : ""}`}
        >
          {children}
        </div>
      </div>
      {hasProvenanceRow && (
        <div
          data-testid="chart-card-provenance"
          className="mt-3 border-t border-white/[0.06] pt-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            {sourceLabel && (
              <p className="text-[10px] text-[#555D73]">
                {sourceLabel}
              </p>
            )}
            {provenance?.methodology_type && (
              <ProvenanceBadge methodologyType={provenance.methodology_type} />
            )}
            {freshnessNode}
          </div>
          {methodologyNote && (
            <p
              data-testid="chart-card-methodology-note"
              className="mt-1.5 text-[10px] leading-relaxed text-[#8B93A7]"
            >
              {methodologyNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
