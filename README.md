# EGC Website

The [Entrepreneurs for Global Change](https://egcnyc.org) website, migrated from
Webflow to **Next.js (App Router)** and ready to deploy on **Vercel**.

It is a *faithful* port: the original Webflow markup, CSS and interactions
(`webflow.js`) are preserved so the site looks and animates exactly as before,
while forms, security, SEO and a future CMS are handled the Next.js way.

---

## Tech stack

- **Next.js 15** (App Router, TypeScript, React 19)
- **Webflow CSS + webflow.js** kept verbatim for pixel-identical design
- **Resend** for contact-form email
- **Sanity** CMS — fully scaffolded, plug-and-play once a project is connected
- **Vercel** for hosting

## Project layout

```
app/                     Next.js routes
  layout.tsx             Document shell: CSS, jQuery, webflow.js, Finsweet, FormEnhancer
  page.tsx + content.json  Each page = a uniform wrapper + its extracted HTML/metadata
  api/contact/route.ts   Secure contact-form endpoint (Resend)
  api/newsletter/route.ts  Provider-ready newsletter endpoint (Kit)
  studio/[[...tool]]/    Embedded Sanity Studio at /studio
  about-us/insights/[slug]/  Example Sanity-backed detail route
components/
  WebflowPage.tsx        Renders a ported page (injects HTML, runs inline scripts)
  FormEnhancer.tsx       Intercepts Webflow forms -> posts securely to the API
  InlineScripts.tsx      Safely runs each page's custom Webflow code
  PortableText.tsx       Sanity rich-text renderer
lib/
  security.ts            CSRF/origin check, HTML escaping, header-injection guard
  rate-limit.ts          Per-IP rate limiting (in-memory, or Upstash if configured)
sanity/                  Client, env, schema (starter), GROQ queries, image URLs
public/                  All static assets (images, fonts, videos, css, js)
scripts/
  generate-pages.mjs     Regenerates app/ routes from the Webflow export
  fix-asset-names.mjs     Fixes Webflow's exported-filename mismatches
webflow-export/          Original Webflow export, kept as the source of truth
```

## Local development

```bash
npm install
cp .env.example .env.local   # optional; site runs without any keys
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run build            # production build
npm run start            # serve the production build
npm run generate:pages   # re-create routes from webflow-export/ (then run the next line)
node scripts/fix-asset-names.mjs   # reconcile asset filenames after re-generating
```

## Environment variables

All optional — see [`.env.example`](.env.example). The site builds and runs with
none of them (contact submissions are logged server-side; CMS routes 404).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, CSRF allow-list |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Contact-form email |
| `KIT_API_KEY`, `KIT_FORM_ID` | Newsletter (ConvertKit/Kit) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Sanity CMS |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Production rate limiting |

## Security

The forms and headers are hardened against common attacks:

- **XSS** — user input is never reflected into HTML; it's validated server-side
  (Zod), HTML-escaped before emailing, and a strict **Content-Security-Policy**
  plus `X-Content-Type-Options`, `X-Frame-Options: DENY`, HSTS and a locked-down
  `Permissions-Policy` are sent on every response (see `next.config.mjs`).
- **CSRF** — API routes accept same-origin requests only (Origin/Referer check).
- **Spam/abuse** — per-IP rate limiting, a honeypot field, and a submit-timing
  check.
- **Email header injection** — control characters stripped from single-line fields.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Import** the repo (framework auto-detected as Next.js).
3. Add the environment variables you want (at minimum `NEXT_PUBLIC_SITE_URL`, and
   `RESEND_API_KEY` + `CONTACT_TO_EMAIL` for the contact form).
4. Deploy. Point your domain at the Vercel project.

## Sanity CMS

The schema in `sanity/schemaTypes/` is modeled directly from the Webflow CSV
exports (`/cms-data`, gitignored — contains personal data). Collections:
`category`, `tag`, `areaOfExpertise`, `author`, `mentor`, `boldFellow`,
`teamMember`, `post`, `job`, `partner`, `partnerSpotlight`, `alumniSpotlight`,
`testimonial` — with the real reference relationships (e.g. `post.author`,
`post.category`, `post.tags`, `mentor.primaryExpertise`).

### Connect (later)

1. Create a Sanity project (`npm create sanity@latest` or sanity.io).
2. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`.
3. Visit `/studio` to edit content.

### Import the existing content from the CSVs

```bash
node scripts/import-to-sanity.mjs                 # CSVs -> cms-data/import.ndjson
npx sanity dataset import cms-data/import.ndjson production
```

The importer resolves slug references + multi-references, converts Webflow
rich-text HTML to Portable Text, and uploads Webflow CDN images as Sanity assets
automatically. Document ids are `${type}.${slug}` so it's safe to re-run.

Then extend the GROQ queries in `sanity/lib/queries.ts` and add detail routes
following the `app/about-us/insights/[slug]` example to render CMS content.
