const { chromium } = require('playwright');
const db = require('./db');
const { checkWebsiteHealth } = require('./site_checker');
const { huntSocials } = require('./social_hunter');
const { huntInstagramBio } = require('./instagram_bio_hunter');

/**
 * Minera empresas no Google Maps com auditoria profunda de saúde do site e redes sociais
 * NÃO gera protótipos automaticamente - focado em análise e qualificação profissional.
 */
async function searchLeadsGoogleMaps(niche, city = 'Franca SP', maxResults = 15, onProgress = null) {
  if (onProgress) onProgress(`Iniciando busca no Google Maps para "${niche}" em ${city}...`);
  console.log(`\n🗺️ [1/2] Minerando empresas no Google Maps: "${niche}" em ${city}...`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'pt-BR',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(niche + ' ' + city)}`;

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3500);

    // Fechar consentimento Google se aparecer
    try {
      const consentBtn = page.locator('button:has-text("Aceitar tudo"), button:has-text("Concordo"), form[action*="consent"] button');
      if (await consentBtn.count() > 0) {
        await consentBtn.first().click();
        await page.waitForTimeout(1500);
      }
    } catch (_) {}

    // Verifica se caiu direto na página de um único estabelecimento
    const isSinglePlace = await page.evaluate(() => {
      const titleEl = document.querySelector('h1.DUwDvf');
      const feedEl = document.querySelector('div[role="feed"]');
      return !!titleEl && !feedEl;
    });

    let rawPlaces = [];

    if (isSinglePlace) {
      const single = await page.evaluate(() => {
        const name = document.querySelector('h1.DUwDvf')?.innerText?.trim() || '';
        const ratingText = document.querySelector('div.F7nice')?.innerText?.replace(/\n/g, ' ').trim() || '';
        const websiteEl = document.querySelector('a[data-item-id="authority"]');
        let websiteUrl = websiteEl ? websiteEl.href : null;
        if (websiteUrl) {
          try {
            if (websiteUrl.includes('google.com/aclk') || websiteUrl.includes('google.com/url')) {
              const u = new URL(websiteUrl);
              const target = u.searchParams.get('adurl') || u.searchParams.get('q') || u.searchParams.get('url');
              websiteUrl = (target && !target.includes('google.com')) ? target : null;
            } else if (websiteUrl.includes('google.com') || websiteUrl.includes('goo.gl')) {
              websiteUrl = null;
            }
          } catch (_) { websiteUrl = null; }
        }
        const allText = document.body.innerText || '';
        const mapsUrl = window.location.href;
        return [{ name, ratingText, mapsUrl, websiteUrl, allText }];
      });
      rawPlaces = single.filter(s => s.name);
    } else {
      // Aguarda feed de resultados múltiplos
      await page.waitForSelector('div[role="feed"], .m6QErb[aria-label], div.Nv2PK', { timeout: 15000 }).catch(() => null);

      // Scroll inteligente no feed para carregar a quantidade solicitada
      const feed = page.locator('div[role="feed"], .m6QErb[aria-label]').first();
      if (await feed.count() > 0) {
        for (let scrollStep = 0; scrollStep < 5; scrollStep++) {
          await feed.evaluate(el => el.scrollBy(0, 3000));
          await page.waitForTimeout(1000);
          const currentCount = await page.locator('div.Nv2PK, div[role="article"]').count();
          if (currentCount >= maxResults * 1.3) break;
        }
      }

      rawPlaces = await page.evaluate(() => {
        const results = [];
        const seenNames = new Set();

        // 1. Tentar os cards modernos primários (div.Nv2PK ou div[role="article"])
        let cards = Array.from(document.querySelectorAll('div.Nv2PK, div[role="article"]'));
        
        // 2. Fallback para itens com mouseover dentro do feed
        if (cards.length === 0) {
          const feedEl = document.querySelector('div[role="feed"]');
          if (feedEl) {
            cards = Array.from(feedEl.querySelectorAll('div > div[jsaction*="mouseover"]'));
          }
        }

        cards.forEach(card => {
          const titleEl = card.querySelector('.qBF1Pd, div.fontHeadlineSmall, h3');
          if (!titleEl) return;
          const name = titleEl.innerText ? titleEl.innerText.trim() : titleEl.textContent.trim();
          if (!name || seenNames.has(name.toLowerCase())) return;
          seenNames.add(name.toLowerCase());

          // Avaliação e estrelas
          const ratingEl = card.querySelector('span.MW4etd, span[role="img"]');
          const ratingText = ratingEl ? (ratingEl.getAttribute('aria-label') || ratingEl.innerText || '').trim() : '';

          const allText = card.innerText || '';

          // Extração do endereço físico no card (Rua, Número, Bairro)
          let address = '';
          const addressMatch = allText.match(/(?:R\.|Rua|Av\.|Avenida|Praça|Alameda|Travessa)[^·\n]+,\s*\d+[^\n·]*/i);
          if (addressMatch) {
            address = addressMatch[0].trim();
          }

          // Link do Maps com parâmetros oficiais de busca exata (evita cair no meio da rua)
          const linkEl = card.querySelector('a.hfpxzc, a[href*="/maps/place/"]');
          let mapsUrl = linkEl ? linkEl.href : '';
          if (!mapsUrl || !mapsUrl.includes('/maps/place/')) {
            mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (address || city))}`;
          }

          // Site oficial ou sublink
          const websiteEl = card.querySelector('a[data-value="Website"], a[aria-label*="website" i], a[aria-label*="site" i], a[data-item-id*="authority"]');
          let websiteUrl = websiteEl ? websiteEl.href : null;

          // Sanitização de anúncios patrocinados do Google (/aclk, /url)
          if (websiteUrl) {
            try {
              if (websiteUrl.includes('google.com/aclk') || websiteUrl.includes('google.com/url')) {
                const u = new URL(websiteUrl);
                const target = u.searchParams.get('adurl') || u.searchParams.get('q') || u.searchParams.get('url');
                if (target && !target.includes('google.com')) {
                  websiteUrl = target;
                } else {
                  websiteUrl = null; // Anúncio interno do Google sem site próprio cadastrado
                }
              } else if (websiteUrl.includes('google.com') || websiteUrl.includes('goo.gl')) {
                websiteUrl = null;
              }
            } catch (_) {
              websiteUrl = null;
            }
          }

          // Extração heurística de domínio caso não haja botão de website explícito
          if (!websiteUrl) {
            const domainMatch = allText.match(/([a-zA-Z0-9-]+\.com(?:\.br)?)/i);
            if (domainMatch && !domainMatch[1].includes('google')) {
              websiteUrl = 'https://www.' + domainMatch[1];
            }
          }

          results.push({
            name,
            address,
            ratingText,
            mapsUrl,
            websiteUrl,
            allText
          });
        });

        return results;
      });
    }

    console.log(`✅ ${rawPlaces.length} estabelecimentos encontrados no Google Maps.`);
    await browser.close();

    if (onProgress) onProgress(`${rawPlaces.length} estabelecimentos encontrados. Iniciando auditoria comercial...`);

    const targets = rawPlaces.slice(0, maxResults);
    const processedLeads = [];

    // 2. Auditoria concorrente em lotes de 3 para alta velocidade
    const batchSize = 3;
    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (p, idx) => {
        const itemIndex = i + idx + 1;
        console.log(`🔍 [${itemIndex}/${targets.length}] Auditando: "${p.name}"...`);
        if (onProgress) onProgress(`Auditando [${itemIndex}/${targets.length}]: ${p.name}...`);

        // 2.1 Auditoria do Website e extração profunda de contatos
        const siteHealth = await checkWebsiteHealth(p.websiteUrl);

        // 2.2 Caça de Redes Sociais
        const socials = await huntSocials(p.name, city);

        // 2.3 Caça Profunda de Instagram com leitura da Bio e do Link de WhatsApp
        let igData = { instagram: null, handle: null, bioText: '', linkInBio: null, whatsappFromBio: null };
        try {
          igData = await huntInstagramBio(p.name, city, socials.instagram || p.instagram);
        } catch (_) {}

        // 2.4 Telefones do Maps, do Site, da Web e da Bio
        const mapsPhones = (p.allText.match(/(?:\(?([1-9]{2})\)?\s?)?(?:(9\d{4})[-\s]?(\d{4})|(\d{4})[-\s]?(\d{4}))/g) || [])
          .map(x => x.trim());

        const rawAllPhones = [
          ...(igData.whatsappFromBio ? [igData.whatsappFromBio] : []),
          ...(siteHealth.extractedPhones || []),
          ...(socials.telefones || []),
          ...mapsPhones
        ];

        // Normalização e desduplicação de telefones
        const allPhones = [];
        const seenDigits = new Set();
        rawAllPhones.forEach(ph => {
          const d = ph.replace(/\D/g, '');
          if (d.length >= 8 && !seenDigits.has(d)) {
            seenDigits.add(d);
            allPhones.push(formatPhone(ph));
          }
        });

        // 2.5 Seleção precisa de WhatsApp (Prioridade: Bio do Instagram > Botão do Site > Celular 9 dígitos)
        let whatsappPrincipal = null;
        let whatsappFormatado = null;

        if (igData.whatsappFromBio) {
          whatsappPrincipal = igData.whatsappFromBio;
          whatsappFormatado = formatPhone(igData.whatsappFromBio);
        } else if (siteHealth.extractedWhatsApp) {
          const wDigits = siteHealth.extractedWhatsApp.replace(/\D/g, '');
          if (wDigits.length === 11) whatsappPrincipal = '55' + wDigits;
          else if (wDigits.length === 13 && wDigits.startsWith('55')) whatsappPrincipal = wDigits;
          else if (wDigits.length === 9) whatsappPrincipal = '5516' + wDigits;
          else whatsappPrincipal = wDigits;
          whatsappFormatado = formatPhone(whatsappPrincipal);
        }

        if (!whatsappPrincipal) {
          // Busca por celular genuíno (DDD + 9xxxx-xxxx)
          const celular = allPhones.find(t => {
            const digits = t.replace(/\D/g, '');
            if (digits.length === 11 && digits[2] === '9') return true;
            if (digits.length === 9 && digits[0] === '9') return true;
            if (digits.length === 13 && digits.startsWith('55') && digits[4] === '9') return true;
            return false;
          });

          if (celular) {
            let nums = celular.replace(/\D/g, '');
            if (nums.length === 11 && !nums.startsWith('55')) nums = '55' + nums;
            else if (nums.length === 9) nums = '5516' + nums;
            whatsappPrincipal = nums;
            whatsappFormatado = formatPhone(nums);
          } else if (allPhones[0]) {
            let nums = allPhones[0].replace(/\D/g, '');
            if (nums.length === 10 && !nums.startsWith('55')) nums = '55' + nums;
            whatsappPrincipal = nums;
            whatsappFormatado = formatPhone(nums);
          }
        }

        const finalInstagram = siteHealth.extractedInstagram || igData.instagram || socials.instagram || null;
        const finalFacebook = siteHealth.extractedFacebook || socials.facebook || null;
        const allEmails = [...new Set([...(siteHealth.extractedEmails || []), ...(socials.emails || [])])];

        // 2.5 Análise e Classificação Comercial
        let status = 'oportunidade_quente';
        let motivoDescarte = null;
        let analiseIA = '';

        if (siteHealth.status === 'inacessivel') {
          status = 'oportunidade_quente';
          motivoDescarte = null;
          analiseIA = `🚨 GATILHO DE OURO: Empresa possui site cadastrado (${siteHealth.url}), porém está FORA DO AR / INACESSÍVEL (${siteHealth.reason}). Com ${p.ratingText || 'boa reputação'}, clientes perdem o contato e vão para a concorrência!`;
        } else if (siteHealth.status === 'online') {
          // Conforme diretriz, se tem site, extrai dados para superar com protótipo de alta performance
          status = 'oportunidade_quente';
          motivoDescarte = null;
          const sslText = (siteHealth.url && siteHealth.url.startsWith('http://'))
            ? '🚨 Site sem SSL (inseguro HTTP).'
            : 'Site ativo com dados mapeados.';
          analiseIA = `💡 Oportunidade de Redesign Subzero: ${sslText} Conteúdo, serviços e contatos extraídos diretamente do site atual (${siteHealth.url}) para alimentar o protótipo mobile-first de alta conversão.`;
        } else if (siteHealth.status === 'apenas_social') {
          status = 'oportunidade_quente';
          motivoDescarte = null;
          analiseIA = `Utiliza apenas link de rede social ou Linktree no Google. Não possui página de conversão rápida própria.`;
        } else if (allPhones.length === 0) {
          status = 'descartado';
          motivoDescarte = 'Sem telefone ou WhatsApp público disponível';
          analiseIA = 'Falta canal de contato direto para prospecção.';
        } else {
          status = 'oportunidade_quente';
          analiseIA = `Excelente oportunidade em ${city}: ${p.ratingText || 'Boa reputação'}, sem nenhum site oficial próprio cadastrado.`;
        }

        const slug = p.name.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, '-');

        const leadRecord = {
          slug,
          nome: p.name,
          nicho: niche,
          cidade: city,
          siteOriginal: siteHealth.url || p.websiteUrl,
          siteStatus: siteHealth.status,
          siteHealthReason: siteHealth.reason,
          avaliacao: p.ratingText,
          endereco: p.address || null,
          mapsUrl: p.mapsUrl,
          telefones: allPhones,
          emails: allEmails,
          instagram: finalInstagram,
          facebook: finalFacebook,
          whatsappPrincipal,
          whatsappFormatado,
          status,
          motivoDescarte,
          analiseIA,
          siteData: {
            title: siteHealth.pageTitle || null,
            metaDescription: siteHealth.metaDescription || null,
            headings: siteHealth.headings || [],
            servicosExtraidos: siteHealth.extractedServices || [],
            diferenciaisExtraidos: siteHealth.extractedDifferentials || []
          },
          dadosEnriquecidos: {
            instagram: finalInstagram,
            facebook: finalFacebook,
            whatsappPrincipal,
            whatsappFormatado,
            website: siteHealth.url || p.websiteUrl || null,
            bioInstagram: igData.bioText || null,
            linkNaBio: igData.linkInBio || null,
            servicosDetectados: siteHealth.extractedServices || [],
            diferenciais: siteHealth.extractedDifferentials || []
          }
        };

        const { lead } = db.upsert(leadRecord);
        return lead;
      });

      const batchResults = await Promise.all(batchPromises);
      processedLeads.push(...batchResults);
    }

    return processedLeads;

  } catch (err) {
    console.error('Erro na raspagem do Google Maps:', err.message);
    try { await browser.close(); } catch (_) {}
    return [];
  }
}

function formatPhone(numStr) {
  if (!numStr) return '';
  const digits = numStr.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('55')) {
    return `(${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 12 && digits.startsWith('55')) {
    return `(${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return numStr;
}

module.exports = {
  searchLeadsGoogleMaps,
  formatPhone
};
