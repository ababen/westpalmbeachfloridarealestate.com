// Splits buildings into research batches (one JSON file per area) so several
// research agents can work in parallel without overlapping.
// Usage: node scripts/condos/batches.mjs <out-dir> [--only slug,slug] [--area "South Flagler"]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const args = process.argv.slice(2);
const outDir = args[0];
if (!outDir) {
  console.error('Usage: node scripts/condos/batches.mjs <out-dir> [--only slug,slug] [--area "Area"]');
  process.exit(1);
}
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const only = opt('--only')?.split(',');
const area = opt('--area');

const buildings = JSON.parse(await readFile(new URL('../../src/data/buildings.json', import.meta.url), 'utf8'));
const picked = buildings.filter((b) => (!only || only.includes(b.slug)) && (!area || b.area === area));

const groups = Map.groupBy(picked, (b) => b.area);
await mkdir(outDir, { recursive: true });
for (const [name, list] of groups) {
  const out = join(outDir, `batch-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`);
  await writeFile(out, JSON.stringify(list, null, 1) + '\n');
  console.log(`${out}  (${list.length} buildings)`);
}
