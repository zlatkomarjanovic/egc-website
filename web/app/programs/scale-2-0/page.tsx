import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import {
  breadcrumbJsonLd,
  educationalProgramJsonLd,
  faqPageJsonLd,
} from "@/lib/seo";
import content from "./content.json";

const SCALE_TITLE = "Scale 2.0 | Fully Funded Startup Incubator for Croatian Founders";
const SCALE_DESCRIPTION =
  "Scale 2.0 is EGC's fully funded incubator for early-stage Croatian founders. The program includes a Vodnjan bootcamp, a New York City week, and a SHIFT pitch, with no equity taken.";

export const metadata: Metadata = {
  ...(content.metadata as Metadata),
  title: SCALE_TITLE,
  description: SCALE_DESCRIPTION,
  alternates: { canonical: "/programs/scale-2-0" },
  openGraph: {
    ...(content.metadata as Metadata).openGraph,
    title: SCALE_TITLE,
    description: SCALE_DESCRIPTION,
    type: "website",
  },
  twitter: {
    ...(content.metadata as Metadata).twitter,
    card: "summary_large_image",
    title: SCALE_TITLE,
    description: SCALE_DESCRIPTION,
  },
};

const SCALE_FAQS = [
  {
    question: "How and when can I apply for Scale 2.0?",
    answer:
      "You can apply via the EGC website by completing the application form. Follow EGC on LinkedIn and watch the site for specific deadlines.",
  },
  {
    question: "Who is eligible to apply for Scale 2.0?",
    answer:
      "Scale 2.0 is open to early-stage founders based in Croatia. Startups need two founders who are at least 21, a developed MVP, validated product-market fit, an early go-to-market plan, and some traction.",
  },
  {
    question: "What expenses are covered by the incubator?",
    answer:
      "Scale 2.0 is fully funded. Travel, accommodation, meals, and program activities in Croatia and New York City are covered. EGC takes no equity.",
  },
  {
    question: "How long is the incubator and what does it include?",
    answer:
      "The program has three parts: five days at Infobip in Vodnjan, six days in New York City, and a pitch session at SHIFT in Zadar.",
  },
];

export default function Page() {
  return (
    <>
      <JsonLd
        data={educationalProgramJsonLd({
          name: "Scale 2.0",
          path: "/programs/scale-2-0",
          description: SCALE_DESCRIPTION,
          location: "Croatia and New York City",
        })}
      />
      <JsonLd data={faqPageJsonLd("/programs/scale-2-0", SCALE_FAQS)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Scale 2.0", path: "/programs/scale-2-0" },
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
