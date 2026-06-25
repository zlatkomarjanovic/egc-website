import { defineField, defineType } from "sanity";
import { richText, seoFields, slugField } from "./shared";

/** Authors (Blog Posts → Author / Co Authors reference this). */
export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "position", title: "Position", type: "string" }),
    defineField({ name: "bioSummary", title: "Bio Summary", type: "text", rows: 3 }),
    defineField({ name: "bio", title: "Bio", ...richText }),
    defineField({ name: "picture", title: "Picture", type: "image", options: { hotspot: true } }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "linkedin", title: "LinkedIn Profile Link", type: "url" }),
  ],
  preview: { select: { title: "name", subtitle: "position", media: "picture" } },
});

/** Mentors. */
export const mentor = defineType({
  name: "mentor",
  title: "Mentor",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Mentor Name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "profession", title: "Profession", type: "string" }),
    defineField({ name: "shortBio", title: "Mentor Short Bio", type: "text", rows: 3 }),
    defineField({ name: "detailedBio", title: "Mentor Detailed Bio", ...richText }),
    defineField({ name: "photo", title: "Mentor Profile Picture", type: "image", options: { hotspot: true } }),
    defineField({ name: "photoAlt", title: "Mentor Image Alt Text", type: "string" }),
    defineField({
      name: "sessionImages",
      title: "Mentoring Session Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "primaryExpertise",
      title: "Primary Expertise",
      type: "reference",
      to: [{ type: "areaOfExpertise" }],
    }),
    defineField({
      name: "otherExpertise",
      title: "Other Areas of Expertise",
      type: "array",
      of: [{ type: "reference", to: [{ type: "areaOfExpertise" }] }],
    }),
    defineField({ name: "quote", title: "Quote about EGC experience", type: "text" }),
    defineField({ name: "linkedin", title: "LinkedIn Link", type: "url" }),
    ...seoFields,
  ],
  preview: { select: { title: "name", subtitle: "profession", media: "photo" } },
});

/** BOLD Fellows. */
export const boldFellow = defineType({
  name: "boldFellow",
  title: "BOLD Fellow",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "photo", title: "Profile Picture", type: "image", options: { hotspot: true } }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "year", title: "Year", type: "string" }),
    defineField({ name: "bioSummary", title: "Bio Summary", type: "text", rows: 3 }),
    defineField({ name: "businessIdea", title: "Business Idea", type: "text" }),
    defineField({ name: "position", title: "Position", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "personalWebsite", title: "Personal Website", type: "url" }),
    defineField({ name: "linkedin", title: "LinkedIn Link", type: "url" }),
    defineField({ name: "sortOrder", title: "Custom Sort Order", type: "number" }),
    defineField({
      name: "areasOfExpertise",
      title: "Areas of Expertise",
      type: "array",
      of: [{ type: "reference", to: [{ type: "areaOfExpertise" }] }],
    }),
  ],
  orderings: [
    { title: "Custom sort order", name: "sortAsc", by: [{ field: "sortOrder", direction: "asc" }] },
  ],
  preview: { select: { title: "name", subtitle: "location", media: "photo" } },
});

/**
 * Team members (Staff / Board / Advisory). Not present in the CSV exports, but the
 * site has team/board/advisory pages — kept here so they can be CMS-managed too.
 */
export const teamMember = defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "role", title: "Role / Position", type: "string" }),
    defineField({
      name: "group",
      title: "Group",
      type: "string",
      options: {
        list: [
          { title: "Staff / Our Team", value: "staff" },
          { title: "Board of Directors", value: "board" },
          { title: "Advisory Board", value: "advisory" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "bio", title: "Bio", type: "text" }),
    defineField({ name: "linkedin", title: "LinkedIn Link", type: "url" }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number" }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "photo" } },
});
