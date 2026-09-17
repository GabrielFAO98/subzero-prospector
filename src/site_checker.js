const cheerio = require('cheerio');
const { cleanAndNormalizeUrl } = require('./url_cleaner');

/**
 * Verifica a saúde e acessibilidade de um website cadastrado no Google Maps
 * e extrai dados ricos de contato (WhatsApp, Instagram, Facebook, Celulares e E-mails).
 * @param {string} rawUrl
 */
async function checkWebsiteHealth(rawUrl) {
  if (!rawUrl) {
    return {
      hasWebsite: false,
      isOnline: false,
      status: 'nenhum',
      reason: 'Nenhum site cadastrado no Google Maps',
      url: null,
      extractedInstagram: null,
      extractedFacebook: null,
      extractedWhatsApp: null,
      extractedPhones: [],
      extractedEmails: []
    };
  }

  // 1. Sanitização profunda da URL
  const norm = cleanAndNormalizeUrl(rawUrl);

  if (!norm.cleanedUrl) {
    return {
      hasWebsite: false,
      isOnline: false,
      status: 'nenhum',
      reason: 'Link de anúncio ou ficha do Google sem site próprio cadastrado',
      url: null,
      extractedInstagram: null,
      extractedFacebook: null,
      extractedWhatsApp: null,
      extractedPhones: [],
      extractedEmails: []
    };
  }

  // 2. Detecção de Agregadores / Guias Locais (GuiaMais, Doctoralia, etc.)
  if (norm.isAggregator) {
    return {
      hasWebsite: false,
      isAggregator: true,
      url: norm.cleanedUrl,
      status: 'apenas_agregador',
      reason: `Utiliza perfil em agregador de diretório (${norm.aggregatorName}) no lugar de site próprio`,
      extractedInstagram: null,
      extractedFacebook: null,
      extractedWhatsApp: null,
      extractedPhones: [],
      extractedEmails: []
    };
  }

  // 3. Detecção de Redes Sociais no campo de website
  if (norm.isSocial) {
    let extractedInstagram = null;
    let extractedFacebook = null;

    if (norm.socialPlatform === 'Instagram') {
      const match = norm.cleanedUrl.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
      if (match) extractedInstagram = `https://www.instagram.com/${match[1]}/`;
    } else if (norm.socialPlatform === 'Facebook') {
      extractedFacebook = norm.cleanedUrl;
    }

    return {
      hasWebsite: false,
      isSocialLink: true,
      url: norm.cleanedUrl,
      status: 'apenas_social',
      reason: `Utiliza link de ${norm.socialPlatform} no lugar de site institucional próprio`,
      extractedInstagram,
      extractedFacebook,
      extractedWhatsApp: null,
      extractedPhones: [],
      extractedEmails: []
    };
  }

  // 4. Teste de acessibilidade HTTP / HTTPS
  const targetUrl = norm.cleanedUrl;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      }
    });

    clearTimeout(timeoutId);

    if (res.status >= 200 && res.status < 400) {
      let html = '';
      try {
        html = await res.text();
      } catch (_) {}

      let insta = null;
      let fb = null;
      let waLink = null;
      const phones = new Set();
      const emails = new Set();

      if (html) {
        try {
          const $ = cheerio.load(html);
          
          $('a[href]').each((_, el) => {
            const href = $(el).attr('href') || '';
            const lowerHref = href.toLowerCase();

            // WhatsApp link
            if (!waLink && (lowerHref.includes('wa.me/') || lowerHref.includes('api.whatsapp.com/') || lowerHref.includes('whatsapp.com/send'))) {
              const numMatch = href.match(/(?:phone=|wa\.me\/|send\?phone=)([0-9]{10,13})/);
              if (numMatch) waLink = numMatch[1];
              else waLink = href;
            }

            // Instagram link
            if (!insta && lowerHref.includes('instagram.com/')) {
              const m = href.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
              if (m && !['p', 'reel', 'explore', 'stories', 'about', 'developer'].includes(m[1].toLowerCase())) {
                insta = `https://www.instagram.com/${m[1]}/`;
              }
            }

            // Facebook link
            if (!fb && lowerHref.includes('facebook.com/')) {
              const m = href.match(/facebook\.com\/([a-zA-Z0-9._-]+)/i);
              if (m && !['sharer', 'policies', 'dialog', 'login', 'groups'].includes(m[1].toLowerCase())) {
                fb = `https://www.facebook.com/${m[1]}/`;
              }
            }

            // Mailto
            if (lowerHref.startsWith('mailto:')) {
              const mail = href.replace(/^mailto:/i, '').split('?')[0].trim();
              if (mail && mail.includes('@')) {
                const lm = mail.toLowerCase();
                const isTelemetry = lm.includes('sentry') || lm.includes('wixpress') || lm.includes('w3.org') || lm.includes('schema.org') || lm.includes('google') || lm.includes('cloudflare') || lm.includes('example.com');
                if (!isTelemetry) emails.add(lm);
              }
            }

            // Tel
            if (lowerHref.startsWith('tel:')) {
              const tel = href.replace(/^tel:/i, '').trim();
              if (tel) phones.add(tel);
            }
          });

          // Extração Regex de celulares brasileiros no texto
          const text = $('body').text();
          const cellMatches = text.match(/(?:\(?([1-9]{2})\)?\s?)?(?:9\d{4}[-\s]?\d{4})/g) || [];
          cellMatches.forEach(c => phones.add(c.trim()));

          const landMatches = text.match(/(?:\(?([1-9]{2})\)?\s?)?(?:[2-5]\d{3}[-\s]?\d{4})/g) || [];
          landMatches.forEach(l => {
            if (/^(?:19|20)\d{2}[-\s]?(?:19|20)\d{2}$/.test(l.trim())) return;
            phones.add(l.trim());
          });

          const mailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
          mailMatches.forEach(m => {
            const lm = m.toLowerCase();
            const isTelemetry = lm.includes('sentry') || lm.includes('wixpress') || lm.includes('w3.org') || lm.includes('schema.org') || lm.includes('google') || lm.includes('facebook') || lm.includes('cloudflare') || lm.includes('domain.com') || lm.includes('example.com') || lm.endsWith('.png') || lm.endsWith('.jpg') || lm.endsWith('.webp');
            if (!isTelemetry) emails.add(lm);
          });

          // Extração de Conteúdo para Enriquecimento do Protótipo
          const pageTitle = $('title').text().trim() || null;
          const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null;
          
          const rawHeadings = [];
          $('h1, h2, h3').each((_, el) => {
            const h = $(el).text().replace(/\s+/g, ' ').trim();
            if (h.length >= 4 && h.length <= 90 && !rawHeadings.includes(h)) {
              rawHeadings.push(h);
            }
          });

          // Detecção de serviços e tratamentos citados no site
          const candidateServices = new Set();
          $('li, .service, .servico, .treatment, .procedimento, .card, p').each((_, el) => {
            const txt = $(el).text().replace(/\s+/g, ' ').trim();
            if (txt.length >= 5 && txt.length <= 60) {
              const lower = txt.toLowerCase();
              if (
                lower.includes('implante') || lower.includes('prótese') || lower.includes('aparelho') ||
                lower.includes('ortodont') || lower.includes('clareamento') || lower.includes('estética') ||
                lower.includes('canal') || lower.includes('endodont') || lower.includes('cirurgia') ||
                lower.includes('lente') || lower.includes('harmoniza') || lower.includes('câmera') ||
                lower.includes('cftv') || lower.includes('alarme') || lower.includes('cerca') ||
                lower.includes('concertina') || lower.includes('portão') || lower.includes('ar condicionado') ||
                lower.includes('instalação') || lower.includes('manutenção') || lower.includes('higienização') ||
                lower.includes('pmoc') || lower.includes('24h') || lower.includes('urgência') ||
                lower.includes('consulta') || lower.includes('vacina') || lower.includes('banho') || lower.includes('tosa')
              ) {
                candidateServices.add(txt);
              }
            }
          });

          // Detecção de diferenciais e credenciais
          const differentials = new Set();
          const fullText = $('body').text();
          if (/24\s*h|24\s*horas|emergência|urgência/i.test(fullText)) differentials.add('Atendimento Emergencial / 24 Horas');
          if (/3d|scanner|digital|tecnologia/i.test(fullText)) differentials.add('Tecnologia Digital & Planejamento 3D');
          if (/carga imediata/i.test(fullText)) differentials.add('Técnica de Carga Imediata');
          if (/sedação|sem dor|anestesia/i.test(fullText)) differentials.add('Técnicas de Conforto e Sedação Consciente');
          if (/laserterapia|laser/i.test(fullText)) differentials.add('Laserterapia e Pós-operatório Acelerado');
          if (/(?:mais de\s*)?\d{1,2}\s*anos/i.test(fullText)) {
            const m = fullText.match(/(?:mais de\s*)?(\d{1,2}\s*anos)/i);
            if (m) differentials.add(`${m[0]} de Experiência no Mercado`);
          }

          return {
            hasWebsite: true,
            isOnline: true,
            statusCode: res.status,
            url: targetUrl,
            status: 'online',
            reason: `Site oficial ativo e respondendo normalmente (HTTP ${res.status})`,
            pageTitle,
            metaDescription,
            headings: rawHeadings.slice(0, 8),
            extractedServices: Array.from(candidateServices).slice(0, 10),
            extractedDifferentials: Array.from(differentials),
            extractedInstagram: insta,
            extractedFacebook: fb,
            extractedWhatsApp: waLink,
            extractedPhones: Array.from(phones),
            extractedEmails: Array.from(emails)
          };
        } catch (_) {}
      }

      return {
        hasWebsite: true,
        isOnline: true,
        statusCode: res.status,
        url: targetUrl,
        status: 'online',
        reason: `Site oficial ativo e respondendo normalmente (HTTP ${res.status})`,
        pageTitle: null,
        metaDescription: null,
        headings: [],
        extractedServices: [],
        extractedDifferentials: [],
        extractedInstagram: insta,
        extractedFacebook: fb,
        extractedWhatsApp: waLink,
        extractedPhones: Array.from(phones),
        extractedEmails: Array.from(emails)
      };
    } else {
      return {
        hasWebsite: true,
        isOnline: false,
        statusCode: res.status,
        url: targetUrl,
        status: 'inacessivel',
        reason: `Site cadastrado está INACESSÍVEL / FORA DO AR (HTTP ${res.status})`,
        extractedInstagram: null,
        extractedFacebook: null,
        extractedWhatsApp: null,
        extractedPhones: [],
        extractedEmails: []
      };
    }
  } catch (err) {
    let errorMsg = err.message;
    if (err.cause && err.cause.code === 'CERT_HAS_EXPIRED') {
      errorMsg = 'Certificado SSL Expirado / Inseguro';
    } else if (err.cause && (err.cause.code === 'ENOTFOUND' || err.cause.code === 'EAI_AGAIN')) {
      errorMsg = 'Domínio Não Encontrado (DNS)';
    } else if (err.cause && err.cause.code === 'ECONNREFUSED') {
      errorMsg = 'Conexão Recusada pelo Servidor';
    } else if (err.name === 'AbortError') {
      errorMsg = 'Tempo limite excedido (Timeout)';
    } else if (errorMsg.includes('fetch failed') && err.cause && err.cause.message) {
      errorMsg = err.cause.message;
    }
    return {
      hasWebsite: true,
      isOnline: false,
      statusCode: null,
      url: targetUrl,
      status: 'inacessivel',
      reason: `Site cadastrado está FORA DO AR (${errorMsg})`,
      extractedInstagram: null,
      extractedFacebook: null,
      extractedWhatsApp: null,
      extractedPhones: [],
      extractedEmails: []
    };
  }
}

module.exports = {
  checkWebsiteHealth
};
