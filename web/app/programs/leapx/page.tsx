import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { contentPageMetadata, LEAPX_PROGRAM_FAQS, PAGE_META } from "@/lib/page-meta";
import { breadcrumbJsonLd, educationalProgramJsonLd, faqPageJsonLd } from "@/lib/seo";
import content from "./content.json";

const PATH = "/programs/leapx";
export const metadata = contentPageMetadata(PATH, content.metadata);

export default function Page() {
  return (
    <>
      <JsonLd
        data={educationalProgramJsonLd({
          name: "LeapX AI Startup Bootcamp",
          path: PATH,
          description: PAGE_META[PATH].description,
          location: "Online and Canary Islands",
          timeToComplete: "P5W",
          educationalProgramMode: "blended",
          offers: {
            price: "5000",
            priceCurrency: "EUR",
            availability: "https://schema.org/SoldOut",
          },
        })}
      />
      <JsonLd data={faqPageJsonLd(PATH, LEAPX_PROGRAM_FAQS)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Programs", path: "/programs" },
          { name: "LeapX", path: PATH },
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
