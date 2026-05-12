import { ImageResponse } from "next/og";
import { siteSettings } from "@/content/site-settings";

export const runtime = "nodejs";
export const alt = "Z and Z Plumbing. The Pros Other Plumbers Call. Licensed East Bay plumber since 2003.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#000000",
          color: "#FFFFFF",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Hero Orange accent block top-left */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "12px",
            height: "100%",
            backgroundColor: "#F96302",
          }}
        />

        {/* Brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              backgroundColor: "#F96302",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              fontWeight: 900,
              color: "#FFFFFF",
            }}
          >
            Z
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 900,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: "#FFFFFF",
            }}
          >
            Z and Z Plumbing
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Eyebrow */}
        <div
          style={{
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#F96302",
            marginBottom: "18px",
          }}
        >
          Same-Day East Bay Plumbing
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "108px",
            fontWeight: 900,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>The Pros Other</span>
          <span>Plumbers Call.</span>
        </div>

        {/* Supporting line */}
        <div
          style={{
            marginTop: "32px",
            fontSize: "26px",
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.75)",
            maxWidth: "900px",
            lineHeight: 1.35,
          }}
        >
          Two licenses. One crew. Same-day service across Oakland, San Leandro, Berkeley, and the East Bay.
        </div>

        {/* Footer trust strip */}
        <div
          style={{
            marginTop: "48px",
            display: "flex",
            alignItems: "center",
            gap: "32px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            fontSize: "18px",
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.55)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          <span>{siteSettings.cslb}</span>
          <span style={{ color: "#F96302" }}>·</span>
          <span>C-36 + A General Engineering</span>
          <span style={{ color: "#F96302" }}>·</span>
          <span>Since 2003</span>
          <span style={{ color: "#F96302" }}>·</span>
          <span style={{ color: "#FFFFFF" }}>{siteSettings.phone}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
