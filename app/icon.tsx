import { ImageResponse } from "next/og";
import { House } from "./house";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<House size={512} rounded={true} />, { ...size });
}
