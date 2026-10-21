// Saves an AI-generated illustration for a neighborhood guide: resizes it to a 1200px WebP at
// public/images/neighborhoods/<slug>.webp and records it in src/data/neighborhoodImages.json,
// labelled as an illustration (never as a photograph).
// Usage: node scripts/add-neighborhood-image.mjs <slug> <image path or URL> [generator]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const [slug, source, generator = 'AI'] = process.argv.slice(2);
if (!slug || !source) {
  console.error('Usage: node scripts/add-neighborhood-image.mjs <slug> <image path or URL> [generator]');
  process.exit(1);
}

const file = new URL('../src/data/neighborhoodImages.json', import.meta.url);
const images = JSON.parse(await readFile(file, 'utf8').catch(() => '{}'));
const input = /^https?:\/\//.test(source) ? Buffer.from(await (await fetch(source)).arrayBuffer()) : await readFile(source);
await mkdir(new URL('../public/images/neighborhoods/', import.meta.url), { recursive: true });
const { width, height } = await sharp(input)
  .resize({ width: 1200, withoutEnlargement: true })
  .webp({ quality: 70 })
  .toFile(new URL(`../public/images/neighborhoods/${slug}.webp`, import.meta.url).pathname);

images[slug] = { src: `/images/neighborhoods/${slug}.webp`, width, height, credit: `${generator}-generated`, license: 'Rendering' };
await writeFile(file, JSON.stringify(images, null, 1) + '\n');
console.log(`${slug}: illustration saved (${width}x${height})`);
