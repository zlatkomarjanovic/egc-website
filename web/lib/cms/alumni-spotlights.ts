import { readCsvRows } from "./parse-csv";
import type { CmsAlumniSpotlight } from "./types";

const bool = (value?: string) => String(value).toLowerCase() === "true";
const num = (value?: string) => (value === "" || value == null ? undefined : Number(value));

let cache: CmsAlumniSpotlight[] | null = null;

function mapRow(row: Record<string, string>): CmsAlumniSpotlight {
  return {
    slug: row.Slug,
    name: row.Name,
    alumniName: row["Name of Alumni"] || undefined,
    ventureName: row["Venture Name"] || undefined,
    oneLiner: row["One liner"] || undefined,
    profilePicture: row["Profile Picture"] || undefined,
    profilePictureAlt: row["Profile Picture Alt Text"] || undefined,
    country: row.Country || undefined,
    featured: bool(row.Featured),
    whyStarted: row["Why did you start this venture?"] || undefined,
    videoLink: row["Link to video:"] || row["Video Linkj"] || undefined,
    sortNumber: num(row["Custom Sort Number"]),
  };
}

export function getAllAlumniSpotlights(): CmsAlumniSpotlight[] {
  if (cache) return cache;

  cache = readCsvRows("Copy of EGC - Alumni Spotlights")
    .filter((row) => row.Slug && !bool(row.Archived) && !bool(row.Draft))
    .map(mapRow)
    .sort((a, b) => (a.sortNumber ?? 999) - (b.sortNumber ?? 999));

  return cache;
}

export function getFeaturedAlumniSpotlights(): CmsAlumniSpotlight[] {
  return getAllAlumniSpotlights().filter((item) => item.featured);
}

export function getAlumniBySlug(slug: string): CmsAlumniSpotlight | undefined {
  return getAllAlumniSpotlights().find((item) => item.slug === slug);
}

export function getAlumniSlugs(): string[] {
  return getAllAlumniSpotlights().map((item) => item.slug);
}
