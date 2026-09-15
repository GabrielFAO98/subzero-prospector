const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { findSocialAndEmailPlaywright } = require('./social_enricher');

const LEADS_FILE = path.join(__dirname, '..', 'leads.json');

/**
 * Minera empresas no Google Maps usando Playwright com filtros de oportunidade
 */
async function searchLeadsGoogleMaps(niche, city = 'Franca SP', maxResults = 10) {
  console.log(`\n🗺️ [1/3] Minerando empresas no Google Maps: "${niche}" em ${city}...`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'pt-BR',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(niche + ' ' + city)}`;

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Fechar consentimento Google se aparecer
    try {
      const consentBtn = page.locator('button:has-text("Aceitar tudo"), button:has-text("Concordo"), form[action*="consent"] button');
      if (await consentBtn.count() > 0) {
        await consentBtn.first().click();
        await page.waitForTimeout(1500);
      }
    } catch (_) {}

    await page.waitForSelector('div[role="feed"]', { timeout: 15000 }).catch(() => null);

    // Scroll para carregar mais resultados
    const feed = page.locator('div[role="feed"]');
    if (await feed.count() > 0) {
      for (let i = 0; i < 3; i++) {
        await page.mouse.wheel(0, 1500);
        await page.waitForTimeout(1000);
      }
    }

    const rawPlaces = await page.evaluate(() => {
      const results = [];
      const feedEl = document.querySelector('div[role="feed"]');
      if (!feedEl) return results;

      const cards = feedEl.querySelectorAll('div > div[jsaction*="mouseover"]');
      cards.forEach(card => {
        const titleEl = card.querySelector('div.fontHeadlineSmall, .qBF1Pd');
        if (!titleEl) return;
        const name = titleEl.textContent.trim();
        if (!name) return;

        const ratingEl = card.querySelector('span[role="img"]');
        const ratingText = ratingEl ? ratingEl.getAttribute('aria-label') : '';

        const websiteEl = card.querySelector('a[data-value="Website"], a[aria-label*="website"], a[aria-label*="site"]');
        const websiteUrl = websiteEl ? websiteEl.href : null;

        const allText = card.innerText || '';

        results.push({
          name,
          ratingText,
          websiteUrl,
          allText
        });
      });

      return results;
    });

    console.log(`✅ ${rawPlaces.length} estabelecimentos encontrados no Google Maps.`);

    const leads = [];

    for (const p of rawPlaces) {
      // Verifica se o site é inexistente ou linktree/rede social
      const hasRealWebsite = p.websiteUrl && 
        !p.websiteUrl.includes('instagram.com') && 
        !p.websiteUrl.includes('facebook.com') && 
        !p.websiteUrl.includes('linktr.ee');

      // Extrai fones do texto
      const phones = (p.allText.match(/(?:\(?16\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/g) || [])
        .map(x => x.trim());

      // Gera slug único
      const slug = p.name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, '-');

      leads.push({
        slug,
        nome: p.name,
        nicho: niche,
        cidade: city,
        temSiteProprio: hasRealWebsite,
        siteOriginal: p.websiteUrl,
        avaliacao: p.ratingText,
        telefones: [...new Set(phones)],
        emails: [],
        instagram: p.websiteUrl && p.websiteUrl.includes('instagram.com') ? p.websiteUrl : null,
        facebook: p.websiteUrl && p.websiteUrl.includes('facebook.com') ? p.websiteUrl : null,
        status: hasRealWebsite ? 'tem_site' : 'sem_site_qualificado'
      });
    }

    await browser.close();
    return leads.slice(0, maxResults);

  } catch (err) {
    console.error('Erro na raspagem do Google Maps:', err.message);
    await browser.close();
    return [];
  }
}

/**
 * Enriquecimento profundo do lead (Instagram, Facebook e E-mail)
 */
async function enrichLead(lead) {
  console.log(`\n🕵️ [2/3] Enriquecendo redes sociais e contatos para: "${lead.nome}"...`);

  // Se ainda não tem redes ou emails, busca via Playwright
  if (!lead.instagram || !lead.facebook || lead.emails.length === 0) {
    const socialData = await findSocialAndEmailPlaywright(lead.nome, lead.cidade);
    
    if (!lead.instagram && socialData.instagram) {
      lead.instagram = socialData.instagram;
      console.log(`   + Instagram: ${lead.instagram}`);
    }
    if (!lead.facebook && socialData.facebook) {
      lead.facebook = socialData.facebook;
      console.log(`   + Facebook: ${lead.facebook}`);
    }
    socialData.emails.forEach(e => {
      if (!lead.emails.includes(e)) lead.emails.push(e);
    });
    if (lead.emails.length > 0) {
      console.log(`   + E-mails: ${lead.emails.join(', ')}`);
    }
    socialData.telefones.forEach(p => {
      if (!lead.telefones.includes(p)) lead.telefones.push(p);
    });
  }

  // Formatar WhatsApp principal
  const celular = lead.telefones.find(t => t.replace(/\D/g, '').length >= 10);
  if (celular) {
    let nums = celular.replace(/\D/g, '');
    if (nums.length === 11 && !nums.startsWith('55')) nums = '55' + nums;
    else if (nums.length === 9) nums = '5516' + nums;
    else if (nums.length === 10 && nums.startsWith('16')) nums = '55' + nums;
    lead.whatsappPrincipal = nums;
    lead.whatsappFormatado = formatPhone(nums);
  } else {
    lead.whatsappFormatado = '(16) 99200-0000';
    lead.whatsappPrincipal = '5516992000000';
  }

  lead.status = 'enriquecido';
  return lead;
}

function formatPhone(numStr) {
  const digits = numStr.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('55')) {
    return `(${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return numStr;
}

function saveLeadsToFile(leads) {
  let existing = [];
  if (fs.existsSync(LEADS_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    } catch (_) { existing = []; }
  }

  const map = new Map();
  existing.forEach(l => map.set(l.slug, l));
  leads.forEach(l => map.set(l.slug, l));

  fs.writeFileSync(LEADS_FILE, JSON.stringify(Array.from(map.values()), null, 2), 'utf-8');
  console.log(`💾 Base de leads atualizada com sucesso em: ${LEADS_FILE}`);
}

function loadLeadsFromFile() {
  if (!fs.existsSync(LEADS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch (_) {
    return [];
  }
}

module.exports = {
  searchLeadsGoogleMaps,
  enrichLead,
  saveLeadsToFile,
  loadLeadsFromFile,
  formatPhone
};
