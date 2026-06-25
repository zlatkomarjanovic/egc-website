/**
 * Converts the Webflow CSV exports in /cms-data into a Sanity NDJSON file that
 * matches the schema in /studio/schemaTypes.
 *
 *   node scripts/import-to-sanity.mjs
 *   npx sanity dataset import cms-data/import.ndjson production
 *
 * What it does:
 *  - Maps every collection's fields to the schema.
 *  - Resolves single references (slug -> _ref) and multi-references (semicolon-split).
 *  - Converts Webflow rich-text HTML to Portable Text (headings, paragraphs, lists,
 *    blockquotes, links, bold/italic, and inline images).
 *  - Turns Webflow CDN image URLs into assets via Sanity's `_sanityAsset` import hint,
 *    so `sanity dataset import` downloads + uploads them automatically.
 *
 * Stable document ids are `${type}.${slug}` so references resolve regardless of order.
 * Re-run any time the CSVs change. Import is idempotent per id (replaces docs).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parse } from "node-html-parser";
import { getCmsDataDir, readWebflowCsvRows } from "./csv-utils.mjs";

const DIR = getCmsDataDir();
const OUT = path.join(DIR, "import.ndjson");

/* --------------------------- helpers ------------------------------- */
const key = () => crypto.randomBytes(6).toString("hex");
const id = (type, slug) => `${type}.${slug}`.replace(/[^a-zA-Z0-9._-]/g, "-");

function ref(type, slug) {
  if (!slug) return undefined;
  return { _type: "reference", _ref: id(type, slug.trim()), _key: key() };
}
function refSingle(type, slug) {
  if (!slug) return undefined;
  return { _type: "reference", _ref: id(type, slug.trim()) };
}
function multiRef(type, value) {
  if (!value) return undefined;
  const slugs = [...new Set(value.split(";").map((s) => s.trim()).filter(Boolean))];
  const refs = slugs.map((s) => ref(type, s));
  return refs.length ? refs : undefined;
}
function image(url) {
  if (!url || !/^https?:\/\//.test(url)) return undefined;
  return { _type: "image", _sanityAsset: `image@${url}` };
}
function imageArray(value) {
  if (!value) return undefined;
  const urls = value.split(";").map((s) => s.trim()).filter((s) => /^https?:\/\//.test(s));
  return urls.length ? urls.map((u) => ({ _type: "image", _key: key(), _sanityAsset: `image@${u}` })) : undefined;
}
const bool = (v) => String(v).toLowerCase() === "true";
const num = (v) => (v === "" || v == null ? undefined : Number(v));
const parseMinutes = (v) => {
  if (!v) return undefined;
  const match = String(v).match(/\d+/);
  return match ? Number(match[0]) : undefined;
};
const slugObj = (s) => (s ? { _type: "slug", current: s } : undefined);
const date = (v) => (v ? v : undefined);
function toIsoDateTime(value) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}
const publishedAt = (r) =>
  toIsoDateTime(r["Published On"]) || toIsoDateTime(r["Created On"]);

/* --------------------- HTML -> Portable Text ----------------------- */
function inlineSpans(node, markDefs, marks = []) {
  const spans = [];
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const text = child.rawText.replace(/&nbsp;/g, " ");
      if (text) spans.push({ _type: "span", _key: key(), text, marks: [...marks] });
    } else if (child.nodeType === 1) {
      const tag = child.rawTagName.toLowerCase();
      if (tag === "br") { spans.push({ _type: "span", _key: key(), text: "\n", marks: [...marks] }); continue; }
      if (tag === "strong" || tag === "b") { spans.push(...inlineSpans(child, markDefs, [...marks, "strong"])); }
      else if (tag === "em" || tag === "i") { spans.push(...inlineSpans(child, markDefs, [...marks, "em"])); }
      else if (tag === "a") {
        const href = child.getAttribute("href") || "#";
        const mk = key();
        markDefs.push({ _key: mk, _type: "link", href });
        spans.push(...inlineSpans(child, markDefs, [...marks, mk]));
      } else {
        spans.push(...inlineSpans(child, markDefs, marks));
      }
    }
  }
  return spans;
}

function block(style, node) {
  const markDefs = [];
  const children = inlineSpans(node, markDefs);
  if (!children.length) return null;
  return { _type: "block", _key: key(), style, markDefs, children };
}

