import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FurLog — Pet Care Management",
    short_name: "FurLog",
    description:
      "Track pet health, vet visits, medications, food stock, and more — shared across your whole household.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1117",
    theme_color: "#1db394",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
