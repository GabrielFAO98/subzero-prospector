const cheerio = require('cheerio');

/**
 * Verifica a saúde e acessibilidade de um website cadastrado no Google Maps
 * e extrai dados ricos de contato (WhatsApp, Instagram, Facebook, Celulares e E-mails).
 */
async function checkWebsiteHealth(url) {
  if (!url) return {
    hasWebsite: false,
    isOnline: false,
    status: 'nenhum',
    reason: 'Nenhum site cadastrado',
    extractedInstagram: null,
    extractedFacebook: null,
    extractedWhatsApp: null,
    extractedPhones: [],
    extractedEmails: []
  };

  // Se for redirecionador ou anúncio do Google (/aclk, /url)
  if (url.includes('google.com') || url.includes('goo.gl')) {
    try {
      const u = new URL(url);
      const target = u.searchParams.get('adurl') || u.searchParams.get('q') || u.searchParams.get('url');
      if (target && !target.includes('google.com')) {
        url = target;
      } else {
        return {
          hasWebsite: false,
          isOnline: false,
          status: 'nenhum',
          reason: 'Anúncio ou ficha do Google sem site próprio cadastrado',
          extractedInstagram: null,
          extractedFacebook: null,
          extractedWhatsApp: null,
          extractedPhones: [],
          extractedEmails: []
        };
      }
    } catch (_) {
      return {
        hasWebsite: false,
        isOnline: false,
        status: 'nenhum',
        reason: 'Nenhum site cadastrado',
        extractedInstagram: null,
        extractedFacebook: null,
        extractedWhatsApp: null,
        extractedPhones: [],
        extractedEmails: []
      };
    }
  }

  const lower = url.toLowerCase();
  let extractedInstagram = null;
  let extractedFacebook = null;

  if (lower.includes('instagram.com')) {
    const match = url.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
    if (match) extractedInstagram = `https://www.instagram.com/${match[1]}/`;
    return {
      hasWebsite: false,
      isSocialLink: true,
      url,
      status: 'apenas_social',
      reason: `Utiliza link do Instagram no lugar de site próprio (${url})`,
      extractedInstagram,
      extractedFacebook: null,
      extractedWhatsApp: null,
      extractedPhones: [],
      extractedEmails: []
    };
  }

  if (lower.includes('facebook.com')) {
    extractedFacebook = url;
    return {
      hasWebsite: false,
      isSocialLink: true,
      url,
      status: 'apenas_social',
      reason: `Utiliza link do Facebook no lugar de site próprio (${url})`,
      extractedInstagram: null,
      extractedFacebook,
      extractedWhatsApp: null,
      extractedPhones: [],
      extractedEmails: []
    };
  }

  if (lower.includes('linktr.ee')) {
    return {
      hasWebsite: false,
      isSocialLink: true,
      url,
      status: 'apenas_social',
      reason: `Utiliza Linktree no lugar de site institucional próprio (${url})`,
      extractedInstagram: null,
      extractedFacebook: null,
      extractedWhatsApp: null,
      extractedPhones: [],
      extractedEmails: []
    };
  }

  let formattedUrl = url;
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(formattedUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      },
      redirect: 'follow'
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
              if (mail && mail.includes('@')) emails.add(mail.toLowerCase());
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
          landMatches.forEach(l => phones.add(l.trim()));

          const mailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
          mailMatches.forEach(m => {
            const lm = m.toLowerCase();
            if (!lm.endsWith('.png') && !lm.endsWith('.jpg') && !lm.includes('w3.org')) emails.add(lm);
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
                lower.includes('pmoc') || lower.includes('24h') || lower.includes('urgência')
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
            url: formattedUrl,
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
        url: formattedUrl,
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
        url: formattedUrl,
        status: 'inacessivel',
        reason: `🚨 Site cadastrado está INACESSÍVEL / FORA DO AR (HTTP ${res.status})`,
        extractedInstagram: null,
        extractedFacebook: null,
        extractedWhatsApp: null,
        extractedPhones: [],
        extractedEmails: []
      };
    }
  } catch (err) {
    let errorMsg = err.message;
    if (err.name === 'AbortError') errorMsg = 'Tempo limite excedido (Timeout)';
    return {
      hasWebsite: true,
      isOnline: false,
      statusCode: null,
      url: formattedUrl,
      status: 'inacessivel',
      reason: `🚨 Site cadastrado está FORA DO AR (${errorMsg})`,
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

