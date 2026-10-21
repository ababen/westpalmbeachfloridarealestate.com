// Uploads public/images/condos/* to the R2 bucket the Worker serves them from (wrangler.toml IMAGES).
// Small enough to re-upload every deploy.
import { readdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const BUCKET = 'wpbre-images';
const dir = new URL('../public/images/condos/', import.meta.url).pathname;
const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith('.webp'));
const wrangler = (args) => execFileSync('npx', ['wrangler', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

for (const f of files) {
  const key = `images/condos/${f}`;
  const size = (await stat(dir + f)).size;
  wrangler(['r2', 'object', 'put', `${BUCKET}/${key}`, '--file', dir + f, '--content-type', 'image/webp', '--cache-control', 'public, max-age=86400', '--remote']);
  console.log(`uploaded ${key} (${Math.round(size / 1024)} KB)`);
}
console.log(`${files.length} building images in R2`);
