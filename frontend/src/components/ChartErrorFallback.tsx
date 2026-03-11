interface ChartErrorFallbackProps {
  title: string;
  height?: number;
  onRetry?: () => void;
}

export default function ChartErrorFallback({
  title,
  height = 300,
  onRetry,
}: ChartErrorFallbackProps) {
  return (
    <div className="bg-[#1A1D27] rounded-2xl border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-5">
      <h3 className="text-[14px] font-medium text-[#E8ECF1] mb-4">
        {title}
      </h3>
      <div
        style={{ height }}
        className="flex flex-col items-center justify-center text-center"
      >
        <svg
          className="w-8 h-8 text-[#555D73] mb-3"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
        <p className="text-sm text-text-secondary mb-3">
          Failed to load data
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-medium text-[#2DD4A8] hover:text-[#2DD4A8]/80 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
