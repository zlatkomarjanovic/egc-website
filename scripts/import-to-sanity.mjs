/**
 * Converts the Webflow CSV exports in /cms-data into a Sanity NDJSON file that
 * matches the schema in /sanity/schemaTypes.
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

const DIR = path.join(process.cwd(), "cms-data");
const OUT = path.join(DIR, "import.ndjson");

/* --------------------------- CSV parsing --------------------------- */
function parseCSV(t) {
  const rows = [];
  let f = "", row = [], q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
      else if (c === "\r") { /* skip */ }
      else f += c;
    }
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows;
}

function readCsv(file) {
  const rows = parseCSV(fs.readFileSync(path.join(DIR, file), "utf8"));
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).filter((r) => r.some((c) => c.trim() !== "")).map((r) => {
    const o = {};
    header.forEach((h, i) => (o[h] = (r[i] ?? "").trim()));
    return o;
  });
}

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
  const refs = value.split(";").map((s) => s.trim()).filter(Boolean).map((s) => ref(type, s));
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
const slugObj = (s) => (s ? { _type: "slug", current: s } : undefined);
const date = (v) => (v ? v : undefined);

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
const push = (d) => docs.push(clean(d));

function findCsv(prefix) {
  const f = fs.readdirSync(DIR).find((n) => n.startsWith(prefix) && n.endsWith(".csv") && !n.includes("(1)"));
  return f || null;
}

function importCollection(prefix, type, map) {
  const file = findCsv(prefix);
  if (!file) { console.warn(`! no CSV for ${type} (${prefix})`); return; }
  const rows = readCsv(file);
  let n = 0;
  for (const r of rows) {
    const slug = r["Slug"] || r["slug"];
    if (!slug) continue;
    push({ _id: id(type, slug), _type: type, slug: slugObj(slug), publishedAt: date(r["Published On"]), ...map(r) });
    n++;
  }
  console.log(`✓ ${type}: ${n}`);
}

/* taxonomies first (referenced by others) */
importCollection("Copy of EGC - Categories", "category", (r) => ({
  name: r["Name"], description: r["Description"], color: r["Color"], icon: image(r["Icon"]),
}));
importCollection("Copy of EGC - Tags", "tag", (r) => ({ name: r["Name"] }));
importCollection("Copy of EGC - Areas of Expertise", "areaOfExpertise", (r) => ({ name: r["Name"] }));

importCollection("Copy of EGC - Authors", "author", (r) => ({
  name: r["Name"], position: r["Position"], bioSummary: r["Bio Summary"],
  bio: htmlToPortableText(r["Bio"]), picture: image(r["Picture"]),
  email: r["Email"], linkedin: r["LinkedIn Profile Link"],
}));

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
  minutesToRead: num(r["Minutes to read"]), sortOrder: num(r["Custom sort order"]),
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

importCollection("Copy of EGC - Partners ", "partner", (r) => ({
  name: r["Partner Name"] || r["Name"], logo: image(r["Partner Logo"]),
  website: r["Partner Website"], type: r["Partner Type"],
}));

importCollection("Copy of EGC - Partner Spotlights", "partnerSpotlight", (r) => ({
  name: r["Name"], partnerName: r["Name of Partner"], partner: refSingle("partner", r["Partner"]),
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

fs.writeFileSync(OUT, docs.map((d) => JSON.stringify(d)).join("\n") + "\n");
console.log(`\nWrote ${docs.length} documents to ${path.relative(process.cwd(), OUT)}`);
console.log("Next: npx sanity dataset import cms-data/import.ndjson production");
