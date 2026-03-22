import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FurLog — Pet Care Management";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(228, 24%, 7%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, hsla(174,80%,40%,0.22) 0%, transparent 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, hsla(217,91%,60%,0.12) 0%, transparent 65%)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "hsla(174,80%,40%,0.15)",
              border: "1.5px solid hsla(174,80%,40%,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
            }}
          >
            🐾
          </div>
          <span
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#e8edf5",
              letterSpacing: "-0.03em",
            }}
          >
            FurLog
          </span>
        </div>

        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: "#e8edf5",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
          }}
        >
          The pet care app your whole{" "}
          <span style={{ color: "hsl(174, 80%, 55%)" }}>household</span> will
          actually use.
        </div>

        <div
          style={{
            fontSize: 26,
            color: "hsla(215,16%,62%,1)",
            lineHeight: 1.4,
            maxWidth: 800,
          }}
        >
          Track vet visits, medications, food stock, and more — shared in real
          time with everyone who cares for your pets.
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {[
            "🏥 Vet Visits",
            "💊 Medications",
            "📦 Food Stock",
            "🔔 Reminders",
          ].map((label) => (
            <div
              key={label}
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "hsla(215,16%,75%,1)",
                background: "hsla(210,20%,18%,1)",
                border: "1px solid hsla(210,20%,30%,1)",
                borderRadius: 9999,
                padding: "8px 18px",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>,
    size,
  );
}
