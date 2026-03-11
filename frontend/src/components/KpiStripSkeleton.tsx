export default function KpiStripSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3 animate-pulse">
          <div className="flex-1 min-w-0">
            <div className="h-2.5 bg-gray-200 rounded w-20 mb-2.5" />
            <div className="h-7 bg-gray-200 rounded w-24 mb-2" />
            <div className="flex items-center gap-1.5 mt-1">
              <div className="h-3 bg-gray-200 rounded w-10" />
              <div className="h-2.5 bg-gray-200 rounded w-14" />
            </div>
          </div>
          <div className="w-[80px] h-[32px] bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
