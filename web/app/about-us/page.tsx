import HubPage from "@/components/HubPage";
import { contentPageMetadata } from "@/lib/page-meta";
import content from "./mission-and-vision/content.json";

export const metadata = contentPageMetadata("/about-us", content.metadata);

export default function Page() {
  return (
    <HubPage
      title="About EGC"
      description="Entrepreneurs for Global Change is a New York nonprofit that trains young founders from emerging ecosystems."
      path="/about-us"
      crumbs={[
        { name: "Home", path: "/" },
        { name: "About", path: "/about-us" },
      ]}
      links={[
        {
          href: "/about-us/mission-and-vision",
          name: "Mission and Vision",
          description: "Why EGC exists and how the organization supports young founders.",
        },
        {
          href: "/about-us/egc-board-of-directors",
          name: "Board of Directors",
          description: "The board leading Entrepreneurs for Global Change.",
        },
        {
          href: "/about-us/egc-advisory-board",
          name: "Advisory Board",
          description: "Advisors supporting EGC programs and strategy.",
        },
        {
          href: "/about-us/insights",
          name: "Insights",
          description: "Articles on youth entrepreneurship and founder stories.",
        },
        {
          href: "/about-us/careers",
          name: "Careers",
          description: "Open roles on the EGC team.",
        },
        {
          href: "/programs",
          name: "Programs",
          description: "BOLD Fellowship, LeapX, Scale 2.0, and other EGC founder programs.",
        },
        {
          href: "/alumni",
          name: "Alumni",
          description: "Stories from EGC alums who built ventures through the programs.",
        },
      ]}
    />
  );
}
