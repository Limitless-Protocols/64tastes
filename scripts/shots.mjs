import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

/**
 * Screenshot harness — captures the home screen (plus key overlays) at a spread
 * of viewports, from a small phone to a large desktop. Seeds a little progress
 * so the map shows its mango/leaf states instead of a blank slate.
 *
 *   npm run shots            -> shots/<w>x<h>.png + desktop/mobile overlays
 *   BASE=http://localhost:3000 npm run shots
 *
 * Requires a running dev/prod server (default http://localhost:3000).
 */
const OUT = 'shots';
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE || 'http://localhost:3000';

// A handful of valid dish ids (nameEn !== ''), spread across the map.
const SEED = [0, 10, 15, 22, 30, 36, 46, 56, 62];

const VIEWPORTS = [
  [320, 568], [375, 667], [390, 844], [414, 896], [430, 932], // phones
  [768, 1024], [820, 1180],                                     // tablets (breakpoint edge)
  [1024, 768], [1280, 800], [1440, 900], [1920, 1080],          // laptops / desktop
];

const browser = await chromium.launch();

async function newSeededPage(width, height, extra = {}) {
  const page = await browser.newPage({ viewport: { width, height }, ...extra });
  await page.addInitScript((ids) => {
    localStorage.setItem('foodmap:progress:v1', JSON.stringify(ids));
  }, SEED);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  // wait out the staggered map-cell entrance (delays up to ~1.3s + 0.4s)
  await page.waitForTimeout(2600);
  return page;
}

// 1. home screen at every viewport
for (const [w, h] of VIEWPORTS) {
  const mobile = w <= 767;
  const page = await newSeededPage(w, h, mobile ? { hasTouch: true, isMobile: true } : {});
  await page.screenshot({ path: `${OUT}/${w}x${h}.png` });
  console.log(`· ${w}x${h}`);
  await page.close();
}

// 2. overlays on desktop — district popup + swipe-in recipe card
{
  const page = await newSeededPage(1440, 900);
  await page.locator('path.d.has').first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/desktop-district-popup.png` });
  console.log('· desktop-district-popup');
  const row = page.locator('[data-testid="map-dish-popup"] .mp-row').first();
  if (await row.count()) {
    await row.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/desktop-recipe-card.png` });
    console.log('· desktop-recipe-card');
  }
  await page.close();
}

// 3. overlays on mobile — drawer + district popup
{
  const page = await newSeededPage(390, 844, { hasTouch: true, isMobile: true });
  await page.locator('path.d.has').first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/mobile-district-popup.png` });
  console.log('· mobile-district-popup');
  await page.close();
}

await browser.close();
console.log(`done -> ${OUT}/`);
