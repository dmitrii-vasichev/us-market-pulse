import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "US Market Pulse Dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #F9FAFB 0%, #EFF6FF 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#3B82F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                d="M7 22V16h4v6H7ZM13 22V11h4v11h-4ZM19 22V8h4v14h-4Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            US Market Pulse
          </span>
        </div>
        <p
          style={{
            fontSize: "24px",
            color: "#6B7280",
            maxWidth: "700px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Interactive dashboard with 14+ chart types visualizing US economic
          indicators
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "32px",
          }}
        >
          {["GDP", "CPI", "Employment", "Rates", "S&P 500", "Sectors"].map(
            (tag) => (
              <span
                key={tag}
                style={{
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  background: "#EFF6FF",
                  color: "#3B82F6",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {tag}
              </span>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
