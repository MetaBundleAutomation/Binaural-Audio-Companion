import { siteName, description } from "@/config";
import { ImageResponse } from "next/og";

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            color: "#F5F8FA",
            background: "linear-gradient(135deg, #0D1418 0%, #212B32 100%)",
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
          <div style={{ fontSize: 60, lineHeight: 1.1, fontWeight: 700, color: "#00D084", marginBottom: 28, maxWidth: 1000, textAlign: "center" }}>
            {siteName}
          </div>
          <div style={{ fontSize: 28, color: "#C5CED5", maxWidth: 800 }}>
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
