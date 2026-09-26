import { readCsvRows } from "./parse-csv";
import type { CmsJob } from "./types";

export const DEFAULT_CAREERS_COVER = "/images/egc-careers-cover.png";

const bool = (value?: string) => String(value).toLowerCase() === "true";

let cache: CmsJob[] | null = null;

export function getAllJobs(): CmsJob[] {
  if (cache) return cache;

  cache = readCsvRows("Copy of EGC - Careers")
    .filter((row) => row.Slug && !bool(row.Archived) && !bool(row.Draft))
    .map((row) => ({
      slug: row.Slug,
      name: row.Name,
      jobTitle: row["Job title"] || undefined,
      excerpt: row["Excerpt (Short text explaining the job)"] || undefined,
      organization: row.Organization || undefined,
      location: row.Location || undefined,
      type: row.Type || undefined,
      applicationDeadline: row["Application Deadline"] || undefined,
      applicationLink: row["Application Link"] || undefined,
      coverImage: row["Cover Image"] || DEFAULT_CAREERS_COVER,
    }));

  return cache;
}

export function getJobBySlug(slug: string): CmsJob | undefined {
  return getAllJobs().find((job) => job.slug === slug);
}

export function getJobSlugs(): string[] {
  return getAllJobs().map((job) => job.slug);
}
