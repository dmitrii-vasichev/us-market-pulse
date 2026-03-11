import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API calls in production to avoid CORS issues
  async rewrites() {
    const apiUrl =
      process.env.API_PROXY_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },

  // Security and performance headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
