import { defineField, defineType } from "sanity";
import { slugField } from "./shared";

/** Blog Posts → Category (single reference per post). */
export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({ name: "icon", title: "Icon", type: "image", options: { hotspot: true } }),
    defineField({ name: "color", title: "Color", type: "string" }),
  ],
  preview: { select: { title: "name", subtitle: "slug.current" } },
});

/** Blog Posts → Tags (multi-reference per post). */
export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
  ],
  preview: { select: { title: "name", subtitle: "slug.current" } },
});

/** Areas of Expertise & Interests (referenced by Mentors, Alumni, Mentees). */
export const areaOfExpertise = defineType({
  name: "areaOfExpertise",
  title: "Area of Expertise / Interest",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
  ],
  preview: { select: { title: "name", subtitle: "slug.current" } },
});
