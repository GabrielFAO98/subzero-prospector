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
        } catch (_) {}
      }

      return {
        hasWebsite: true,
        isOnline: true,
        statusCode: res.status,
        url: formattedUrl,
        status: 'online',
        reason: `Site oficial ativo e respondendo normalmente (HTTP ${res.status})`,
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

