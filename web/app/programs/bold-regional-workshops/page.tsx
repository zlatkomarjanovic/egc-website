import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { BOLD_PROGRAM_FAQS, contentPageMetadata, PAGE_META } from "@/lib/page-meta";
import { breadcrumbJsonLd, educationalProgramJsonLd, faqPageJsonLd } from "@/lib/seo";
import content from "./content.json";

const PATH = "/programs/bold-regional-workshops";
export const metadata = contentPageMetadata(PATH, content.metadata);

export default function Page() {
  return (
    <>
      <JsonLd
        data={educationalProgramJsonLd({
          name: "BOLD Regional Workshops",
          path: PATH,
          description: PAGE_META[PATH].description,
          location: "Western Balkans",
          timeToComplete: "P3D",
          educationalProgramMode: "onsite",
        })}
      />
      <JsonLd data={faqPageJsonLd(PATH, BOLD_PROGRAM_FAQS)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Programs", path: "/programs" },
          { name: "BOLD Regional Workshops", path: PATH },
        ])}
      />
      <WebflowPage
        headExtras={content.headExtras}
        bodyHtml={content.bodyHtml}
        rootClass={content.rootClass}
        scripts={content.scripts}
      />
    </>
  );
}
