const cheerio = require('cheerio');

async function querySearchEngines(query) {
  try {
    const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });

    if (!res.ok) return { links: [], text: '' };
    const html = await res.text();
    const $ = cheerio.load(html);
    const text = $('body').text();

    const links = [];
    $('a[href]').each((i, el) => {
      let href = $(el).attr('href') || '';
      if (href.includes('uddg=')) {
        const m = href.match(/uddg=([^&"']+)/);
        if (m) {
          try { href = decodeURIComponent(m[1]); } catch (_) { href = m[1]; }
        }
      }
      links.push(href);
    });

    return { links, text };
  } catch (_) {
    return { links: [], text: '' };
  }
}

/**
 * Caça profunda e precisa de Instagram, Facebook, E-mails e WhatsApp celular
 */
async function huntSocials(companyName, city = 'Franca SP') {
  let instagram = null;
  let facebook = null;
  let emails = new Set();
  let phones = new Set();

  const cleanName = companyName
    .replace(/Assistência Técnica/gi, '')
    .replace(/Instalação e Manutenção/gi, '')
    .replace(/Franca[- /]?SP/gi, '')
    .trim();

  // 1. Busca focada no Instagram
  const instaData = await querySearchEngines(`${cleanName} ${city} instagram`);
  for (const link of instaData.links) {
    if (link.includes('instagram.com/')) {
      const match = link.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
      if (match) {
        const handle = match[1].toLowerCase();
        if (!['p', 'reel', 'explore', 'stories', 'tags', 'popular', 'tv', 'about', 'developer'].includes(handle)) {
          instagram = `https://www.instagram.com/${handle}/`;
          break;
        }
      }
    }
  }

  // 2. Busca focada no Facebook
  const fbData = await querySearchEngines(`${cleanName} ${city} facebook`);
  for (const link of fbData.links) {
    if (link.includes('facebook.com/')) {
      const match = link.match(/facebook\.com\/([a-zA-Z0-9._-]+)/i);
      if (match) {
        const pageId = match[1];
        if (!['sharer', 'policies', 'dialog', 'login', 'groups', 'help', 'recover', 'pages'].includes(pageId.toLowerCase())) {
          facebook = `https://www.facebook.com/${pageId}/`;
          break;
        }
      }
    }
  }

  // 3. Extração de Telefones e E-mails dos textos
  const combinedText = instaData.text + ' ' + fbData.text;

  const foundEmails = combinedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  foundEmails.forEach(e => {
    const lower = e.toLowerCase();
    if (!lower.includes('duckduckgo') && !lower.includes('sentry') && !lower.includes('schema.org')) {
      emails.add(lower);
    }
  });

  const foundPhones = combinedText.match(/(?:\(?16\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/g) || [];
  foundPhones.forEach(p => phones.add(p.trim()));

  return {
    instagram,
    facebook,
    emails: Array.from(emails),
    telefones: Array.from(phones)
  };
}

module.exports = {
  huntSocials
};
