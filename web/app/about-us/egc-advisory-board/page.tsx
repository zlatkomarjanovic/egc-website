import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { contentPageMetadata } from "@/lib/page-meta";
import { breadcrumbJsonLd, getSiteUrl, peopleJsonLd } from "@/lib/seo";
import content from "./content.json";

export const metadata = contentPageMetadata(
  "/about-us/egc-advisory-board",
  content.metadata
);

const ADVISORS = [
  { name: "Emina Poricanin", jobTitle: "Advisor" },
  { name: "Ivan Burazin", jobTitle: "Advisor" },
  { name: "Jurica Bulovic", jobTitle: "Advisor" },
  { name: "Luka Babic", jobTitle: "Advisor" },
  { name: "Manas Gosavi", jobTitle: "Advisor" },
  { name: "Milana Kuzmanovic", jobTitle: "Advisor" },
  { name: "Sinisa Babcic", jobTitle: "Advisor" },
  {
    name: "Celine Krzan",
    jobTitle: "Clinical Assistant Professor of Entrepreneurship, UB",
    sameAs: "https://www.linkedin.com/in/celinekrzan",
    image: `${getSiteUrl()}/images/celine-krzan.jpg?v=2`,
  },
];

export default function Page() {
  return (
    <>
      <JsonLd data={peopleJsonLd(ADVISORS)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about-us" },
          { name: "Advisory Board", path: "/about-us/egc-advisory-board" },
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
