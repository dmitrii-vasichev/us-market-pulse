"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-accent-red"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-text-secondary mb-6 max-w-md">
        {error.message || "An unexpected error occurred while loading the dashboard."}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-accent-blue text-white text-sm font-medium rounded-xl hover:bg-accent-blue/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
