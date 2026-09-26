import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/studio", "/api/"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "OAI-SearchBot"],
        allow: "/",
        disallow: ["/studio", "/api/"],
      },
      {
        userAgent: ["anthropic-ai", "ClaudeBot", "Claude-SearchBot"],
        allow: "/",
        disallow: ["/studio", "/api/"],
      },
      {
        userAgent: ["PerplexityBot", "Perplexity-User"],
        allow: "/",
        disallow: ["/studio", "/api/"],
      },
      {
        userAgent: ["Google-Extended", "CCBot", "Bytespider"],
        allow: "/",
        disallow: ["/studio", "/api/"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
