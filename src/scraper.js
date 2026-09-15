const { chromium } = require('playwright');
const db = require('./db');
const { findSocialAndEmailPlaywright } = require('./social_enricher');

/**
 * Minera empresas no Google Maps usando Playwright com critérios explícitos de seleção e descarte
 */
async function searchLeadsGoogleMaps(niche, city = 'Franca SP', maxResults = 15, onProgress = null) {
  if (onProgress) onProgress(`Iniciando busca no Google Maps para "${niche}" em ${city}...`);
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

        const linkEl = card.querySelector('a[href*="/maps/place/"]');
        const mapsUrl = linkEl ? linkEl.href : '';

        const websiteEl = card.querySelector('a[data-value="Website"], a[aria-label*="website"], a[aria-label*="site"]');
        const websiteUrl = websiteEl ? websiteEl.href : null;

        const allText = card.innerText || '';

        results.push({
          name,
          ratingText,
          mapsUrl,
          websiteUrl,
          allText
        });
      });

      return results;
    });

    console.log(`✅ ${rawPlaces.length} estabelecimentos encontrados no Google Maps.`);
    if (onProgress) onProgress(`Analisando ${rawPlaces.length} empresas encontradas...`);

    const processedLeads = [];

    for (const p of rawPlaces) {
      // 1. Análise do Site Original
      const isSocialOrLinktree = p.websiteUrl && (
        p.websiteUrl.includes('instagram.com') || 
        p.websiteUrl.includes('facebook.com') || 
        p.websiteUrl.includes('linktr.ee')
      );
      const hasRealWebsite = p.websiteUrl && !isSocialOrLinktree;

      // 2. Extração de Telefones
      const phones = (p.allText.match(/(?:\(?16\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/g) || [])
        .map(x => x.trim());
      const uniquePhones = [...new Set(phones)];

      // 3. Critério de Seleção vs Descarte
      let status = 'oportunidade_quente';
      let motivoDescarte = null;
      let analiseIA = '';

      if (hasRealWebsite) {
        status = 'descartado';
        motivoDescarte = `Já possui site próprio ativo (${p.websiteUrl})`;
        analiseIA = `Descartada para abordagem fria de criação de site pois já tem domínio próprio no ar.`;
      } else if (uniquePhones.length === 0) {
        status = 'descartado';
        motivoDescarte = 'Sem número de telefone/WhatsApp visível para contato';
        analiseIA = 'Falta canal direto de WhatsApp na ficha do Google Maps.';
      } else {
        status = 'oportunidade_quente';
        analiseIA = `Excelente oportunidade em Franca: ${p.ratingText || 'Boa reputação'}, sem site oficial cadastrado ${isSocialOrLinktree ? '(apenas ' + p.websiteUrl + ')' : ''}. Pronta para receber protótipo Subzero!`;
      }

      // Slug
      const slug = p.name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, '-');

      // WhatsApp formatado
      let whatsappPrincipal = null;
      let whatsappFormatado = null;
      const celular = uniquePhones.find(t => t.replace(/\D/g, '').length >= 10);
      if (celular) {
        let nums = celular.replace(/\D/g, '');
        if (nums.length === 11 && !nums.startsWith('55')) nums = '55' + nums;
        else if (nums.length === 9) nums = '5516' + nums;
        else if (nums.length === 10 && nums.startsWith('16')) nums = '55' + nums;
        whatsappPrincipal = nums;
        whatsappFormatado = formatPhone(nums);
      } else if (uniquePhones[0]) {
        whatsappFormatado = uniquePhones[0];
      }

      const leadRecord = {
        slug,
        nome: p.name,
        nicho,
        cidade: city,
        temSiteProprio: hasRealWebsite,
        siteOriginal: p.websiteUrl,
        avaliacao: p.ratingText,
        mapsUrl: p.mapsUrl,
        telefones: uniquePhones,
        emails: [],
        instagram: p.websiteUrl && p.websiteUrl.includes('instagram.com') ? p.websiteUrl : null,
        facebook: p.websiteUrl && p.websiteUrl.includes('facebook.com') ? p.websiteUrl : null,
        whatsappPrincipal,
        whatsappFormatado,
        status,
        motivoDescarte,
        analiseIA
      };

      // Salva ou atualiza no banco com preservação de histórico
      const { lead } = db.upsert(leadRecord);
      processedLeads.push(lead);
    }

    await browser.close();
    return processedLeads.slice(0, maxResults);

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

  // Atualiza no banco
  db.update(lead.id || lead.slug, {
    instagram: lead.instagram,
    facebook: lead.facebook,
    emails: lead.emails,
    telefones: lead.telefones,
    whatsappPrincipal: lead.whatsappPrincipal,
    whatsappFormatado: lead.whatsappFormatado
  });

  return lead;
}

function formatPhone(numStr) {
  if (!numStr) return '';
  const digits = numStr.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('55')) {
    return `(${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return numStr;
}

module.exports = {
  searchLeadsGoogleMaps,
  enrichLead,
  formatPhone
};
