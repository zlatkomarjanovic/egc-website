import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { injectCareersList } from "@/lib/cms/collection-html";
import { DEFAULT_CAREERS_COVER, getAllJobs } from "@/lib/cms/jobs";
import {
  sanityJobToCmsJob,
  type SanityJob,
} from "@/lib/cms/adapt-sanity";
import {
  breadcrumbJsonLd,
  careerPath,
  collectionJsonLd,
} from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { openJobsQuery } from "@/sanity/lib/queries";
import content from "./content.json";

const CAREERS_TITLE = "EGC Careers | Jobs at Entrepreneurs for Global Change";
const CAREERS_DESCRIPTION =
  "Open roles at Entrepreneurs for Global Change in New York. Join the team supporting young founders across emerging startup ecosystems.";

export const metadata: Metadata = {
  ...(content.metadata as Metadata),
  title: CAREERS_TITLE,
  description: CAREERS_DESCRIPTION,
  alternates: { canonical: "/about-us/careers" },
  openGraph: {
    ...(content.metadata as Metadata).openGraph,
    title: CAREERS_TITLE,
    description: CAREERS_DESCRIPTION,
    type: "website",
    images: [{ url: DEFAULT_CAREERS_COVER, alt: "EGC careers team" }],
  },
  twitter: {
    ...(content.metadata as Metadata).twitter,
    card: "summary_large_image",
    title: CAREERS_TITLE,
    description: CAREERS_DESCRIPTION,
    images: [DEFAULT_CAREERS_COVER],
  },
};
export const revalidate = 60;

export default async function Page() {
  const sanityJobs = isSanityConfigured
    ? await sanityFetch<SanityJob[]>(openJobsQuery, {}, [])
    : null;
  const jobs =
    sanityJobs !== null ? sanityJobs.map(sanityJobToCmsJob) : getAllJobs();
  const bodyHtml = injectCareersList(content.bodyHtml, jobs);

  return (
    <>
      <JsonLd
        data={collectionJsonLd(
          "EGC Careers",
          "/about-us/careers",
          CAREERS_DESCRIPTION,
          jobs.map((job) => ({
            name: job.jobTitle || job.name,
            path: careerPath(job.slug),
          }))
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Careers", path: "/about-us/careers" },
        ])}
      />
      <WebflowPage
        headExtras={content.headExtras}
        bodyHtml={bodyHtml}
        rootClass={content.rootClass}
        scripts={content.scripts}
      />
    </>
  );
}
