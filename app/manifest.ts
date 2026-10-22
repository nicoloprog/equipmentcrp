import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Maintenance CRP",
    short_name: "Maintenance CRP",
    description: "Suivi des équipements, inspections et maintenances du CRP.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f9fa",
    theme_color: "#4b5563",
    lang: "fr-CA",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
