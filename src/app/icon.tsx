import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(145deg, #2B6B7F 0%, #1E4F5E 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div style={{ width: 3, height: 7,  background: "rgba(255,255,255,0.88)", borderRadius: 2 }} />
          <div style={{ width: 3, height: 13, background: "rgba(255,255,255,0.88)", borderRadius: 2 }} />
          <div style={{ width: 3, height: 18, background: "rgba(255,255,255,0.95)", borderRadius: 2 }} />
          <div style={{ width: 3, height: 13, background: "rgba(255,255,255,0.88)", borderRadius: 2 }} />
          <div style={{ width: 3, height: 7,  background: "rgba(255,255,255,0.88)", borderRadius: 2 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
