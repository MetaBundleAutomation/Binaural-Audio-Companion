import { ImageResponse } from "next/og";

// iOS "Add to Home Screen" icon — 180 × 180 px
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(145deg, #2B6B7F 0%, #1E4F5E 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 40,  background: "rgba(255,255,255,0.88)", borderRadius: 5 }} />
          <div style={{ width: 10, height: 72,  background: "rgba(255,255,255,0.88)", borderRadius: 5 }} />
          <div style={{ width: 10, height: 100, background: "rgba(255,255,255,0.95)", borderRadius: 5 }} />
          <div style={{ width: 10, height: 72,  background: "rgba(255,255,255,0.88)", borderRadius: 5 }} />
          <div style={{ width: 10, height: 40,  background: "rgba(255,255,255,0.88)", borderRadius: 5 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
