import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kookstappen",
    short_name: "Kookstappen",
    description: "Foto van de bereidingswijze → één handeling per keer.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ee",
    theme_color: "#fbf6ee",
    lang: "nl",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
