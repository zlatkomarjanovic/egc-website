import { defineField } from "sanity";

/** Reusable slug field (sourced from a title-like field). */
export const slugField = (source = "name") =>
  defineField({
    name: "slug",
    title: "Slug",
    type: "slug",
    options: { source, maxLength: 96 },
    validation: (r) => r.required(),
    description:
      "URL handle. Imported from Webflow; references in CSVs point at these slugs.",
  });

/** SEO meta fields present on several Webflow collections. */
export const seoFields = [
  defineField({ name: "metaTitle", title: "Meta Title Tag", type: "string" }),
  defineField({
    name: "metaDescription",
    title: "Meta Description Tag",
    type: "text",
    rows: 2,
  }),
];

/** Rich text block used for long-form fields (post body, detailed bios, etc.). */
export const richText = {
  type: "array" as const,
  of: [
    { type: "block" as const },
    { type: "image" as const, options: { hotspot: true } },
  ],
};
