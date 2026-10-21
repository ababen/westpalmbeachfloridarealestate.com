// Generates AI artist's renderings with Google's Gemini image model for completed buildings that
// have a description in render-prompts.json but no photo or rendering yet, then saves each one
// through add-rendering.mjs. Run by .github/workflows/renderings.yml.
// Usage: GEMINI_API_KEY=... node scripts/condos/generate-renderings.mjs [--max 10] [slug,slug]
//
// Unbuilt buildings are skipped on purpose: a made-up rendering of a tower that doesn't exist yet
// could mislead buyers. They keep their illustration until a licensed developer rendering is added.
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) throw new Error('Set GEMINI_API_KEY');
const MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-2.5-flash-image';
const args = process.argv.slice(2);
const max = Number(args.includes('--max') ? args[args.indexOf('--max') + 1] : 10);
const only = args.find((a) => !a.startsWith('--') && !/^\d+$/.test(a))?.split(',');

const prompts = JSON.parse(await readFile(new URL('./render-prompts.json', import.meta.url), 'utf8'));
const buildings = JSON.parse(await readFile(new URL('../../src/data/buildings.json', import.meta.url), 'utf8'));

export const promptFor = (b) => {
  const [lead, ...rest] = prompts._style.split('. ');
  const setting = prompts._settings?.[b.slug] ?? (b.waterfront ? prompts._waterfront : prompts._street);
  return `${lead}. ${prompts[b.slug]} ${setting} ${rest.join('. ')}`;
};

// "AQ." keys are Vertex AI express-mode keys; "AIza" keys are Google AI Studio (Gemini API) keys.
const endpoint = KEY.startsWith('AQ.')
  ? `https://aiplatform.googleapis.com/v1/publishers/google/models/${MODEL}:generateContent?key=${KEY}`
  : `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

async function generate(prompt) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:3' } },
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${json.error?.message ?? JSON.stringify(json).slice(0, 300)}`);
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`No image returned: ${JSON.stringify(json).slice(0, 300)}`);
  return Buffer.from(part.inlineData.data, 'base64');
}

const todo = buildings
  .filter((b) => b.status === 'completed' && !b.photo && prompts[b.slug] && (!only || only.includes(b.slug)))
  .slice(0, max);
if (!todo.length) console.log('Nothing to generate: every described, completed building has an image.');

const dir = await mkdtemp(join(tmpdir(), 'renderings-'));
const done = [];
for (const b of todo) {
  try {
    const file = join(dir, `${b.slug}.png`);
    await writeFile(file, await generate(promptFor(b)));
    execFileSync('node', [new URL('./add-rendering.mjs', import.meta.url).pathname, b.slug, file, 'Gemini'], { stdio: 'inherit' });
    done.push(b.slug);
  } catch (e) {
    console.error(`${b.slug}: ${e.message}`);
  }
}
console.log(`Generated ${done.length} of ${todo.length}: ${done.join(', ')}`);
if (process.env.GITHUB_OUTPUT) await writeFile(process.env.GITHUB_OUTPUT, `generated=${done.join(',')}\n`, { flag: 'a' });
