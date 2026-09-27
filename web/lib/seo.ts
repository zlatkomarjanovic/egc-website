import type { Metadata } from "next";
import {
  employmentTypeForSchema,
  jobDeadlineIso,
} from "@/lib/cms/jobs";
import type { CmsAlumniSpotlight, CmsJob, CmsPost } from "@/lib/cms/types";

export const SITE_NAME = "Entrepreneurs for Global Change";
export const SITE_SHORT_NAME = "EGC";
export const PRODUCTION_SITE_URL = "https://www.egcnyc.org";
export const SITE_HOST = "www.egcnyc.org";
export const DEFAULT_TITLE =
  "Entrepreneurs for Global Change | Youth Entrepreneurship Programs";
export const DEFAULT_DESCRIPTION =
  "EGC helps young founders from emerging ecosystems start and grow ventures through the BOLD Fellowship, LeapX, workshops, and NYC programs.";
export const DEFAULT_OG_IMAGE = "/images/egc-og-default.png";
export const DEFAULT_OG_ALT = "Entrepreneurs for Global Change";
export const LOGO_PATH = "/images/egc-logo.png";
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "::1",
]);

function isLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/:\d+$/, "");
  return LOCAL_HOSTS.has(host) || host.endsWith(".localhost");
}

function isVercelPreviewHost(hostname: string): boolean {
  return hostname.endsWith(".vercel.app");
}

/**
 * Production, preview, and any non-dev build always resolve to the live www
 * origin unless the host is a real Vercel preview URL. Localhost is rejected
 * everywhere except `next dev`.
 */
export function getSiteUrl(): string {
  if (process.env.VERCEL_ENV === "production") return PRODUCTION_SITE_URL;

  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      const url = new URL(raw);
      if (url.hostname === "egcnyc.org") return PRODUCTION_SITE_URL;
      if (url.hostname === SITE_HOST) return PRODUCTION_SITE_URL;
      if (isLocalHost(url.hostname)) {
        if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
          return url.origin.replace(/\/$/, "");
        }
        return PRODUCTION_SITE_URL;
      }
      if (isVercelPreviewHost(url.hostname) && process.env.VERCEL_ENV === "preview") {
        return url.origin.replace(/\/$/, "");
      }
    } catch {
      /* fall through */
    }
  }

  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
    return "http://localhost:3000";
  }

  return PRODUCTION_SITE_URL;
}

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      if (url.hostname === "egcnyc.org") url.hostname = SITE_HOST;
      if (isLocalHost(url.hostname)) {
        return `${getSiteUrl()}${url.pathname}${url.search}${url.hash}`;
      }
      return url.toString();
    } catch {
      return getSiteUrl();
    }
  }

  const origin = getSiteUrl();
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function postPath(slug: string): string {
  return `/post/${slug}`;
}

export function careerPath(slug: string): string {
  return `/careers/${slug}`;
}

export function alumniPath(slug: string): string {
  return `/alumni-spotlight/${slug}`;
}

export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x2F;/gi, "/")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function clipText(value: string, max: number): string {
  const clean = decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const cut = slice.lastIndexOf(" ");
  return `${(cut > 40 ? slice.slice(0, cut) : slice).trimEnd()}…`;
}

export function pageTitle(title?: string | null): string {
  const raw = (title || DEFAULT_TITLE).replace(/\s+/g, " ").trim();
  if (!raw) return DEFAULT_TITLE;
  if (raw === DEFAULT_TITLE) return DEFAULT_TITLE;
  const branded =
    /\bEGC\b/i.test(raw) || raw.includes(SITE_NAME)
      ? raw
      : `${raw} | ${SITE_SHORT_NAME}`;
  if (branded.length >= 32) return clipText(branded, TITLE_MAX);
  return clipText(`${branded.replace(/\s*\|\s*EGC$/i, "")} | ${SITE_NAME}`, TITLE_MAX);
}

export function pageDescription(description?: string | null): string {
  return clipText(description || DEFAULT_DESCRIPTION, DESCRIPTION_MAX);
}

