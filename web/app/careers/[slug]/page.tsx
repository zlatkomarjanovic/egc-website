import type { Metadata } from "next";
import type { PortableTextBlock } from "@portabletext/react";
import InlineScripts from "@/components/InlineScripts";
import JsonLd from "@/components/JsonLd";
import CareerDetailView from "@/components/careers/CareerDetailView";
import PortableText from "@/components/PortableText";
import { getJobBySlug, getJobSlugs } from "@/lib/cms/jobs";
import { applyWebflowHtmlFixups } from "@/lib/cms/html-fixups";
import { stripSeoHeadExtras } from "@/lib/cms/seo-html-fixups";
import { splitNavAndFooter } from "@/lib/cms/shell";
import {
  sanityJobToCmsJob,
  type SanityJob,
} from "@/lib/cms/adapt-sanity";
import {
  breadcrumbJsonLd,
  careerPath,
  jobJsonLd,
  jobMetaDescription,
  routeMetadata,
} from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { jobBySlugQuery, jobSlugsQuery } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import content from "../../about-us/careers/content.json";

export const revalidate = 60;

type JobParam = { slug: string };

export async function generateStaticParams(): Promise<JobParam[]> {
  if (isSanityConfigured) {
    return (await sanityFetch<JobParam[]>(jobSlugsQuery, {}, [])) ?? [];
  }
  return getJobSlugs().map((slug) => ({ slug }));
}

async function loadJob(slug: string): Promise<{
  job: ReturnType<typeof sanityJobToCmsJob>;
  body?: PortableTextBlock[];
} | null> {
  if (isSanityConfigured) {
    const sanityJob = await sanityFetch<SanityJob>(jobBySlugQuery, { slug });
    if (!sanityJob?.slug) return null;
    return {
      job: sanityJobToCmsJob(sanityJob),
      body: sanityJob.detailedInstructions as PortableTextBlock[] | undefined,
    };
  }
  const cmsJob = getJobBySlug(slug);
  return cmsJob ? { job: cmsJob } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<JobParam>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadJob(slug);
  if (!loaded) return { title: "Not found", robots: { index: false, follow: false } };

  const title = loaded.job.jobTitle || loaded.job.name;
  return routeMetadata({
    path: careerPath(slug),
    title: `${title} | Careers`,
    description: jobMetaDescription(loaded.job),
    image: loaded.job.coverImage || "/images/egc-careers-cover.png",
    imageAlt: title,
  });
}

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<JobParam>;
}) {
  const { slug } = await params;
  const loaded = await loadJob(slug);
  if (!loaded) notFound();

  const { before, after } = splitNavAndFooter(content.bodyHtml);

  return (
    <>
      <JsonLd data={jobJsonLd(loaded.job)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Careers", path: "/about-us/careers" },
          { name: loaded.job.jobTitle || loaded.job.name, path: careerPath(slug) },
        ])}
      />
      <div className={content.rootClass}>
        <div dangerouslySetInnerHTML={{ __html: applyWebflowHtmlFixups(before) }} />
        <CareerDetailView
          job={loaded.job}
          body={
            loaded.body ? (
              <PortableText value={loaded.body} />
            ) : undefined
          }
        />
        <div dangerouslySetInnerHTML={{ __html: applyWebflowHtmlFixups(after) }} />
      </div>
      {content.headExtras ? (
        <div
          style={{ display: "contents" }}
          dangerouslySetInnerHTML={{ __html: stripSeoHeadExtras(content.headExtras) }}
        />
      ) : null}
      <InlineScripts scripts={content.scripts} />
    </>
  );
}
