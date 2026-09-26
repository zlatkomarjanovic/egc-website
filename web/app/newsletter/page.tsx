import type { Metadata } from "next";
import WebflowPage from "@/components/WebflowPage";
import content from "./content.json";

export const metadata: Metadata = {
  ...(content.metadata as Metadata),
  title: "EGC Newsletter | Entrepreneurs for Global Change",
  description:
    "Follow EGC updates on youth entrepreneurship programs, alumni stories, and upcoming fellowships.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={content.bodyHtml}
      rootClass={content.rootClass}
      scripts={content.scripts}
    />
  );
}