export function localAssetUrl(url?: string | null, fallback = DEFAULT_OG_IMAGE): string {
  if (!url) return absoluteUrl(fallback);
  const decoded = decodeHtmlEntities(url);
  if (decoded.includes("website-files.com") || decoded.includes("cdn.prod.website-files.com")) {
    return absoluteUrl(fallback);
  }
  if (decoded.startsWith("/")) return absoluteUrl(decoded);
  if (/^https?:\/\//i.test(decoded)) return absoluteUrl(decoded);
  return absoluteUrl(fallback);
}

type RouteMetadataInput = {
  path: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
  extra?: Metadata;
};

export function routeMetadata({
  path,
  title,
  description,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  noIndex,
  extra,
}: RouteMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const finalTitle = pageTitle(title);
  const finalDescription = pageDescription(description);
  const ogImage = localAssetUrl(image);
  const ogAlt = imageAlt || finalTitle;

  return {
    ...extra,
    title: finalTitle,
    description: finalDescription,
    metadataBase: new URL(getSiteUrl()),
    alternates: {
      canonical,
      ...(extra?.alternates || {}),
    },
    openGraph: {
      type,
      locale: "en_US",
      siteName: SITE_NAME,
      title: finalTitle,
      description: finalDescription,
      url: canonical,
      images: [{ url: ogImage, alt: ogAlt, width: 1200, height: 630 }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors?.length ? { authors } : {}),
      ...(extra?.openGraph || {}),
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [ogImage],
      ...(extra?.twitter || {}),
    },
    robots: noIndex
      ? { index: false, follow: true }
      : extra?.robots || { index: true, follow: true },
  };
}

export function fromContentMetadata(
  raw: unknown,
  path: string,
  overrides: Partial<RouteMetadataInput> = {}
): Metadata {
  const meta = (raw || {}) as Metadata;
  const og = meta.openGraph as
    | { images?: Array<{ url?: string; alt?: string } | string>; title?: string; description?: string }
    | undefined;
  const firstImage = Array.isArray(og?.images) ? og.images[0] : undefined;
  const imageUrl =
    typeof firstImage === "string" ? firstImage : firstImage && typeof firstImage === "object"
      ? firstImage.url
      : undefined;

  return routeMetadata({
    path,
    title: overrides.title ?? (typeof meta.title === "string" ? meta.title : undefined),
    description:
      overrides.description ??
      (typeof meta.description === "string" ? meta.description : undefined),
    image: overrides.image ?? imageUrl,
    imageAlt: overrides.imageAlt,
    type: overrides.type,
    noIndex: overrides.noIndex,
    extra: overrides.extra,
  });
}

export function organizationJsonLd() {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "NonprofitOrganization",
    "@id": `${origin}/#organization`,
    name: SITE_NAME,
    alternateName: SITE_SHORT_NAME,
    url: `${origin}/`,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(LOGO_PATH),
      width: 256,
      height: 256,
    },
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description: DEFAULT_DESCRIPTION,
    email: "info@egcnyc.org",
    telephone: "+1-347-990-2142",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1412 Broadway, FL 21",
      addressLocality: "New York City",
      addressRegion: "NY",
      postalCode: "10018",
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "Country", name: "Bosnia and Herzegovina" },
      { "@type": "Country", name: "Serbia" },
      { "@type": "Country", name: "North Macedonia" },
      { "@type": "Country", name: "United States" },
    ],
    sameAs: [
      "https://www.linkedin.com/company/entrepreneurs-for-global-change/",
      "https://www.instagram.com/egc.nyc/",
      "https://www.youtube.com/@egcnyc",
    ],
    foundingDate: "2013",
    knowsAbout: [
      "youth entrepreneurship",
      "startup acceleration",
      "BOLD Fellowship",
      "emerging market founders",
    ],
  };
}

