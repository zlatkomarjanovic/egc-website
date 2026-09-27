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
    image: "/images/egc-og-default.png",
  },
  "/about-us": {
    title: "About EGC | New York Youth Entrepreneurship Nonprofit",
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
    title: "Careers at EGC | Jobs in Youth Entrepreneurship",
    description:
      "Open roles at Entrepreneurs for Global Change. Join the team supporting young founders across emerging startup ecosystems.",
    image: "/images/egc-careers-cover.png",
  },
  "/about-us/insights": {
    title: "EGC Insights | Youth Entrepreneurship Articles",
    description:
      "Articles from Entrepreneurs for Global Change on youth entrepreneurship, startup programs, and founder stories from emerging ecosystems.",
    image: "/images/egc-og-default.png",
  },
  "/programs": {
    title: "EGC Programs",
    description:
      "EGC programs for young founders: BOLD Fellowship, BOLD Regional Workshops, BOLD Summit, Scale 2.0, LeapX, and University Partnership.",
    image: "/images/egc-og-default.png",
  },
  "/programs/bold-fellowship/general": {
    title: "BOLD Fellowship for Entrepreneurship",
    description:
      "The BOLD Fellowship is an EGC and U.S. Department of State program for young founders in Bosnia and Herzegovina, North Macedonia, and Serbia.",
    image: "/images/egc-og-default.png",
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
    title: "BOLD Summit | EGC Alumni Conference",
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
    image: "/images/egc-og-default.png",
  },
  "/programs/university-partnership-program": {
    title: "University Partnership Program",
    description:
      "EGC's University Partnership Program helps faculty and PhD students in entrepreneurship share teaching methods and collaborate across campuses.",
  },
  "/partners": {
    title: "EGC Partners | Universities, Startups, and Funders",
    description:
      "EGC partners with universities, startups, and global organizations to support young founders from emerging ecosystems.",
    image: "/images/egc-og-default.png",
  },
  "/become-an-egc-mentor": {
    title: "Become an EGC Mentor",
    description:
      "Apply to become an EGC mentor and support young founders from emerging ecosystems, including the Western Balkans, through fellowships and startup programs.",
  },
  "/contact": {
    title: "Contact EGC | New York Nonprofit for Young Founders",
    description:
      "Contact Entrepreneurs for Global Change in New York. Reach the team about programs, partnerships, mentorship, or careers.",
  },
  "/alumni": {
    title: "Alumni Spotlight",
    description:
      "Stories from EGC alumni founders who built ventures through BOLD Fellowship and other Entrepreneurs for Global Change programs.",
    image: "/images/egc-og-default.png",
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
    title: "EGC Newsletter | Program and Alumni Updates",
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
      "The BOLD Fellowship gives fellows entrepreneurship training, mentorship, workshops, and access to the EGC alumni network across the Western Balkans.",
  },
  {
    question: "When do applications open?",
    answer:
      "The BOLD Fellowship opens applications in cycles. Watch the country page and EGC channels for the next call.",
  },
];

export const LEAPX_PROGRAM_FAQS = [
  {
    question: "Can I apply for the LeapX Bootcamp?",
    answer:
      "You can apply if you are an aspiring startup founder with an early-stage business idea or prototype in the tech or AI space. The call for applications is currently closed.",
  },
  {
    question: "What happens after I submit my application?",
    answer:
      "After submitting your application, it will be reviewed by the LeapX team. If selected, you will be invited to participate in the bootcamp, which includes mentorship, workshops, and hands-on sessions designed to accelerate your startup idea.",
  },
  {
    question: "Who is eligible to apply for this program?",
    answer:
      "The program is open to aspiring founders who are working on AI-focused or tech-driven startups, either individually or in small teams.",
  },
  {
    question: "What is the purpose of the LeapX Bootcamp?",
    answer:
      "LeapX is designed to accelerate early-stage startups by providing mentorship, access to industry experts, practical tools, and networking opportunities. The program aims to equip participants with the skills and connections needed to grow their AI or tech ventures in one month.",
  },
  {
    question: "Why should I join this program?",
    answer:
      "Joining LeapX gives you the opportunity to learn from experienced mentors, collaborate with fellow startup founders, refine your business model, and gain exposure to potential investors and partners in the AI and tech ecosystem.",
  },
  {
    question: "How long is the program and what does it include?",
    answer:
      "The bootcamp spans several weeks and includes workshops, mentorship sessions, pitch practice, and networking opportunities. Specific schedules and program details can be found on the website.",
  },
  {
    question: "Will I have opportunities for ongoing collaboration after the program?",
    answer:
      "Yes. LeapX encourages ongoing collaboration through alumni networks, follow-up mentorship, and opportunities to connect with investors, partners, and fellow founders beyond the bootcamp.",
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

export const LEGAL_LASTMOD = "2026-06-25";

export function contentPageMetadata(
  path: string,
  raw: unknown,
  extra?: { noIndex?: boolean; modifiedTime?: string }
): Metadata {
  return fromContentMetadata(raw, path, {
    ...pageCopy(path),
    noIndex: extra?.noIndex,
    modifiedTime: extra?.modifiedTime,
  });
}
