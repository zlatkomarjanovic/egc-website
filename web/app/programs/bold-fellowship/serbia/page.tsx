import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { injectAlumniSpotlightSlider, loadAlumniSpotlightsForFellowship } from "@/lib/cms";
import { BOLD_PROGRAM_FAQS, contentPageMetadata, PAGE_META } from "@/lib/page-meta";
import {
  alumniPath,
  breadcrumbJsonLd,
  collectionJsonLd,
  educationalProgramJsonLd,
  faqPageJsonLd,
} from "@/lib/seo";
import content from "./content.json";

const PATH = "/programs/bold-fellowship/serbia";
const DESCRIPTION = PAGE_META[PATH].description;

export const metadata = contentPageMetadata(PATH, content.metadata);
export const revalidate = 60;

export default async function Page() {
  const alumni = await loadAlumniSpotlightsForFellowship();
  const bodyHtml = injectAlumniSpotlightSlider(content.bodyHtml, alumni);

  return (
    <>
      <JsonLd
        data={educationalProgramJsonLd({
          name: "BOLD Fellowship Serbia",
          path: PATH,
          description: DESCRIPTION,
          location: "Serbia",
          timeToComplete: "P6M",
          educationalProgramMode: "blended",
        })}
      />
      <JsonLd data={faqPageJsonLd(PATH, BOLD_PROGRAM_FAQS)} />
      <JsonLd
        data={collectionJsonLd(
          "BOLD Fellows",
          PATH,
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
          { name: "Programs", path: "/programs" },
          { name: "BOLD Fellowship", path: "/programs/bold-fellowship/general" },
          { name: "Serbia", path: PATH },
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
