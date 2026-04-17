import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Generates the app icon at any requested size.
// Referenced by manifest.ts for the PWA 192px and 512px icons.
export function GET(req: NextRequest) {
  const size = Math.max(64, Math.min(512, Number(req.nextUrl.searchParams.get("size") ?? "192")));

  // Design: deep teal gradient, five equalizer bars in white
  const barW   = Math.round(size * 0.055);
  const barGap = Math.round(size * 0.034);
  const barH   = [0.22, 0.40, 0.56, 0.40, 0.22].map((r) => Math.round(size * r));
  const radius = Math.round(size * 0.20);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "linear-gradient(145deg, #2B6B7F 0%, #1E4F5E 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius,
        }}
      >
        {/* Five equalizer bars — represents binaural / audio therapy */}
        <div style={{ display: "flex", alignItems: "center", gap: barGap }}>
          <div style={{ width: barW, height: barH[0], background: "rgba(255,255,255,0.88)", borderRadius: barW / 2 }} />
          <div style={{ width: barW, height: barH[1], background: "rgba(255,255,255,0.88)", borderRadius: barW / 2 }} />
          <div style={{ width: barW, height: barH[2], background: "rgba(255,255,255,0.95)", borderRadius: barW / 2 }} />
          <div style={{ width: barW, height: barH[3], background: "rgba(255,255,255,0.88)", borderRadius: barW / 2 }} />
          <div style={{ width: barW, height: barH[4], background: "rgba(255,255,255,0.88)", borderRadius: barW / 2 }} />
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
