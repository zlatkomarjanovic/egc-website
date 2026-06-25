import { readCsvRows } from "./parse-csv";
import type { CmsTestimonial } from "./types";

const bool = (value?: string) => String(value).toLowerCase() === "true";

let cache: CmsTestimonial[] | null = null;

export function getAllTestimonials(): CmsTestimonial[] {
  if (cache) return cache;

  cache = readCsvRows("Copy of EGC - Testimonials")
    .filter((row) => row.Slug && !bool(row.Archived) && !bool(row.Draft))
    .map((row) => ({
      slug: row.Slug,
      personName: row["Person name"] || row.Name,
      whatTheyDo: row["What they do"] || undefined,
      egcPosition: row["EGC Position"] || undefined,
      testimonial: row.Testimonial || undefined,
      personImage: row["Person Image"] || undefined,
      videoLink: row["Video Testimonial Link"] || undefined,
    }));

  return cache;
}
