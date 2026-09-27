import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { injectCareersList } from "@/lib/cms/collection-html";
import { getAllJobs } from "@/lib/cms/jobs";
import {
  sanityJobToCmsJob,
  type SanityJob,
} from "@/lib/cms/adapt-sanity";
import { contentPageMetadata, PAGE_META } from "@/lib/page-meta";
import {
  breadcrumbJsonLd,
  careerPath,
  collectionJsonLd,
} from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { openJobsQuery } from "@/sanity/lib/queries";
import content from "./content.json";

const CAREERS_DESCRIPTION = PAGE_META["/about-us/careers"].description;

export const metadata = contentPageMetadata("/about-us/careers", content.metadata);
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
