const cheerio = require(require('path').join(process.cwd(), 'node_modules', 'cheerio'));

/**
 * Desdobra encurtadores de WhatsApp (wa.link, bit.ly, etc.) para o número real
 */
async function resolveWaLink(link) {
  if (!link) return null;
  let targetUrl = link;

  // Se for wrapper do Instagram (l.instagram.com/?u=...)
  if (targetUrl.includes('l.instagram.com') || targetUrl.includes('?u=')) {
    const uMatch = targetUrl.match(/[?&]u=([^&]+)/);
    if (uMatch) {
      try { targetUrl = decodeURIComponent(uMatch[1]); } catch (_) {}
    }
  }

  try {
    if (targetUrl.includes('wa.me/')) {
      const m = targetUrl.match(/wa\.me\/([0-9]+)/);
      if (m) return m[1];
    }
    if (targetUrl.includes('phone=')) {
      const m = targetUrl.match(/phone=([0-9]+)/);
      if (m) return m[1];
    }
    // Encurtador: resolve redirect (wa.link, bit.ly, etc.)
    const res = await fetch(targetUrl, { method: 'GET', redirect: 'follow' });
    const finalUrl = res.url || '';
    if (finalUrl.includes('phone=')) {
      const m = finalUrl.match(/phone=([0-9]+)/);
      if (m) return m[1];
    }
    if (finalUrl.includes('wa.me/')) {
      const m = finalUrl.match(/wa\.me\/([0-9]+)/);
      if (m) return m[1];
    }
  } catch (_) {}
  return null;
}

/**
 * Caça profunda de perfil do Instagram e extração de Bio + WhatsApp da Bio
 */
async function huntInstagramBio(companyOrUrl, city = 'Franca SP', knownInstagramUrl = null) {
  let foundHandle = null;

  // 1. Se já recebemos uma URL direta ou handle
  const rawInput = knownInstagramUrl || companyOrUrl || '';
  if (rawInput.includes('instagram.com/') || rawInput.startsWith('@')) {
    const clean = rawInput.replace(/https?:\/\/(www\.)?instagram\.com\//, '').replace(/^@/, '').split('/')[0].split('?')[0];
    if (clean && clean.length > 1) {
      foundHandle = clean;
    }
  }

  const cleanName = companyOrUrl
    .replace(/Clínica/gi, '')
    .replace(/Assistência Técnica/gi, '')
    .replace(/Franca[- /]?SP/gi, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

  const candidateHandles = foundHandle ? [] : [
    cleanName,
    'clinica' + cleanName,
    cleanName + 'franca',
    cleanName + '_franca',
    cleanName + '.franca',
    'clinica.' + cleanName
  ];

  let bioText = '';
  let linkInBio = null;
  let whatsappFromBio = null;

  for (const h of candidateHandles) {
    try {
      const res = await fetch(`https://www.instagram.com/${h}/`, {
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          'Accept-Language': 'pt-BR,pt;q=0.9'
        }
      });

      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);
        const title = $('meta[property="og:title"]').attr('content') || '';
        const desc = $('meta[property="og:description"]').attr('content') || '';

        // Se tem seguidores/posts na descrição, perfil existe!
        if (desc.includes('seguidores') || desc.includes('followers') || desc.includes('posts')) {
          foundHandle = h;
          break;
        }
      }
    } catch (_) {}
  }

  // Se achou o handle via candidate ou já tinha
  if (foundHandle) {
    const igUrl = `https://www.instagram.com/${foundHandle}/`;
    
    // Busca profunda com Playwright no perfil para pegar a bio e o link exato
    const { chromium } = require(require('path').join(process.cwd(), 'node_modules', 'playwright'));
    let browser = null;
    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(igUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000);

      const pageData = await page.evaluate(() => {
        const header = document.querySelector('header') || document.body;
        const text = header.innerText || '';
        
        // Procura links externos na bio
        const links = Array.from(header.querySelectorAll('a[href]')).map(a => a.href);
        const waLink = links.find(l => 
          l.includes('wa.link') || 
          l.includes('wa.me') || 
          l.includes('whatsapp.com') || 
          l.includes('linktr.ee') || 
          l.includes('beacons.ai')
        );

        return { text, waLink };
      });

      bioText = pageData.text;
      linkInBio = pageData.waLink;

      if (linkInBio) {
        const resolvedPhone = await resolveWaLink(linkInBio);
        if (resolvedPhone) {
          whatsappFromBio = resolvedPhone;
        }
      }

      // Se não achou link, tenta achar telefone escrito na bio
      if (!whatsappFromBio) {
        const phoneMatch = bioText.match(/(?:\(?([1-9]{2})\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/);
        if (phoneMatch) {
          let num = phoneMatch[0].replace(/\D/g, '');
          if (num.length === 11) num = '55' + num;
          else if (num.length === 9) num = '5516' + num;
          else if (num.length === 8) num = '5516' + num;
          whatsappFromBio = num;
        }
      }

      await browser.close();
    } catch (err) {
      if (browser) await browser.close();
    }

    return {
      instagram: igUrl,
      handle: foundHandle,
      bioText,
      linkInBio,
      whatsappFromBio
    };
  }

  return { instagram: null, handle: null, bioText: '', linkInBio: null, whatsappFromBio: null };
}

module.exports = {
  huntInstagramBio,
  resolveWaLink
};
