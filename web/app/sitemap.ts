import type { MetadataRoute } from "next";
import { getAlumniSlugs, getJobSlugs, getPostSlugs } from "@/lib/cms";
import { absoluteUrl } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import {
  alumniSlugsQuery,
  jobSlugsQuery,
  postSlugsQuery,
} from "@/sanity/lib/queries";

const ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about-us/mission-and-vision", changeFrequency: "yearly", priority: 0.8 },
  { path: "/about-us/egc-board-of-directors", changeFrequency: "yearly", priority: 0.4 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/programs/bold-fellowship/general", changeFrequency: "monthly", priority: 0.8 },
  { path: "/programs/bold-fellowship/serbia", changeFrequency: "monthly", priority: 0.6 },
  { path: "/programs/bold-fellowship/bosnia-and-herzegovina", changeFrequency: "monthly", priority: 0.6 },
  { path: "/programs/bold-fellowship/north-macedonia", changeFrequency: "monthly", priority: 0.6 },
  { path: "/programs/bold-regional-workshops", changeFrequency: "monthly", priority: 0.7 },
  { path: "/programs/bold-summit", changeFrequency: "monthly", priority: 0.7 },
  { path: "/legal/terms-of-service", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/programs/university-partnership-program", changeFrequency: "monthly", priority: 0.6 },
  { path: "/programs/scale-2-0", changeFrequency: "monthly", priority: 0.7 },
  { path: "/partners", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about-us/careers", changeFrequency: "weekly", priority: 0.6 },
  { path: "/become-an-egc-mentor", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about-us/insights", changeFrequency: "weekly", priority: 0.8 },
  { path: "/programs/leapx", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about-us/egc-advisory-board", changeFrequency: "yearly", priority: 0.4 },
];

async function slugsFor(
  sanityQuery: string,
  fallback: () => string[]
): Promise<string[]> {
  if (!isSanityConfigured) return fallback();
  const rows = await sanityFetch<{ slug: string }[]>(sanityQuery, {}, []);
  return rows ? rows.map((row) => row.slug).filter(Boolean) : fallback();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [postSlugs, jobSlugs, alumniSlugs] = await Promise.all([
    slugsFor(postSlugsQuery, getPostSlugs),
    slugsFor(jobSlugsQuery, getJobSlugs),
    slugsFor(alumniSlugsQuery, getAlumniSlugs),
  ]);

  const postEntries = postSlugs.map((slug) => ({
    url: absoluteUrl(`/post/${slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const jobEntries = jobSlugs.map((slug) => ({
    url: absoluteUrl(`/careers/${slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const alumniEntries = alumniSlugs.map((slug) => ({
    url: absoluteUrl(`/alumni-spotlight/${slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...postEntries, ...jobEntries, ...alumniEntries];
}
