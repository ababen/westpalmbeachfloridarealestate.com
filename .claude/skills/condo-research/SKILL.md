---
name: condo-research
description: Research West Palm Beach condo buildings and improve their pages on the site (src/data/buildings.json → /condos and /condos/[slug]). Use when asked to research, verify, update, refresh, fact-check or add condo buildings; to fill missing building facts (units, floors, year, developer, amenities, pets, sizes); to refresh new-construction status; or to work the "condo-data" GitHub issues.
---

# Condo building research

The condo guide is generated from **`src/data/buildings.json`**. Every page, card, FAQ, map, comparison-table row and JSON-LD block comes from that file, so improving a page almost always means improving its data. Change `src/pages/condos/` only when a page needs a new *kind* of content.

## Ground rules (non-negotiable)

1. **Every fact needs a source.** Add the URL to the building's `sources` array. Never write a fact from memory or estimate one.
2. **Conflicting sources → `null`.** If two reasonable sources disagree (units 221 vs 236, 16 vs 17 floors), set the field to `null` and record the conflict in the PR description or the GitHub issue. Fill it in later from an authoritative source. Priority order:
   1. Palm Beach County Property Appraiser (pbcpao.gov) or condo association documents
   2. Developer press releases and official project sites
   3. News: Florida YIMBY, The Real Deal, Palm Beach Post, Commercial Observer, Bisnow
   4. Listing aggregators: CondoBlackBook, Compass, Bex Realty. These are useful but often templated or wrong; Compass's pet field in particular is unreliable.
3. **No prices, HOA fees, or availability.** They go stale. The validator rejects `$` amounts and "HOA fee" text.
4. **Fair housing.** Use neutral, factual language. Never describe who a building "suits" (families, retirees, singles, etc.). Mention an age restriction (55+/HOPA) only if a source confirms it, and state it factually.
5. **No superlatives you can't source** ("best", "most luxurious", "finest"). The validator flags these.
6. **`waterfront: true` means directly on the Intracoastal.** Buildings across Flagler Drive or a block inland with water *views* are `false`.
7. **Stay inside City of West Palm Beach limits.** Nothing on Palm Beach island, Riviera Beach, Singer Island or Lake Worth Beach.
8. **Skip buildings that are effectively gone**: bought out for demolition, or with the association terminated. Note why in the PR.
9. **Photos:** don't copy images from listing or developer sites (copyright). Use only photos the owner provides, free-licensed Commons photos (`add-photo.mjs`), or AI artist's renderings of **completed** buildings (`render-prompts.json`, then the Renderings workflow or `add-rendering.mjs`). Renderings of inland buildings must not show water.

## Data shape

See `Building` in `src/data/buildings.ts`. Fields:

