import HubPage from "@/components/HubPage";
import { contentPageMetadata } from "@/lib/page-meta";
import content from "./bold-fellowship/general/content.json";

export const metadata = contentPageMetadata("/programs", content.metadata);

export default function Page() {
  return (
    <HubPage
      title="EGC Programs"
      description="Fellowships, workshops, incubators, and bootcamps for young founders from emerging ecosystems."
      path="/programs"
      crumbs={[
        { name: "Home", path: "/" },
        { name: "Programs", path: "/programs" },
      ]}
      links={[
        {
          href: "/programs/bold-fellowship/general",
          name: "BOLD Fellowship",
          description: "A U.S. Department of State partnership for Western Balkans founders.",
        },
        {
          href: "/programs/bold-fellowship/bosnia-and-herzegovina",
          name: "BOLD Fellowship Bosnia and Herzegovina",
          description: "Country track for founders in Bosnia and Herzegovina.",
        },
        {
          href: "/programs/bold-fellowship/serbia",
          name: "BOLD Fellowship Serbia",
          description: "Country track for founders in Serbia.",
        },
        {
          href: "/programs/bold-fellowship/north-macedonia",
          name: "BOLD Fellowship North Macedonia",
          description: "Country track for founders in North Macedonia.",
        },
        {
          href: "/programs/bold-regional-workshops",
          name: "BOLD Regional Workshops",
          description: "Skills workshops for future founders across the region.",
        },
        {
          href: "/programs/bold-summit",
          name: "BOLD Summit",
          description: "Annual conference for BOLD alumni and the founder community.",
        },
        {
          href: "/programs/scale-2-0",
          name: "Scale 2.0",
          description: "Fully funded incubator for early-stage Croatian founders.",
        },
        {
          href: "/programs/leapx",
          name: "LeapX",
          description: "AI startup bootcamp with an online phase and a Canary Islands week.",
        },
        {
          href: "/programs/university-partnership-program",
          name: "University Partnership Program",
          description: "Collaboration for entrepreneurship faculty and PhD students.",
        },
      ]}
      extraHtml={`
        <div class="margin-top margin-large">
          <h2 class="heading-style-h3">Which EGC program fits?</h2>
          <p class="text-size-regular">BOLD Fellowship is for Western Balkans founders who want a multi-month fellowship. Scale 2.0 is a fully funded incubator for Croatian teams with an MVP. LeapX is a 5-week AI bootcamp. Workshops and the BOLD Summit are shorter community programs.</p>
          <p class="text-size-regular">Compare duration, location, and who should apply, then open the program page that matches your stage. EGC does not rank one program as universally best. The right fit depends on country, traction, and time.</p>
        </div>
      `}
    />
  );
}
