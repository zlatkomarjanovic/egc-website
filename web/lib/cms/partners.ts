import { readCsvRows } from "./parse-csv";
import type { CmsPartner } from "./types";

const bool = (value?: string) => String(value).toLowerCase() === "true";

let cache: CmsPartner[] | null = null;

export function getAllPartners(): CmsPartner[] {
  if (cache) return cache;

  cache = readCsvRows("Copy of EGC - Partners")
    .filter((row) => row.Slug && !bool(row.Archived))
    .map((row) => ({
      slug: row.Slug,
      name: row["Partner Name"] || row.Name,
      logo: row["Partner Logo"] || undefined,
      website: row["Partner Website"] || undefined,
      type: row["Partner Type"] || undefined,
    }));

  return cache;
}

export function getPartnersByType(type: string): CmsPartner[] {
  return getAllPartners().filter((partner) => partner.type === type);
}
