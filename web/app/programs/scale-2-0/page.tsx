import JsonLd from "@/components/JsonLd";
import WebflowPage from "@/components/WebflowPage";
import { contentPageMetadata, PAGE_META } from "@/lib/page-meta";
import {
  breadcrumbJsonLd,
  educationalProgramJsonLd,
  faqPageJsonLd,
} from "@/lib/seo";
import content from "./content.json";

const PATH = "/programs/scale-2-0";
const DESCRIPTION = PAGE_META[PATH].description;

export const metadata = contentPageMetadata(PATH, content.metadata);

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
          path: PATH,
          description: DESCRIPTION,
          location: "Croatia and New York City",
          timeToComplete: "P3W",
          educationalProgramMode: "blended",
        })}
      />
      <JsonLd data={faqPageJsonLd(PATH, SCALE_FAQS)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Programs", path: "/programs" },
          { name: "Scale 2.0", path: PATH },
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
