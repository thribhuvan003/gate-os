import { ImageResponse } from "next/og";

export const alt = "GATE OS — Your preparation, in one space";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const paper = "#f3f0e7";
const ink = "#16281f";
const accent = "#183f3b";
const muted = "#5c6b62";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: paper,
          color: ink,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 9999,
                backgroundColor: accent,
                color: paper,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              G
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>GATE OS</div>
          </div>
          <div
            style={{
              fontSize: 21,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: accent,
              fontWeight: 600,
            }}
          >
            Private beta · GATE CS &amp; IT 2027
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              fontSize: 104,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 1.02,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Your preparation,</span>
            <span style={{ color: accent, fontStyle: "italic" }}>in one space.</span>
          </div>
          <div style={{ fontSize: 30, color: muted, maxWidth: 860, lineHeight: 1.4 }}>
            The private study workspace that feels like your own website — focused, calm, and
            built around how you prepare every day.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${accent}22`,
            paddingTop: 34,
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            {["Focus", "Syllabus", "PYQs", "Notes", "Circles"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  padding: "10px 22px",
                  borderRadius: 9999,
                  border: `2px solid ${accent}33`,
                  color: accent,
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 22, color: muted }}>gateeee.vercel.app</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
