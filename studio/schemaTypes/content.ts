import { defineField, defineType } from "sanity";
import { richText, seoFields, slugField } from "./shared";

/** Blog Posts / Insights. */
export const post = defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "postSummary", title: "Post Summary", type: "text", rows: 3 }),
    defineField({ name: "postBody", title: "Post Body", ...richText }),
    defineField({ name: "mainImage", title: "Main Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "thumbnailImage", title: "Thumbnail Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "featured", title: "Featured?", type: "boolean", initialValue: false }),
    defineField({ name: "blogPageFeature", title: "Blog Page Feature", type: "boolean", initialValue: false }),
    defineField({ name: "color", title: "Color", type: "string" }),
    defineField({ name: "minutesToRead", title: "Minutes to read", type: "number" }),
    defineField({ name: "sortOrder", title: "Custom sort order", type: "number" }),
    defineField({ name: "author", title: "Author", type: "reference", to: [{ type: "author" }] }),
    defineField({
      name: "coAuthors",
      title: "Co Authors",
      type: "array",
      of: [{ type: "reference", to: [{ type: "author" }] }],
    }),
    defineField({ name: "category", title: "Category", type: "reference", to: [{ type: "category" }] }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
    }),
    defineField({ name: "publishedAt", title: "Published On", type: "datetime" }),
    ...seoFields,
  ],
  orderings: [
    { title: "Published, newest first", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] },
    { title: "Custom sort order", name: "sortAsc", by: [{ field: "sortOrder", direction: "asc" }] },
  ],
  preview: { select: { title: "name", subtitle: "postSummary", media: "mainImage" } },
});

/** Careers / Jobs. */
export const job = defineType({
  name: "job",
  title: "Career",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "jobTitle", title: "Job title", type: "string" }),
    defineField({ name: "coverImage", title: "Cover Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 2 }),
    defineField({ name: "organization", title: "Organization", type: "string" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "type", title: "Type", type: "string" }),
    defineField({
      name: "postedAt",
      title: "Posted at",
      type: "datetime",
      description: "Public open date for JobPosting.datePosted. Do not use document created time.",
    }),
    defineField({ name: "applicationDeadline", title: "Application Deadline", type: "date" }),
    defineField({ name: "startDate", title: "Start Date", type: "date" }),
    defineField({ name: "endDate", title: "End Date", type: "date" }),
    defineField({ name: "detailedInstructions", title: "Detailed Instructions", ...richText }),
    defineField({ name: "applicationLink", title: "Application Link", type: "url" }),
  ],
  preview: { select: { title: "name", subtitle: "location", media: "coverImage" } },
});

/** Partners. */
export const partner = defineType({
  name: "partner",
  title: "Partner",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Partner Name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "logo", title: "Partner Logo", type: "image", options: { hotspot: true } }),
    defineField({ name: "website", title: "Partner Website", type: "url" }),
    defineField({ name: "type", title: "Partner Type", type: "string" }),
  ],
  preview: { select: { title: "name", subtitle: "type", media: "logo" } },
});

/** Partner Spotlights (interview-style Q&A about a partner). */
export const partnerSpotlight = defineType({
  name: "partnerSpotlight",
  title: "Partner Spotlight",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "partnerName", title: "Name of Partner", type: "string" }),
    defineField({ name: "partner", title: "Partner", type: "reference", to: [{ type: "partner" }] }),
    defineField({
      name: "qa",
      title: "Questions & Answers",
      description: "Interview responses — one entry per question from the Webflow export.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "question", title: "Question", type: "text", rows: 2 },
            { name: "answer", title: "Answer", type: "text", rows: 4 },
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        },
      ],
    }),
    defineField({ name: "closingThoughts", title: "Closing thoughts", type: "text" }),
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({ name: "publishedAt", title: "Published On", type: "datetime" }),
  ],
  preview: { select: { title: "name", subtitle: "partnerName" } },
});

/** Alumni Spotlights (founder profiles + interview). */
export const alumniSpotlight = defineType({
  name: "alumniSpotlight",
  title: "Alumni Spotlight",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "alumniName", title: "Name of Alumni", type: "string" }),
    defineField({ name: "ventureName", title: "Venture Name", type: "string" }),
    defineField({ name: "oneLiner", title: "One liner", type: "string" }),
    defineField({ name: "profilePicture", title: "Profile Picture", type: "image", options: { hotspot: true } }),
    defineField({ name: "profilePictureAlt", title: "Profile Picture Alt Text", type: "string" }),
    defineField({ name: "country", title: "Country", type: "string" }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    // Interview questions (fixed in the Webflow collection).
    defineField({ name: "whyStarted", title: "Why did you start this venture?", type: "text" }),
    defineField({ name: "fundraised", title: "Have you successfully fundraised?", type: "text" }),
    defineField({ name: "trends", title: "What trends are impacting your business?", type: "text" }),
    defineField({ name: "biggestChallenge", title: "Biggest growth related challenge?", type: "text" }),
    defineField({ name: "adviceFirstTime", title: "Advice for first time founders?", type: "text" }),
    defineField({ name: "whatDrives", title: "What drives you forward when facing challenges?", type: "text" }),
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({ name: "videoLink", title: "Link to video", type: "url" }),
    defineField({ name: "extraNote", title: "Extra note", type: "text" }),
    defineField({ name: "sortNumber", title: "Custom Sort Number", type: "number" }),
    ...seoFields,
  ],
  orderings: [
    { title: "Custom sort number", name: "sortAsc", by: [{ field: "sortNumber", direction: "asc" }] },
  ],
  preview: { select: { title: "name", subtitle: "ventureName", media: "profilePicture" } },
});

/** Testimonials (text + optional video). */
export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "personName", title: "Person name", type: "string", validation: (r) => r.required() }),
    slugField("personName"),
    defineField({ name: "whatTheyDo", title: "What they do", type: "string" }),
    defineField({ name: "egcPosition", title: "EGC Position", type: "string" }),
    defineField({ name: "testimonial", title: "Testimonial", type: "text" }),
    defineField({ name: "personImage", title: "Person Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "videoLink", title: "Video Testimonial Link", type: "url" }),
    defineField({ name: "linkedin", title: "LinkedIn Link", type: "url" }),
    defineField({ name: "twitter", title: "X (Twitter) Link", type: "url" }),
  ],
  preview: { select: { title: "personName", subtitle: "whatTheyDo", media: "personImage" } },
});
