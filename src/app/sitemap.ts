import type { MetadataRoute } from "next";
import { projects } from "@/content/site";
import { seedPosts } from "@/lib/blog";

const SITE = "https://www.deacam.com.au";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/projects", "/industries", "/about", "/blog", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${SITE}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...projects
      .filter((p) => p.detailed)
      .map((p) => ({ url: `${SITE}/projects/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
    ...seedPosts().map((p) => ({ url: `${SITE}/blog/${p.slug}`, lastModified: p.date, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
