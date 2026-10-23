# Research agent prompts

Fill in the placeholders in `<angle brackets>` and launch one general-purpose agent per batch, all in a single message.

## A. Improve or verify existing buildings

> You are researching condo buildings for the West Palm Beach, FL real estate site's condo guide. Read `<batch file path>`, a JSON array of buildings with what we currently publish and the sources we used. Task: `<e.g. "fill missing fields and refresh descriptions" | "verify unit and floor counts against the Palm Beach County Property Appraiser" | "update construction status for every non-completed building">`.
>
> Research each building with web search and page fetches. Use these sources, highest priority first:
> 1. Palm Beach County Property Appraiser (pbcpao.gov) and condo association documents
> 2. Developer press releases and official project sites
> 3. Florida YIMBY, The Real Deal, Palm Beach Post, Commercial Observer and Bisnow
> 4. Listing aggregators (CondoBlackBook, Compass, Bex Realty), as weak evidence only
>
> Rules:
> - Only report a fact you found in a source, and give the URL. Never guess or estimate.
> - If sources conflict, set the field to `null` and explain the conflict in `note`. This is better than picking a value.
> - Correct a value we already publish only when a more authoritative source clearly contradicts it.
> - The current date is `<today>`. For towers not yet completed, report the latest status (approved, denied, groundbreaking, topped out, completed) and the expected completion year if one is published.
> - No prices, HOA fees or availability.
> - Use neutral fair-housing language. Never say who a building suits. Mention 55+/HOPA only if a source confirms it.
> - `waterfront` is `true` if the building faces the Intracoastal: on the water itself, or on Flagler Drive with only the road (and the waterfront path) between it and the water. Buildings a block or more inland with water views only are `false`.
> - If you rewrite `summary` (1–2 sentences) or `description` (3–5 sentences), keep them factual and consistent with the numbers you report. No unsourced superlatives.
>
> Return ONLY a JSON array of updates in this format, one entry per building you changed:
> ```json
> [{ "slug": "…", "set": { "field": value, "otherField": null }, "sources": ["https://…"], "note": "conflicts / uncertainty, or ''" }]
> ```
> Field names: `yearBuilt`, `floors`, `units`, `developer`, `architect`, `waterfront`, `status`, `summary`, `description`, `bedrooms` (e.g. `"1–3"`), `sqftRange` (e.g. `"980–1,775"`), `petPolicy`, `parking`, `rentalPolicy`, `amenities` (array), `aka` (array), `address`.

## B. Find buildings we don't cover yet

> List residential condominium buildings inside the City of West Palm Beach, FL city limits in `<area / corridor>` that are NOT in this list of existing slugs and addresses: `<paste from src/data/buildings.json>`.
>
> Include completed buildings and announced condo projects, and mark each one's status. Leave out:
> - rental-only apartments, office towers, and hotels without residences
> - anything on Palm Beach island, Riviera Beach, Singer Island or Lake Worth Beach
> - buildings bought out for demolition
>
> For each building, return a `new` entry in the format below, applying the same sourcing, conflict, fair-housing and no-price rules as prompt A:
> ```json
> [{ "slug": "kebab-case-name", "new": {
>    "name": "…", "aka": [], "address": "123 N Flagler Dr, West Palm Beach, FL 33401",
>    "area": "<one of: Downtown | South Flagler | North Flagler | Northwood | Lands of the President | Clear Lake>",
>    "status": "completed | under construction | pre-construction",
>    "yearBuilt": null, "floors": null, "units": null, "developer": null, "architect": null, "waterfront": null,
>    "amenities": [], "summary": "1–2 sentences", "description": "3–5 sentences",
>    "sources": ["https://…"] }, "note": "" }]
> ```
> If a building belongs to an area not in that list, say so in `note` and suggest an area name.
