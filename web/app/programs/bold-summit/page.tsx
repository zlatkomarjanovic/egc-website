import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { contentPageMetadata, PAGE_META } from "@/lib/page-meta";
import { breadcrumbJsonLd, educationalProgramJsonLd } from "@/lib/seo";
import content from "./content.json";

const PATH = "/programs/bold-summit";
export const metadata = contentPageMetadata(PATH, content.metadata);

export default function Page() {
  return (
    <>
      <JsonLd
        data={educationalProgramJsonLd({
          name: "BOLD Summit",
          path: PATH,
          description: PAGE_META[PATH].description,
          location: "Western Balkans",
          timeToComplete: "P3D",
          educationalProgramMode: "onsite",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Programs", path: "/programs" },
          { name: "BOLD Summit", path: PATH },
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
