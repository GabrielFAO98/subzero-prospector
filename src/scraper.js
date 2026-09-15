const { chromium } = require('playwright');
const db = require('./db');
const { checkWebsiteHealth } = require('./site_checker');
const { huntSocials } = require('./social_hunter');

/**
 * Minera empresas no Google Maps com auditoria profunda de saúde do site e redes sociais
 * NÃO gera protótipos automaticamente - focado em análise e qualificação profissional.
 */
async function searchLeadsGoogleMaps(niche, city = 'Franca SP', maxResults = 15, onProgress = null) {
  if (onProgress) onProgress(`Iniciando busca no Google Maps para "${niche}" em ${city}...`);
  console.log(`\n🗺️ [1/2] Minerando empresas no Google Maps: "${niche}" em ${city}...`);
  
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

    // Scroll suave para carregar estabelecimentos
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

        // Tentar capturar link de website de várias fontes no card
        const websiteEl = card.querySelector('a[data-value="Website"], a[aria-label*="website"], a[aria-label*="site"], a[data-item-id*="authority"]');
        let websiteUrl = websiteEl ? websiteEl.href : null;

        const allText = card.innerText || '';

        // Se o websiteUrl não foi pego pelo elemento clássico, tenta achar URL no texto do card
        if (!websiteUrl) {
          const domainMatch = allText.match(/([a-zA-Z0-9-]+\.com(?:\.br)?)/i);
          if (domainMatch && !domainMatch[1].includes('google')) {
            websiteUrl = 'https://www.' + domainMatch[1];
          }
        }

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
    await browser.close();

    const processedLeads = [];

    // 2. Auditoria Individual Completa de Cada Empresa (Saúde do site + Redes Sociais)
    for (let i = 0; i < Math.min(rawPlaces.length, maxResults); i++) {
      const p = rawPlaces[i];
      console.log(`\n🔍 [${i + 1}/${Math.min(rawPlaces.length, maxResults)}] Auditando: "${p.name}"...`);
      if (onProgress) onProgress(`Auditando [${i + 1}/${Math.min(rawPlaces.length, maxResults)}]: ${p.name}...`);

      // 2.1 Auditoria do Website
      const siteHealth = await checkWebsiteHealth(p.websiteUrl);

      // 2.2 Caça Profunda de Redes Sociais (Instagram, Facebook e Celular WhatsApp)
      const socials = await huntSocials(p.name, city);

      // 2.3 Junção de Telefones encontrados no Maps e na Web
      const mapsPhones = (p.allText.match(/(?:\(?16\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/g) || [])
        .map(x => x.trim());
      const allPhones = [...new Set([...socials.telefones, ...mapsPhones])];

      // Prioriza celular DDD 16 com 9 dígitos para o WhatsApp
      let whatsappPrincipal = null;
      let whatsappFormatado = null;
      const celular = allPhones.find(t => t.replace(/\D/g, '').length >= 10);
      if (celular) {
        let nums = celular.replace(/\D/g, '');
        if (nums.length === 11 && !nums.startsWith('55')) nums = '55' + nums;
        else if (nums.length === 9) nums = '5516' + nums;
        else if (nums.length === 10 && nums.startsWith('16')) nums = '55' + nums;
        whatsappPrincipal = nums;
        whatsappFormatado = formatPhone(nums);
      } else if (allPhones[0]) {
        whatsappFormatado = allPhones[0];
      }

      // 2.4 Análise e Classificação Comercial
      let status = 'oportunidade_quente';
      let motivoDescarte = null;
      let analiseIA = '';

      if (siteHealth.status === 'inacessivel') {
        status = 'oportunidade_quente';
        motivoDescarte = null;
        analiseIA = `🚨 GATILHO DE OURO: Empresa possui site cadastrado (${siteHealth.url}), porém está FORA DO AR / INACESSÍVEL (${siteHealth.reason}). Com ${p.ratingText || 'excelentes avaliações'}, os clientes que clicam no Google encontram erro e vão para o concorrente!`;
      } else if (siteHealth.status === 'online') {
        status = 'descartado';
        motivoDescarte = `Já possui site próprio ativo (${siteHealth.url})`;
        analiseIA = `Descartada para abordagem de criação de site novo pois o domínio oficial está respondendo normalmente.`;
      } else if (siteHealth.status === 'apenas_social') {
        status = 'oportunidade_quente';
        motivoDescarte = null;
        analiseIA = `Utiliza link de rede social/Linktree no perfil do Google. Não possui site institucional de conversão rápida.`;
      } else if (allPhones.length === 0) {
        status = 'descartado';
        motivoDescarte = 'Sem telefone ou WhatsApp público disponível';
        analiseIA = 'Falta canal de contato para prospecção.';
      } else {
        status = 'oportunidade_quente';
        analiseIA = `Excelente oportunidade em Franca: ${p.ratingText || 'Boa reputação'}, sem nenhum site oficial cadastrado.`;
      }

      const slug = p.name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, '-');

      const leadRecord = {
        slug,
        nome: p.name,
        nicho,
        cidade: city,
        siteOriginal: siteHealth.url || p.websiteUrl,
        siteStatus: siteHealth.status,
        siteHealthReason: siteHealth.reason,
        avaliacao: p.ratingText,
        mapsUrl: p.mapsUrl,
        telefones: allPhones,
        emails: socials.emails,
        instagram: socials.instagram,
        facebook: socials.facebook,
        whatsappPrincipal,
        whatsappFormatado,
        status,
        motivoDescarte,
        analiseIA
      };

      // Salva no banco de dados
      const { lead } = db.upsert(leadRecord);
      processedLeads.push(lead);
    }

    return processedLeads;

  } catch (err) {
    console.error('Erro na raspagem do Google Maps:', err.message);
    await browser.close();
    return [];
  }
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
  formatPhone
};
