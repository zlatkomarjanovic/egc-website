import type { Metadata } from "next";
import WebflowPage from "@/components/WebflowPage";
import {
  injectHomeFeaturedAlumni,
  loadFeaturedAlumniSpotlights,
} from "@/lib/cms";
import content from "./content.json";

export const metadata: Metadata = content.metadata as unknown as Metadata;
export const revalidate = 60;

export default async function Page() {
  const featuredAlumni = await loadFeaturedAlumniSpotlights();
  const bodyHtml = injectHomeFeaturedAlumni(content.bodyHtml, featuredAlumni);

  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={bodyHtml}
      rootClass={content.rootClass}
      scripts={content.scripts}
    />
  );
}
