import type { MetadataRoute } from "next";

/** Opens like an app from the phone's home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "nexo: a sua casa, com nexo",
    short_name: "nexo",
    description:
      "A sua casa, com nexo. O que fazer este mês, a quem escrever, o seu preço e como correu o ano.",
    lang: "pt-PT",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF8",
    theme_color: "#0F3D33",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
