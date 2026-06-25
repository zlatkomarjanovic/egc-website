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
studio/                  Standalone Sanity Studio (http://localhost:3333)
  schemaTypes/             EGC content model (from Webflow CSV exports)
web/                     Next.js marketing site (http://localhost:3000)
  app/                   Routes + API handlers
  components/            WebflowPage, forms, Portable Text, insights UI
  lib/                   Security, CMS CSV fallback, Webflow page map
  sanity/                Sanity client, GROQ queries, image URLs
  public/                Static assets (images, css, js)
cms-data/                Webflow CSV exports (local only, gitignored)
scripts/                 Page generator, CSV → Sanity import pipeline
webflow-export/          Original Webflow export (source of truth)
```

## Local development

```bash
npm install
cp .env.example .env.local          # set Sanity + email keys
cp .env.local web/.env.local        # web app reads env from its folder

# Terminal 1 — Next.js site
npm run dev:web                     # http://localhost:3000

# Terminal 2 — Sanity Studio (standalone)
npm run dev:studio                  # http://localhost:3333
```

Other scripts:

```bash
npm run build            # production build
npm run start            # serve the production build
npm run generate:pages   # re-create routes from webflow-export/ (then run the next line)
node scripts/fix-asset-names.mjs   # reconcile asset filenames after re-generating
```

## Environment variables

Copy [`.env.example`](.env.example) to `.env.local` and `web/.env.local`:

```bash
cp .env.example .env.local
cp .env.local web/.env.local
# Paste SANITY_API_TOKEN from https://www.sanity.io/manage/project/nn9xx2r4/api
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, CSRF allow-list |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | **`nn9xx2r4`** — EGC Sanity project |
| `NEXT_PUBLIC_SANITY_DATASET` | **`production`** |
| `NEXT_PUBLIC_SANITY_API_VERSION` | **`2024-10-01`** |
| `SANITY_API_TOKEN` | Read/write token (required for CMS on site + imports) |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Contact-form email |
| `KIT_API_KEY`, `KIT_FORM_ID` | Newsletter (ConvertKit/Kit) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Production rate limiting |

Without `NEXT_PUBLIC_SANITY_PROJECT_ID`, CMS-backed pages fall back to local CSV/static data.

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
2. In Vercel, **Import** the repo (uses root `vercel.json` → builds `web/` workspace).
3. **Required** environment variables (Vercel → Settings → Environment Variables):

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://egcnyc.org` |
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | `nn9xx2r4` |
   | `NEXT_PUBLIC_SANITY_DATASET` | `production` |
   | `NEXT_PUBLIC_SANITY_API_VERSION` | `2024-10-01` |
   | `SANITY_API_TOKEN` | Your Editor token from Sanity dashboard |

   Copy the token from your local `.env.local` — it is **not** stored in git.

4. Redeploy after adding env vars.

## Sanity CMS

**Project:** `nn9xx2r4` · **Org:** `oVUjX2dez` · **Studio:** https://egc-content.sanity.studio/

Schema lives in `studio/schemaTypes/` (modeled from Webflow CSV exports). The Next.js
app reads content via `web/sanity/` GROQ queries when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set.

Collections: `category`, `tag`, `author`, `mentor`, `boldFellow`, `teamMember`, `post`,
`job`, `partner`, `partnerSpotlight`, `alumniSpotlight`, `testimonial`.

### Local Studio

```bash
npm run dev:studio    # http://localhost:3333
npm run deploy:studio # https://egc-content.sanity.studio/
```

### Import / sync CMS data

```bash
npm run push:sanity   # CSVs → Sanity (uses .env.local tokens)
```
