import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://us-market-pulse-kappa.vercel.app").trim();

export const metadata: Metadata = {
  title: {
    default: "US Market Pulse — Economy & Market Dashboard",
    template: "%s | US Market Pulse",
  },
  description:
    "Interactive dashboard visualizing key US economic indicators — GDP, CPI, unemployment, interest rates, S&P 500, and more. Updated daily from FRED, BLS, and Census APIs.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "US Market Pulse — Economy & Market Dashboard",
    description:
      "Interactive dashboard with 14+ chart types visualizing US economic indicators. Updated daily.",
    url: siteUrl,
    siteName: "US Market Pulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "US Market Pulse — Economy & Market Dashboard",
    description:
      "Interactive dashboard with 14+ chart types visualizing US economic indicators.",
  },
  alternates: {
    canonical: siteUrl,
  },
  other: {
    "theme-color": "#2DD4A8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
