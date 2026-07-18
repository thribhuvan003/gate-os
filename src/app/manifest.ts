import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GATE OS",
    short_name: "GATE OS",
    description: "A private preparation workspace for GATE CS/IT 2027.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f4efe5",
    theme_color: "#1d3f36",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}

