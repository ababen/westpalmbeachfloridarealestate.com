// Uploads public/images/{condos,neighborhoods}/* to the R2 bucket the Worker serves them from (wrangler.toml IMAGES).
// Small enough to re-upload every deploy.
import { readdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const BUCKET = 'wpbre-images';
const FOLDERS = ['condos', 'neighborhoods'];
const wrangler = (args) => execFileSync('npx', ['wrangler', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

let count = 0;
for (const folder of FOLDERS) {
  const dir = new URL(`../public/images/${folder}/`, import.meta.url).pathname;
  for (const f of (await readdir(dir).catch(() => [])).filter((x) => x.endsWith('.webp'))) {
    const key = `images/${folder}/${f}`;
    const size = (await stat(dir + f)).size;
    wrangler(['r2', 'object', 'put', `${BUCKET}/${key}`, '--file', dir + f, '--content-type', 'image/webp', '--cache-control', 'public, max-age=86400', '--remote']);
    console.log(`uploaded ${key} (${Math.round(size / 1024)} KB)`);
    count++;
  }
}
console.log(`${count} images in R2`);
