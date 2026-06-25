import type { Metadata } from "next";
import WebflowPage from "@/components/WebflowPage";
import { injectMentorsList } from "@/lib/cms/collection-html";
import { getAllMentors } from "@/lib/cms/mentors";
import {
  sanityMentorToCmsMentor,
  type SanityMentor,
} from "@/lib/cms/adapt-sanity";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { allMentorsQuery } from "@/sanity/lib/queries";
import content from "./content.json";

export const metadata: Metadata = content.metadata as unknown as Metadata;
export const revalidate = 60;

export default async function Page() {
  const sanityMentors = isSanityConfigured
    ? await sanityFetch<SanityMentor[]>(allMentorsQuery, {}, [])
    : null;
  const mentors =
    sanityMentors !== null
      ? sanityMentors.map(sanityMentorToCmsMentor)
      : getAllMentors();
  const bodyHtml = injectMentorsList(content.bodyHtml, mentors);

  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={bodyHtml}
      rootClass={content.rootClass}
      scripts={content.scripts}
    />
  );
}
