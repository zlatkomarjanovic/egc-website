/**
 * Webflow -> Next.js page generator.
 *
 * Reads the static Webflow export from ./webflow-export, and for each real page emits:
 *   - app/<route>/page.tsx       (uniform server-component wrapper)
 *   - app/<route>/content.json   (metadata + head extras + body HTML + inline scripts)
 *
 * Asset paths (css/js/images/fonts/videos) and internal .html links are rewritten to
 * clean Next.js routes. CMS template pages (detail_*) are intentionally skipped — those
 * are handled by the Sanity-backed dynamic routes.
 *
 * Re-run any time the export changes:  npm run generate:pages
 */
import { parse } from "node-html-parser";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "webflow-export");
const APP = path.join(ROOT, "web", "app");

/** Pages to generate: source html (relative to webflow-export) -> route path. */
const PAGES = [
  ["index.html", "/"],
  ["contact.html", "/contact"],
  ["newsletter.html", "/newsletter"],
  ["mentorship.html", "/mentorship"],
  ["partners.html", "/partners"],
  ["become-an-egc-mentor.html", "/become-an-egc-mentor"],
  ["about-us/careers.html", "/about-us/careers"],
  ["about-us/egc-advisory-board.html", "/about-us/egc-advisory-board"],
  ["about-us/egc-board-of-directors.html", "/about-us/egc-board-of-directors"],
  ["about-us/egc-our-team.html", "/about-us/egc-our-team"],
  ["about-us/insights.html", "/about-us/insights"],
  ["about-us/mission-and-vision.html", "/about-us/mission-and-vision"],
  ["programs/bold-regional-workshops.html", "/programs/bold-regional-workshops"],
  ["programs/bold-summit.html", "/programs/bold-summit"],
  ["programs/leapx.html", "/programs/leapx"],
  ["programs/scale-2-0.html", "/programs/scale-2-0"],
  ["programs/university-partnership-program.html", "/programs/university-partnership-program"],
  ["programs/bold-fellowship/bosnia-and-herzegovina.html", "/programs/bold-fellowship/bosnia-and-herzegovina"],
  ["programs/bold-fellowship/general.html", "/programs/bold-fellowship/general"],
  ["programs/bold-fellowship/north-macedonia.html", "/programs/bold-fellowship/north-macedonia"],
  ["programs/bold-fellowship/serbia.html", "/programs/bold-fellowship/serbia"],
  ["legal/privacy-policy.html", "/legal/privacy-policy"],
  ["legal/terms-of-service.html", "/legal/terms-of-service"],
];

/** Webflow CMS template -> the best public route to link to instead. */
const DETAIL_MAP = {
  "detail_post": "/about-us/insights",
  "detail_author": "/about-us/insights",
  "detail_category": "/about-us/insights",
  "detail_tags": "/about-us/insights",
  "detail_careers": "/about-us/careers",
  "detail_mentors": "/become-an-egc-mentor",
  "detail_staff": "/about-us/egc-our-team",
  "detail_partners": "/partners",
  "detail_partner-spotlight": "/partners",
  "detail_alumni-spotlight": "/about-us/insights",
  "detail_bold-fellows": "/programs/bold-fellowship/general",
  "detail_video-testimonials": "/",
  "detail_areas-of-expertise-and-interests-of-mentors-alumnis-and-mentees": "/",
};

