import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F96302",
        }}
      >
        {/* Faucet silhouette in white at iOS home-screen scale */}
        <svg
          viewBox="0 0 80 80"
          width="140"
          height="140"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#FFFFFF">
            <rect x="31" y="14" width="6" height="6" />
            <rect x="22" y="20" width="24" height="6" />
            <rect x="31" y="26" width="6" height="12" />
            <rect x="18" y="38" width="30" height="14" />
            <rect x="48" y="42" width="14" height="6" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  );
}
