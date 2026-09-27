import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { contentPageMetadata, PAGE_META } from "@/lib/page-meta";
import { collectionJsonLd } from "@/lib/seo";
import content from "./content.json";

const PROGRAMS = [
  { name: "BOLD Fellowship", path: "/programs/bold-fellowship/general" },
  { name: "BOLD Regional Workshops", path: "/programs/bold-regional-workshops" },
  { name: "BOLD Summit", path: "/programs/bold-summit" },
  { name: "Scale 2.0", path: "/programs/scale-2-0" },
  { name: "LeapX", path: "/programs/leapx" },
  { name: "University Partnership Program", path: "/programs/university-partnership-program" },
];

export const metadata = contentPageMetadata("/", content.metadata);
export const revalidate = 60;

export default async function Page() {
  return (
    <>
      <JsonLd
        data={collectionJsonLd(
          "EGC programs",
          "/",
          `${PAGE_META["/"].description} This page lists 85 alumni members.`,
          PROGRAMS
        )}
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
