import WebflowPage from "@/components/WebflowPage";
import { injectPartnerLists } from "@/lib/cms/collection-html";
import { getAllPartners, getPartnersByType } from "@/lib/cms/partners";
import {
  sanityPartnerToCmsPartner,
  type SanityPartner,
} from "@/lib/cms/adapt-sanity";
import { contentPageMetadata } from "@/lib/page-meta";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { allPartnersQuery } from "@/sanity/lib/queries";
import content from "./content.json";

export const metadata = contentPageMetadata("/partners", content.metadata);
export const revalidate = 60;

export default async function Page() {
  const sanityPartners = isSanityConfigured
    ? await sanityFetch<SanityPartner[]>(allPartnersQuery, {}, [])
    : null;
  const partners =
    sanityPartners !== null
      ? sanityPartners.map(sanityPartnerToCmsPartner)
      : getAllPartners();

  const sortedPartners = [...partners].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
  const programPartners = sortedPartners.filter((p) => p.type === "Program Partner");
  const globalPartners = sortedPartners.filter((p) => p.type === "Global Partner");

  const bodyHtml = injectPartnerLists(
    content.bodyHtml,
    programPartners.length
      ? programPartners
      : sanityPartners !== null
        ? []
        : getPartnersByType("Program Partner"),
    globalPartners.length
      ? globalPartners
      : sanityPartners !== null
        ? []
        : getPartnersByType("Global Partner")
  );

  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={bodyHtml}
      rootClass={content.rootClass}
      scripts={content.scripts}
    />
  );
}
