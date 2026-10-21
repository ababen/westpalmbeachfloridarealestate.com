# westpalmbeachfloridarealestate.com

Real estate website built with [Astro](https://astro.build) and served by a Cloudflare Worker.
Lead forms email submissions through Cloudflare's `send_email` binding, from leads@westpalmbeachfloridarealestate.com, with [Resend](https://resend.com) as a fallback.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Before launch

1. **Business details** live in `src/config/site.ts` (agent, license, brokerage). Florida requires the
   brokerage's licensed name on all advertising; it's in the footer of every page.
2. **About page bio & photo** — `src/pages/about.astro`; put the photo in `public/images/`.
3. **Property search** — set `idxEmbedUrl` in `src/config/site.ts` to your IDX provider's embed URL.
   Until then, `/listings` shows a "send me listings" form.
4. **Photography** — neighborhood cards use illustrated placeholders; swap in real photos when ready.
5. **Privacy policy** — review `src/pages/privacy.astro`.

## Deploy (Cloudflare Worker)

The site runs as a Cloudflare Worker that serves the built pages (bundled into the script by
`scripts/embed-assets.mjs`) and handles `/api/lead`. Custom domains are set in `wrangler.toml`.

```sh
npm run deploy   # astro build → embed dist/ → wrangler deploy
```

Pushes to `main` deploy automatically via `.github/workflows/deploy.yml` once the repository secrets
`CLOUDFLARE_API_TOKEN` (Cloudflare "Edit Cloudflare Workers" template, scoped to this account and the
westpalmbeachfloridarealestate.com zone) and `CLOUDFLARE_ACCOUNT_ID` are set. It can also be run by hand
from the Actions tab (**Deploy → Run workflow**).

Building images (`public/images/condos/`) are served from the R2 bucket `wpbre-images`, not bundled
into the Worker, which keeps it under Cloudflare's size limit. `npm run deploy` uploads them, so the
deploy token also needs **Workers R2 Storage: Edit**. Images are either free-licensed photos
(`scripts/condos/add-photo.mjs`) or AI artist's renderings (`scripts/condos/add-rendering.mjs`), and the
site labels each as one or the other. The **Renderings** workflow (`.github/workflows/renderings.yml`) generates
renderings for completed buildings described in `scripts/condos/render-prompts.json`. It needs a
`GEMINI_API_KEY` repository secret, plus **Settings → Actions → Allow GitHub Actions to create pull requests**,
and it opens a draft PR for review. Unbuilt buildings never get AI renderings.

Building pages show Google Street View when `PUBLIC_GOOGLE_MAPS_KEY` is set at build time: in `.env`
(git-ignored) for local builds and deploys, or as a repository secret of the same name for the deploy
workflow. It's a browser key, restricted in Google Cloud to this domain and to the Maps Embed and Street
View Static APIs.

Lead form settings (set once as Worker secrets):

```sh
npx wrangler secret put LEAD_TO_EMAIL     # where leads go (comma-separated for several)
npx wrangler secret put TURNSTILE_SECRET  # Cloudflare Turnstile (spam protection)
# Resend fallback, used only if Cloudflare sending fails:
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put LEAD_FROM_EMAIL   # a sender on a domain verified in Resend
```

Cloudflare sending is free only to verified Email Routing destination addresses. To add a new lead
recipient, verify it under Email Routing → Destination addresses, then add it to
`allowed_destination_addresses` in `wrangler.toml`.

Until these are set, forms show an error asking visitors to call or email.

## Condo building guide

`/condos` and `/condos/[slug]` are generated from `src/data/buildings.json`. Every fact there needs a
source URL, and fields where sources conflict stay `null`. The full research workflow is in
`.claude/skills/condo-research/SKILL.md`.

```sh
npm run condos:check                                  # validate the data (also runs on build)
node scripts/condos/apply-updates.mjs updates.json    # apply researched changes
node scripts/condos/geocode.mjs                       # add map coordinates for new buildings
```

## Structure

```
src/config/site.ts         business details, nav
src/data/neighborhoods.ts  neighborhood guide content (add a neighborhood here → new page)
src/pages/                 routes (home, buy, sell, listings, neighborhoods, about, contact)
src/components/            header, footer, lead form, cards
functions/api/lead.js      form handler
worker/index.js            Worker: serves pages, routes /api/lead
```
