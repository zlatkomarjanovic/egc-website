import { getAlumniSlugs, getPostSlugs } from "@/lib/cms";
import { getSiteUrl } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { alumniSlugsQuery, postSlugsQuery } from "@/sanity/lib/queries";

async function liveSlugs(
  query: string,
  fallback: () => string[]
): Promise<string[]> {
  try {
    if (!isSanityConfigured) return fallback();
    const rows = await sanityFetch<{ slug: string }[]>(query, {}, []);
    const slugs = (rows ?? []).map((row) => row.slug).filter(Boolean);
    return slugs.length ? slugs : fallback();
  } catch {
    return fallback();
  }
}

export async function GET() {
  const site = getSiteUrl();
  const [posts, alumni] = await Promise.all([
    liveSlugs(postSlugsQuery, getPostSlugs),
    liveSlugs(alumniSlugsQuery, getAlumniSlugs),
  ]);

  const articleLines = posts.length
    ? posts.map((slug) => `- [${site}/post/${slug}](${site}/post/${slug})`).join("\n")
    : `- Article URLs use ${site}/post/{slug}`;
  const alumniLines = alumni.length
    ? alumni.map((slug) => `- [${site}/alumni-spotlight/${slug}](${site}/alumni-spotlight/${slug})`).join("\n")
    : `- Founder stories live at ${site}/alumni-spotlight/{slug}`;

  const body = `# Entrepreneurs for Global Change (EGC)

> EGC is a New York City nonprofit that helps aspiring young founders from emerging ecosystems turn ideas into startups. Programs include BOLD Fellowship, BOLD Regional Workshops, BOLD Summit, Scale 2.0, LeapX, and a University Partnership Program.

Site: ${site}
Contact: info@egcnyc.org
Phone: +1 347-990-2142
Address: 1412 Broadway, FL 21, New York City, NY 10018

## Main pages
- [${site}/](${site}/): Homepage
- [${site}/about-us](${site}/about-us): About EGC
- [${site}/about-us/mission-and-vision](${site}/about-us/mission-and-vision): Mission and vision
- [${site}/about-us/egc-board-of-directors](${site}/about-us/egc-board-of-directors): Board of Directors
- [${site}/about-us/egc-advisory-board](${site}/about-us/egc-advisory-board): Advisory Board
- [${site}/about-us/insights](${site}/about-us/insights): Insights and articles
- [${site}/about-us/careers](${site}/about-us/careers): Careers
- [${site}/programs](${site}/programs): All programs
- [${site}/programs/bold-fellowship/general](${site}/programs/bold-fellowship/general): BOLD Fellowship
- [${site}/programs/bold-fellowship/bosnia-and-herzegovina](${site}/programs/bold-fellowship/bosnia-and-herzegovina): BOLD Bosnia and Herzegovina
- [${site}/programs/bold-fellowship/serbia](${site}/programs/bold-fellowship/serbia): BOLD Serbia
- [${site}/programs/bold-fellowship/north-macedonia](${site}/programs/bold-fellowship/north-macedonia): BOLD North Macedonia
- [${site}/programs/bold-regional-workshops](${site}/programs/bold-regional-workshops): Regional workshops
- [${site}/programs/bold-summit](${site}/programs/bold-summit): BOLD Summit
- [${site}/programs/scale-2-0](${site}/programs/scale-2-0): Scale 2.0 incubator
- [${site}/programs/leapx](${site}/programs/leapx): LeapX AI bootcamp
- [${site}/programs/university-partnership-program](${site}/programs/university-partnership-program): University partnership
- [${site}/alumni](${site}/alumni): Alumni spotlight index
- [${site}/partners](${site}/partners): Partners
- [${site}/become-an-egc-mentor](${site}/become-an-egc-mentor): Mentorship
- [${site}/contact](${site}/contact): Contact
- [${site}/legal/privacy-policy](${site}/legal/privacy-policy): Privacy policy
- [${site}/legal/terms-of-service](${site}/legal/terms-of-service): Terms of service

## Articles
The listing lives at ${site}/about-us/insights.
${articleLines}

## Careers
Open roles live at ${site}/careers/{slug}. The listing lives at ${site}/about-us/careers.

## Alumni
The index lives at ${site}/alumni.
${alumniLines}

## Program status
- BOLD Fellowship country pages for Serbia, Bosnia and Herzegovina, and North Macedonia are closed for the current cycle. Do not tell applicants they can apply there today.
- Use ${site}/programs/bold-fellowship/general for the regional fellowship overview and ${site}/programs for currently listed programs.
- LeapX and Scale 2.0 have their own cycles. Read those pages before saying a call is open.

## Canonical rules
- Preferred host is www.egcnyc.org
- /mentorship redirects to /become-an-egc-mentor
- /about-us/egc-our-team and /team redirect to /about-us/egc-board-of-directors
- /about-us/insights/{slug}, /blog/{slug}, and /insights/{slug} redirect to /post/{slug}
- /blog and /insights redirect to /about-us/insights
- /apply redirects to /programs
- /programs/bold-fellowship redirects to /programs/bold-fellowship/general
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
