import type { Metadata } from "next";
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

export function clipText(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
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
  if (url.includes("website-files.com") || url.includes("cdn.prod.website-files.com")) {
    return absoluteUrl(fallback);
  }
  if (url.startsWith("/")) return absoluteUrl(url);
  if (/^https?:\/\//i.test(url)) return absoluteUrl(url);
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
      "https://www.instagram.com/egcnyc/",
      "https://www.facebook.com/egcnyc/",
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
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${origin}/about-us/insights?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
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

export function articleJsonLd(post: CmsPost) {
  const origin = getSiteUrl();
  const published = post.publishedAt || post.createdAt;
  const modified = post.updatedAt || post.publishedAt || post.createdAt;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.name,
    description: pageDescription(post.metaDescription || post.postSummary),
    image: localAssetUrl(post.mainImage || post.thumbnailImage),
    datePublished: published,
    dateModified: modified,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
          jobTitle: post.author.position,
          url: post.author.linkedin,
        }
      : { "@id": `${origin}/#organization` },
    publisher: { "@id": `${origin}/#organization` },
    mainEntityOfPage: absoluteUrl(postPath(post.slug)),
    articleSection: post.category?.name,
    keywords: post.tags.map((tag) => tag.name).filter(Boolean),
    wordCount: post.postBody
      ? post.postBody.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length
      : undefined,
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

export function jobJsonLd(job: CmsJob) {
  const title = job.jobTitle || job.name;
  const location = job.location || "";
  const remote = /remote|hybrid|balkan|online/i.test(location);
  const country = countryCodeFromLocation(location);
  const rawPosted =
    (job.createdAt && /^\d{4}-\d{2}-\d{2}/.test(job.createdAt) && job.createdAt) ||
    (job.startDate && /^\d{4}-\d{2}-\d{2}/.test(job.startDate) ? job.startDate : undefined);
  const datePosted =
    rawPosted && new Date(rawPosted).getTime() <= Date.now() ? rawPosted : undefined;
  const validThrough = job.applicationDeadline;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description: job.descriptionText || job.excerpt || title,
    datePosted: datePosted || validThrough || undefined,
    validThrough,
    employmentType: job.type || "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.organization || SITE_NAME,
      sameAs: getSiteUrl(),
      logo: absoluteUrl(LOGO_PATH),
    },
    jobLocation: remote
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressCountry: country || "BA",
            addressRegion: location,
          },
        }
      : {
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
    applicantLocationRequirements: country
      ? { "@type": "Country", name: country }
      : undefined,
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: input.name,
    url: absoluteUrl(input.path),
    description: input.description,
    provider: { "@id": `${getSiteUrl()}/#organization` },
    educationalProgramMode: input.educationalProgramMode || "blended",
    timeToComplete: input.timeToComplete || "P6M",
    occupationalCategory: "Entrepreneurship",
    ...(input.location
      ? {
          occupancyLocation: {
            "@type": "AdministrativeArea",
            name: input.location,
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

export function postMetadata(post: CmsPost): Metadata {
  return routeMetadata({
    path: postPath(post.slug),
    title: post.metaTitle || post.name,
    description: post.metaDescription || post.postSummary,
    image: post.mainImage || post.thumbnailImage,
    imageAlt: post.name,
    type: "article",
    publishedTime: post.publishedAt || post.createdAt,
    modifiedTime: post.updatedAt || post.publishedAt || post.createdAt,
    authors: post.author?.name ? [post.author.name] : undefined,
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
  const venture = alumni.ventureName ? ` of ${alumni.ventureName}` : "";
  const country = alumni.country ? ` from ${alumni.country}` : "";
  const pitch = alumni.oneLiner || alumni.whyStarted || "";
  return pageDescription(
    `${name} is an EGC alumni founder${venture}${country}. ${pitch}`.trim()
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
