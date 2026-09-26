import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { websiteJsonLd } from "@/lib/seo";
import content from "./content.json";

export const metadata: Metadata = content.metadata as unknown as Metadata;
export const revalidate = 60;

export default async function Page() {
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <WebflowPage
        headExtras={content.headExtras}
        bodyHtml={content.bodyHtml}
        rootClass={content.rootClass}
        scripts={content.scripts}
      />
    </>
  );
}
