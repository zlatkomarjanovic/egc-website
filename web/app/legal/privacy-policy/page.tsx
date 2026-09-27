import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { contentPageMetadata, LEGAL_LASTMOD, PAGE_META } from "@/lib/page-meta";
import { webPageJsonLd } from "@/lib/seo";
import content from "./content.json";

export const metadata = contentPageMetadata("/legal/privacy-policy", content.metadata, {
  modifiedTime: LEGAL_LASTMOD,
});

export default function Page() {
  const copy = PAGE_META["/legal/privacy-policy"];
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          name: copy.title,
          path: "/legal/privacy-policy",
          description: copy.description,
          dateModified: LEGAL_LASTMOD,
        })}
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
