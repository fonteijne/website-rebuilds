import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Boodschappen",
    short_name: "Boodschappen",
    description: "Gedeelde boodschappenlijst voor twee.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe3",
    theme_color: "#f5efe3",
    lang: "nl",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