function listItemBlock(node, listItem) {
  const markDefs = [];
  const children = inlineSpans(node, markDefs);
  if (!children.length) return null;
  return { _type: "block", _key: key(), style: "normal", level: 1, listItem, markDefs, children };
}

function htmlToPortableText(html) {
  if (!html || !html.trim()) return undefined;
  const root = parse(html);
  const blocks = [];
  const walk = (parent) => {
    for (const node of parent.childNodes) {
      if (node.nodeType !== 1) continue;
      const tag = node.rawTagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) { const b = block(tag, node); if (b) blocks.push(b); }
      else if (tag === "p") { const b = block("normal", node); if (b) blocks.push(b); }
      else if (tag === "blockquote") { const b = block("blockquote", node); if (b) blocks.push(b); }
      else if (tag === "ul" || tag === "ol") {
        const li = tag === "ul" ? "bullet" : "number";
        for (const item of node.querySelectorAll("li")) { const b = listItemBlock(item, li); if (b) blocks.push(b); }
      } else if (tag === "figure" || tag === "img") {
        const img = tag === "img" ? node : node.querySelector("img");
        const src = img?.getAttribute("src");
        if (src) blocks.push({ _type: "image", _key: key(), _sanityAsset: `image@${src}` });
      } else if (["div", "section", "article"].includes(tag)) {
        walk(node); // descend into wrappers
      } else {
        const b = block("normal", node);
        if (b) blocks.push(b);
      }
    }
  };
  walk(root);
  return blocks.length ? blocks : undefined;
}

/* --------------------------- mappers ------------------------------- */
const clean = (o) => {
  for (const k of Object.keys(o)) if (o[k] === undefined) delete o[k];
  return o;
};

const docs = [];
const seenIds = new Set();
const push = (d) => {
  if (seenIds.has(d._id)) return false;
  seenIds.add(d._id);
  docs.push(clean(d));
  return true;
};

const importStats = [];

function importCollection(prefix, type, map, { skipDraft = false } = {}) {
  const { file, rows } = readWebflowCsvRows(DIR, prefix);
  if (!file) {
    console.warn(`! no CSV for ${type} (${prefix})`);
    importStats.push({ type, count: 0, file: null, empty: true });
    return;
  }

  let n = 0;
  for (const r of rows) {
    const slug = r["Slug"] || r["slug"];
    if (!slug || bool(r.Archived)) continue;
    if (skipDraft && bool(r.Draft)) continue;
    if (push({ _id: id(type, slug), _type: type, slug: slugObj(slug), publishedAt: publishedAt(r), ...map(r) })) {
      n++;
    }
  }

  console.log(`✓ ${type}: ${n} (${file})`);
  importStats.push({ type, count: n, file, empty: rows.length === 0 });
}

/* taxonomies first (referenced by others) */
importCollection("Copy of EGC - Categories", "category", (r) => ({
  name: r["Name"], description: r["Description"], color: r["Color"], icon: image(r["Icon"]),
}), { skipDraft: false });
importCollection("Copy of EGC - Tags", "tag", (r) => ({ name: r["Name"] }), { skipDraft: false });
importCollection("Copy of EGC - Areas of Expertise", "areaOfExpertise", (r) => ({ name: r["Name"] }), { skipDraft: false });

importCollection("Copy of EGC - Authors", "author", (r) => ({
  name: r["Name"], position: r["Position"], bioSummary: r["Bio Summary"],
  bio: htmlToPortableText(r["Bio"]), picture: image(r["Picture"]),
  email: r["Email"], linkedin: r["LinkedIn Profile Link"],
}), { skipDraft: false });

importCollection("Copy of EGC - Mentors", "mentor", (r) => ({
  name: r["Mentor Name"] || r["Name"], profession: r["Profession"],
  shortBio: r["Mentor Short Bio"], detailedBio: htmlToPortableText(r["Mentor Detailed Bio"]),
  photo: image(r["Mentor Profile Picture"]), photoAlt: r["Mentor Image Alt Text"],
  sessionImages: imageArray(r["Mentoring session images"]),
  primaryExpertise: refSingle("areaOfExpertise", r["Primary Expertise"]),
  otherExpertise: multiRef("areaOfExpertise", r["Other areas of expertise"]),
  quote: r["Quote from the mentor about their experience with EGC"], linkedin: r["LinkedIn Link"],
  metaTitle: r["Meta Title Tag"], metaDescription: r["Meta Description Tag"],
}));

