import type { MetadataRoute } from "next";
import { projects } from "@/content/site";

const SITE = "https://www.deacam.com.au";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/projects", "/industries", "/about", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${SITE}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...projects
      .filter((p) => p.detailed)
      .map((p) => ({ url: `${SITE}/projects/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
