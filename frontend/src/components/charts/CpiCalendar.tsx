"use client";

import { useEffect, useState } from "react";
import { ResponsiveCalendar } from "@nivo/calendar";
import { api } from "@/lib/api";
import { nivoTheme } from "@/lib/nivo-theme";
import type { CpiCalendarItem } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

const WINDOW_SIZE = 3;

function CpiTooltip({ day, value }: { day: string; value: number }) {
  return (
    <div
      style={{
        background: "#1A1F2E",
        border: "1px solid #2A2F3E",
        borderRadius: 6,
        padding: "6px 10px",
        fontSize: 12,
        color: "#E8ECF4",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <span style={{ color: "#6B7280" }}>{day}: </span>
      <strong>CPI MoM: {value.toFixed(2)}%</strong>
    </div>
  );
}

export default function CpiCalendar() {
  const [data, setData] = useState<CpiCalendarItem[]>([]);
  const [error, setError] = useState(false);
  const [windowEnd, setWindowEnd] = useState<number | null>(null);

  useEffect(() => {
    api.getCpiCalendar().then((d) => {
      setData(d.data);
      const years = d.data.map((item) => new Date(item.day).getFullYear());
      const maxYear = Math.max(...years);
      setWindowEnd(maxYear);
    }).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="CPI Inflation Calendar" height={200} />;
  if (!data.length || windowEnd === null) return <ChartCardSkeleton height={200} />;

  // Parse day strings in local time to avoid UTC midnight → prev-day timezone shift
  const localYear = (day: string) => {
    const [y] = day.split("-").map(Number);
    return y;
  };

  const allYears = [...new Set(data.map((d) => localYear(d.day)))].sort((a, b) => a - b);
  const minYear = allYears[0];
  const maxYear = allYears[allYears.length - 1];

  const windowStart = windowEnd - WINDOW_SIZE + 1;
  const canPrev = windowStart > minYear;
  const canNext = windowEnd < maxYear;

  const visibleData = data.filter((d) => {
    const year = localYear(d.day);
    return year >= windowStart && year <= windowEnd;
  });

  // Use Date constructor with (year, month, day) to stay in local time — avoids UTC parsing
  const from = new Date(windowStart, 0, 1);
  const to = new Date(windowEnd, 11, 31);
  const height = WINDOW_SIZE * 130 + 40;

  return (
    <ChartCard
      insight="Monthly price increases clustered in Jan–Mar seasonally — watch Q1 2026"
      source="Source: BLS · Jan 2026"
      height={height}
    >
      {/* Year navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 4,
          marginBottom: 4,
          paddingRight: 10,
        }}
      >
        <button
          onClick={() => canPrev && setWindowEnd(windowEnd - WINDOW_SIZE)}
          disabled={!canPrev}
          aria-label="Previous years"
          style={{
            background: "none",
            border: "none",
            cursor: canPrev ? "pointer" : "default",
            color: canPrev ? "#6B7280" : "#2A2F3E",
            padding: "2px 4px",
            display: "flex",
            alignItems: "center",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => { if (canPrev) (e.currentTarget as HTMLButtonElement).style.color = "#E8ECF4"; }}
          onMouseLeave={(e) => { if (canPrev) (e.currentTarget as HTMLButtonElement).style.color = "#6B7280"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontSize: 11, color: "#6B7280", fontFamily: "DM Sans, sans-serif", minWidth: 64, textAlign: "center" }}>
          {windowStart}–{windowEnd}
        </span>
        <button
          onClick={() => canNext && setWindowEnd(Math.min(windowEnd + WINDOW_SIZE, maxYear))}
          disabled={!canNext}
          aria-label="Next years"
          style={{
            background: "none",
            border: "none",
            cursor: canNext ? "pointer" : "default",
            color: canNext ? "#6B7280" : "#2A2F3E",
            padding: "2px 4px",
            display: "flex",
            alignItems: "center",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => { if (canNext) (e.currentTarget as HTMLButtonElement).style.color = "#E8ECF4"; }}
          onMouseLeave={(e) => { if (canNext) (e.currentTarget as HTMLButtonElement).style.color = "#6B7280"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <ResponsiveCalendar
        data={visibleData}
        from={from}
        to={to}
        emptyColor="#252A3A"
        colors={["#1d4037", "#2DD4A8", "#F5B731", "#F97066", "#c0392b", "#8e1a14"]}
        margin={{ top: 10, right: 10, bottom: 10, left: 30 }}
        yearSpacing={40}
        monthBorderColor="#0F1117"
        dayBorderWidth={1}
        dayBorderColor="#0F1117"
        theme={nivoTheme}
        tooltip={({ day, value }) => <CpiTooltip day={day} value={Number(value)} />}
      />
    </ChartCard>
  );
}
