import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { contentPageMetadata, PAGE_META } from "@/lib/page-meta";
import { breadcrumbJsonLd, educationalProgramJsonLd } from "@/lib/seo";
import content from "./content.json";

const PATH = "/programs/university-partnership-program";
export const metadata = contentPageMetadata(PATH, content.metadata);

export default function Page() {
  return (
    <>
      <JsonLd
        data={educationalProgramJsonLd({
          name: "University Partnership Program",
          path: PATH,
          description: PAGE_META[PATH].description,
          educationalProgramMode: "blended",
          timeToComplete: "P1Y",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Programs", path: "/programs" },
          { name: "University Partnership Program", path: PATH },
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
