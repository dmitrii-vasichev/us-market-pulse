interface ChartCardSkeletonProps {
  height?: number;
}

export default function ChartCardSkeleton({ height = 300 }: ChartCardSkeletonProps) {
  return (
    <div className="bg-white rounded-2xl border border-card-border shadow-sm p-5">
      {/* Title skeleton */}
      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-4" />
      {/* Chart area skeleton */}
      <div
        style={{ height }}
        className="animate-pulse rounded-lg bg-gray-100 flex flex-col justify-end px-4 pb-4 gap-2"
      >
        {/* Simulated bar chart lines */}
        <div className="flex items-end gap-3 h-3/4">
          <div className="flex-1 bg-gray-200 rounded-t h-[60%]" />
          <div className="flex-1 bg-gray-200 rounded-t h-[80%]" />
          <div className="flex-1 bg-gray-200 rounded-t h-[45%]" />
          <div className="flex-1 bg-gray-200 rounded-t h-[70%]" />
          <div className="flex-1 bg-gray-200 rounded-t h-[55%]" />
          <div className="flex-1 bg-gray-200 rounded-t h-[90%]" />
        </div>
        {/* X-axis skeleton */}
        <div className="flex gap-3">
          <div className="flex-1 h-2 bg-gray-200 rounded" />
          <div className="flex-1 h-2 bg-gray-200 rounded" />
          <div className="flex-1 h-2 bg-gray-200 rounded" />
          <div className="flex-1 h-2 bg-gray-200 rounded" />
          <div className="flex-1 h-2 bg-gray-200 rounded" />
          <div className="flex-1 h-2 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
