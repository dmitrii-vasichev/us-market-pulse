"use client";

import { useInView } from "@/hooks/useInView";
import ChartCardSkeleton from "./ChartCardSkeleton";

interface LazyChartWrapperProps {
  children: React.ReactNode;
  height?: number;
  /** If true, renders immediately without lazy-loading (for above-fold charts) */
  eager?: boolean;
}

/**
 * Defers rendering of chart children until the wrapper enters the viewport.
 * Shows ChartCardSkeleton until visible. Once in view, never hides again.
 * Pass eager={true} for above-fold charts that should load immediately.
 */
export default function LazyChartWrapper({
  children,
  height = 300,
  eager = false,
}: LazyChartWrapperProps) {
  const [ref, inView] = useInView("100px");

  if (eager) return <>{children}</>;

  return (
    <div ref={ref}>
      {inView ? children : <ChartCardSkeleton height={height} />}
    </div>
  );
}
