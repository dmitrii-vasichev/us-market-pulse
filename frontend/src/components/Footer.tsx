export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#1A1D27] mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Methodology */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555D73] mb-2">
              Data Methodology
            </p>
            <p className="text-[12px] text-[#8B93A7] leading-relaxed">
              Data sourced from BEA, BLS, and FRED via public APIs. Updated quarterly for GDP, monthly for employment and inflation indicators.
            </p>
          </div>

          {/* About */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555D73] mb-2">
              About
            </p>
            <p className="text-[12px] text-[#8B93A7] leading-relaxed">
              Built as a portfolio project to demonstrate data analytics, visualization, and economic storytelling skills using Next.js and Nivo charts.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555D73] mb-2">
              Links
            </p>
            <div className="flex flex-col gap-1.5">
              <a
                href="https://fred.stlouisfed.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-[#8B93A7] hover:text-[#2DD4A8] transition-colors"
              >
                FRED Economic Data
              </a>
              <a
                href="#"
                className="text-[12px] text-[#8B93A7] hover:text-[#2DD4A8] transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-[12px] text-[#8B93A7] hover:text-[#2DD4A8] transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          <p className="text-[11px] text-[#555D73] text-center">
            Built by DK · 2026 · For informational purposes only
          </p>
        </div>
      </div>
    </footer>
  );
}
