import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #282828, #2a2a3a)",
          color: "#FCC425",
          fontSize: 360,
          fontWeight: 800,
        }}
      >
        ⚡
      </div>
    ),
    { ...size }
  );
}
