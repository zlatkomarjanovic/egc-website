import { readCsvRows } from "./parse-csv";
import type { CmsJob } from "./types";

export const DEFAULT_CAREERS_COVER = "/images/egc-careers-cover.png";

const bool = (value?: string) => String(value).toLowerCase() === "true";

function yearFromIso(raw?: string): number | undefined {
  const match = raw?.match(/\b(20\d{2}|19\d{2})\b/);
  if (!match) return undefined;
  const year = Number(match[1]);
  return year >= 2013 ? year : undefined;
}

function endOfDayIso(date: Date): string {
  return `${date.toISOString().slice(0, 10)}T23:59:59Z`;
}

export function jobDeadlineIso(raw?: string, yearHint?: number): string | undefined {
  if (!raw?.trim()) return undefined;
  const value = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T23:59:59Z`;
  const cleaned = value.replace(/(\d+)(st|nd|rd|th)/i, "$1").replace(/,/g, "").trim();
  const hasYear = /\b(20\d{2}|19\d{2})\b/.test(cleaned);
  const toParse = hasYear ? cleaned : yearHint && yearHint >= 2013 ? `${cleaned} ${yearHint}` : "";
  if (!toParse) return undefined;
  const parsed = Date.parse(toParse);
  if (Number.isNaN(parsed)) return undefined;
  const date = new Date(parsed);
  if (date.getUTCFullYear() < 2013) return undefined;
  return endOfDayIso(date);
}

export function isJobOpen(
  job: { applicationDeadline?: string; startDate?: string; endDate?: string },
  now = Date.now()
): boolean {
  const yearHint = yearFromIso(job.startDate) || yearFromIso(job.endDate);
  const deadline = jobDeadlineIso(job.applicationDeadline, yearHint);
  const start = jobDeadlineIso(job.startDate);
  const end = jobDeadlineIso(job.endDate);
  if (end && Date.parse(end) < now) return false;
  if (deadline && Date.parse(deadline) < now) return false;
  if (start && Date.parse(start) < now) return false;
  return true;
}

export function employmentTypeForSchema(raw?: string): string {
  const value = (raw || "").toLowerCase();
  if (/full/.test(value)) return "FULL_TIME";
  if (/part/.test(value)) return "PART_TIME";
  if (/contract/.test(value)) return "CONTRACTOR";
  if (/intern/.test(value)) return "INTERN";
  if (/volunteer/.test(value)) return "VOLUNTEER";
  if (/temp/.test(value)) return "TEMPORARY";
  if (/per.?diem/.test(value)) return "PER_DIEM";
  if (!value) return "FULL_TIME";
  return "OTHER";
}

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
      postedAt: row["Posted At"] || undefined,
      applicationDeadline: row["Application Deadline"] || undefined,
      startDate: row["Start Date"] || undefined,
      endDate: row["End Date"] || undefined,
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