export function websiteJsonLd() {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    url: `${origin}/`,
    name: SITE_NAME,
    alternateName: SITE_SHORT_NAME,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-US",
    publisher: { "@id": `${origin}/#organization` },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function editorialModifiedAt(
  published?: string,
  updated?: string,
  created?: string
): string | undefined {
  if (!updated) return published;
  const updatedMs = Date.parse(updated);
  if (Number.isNaN(updatedMs)) return published;
  const createdMs = created ? Date.parse(created) : Number.NaN;
  const publishedMs = published ? Date.parse(published) : Number.NaN;
  const day = 24 * 60 * 60 * 1000;
  if (!Number.isNaN(createdMs) && Math.abs(updatedMs - createdMs) < day) {
    return published || undefined;
  }
  if (!Number.isNaN(publishedMs) && updatedMs <= publishedMs + day) {
    return published;
  }
  return updated;
}

function articleWordCount(post: CmsPost): number | undefined {
  if (post.wordCount && post.wordCount > 0) return post.wordCount;
  if (!post.postBody) return undefined;
  const count = post.postBody
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return count || undefined;
}

function authorJobTitle(author: { name: string; position?: string }): string | undefined {
  const role = author.position?.replace(/\s+/g, " ").trim();
  if (!role) return undefined;
  if (role.toLowerCase() === author.name.replace(/\s+/g, " ").trim().toLowerCase()) {
    return undefined;
  }
  return role;
}

export function articleJsonLd(post: CmsPost) {
  const origin = getSiteUrl();
  const published = post.publishedAt || undefined;
  const modified = editorialModifiedAt(post.publishedAt, post.updatedAt, post.createdAt);
  const role = post.author ? authorJobTitle(post.author) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.name,
    description: pageDescription(post.metaDescription || post.postSummary),
    image: localAssetUrl(post.mainImage || post.thumbnailImage),
    datePublished: published,
    ...(modified ? { dateModified: modified } : {}),
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
          ...(role ? { jobTitle: role } : {}),
          url: post.author.linkedin,
        }
      : { "@id": `${origin}/#organization` },
    publisher: { "@id": `${origin}/#organization` },
    mainEntityOfPage: absoluteUrl(postPath(post.slug)),
    articleSection: post.category?.name,
    keywords: post.tags.map((tag) => tag.name).filter(Boolean),
    wordCount: articleWordCount(post),
    timeRequired: post.minutesToRead ? `PT${post.minutesToRead}M` : undefined,
  };
}

function countryCodeFromLocation(location?: string): string | undefined {
  if (!location) return undefined;
  if (/bosnia|herzegovina|bih/i.test(location)) return "BA";
  if (/serbia/i.test(location)) return "RS";
  if (/macedonia|north macedonia/i.test(location)) return "MK";
  if (/united states|usa|new york|nyc/i.test(location)) return "US";
  return undefined;
}

const BALKAN_APPLICANT_COUNTRIES = [
  { "@type": "Country", name: "BA" },
  { "@type": "Country", name: "RS" },
  { "@type": "Country", name: "MK" },
  { "@type": "Country", name: "ME" },
];

export function jobJsonLd(job: CmsJob) {
  const title = job.jobTitle || job.name;
  const location = job.location || "";
  const balkansRemote = /balkan|western balkans/i.test(location) && /remote|hybrid|online/i.test(location);
  const remote = /remote|hybrid|online/i.test(location);
  const country = countryCodeFromLocation(location);
  const postedRaw = job.postedAt && /^\d{4}-\d{2}-\d{2}/.test(job.postedAt) ? job.postedAt : undefined;
  const datePosted =
    postedRaw && Date.parse(postedRaw) <= Date.now() ? postedRaw : undefined;
  const validThrough = jobDeadlineIso(job.applicationDeadline);

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description: job.descriptionText || job.excerpt || title,
    ...(datePosted ? { datePosted } : {}),
    ...(validThrough ? { validThrough } : {}),
    employmentType: employmentTypeForSchema(job.type),
    hiringOrganization: {
      "@type": "Organization",
      name: job.organization || SITE_NAME,
      sameAs: getSiteUrl(),
      logo: absoluteUrl(LOGO_PATH),
    },
    ...(balkansRemote
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: BALKAN_APPLICANT_COUNTRIES,
        }
      : remote
        ? {
            jobLocationType: "TELECOMMUTE",
            ...(country
              ? {
                  applicantLocationRequirements: {
                    "@type": "Country",
                    name: country,
                  },
                }
              : {}),
          }
        : {
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                streetAddress: "1412 Broadway, FL 21",
                addressLocality: "New York City",
                addressRegion: "NY",
                postalCode: "10018",
                addressCountry: country || "US",
              },
            },
          }),
    directApply: Boolean(job.applicationLink),
    url: absoluteUrl(careerPath(job.slug)),
  };
}

