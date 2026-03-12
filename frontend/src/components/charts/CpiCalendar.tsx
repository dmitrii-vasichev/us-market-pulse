"use client";

import { useEffect, useState } from "react";
import { ResponsiveCalendar } from "@nivo/calendar";
import type { CalendarTooltipProps } from "@nivo/calendar";
import { api } from "@/lib/api";
import { nivoTheme } from "@/lib/nivo-theme";
import type { CpiCalendarItem } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

const WINDOW_SIZE = 3;
const cpiObservationFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function parseCalendarDay(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
}

function formatObservationMonth(day: string) {
  return cpiObservationFormatter.format(parseCalendarDay(day));
}

function formatComparisonMonth(day: string) {
  const date = parseCalendarDay(day);
  return cpiObservationFormatter.format(new Date(date.getFullYear() - 1, date.getMonth(), 1));
}

function CpiTooltip({ day, value, color }: CalendarTooltipProps) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) return null;

  return (
    <div
      style={{
        minWidth: 220,
        maxWidth: 240,
        background: "#171B27",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "12px 14px",
        fontSize: 12,
        color: "#E8ECF4",
        fontFamily: "DM Sans, sans-serif",
        boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "999px",
            background: color,
            boxShadow: `0 0 0 3px ${color}1A`,
          }}
        />
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#8B93A7",
          }}
        >
          CPI calendar point
        </span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, marginBottom: 10 }}>
        {formatObservationMonth(day)} observation
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 6,
        }}
      >
        <span style={{ color: "#8B93A7" }}>Annual CPI change</span>
        <strong style={{ fontSize: 16 }}>{numericValue.toFixed(2)}%</strong>
      </div>
      <div style={{ color: "#8B93A7", lineHeight: 1.5 }}>
        YoY CPI-U, all items, versus {formatComparisonMonth(day)}.
      </div>
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
      const years = d.data.map((item) => parseInt(item.day.split("-")[0], 10));
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
      horizontalOverflow="visible"
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
        tooltip={(props) => <CpiTooltip {...props} />}
      />
    </ChartCard>
  );
}
