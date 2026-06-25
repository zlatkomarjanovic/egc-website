import { readCsvRows } from "./parse-csv";
import type { CmsMentor } from "./types";

const bool = (value?: string) => String(value).toLowerCase() === "true";

let cache: CmsMentor[] | null = null;

export function getAllMentors(): CmsMentor[] {
  if (cache) return cache;

  cache = readCsvRows("Copy of EGC - Mentors")
    .filter((row) => row.Slug && !bool(row.Archived) && !bool(row.Draft))
    .map((row) => ({
      slug: row.Slug,
      name: row["Mentor Name"] || row.Name,
      profession: row.Profession || undefined,
      shortBio: row["Mentor Short Bio"] || undefined,
      photo: row["Mentor Profile Picture"] || undefined,
      linkedin: row["LinkedIn Link"] || undefined,
    }))
    .filter((mentor) => mentor.name);

  return cache;
}
