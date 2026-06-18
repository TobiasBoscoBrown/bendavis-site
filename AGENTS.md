# AGENTS.md — guide for AI assistants editing this site

This repository is **bennettsdavis.site**, the personal website of Ben Davis (6'9" creator, actor & model). It is built so a non-technical owner can edit everyday content with no code, and so an AI assistant (ChatGPT Codex, Claude, etc.) can safely make bigger changes.

## How to make a change
- **Content (words, photos, links, videos, promos):** lives in **`data/content.json`**. Editing that file changes the site. Do NOT hardcode copy into components.
- **Design / structure / new sections:** edit the React components in `components/` and pages in `app/`. Keep the existing design system.
- Open changes as a pull request the owner can review, or commit to `main` (every push auto-deploys to Vercel).

## Design system (do not drift from this)
Defined in `app/globals.css` `:root`:
- Cream `#efe9dd`, ink `#15130f`, blue accent `#3a9fc7`.
- Display font **Anton** (headings), body font **Archivo**.
- Keep it clean, bold, editorial. No new color themes unless asked.

## Project map
- `app/page.jsx` — home. `app/{modeling,acting,content-creation}/` — tab pages (share `components/TabPage.jsx`). `app/about/`, `app/contact/`.
- `app/admin/` — owner login + `admin/quick` settings form. `app/api/admin/*` — auth + save/upload (commit to GitHub).
- `components/` — `Nav`, `Footer`, `Marquee`, `Reveal` (scroll reveal), `ZoomImg` (lightbox), `Short` (YouTube), `Gallery`, `Blocks` (flexible text/photo/video/button blocks), `EditMode` (in-place editor), `GuideFeature`, `PartnerStrip`, `PromoStrip`, `Edit` (marks a node inline-editable via `data-edit`).
- `lib/content.js` — reads content live from the GitHub API. `lib/github.js` — commit helpers. `lib/auth.js` — admin session.

## Content model (`data/content.json`)
- `site` (brand/title/email/domain), `social` (link URLs), `stats`, `marquee`, `promoLinks`, `home`, and `pages.{modeling,acting,content-creation,about,contact}`.
- Each page has `eyebrow,title,intro,videoId,videoCaption,gallery[],ctaLabel,blocks[]`. `about` also has `heroImage,big,paragraphs[],pills[],guide{...},partner{...}`.
- `blocks[]` items are `{type:'text',text}`, `{type:'image',src,alt,caption}`, `{type:'video',videoId}`, or `{type:'link',label,href}`.

## Inline editing contract
- Editable text is wrapped in `<Edit path="dot.path">` which renders `data-edit="dot.path"`. Editable images use `ZoomImg editPath="..."`. Lists that reorder use `data-edit-list` + `data-edit-index`. Keep these attributes intact so Edit Mode keeps working.

## Env vars (set in Vercel, never commit secrets)
`ADMIN_PASSWORD`, `SESSION_SECRET`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`.

## Deploy
Push to `main` → Vercel builds and deploys automatically. Roll back anytime in Vercel → Deployments → the `...` menu → Instant Rollback.
