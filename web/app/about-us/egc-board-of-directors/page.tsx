import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { contentPageMetadata } from "@/lib/page-meta";
import { breadcrumbJsonLd, peopleJsonLd } from "@/lib/seo";
import content from "./content.json";

export const metadata = contentPageMetadata(
  "/about-us/egc-board-of-directors",
  content.metadata
);

const DIRECTORS = [
  { name: "Sabina Ceric", jobTitle: "Board Director" },
  { name: "Tijana Trkulja", jobTitle: "Board Director" },
  { name: "Filip Sasic", jobTitle: "CEO and Founder", sameAs: "https://www.linkedin.com/in/filipsasic/" },
  { name: "Mirza Tihic", jobTitle: "Board Director" },
];

export default function Page() {
  return (
    <>
      <JsonLd data={peopleJsonLd(DIRECTORS)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about-us" },
          { name: "Board of Directors", path: "/about-us/egc-board-of-directors" },
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
