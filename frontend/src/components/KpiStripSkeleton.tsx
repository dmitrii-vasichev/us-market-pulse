export default function KpiStripSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#1A1D27] rounded-2xl border border-white/[0.06] p-5 animate-pulse">
          <div className="h-2.5 bg-[#252A3A] rounded w-20 mb-3" />
          <div className="flex items-end justify-between gap-3">
            <div className="h-9 bg-[#252A3A] rounded w-24" />
            <div className="w-[80px] h-[32px] bg-[#252A3A] rounded" />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="h-3 bg-[#252A3A] rounded w-10" />
            <div className="h-2.5 bg-[#252A3A] rounded w-14" />
          </div>
          <div className="h-2.5 bg-[#252A3A] rounded w-36 mt-2" />
        </div>
      ))}
    </div>
  );
}
