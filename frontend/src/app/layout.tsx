import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://us-market-pulse.vercel.app";

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
  other: {
    "theme-color": "#3B82F6",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased bg-gray-50 text-gray-900`}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
