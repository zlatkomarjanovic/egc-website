import HubPage from "@/components/HubPage";
import { loadAlumniSpotlightsForFellowship } from "@/lib/cms";
import { contentPageMetadata } from "@/lib/page-meta";
import { alumniPath } from "@/lib/seo";
import content from "../about-us/mission-and-vision/content.json";

export const metadata = contentPageMetadata("/alumni", content.metadata);
export const revalidate = 60;

export default async function Page() {
  const alumni = await loadAlumniSpotlightsForFellowship();

  return (
    <HubPage
      title="Alumni Spotlight"
      description="Founders who came through EGC programs and are building ventures in emerging ecosystems."
      path="/alumni"
      crumbs={[
        { name: "Home", path: "/" },
        { name: "Alumni", path: "/alumni" },
      ]}
      links={alumni.map((person) => ({
        href: alumniPath(person.slug),
        name: person.alumniName || person.name,
        description:
          person.oneLiner ||
          [person.ventureName, person.country].filter(Boolean).join(" · ") ||
          "EGC alumni founder.",
      }))}
    />
  );
}
