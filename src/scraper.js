const { chromium } = require('playwright');
const db = require('./db');
const { checkWebsiteHealth } = require('./site_checker');
const { huntSocials } = require('./social_hunter');
const { huntInstagramBio } = require('./instagram_bio_hunter');
const { isNationalBrand, probeBrandWebsite } = require('./brand_detector');
const { cleanAndNormalizeUrl } = require('./url_cleaner');
const { getCategoryForLead } = require('./categories');
const { sanitizePhonesForCity } = require('./phone_validator');

/**
 * Minera empresas no Google Maps com auditoria profunda de saúde do site e redes sociais
 * Prioriza qualidade sobre quantidade, com sanitização de dados e qualificação rigorosa.
 */
async function searchLeadsGoogleMaps(niche, city = 'Franca SP', maxResults = 5, onProgress = null) {
  const targetLimit = Math.min(Math.max(1, maxResults), 5);
  if (onProgress) onProgress(`Iniciando busca refinada no Google Maps para "${niche}" em ${city} (máx ${targetLimit} empresas)...`);
  console.log(`\n🔍 [1/2] Minerando empresas no Google Maps: "${niche}" em ${city} (limite estrito: ${targetLimit})...`);
  
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
        const allText = document.body.innerText || '';
        const mapsUrl = window.location.href;
        return [{ name, ratingText, mapsUrl, websiteUrl, allText }];
      });
      rawPlaces = single.filter(s => s.name);
    } else {
      // Aguarda feed de resultados múltiplos
      await page.waitForSelector('div[role="feed"], .m6QErb[aria-label], div.Nv2PK', { timeout: 15000 }).catch(() => null);

      // Scroll inteligente e moderado (apenas se necessário para atingir o limite estrito)
      const feed = page.locator('div[role="feed"], .m6QErb[aria-label]').first();
      if (await feed.count() > 0) {
        let currentCount = await page.locator('div.Nv2PK, div[role="article"]').count();
        if (currentCount < targetLimit) {
          await feed.evaluate(el => el.scrollBy(0, 1500));
          await page.waitForTimeout(1000);
        }
      }

      rawPlaces = await page.evaluate(() => {
        const results = [];
        const seenNames = new Set();

        // 1. Cards modernos primários
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
          const addressMatch = allText.match(/(?:R\.|Rua|Av\.|Avenida|Praça|Alameda|Travessa)[^•\n]+,\s*\d+[^\n•]*/i);
          if (addressMatch) {
            address = addressMatch[0].trim();
          }

          // Link do Maps com parâmetros oficiais de busca exata
          const linkEl = card.querySelector('a.hfpxzc, a[href*="/maps/place/"]');
          let mapsUrl = linkEl ? linkEl.href : '';
          if (!mapsUrl || !mapsUrl.includes('/maps/place/')) {
            mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (address || city))}`;
          }

          // Site oficial ou sublink
          const websiteEl = card.querySelector('a[data-value="Website"], a[aria-label*="website" i], a[aria-label*="site" i], a[data-item-id*="authority"]');
          let websiteUrl = websiteEl ? websiteEl.href : null;

          // Extração heurística de domínio caso não haja botão explícito
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

    console.log(`📦 ${rawPlaces.length} estabelecimentos encontrados no Google Maps.`);
    await browser.close();

    // Sanitiza e pré-qualifica estabelecimentos encontrados
    const cleanedPlaces = rawPlaces.map(p => {
      const norm = cleanAndNormalizeUrl(p.websiteUrl);
      return {
        ...p,
        websiteUrl: norm.cleanedUrl,
        websiteDomain: norm.domain,
        isAggregator: norm.isAggregator,
        isSocial: norm.isSocial,
        isBrand: isNationalBrand(p.name, norm.cleanedUrl)
      };
    });

    if (onProgress) onProgress(`${cleanedPlaces.length} estabelecimentos encontrados. Iniciando auditoria comercial...`);

    const targets = cleanedPlaces.slice(0, targetLimit);
    const processedLeads = [];

    // 2. Auditoria profunda sequencial (1 a 1) para máxima qualidade e precisão
    for (let i = 0; i < targets.length; i++) {
      const p = targets[i];
      const itemIndex = i + 1;
      console.log(`🔎 [${itemIndex}/${targets.length}] Auditando: "${p.name}"...`);
      if (onProgress) onProgress(`Auditando com rigor [${itemIndex}/${targets.length}]: ${p.name}...`);

      const slug = p.name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, '-');

      // Gatekeeping imediato: se for grande rede nacional, descarta diretamente
      if (p.isBrand || isNationalBrand(p.name, p.websiteUrl)) {
        const brandLead = {
          slug,
          nome: p.name,
          nicho: niche,
          cidade: city,
          siteOriginal: p.websiteUrl,
          siteStatus: 'rede_nacional',
          siteHealthReason: 'Grande rede corporativa nacional / Franquia',
          avaliacao: p.ratingText,
          endereco: p.address || null,
          mapsUrl: p.mapsUrl,
          telefones: [],
          emails: [],
          instagram: null,
          facebook: null,
          whatsappPrincipal: null,
          whatsappFormatado: null,
          status: 'descartado',
          motivoDescarte: 'Grande Rede / Franquia Nacional',
          analiseIA: `🏢 Grande rede corporativa nacional (${p.websiteUrl || 'marca de grande porte'}). Incompatível com prospecção e desenvolvimento de site local Subzero.`,
          categoria: getCategoryForLead({ nicho: niche, nome: p.name }),
          siteData: {},
          dadosEnriquecidos: {}
        };
        const { lead } = db.upsert(brandLead);
        processedLeads.push(lead);
        continue;
      }

      // 2.0 Sondagem rápida de domínio corporativo se o Maps não exibir botão direto
      if (!p.websiteUrl) {
        try {
          const probed = await probeBrandWebsite(p.name);
          if (probed) {
            p.websiteUrl = cleanAndNormalizeUrl(probed).cleanedUrl;
          }
        } catch (_) {}
      }

      // 2.1 Auditoria profunda do Website
      const siteHealth = await checkWebsiteHealth(p.websiteUrl);

      // 2.2 Caça de Redes Sociais com validação semântica de handle
      const socials = await huntSocials(p.name, city, niche);

      // 2.3 Caça Profunda de Instagram com leitura de Bio e link de WhatsApp
      let igData = { instagram: null, handle: null, bioText: '', linkInBio: null, whatsappFromBio: null };
      try {
        igData = await huntInstagramBio(p.name, city, socials.instagram || p.instagram);
      } catch (_) {}

      // 2.4 Telefones consolidados brutos
      const mapsPhones = (p.allText.match(/(?:\(?([1-9]{2})\)?\s?)?(?:(9\d{4})[-\s]?(\d{4})|(\d{4})[-\s]?(\d{4}))/g) || [])
        .map(x => x.trim());

      const rawAllPhones = [
        ...(igData.whatsappFromBio ? [igData.whatsappFromBio] : []),
        ...(siteHealth.extractedWhatsApp ? [siteHealth.extractedWhatsApp] : []),
        ...(siteHealth.extractedPhones || []),
        ...mapsPhones
      ];

      // Sanitização estrita com validação de DDD local e detecção de redes multi-regionais
      const phoneValidation = sanitizePhonesForCity(rawAllPhones, city);

      const finalInstagram = siteHealth.extractedInstagram || igData.instagram || socials.instagram || null;
      const finalFacebook = siteHealth.extractedFacebook || socials.facebook || null;
      const allEmails = [...new Set([...(siteHealth.extractedEmails || []), ...(socials.emails || [])])];

      // 2.5 Análise e Classificação Comercial Inteligente
      let status = 'oportunidade_quente';
      let motivoDescarte = null;
      let analiseIA = '';

      if (phoneValidation.isMultiRegionChain) {
        status = 'descartado';
        motivoDescarte = `Grande Rede / Franquia (Múltiplos DDDs: ${phoneValidation.detectedDdds.join(', ')})`;
        analiseIA = `🏢 Identificada rede ou portal multi-regional com números de vários DDDs (${phoneValidation.detectedDdds.join(', ')}). Incompatível com prospecção e desenvolvimento de site local Subzero.`;
      } else if (phoneValidation.phones.length === 0) {
        status = 'descartado';
        motivoDescarte = 'Sem telefone ou canal de contato no DDD local';
        analiseIA = `Ausência de telefone ou WhatsApp com DDD local (${city}) para contato comercial.`;
      } else if (siteHealth.status === 'inacessivel') {
        status = 'oportunidade_quente';
        motivoDescarte = null;
        analiseIA = `🚨 GATILHO DE OURO: Empresa possui site cadastrado (${siteHealth.url}), porém está FORA DO AR / INACESSÍVEL (${siteHealth.reason}). Clientes buscam a empresa no Google e encontram erro, indo para a concorrência!`;
      } else if (siteHealth.status === 'apenas_social') {
        status = 'oportunidade_quente';
        motivoDescarte = null;
        analiseIA = `📱 Oportunidade Quente: Utiliza apenas rede social no Google. Não possui site próprio para ranquear organicamente nem reter visitantes profissionais.`;
      } else if (siteHealth.status === 'apenas_agregador') {
        status = 'oportunidade_quente';
        motivoDescarte = null;
        analiseIA = `📍 Oportunidade Quente: Ficha direciona para agregador de diretório (${siteHealth.reason}). Não possui domínio e autoridade própria no Google.`;
      } else if (siteHealth.status === 'online') {
        status = 'site_ativo';
        motivoDescarte = null;
        const sslText = (siteHealth.url && siteHealth.url.startsWith('http://'))
          ? '⚠️ Site sem SSL (inseguro HTTP).'
          : 'Site institucional ativo.';
        analiseIA = `🌐 Site Ativo Detectado: ${sslText} Empresa já possui presença web (${siteHealth.url}). Candidata a redesign, melhoria de SEO local ou otimização de velocidade com template Subzero.`;
      } else {
        // Status 'nenhum'
        status = 'oportunidade_quente';
        analiseIA = `🔥 Oportunidade de Ouro em ${city}: Empresa com ${p.ratingText || 'boa reputação'}, porém SEM NENHUM SITE OFICIAL próprio cadastrado no Google. Perde todo o tráfego orgânico diário!`;
      }

      const leadRecord = {
        slug,
        nome: p.name,
        nicho: niche,
        cidade: city,
        siteOriginal: siteHealth.url || p.websiteUrl || null,
        siteStatus: siteHealth.status,
        siteHealthReason: siteHealth.reason,
        avaliacao: p.ratingText,
        endereco: p.address || null,
        mapsUrl: p.mapsUrl,
        telefones: phoneValidation.phones,
        emails: allEmails,
        instagram: finalInstagram,
        facebook: finalFacebook,
        whatsappPrincipal: phoneValidation.whatsappPrincipal,
        whatsappFormatado: phoneValidation.whatsappFormatado,
        status,
        motivoDescarte,
        analiseIA,
        categoria: getCategoryForLead({ nicho: niche, nome: p.name }),
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
          whatsappPrincipal: phoneValidation.whatsappPrincipal,
          whatsappFormatado: phoneValidation.whatsappFormatado,
          website: siteHealth.url || p.websiteUrl || null,
          bioInstagram: igData.bioText || null,
          linkNaBio: igData.linkInBio || null,
          servicosDetectados: siteHealth.extractedServices || [],
          diferenciais: siteHealth.extractedDifferentials || []
        }
      };

      const { lead } = db.upsert(leadRecord);
      processedLeads.push(lead);
    }

    console.log(`\n✅ Prospecção e auditoria concluídas: ${processedLeads.length} leads processados.`);
    if (onProgress) onProgress(`Auditoria finalizada com sucesso! ${processedLeads.length} empresas catalogadas.`);
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
