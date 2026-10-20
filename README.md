# westpalmbeachfloridarealestate.com

Static real estate website built with [Astro](https://astro.build). Lead forms are handled by a
Cloudflare Pages Function that emails submissions through [Resend](https://resend.com).

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Before launch

1. **Business details** — fill in every `TODO` in `src/config/site.ts` (agent name, license,
   brokerage, phone, email). Florida requires the brokerage name on all advertising.
2. **About page bio & photo** — `src/pages/about.astro`; put the photo in `public/images/`.
3. **Property search** — set `idxEmbedUrl` in `src/config/site.ts` to your IDX provider's embed URL.
   Until then, `/listings` shows a "send me listings" form.
4. **Photography** — neighborhood cards use illustrated placeholders; swap in real photos when ready.
5. **Privacy policy** — review `src/pages/privacy.astro`.

## Deploy (Cloudflare Pages)

- Build command: `npm run build` · Output directory: `dist`
- Environment variables for the lead form (`functions/api/lead.js`):
  - `RESEND_API_KEY`
  - `LEAD_TO_EMAIL` — where leads go (comma-separated for several)
  - `LEAD_FROM_EMAIL` — a sender on a domain verified in Resend

## Structure

```
src/config/site.ts         business details, nav
src/data/neighborhoods.ts  neighborhood guide content (add a neighborhood here → new page)
src/pages/                 routes (home, buy, sell, listings, neighborhoods, about, contact)
src/components/            header, footer, lead form, cards
functions/api/lead.js      form handler (Cloudflare Pages Function)
```
