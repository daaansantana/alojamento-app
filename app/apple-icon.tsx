import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so the green fills the square. The white
// symbol sits where icone-app.svg puts it: 270 of 512, from (121, 116).
const SCALE = 180 / 512;

export default async function AppleIcon() {
  const svg = await readFile(
    join(process.cwd(), "public/marca/simbolo-branco.svg"),
  );
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#0F3D33",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: ImageResponse renders plain img */}
      <img
        src={`data:image/svg+xml;base64,${svg.toString("base64")}`}
        width={Math.round(270 * SCALE)}
        height={Math.round(270 * SCALE)}
        alt=""
        style={{
          position: "absolute",
          left: Math.round(121 * SCALE),
          top: Math.round(116 * SCALE),
        }}
      />
    </div>,
    { ...size },
  );
}
