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
            background: "linear-gradient(135deg, #161F24 0%, #313B44 100%)",
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
          <div style={{ fontSize: 72, fontWeight: 700, color: "#00D084", marginBottom: 20 }}>
            {siteName}
          </div>
          <div style={{ fontSize: 28, color: "#B9C3CB", maxWidth: 800 }}>
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
