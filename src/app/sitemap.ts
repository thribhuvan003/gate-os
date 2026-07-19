import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://gateeee.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${appUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${appUrl}/login`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];
}
