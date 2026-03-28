import { siteName, description } from "@/config";
import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          color: "#3e2723",
          background: "linear-gradient(135deg, #F7F5E6 0%, #E8DCC8 100%)",
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
        <div style={{ fontSize: 72, fontWeight: 700, color: "#A8B400", marginBottom: 20 }}>
          {siteName}
        </div>
        <div style={{ fontSize: 28, color: "#6d4c41", maxWidth: 800 }}>
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
