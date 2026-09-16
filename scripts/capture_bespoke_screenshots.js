const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const artifactDir = 'C:\\Users\\Gabriel\\.gemini\\antigravity\\brain\\e3973f53-0a5f-4ca7-8440-4faa12d53a0c';
  const browser = await chromium.launch();

  // 1. Blitz Desktop
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:3000/previews/blitz-seguranca-eletronica/index.html', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_blitz_bespoke_desktop.png'), fullPage: false });
    // Scroll down to obras
    const obrasSection = await page.$('#obras');
    if (obrasSection) {
      await obrasSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(artifactDir, 'screenshot_blitz_bespoke_obras.png') });
    }
    // Scroll down to contact
    const contactSection = await page.$('#contato');
    if (contactSection) {
      await contactSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(artifactDir, 'screenshot_blitz_bespoke_contato.png') });
    }
    await page.close();
  }

  // 2. Blitz Mobile (iPhone 13 viewport 390x844)
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await page.goto('http://localhost:3000/previews/blitz-seguranca-eletronica/index.html', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_blitz_bespoke_mobile.png'), fullPage: false });
    await page.close();
  }

  // 3. Kell Desktop
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:3000/previews/kell-distribuidora/index.html', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(artifactDir, 'screenshot_kell_bespoke_desktop.png'), fullPage: false });
    await page.close();
  }

  await browser.close();
  console.log('Screenshots captured successfully!');
}

main().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
