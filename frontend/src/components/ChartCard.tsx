interface ChartCardProps {
  insight: string;
  subtitle?: string;
  source?: string;
  height?: number;
  children: React.ReactNode;
}

export default function ChartCard({
  insight,
  subtitle,
  source,
  height = 300,
  children,
}: ChartCardProps) {
  return (
    <div className="bg-[#1A1D27] rounded-2xl border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:bg-[#22263A]">
      <div className="mb-4">
        {subtitle && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555D73] mb-1">
            {subtitle}
          </p>
        )}
        <h3 className="text-[14px] font-medium text-[#E8ECF1] leading-snug">
          {insight}
        </h3>
      </div>
      <div style={{ height }} className="relative">
        {children}
      </div>
      {source && (
        <p className="text-[10px] text-[#555D73] mt-3">
          {source}
        </p>
      )}
    </div>
  );
}
