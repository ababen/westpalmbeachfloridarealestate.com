# westpalmbeachfloridarealestate.com

Real estate website for Alexander Babenchuk, REALTOR® with LoKation Real Estate (FL license SL3596634). Built with
[Astro](https://astro.build) and served by a Cloudflare Worker. Live at https://westpalmbeachfloridarealestate.com.

- [Develop](#develop)
- [Deploy](#deploy)
- [What's built](#whats-built)
- [Pending work](#pending-work)
- [Condo guide data](#condo-guide-data)
- [Images](#images)
- [Lead form](#lead-form)
- [Security and CI](#security-and-ci)
- [Structure](#structure)

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # validates the condo data, then builds to dist/
```

Node 22.22.0 or newer (Astro 7). Business details (agent, license, brokerage, phone, GA ID, IDX link) live in
`src/config/site.ts`. Florida requires the brokerage's licensed name on all advertising; it is in the footer of every page.

## Deploy

The site runs as a Cloudflare Worker that serves the built pages (bundled into the script by
`scripts/embed-assets.mjs`) and handles `/api/lead`. Custom domains are set in `wrangler.toml`.

**Merging to `main` deploys automatically** via `.github/workflows/deploy.yml` (about two minutes), then smoke-tests
`/`, `/condos`, `/listings` and a building page. It uses the repository secrets `CLOUDFLARE_API_TOKEN` (the
"Edit Cloudflare Workers" template plus **Workers R2 Storage: Edit**) and `CLOUDFLARE_ACCOUNT_ID`. It can also be run
by hand from the Actions tab. Manual deploy:

```sh
npm run deploy   # astro build → embed dist/ → upload images to R2 → wrangler deploy
```

Building, neighborhood and hero images (`public/images/{condos,neighborhoods,hero}/`) are served from the R2 bucket
`wpbre-images`, not bundled into the Worker, which keeps it under Cloudflare's size limit.

## What's built

**Site**
- Home, Buy, Sell, Listings, About, Contact, Privacy, and Photo Credits pages. Home has a full-bleed AI-illustrated
  hero (Gemini via Figma, with a portrait crop for phones) and a Featured buildings slider.
- 11 neighborhood guides, each with an AI illustration (labelled, listed on `/photo-credits`).
- `/listings` embeds the Flexmls IDX Lite search (`idxEmbedUrl` in `src/config/site.ts`).
- Phone is (561) 783-4553 everywhere (header, footer, call button, contact page, structured data, share image).
- Social share card: `scripts/og-card.html` → `public/og-card.png` (`node scripts/render-og-card.mjs`).
- Google Analytics 4 is on; Search Console is set up.

**Condo building guide** (`/condos`, `/condos/[slug]`): **59 buildings** in six areas (Downtown, South Flagler, North
Flagler, Northwood, Lands of the President, Clear Lake). Each page has facts, FAQ, map, Street View, nearby buildings,
JSON-LD, a lead form, and a data-discrepancy disclaimer. Highlights of the work so far:
- County-verified addresses and unit counts (Palm Beach County parcel layer); other addresses a building is listed
  under show as "Also listed at" (`altAddresses`).
- "Waterfront" means the building faces the Intracoastal: on the water, or on Flagler Drive with only the road and
  waterfront path between it and the water.
- Facts from association documents where they exist online (Portofino, Envoy Tower, Flagler Pointe, Palm Beach House
  rules; developers from state incorporation records). Listing-site pet and rental text is never used.
- Images: free-licensed photos where found, otherwise labelled AI artist's renderings (completed buildings only) or
  hand-drawn illustrations; Street View panoramas for most buildings.
- Optional "See units for sale" button per building (`listingsUrl`), ready for Flexmls links (see Pending).

**Lead form** (`functions/api/lead.js`): Cloudflare Turnstile, rate limit (3 per minute), link-spam filter, email sent
from leads@westpalmbeachfloridarealestate.com through Cloudflare Email Routing to homesbychuk@gmail.com, Resend as fallback.
hello@westpalmbeachfloridarealestate.com forwards to the same inbox.

**Repository security** (all merged): CI with dependency review and a production audit, CodeQL (code and workflows),
Dependabot, CODEOWNERS, SECURITY.md, SHA-pinned actions. Full git history was scanned for secrets: none found.

## Pending work

Open GitHub issues are tracked under #6.

**For the owner**
- [ ] **#20 Listings per building:** in Flexmls, save one search per building, then Menu → Preferences → IDX Manager →
  *Retrieve IDX Lite Link* → *Saved Searches*, and send the `link.flexmls.com/…` links as `slug URL` lines. They are
  applied with `node scripts/condos/set-listings-urls.mjs links.txt`. Start with two or three and check each opens on
  the right building. Also confirm with LoKation or Beaches MLS (561-727-2777, mlssupport@rworld.com) that the broker
  has notified the MLS of the IDX display (rule §20.2.1).
- [ ] **#9 Pet and lease rules:** only association documents or a manager's answer count. Contacts are on the issue
  (Viking Arms, Flagler Landing, Placido Mar, Washington Tower, Rapallo South and others). Still blank: City Palms,
  Waterview Towers, Trianon, Viking Arms, Flagler Landing, Placido Mar, Washington Tower, Slade, Rapallo North and
  South, Flagler Yacht Club.
- [ ] **#15 Real photography:** your own photos, or developers' permission to use theirs. Developer emails are
  drafted and **not sent**; send only when you decide the site is ready.
- [ ] Confirm the test message sent to hello@ on Oct 22 reached homesbychuk@gmail.com.
- [ ] Optional: a ruleset for `main` (Settings → Rules: require a PR and the CI/CodeQL checks, block force-pushes;
  add yourself to the bypass list because you can't approve your own PRs), and Secret scanning / Push protection.
- [ ] Optional: repository secrets `GEMINI_API_KEY` (weekly AI renderings workflow; also needs **Settings → Actions →
  Allow GitHub Actions to create pull requests**) and `PUBLIC_GOOGLE_MAPS_KEY` (Street View in deploys; local builds
  read it from `.env`).

**Research left**
- [ ] **#13 Missing facts:** developers and architects for older buildings (Slade, Placido Mar, Flagler Landing,
  Washington Tower, Trianon, Viking Arms, both Rapallos, Flagler Yacht Club, Prado, Metropolitan, City Palms, Strand,
  610 Clematis, CityPlace South Tower, and others) are not online. Next source: recorded condo declarations at the Palm
  Beach County Clerk, or Sunbiz PDFs opened in a browser. Unit sizes are still blank where sources conflict (Strand,
  610 Clematis, CityPlace South Tower, Banyan Tree, Washington Tower, Palm Beach House, 101 Lofts).
- [ ] **Conflicts to settle** (left blank or flagged): Waterview Towers and Palm Beach House floors; Trianon units
  (county 106, sources 109–114) and floors; Lincoln, Jefferson and The Edge floors; Forté bedrooms, size and unit count
  (40 vs 41); Edgeworth completion year (2029 vs 2030), bedrooms and units (168 vs 182); Apogee architect and units
  (39 vs 46); Tower Condominium at CityPlace year built (2004 vs about 2000); Rapallo South and North floors and units;
  Bristol sizes.
- [ ] **Waterfront check:** Esplanade Grande and 101 Lofts are marked not waterfront (a block inland); confirm.
- [ ] **#14 Coverage:** proposed towers to add once named and approved: 2085 N Flagler (Terra/BH, twin 31-story),
  201–203 Arkona Ct (26-story, 16 residences), 1800 and 2175/2251 N Flagler, Harbor Towers and Southbridge sites,
  Rybovich district, Nora House. Garden-style and large gated communities (The Senate, Presidential Golfview,
  Whitehall at Bear Lakes, Ibis, Andros Isle, Banyan Cay) are intentionally out of scope; they'd need a different page type.
- [ ] **#12 New-construction status:** re-check every quarter (next due January 2027). Flagler Yacht Club is weighing
  developer buyout offers; Portofino South has had a reported buyout proposal.

## Condo guide data

`/condos` and `/condos/[slug]` are generated from `src/data/buildings.json`. Every fact needs a source URL, and fields
where sources conflict stay `null`. The full workflow is in `.claude/skills/condo-research/SKILL.md`.

```sh
npm run condos:check                                  # validate the data (also runs on build)
node scripts/condos/county-units.mjs [slug,slug]      # county residential unit counts
node scripts/condos/apply-updates.mjs updates.json    # apply researched changes
node scripts/condos/geocode.mjs                       # add map coordinates for new buildings
node scripts/condos/streetview.mjs [--force] [slug]   # Street View panorama (needs PUBLIC_GOOGLE_MAPS_KEY)
node scripts/condos/set-listings-urls.mjs links.txt   # Flexmls "See units for sale" links
```

## Images

- **Photos:** free-licensed only, via `scripts/condos/add-photo.mjs`; credited wherever shown.
- **AI renderings:** completed buildings only, never unbuilt ones. `scripts/condos/add-rendering.mjs` saves one;
  descriptions live in `scripts/condos/render-prompts.json`. Inland buildings' prompts must say there is no water.
  Every AI image is labelled ("Artist's rendering (Gemini-generated), not a photograph" or "Illustration") and listed
  on `/photo-credits`. The **Renderings** workflow (`.github/workflows/renderings.yml`) can generate more weekly with a
  `GEMINI_API_KEY` secret and opens a draft PR.
- **Neighborhood images:** `scripts/add-neighborhood-image.mjs`, recorded in `src/data/neighborhoodImages.json`.
- Image generation used Figma's `generate_image` (Gemini and OpenAI models); output URLs expire after 7 days, so
  download immediately.

## Lead form

Set once as Worker secrets:

```sh
npx wrangler secret put LEAD_TO_EMAIL     # where leads go (comma-separated for several)
npx wrangler secret put TURNSTILE_SECRET  # Cloudflare Turnstile (spam protection)
# Resend fallback, used only if Cloudflare sending fails:
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put LEAD_FROM_EMAIL   # a sender on a domain verified in Resend
```

Cloudflare sending is free only to verified Email Routing destination addresses. To add a recipient, verify it under
Email Routing → Destination addresses, then add it to `allowed_destination_addresses` in `wrangler.toml`.

## Security and CI

- `ci.yml`: build (with the condo data validator), Worker bundle check, production `npm audit`, and dependency review on PRs.
- `codeql.yml`: CodeQL for JavaScript/TypeScript and the workflows, on PRs, `main` and weekly.
- `dependabot.yml`: weekly npm and GitHub Actions updates, minor and patch grouped.
- Workflows use a read-only token and actions pinned to commit SHAs; installs run with `--ignore-scripts`.
- Secrets live in Cloudflare (Worker secrets), GitHub Actions secrets, and a git-ignored `.env`; never in the repo.
  Report vulnerabilities as described in `SECURITY.md`.

## Structure

```
src/config/site.ts            business details, nav
src/data/buildings.json       condo guide data (validated by scripts/condos/validate.mjs)
src/data/neighborhoods.ts     neighborhood guide content (add one here → new page)
src/pages/                    routes (home, buy, sell, listings, condos, neighborhoods, about, contact, privacy, photo-credits)
src/components/               header, footer, lead form, hero slider, building cards and art, data disclaimer
functions/api/lead.js         form handler
worker/index.js               Worker: serves pages and R2 images, routes /api/lead
scripts/                      deploy, image and condo-data tooling
.github/workflows/            CI, CodeQL, deploy, renderings
```
