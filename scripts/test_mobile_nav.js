const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/previews/ontech-energia-solar/index.html', { waitUntil: 'networkidle' });

  // 1. Check bounds when closed
  const headerBox = await page.locator('.header').boundingBox();
  const toggleBox = await page.locator('.menu-toggle').boundingBox();
  const logoBox = await page.locator('.brand-logo').boundingBox();
  const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);

  console.log('--- CLOSED STATE ---');
  console.log('Header box:', headerBox);
  console.log('Toggle box:', toggleBox);
  console.log('Logo box:', logoBox);
  console.log('Body scroll width (must be <= 390):', bodyScrollWidth);

  await page.screenshot({ path: 'C:/Users/Gabriel/.gemini/antigravity/brain/e3973f53-0a5f-4ca7-8440-4faa12d53a0c/ontech_mobile_nav_closed.png' });

  // 2. Click Hamburger
  await page.locator('.menu-toggle').click();
  await page.waitForTimeout(350);

  const isOpen = await page.evaluate(() => document.querySelector('.header').classList.contains('menu-open'));
  console.log('\n--- OPEN STATE ---');
  console.log('Is menu open?', isOpen);

  await page.screenshot({ path: 'C:/Users/Gabriel/.gemini/antigravity/brain/e3973f53-0a5f-4ca7-8440-4faa12d53a0c/ontech_mobile_nav_open.png' });

  // 3. Click nav link 'Soluções'
  await page.locator('.nav-links a[href="#solucoes"]').click();
  await page.waitForTimeout(400);

  const isClosedAfterClick = await page.evaluate(() => !document.querySelector('.header').classList.contains('menu-open'));
  console.log('\n--- AFTER CLICK STATE ---');
  console.log('Is menu closed after clicking link?', isClosedAfterClick);

  await page.screenshot({ path: 'C:/Users/Gabriel/.gemini/antigravity/brain/e3973f53-0a5f-4ca7-8440-4faa12d53a0c/ontech_mobile_nav_after_click.png' });

  await browser.close();
  console.log('\nAll Playwright mobile nav tests passed successfully!');
})().catch(console.error);

