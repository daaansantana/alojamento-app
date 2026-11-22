import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// The app icon file as it is: the white symbol on nexo green.
export default async function Icon() {
  const svg = await readFile(join(process.cwd(), "public/marca/icone-app.svg"));
  return new ImageResponse(
    // biome-ignore lint/performance/noImgElement: ImageResponse renders plain img
    <img
      src={`data:image/svg+xml;base64,${svg.toString("base64")}`}
      width={512}
      height={512}
      alt=""
    />,
    { ...size },
  );
}
