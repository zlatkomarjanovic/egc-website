import type { MetadataRoute } from "next";
import { getAlumniSlugs, getAllJobs, getAllPosts, getJobSlugs, getPostSlugs } from "@/lib/cms";
import { isJobOpen } from "@/lib/cms/jobs";
import { LEGAL_LASTMOD } from "@/lib/page-meta";
import { absoluteUrl } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import {
  alumniSlugsQuery,
  allPostsQuery,
  jobSlugsQuery,
  postSlugsQuery,
} from "@/sanity/lib/queries";

type SitemapDate = string | Date;

const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  lastModified: string;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1, lastModified: "2026-09-27" },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-09-27" },
  {
    path: "/about-us/mission-and-vision",
    changeFrequency: "yearly",
    priority: 0.8,
    lastModified: "2026-06-25",
  },
  {
    path: "/about-us/egc-board-of-directors",
    changeFrequency: "monthly",
    priority: 0.4,
    lastModified: "2026-09-27",
  },
  {
    path: "/about-us/egc-advisory-board",
    changeFrequency: "yearly",
    priority: 0.4,
    lastModified: "2026-06-25",
  },
  { path: "/about-us/careers", changeFrequency: "weekly", priority: 0.6, lastModified: "2026-09-27" },
  { path: "/about-us/insights", changeFrequency: "weekly", priority: 0.8, lastModified: "2026-06-25" },
  { path: "/programs", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-09-01" },
  {
    path: "/programs/bold-fellowship/general",
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified: "2026-09-01",
  },
  {
    path: "/programs/bold-fellowship/serbia",
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: "2026-09-27",
  },
  {
    path: "/programs/bold-fellowship/bosnia-and-herzegovina",
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: "2026-09-27",
  },
  {
    path: "/programs/bold-fellowship/north-macedonia",
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: "2026-09-27",
  },
  {
    path: "/programs/bold-regional-workshops",
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: "2026-06-25",
  },
  { path: "/programs/bold-summit", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-06-25" },
  {
    path: "/programs/university-partnership-program",
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified: "2026-06-25",
  },
  { path: "/programs/scale-2-0", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-06-25" },
  { path: "/programs/leapx", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-09-27" },
  { path: "/alumni", changeFrequency: "weekly", priority: 0.7, lastModified: "2026-06-25" },
  { path: "/partners", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-06-25" },
  {
    path: "/become-an-egc-mentor",
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: "2026-06-25",
  },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6, lastModified: "2026-06-25" },
  {
    path: "/legal/terms-of-service",
    changeFrequency: "yearly",
    priority: 0.3,
    lastModified: LEGAL_LASTMOD,
  },
  {
    path: "/legal/privacy-policy",
    changeFrequency: "yearly",
    priority: 0.3,
    lastModified: LEGAL_LASTMOD,
  },
];

type DatedSlug = {
  slug: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  postedAt?: string;
  applicationDeadline?: string;
  startDate?: string;
  endDate?: string;
};

function isoLastmod(value?: string): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return undefined;
  const ms = Date.parse(value);
  if (Number.isNaN(ms) || new Date(ms).getUTCFullYear() < 2013) return undefined;
  return value;
}

function contentLastmod(published?: string, updated?: string, created?: string): SitemapDate | undefined {
  if (updated) {
    const updatedMs = Date.parse(updated);
    const createdMs = created ? Date.parse(created) : Number.NaN;
    const publishedMs = published ? Date.parse(published) : Number.NaN;
    const day = 24 * 60 * 60 * 1000;
    if (!Number.isNaN(updatedMs)) {
      const importTouch = !Number.isNaN(createdMs) && Math.abs(updatedMs - createdMs) < day;
      const beforeOrWithPublish = !Number.isNaN(publishedMs) && updatedMs <= publishedMs + day;
      if (!importTouch && !beforeOrWithPublish) return updated;
    }
  }
  return published || undefined;
}

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
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const [postRows, jobRows, alumniRows] = await Promise.all([
      isSanityConfigured
        ? sanityFetch<DatedSlug[]>(allPostsQuery, {}, []).catch(() => [])
        : Promise.resolve(
            getAllPosts().map((post) => ({
              slug: post.slug,
              publishedAt: post.publishedAt,
              createdAt: post.createdAt,
              updatedAt: post.updatedAt,
            }))
          ),
      isSanityConfigured
        ? sanityFetch<DatedSlug[]>(jobSlugsQuery, {}, []).catch(() => [])
        : Promise.resolve(
            getAllJobs().map((job) => ({
              slug: job.slug,
              postedAt: job.postedAt,
              applicationDeadline: job.applicationDeadline,
              startDate: job.startDate,
              endDate: job.endDate,
              updatedAt: job.updatedAt,
            }))
          ),
      isSanityConfigured
        ? sanityFetch<DatedSlug[]>(alumniSlugsQuery, {}, []).catch(() => [])
        : Promise.resolve(getAlumniSlugs().map((slug) => ({ slug }))),
    ]);

    const posts: DatedSlug[] =
      postRows?.length
        ? postRows
        : (await slugsFor(postSlugsQuery, getPostSlugs)).map((slug) => ({ slug }));

    const postEntries = posts
      .filter((post) => post.slug)
      .map((post) => {
        const lastModified = contentLastmod(post.publishedAt, post.updatedAt, post.createdAt);
        return {
          url: absoluteUrl(`/post/${post.slug}`),
          ...(lastModified ? { lastModified } : {}),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        };
      });

    const jobs = jobRows?.length
      ? jobRows
      : getJobSlugs().map((slug) => {
          const job = getAllJobs().find((item) => item.slug === slug);
          return {
            slug,
            postedAt: job?.postedAt,
            applicationDeadline: job?.applicationDeadline,
            startDate: job?.startDate,
            endDate: job?.endDate,
            updatedAt: job?.updatedAt,
          };
        });

    const jobEntries = jobs
      .filter((job) => job.slug && isJobOpen(job))
      .map((job) => ({
        url: absoluteUrl(`/careers/${job.slug}`),
        ...(isoLastmod(job.postedAt) || isoLastmod(job.updatedAt)
          ? { lastModified: isoLastmod(job.postedAt) || isoLastmod(job.updatedAt) }
          : {}),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));

    const alumni: DatedSlug[] = alumniRows?.length
      ? alumniRows
      : getAlumniSlugs().map((slug) => ({ slug }));

    const alumniEntries = alumni
      .filter((item) => item.slug)
      .map((item) => ({
        url: absoluteUrl(`/alumni-spotlight/${item.slug}`),
        ...(item.updatedAt ? { lastModified: item.updatedAt } : {}),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }));

    return [...staticEntries, ...postEntries, ...jobEntries, ...alumniEntries];
  } catch {
    return staticEntries;
  }
}
