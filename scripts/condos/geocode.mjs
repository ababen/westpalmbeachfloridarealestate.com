// Adds lat/lng to buildings in src/data/buildings.json that don't have them.
// Tries OpenStreetMap Nominatim first (1 request/second, per its usage policy),
// then the US Census geocoder. Prints every match so you can eyeball it.
// Usage: node scripts/condos/geocode.mjs [--force slug,slug]
import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../../src/data/buildings.json', import.meta.url);
const buildings = JSON.parse(await readFile(file, 'utf8'));
const forceArg = process.argv.indexOf('--force');
const force = new Set(forceArg > -1 ? process.argv[forceArg + 1].split(',') : []);
const headers = { 'User-Agent': 'westpalmbeachfloridarealestate.com condo guide (hello@westpalmbeachfloridarealestate.com)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// "525 & 529 S Flagler Dr" -> "525 S Flagler Dr"
const street = (address) => address.split(',')[0].replace(/^(\d+)\s*(?:&|,)\s*[\d,&\s]+/, '$1 ').replace(/\s+/g, ' ');

async function nominatim(q) {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ format: 'json', limit: '1', countrycodes: 'us', q })}`;
  const [hit] = await (await fetch(url, { headers })).json();
  await sleep(1100);
  // Street-level hits ("North Clematis Street") aren't precise enough; require a house number in the match.
  if (!hit || !/^\D*\d/.test(hit.display_name)) return null;
  return { lat: Number(hit.lat), lng: Number(hit.lon), match: hit.display_name, src: 'osm' };
}

async function census(q) {
  const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?${new URLSearchParams({ address: q, benchmark: 'Public_AR_Current', format: 'json' })}`;
  const [hit] = (await (await fetch(url)).json()).result.addressMatches;
  if (!hit) return null;
  // Census sometimes snaps to a different street; reject those.
  const wantStreet = q.split(',')[0].toUpperCase().replace(/\s+/g, '');
  if (!hit.matchedAddress.replace(/\s+/g, '').startsWith(wantStreet)) return null;
  return { lat: hit.coordinates.y, lng: hit.coordinates.x, match: hit.matchedAddress, src: 'census' };
}

let changed = 0;
for (const b of buildings) {
  if (typeof b.lat === 'number' && !force.has(b.slug)) continue;
  const zip = b.address.match(/\d{5}/)?.[0] ?? '';
  const q = `${street(b.address)}, West Palm Beach, FL ${zip}`;
  const hit = (await nominatim(q)) ?? (await census(q));
  if (!hit) {
    console.log(`NO MATCH  ${b.slug}  (${q}) — set lat/lng by hand`);
    continue;
  }
  b.lat = Math.round(hit.lat * 1e6) / 1e6;
  b.lng = Math.round(hit.lng * 1e6) / 1e6;
  changed++;
  console.log(`${hit.src.padEnd(6)} ${b.slug}  ${b.lat},${b.lng}  ${hit.match}`);
}

if (changed) await writeFile(file, JSON.stringify(buildings, null, 1) + '\n');
console.log(`${changed} buildings geocoded`);
