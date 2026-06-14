import { defineField, defineType, type SchemaTypeDefinition } from "sanity";

/**
 * STARTER schema for the EGC CMS.
 *
 * This is a sensible first draft derived from the Webflow CMS template pages
 * (detail_*). It will be refined once the CSV exports define the exact fields and
 * multi-reference relationships. Multi-reference patterns are already demonstrated
 * (e.g. post.categories/tags, mentor.areasOfExpertise) so they're easy to extend.
 */

const slug = (source = "title") =>
  defineField({
    name: "slug",
    title: "Slug",
    type: "slug",
    options: { source, maxLength: 96 },
    validation: (r) => r.required(),
  });

/* ----------------------------- Taxonomies ----------------------------- */

const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug(),
    defineField({ name: "description", type: "text" }),
  ],
});

const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug(),
  ],
});

const areaOfExpertise = defineType({
  name: "areaOfExpertise",
  title: "Area of Expertise / Interest",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug(),
  ],
});

/* ------------------------------- People ------------------------------- */

const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slug("name"),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "image", type: "image", options: { hotspot: true } }),
    defineField({ name: "bio", type: "text" }),
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "url" }),
  ],
});

const teamMember = defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slug("name"),
    defineField({ name: "role", type: "string" }),
    defineField({
      name: "group",
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
    defineField({ name: "photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "bio", type: "text" }),
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "url" }),
    defineField({ name: "order", title: "Sort order", type: "number" }),
  ],
});

const mentor = defineType({
  name: "mentor",
  title: "Mentor",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slug("name"),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "company", type: "string" }),
    defineField({ name: "photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "bio", type: "text" }),
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "url" }),
    defineField({
      name: "areasOfExpertise",
      title: "Areas of Expertise",
      type: "array",
      of: [{ type: "reference", to: [{ type: "areaOfExpertise" }] }],
    }),
  ],
});

const boldFellow = defineType({
  name: "boldFellow",
  title: "BOLD Fellow",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slug("name"),
    defineField({ name: "cohort", type: "string" }),
    defineField({ name: "country", type: "string" }),
    defineField({ name: "photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "bio", type: "text" }),
    defineField({
      name: "areasOfExpertise",
      type: "array",
      of: [{ type: "reference", to: [{ type: "areaOfExpertise" }] }],
    }),
  ],
});

/* ------------------------------ Content ------------------------------- */

const post = defineType({
  name: "post",
  title: "Insight / Blog Post",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug(),
    defineField({ name: "excerpt", type: "text", rows: 3 }),
    defineField({ name: "coverImage", type: "image", options: { hotspot: true } }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
    }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }, { type: "image" }] }),
  ],
  orderings: [
    {
      title: "Published, newest first",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});

const job = defineType({
  name: "job",
  title: "Career / Job",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug(),
    defineField({ name: "department", type: "string" }),
    defineField({ name: "location", type: "string" }),
    defineField({
      name: "type",
      title: "Employment type",
      type: "string",
      options: {
        list: ["Full-time", "Part-time", "Contract", "Internship", "Volunteer"],
      },
    }),
    defineField({ name: "applyUrl", title: "Apply URL", type: "url" }),
    defineField({ name: "postedAt", type: "datetime" }),
    defineField({ name: "open", title: "Currently open", type: "boolean", initialValue: true }),
    defineField({ name: "description", type: "array", of: [{ type: "block" }] }),
  ],
});

const partner = defineType({
  name: "partner",
  title: "Partner",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slug("name"),
    defineField({ name: "logo", type: "image", options: { hotspot: true } }),
    defineField({ name: "url", title: "Website URL", type: "url" }),
    defineField({
      name: "tier",
      type: "string",
      options: { list: ["Strategic", "Program", "Community", "Academic"] },
    }),
    defineField({ name: "description", type: "text" }),
  ],
});

const partnerSpotlight = defineType({
  name: "partnerSpotlight",
  title: "Partner Spotlight",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug(),
    defineField({ name: "partner", type: "reference", to: [{ type: "partner" }] }),
    defineField({ name: "image", type: "image", options: { hotspot: true } }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }, { type: "image" }] }),
  ],
});

const alumniSpotlight = defineType({
  name: "alumniSpotlight",
  title: "Alumni Spotlight",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slug("name"),
    defineField({ name: "program", type: "string" }),
    defineField({ name: "country", type: "string" }),
    defineField({ name: "photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({ name: "story", type: "array", of: [{ type: "block" }, { type: "image" }] }),
  ],
});

const videoTestimonial = defineType({
  name: "videoTestimonial",
  title: "Video Testimonial",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug(),
    defineField({ name: "person", title: "Person / Role", type: "string" }),
    defineField({ name: "videoUrl", title: "Video URL", type: "url" }),
    defineField({ name: "thumbnail", type: "image", options: { hotspot: true } }),
  ],
});

export const schemaTypes: SchemaTypeDefinition[] = [
  // taxonomies
  category,
  tag,
  areaOfExpertise,
  // people
  author,
  teamMember,
  mentor,
  boldFellow,
  // content
  post,
  job,
  partner,
  partnerSpotlight,
  alumniSpotlight,
  videoTestimonial,
];
