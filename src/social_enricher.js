const { chromium } = require('playwright');

/**
 * Busca autônoma de Instagram, Facebook e E-mail da empresa via Playwright
 */
async function findSocialAndEmailPlaywright(companyName, city = 'Franca SP', existingPage = null) {
  let browser = null;
  let page = existingPage;

  if (!page) {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale: 'pt-BR'
    });
  }

  let instagram = null;
  let facebook = null;
  let emails = new Set();
  let phones = new Set();

  try {
    // 1. Pesquisa no Google pelas redes sociais da empresa
    const query = `${companyName} ${city} instagram facebook`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    // Fechar modais de consentimento se aparecerem
    try {
      const consentBtn = page.locator('button:has-text("Aceitar tudo"), button:has-text("Concordo"), form[action*="consent"] button');
      if (await consentBtn.count() > 0) await consentBtn.first().click();
    } catch (_) {}

    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors.map(a => a.href);
    });

    for (const link of links) {
      if (!instagram && link.includes('instagram.com/')) {
        const match = link.match(/https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/);
        if (match && !['p', 'reel', 'explore', 'stories', 'tags'].includes(match[1])) {
          instagram = match[0].split('?')[0];
        }
      }
      if (!facebook && link.includes('facebook.com/')) {
        if (!link.includes('/sharer') && !link.includes('/policies')) {
          facebook = link.split('?')[0];
        }
      }
    }

    // Minerar emails do texto da busca
    const pageText = await page.evaluate(() => document.body.innerText || '');
    const foundEmails = pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    foundEmails.forEach(e => {
      const lower = e.toLowerCase();
      if (!lower.includes('google') && !lower.includes('w3.org') && !lower.includes('schema.org')) {
        emails.add(lower);
      }
    });

    const foundPhones = pageText.match(/(?:\(?16\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/g) || [];
    foundPhones.forEach(p => phones.add(p.trim()));

  } catch (err) {
    console.error(`Erro ao enriquecer ${companyName}:`, err.message);
  } finally {
    if (browser) await browser.close();
  }

  return {
    instagram,
    facebook,
    emails: Array.from(emails),
    telefones: Array.from(phones)
  };
}

module.exports = {
  findSocialAndEmailPlaywright
};
