import type { Metadata } from "next";
import WebflowPage from "@/components/WebflowPage";
import content from "./content.json";

export const metadata: Metadata = content.metadata as unknown as Metadata;

export default function Page() {
  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={content.bodyHtml}
      scripts={content.scripts}
    />
  );
}
