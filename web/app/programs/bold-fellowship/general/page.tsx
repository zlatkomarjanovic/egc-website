import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { injectAlumniSpotlightSlider, loadAlumniSpotlightsForFellowship } from "@/lib/cms";
import { alumniPath, breadcrumbJsonLd, collectionJsonLd, educationalProgramJsonLd } from "@/lib/seo";
import content from "./content.json";

const TITLE = "BOLD Fellowship for Entrepreneurship | EGC Program";
const DESCRIPTION =
  "The BOLD Fellowship for Entrepreneurship is an EGC and U.S. Department of State program for young founders in Bosnia and Herzegovina, North Macedonia, and Serbia.";

export const metadata: Metadata = {
  ...(content.metadata as Metadata),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    ...(content.metadata as Metadata).openGraph,
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    ...(content.metadata as Metadata).twitter,
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};
export const revalidate = 60;

export default async function Page() {
  const alumni = await loadAlumniSpotlightsForFellowship();
  const bodyHtml = injectAlumniSpotlightSlider(content.bodyHtml, alumni);

  return (
    <>
      <JsonLd
        data={educationalProgramJsonLd({
          name: "BOLD Fellowship for Entrepreneurship",
          path: "/programs/bold-fellowship/general",
          description: DESCRIPTION,
          location: "Western Balkans",
        })}
      />
      <JsonLd
        data={collectionJsonLd(
          "Hear more from the BOLD Fellows",
          "/programs/bold-fellowship/general",
          DESCRIPTION,
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
