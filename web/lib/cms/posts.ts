import { readCsvRows } from "./parse-csv";
import type { CmsAuthor, CmsCategory, CmsPost, CmsTag } from "./types";
import {
  parseMinutesToRead,
  pickFeaturedPost,
  sortCmsPosts,
  uniqueAuthors,
} from "./format";

const bool = (value?: string) => String(value).toLowerCase() === "true";

let authorsBySlug: Map<string, CmsAuthor> | null = null;
let categoriesBySlug: Map<string, CmsCategory> | null = null;
let tagsBySlug: Map<string, CmsTag> | null = null;
let postsCache: CmsPost[] | null = null;

function loadAuthors(): Map<string, CmsAuthor> {
  if (authorsBySlug) return authorsBySlug;

  authorsBySlug = new Map();
  for (const row of readCsvRows("Copy of EGC - Authors")) {
    const slug = row.Slug;
    if (!slug) continue;
    authorsBySlug.set(slug, {
      slug,
      name: row.Name,
      position: row.Position || undefined,
      picture: row.Picture || undefined,
      bioSummary: row["Bio Summary"] || undefined,
      linkedin: row["LinkedIn Profile Link"] || undefined,
    });
  }

  return authorsBySlug;
}

function loadCategories(): Map<string, CmsCategory> {
  if (categoriesBySlug) return categoriesBySlug;

  categoriesBySlug = new Map();
  for (const row of readCsvRows("Copy of EGC - Categories")) {
    const slug = row.Slug;
    if (!slug) continue;
    categoriesBySlug.set(slug, {
      slug,
      name: row.Name,
      color: row.Color || undefined,
    });
  }

  return categoriesBySlug;
}

function loadTags(): Map<string, CmsTag> {
  if (tagsBySlug) return tagsBySlug;

  tagsBySlug = new Map();
  for (const row of readCsvRows("Copy of EGC - Tags")) {
    const slug = row.Slug;
    if (!slug) continue;
    tagsBySlug.set(slug, { slug, name: row.Name });
  }

  return tagsBySlug;
}

function resolveAuthor(slug?: string): CmsAuthor | undefined {
  if (!slug) return undefined;
  return loadAuthors().get(slug.trim());
}

function resolveCategory(slug?: string): CmsCategory | undefined {
  if (!slug) return undefined;
  return loadCategories().get(slug.trim());
}

function resolveTags(value?: string): CmsTag[] {
  if (!value) return [];
  const tags = loadTags();
  return value
    .split(";")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .map((slug) => tags.get(slug))
    .filter((tag): tag is CmsTag => Boolean(tag));
}

function mapPost(row: Record<string, string>): CmsPost | null {
  const slug = row.Slug;
  if (!slug || bool(row.Archived) || bool(row.Draft)) return null;

  return {
    slug,
    name: row.Name,
    postSummary: row["Post Summary"] || undefined,
    postBody: row["Post Body"] || undefined,
    mainImage: row["Main Image"] || undefined,
    thumbnailImage: row["Thumbnail image"] || undefined,
    featured: bool(row["Featured?"]),
    blogPageFeature: bool(row["Blog Page Feature"]),
    minutesToRead: parseMinutesToRead(row["Minutes to read"]),
    sortOrder: row["Custom sort order"] ? Number(row["Custom sort order"]) : undefined,
    publishedAt: row["Published On"] || undefined,
    createdAt: row["Created On"] || undefined,
    metaTitle: row["Meta Title Tag"] || undefined,
    metaDescription: row["Meta Description Tag"] || undefined,
    author: resolveAuthor(row.Author),
    coAuthors: uniqueAuthors(
      (row["Co Authors"] || "")
        .split(";")
        .map((slug) => resolveAuthor(slug.trim()))
    ).filter((author) => author.slug !== row.Author?.trim()),
    category: resolveCategory(row.Category),
    tags: resolveTags(row.Tags),
  };
}

export function getAllPosts(): CmsPost[] {
  if (postsCache) return postsCache;

  postsCache = readCsvRows("Copy of EGC - Blog Posts")
    .map(mapPost)
    .filter((post): post is CmsPost => Boolean(post))
    .sort(sortCmsPosts);

  return postsCache;
}

export function getPostBySlug(slug: string): CmsPost | null {
  return getAllPosts().find((post) => post.slug === slug) ?? null;
}

export function getFeaturedPosts(): CmsPost[] {
  return pickFeaturedPost(getAllPosts());
}

export function getCategoriesWithPosts(): CmsCategory[] {
  const used = new Set(getAllPosts().map((post) => post.category?.slug).filter(Boolean));
  return [...loadCategories().values()].filter((category) => used.has(category.slug));
}

export function getRelatedPosts(slug: string, limit = 3): CmsPost[] {
  return getAllPosts().filter((post) => post.slug !== slug).slice(0, limit);
}

export function getPostSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}