- **Required:** `slug`, `name`, `address` (must end `West Palm Beach, FL <ZIP>`), `area`, `status`, `summary`, `amenities[]`, `sources[]`, `lat`, `lng`.
- **Optional:** `aka[]`, `altAddresses[]` (other street addresses the building is recorded or listed under, street part only; keep the county's address as `address`), `yearBuilt` (expected completion year for unfinished towers), `floors`, `units`, `developer`, `architect`, `waterfront`, `description`, `bedrooms` (e.g. `"1–3"`), `sqftRange` (e.g. `"980–1,775"`, no "sq ft" suffix), `petPolicy`, `parking`, `rentalPolicy`.
- **`area`** must be one of `buildingAreas` in `src/data/buildings.ts`. To add a new area, add it there in display order, and map it in `areaNeighborhood` if a neighborhood guide exists.
- **`status`** is one of `completed`, `under construction`, `pre-construction`.
- **`summary`** is 1–2 sentences, used on cards and in meta descriptions. **`description`** is 3–5 sentences, shown on the page. They must not contradict the facts: if you blank `units`, remove the unit count from both texts.

## Workflow

### 1. Scope the work
- List open data issues: GitHub issues labeled `condo-data`. The tracking issue "Condo guide: data and page backlog" links them all.
- Find gaps with `npm run condos:check`. It prints warnings, such as buildings without a description.
- For a quick inventory of what's missing, list each building's null fields:
  ```sh
  node -e "for (const b of require('./src/data/buildings.json')) { const m=['yearBuilt','floors','units','developer','architect','bedrooms','sqftRange','petPolicy','description'].filter(k=>b[k]==null); if(m.length) console.log(b.slug, m.join(',')) }"
  ```

### Unit counts: use county records first
`node scripts/condos/county-units.mjs [slug,slug]` counts each building's residential condo parcels in Palm Beach County's address layer, and prints a source URL for each count. Use it before web research:
- When `units` is blank or sources conflict, set it to the county count and add the printed URL to `sources`.
- A county count a few below a published one usually means owners combined units. Keep the published declared count, and mention the combinations in `description` if it matters.
- "No condo parcels" means the tower is new or not yet platted as a condominium. Use developer figures.

### 2. Research in parallel
Split the work so agents don't overlap:
```sh
node scripts/condos/batches.mjs <scratch-dir>                  # one file per area
node scripts/condos/batches.mjs <scratch-dir> --only slug,slug  # specific buildings
```
Launch one research agent per batch, all in a single message so they run concurrently. Use the prompt in `references/research-prompt.md`, filling in the batch file path and the task. Each agent returns an **updates file** in the format `scripts/condos/apply-updates.mjs` expects.

For **new buildings** (coverage gaps), use the "find new buildings" variant in the same reference. Check every candidate against existing slugs and addresses before adding it.

### 3. Review before applying
Read each agent's report critically:
- A value from a single aggregator, especially Compass or Bex, is weak. Keep it only if nothing contradicts it.
- Any reported conflict means `null` plus a note.
- Check that summary and description text matches the facts you're setting.
- Check that new-construction status reflects the latest news. Approvals, denials, groundbreakings, top-outs and completions change pages.

### 4. Apply, geocode, validate
```sh
node scripts/condos/apply-updates.mjs <updates.json> --dry-run   # review the diff it prints
node scripts/condos/apply-updates.mjs <updates.json>
node scripts/condos/geocode.mjs          # only fills buildings missing lat/lng
npm run condos:check                     # must print 0 errors
npm run build                            # also runs the validator
```
Then run `node scripts/condos/streetview.mjs` to give new buildings a Street View panorama (needs `PUBLIC_GOOGLE_MAPS_KEY` in `.env`). After moving a pin, re-run it with `--force slug`. Check that the printed heading shows the building on its page.

`geocode.mjs` prints each match. Confirm the match is the right building, since street-only matches are rejected but a wrong house can slip through. Re-run with `--force slug` after fixing an address, or set `lat`/`lng` by hand.

### 5. Check the pages
Preview with `npm run build && node scripts/embed-assets.mjs && npx wrangler dev`, which serves the site exactly as the Worker does, or with `npm run preview`. Then check:
- `/condos`: filters work, and the comparison table sorts.
- A changed building page: the facts grid, FAQ answers that read naturally, the map pin on the right building, and no horizontal scroll at 390px width.

### 6. Ship
- Commit to the working branch with a message listing what changed and what was blanked and why.
- Open or update the PR. Its description must list:
  - **Filled:** each field and its source.
  - **Blanked (conflict):** each field and the conflicting values.
  - **Still to verify:** add anything new to the matching GitHub issue.
- Deploy with `npm run deploy` (Cloudflare Worker). This needs Cloudflare credentials: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- Comment on, or close, the GitHub issues you resolved.

## Page features driven by data

| Field | Where it shows |
| --- | --- |
| `floors`, `units`, `yearBuilt`, `waterfront` | Hero pills, facts grid, card, comparison table, FAQ |
| `bedrooms`, `sqftRange` | Facts grid, "What size are the residences" FAQ |
| `petPolicy` | Facts grid, pets FAQ, `petsAllowed` in JSON-LD |
| `streetView` | Street view embed on the building page (hidden when null or when no Maps key is set) |
| `lat`, `lng` | Map embed, distances (`src/data/landmarks.ts`), nearby buildings, JSON-LD `geo` |
| `status` | Badge, filters, FAQ ("When will X be completed" / "What is the status") |
| `area` | Index section, breadcrumb, neighborhood link |

To add a landmark used for distances, add it to `src/data/landmarks.ts` with coordinates from OpenStreetMap.
