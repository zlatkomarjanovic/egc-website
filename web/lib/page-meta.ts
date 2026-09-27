import type { Metadata } from "next";
import { fromContentMetadata } from "@/lib/seo";

export const PAGE_META: Record<
  string,
  { title: string; description: string; image?: string }
> = {
  "/": {
    title: "EGC | Youth Entrepreneurship Programs",
    description:
      "EGC helps young founders from emerging ecosystems start and grow ventures through BOLD Fellowship, LeapX, workshops, and NYC programs.",
  },
  "/about-us": {
    title: "About EGC",
    description:
      "Entrepreneurs for Global Change is a New York nonprofit that trains young founders from emerging ecosystems through fellowships, workshops, and mentorship.",
  },
  "/about-us/mission-and-vision": {
    title: "Mission and Vision",
    description:
      "EGC's mission is to help aspiring young founders from emerging ecosystems plant seeds of positive change and build sustainable ventures.",
  },
  "/about-us/egc-board-of-directors": {
    title: "Board of Directors",
    description:
      "Meet the Entrepreneurs for Global Change board of directors leading EGC's youth entrepreneurship programs.",
  },
  "/about-us/egc-advisory-board": {
    title: "Advisory Board",
    description:
      "The EGC Advisory Board advises Entrepreneurs for Global Change on youth entrepreneurship programs across emerging ecosystems.",
  },
  "/about-us/careers": {
    title: "Careers at EGC",
    description:
      "Open roles at Entrepreneurs for Global Change. Join the team supporting young founders across emerging startup ecosystems.",
    image: "/images/egc-careers-cover.png",
  },
  "/about-us/insights": {
    title: "Insights",
    description:
      "Articles from Entrepreneurs for Global Change on youth entrepreneurship, startup programs, and founder stories from emerging ecosystems.",
  },
  "/programs": {
    title: "Programs",
    description:
      "EGC programs for young founders: BOLD Fellowship, BOLD Regional Workshops, BOLD Summit, Scale 2.0, LeapX, and University Partnership.",
  },
  "/programs/bold-fellowship/general": {
    title: "BOLD Fellowship for Entrepreneurship",
    description:
      "The BOLD Fellowship is an EGC and U.S. Department of State program for young founders in Bosnia and Herzegovina, North Macedonia, and Serbia.",
  },
  "/programs/bold-fellowship/serbia": {
    title: "BOLD Fellowship Serbia",
    description:
      "BOLD Fellowship Serbia supports young founders building startups in Serbia with mentorship, workshops, and the regional BOLD network.",
  },
  "/programs/bold-fellowship/bosnia-and-herzegovina": {
    title: "BOLD Fellowship Bosnia and Herzegovina",
    description:
      "BOLD Fellowship Bosnia and Herzegovina supports young founders building startups in BiH with mentorship, workshops, and alumni support.",
  },
  "/programs/bold-fellowship/north-macedonia": {
    title: "BOLD Fellowship North Macedonia",
    description:
      "BOLD Fellowship North Macedonia supports young founders building startups in North Macedonia through EGC's regional fellowship.",
  },
  "/programs/bold-regional-workshops": {
    title: "BOLD Regional Workshops",
    description:
      "BOLD Regional Workshops teach entrepreneurship skills and connect future founders across the Western Balkans.",
  },
  "/programs/bold-summit": {
    title: "BOLD Summit",
    description:
      "BOLD Summit is EGC's annual conference showcasing BOLD alumni founder stories and the Western Balkans entrepreneurship community.",
  },
  "/programs/scale-2-0": {
    title: "Scale 2.0 Incubator",
    description:
      "Scale 2.0 is EGC's fully funded incubator for early-stage Croatian founders, with a Vodnjan bootcamp, a New York week, and no equity taken.",
  },
  "/programs/leapx": {
    title: "LeapX AI Startup Bootcamp",
    description:
      "LeapX is EGC's AI startup bootcamp: four weeks online plus one week in the Canary Islands, from idea to first customer.",
  },
  "/programs/university-partnership-program": {
    title: "University Partnership Program",
    description:
      "EGC's University Partnership Program helps faculty and PhD students in entrepreneurship share teaching methods and collaborate across campuses.",
  },
  "/partners": {
    title: "Partners",
    description:
      "EGC partners with universities, startups, and global organizations to support young founders from emerging ecosystems.",
  },
  "/become-an-egc-mentor": {
    title: "Become an EGC Mentor",
    description:
      "Apply to become an EGC mentor and support young founders from emerging ecosystems through fellowships and startup programs.",
  },
  "/contact": {
    title: "Contact EGC",
    description:
      "Contact Entrepreneurs for Global Change in New York. Reach the team about programs, partnerships, mentorship, or careers.",
  },
  "/alumni": {
    title: "Alumni Spotlight",
    description:
      "Stories from EGC alumni founders who built ventures through BOLD Fellowship and other Entrepreneurs for Global Change programs.",
  },
  "/legal/privacy-policy": {
    title: "Privacy Policy",
    description:
      "Privacy policy for Entrepreneurs for Global Change. How we collect, use, and protect personal information on egcnyc.org.",
  },
  "/legal/terms-of-service": {
    title: "Terms of Service",
    description:
      "Terms of service for Entrepreneurs for Global Change websites, programs, and related services.",
  },
  "/newsletter": {
    title: "EGC Newsletter",
    description:
      "Follow EGC updates on youth entrepreneurship programs, alumni stories, and upcoming fellowships.",
  },
};

export const BOLD_PROGRAM_FAQS = [
  {
    question: "Who is the BOLD Fellowship for?",
    answer:
      "The BOLD Fellowship is for young founders in Bosnia and Herzegovina, Serbia, and North Macedonia who are building early-stage ventures.",
  },
  {
    question: "What do fellows receive?",
    answer:
      "Fellows receive entrepreneurship training, mentorship, workshops, and access to the EGC alumni network across the Western Balkans.",
  },
  {
    question: "When do applications open?",
    answer:
      "Applications open in cycles. Watch the country page and EGC channels for the next call.",
  },
];

export function pageCopy(path: string): {
  title: string;
  description: string;
  image?: string;
} {
  return (
    PAGE_META[path] || {
      title: "Entrepreneurs for Global Change",
      description:
        "EGC helps young founders from emerging ecosystems start and grow ventures.",
    }
  );
}

export function contentPageMetadata(
  path: string,
  raw: unknown,
  extra?: { noIndex?: boolean }
): Metadata {
  return fromContentMetadata(raw, path, {
    ...pageCopy(path),
    noIndex: extra?.noIndex,
  });
}
