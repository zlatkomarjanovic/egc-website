import type { Metadata } from "next";
import InlineScripts from "@/components/InlineScripts";
import JsonLd from "@/components/JsonLd";
import AlumniSpotlightView from "@/components/alumni/AlumniSpotlightView";
import {
  getAllAlumniSpotlights,
  getAlumniBySlug,
  getAlumniSlugs,
} from "@/lib/cms/alumni-spotlights";
import { applyWebflowHtmlFixups } from "@/lib/cms/html-fixups";
import { stripSeoHeadExtras } from "@/lib/cms/seo-html-fixups";
import { splitNavAndFooter } from "@/lib/cms/shell";
import {
  sanityAlumniToCmsAlumni,
  type SanityAlumniSpotlight,
} from "@/lib/cms/adapt-sanity";
import {
  alumniJsonLd,
  alumniMetaDescription,
  alumniPath,
  breadcrumbJsonLd,
  routeMetadata,
} from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import {
  allAlumniSpotlightsQuery,
  alumniBySlugQuery,
  alumniSlugsQuery,
} from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import content from "../../programs/bold-fellowship/general/content.json";

export const revalidate = 60;

type AlumniParam = { slug: string };

export async function generateStaticParams(): Promise<AlumniParam[]> {
  if (isSanityConfigured) {
    return (await sanityFetch<AlumniParam[]>(alumniSlugsQuery, {}, [])) ?? [];
  }
  return getAlumniSlugs().map((slug) => ({ slug }));
}

async function loadAlumni(slug: string) {
  if (isSanityConfigured) {
    const item = await sanityFetch<SanityAlumniSpotlight>(alumniBySlugQuery, { slug });
    return item?.slug ? sanityAlumniToCmsAlumni(item) : null;
  }
  return getAlumniBySlug(slug) ?? null;
}

async function loadRelated(slug: string) {
  if (isSanityConfigured) {
    const items =
      (await sanityFetch<SanityAlumniSpotlight[]>(allAlumniSpotlightsQuery, {}, [])) ?? [];
    return items
      .filter((item) => item.slug && item.slug !== slug)
      .map(sanityAlumniToCmsAlumni)
      .slice(0, 8);
  }
  return getAllAlumniSpotlights()
    .filter((item) => item.slug !== slug)
    .slice(0, 8);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<AlumniParam>;
}): Promise<Metadata> {
  const { slug } = await params;
  const alumni = await loadAlumni(slug);
  if (!alumni) return { title: "Not found", robots: { index: false, follow: false } };

  const name = alumni.alumniName || alumni.name;
  return routeMetadata({
    path: alumniPath(slug),
    title: `${name} | Alumni Spotlight`,
    description: alumniMetaDescription(alumni),
    image: alumni.profilePicture,
    imageAlt: alumni.profilePictureAlt || name,
  });
}

export default async function AlumniSpotlightPage({
  params,
}: {
  params: Promise<AlumniParam>;
}) {
  const { slug } = await params;
  const alumni = await loadAlumni(slug);
  if (!alumni) notFound();
  const related = await loadRelated(slug);
  const { before, after } = splitNavAndFooter(content.bodyHtml);

  return (
    <>
      <JsonLd data={alumniJsonLd(alumni)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "BOLD Fellowship", path: "/programs/bold-fellowship/general" },
          { name: alumni.alumniName || alumni.name, path: alumniPath(slug) },
        ])}
      />
      <div className={`${content.rootClass} alumni-spotlight-page`}>
        <div dangerouslySetInnerHTML={{ __html: applyWebflowHtmlFixups(before) }} />
        <AlumniSpotlightView alumni={alumni} related={related} />
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
