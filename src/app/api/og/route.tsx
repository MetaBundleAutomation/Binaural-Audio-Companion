import { siteName, description } from "@/config";
import { ImageResponse } from "next/og";

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            color: "#E6EBF5",
            background: "linear-gradient(135deg, #05070F 0%, #0C1120 100%)",
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
          <div style={{ fontSize: 72, fontWeight: 700, color: "#4F8FF7", marginBottom: 20 }}>
            {siteName}
          </div>
          <div style={{ fontSize: 28, color: "#93A0B8", maxWidth: 800 }}>
            {description}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response("Failed to generate image", { status: 500 });
  }
}