const isExternal = (u) =>
  /^(https?:)?\/\//i.test(u) ||
  /^(mailto:|tel:|data:|javascript:|#)/i.test(u);

/** Map a path resolved relative to the export root onto a Next.js route. */
function routeForHtml(resolved) {
  let p = resolved.replace(/^\.?\//, "");
  p = p.replace(/\.html$/i, "");
  const base = p.split("/").pop();
  if (p === "index" || p === "") return "/";
  if (base.startsWith("detail_")) return DETAIL_MAP[base] ?? "/";
  return "/" + p;
}

/** Rewrite a single URL relative to the page's directory. */
function rewriteUrl(url, fileDir) {
  if (!url) return url;
  const trimmed = url.trim();
  if (isExternal(trimmed)) return trimmed;

  // Split off query/hash so they survive the rewrite.
  const m = trimmed.match(/^([^?#]*)([?#].*)?$/);
  const pathPart = m[1];
  const suffix = m[2] ?? "";
  if (!pathPart) return trimmed; // pure #hash or ?query

  const resolved = path.posix.normalize(path.posix.join(fileDir, pathPart));
  if (/\.html$/i.test(resolved)) return routeForHtml(resolved) + suffix;
  // Everything else is a static asset now served from /public.
  return "/" + resolved.replace(/^\.?\//, "") + suffix;
}

/** Rewrite a srcset value (comma-separated "url descriptor" entries). */
function rewriteSrcset(value, fileDir) {
  return value
    .split(",")
    .map((entry) => {
      const parts = entry.trim().split(/\s+/);
      if (parts.length === 0) return entry.trim();
      parts[0] = rewriteUrl(parts[0], fileDir);
      return parts.join(" ");
    })
    .join(", ");
}

/** Rewrite url(...) occurrences inside an inline style attribute. */
function rewriteStyleUrls(value, fileDir) {
  return value.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (full, q, u) => {
    const rewritten = rewriteUrl(u.replace(/&quot;/g, ""), fileDir);
    return `url(${q}${rewritten}${q})`;
  });
}

function rewriteDom(rootEl, fileDir) {
  const nodes = rootEl.querySelectorAll(
    "[href],[src],[srcset],[poster],[data-poster-url],[style]"
  );
  for (const el of nodes) {
    for (const attr of ["href", "src", "poster", "data-poster-url"]) {
      const v = el.getAttribute(attr);
      if (v != null) el.setAttribute(attr, rewriteUrl(v, fileDir));
    }
    const srcset = el.getAttribute("srcset");
    if (srcset != null) el.setAttribute("srcset", rewriteSrcset(srcset, fileDir));
    const style = el.getAttribute("style");
    if (style != null && /url\(/i.test(style))
      el.setAttribute("style", rewriteStyleUrls(style, fileDir));
  }
}

function attr(head, selector, name) {
  const el = head.querySelector(selector);
  return el ? el.getAttribute(name) ?? null : null;
}

function buildMetadata(head, route) {
  const title = head.querySelector("title")?.text?.trim() || "EGC";
  const description =
    attr(head, 'meta[name="description"]', "content") ?? undefined;

  const ogImage = attr(head, 'meta[property="og:image"]', "content");
  const twImage = attr(head, 'meta[name="twitter:image"]', "content");

  const metadata = {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: route },
    openGraph: {
      title: attr(head, 'meta[property="og:title"]', "content") || title,
      ...(attr(head, 'meta[property="og:description"]', "content")
        ? { description: attr(head, 'meta[property="og:description"]', "content") }
        : {}),
      type: attr(head, 'meta[property="og:type"]', "content") || "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: attr(head, 'meta[name="twitter:card"]', "content") || "summary_large_image",
      title: attr(head, 'meta[name="twitter:title"]', "content") || title,
      ...(attr(head, 'meta[name="twitter:description"]', "content")
        ? { description: attr(head, 'meta[name="twitter:description"]', "content") }
        : {}),
      ...(twImage ? { images: [twImage] } : {}),
    },
  };

  const gsv = attr(head, 'meta[name="google-site-verification"]', "content");
  if (gsv) metadata.verification = { google: gsv };

  return metadata;
}

function extractHead(head) {
  const styles = [];
  const headExtras = [];
  const scripts = [];

  for (const styleEl of head.querySelectorAll("style")) {
    styles.push(styleEl.innerHTML);
  }
  for (const s of head.querySelectorAll("script")) {
    const type = (s.getAttribute("type") || "").toLowerCase();
    const src = s.getAttribute("src");
    if (src) continue; // external scripts handled by the layout
    const content = s.innerHTML || "";
    if (content.includes("w-mod-")) continue; // the touch/js detector lives in the layout
    if (type === "application/ld+json" || type === "fs-cc") {
      headExtras.push(s.outerHTML); // data / consent-gated: keep in DOM, don't execute
    } else if (type === "" || type === "text/javascript" || type === "application/javascript") {
      scripts.push(content); // real custom code -> executed by <InlineScripts>
    }
  }

  const combined = [
    ...styles.map((c) => `<style>${c}</style>`),
    ...headExtras,
  ].join("\n");

  return { headExtras: combined, scripts };
}

/**
 * If the body has a single wrapper element (Webflow's .page-wrapper), return its
 * class + inner HTML so the host div can stand in for it. Otherwise fall back to
 * the whole body inner HTML rendered in a display:contents passthrough.
 */
function extractRoot(body) {
  const elementChildren = body.childNodes.filter((n) => n.nodeType === 1);
  if (elementChildren.length === 1) {
    const root = elementChildren[0];
    const cls = root.getAttribute("class") || "";
    const style = root.getAttribute("style");
    // Only hoist when the wrapper carries nothing but a class (true for .page-wrapper).
    const attrs = Object.keys(root.attributes || {});
    const onlyClass = attrs.every((a) => a === "class");
    if (cls && !style && onlyClass) {
      return { rootClass: cls, bodyHtml: root.innerHTML };
    }
  }
  return { rootClass: "", bodyHtml: body.innerHTML };
}

function pageTemplate() {
  return `import type { Metadata } from "next";
import WebflowPage from "@/components/WebflowPage";
import content from "./content.json";

export const metadata: Metadata = content.metadata as unknown as Metadata;

export default function Page() {
  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={content.bodyHtml}
      rootClass={content.rootClass}
      scripts={content.scripts}
    />
  );
}
`;
}

/** route -> Webflow page id (data-wf-page); required for webflow.js IX2 binding. */
const routeToPageId = {};

function generate() {
  let count = 0;
  for (const [srcRel, route] of PAGES) {
    const srcPath = path.join(SRC, srcRel);
    if (!fs.existsSync(srcPath)) {
      console.warn(`! missing source: ${srcRel}`);
      continue;
    }
    const fileDir = path.posix.dirname(srcRel) === "." ? "" : path.posix.dirname(srcRel);
    const html = fs.readFileSync(srcPath, "utf8");
    const doc = parse(html, {
      comment: false,
      blockTextElements: { script: true, style: true, pre: true },
    });

    const head = doc.querySelector("head");
    const body = doc.querySelector("body");

    const wfPageId = doc.querySelector("html")?.getAttribute("data-wf-page");
    if (wfPageId) routeToPageId[route] = wfPageId;

    const metadata = buildMetadata(head, route);
    const { headExtras, scripts } = extractHead(head);

    // Strip executable inline scripts from the body (we run them via InlineScripts);
    // keep data scripts like <script type="application/json" class="w-json">.
    for (const s of body.querySelectorAll("script")) {
      const type = (s.getAttribute("type") || "").toLowerCase();
      const src = s.getAttribute("src");
      const content = s.innerHTML || "";
      if (src) {
        // jQuery + webflow.js are loaded by the root layout; drop them here.
        if (/jquery|webflow\.js/i.test(src)) s.remove();
        continue;
      }
      if (content.includes("w-mod-")) {
        s.remove();
        continue;
      }
      if (type === "" || type === "text/javascript" || type === "application/javascript") {
        if (content.trim()) scripts.push(content);
        s.remove();
      }
    }

    rewriteDom(body, fileDir);

    // Make our injected host BE the .page-wrapper so the DOM matches the original
    // exactly (body > .page-wrapper > ...). An extra wrapper level breaks
    // webflow.js IX2 scroll-into-view position math, leaving content hidden.
    const { rootClass, bodyHtml } = extractRoot(body);

    const content = { metadata, headExtras, bodyHtml, rootClass, scripts };

    const outDir = route === "/" ? APP : path.join(APP, route.replace(/^\//, ""));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, "content.json"),
      JSON.stringify(content, null, 0)
    );
    fs.writeFileSync(path.join(outDir, "page.tsx"), pageTemplate());
    count++;
    console.log(`✓ ${route}  (${(bodyHtml.length / 1024).toFixed(0)}kb, ${scripts.length} script${scripts.length === 1 ? "" : "s"})`);
  }
  generateNotFound();

  // Emit the route -> data-wf-page map consumed by the root layout so webflow.js
  // can bind IX2 interactions correctly (without it, animations stay hidden).
  fs.mkdirSync(path.join(ROOT, "lib"), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, "lib", "wf-pages.json"),
    JSON.stringify(routeToPageId, null, 2)
  );
  console.log(`\nGenerated ${count} pages (+ not-found). Mapped ${Object.keys(routeToPageId).length} page ids.`);
}

/** Build app/not-found.tsx from the Webflow 404 page. */
function generateNotFound() {
  const srcPath = path.join(SRC, "404.html");
  if (!fs.existsSync(srcPath)) return;
  const doc = parse(fs.readFileSync(srcPath, "utf8"), {
    comment: false,
    blockTextElements: { script: true, style: true, pre: true },
  });
  const head = doc.querySelector("head");
  const body = doc.querySelector("body");
  const { headExtras, scripts } = extractHead(head);
  for (const s of body.querySelectorAll("script")) {
    const type = (s.getAttribute("type") || "").toLowerCase();
    const src = s.getAttribute("src");
    if (src) {
      if (/jquery|webflow\.js/i.test(src)) s.remove();
      continue;
    }
    const content = s.innerHTML || "";
    if (content.includes("w-mod-")) { s.remove(); continue; }
    if (type === "" || type === "text/javascript" || type === "application/javascript") {
      if (content.trim()) scripts.push(content);
      s.remove();
    }
  }
  rewriteDom(body, "");
  const { rootClass, bodyHtml } = extractRoot(body);
  const content = { headExtras, bodyHtml, rootClass, scripts };
  fs.writeFileSync(path.join(APP, "not-found.content.json"), JSON.stringify(content, null, 0));
  fs.writeFileSync(
    path.join(APP, "not-found.tsx"),
    `import WebflowPage from "@/components/WebflowPage";
import content from "./not-found.content.json";

export default function NotFound() {
  return (
    <WebflowPage
      headExtras={content.headExtras}
      bodyHtml={content.bodyHtml}
      rootClass={content.rootClass}
      scripts={content.scripts}
    />
  );
}
`
  );
}

generate();
