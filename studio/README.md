# EGC Studio

Standalone Sanity Studio for the EGC site.

- **Project ID:** `nn9xx2r4`
- **Dataset:** `production`

## Commands

From the repo root:

```bash
npm run dev:studio      # http://localhost:3333
npm run schema:deploy   # push schema to Content Lake (use Node 20–24)
```

From this folder:

```bash
npm run dev
npm run schema:deploy
npm run deploy          # host Studio on sanity.io
```

## Schema

All content types are modeled from the Webflow CSV exports in `/cms-data`:

`category`, `tag`, `areaOfExpertise`, `author`, `mentor`, `boldFellow`, `teamMember`, `post`, `job`, `partner`, `partnerSpotlight`, `alumniSpotlight`, `testimonial`

Import content from CSV:

```bash
npm run push:sanity     # from repo root
```
