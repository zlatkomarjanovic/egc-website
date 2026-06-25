import type { Metadata } from "next";
import WebflowPage from "@/components/WebflowPage";
import { injectAlumniSpotlightSlider, loadAlumniSpotlightsForFellowship } from "@/lib/cms";
import content from "./content.json";

export const metadata: Metadata = content.metadata as unknown as Metadata;
export const revalidate = 60;

export default async function Page() {
  const alumni = await loadAlumniSpotlightsForFellowship();
  const bodyHtml = injectAlumniSpotlightSlider(content.bodyHtml, alumni);

  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={bodyHtml}
      rootClass={content.rootClass}
      scripts={content.scripts}
    />
  );
}
