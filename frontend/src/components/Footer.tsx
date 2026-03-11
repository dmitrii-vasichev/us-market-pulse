export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <p className="text-xs text-text-muted text-center">
          Data sourced from{" "}
          <a
            href="https://fred.stlouisfed.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue hover:underline"
          >
            FRED (Federal Reserve Economic Data)
          </a>
          . Updated daily. For informational purposes only.
        </p>
      </div>
    </footer>
  );
}
