// Saves an AI-generated artist's rendering for a building: resizes it to an 800px WebP at
// public/images/condos/<slug>.webp and records it as the building's photo, labelled as a
// rendering (never as a photograph).
// Usage: node scripts/condos/add-rendering.mjs <slug> <image path or URL> [generator]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const [slug, source, generator = 'AI'] = process.argv.slice(2);
if (!slug || !source) {
  console.error('Usage: node scripts/condos/add-rendering.mjs <slug> <image path or URL> [generator]');
  process.exit(1);
}

const file = new URL('../../src/data/buildings.json', import.meta.url);
const buildings = JSON.parse(await readFile(file, 'utf8'));
const b = buildings.find((x) => x.slug === slug);
if (!b) throw new Error(`Unknown slug: ${slug}`);

const input = /^https?:\/\//.test(source) ? Buffer.from(await (await fetch(source)).arrayBuffer()) : await readFile(source);
await mkdir(new URL('../../public/images/condos/', import.meta.url), { recursive: true });
const { width, height } = await sharp(input)
  .resize({ width: 800, withoutEnlargement: true })
  .webp({ quality: 70 })
  .toFile(new URL(`../../public/images/condos/${slug}.webp`, import.meta.url).pathname);

b.photo = {
  src: `/images/condos/${slug}.webp`,
  width,
  height,
  alt: `Artist's rendering of ${b.name}`,
  credit: `${generator}-generated`,
  license: 'Rendering',
  licenseUrl: null,
  sourceUrl: `https://westpalmbeachfloridarealestate.com/photo-credits`,
};
await writeFile(file, JSON.stringify(buildings, null, 1) + '\n');
console.log(`${slug}: rendering saved (${width}x${height})`);
