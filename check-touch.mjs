import { chromium, webkit, devices, expect } from '@playwright/test';
for (const [name, type, device, options] of [
  ['iOS WebKit', webkit, 'iPhone 13', {}],
  [
    'Android Chromium',
    chromium,
    'Pixel 7',
    { executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' },
  ],
]) {
  const browser = await type.launch(options);
  const page = await browser.newPage({ ...devices[device], viewport: { width: 375, height: 812 } });
  await page.goto(process.env.CHECK_URL || 'http://127.0.0.1:5173');
  await page.evaluate(() => document.fonts.ready);
  const tap = async locator => {
    const r = await locator.boundingBox();
    if (!r) throw Error('Missing touch target');
    await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
  };
  const panel = page.locator('#evidence'),
    rail = page.locator('.evidence-rail');
  for (let i = 0; i < 5; i++) {
    await tap(rail);
    await expect(panel).toHaveClass(/is-open/);
    await tap(page.locator('#tab-sources'));
    await expect(page.locator('#tab-sources')).toHaveAttribute('aria-selected', 'true');
    await tap(page.locator('#tab-docs'));
    await expect(page.locator('#tab-docs')).toHaveAttribute('aria-selected', 'true');
    await tap(panel.getByRole('button', { name: 'Đóng', exact: true }));
    await expect(panel).not.toHaveClass(/is-open/);
    if ((await panel.evaluate(e => getComputedStyle(e).pointerEvents)) !== 'none')
      throw Error('Closed panel intercepts touches');
  }
  await tap(rail);
  await page.touchscreen.tap(12, 400);
  await expect(panel).not.toHaveClass(/is-open/);
  await page.getByRole('button', { name: 'Sửa câu hỏi' }).tap();
  await tap(rail);
  await expect(page.locator('.query')).toHaveAttribute('inert', '');
  await tap(panel.getByRole('button', { name: 'Đóng', exact: true }));
  await expect(page.locator('.query-bar')).not.toHaveAttribute('inert', '');
  await page.evaluate(() => scrollTo(0, 500));
  const before = await page.evaluate(() => scrollY);
  await tap(rail);
  await tap(panel.getByRole('button', { name: 'Đóng', exact: true }));
  if (Math.abs((await page.evaluate(() => scrollY)) - before) > 2)
    throw Error('Closing drawer changed reading position');
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw Error('Horizontal overflow');
  await page.screenshot({ path: `.impeccable/review/touch-${device.replaceAll(' ', '-')}.png` });
  console.log(
    `PASS ${name}: repeated raw taps, drawer tabs, close/reopen, scrim, edit form inert, 375px`,
  );
  await browser.close();
}
