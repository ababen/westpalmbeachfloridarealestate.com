// Adds a freely licensed Wikimedia Commons photo to a building: downloads it,
// saves a resized WebP to public/images/condos/<slug>.webp and records the credit
// in buildings.json.
// Usage: node scripts/condos/add-photo.mjs <slug> "File:Some photo.jpg" ["alt text"]
//
// Only free licences (CC0, public domain, CC BY, CC BY-SA) are accepted. Check
// that the photo really shows the building before running this.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const [slug, title, altArg] = process.argv.slice(2);
if (!slug || !title?.startsWith('File:')) {
  console.error('Usage: node scripts/condos/add-photo.mjs <slug> "File:Name.jpg" ["alt text"]');
  process.exit(1);
}
const UA = 'westpalmbeachfloridarealestate.com condo guide (photo credits)';
const FREE = /^(CC0|Public domain|CC BY(-SA)? [\d.]+)/i;
const WIDTH = 960;

const file = new URL('../../src/data/buildings.json', import.meta.url);
const buildings = JSON.parse(await readFile(file, 'utf8'));
const b = buildings.find((x) => x.slug === slug);
if (!b) throw new Error(`Unknown slug: ${slug}`);

const params = new URLSearchParams({ action: 'query', format: 'json', titles: title, prop: 'imageinfo', iiprop: 'url|extmetadata' });
const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { 'User-Agent': UA } });
const page = Object.values((await res.json()).query.pages)[0];
const info = page.imageinfo?.[0];
if (!info) throw new Error(`Not found on Commons: ${title}`);
const meta = (k) => (info.extmetadata[k]?.value ?? '').replace(/<[^>]+>/g, '').trim();
const license = meta('LicenseShortName');
if (!FREE.test(license)) throw new Error(`Licence "${license}" isn't on the free list`);

const original = await fetch(info.url, { headers: { 'User-Agent': UA } });
if (!original.ok) throw new Error(`Download failed: ${original.status}`);
const out = sharp(Buffer.from(await original.arrayBuffer())).rotate().resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: 72 });
await mkdir(new URL('../../public/images/condos/', import.meta.url), { recursive: true });
const { width, height } = await out.toFile(new URL(`../../public/images/condos/${slug}.webp`, import.meta.url).pathname);

b.photo = {
  src: `/images/condos/${slug}.webp`,
  width,
  height,
  alt: altArg ?? `${b.name}, ${b.address.split(',')[0]}`,
  credit: meta('Artist') || 'Unknown author',
  license,
  licenseUrl: meta('LicenseUrl') || null,
  sourceUrl: info.descriptionurl,
};
await writeFile(file, JSON.stringify(buildings, null, 1) + '\n');
console.log(`${slug}: ${width}x${height}, ${license}, by ${b.photo.credit}`);