importCollection("Copy of EGC - BOLD Fellows", "boldFellow", (r) => ({
  name: r["Name"], photo: image(r["Profile Picture"]), location: r["Location"], year: r["Year"],
  bioSummary: r["Bio Summary"], businessIdea: r["Business Idea"], position: r["Position"],
  email: r["Email"], personalWebsite: r["Personal Website"], linkedin: r["LinkedIn Link"],
  sortOrder: num(r["Custom Sort Order"]),
}));

importCollection("Copy of EGC - Blog Posts", "post", (r) => ({
  name: r["Name"], postSummary: r["Post Summary"], postBody: htmlToPortableText(r["Post Body"]),
  mainImage: image(r["Main Image"]), thumbnailImage: image(r["Thumbnail image"]),
  featured: bool(r["Featured?"]), blogPageFeature: bool(r["Blog Page Feature"]), color: r["Color"],
  minutesToRead: parseMinutes(r["Minutes to read"]), sortOrder: num(r["Custom sort order"]),
  author: refSingle("author", r["Author"]), coAuthors: multiRef("author", r["Co Authors"]),
  category: refSingle("category", r["Category"]), tags: multiRef("tag", r["Tags"]),
  metaTitle: r["Meta Title Tag"], metaDescription: r["Meta Description Tag"],
}));

importCollection("Copy of EGC - Careers", "job", (r) => ({
  name: r["Name"], jobTitle: r["Job title"], coverImage: image(r["Cover Image"]),
  excerpt: r["Excerpt (Short text explaining the job)"], organization: r["Organization"],
  location: r["Location"], type: r["Type"], applicationDeadline: date(r["Application Deadline"]),
  startDate: date(r["Start Date"]), endDate: date(r["End Date"]),
  detailedInstructions: htmlToPortableText(r["Detailed Instructions"]), applicationLink: r["Application Link"],
}));

importCollection("Copy of EGC - Partners", "partner", (r) => ({
  name: r["Partner Name"] || r["Name"], logo: image(r["Partner Logo"]),
  website: r["Partner Website"], type: r["Partner Type"],
}), { skipDraft: false });

const PARTNER_SPOTLIGHT_QA = [
  "What inspired you to become part of the entrepreneurship ecosystem, and how do you see your organization making an...",
  "What do you believe are the key challenges entrepreneurs face today, and how does your organization work to address...",
  "Collaboration is at the heart of entrepreneurship. How does your organization work alongside...",
  "As the entrepreneurship ecosystem evolves, what new opportunities or trends...",
  "Looking back on your journey in the entrepreneurship ecosystem, what is...",
  "What advice would you give to aspiring entrepreneurs or startups looking to succeed in today’s rapidly changing market?",
  "What advice would you give to aspiring entrepreneurs or startups looking to...",
  "Can you share a success story or example of an entrepreneur or startup...",
  "How do you measure success in your work, and what milestones are you most proud...",
  "How do you see the role of innovation changing in the next 5-10 years within the entrepreneurship...",
  "What is one innovative approach or solution your organization is working on that you think...",
  "What motivates you personally to support entrepreneurs, and how do you stay inspired...",
  "In your view, what is the most rewarding part of working within the entrepreneurship ecosystem, and what...",
];

function partnerSpotlightQa(row) {
  const qa = PARTNER_SPOTLIGHT_QA.map((question) => {
    const answer = row[question];
    if (!answer) return null;
    return { _key: key(), question, answer };
  }).filter(Boolean);
  return qa.length ? qa : undefined;
}

importCollection("Copy of EGC - Partner Spotlights", "partnerSpotlight", (r) => ({
  name: r["Name"], partnerName: r["Name of Partner"], partner: refSingle("partner", r["Partner"]),
  qa: partnerSpotlightQa(r),
  closingThoughts: r["Closing thoughts"], photos: imageArray(r["Photos"]),
}));

