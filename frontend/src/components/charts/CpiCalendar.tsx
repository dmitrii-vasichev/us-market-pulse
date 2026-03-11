"use client";

import { useEffect, useState } from "react";
import { ResponsiveCalendar } from "@nivo/calendar";
import { api } from "@/lib/api";
import { nivoTheme } from "@/lib/nivo-theme";
import type { CpiCalendarItem } from "@/lib/types";
import ChartCard from "../ChartCard";
import ChartCardSkeleton from "../ChartCardSkeleton";
import ChartErrorFallback from "../ChartErrorFallback";

export default function CpiCalendar() {
  const [data, setData] = useState<CpiCalendarItem[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getCpiCalendar().then((d) => setData(d.data)).catch(() => setError(true));
  }, []);

  if (error) return <ChartErrorFallback title="CPI Inflation Calendar" height={200} />;
  if (!data.length) return <ChartCardSkeleton height={200} />;

  const years = data.map((d) => new Date(d.day).getFullYear());
  const uniqueYears = [...new Set(years)];
  const from = `${Math.min(...years)}-01-01`;
  const to = `${Math.max(...years)}-12-31`;
  // ~130px per year row + 40px for margins/legend
  const height = uniqueYears.length * 130 + 40;

  return (
    <ChartCard insight="CPI Inflation (YoY %)" height={height}>
      <ResponsiveCalendar
        data={data}
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
      />
    </ChartCard>
  );
}
