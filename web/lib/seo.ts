import type { Metadata } from "next";
import type { CmsAlumniSpotlight, CmsJob, CmsPost } from "@/lib/cms/types";

export const SITE_NAME = "Entrepreneurs for Global Change";
export const SITE_SHORT_NAME = "EGC";
export const DEFAULT_TITLE = "EGC | Entrepreneurs for Global Change";
export const DEFAULT_DESCRIPTION =
  "EGC empowers aspiring young founders from emerging global ecosystems to plant seeds of positive change, driving innovation with a sustainable future.";
export const DEFAULT_OG_IMAGE =
  "https://cdn.prod.website-files.com/66d4e22ac15d3fd6dc4e0b06/66d4fd87e9cbcd03c6cf6799_image%2039.png";
export const LOGO_URL =
  "https://www.egcnyc.org/images/path12.svg";

export const SOCIAL_PROFILES = [
  "https://www.youtube.com/@egcnyc",
  "https://www.linkedin.com/company/entrepreneurs-for-global-change/",
  "https://www.instagram.com/egc.nyc/",
] as const;

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://www.egcnyc.org";
  try {
    const url = new URL(raw);
    if (url.hostname === "egcnyc.org") {
      url.hostname = "www.egcnyc.org";
    }
    return url.origin.replace(/\/$/, "");
  } catch {
    return "https://www.egcnyc.org";
  }
}

export function absoluteUrl(path = "/"): string {
  const site = getSiteUrl();
  if (!path || path === "/") return site;
  return `${site}${path.startsWith("/") ? path : `/${path}`}`;
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

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    "@id": `${absoluteUrl("/")}#organization`,
    name: SITE_NAME,
    alternateName: SITE_SHORT_NAME,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
      caption: "EGC logo",
    },
    description: DEFAULT_DESCRIPTION,
    slogan: "Discover your inner entrepreneur and change the world",
    inLanguage: "en",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1412 Broadway, FL 21",
      addressLocality: "New York City",
      addressRegion: "NY",
      postalCode: "10018",
      addressCountry: "US",
    },
    telephone: "+1-347-990-2142",
    email: "info@egcnyc.org",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-347-990-2142",
      email: "info@egcnyc.org",
      contactType: "customer service",
      areaServed: ["US", "BA", "RS", "MK", "HR", "ME", "AL", "XK"],
      availableLanguage: ["English"],
    },
    sameAs: [...SOCIAL_PROFILES],
    foundingLocation: {
      "@type": "Place",
      name: "New York City",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_SHORT_NAME,
    url: absoluteUrl("/"),
    inLanguage: "en",
    publisher: {
      "@id": `${absoluteUrl("/")}#organization`,
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
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
  const url = absoluteUrl(postPath(post.slug));
  const image = post.mainImage || post.thumbnailImage || DEFAULT_OG_IMAGE;
  const published = post.publishedAt || post.createdAt;
  const authors = [post.author, ...post.coAuthors].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.name,
    description: post.metaDescription || post.postSummary || DEFAULT_DESCRIPTION,
    image,
    datePublished: published,
    dateModified: published,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    inLanguage: "en",
    author: authors.length
      ? authors.map((author) => ({
          "@type": "Person",
          name: author?.name,
          jobTitle: author?.position,
          url: author?.linkedin,
          sameAs: author?.linkedin ? [author.linkedin] : undefined,
        }))
      : {
          "@type": "Organization",
          name: SITE_NAME,
          url: absoluteUrl("/"),
        },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
  };
}

export function collectionJsonLd(
  name: string,
  path: string,
  description: string,
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

export function postMetadata(post: CmsPost): Metadata {
  const title = post.metaTitle || post.name;
  const description = post.metaDescription || post.postSummary || DEFAULT_DESCRIPTION;
  const image = post.mainImage || post.thumbnailImage || DEFAULT_OG_IMAGE;
  const published = post.publishedAt || post.createdAt;
  const canonical = postPath(post.slug);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      publishedTime: published,
      modifiedTime: published,
      authors: [post.author?.name, ...post.coAuthors.map((author) => author.name)].filter(
        Boolean
      ) as string[],
      images: [{ url: image, alt: post.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

function employmentType(type?: string): string {
  const value = (type || "").toLowerCase();
  if (value.includes("part")) return "PART_TIME";
  if (value.includes("intern")) return "INTERN";
  if (value.includes("contract") || value.includes("freelance")) return "CONTRACTOR";
  if (value.includes("temp")) return "TEMPORARY";
  return "FULL_TIME";
}

export function jobJsonLd(job: CmsJob) {
  const title = job.jobTitle || job.name;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description: job.excerpt || title,
    url: absoluteUrl(careerPath(job.slug)),
    identifier: job.slug,
    hiringOrganization: {
      "@type": "Organization",
      name: job.organization || SITE_NAME,
      sameAs: absoluteUrl("/"),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "New York City",
        addressCountry: "US",
      },
    },
    image: job.coverImage || absoluteUrl("/images/egc-careers-cover.png"),
    employmentType: employmentType(job.type),
    validThrough: job.applicationDeadline,
    datePosted: job.startDate,
    applicantLocationRequirements: job.location
      ? { "@type": "Text", name: job.location }
      : undefined,
    directApply: Boolean(job.applicationLink),
  };
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
      jobTitle: alumni.ventureName,
      homeLocation: alumni.country
        ? { "@type": "Place", name: alumni.country }
        : undefined,
    },
  };
}

export function faqPageJsonLd(path: string, faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: absoluteUrl(path),
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function educationalProgramJsonLd(input: {
  name: string;
  path: string;
  description: string;
  location?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: {
      "@id": `${absoluteUrl("/")}#organization`,
      name: SITE_NAME,
    },
    educationalProgramMode: "Onsite",
    occupationalCredentialAwarded: "Certificate of completion",
    timeToComplete: "P3M",
    ...(input.location
      ? {
          location: {
            "@type": "Place",
            name: input.location,
          },
        }
      : {}),
  };
}