export function educationalProgramJsonLd(input: {
  name: string;
  path: string;
  description: string;
  location?: string;
  timeToComplete?: string;
  educationalProgramMode?: string;
  offers?: { price: string; priceCurrency: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: input.name,
    url: absoluteUrl(input.path),
    description: input.description,
    provider: { "@id": `${getSiteUrl()}/#organization` },
    educationalProgramMode: input.educationalProgramMode || "blended",
    ...(input.timeToComplete ? { timeToComplete: input.timeToComplete } : {}),
    occupationalCategory: "Entrepreneurship",
    ...(input.location
      ? {
          occupancyLocation: {
            "@type": "AdministrativeArea",
            name: input.location,
          },
        }
      : {}),
    ...(input.offers
      ? {
          offers: {
            "@type": "Offer",
            price: input.offers.price,
            priceCurrency: input.offers.priceCurrency,
          },
        }
      : {}),
  };
}

export function faqJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function faqPageJsonLd(
  _path: string,
  items: Array<{ question: string; answer: string }>
) {
  return faqJsonLd(items.map((item) => ({ q: item.question, a: item.answer })));
}

const STORYTELLING_SLUG =
  "how-to-use-storytelling-in-entrepreneurship-beyond-marketing";

export function postMetadata(post: CmsPost): Metadata {
  const title =
    post.slug === STORYTELLING_SLUG
      ? "How to use storytelling in entrepreneurship"
      : post.metaTitle || post.name;
  const published = post.publishedAt || undefined;
  const modified = editorialModifiedAt(post.publishedAt, post.updatedAt, post.createdAt);
  return routeMetadata({
    path: postPath(post.slug),
    title,
    description: post.metaDescription || post.postSummary,
    image: post.mainImage || post.thumbnailImage,
    imageAlt: post.name,
    type: "article",
    publishedTime: published,
    modifiedTime: modified,
    authors: post.author?.name ? [post.author.name] : undefined,
    extra: {
      authors: post.author?.name
        ? [{ name: post.author.name, url: post.author.linkedin }]
        : undefined,
    },
  });
}

export function alumniJsonLd(alumni: CmsAlumniSpotlight) {
  const name = alumni.alumniName || alumni.name;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${name} | Alumni Spotlight`,
    url: absoluteUrl(alumniPath(alumni.slug)),
    mainEntity: {
      "@type": "Person",
      name,
      description: alumni.oneLiner || alumni.whyStarted,
      image: alumni.profilePicture,
      nationality: alumni.country,
      worksFor: alumni.ventureName
        ? { "@type": "Organization", name: alumni.ventureName }
        : undefined,
      alumniOf: { "@id": `${getSiteUrl()}/#organization` },
    },
  };
}

export function collectionJsonLd(
  name: string,
  path: string,
  description: string,
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: absoluteUrl(path),
    description,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

export function alumniMetaDescription(alumni: CmsAlumniSpotlight): string {
  const name = alumni.alumniName || alumni.name;
  const venture = alumni.ventureName ? `, founder of ${alumni.ventureName}` : "";
  const country = alumni.country ? ` from ${alumni.country}` : "";
  const pitch = (alumni.oneLiner || alumni.whyStarted || "").replace(/\s+/g, " ").trim();
  const lead = `${name} is an EGC alum${venture}${country}.`;
  if (pitch) return pageDescription(`${lead} ${pitch}`);
  return pageDescription(
    `${lead} ${name} built a venture through Entrepreneurs for Global Change programs for young founders.`
  );
}

export function contactPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact EGC",
    url: absoluteUrl("/contact"),
    mainEntity: { "@id": `${getSiteUrl()}/#organization` },
  };
}

export function peopleJsonLd(
  people: Array<{ name: string; jobTitle?: string; sameAs?: string; image?: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: people.map((person, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: person.name,
        jobTitle: person.jobTitle,
        image: person.image,
        sameAs: person.sameAs ? [person.sameAs] : undefined,
        worksFor: { "@id": `${getSiteUrl()}/#organization` },
      },
    })),
  };
}

export function jobMetaDescription(job: CmsJob): string {
  const title = job.jobTitle || job.name;
  const org = job.organization || SITE_SHORT_NAME;
  const location = job.location ? ` in ${job.location}` : "";
  const type = job.type ? ` ${job.type}` : "";
  const excerpt = job.excerpt ? ` ${job.excerpt}` : "";
  return pageDescription(`${title} at ${org}${location}.${type}${excerpt}`);
}
