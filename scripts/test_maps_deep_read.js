const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'pt-BR',
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  // Busca energia solar Franca SP
  await page.goto('https://www.google.com/maps/search/' + encodeURIComponent('energia solar Franca SP'), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3500);

  // Fecha consentimento
  try {
    const btn = page.locator('button:has-text("Aceitar"), form[action*="consent"] button');
    if (await btn.count() > 0) await btn.first().click();
  } catch (_) {}

  const cards = page.locator('div.Nv2PK');
  const count = await cards.count();
  console.log('Cards encontrados no feed:', count);

  for (let i = 0; i < Math.min(count, 3); i++) {
    console.log(`\n========================================`);
    console.log(`--- [Card ${i+1}] Clicando para abrir Ficha Detalhada ---`);
    await cards.nth(i).click();
    await page.waitForTimeout(3000);

    const placeDetails = await page.evaluate(() => {
      // O painel detalhado do Google Maps fica em div[role="main"] quando um lugar está aberto
      const main = document.querySelector('div[role="main"]');
      if (!main) return null;

      const title = main.querySelector('h1')?.innerText || '';

      // Links gerais (websites, redes sociais, sublinks)
      const rawLinks = Array.from(main.querySelectorAll('a[href]')).map(a => ({
        href: a.href,
        aria: a.getAttribute('aria-label') || '',
        text: a.innerText.trim()
      }));

      // Filtra links relevantes (redes sociais, websites)
      const socialOrWebLinks = rawLinks.filter(l => 
        !l.href.includes('google.com/maps') &&
        !l.href.includes('support.google.com') &&
        !l.href.includes('accounts.google.com') &&
        !l.href.startsWith('https://www.google.com/')
      );

      // Botões com dados de contato (telefone, endereço, etc.)
      const buttons = Array.from(main.querySelectorAll('button[data-item-id], button[aria-label]')).map(b => ({
        itemId: b.getAttribute('data-item-id') || '',
        aria: b.getAttribute('aria-label') || '',
        text: b.innerText.trim()
      }));

      const contactButtons = buttons.filter(b => 
        b.aria.toLowerCase().includes('telefone') ||
        b.aria.toLowerCase().includes('endereço') ||
        b.aria.toLowerCase().includes('website') ||
        b.aria.toLowerCase().includes('copiar') ||
        b.itemId.includes('phone') ||
        b.itemId.includes('address')
      );

      // Busca por seções de Perfis Sociais / Redes Sociais no DOM
      const socialProfileSection = Array.from(main.querySelectorAll('div[data-item-id*="social"], div[aria-label*="perfil" i], div[aria-label*="social" i], a[href*="instagram.com"], a[href*="facebook.com"], a[href*="linkedin.com"], a[href*="wa.me"]')).map(el => ({
        tag: el.tagName,
        href: el.getAttribute('href'),
        text: el.innerText.trim(),
        aria: el.getAttribute('aria-label')
      }));

      return {
        title,
        socialOrWebLinks,
        contactButtons,
        socialProfileSection
      };
    });

    console.log(JSON.stringify(placeDetails, null, 2));
  }

  await browser.close();
})();

