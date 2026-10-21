// Renders scripts/og-card.html to public/og-card.png (the social share image).
// Usage: node scripts/render-og-card.mjs   (needs a local Chromium for playwright-core)
import { chromium } from 'playwright-core';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(new URL('./og-card.html', import.meta.url).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: new URL('../public/og-card.png', import.meta.url).pathname });
await browser.close();
console.log('Wrote public/og-card.png');
