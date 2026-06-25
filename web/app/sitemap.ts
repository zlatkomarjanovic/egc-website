import type { MetadataRoute } from "next";
import { getPostSlugs } from "@/lib/cms";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { postSlugsQuery } from "@/sanity/lib/queries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://egcnyc.org";

const ROUTES = [
  "/",
  "/contact",
  "/newsletter",
  "/mentorship",
  "/partners",
  "/become-an-egc-mentor",
  "/about-us/careers",
  "/about-us/egc-advisory-board",
  "/about-us/egc-board-of-directors",
  "/about-us/egc-our-team",
  "/about-us/insights",
  "/about-us/mission-and-vision",
  "/programs/bold-regional-workshops",
  "/programs/bold-summit",
  "/programs/leapx",
  "/programs/scale-2-0",
  "/programs/university-partnership-program",
  "/programs/bold-fellowship/bosnia-and-herzegovina",
  "/programs/bold-fellowship/general",
  "/programs/bold-fellowship/north-macedonia",
  "/programs/bold-fellowship/serbia",
  "/legal/privacy-policy",
  "/legal/terms-of-service",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries = ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "/" ? 1 : 0.7,
  }));

  const sanitySlugs = isSanityConfigured
    ? await sanityFetch<{ slug: string }[]>(postSlugsQuery, {}, [])
    : null;
  const slugs =
    sanitySlugs !== null ? sanitySlugs.map((item) => item.slug) : getPostSlugs();

  const postEntries = slugs.map((slug) => ({
    url: `${SITE_URL}/about-us/insights/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries];
}
