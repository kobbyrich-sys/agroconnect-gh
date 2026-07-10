import type { MetadataRoute } from "next";

const baseUrl = "https://transdel-website.vercel.app";

const staticRoutes = [
  { path: "", priority: 1.0 },
  { path: "/about", priority: 0.8 },
  { path: "/services", priority: 0.9 },
  { path: "/contact", priority: 0.7 },
];

const serviceSlugs = [
  "cctv-installation",
  "access-control",
  "network-infrastructure",
  "workstation-setup",
  "it-support",
  "preventive-maintenance",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = staticRoutes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: r.priority,
  }));

  const servicePages = serviceSlugs.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...servicePages];
}
