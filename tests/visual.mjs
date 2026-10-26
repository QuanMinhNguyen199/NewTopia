import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const dir = '.impeccable/refactor';
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
});
for (const width of [1440, 375]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(process.env.CHECK_URL || 'http://127.0.0.1:5173');
  await page.evaluate(() => document.fonts.ready);
  for (const state of ['answer', 'query', 'drawer']) {
    if (state === 'query') await page.getByRole('button', { name: 'Sửa câu hỏi' }).click();
    if (state === 'drawer') {
      await page.getByRole('button', { name: 'Hủy', exact: true }).click();
      if (width < 1100) await page.locator('.evidence-rail').click();
      await page.locator('#tab-sources').click();
    }
    await page.mouse.move(0, 0);
    await page.waitForTimeout(350);
    const shot = await page.screenshot();
    const path = `${dir}/${width}-${state}.png`;
    if (process.argv.includes('--record')) writeFileSync(path, shot);
    else assert.ok(shot.equals(readFileSync(path)), `Visual changed: ${width} ${state}`);
  }
  await page.close();
}
await browser.close();
console.log('PASS visual snapshots (1440/375, answer/query/drawer)');
