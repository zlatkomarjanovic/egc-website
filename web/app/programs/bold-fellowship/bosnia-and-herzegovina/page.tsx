import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import {
  alumniInCountry,
  injectAlumniSpotlightSlider,
  loadAlumniSpotlightsForFellowship,
} from "@/lib/cms";
import { BOLD_PROGRAM_FAQS, contentPageMetadata, PAGE_META } from "@/lib/page-meta";
import {
  alumniPath,
  breadcrumbJsonLd,
  collectionJsonLd,
  educationalProgramJsonLd,
  faqPageJsonLd,
} from "@/lib/seo";
import content from "./content.json";

const PATH = "/programs/bold-fellowship/bosnia-and-herzegovina";
const DESCRIPTION = PAGE_META[PATH].description;

export const metadata = contentPageMetadata(PATH, content.metadata);
export const revalidate = false;

export default async function Page() {
  const alumni = alumniInCountry(
    await loadAlumniSpotlightsForFellowship(),
    "Bosnia and Herzegovina"
  );
  const bodyHtml = injectAlumniSpotlightSlider(content.bodyHtml, alumni);

  return (
    <>
      <JsonLd
        data={educationalProgramJsonLd({
          name: "BOLD Fellowship Bosnia and Herzegovina",
          path: PATH,
          description: DESCRIPTION,
          location: "Bosnia and Herzegovina",
          educationalProgramMode: "blended",
        })}
      />
      <JsonLd data={faqPageJsonLd(PATH, BOLD_PROGRAM_FAQS)} />
      {alumni.length ? (
      <JsonLd
        data={collectionJsonLd(
          "BOLD Fellows from Bosnia and Herzegovina",
          PATH,
          DESCRIPTION,
          alumni.map((person) => ({
            name: person.alumniName || person.name,
            path: alumniPath(person.slug),
          }))
        )}
      />
      ) : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Programs", path: "/programs" },
          { name: "BOLD Fellowship", path: "/programs/bold-fellowship/general" },
          { name: "Bosnia and Herzegovina", path: PATH },
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