importCollection("Copy of EGC - Alumni Spotlights", "alumniSpotlight", (r) => ({
  name: r["Name"], alumniName: r["Name of Alumni"], ventureName: r["Venture Name"], oneLiner: r["One liner"],
  profilePicture: image(r["Profile Picture"]), profilePictureAlt: r["Profile Picture Alt Text"],
  country: r["Country"], featured: bool(r["Featured"]),
  whyStarted: r["Why did you start this venture?"], fundraised: r["Have you successfully fundraised?"],
  trends: r["What trends are impacting your business?"], biggestChallenge: r["What has been the biggest growth related challenge?"],
  adviceFirstTime: r["What advice would you give to first time founders?"], whatDrives: r["What drives you forward when facing challenges?"],
  photos: imageArray(r["Photos"]), videoLink: r["Link to video:"] || r["Video Linkj"],
  extraNote: r["Extra note"], sortNumber: num(r["Custom Sort Number"]),
  metaTitle: r["Meta Title Tag"], metaDescription: r["Meta Description Tag"],
}));

importCollection("Copy of EGC - Testimonials", "testimonial", (r) => ({
  personName: r["Person name"] || r["Name"], whatTheyDo: r["What they do"], egcPosition: r["EGC Position"],
  testimonial: r["Testimonial"], personImage: image(r["Person Image"]),
  videoLink: r["Video Testimonial Link"], linkedin: r["LinkedIn Link"], twitter: r["X (Twitter) Link"],
}));

/** Staff team — not in Webflow CSV exports; synced from live site content. */
const STAFF_TEAM_MEMBERS = [
  {
    slug: "filip-sasic",
    name: "Filip Sasic",
    role: "CEO and Founder",
    photo:
      "https://cdn.prod.website-files.com/66d4f9dea6d0abdd1059a14f/66ddbc9f67c5af6501309ea1_Screenshot_1.png",
    linkedin: "https://www.linkedin.com/in/filipsasic/",
    sortOrder: 1,
  },
  {
    slug: "ruth-ku",
    name: "Ruth Ku",
    role: "CFO",
    photo:
      "https://cdn.prod.website-files.com/66d4f9dea6d0abdd1059a14f/672aa7760d391b3fd79c6dc5_Screenshot_3.png",
    linkedin: "https://www.linkedin.com/in/ruth-ku/",
    sortOrder: 2,
  },
  {
    slug: "marija-ljusheva",
    name: "Marija Ljusheva",
    role: "Startup Community Coordinator",
    photo:
      "https://cdn.prod.website-files.com/66d4f9dea6d0abdd1059a14f/685a07da251f1e5f288ba8aa_Marija%201X1.png",
    linkedin: "https://www.linkedin.com/in/marija-ljuseva/",
    sortOrder: 3,
  },
  {
    slug: "marko-matovic",
    name: "Marko Matovic",
    role: "Marketing Communication Coordinator",
    photo:
      "https://cdn.prod.website-files.com/66d4f9dea6d0abdd1059a14f/672aa6d707d23aa54bf6833b_Marko%20Matovic.png",
    linkedin: "https://www.linkedin.com/in/markomatovic93/",
    sortOrder: 4,
  },
];

for (const member of STAFF_TEAM_MEMBERS) {
  if (
    push({
      _id: id("teamMember", member.slug),
      _type: "teamMember",
      slug: slugObj(member.slug),
      name: member.name,
      role: member.role,
      group: "staff",
      photo: image(member.photo),
      linkedin: member.linkedin,
      sortOrder: member.sortOrder,
      publishedAt: new Date().toISOString(),
    })
  ) {
    // counted below
  }
}
console.log(`✓ teamMember (staff): ${STAFF_TEAM_MEMBERS.length} (manual import)`);
importStats.push({
  type: "teamMember",
  count: STAFF_TEAM_MEMBERS.length,
  file: "team-staff.ts",
  empty: false,
});

fs.writeFileSync(OUT, docs.map((d) => JSON.stringify(d)).join("\n") + "\n");
console.log(`\nWrote ${docs.length} documents to ${path.relative(process.cwd(), OUT)}`);

const emptyExports = importStats.filter((s) => s.empty);
if (emptyExports.length) {
  console.log("\nEmpty Webflow CSV exports (re-export these collections from Webflow):");
  for (const s of emptyExports) console.log(`  - ${s.type}`);
}

console.log("\nNext: node scripts/push-to-sanity.mjs");
