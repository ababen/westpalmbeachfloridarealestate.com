# westpalmbeachfloridarealestate.com

Real estate website built with [Astro](https://astro.build) and served by a Cloudflare Worker.
Lead forms email submissions through [Resend](https://resend.com).

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

Lead form settings (set once as Worker secrets):

```sh
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put LEAD_TO_EMAIL     # where leads go (comma-separated for several)
npx wrangler secret put LEAD_FROM_EMAIL   # a sender on a domain verified in Resend
```

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
