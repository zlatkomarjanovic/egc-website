import type { Metadata } from "next";
import WebflowPage from "@/components/WebflowPage";
import content from "./content.json";

export const metadata: Metadata = {
  ...(content.metadata as Metadata),
  title: "Mentorship | Entrepreneurs for Global Change",
  description:
    "Learn how EGC mentorship supports young founders. The public mentor application lives at Become an EGC Mentor.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/become-an-egc-mentor" },
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
