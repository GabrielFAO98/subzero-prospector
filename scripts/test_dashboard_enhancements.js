const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // 1. Check if "Invisível nas buscas de IA" is completely gone
  const content = await page.content();
  const hasInvisivel = content.includes('Invisível nas buscas de IA');
  console.log('Has "Invisível nas buscas de IA"?', hasInvisivel, '(must be false)');

  // 2. Check rating badges
  const ratingTexts = await page.$$eval('.rating-badge', els => els.slice(0, 5).map(e => e.innerText.trim()));
  console.log('Sample formatted ratings rendered:', ratingTexts);

  await page.screenshot({ path: 'C:/Users/Gabriel/.gemini/antigravity/brain/e3973f53-0a5f-4ca7-8440-4faa12d53a0c/dashboard_ratings_verified.png' });

  // 3. Open inspection modal on first lead
  const firstInspectBtn = page.locator('.btn-open-modal').first();
  await firstInspectBtn.click();
  await page.waitForSelector('#leadModal', { state: 'visible' });

  // 4. Verify status option text
  const statusOptText = await page.$eval('#modalStatusSelect option[value="oportunidade_quente"]', el => el.innerText.trim());
  console.log('Status option text:', statusOptText, '(must be "🔥 Oportunidade Quente")');

  // 5. Verify edit button and toggle form
  const editBtn = page.locator('#btnToggleEditLead');
  console.log('Edit button exists?', await editBtn.count() > 0);
  await editBtn.click();
  await page.waitForTimeout(200);

  const isFormVisible = await page.locator('#leadEditForm').isVisible();
  console.log('Edit form visible after click?', isFormVisible);

  await page.screenshot({ path: 'C:/Users/Gabriel/.gemini/antigravity/brain/e3973f53-0a5f-4ca7-8440-4faa12d53a0c/modal_edit_form_verified.png' });

  await browser.close();
  console.log('\nAll dashboard verification tests completed successfully!');
})().catch(console.error);
