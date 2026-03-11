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
    <div className="bg-white rounded-2xl border border-card-border shadow-sm p-5">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-4">
        {title}
      </h3>
      <div
        style={{ height }}
        className="flex flex-col items-center justify-center text-center"
      >
        <svg
          className="w-8 h-8 text-gray-300 mb-3"
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
            className="text-xs font-medium text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
