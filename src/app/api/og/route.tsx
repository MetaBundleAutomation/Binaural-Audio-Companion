import { siteName, description } from "@/config";
import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          color: "#1A2332",
          background: "linear-gradient(135deg, #F5F7FA 0%, #E2E8F0 100%)",
          width: "100%",
          height: "100%",
          padding: "60px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: "#2B6B7F", marginBottom: 20 }}>
          {siteName}
        </div>
        <div style={{ fontSize: 28, color: "#5A6B7A", maxWidth: 800 }}>
          {description}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
