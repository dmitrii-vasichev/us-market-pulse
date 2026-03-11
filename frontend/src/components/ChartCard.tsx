interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  height?: number;
}

export default function ChartCard({
  title,
  children,
  height = 300,
}: ChartCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-card-border shadow-sm p-5 transition-shadow duration-200 hover:shadow-md">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-4">
        {title}
      </h3>
      <div style={{ height }}>{children}</div>
    </div>
  );
}
