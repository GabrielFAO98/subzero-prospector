const { chromium } = require('playwright');
const db = require('./db');
const { checkWebsiteHealth } = require('./site_checker');
const { huntSocials } = require('./social_hunter');
const { huntInstagramBio } = require('./instagram_bio_hunter');
const { isNationalBrand } = require('./brand_detector');
const { cleanAndNormalizeUrl } = require('./url_cleaner');
const { getCategoryForLead } = require('./categories');
const { sanitizePhonesForCity } = require('./phone_validator');
const { mineBusinessIntelligence } = require('./business_intelligence');
const { cleanCompanyName } = require('./name_cleaner');

/**
 * Minera empresas no Google Maps com auditoria profunda de saúde do site, redes sociais
 * e inteligência completa de negócio (serviços reais, artes do feed, paleta de cores e tom de voz).
 */
async function searchLeadsGoogleMaps(niche, city = 'Franca SP', maxResults = 5, onProgress = null) {
  const targetLimit = Math.min(Math.max(1, maxResults), 5);
  if (onProgress) onProgress(`Iniciando busca refinada no Google Maps para "${niche}" em ${city} (máx ${targetLimit} empresas)...`);
  console.log(`\n🔍 [1/2] Minerando empresas no Google Maps: "${niche}" em ${city} (limite: ${targetLimit})...`);
  
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

        let cards = Array.from(document.querySelectorAll('div.Nv2PK, div[role="article"]'));
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

          let ratingScore = '';
          let reviewCount = '';
          const imgEl = card.querySelector('span[role="img"][aria-label*="estrela"], span[role="img"][aria-label*="star"]');
          if (imgEl) {
            const aria = imgEl.getAttribute('aria-label') || '';
            const match = aria.match(/([\d,\.]+)\s*estrelas?(?:\s*(\d+)\s*coment[aá]rios?)?/i);
            if (match) {
              ratingScore = match[1];
              if (match[2]) reviewCount = match[2];
            }
          }
          if (!ratingScore) {
            ratingScore = card.querySelector('span.MW4etd')?.innerText?.trim() || '';
          }
          if (!reviewCount) {
            const countEl = card.querySelector('span.UY7F9');
            if (countEl) {
              reviewCount = countEl.innerText.replace(/\D/g, '').trim();
            }
          }
          let ratingText = '';
          if (ratingScore && reviewCount) {
            ratingText = `★ ${ratingScore.replace('.', ',')} (${reviewCount} comentários)`;
          } else if (ratingScore) {
            ratingText = `★ ${ratingScore.replace('.', ',')}`;
          }

          const allText = card.innerText || '';

          let address = '';
          const addressMatch = allText.match(/(?:R\.|Rua|Av\.|Avenida|Praça|Alameda|Travessa)[^•\n]+,\s*\d+[^\n•]*/i);
          if (addressMatch) {
            address = addressMatch[0].trim();
          }

          const linkEl = card.querySelector('a.hfpxzc, a[href*="/maps/place/"]');
          let mapsUrl = linkEl ? linkEl.href : '';
          if (!mapsUrl || !mapsUrl.includes('/maps/place/')) {
            mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (address || city))}`;
          }

          const websiteEl = card.querySelector('a[data-value="Website"], a[aria-label*="website" i], a[aria-label*="site" i], a[data-item-id*="authority"]');
          let websiteUrl = websiteEl ? websiteEl.href : null;

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

    console.log(`📍 ${rawPlaces.length} estabelecimentos encontrados no Google Maps.`);

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

    if (onProgress) onProgress(`${cleanedPlaces.length} estabelecimentos encontrados. Iniciando auditoria profunda e inteligência comercial...`);

    const targets = cleanedPlaces.slice(0, targetLimit);
    const processedLeads = [];

    // 2. Auditoria profunda sequencial (1 a 1) com o browser aberto
    for (let i = 0; i < targets.length; i++) {
      const p = targets[i];
      const itemIndex = i + 1;

      // Limpeza de nome para despoluir títulos gigantes com keyword stuffing
      const cleanName = cleanCompanyName(p.name, niche);

      console.log(`\n======================================================`);
      console.log(`🔍 [${itemIndex}/${targets.length}] Auditando: "${cleanName}" (Bruto: "${p.name}")...`);
      if (onProgress) onProgress(`Auditando com inteligência profunda [${itemIndex}/${targets.length}]: ${cleanName}...`);

      const slug = cleanName.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, '-');

      // Gatekeeping imediato: se for grande rede nacional, descarta diretamente
      if (p.isBrand || isNationalBrand(cleanName, p.websiteUrl) || isNationalBrand(p.name, p.websiteUrl)) {
        const brandLead = {
          slug,
          nome: cleanName,
          nomeBrutoMaps: p.name,
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
          categoria: getCategoryForLead({ nicho: niche, nome: cleanName }),
          siteData: {},
          dadosEnriquecidos: {},
          inteligenciaComercial: {}
        };
        const { lead } = db.upsert(brandLead);
        processedLeads.push(lead);
        continue;
      }

      // 2.0 Inspeciona a Ficha Detalhada do Google Maps (se houver link direto)
      let mapsDetailedData = {
        exactAddress: p.address,
        specificCategory: '',
        officialPhone: '',
        aboutText: '',
        reviews: []
      };

      if (p.mapsUrl && p.mapsUrl.includes('/maps/place/')) {
        try {
          console.log(`  📍 [Maps Details] Acessando ficha oficial do lugar...`);
          await page.goto(p.mapsUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await page.waitForTimeout(2500);

          const placeInfo = await page.evaluate(() => {
            const cat = document.querySelector('button[jsaction*="category"]')?.innerText || '';
            const phone = document.querySelector('button[data-item-id*="phone"]')?.innerText?.trim() || '';
            const addr = document.querySelector('button[data-item-id*="address"]')?.innerText?.trim() || '';
            const web = document.querySelector('a[data-item-id="authority"]')?.href || null;
            const aboutEl = document.querySelector('div.fontBodyMedium, div[aria-label*="Sobre"], [data-item-id*="about"]');
            const about = aboutEl ? aboutEl.innerText.trim() : '';

            return { cat, phone, addr, web, about };
          });

          if (placeInfo.addr) mapsDetailedData.exactAddress = placeInfo.addr.replace(/^[^a-zA-Z0-9]+/, '');
          if (placeInfo.phone) mapsDetailedData.officialPhone = placeInfo.phone.replace(/^[^0-9(]+/, '');
          if (placeInfo.cat) mapsDetailedData.specificCategory = placeInfo.cat;
          if (placeInfo.about) mapsDetailedData.aboutText = placeInfo.about;
          if (!p.websiteUrl && placeInfo.web) p.websiteUrl = placeInfo.web;
        } catch (_) {}
      }

      // 2.1 Auditoria profunda do Website informado no Google Maps (desempacota Linktrees e Link Hubs)
      let siteHealth = await checkWebsiteHealth(p.websiteUrl);

      // 2.2 Caça de Redes Sociais usando o Playwright com o nome limpo
      console.log(`  🌐 [Social Hunter] Buscando perfis oficiais de Instagram e Facebook...`);
      const socials = await huntSocials(cleanName, city, niche, page);
      console.log(`  ↳ Instagram: ${socials.instagram || 'N/A'} | Facebook: ${socials.facebook || 'N/A'}`);

      // 2.3 Caça Profunda de Instagram com leitura de Bio, Link da Bio e Website da Bio
      let igData = { instagram: null, handle: null, bioText: '', linkInBio: null, whatsappFromBio: null, websiteFromBio: null };
      try {
        igData = await huntInstagramBio(cleanName, city, socials.instagram || p.instagram);
      } catch (_) {}

      // Se achou site oficial na bio do Instagram e não havia site no Google Maps:
      let siteDiscoveredFromBio = false;
      if ((!p.websiteUrl || siteHealth.status === 'nenhum' || siteHealth.status === 'apenas_social' || siteHealth.status === 'apenas_linktree' || siteHealth.status === 'apenas_agregador') && igData.websiteFromBio) {
        console.log(`  🔎 [Site Hunter] Site oficial detectado na bio do Instagram: ${igData.websiteFromBio}. Auditando acessibilidade...`);
        p.websiteUrl = igData.websiteFromBio;
        siteHealth = await checkWebsiteHealth(p.websiteUrl);
        siteDiscoveredFromBio = true;
      }

      if (siteHealth.status === 'inacessivel' && siteDiscoveredFromBio) {
        const domainClean = (igData.websiteFromBio || '').replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
        siteHealth.reason = `Site oficial cadastrado na bio do Instagram (${domainClean}), porém está INACESSÍVEL / FORA DO AR (${siteHealth.statusCode ? 'HTTP ' + siteHealth.statusCode : (siteHealth.reason.includes('SSL') ? 'Certificado SSL Expirado' : siteHealth.reason)})`;
      }

      // 2.4 Consolidação de Telefones com sanitização de DDD
      const mapsPhones = (p.allText.match(/(?:\(?([1-9]{2})\)?\s?)?(?:(9\d{4})[-\s]?(\d{4})|([2-5]\d{3})[-\s]?(\d{4}))/g) || [])
        .map(x => x.trim())
        .filter(x => !/^(?:19|20)\d{2}[-\s]?(?:19|20)\d{2}$/.test(x));

      const rawAllPhones = [
        ...(mapsDetailedData.officialPhone ? [mapsDetailedData.officialPhone] : []),
        ...(siteHealth.extractedWhatsApp ? [siteHealth.extractedWhatsApp] : []),
        ...(igData.whatsappFromBio ? [igData.whatsappFromBio] : []),
        ...(siteHealth.extractedPhones || []),
        ...mapsPhones
      ];

      const phoneValidation = sanitizePhonesForCity(rawAllPhones, city);

      const finalInstagram = socials.instagram || siteHealth.extractedInstagram || igData.instagram || null;
      const finalFacebook = socials.facebook || siteHealth.extractedFacebook || null;
      const allEmails = [...new Set([...(siteHealth.extractedEmails || []), ...(socials.emails || [])])];

      // 2.5 MINERAÇÃO DE INTELIGÊNCIA COMERCIAL PROFUNDA (Facebook + Instagram + Paleta de Cores do Feed)
      let bi = { servicos: [], diferenciais: [], tomDeVoz: '', videoInstitucional: null, avatarOuLogo: null, paletaCores: {} };
      try {
        bi = await mineBusinessIntelligence(page, {
          companyName: cleanName,
          city,
          niche,
          instagramUrl: finalInstagram,
          facebookUrl: finalFacebook,
          mapsData: { ...p, ...mapsDetailedData }
        });
      } catch (biErr) {
        console.warn(`  ⚠️ [BI Warning] Erro na síntese de BI: ${biErr.message}`);
      }

      // 2.6 Análise e Classificação Comercial Inteligente
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
        const originNote = siteDiscoveredFromBio 
          ? `cadastrado na bio do Instagram (${siteHealth.url})` 
          : `cadastrado (${siteHealth.url})`;
        const errorDetail = siteHealth.statusCode ? `HTTP ${siteHealth.statusCode}` : (siteHealth.reason.includes('SSL') ? 'Certificado SSL Expirado' : siteHealth.reason);
        analiseIA = `🔥 GATILHO DE OURO: Empresa possui site oficial ${originNote}, porém está FORA DO AR / INACESSÍVEL (${errorDetail}). Clientes clicam no link ou buscam no Google e dão de cara com erro!`;
      } else if (siteHealth.status === 'apenas_linktree') {
        status = 'oportunidade_quente';
        motivoDescarte = null;
        analiseIA = `🔗 Oportunidade Quente: A empresa utiliza apenas agrupador de links/Linktree (${siteHealth.url}). Não possui site oficial próprio com domínio próprio para reter visitantes e converter clientes!`;
      } else if (siteHealth.status === 'apenas_social') {
        status = 'oportunidade_quente';
        motivoDescarte = null;
        analiseIA = `📱 Oportunidade Quente: Utiliza apenas rede social no Google. Não possui site próprio para ranquear organicamente nem reter visitantes profissionais.`;
      } else if (siteHealth.status === 'apenas_agregador') {
        status = 'oportunidade_quente';
        motivoDescarte = null;
        analiseIA = `📋 Oportunidade Quente: Ficha direciona para agregador de diretório (${siteHealth.reason}). Não possui domínio e autoridade própria no Google.`;
      } else if (siteHealth.status === 'online') {
        status = 'site_ativo';
        motivoDescarte = null;
        if (siteHealth.linkHubUrl) {
          analiseIA = `🌐 Site Oficial Desempacotado: Empresa possui site oficial ativo (${siteHealth.url}) cadastrado dentro do seu hub de links (${siteHealth.linkHubUrl}). Candidata a redesign e alta conversão mobile com template Subzero.`;
        } else if (siteDiscoveredFromBio) {
          analiseIA = `🌐 Site Ativo Detectado na Bio do Instagram: Empresa possui presença web oficial ativa (${siteHealth.url}). Candidata a modernização, redesign e alta conversão mobile com template Subzero.`;
        } else {
          const sslText = (siteHealth.url && siteHealth.url.startsWith('http://'))
            ? '⚠️ Site sem SSL (inseguro HTTP).'
            : 'Site institucional ativo.';
          analiseIA = `🌐 Site Ativo Detectado: ${sslText} Empresa já possui presença web (${siteHealth.url}). Candidata a redesign, melhoria de SEO local ou otimização de velocidade com template Subzero.`;
        }
      } else {
        status = 'oportunidade_quente';
        analiseIA = `💎 Oportunidade de Ouro em ${city}: Empresa com ${p.ratingText || 'boa reputação'}, porém SEM NENHUM SITE OFICIAL próprio cadastrado no Google ou no Instagram. Perde todo o tráfego orgânico diário!`;
      }

      const servicesToSave = (bi.servicos && bi.servicos.length > 0) ? bi.servicos : siteHealth.extractedServices;
      const differentialsToSave = (bi.diferenciais && bi.diferenciais.length > 0) ? bi.diferenciais : siteHealth.extractedDifferentials;

      const leadRecord = {
        slug,
        nome: cleanName,
        nomeBrutoMaps: p.name,
        nicho: niche,
        cidade: city,
        siteOriginal: siteHealth.url || p.websiteUrl || null,
        siteStatus: siteHealth.status,
        siteHttpCode: siteHealth.statusCode || (siteHealth.reason && siteHealth.reason.match(/HTTP\s*(\d{3})/i) ? parseInt(siteHealth.reason.match(/HTTP\s*(\d{3})/i)[1]) : null),
        siteHealthReason: siteHealth.reason,
        linkHubUrl: siteHealth.linkHubUrl || null,
        avaliacao: p.ratingText,
        endereco: mapsDetailedData.exactAddress || p.address || null,
        categoriaMaps: mapsDetailedData.specificCategory || null,
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
        categoria: getCategoryForLead({ nicho: niche, nome: cleanName }),
        siteData: {
          title: siteHealth.pageTitle || null,
          metaDescription: siteHealth.metaDescription || null,
          headings: siteHealth.headings || [],
          servicosExtraidos: Array.isArray(servicesToSave) ? servicesToSave.map(s => typeof s === 'string' ? s : s.nome) : [],
          diferenciaisExtraidos: Array.isArray(differentialsToSave) ? differentialsToSave.map(d => typeof d === 'string' ? d : d.titulo) : []
        },
        dadosEnriquecidos: {
          instagram: finalInstagram,
          facebook: finalFacebook,
          whatsappPrincipal: phoneValidation.whatsappPrincipal,
          whatsappFormatado: phoneValidation.whatsappFormatado,
          website: siteHealth.url || p.websiteUrl || null,
          linkHubUrl: siteHealth.linkHubUrl || null,
          websiteFromBio: igData.websiteFromBio || null,
          bioInstagram: igData.bioText || null,
          linkNaBio: igData.linkInBio || null,
          servicosDetectados: servicesToSave || [],
          diferenciais: differentialsToSave || [],
          paletaCores: bi.paletaCores || null,
          fotosReais: bi.fotosReais || [],
          videoInstitucional: siteHealth.extractedVideo || bi.videoInstitucional || null,
          avatarOuLogo: bi.avatarOuLogo || null,
          tomDeVoz: bi.tomDeVoz || null
        },
        fotosReais: bi.fotosReais || [],
        inteligenciaComercial: bi
      };

      const { lead, isNew } = db.upsert(leadRecord);
      lead._isNew = isNew;
      processedLeads.push(lead);
    }

    await browser.close();

    console.log(`\n🏁 Prospecção e auditoria concluídas: ${processedLeads.length} leads processados com ficha completa.`);
    if (onProgress) onProgress(`Auditoria finalizada com sucesso! ${processedLeads.length} empresas catalogadas com inteligência completa.`);
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

/**
 * Re-enriquece um lead existente com busca de redes sociais, auditoria e inteligência comercial
 */
async function enrichLead(lead) {
  const cleanName = cleanCompanyName(lead.nome, lead.nicho);
  console.log(`\n🔍 [Enrich] Re-enriquecendo contatos e inteligência comercial de: "${cleanName}"...`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'pt-BR'
  });
  const page = await context.newPage();

  let finalInstagram = lead.instagram;
  let finalFacebook = lead.facebook;

  try {
    const socials = await huntSocials(cleanName, lead.cidade || 'Franca SP', lead.nicho || '', page);
    if (!finalInstagram && socials.instagram) finalInstagram = socials.instagram;
    if (!finalFacebook && socials.facebook) finalFacebook = socials.facebook;

    const igData = await huntInstagramBio(cleanName, lead.cidade || 'Franca SP', finalInstagram);

    let siteHealth = null;
    let siteUrl = lead.siteOriginal;

    if ((!siteUrl || lead.siteStatus === 'nenhum' || lead.siteStatus === 'apenas_social' || lead.siteStatus === 'apenas_linktree' || lead.siteStatus === 'apenas_agregador') && igData.websiteFromBio) {
      siteUrl = igData.websiteFromBio;
    }

    if (siteUrl) {
      siteHealth = await checkWebsiteHealth(siteUrl);
    }

    const rawPhones = [
      ...(igData.whatsappFromBio ? [igData.whatsappFromBio] : []),
      ...(lead.telefones || []),
      ...(siteHealth && siteHealth.extractedWhatsApp ? [siteHealth.extractedWhatsApp] : []),
      ...(siteHealth && siteHealth.extractedPhones ? siteHealth.extractedPhones : [])
    ];

    const phoneValidation = sanitizePhonesForCity(rawPhones, lead.cidade || 'Franca SP');

    // Mineração de Inteligência Comercial
    const bi = await mineBusinessIntelligence(page, {
      companyName: cleanName,
      city: lead.cidade || 'Franca SP',
      niche: lead.nicho || '',
      instagramUrl: finalInstagram,
      facebookUrl: finalFacebook,
      mapsData: { ...lead }
    });

    let updatedSiteStatus = lead.siteStatus;
    let updatedSiteReason = lead.siteHealthReason;
    let updatedHttpCode = lead.siteHttpCode;
    let updatedStatus = lead.status;
    let updatedAnalise = lead.analiseIA;

    if (siteHealth) {
      updatedSiteStatus = siteHealth.status;
      updatedSiteReason = siteHealth.reason;
      updatedHttpCode = siteHealth.statusCode || (siteHealth.reason && siteHealth.reason.match(/HTTP\s*(\d{3})/i) ? parseInt(siteHealth.reason.match(/HTTP\s*(\d{3})/i)[1]) : null);

      if (siteHealth.status === 'inacessivel') {
        updatedStatus = 'oportunidade_quente';
        const domainClean = (siteUrl || '').replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
        const errorDetail = updatedHttpCode ? `HTTP ${updatedHttpCode}` : (siteHealth.reason.includes('SSL') ? 'Certificado SSL Expirado' : siteHealth.reason);
        updatedSiteReason = `Site oficial cadastrado na bio do Instagram (${domainClean}), porém está INACESSÍVEL / FORA DO AR (${errorDetail})`;
        updatedAnalise = `🔥 GATILHO DE OURO: Empresa possui site oficial cadastrado (${siteUrl}), porém está FORA DO AR / INACESSÍVEL (${errorDetail}). Clientes clicam no link ou buscam no Google e dão de cara com erro!`;
      } else if (siteHealth.status === 'apenas_linktree') {
        updatedStatus = 'oportunidade_quente';
        updatedAnalise = `🔗 Oportunidade Quente: A empresa utiliza apenas agrupador de links/Linktree (${siteHealth.url}). Não possui site oficial próprio com domínio próprio para reter visitantes e converter clientes!`;
      } else if (siteHealth.status === 'online') {
        if (lead.status !== 'prototipo_pronto') {
          updatedStatus = 'site_ativo';
        }
        if (siteHealth.linkHubUrl) {
          updatedAnalise = `🌐 Site Oficial Desempacotado: Empresa possui site oficial ativo (${siteHealth.url}) cadastrado dentro do seu hub de links (${siteHealth.linkHubUrl}). Candidata a redesign e alta conversão mobile com template Subzero.`;
        } else {
          updatedAnalise = `🌐 Site Ativo Detectado: Empresa possui presença web (${siteHealth.url}). Candidata a redesign e alta conversão mobile com template Subzero.`;
        }
      }
    }

    const servicesToSave = (bi.servicos && bi.servicos.length > 0) ? bi.servicos : (lead.dadosEnriquecidos?.servicosDetectados || []);
    const differentialsToSave = (bi.diferenciais && bi.diferenciais.length > 0) ? bi.diferenciais : (lead.dadosEnriquecidos?.diferenciais || []);

    const updatedLead = {
      ...lead,
      nome: cleanName,
      nomeBrutoMaps: lead.nomeBrutoMaps || lead.nome,
      siteOriginal: siteHealth ? siteHealth.url : siteUrl,
      siteStatus: updatedSiteStatus,
      siteHttpCode: updatedHttpCode,
      siteHealthReason: updatedSiteReason,
      linkHubUrl: (siteHealth && siteHealth.linkHubUrl) || lead.linkHubUrl || null,
      status: updatedStatus,
      analiseIA: updatedAnalise,
      telefones: phoneValidation.phones.length > 0 ? phoneValidation.phones : lead.telefones,
      whatsappPrincipal: phoneValidation.whatsappPrincipal || lead.whatsappPrincipal,
      whatsappFormatado: phoneValidation.whatsappFormatado || lead.whatsappFormatado,
      instagram: finalInstagram,
      facebook: finalFacebook,
      siteData: {
        ...(lead.siteData || {}),
        servicosExtraidos: Array.isArray(servicesToSave) ? servicesToSave.map(s => typeof s === 'string' ? s : s.nome) : [],
        diferenciaisExtraidos: Array.isArray(differentialsToSave) ? differentialsToSave.map(d => typeof d === 'string' ? d : d.titulo) : []
      },
      dadosEnriquecidos: {
        ...(lead.dadosEnriquecidos || {}),
        website: siteHealth ? siteHealth.url : siteUrl,
        linkHubUrl: (siteHealth && siteHealth.linkHubUrl) || (lead.dadosEnriquecidos && lead.dadosEnriquecidos.linkHubUrl) || null,
        websiteFromBio: igData.websiteFromBio || (lead.dadosEnriquecidos && lead.dadosEnriquecidos.websiteFromBio) || null,
        bioInstagram: igData.bioText || (lead.dadosEnriquecidos && lead.dadosEnriquecidos.bioInstagram) || '',
        linkNaBio: igData.linkInBio || (lead.dadosEnriquecidos && lead.dadosEnriquecidos.linkNaBio) || null,
        servicosDetectados: servicesToSave,
        diferenciais: differentialsToSave,
        paletaCores: bi.paletaCores || (lead.dadosEnriquecidos && lead.dadosEnriquecidos.paletaCores) || null,
        fotosReais: (bi.fotosReais && bi.fotosReais.length > 0) ? bi.fotosReais : (lead.dadosEnriquecidos && lead.dadosEnriquecidos.fotosReais) || [],
        videoInstitucional: (siteHealth && siteHealth.extractedVideo) || bi.videoInstitucional || (lead.dadosEnriquecidos && lead.dadosEnriquecidos.videoInstitucional) || null,
        avatarOuLogo: bi.avatarOuLogo || (lead.dadosEnriquecidos && lead.dadosEnriquecidos.avatarOuLogo) || null,
        tomDeVoz: bi.tomDeVoz || (lead.dadosEnriquecidos && lead.dadosEnriquecidos.tomDeVoz) || null
      },
      fotosReais: (bi.fotosReais && bi.fotosReais.length > 0) ? bi.fotosReais : (lead.fotosReais || []),
      inteligenciaComercial: bi,
      updatedAt: new Date().toISOString()
    };

    await browser.close();
    db.update(lead.id, updatedLead);
    return updatedLead;
  } catch (err) {
    await browser.close();
    console.error('Erro no enrichLead:', err.message);
    return lead;
  }
}

module.exports = {
  searchLeadsGoogleMaps,
  enrichLead,
  formatPhone
};
