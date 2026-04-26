import { ImageResponse } from "next/og";

export const alt = "Patinep Store — Blog sobre patinetes e scooters elétricos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #282828 0%, #2a2a3a 100%)",
          padding: "64px 72px",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-1px" }}>
            patinep
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              paddingTop: 8,
            }}
          >
            blog
          </span>
          <span style={{ fontSize: 36, color: "#FCC425", paddingTop: 4 }}>⚡</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              maxWidth: 1000,
            }}
          >
            Tudo sobre patinetes e scooters elétricos
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
            }}
          >
            Guias, comparativos, manutenção e regulamentação
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #FCC425",
            paddingTop: 18,
          }}
        >
          <span style={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }}>
            blog.patinepstore.com.br
          </span>
          <span style={{ fontSize: 20, color: "#FCC425", fontWeight: 700 }}>
            Maringá · Brasil
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
