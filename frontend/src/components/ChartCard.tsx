"use client";

import { useState, useRef, useEffect } from "react";

interface ChartCardProps {
  insight: string;
  subtitle?: string;
  description?: string;
  source?: string;
  height?: number;
  animationClass?: string;
  contextualNote?: string;
  children: React.ReactNode;
}

export default function ChartCard({
  insight,
  subtitle,
  description,
  source,
  height = 300,
  animationClass,
  contextualNote,
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

  return (
    <div className={`bg-[#1A1D27] rounded-2xl border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:bg-[#22263A]${animationClass ? ` animate-fade-in-up ${animationClass}` : ""}`}>
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
      <div className="overflow-x-auto -mx-1">
        <div style={{ height, minWidth: "280px" }} className="relative px-1">
          {children}
        </div>
      </div>
      {source && (
        <p className="text-[10px] text-[#555D73] mt-3">
          {source}
        </p>
      )}
    </div>
  );
}
