import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
        <span className="text-2xl font-bold text-text-muted">404</span>
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">
        Page not found
      </h2>
      <p className="text-sm text-text-secondary mb-6 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-accent-blue text-white text-sm font-medium rounded-xl hover:bg-accent-blue/90 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
