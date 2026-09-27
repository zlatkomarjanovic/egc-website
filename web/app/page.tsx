import WebflowPage from "@/components/WebflowPage";
import { contentPageMetadata } from "@/lib/page-meta";
import content from "./content.json";

export const metadata = contentPageMetadata("/", content.metadata);
export const revalidate = 60;

export default async function Page() {
  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={content.bodyHtml}
      rootClass={content.rootClass}
      scripts={content.scripts}
    />
  );
}
