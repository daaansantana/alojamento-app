import type { MetadataRoute } from "next";

/** Opens like an app from the phone's home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "A sua casa",
    short_name: "A sua casa",
    description:
      "O que fazer este mês, a quem escrever, o seu preço e como correu o ano.",
    lang: "pt-PT",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1f4fa3",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
