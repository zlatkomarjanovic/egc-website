import type { Metadata } from "next";
import WebflowPage from "@/components/WebflowPage";
import { injectCareersList } from "@/lib/cms/collection-html";
import { getAllJobs } from "@/lib/cms/jobs";
import {
  sanityJobToCmsJob,
  type SanityJob,
} from "@/lib/cms/adapt-sanity";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { openJobsQuery } from "@/sanity/lib/queries";
import content from "./content.json";

export const metadata: Metadata = content.metadata as unknown as Metadata;
export const revalidate = 60;

export default async function Page() {
  const sanityJobs = isSanityConfigured
    ? await sanityFetch<SanityJob[]>(openJobsQuery, {}, [])
    : null;
  const jobs =
    sanityJobs !== null ? sanityJobs.map(sanityJobToCmsJob) : getAllJobs();
  const bodyHtml = injectCareersList(content.bodyHtml, jobs);

  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={bodyHtml}
      rootClass={content.rootClass}
      scripts={content.scripts}
    />
  );
}
