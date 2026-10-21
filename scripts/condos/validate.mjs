// Checks src/data/buildings.json for schema problems and content-policy issues.
// Usage: node scripts/condos/validate.mjs   (exits 1 if any error is found)
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const file = new URL('../../src/data/buildings.json', import.meta.url);
const buildings = JSON.parse(await readFile(file, 'utf8'));

const STATUSES = ['completed', 'under construction', 'pre-construction'];
const AREAS = ['Downtown', 'South Flagler', 'North Flagler', 'Northwood', 'Lands of the President'];
// Rough bounding box for the City of West Palm Beach.
const BOUNDS = { latMin: 26.64, latMax: 26.78, lngMin: -80.2, lngMax: -80.03 };
// Prices and fees go stale; fair-housing-sensitive phrases describe who a building "suits".
const BANNED = [
  /\$\s?\d/,
  /\bHOA fees?\b/i,
  /\bper month\b/i,
  /\bperfect for (families|retirees|seniors|singles|couples|young)/i,
  /\bideal for (families|retirees|seniors|singles|couples|young)/i,
  /\bfamily[- ]friendly\b/i,
  /\bexclusive community\b/i,
  /\bbest\b|\bmost luxurious\b|\bfinest\b/i,
];
const TEXT_FIELDS = ['summary', 'description', 'petPolicy', 'parking', 'rentalPolicy'];

const errors = [];
const warnings = [];
const err = (b, msg) => errors.push(`${b.slug ?? '?'}: ${msg}`);
const warn = (b, msg) => warnings.push(`${b.slug ?? '?'}: ${msg}`);

const slugs = new Set();
const addresses = new Map();

for (const b of buildings) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(b.slug ?? '')) err(b, 'slug must be lowercase-kebab-case');
  if (slugs.has(b.slug)) err(b, 'duplicate slug');
  slugs.add(b.slug);

  for (const f of ['name', 'address', 'area', 'status', 'summary']) if (!b[f]) err(b, `missing ${f}`);
  if (!/West Palm Beach, FL \d{5}$/.test(b.address ?? '')) err(b, 'address must end with "West Palm Beach, FL <ZIP>"');
  if (b.altAddresses != null) {
    if (!Array.isArray(b.altAddresses) || !b.altAddresses.every((a) => typeof a === 'string' && /^\d+ \S/.test(a) && !a.includes(',')))
      err(b, 'altAddresses must be street-only strings like "1309 S Flagler Dr"');
    else if (b.altAddresses.includes(b.address.split(',')[0])) err(b, 'altAddresses repeats the primary address');
  }
  if (!AREAS.includes(b.area)) err(b, `area "${b.area}" is not in buildingAreas (src/data/buildings.ts)`);
  if (!STATUSES.includes(b.status)) err(b, `status must be one of: ${STATUSES.join(', ')}`);
  if (!Array.isArray(b.amenities)) err(b, 'amenities must be an array');
  if (!Array.isArray(b.sources) || b.sources.length === 0) err(b, 'needs at least one source URL');
  for (const s of b.sources ?? []) if (!/^https?:\/\//.test(s)) err(b, `source is not a URL: ${s}`);

  for (const f of ['yearBuilt', 'floors', 'units'])
    if (b[f] != null && (!Number.isInteger(b[f]) || b[f] <= 0)) err(b, `${f} must be a positive integer or null`);
  if (b.yearBuilt && (b.yearBuilt < 1900 || b.yearBuilt > 2040)) err(b, `yearBuilt ${b.yearBuilt} looks wrong`);
  if (b.floors && b.floors > 60) warn(b, `${b.floors} floors is unusually tall for West Palm Beach`);
  if (b.status === 'completed' && b.yearBuilt > new Date().getFullYear()) err(b, 'completed but yearBuilt is in the future');
  if (b.waterfront != null && typeof b.waterfront !== 'boolean') err(b, 'waterfront must be true, false or null');

  if (typeof b.lat !== 'number' || typeof b.lng !== 'number') err(b, 'missing lat/lng (run scripts/condos/geocode.mjs)');
  else if (b.lat < BOUNDS.latMin || b.lat > BOUNDS.latMax || b.lng < BOUNDS.lngMin || b.lng > BOUNDS.lngMax)
    err(b, `lat/lng ${b.lat},${b.lng} is outside West Palm Beach`);

  if (b.photo != null) {
    const p = b.photo;
    if (!/^\/images\/condos\/[a-z0-9-]+\.webp$/.test(p.src ?? '')) err(b, 'photo.src must be /images/condos/<slug>.webp');
    else if (!existsSync(new URL(`../../public${p.src}`, import.meta.url))) err(b, `photo file missing: public${p.src}`);
    if (!p.credit || !p.license || !/^https?:\/\//.test(p.sourceUrl ?? '')) err(b, 'photo needs credit, license and sourceUrl');
    if (!/^(CC0|Public domain|CC BY(-SA)? [\d.]+|Permission|Rendering$)/i.test(p.license ?? '')) err(b, `photo license "${p.license}" is not a free licence or recorded permission`);
    if (!Number.isInteger(p.width) || !Number.isInteger(p.height)) err(b, 'photo needs integer width and height');
  }

  if (b.streetView != null) {
    const { pano, heading } = b.streetView;
    if (typeof pano !== 'string' || !pano || !Number.isInteger(heading) || heading < 0 || heading >= 360)
      err(b, 'streetView must be { pano: string, heading: 0-359 } or null');
  }

  for (const f of TEXT_FIELDS) {
    const text = b[f];
    if (!text) continue;
    for (const re of BANNED) if (re.test(text)) err(b, `${f} matches content rule ${re}`);
  }
  if (!b.description) warn(b, 'no long description yet');

  const key = (b.address ?? '').split(',')[0].toLowerCase().replace(/[^0-9a-z]/g, '');
  if (addresses.has(key)) err(b, `same street address as ${addresses.get(key)}`);
  addresses.set(key, b.slug);
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`${buildings.length} buildings, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
