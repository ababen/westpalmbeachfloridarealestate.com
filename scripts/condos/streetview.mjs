// Picks a Google Street View panorama for each building and the camera heading
// that points at it, and stores { pano, heading } as `streetView` in buildings.json
// (null when there's no usable coverage). Uses the free Street View metadata endpoint.
// Usage: node scripts/condos/streetview.mjs [--force] [slug,slug]
//   Without --force, buildings that already have a streetView value are skipped.
//
// Only Google's own panoramas ("© Google") are used. User-uploaded ones can be
// indoors, or of something else entirely.
import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../../src/data/buildings.json', import.meta.url);
const env = await readFile(new URL('../../.env', import.meta.url), 'utf8').catch(() => '');
const KEY = process.env.PUBLIC_GOOGLE_MAPS_KEY ?? env.match(/^PUBLIC_GOOGLE_MAPS_KEY=(.+)$/m)?.[1].trim();
if (!KEY) throw new Error('Set PUBLIC_GOOGLE_MAPS_KEY in .env');
// The key is restricted to the site's domain, so requests carry it as the referer.
const REFERER = 'https://westpalmbeachfloridarealestate.com/';
const MAX_METERS = 150;

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.find((a) => !a.startsWith('--'))?.split(',');

const rad = (d) => (d * Math.PI) / 180;
const meters = (a, b) => {
  const x = rad(b.lng - a.lng) * Math.cos(rad((a.lat + b.lat) / 2));
  return Math.hypot(x, rad(b.lat - a.lat)) * 6371000;
};
const bearing = (from, to) => {
  const y = Math.sin(rad(to.lng - from.lng)) * Math.cos(rad(to.lat));
  const x = Math.cos(rad(from.lat)) * Math.sin(rad(to.lat)) - Math.sin(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.cos(rad(to.lng - from.lng));
  return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
};

async function metadata(lat, lng, radius) {
  const params = new URLSearchParams({ location: `${lat},${lng}`, radius: String(radius), source: 'outdoor', key: KEY });
  const res = await fetch(`https://maps.googleapis.com/maps/api/streetview/metadata?${params}`, { headers: { Referer: REFERER } });
  const json = await res.json();
  // ZERO_RESULTS / NOT_FOUND mean no coverage; anything else (REQUEST_DENIED, OVER_QUERY_LIMIT) is a setup problem.
  if (!['OK', 'ZERO_RESULTS', 'NOT_FOUND'].includes(json.status)) {
    throw new Error(`Street View metadata ${json.status}: ${json.error_message ?? ''} (the key needs the Street View Static API enabled)`);
  }
  return json;
}

// Searches the building's point and a ring of points ~60 m out (the surrounding streets),
// keeping the closest Google-owned panorama.
async function findPano(b) {
  const probes = [[0, 0]];
  for (let i = 0; i < 8; i++) probes.push([60 * Math.cos((i * Math.PI) / 4), 60 * Math.sin((i * Math.PI) / 4)]);
  let best = null;
  for (const [dx, dy] of probes) {
    const lat = b.lat + dy / 111320;
    const lng = b.lng + dx / (111320 * Math.cos(rad(b.lat)));
    const m = await metadata(lat, lng, 60);
    if (m.status !== 'OK' || !/Google/.test(m.copyright ?? '')) continue;
    const dist = meters(m.location, b);
    if (dist <= MAX_METERS && (!best || dist < best.dist)) best = { pano: m.pano_id, loc: m.location, dist, date: m.date };
  }
  return best;
}

const buildings = JSON.parse(await readFile(file, 'utf8'));
for (const b of buildings) {
  if (only && !only.includes(b.slug)) continue;
  if (!force && b.streetView !== undefined) continue;
  const p = await findPano(b);
  b.streetView = p && { pano: p.pano, heading: bearing(p.loc, b) };
  console.log(p ? `${b.slug}: ${Math.round(p.dist)} m away, heading ${b.streetView.heading}°, ${p.date}` : `${b.slug}: no Google panorama within ${MAX_METERS} m`);
}
await writeFile(file, JSON.stringify(buildings, null, 1) + '\n');
