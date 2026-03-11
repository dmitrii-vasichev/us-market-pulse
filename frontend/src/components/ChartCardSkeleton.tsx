interface ChartCardSkeletonProps {
  height?: number;
}

export default function ChartCardSkeleton({ height = 300 }: ChartCardSkeletonProps) {
  return (
    <div className="bg-[#1A1D27] rounded-2xl border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-5">
      {/* Title skeleton */}
      <div className="h-3.5 w-48 bg-[#252A3A] rounded animate-pulse mb-4" />
      {/* Chart area skeleton */}
      <div
        style={{ height }}
        className="animate-pulse rounded-lg bg-[#252A3A]/60 flex flex-col justify-end px-4 pb-4 gap-2"
      >
        {/* Simulated bar chart lines */}
        <div className="flex items-end gap-3 h-3/4">
          <div className="flex-1 bg-[#252A3A] rounded-t h-[60%]" />
          <div className="flex-1 bg-[#252A3A] rounded-t h-[80%]" />
          <div className="flex-1 bg-[#252A3A] rounded-t h-[45%]" />
          <div className="flex-1 bg-[#252A3A] rounded-t h-[70%]" />
          <div className="flex-1 bg-[#252A3A] rounded-t h-[55%]" />
          <div className="flex-1 bg-[#252A3A] rounded-t h-[90%]" />
        </div>
        {/* X-axis skeleton */}
        <div className="flex gap-3">
          <div className="flex-1 h-2 bg-[#252A3A] rounded" />
          <div className="flex-1 h-2 bg-[#252A3A] rounded" />
          <div className="flex-1 h-2 bg-[#252A3A] rounded" />
          <div className="flex-1 h-2 bg-[#252A3A] rounded" />
          <div className="flex-1 h-2 bg-[#252A3A] rounded" />
          <div className="flex-1 h-2 bg-[#252A3A] rounded" />
        </div>
      </div>
    </div>
  );
}
