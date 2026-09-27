import type { MetadataRoute } from "next";
import { getAlumniSlugs, getAllPosts, getJobSlugs, getPostSlugs } from "@/lib/cms";
import { absoluteUrl } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import {
  alumniSlugsQuery,
  allPostsQuery,
  jobSlugsQuery,
  postSlugsQuery,
} from "@/sanity/lib/queries";

const ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about-us/mission-and-vision", changeFrequency: "yearly", priority: 0.8 },
  { path: "/about-us/egc-board-of-directors", changeFrequency: "yearly", priority: 0.4 },
  { path: "/about-us/egc-advisory-board", changeFrequency: "yearly", priority: 0.4 },
  { path: "/about-us/careers", changeFrequency: "weekly", priority: 0.6 },
  { path: "/about-us/insights", changeFrequency: "weekly", priority: 0.8 },
  { path: "/programs", changeFrequency: "monthly", priority: 0.8 },
  { path: "/programs/bold-fellowship/general", changeFrequency: "monthly", priority: 0.8 },
  { path: "/programs/bold-fellowship/serbia", changeFrequency: "monthly", priority: 0.6 },
  { path: "/programs/bold-fellowship/bosnia-and-herzegovina", changeFrequency: "monthly", priority: 0.6 },
  { path: "/programs/bold-fellowship/north-macedonia", changeFrequency: "monthly", priority: 0.6 },
  { path: "/programs/bold-regional-workshops", changeFrequency: "monthly", priority: 0.7 },
  { path: "/programs/bold-summit", changeFrequency: "monthly", priority: 0.7 },
  { path: "/programs/university-partnership-program", changeFrequency: "monthly", priority: 0.6 },
  { path: "/programs/scale-2-0", changeFrequency: "monthly", priority: 0.7 },
  { path: "/programs/leapx", changeFrequency: "monthly", priority: 0.7 },
  { path: "/alumni", changeFrequency: "weekly", priority: 0.7 },
  { path: "/partners", changeFrequency: "monthly", priority: 0.7 },
  { path: "/become-an-egc-mentor", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/legal/terms-of-service", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
];

async function slugsFor(
  sanityQuery: string,
  fallback: () => string[]
): Promise<string[]> {
  try {
    if (!isSanityConfigured) return fallback();
    const rows = await sanityFetch<{ slug: string }[]>(sanityQuery, {}, []);
    return rows ? rows.map((row) => row.slug).filter(Boolean) : fallback();
  } catch {
    return fallback();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const [postRows, jobSlugs, alumniSlugs] = await Promise.all([
      isSanityConfigured
        ? sanityFetch<Array<{ slug: string; publishedAt?: string; createdAt?: string; updatedAt?: string }>>(
            allPostsQuery,
            {},
            []
          ).catch(() => [])
        : Promise.resolve(
            getAllPosts().map((post) => ({
              slug: post.slug,
              publishedAt: post.publishedAt,
              createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            }))
          ),
      slugsFor(jobSlugsQuery, getJobSlugs),
      slugsFor(alumniSlugsQuery, getAlumniSlugs),
    ]);

    const posts: Array<{ slug: string; publishedAt?: string; createdAt?: string; updatedAt?: string }> =
      postRows?.length
        ? postRows
        : (await slugsFor(postSlugsQuery, getPostSlugs)).map((slug) => ({ slug }));

    const postEntries = posts
      .filter((post) => post.slug)
      .map((post) => ({
        url: absoluteUrl(`/post/${post.slug}`),
        lastModified: post.updatedAt || post.publishedAt || post.createdAt || now,
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
  } catch {
    return staticEntries;
  }
}
