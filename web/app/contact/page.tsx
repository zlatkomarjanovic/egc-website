import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { contentPageMetadata } from "@/lib/page-meta";
import { breadcrumbJsonLd, contactPageJsonLd } from "@/lib/seo";
import content from "./content.json";

export const metadata = contentPageMetadata("/contact", content.metadata);

export default function Page() {
  return (
    <>
      <JsonLd data={contactPageJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
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
