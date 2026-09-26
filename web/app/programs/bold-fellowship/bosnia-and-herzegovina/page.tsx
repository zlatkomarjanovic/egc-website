import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { injectAlumniSpotlightSlider, loadAlumniSpotlightsForFellowship } from "@/lib/cms";
import { alumniPath, breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo";
import content from "./content.json";

export const metadata: Metadata = {
  ...(content.metadata as Metadata),
  description:
    "BOLD Fellowship Bosnia and Herzegovina is an EGC entrepreneurship program for young founders. Hear from alumni and learn how the fellowship works.",
};
export const revalidate = 60;

export default async function Page() {
  const alumni = await loadAlumniSpotlightsForFellowship();
  const bodyHtml = injectAlumniSpotlightSlider(content.bodyHtml, alumni);

  return (
    <>
      <JsonLd
        data={collectionJsonLd(
          "BOLD Fellows",
          "/programs/bold-fellowship/bosnia-and-herzegovina",
          "Stories from BOLD Fellowship alumni.",
          alumni.map((person) => ({
            name: person.alumniName || person.name,
            path: alumniPath(person.slug),
          }))
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "BOLD Fellowship", path: "/programs/bold-fellowship/general" },
          {
            name: "Bosnia and Herzegovina",
            path: "/programs/bold-fellowship/bosnia-and-herzegovina",
          },
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
