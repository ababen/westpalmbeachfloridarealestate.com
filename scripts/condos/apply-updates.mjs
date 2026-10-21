// Applies a research results file to src/data/buildings.json.
// Usage: node scripts/condos/apply-updates.mjs path/to/updates.json [--dry-run]
//
// updates.json is an array of:
//   { "slug": "la-clara", "set": { "units": 83, "petPolicy": "..." }, "sources": ["https://..."], "note": "why" }
//   { "slug": "new-building", "new": { ...full Building object... } }
//   { "slug": "old-building", "remove": true, "note": "demolished / bought out" }
// In "set", a null value deliberately blanks a field (use it when sources conflict).
import { readFile, writeFile } from 'node:fs/promises';

const [path, flag] = process.argv.slice(2);
if (!path) {
  console.error('Usage: node scripts/condos/apply-updates.mjs updates.json [--dry-run]');
  process.exit(1);
}
const dryRun = flag === '--dry-run';
const file = new URL('../../src/data/buildings.json', import.meta.url);
let buildings = JSON.parse(await readFile(file, 'utf8'));
const updates = JSON.parse(await readFile(path, 'utf8'));

const show = (v) => (v === undefined ? '∅' : JSON.stringify(v));
for (const u of updates) {
  const i = buildings.findIndex((b) => b.slug === u.slug);
  if (u.new) {
    if (i > -1) throw new Error(`${u.slug} already exists; use "set" instead of "new"`);
    buildings.push({ amenities: [], sources: [], ...u.new, slug: u.slug });
    console.log(`+ ${u.slug} (new building)`);
    continue;
  }
  if (i === -1) throw new Error(`Unknown slug: ${u.slug}`);
  if (u.remove) {
    buildings.splice(i, 1);
    console.log(`- ${u.slug} removed${u.note ? `: ${u.note}` : ''}`);
    continue;
  }
  const b = buildings[i];
  for (const [k, v] of Object.entries(u.set ?? {})) {
    if (JSON.stringify(b[k]) === JSON.stringify(v)) continue;
    console.log(`~ ${u.slug}.${k}: ${show(b[k])} -> ${show(v)}`);
    b[k] = v;
  }
  b.sources = [...new Set([...(b.sources ?? []), ...(u.sources ?? [])])];
}

if (dryRun) console.log('Dry run: nothing written.');
else {
  await writeFile(file, JSON.stringify(buildings, null, 1) + '\n');
  console.log(`Wrote ${buildings.length} buildings. Next: node scripts/condos/geocode.mjs && npm run condos:check`);
}
