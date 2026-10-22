// Records Flexmls IDX Lite saved-search links on buildings, so their pages show a
// "See units for sale" button. Make each link in Flexmls (Menu → Preferences → IDX Manager →
// Retrieve IDX Lite Link → Saved Searches), then list them in a text file, one per line:
//   bristol https://link.flexmls.com/abc123def45,7
// Usage: node scripts/condos/set-listings-urls.mjs links.txt
import { readFile, writeFile } from 'node:fs/promises';

const [path] = process.argv.slice(2);
if (!path) {
  console.error('Usage: node scripts/condos/set-listings-urls.mjs links.txt   (lines of "<slug> <url>")');
  process.exit(1);
}
const file = new URL('../../src/data/buildings.json', import.meta.url);
const buildings = JSON.parse(await readFile(file, 'utf8'));
const lines = (await readFile(path, 'utf8')).split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

let count = 0;
for (const line of lines) {
  const [slug, url] = line.split(/\s+/);
  const b = buildings.find((x) => x.slug === slug);
  if (!b) throw new Error(`Unknown slug: ${slug}`);
  if (!/^https:\/\/link\.flexmls\.com\/[A-Za-z0-9]+,\d+$/.test(url ?? '')) throw new Error(`${slug}: not a Flexmls IDX Lite link: ${url}`);
  if (b.listingsUrl !== url) {
    b.listingsUrl = url;
    count++;
    console.log(`${slug}: ${url}`);
  }
}
await writeFile(file, JSON.stringify(buildings, null, 1) + '\n');
console.log(`Set ${count} listings link(s). Next: npm run condos:check`);
