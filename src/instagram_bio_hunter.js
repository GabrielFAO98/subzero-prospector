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
 * Extrai links de site institucional e WhatsApp da bio do Instagram
 */
function extractWebsiteCandidateFromText(text) {
  if (!text) return null;
  // Regex para domínios comuns brasileiros e globais
  const domainRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:com\.br|com|net|org|tech|solar|ind\.br|adv\.br|med\.br|app|site|online|store|co)(?:\/[^\s\n]*)?)/gi;
  const matches = text.match(domainRegex);
  if (!matches) return null;

  for (const m of matches) {
    const candidate = m.trim().replace(/[.,;:)]+$/, '');
    const lower = candidate.toLowerCase();
    if (
      !lower.includes('instagram.com') &&
      !lower.includes('facebook.com') &&
      !lower.includes('whatsapp.com') &&
      !lower.includes('wa.me') &&
      !lower.includes('linktr.ee') &&
      !lower.includes('beacons.ai') &&
      !lower.includes('bit.ly') &&
      !lower.includes('meta.ai') &&
      !lower.includes('threads.net')
    ) {
      return candidate.startsWith('http://') || candidate.startsWith('https://')
        ? candidate
        : 'https://' + candidate;
    }
  }
  return null;
}

/**
 * Caça profunda de perfil do Instagram e extração de Bio + WhatsApp + Website da Bio
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
    .replace(/Energia Solar/gi, '')
    .replace(/Franca[- /]?SP/gi, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

  const candidateHandles = foundHandle ? [] : [
    cleanName,
    cleanName + 'solar',
    cleanName + 'energiasolar',
    'clinica' + cleanName,
    cleanName + 'franca',
    cleanName + '_franca',
    cleanName + '.franca',
    'clinica.' + cleanName
  ];

  let bioText = '';
  let linkInBio = null;
  let whatsappFromBio = null;
  let websiteFromBio = null;

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
          // Tenta extrair site da descrição caso o Playwright não consiga rodar
          const siteCandidate = extractWebsiteCandidateFromText(desc);
          if (siteCandidate) websiteFromBio = siteCandidate;
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
        const header = document.querySelector('header') || document.querySelector('main section') || document.body;
        const text = header.innerText || '';
        
        // Procura links na bio / header
        const rawLinks = Array.from(header.querySelectorAll('a[href]')).map(a => ({
          href: a.href,
          text: a.innerText ? a.innerText.trim() : ''
        }));

        let waLinks = [];
        let externalWebsites = [];

        rawLinks.forEach(l => {
          let target = l.href;
          if (target.includes('l.instagram.com') || target.includes('?u=')) {
            const m = target.match(/[?&]u=([^&]+)/);
            if (m) {
              try { target = decodeURIComponent(m[1]); } catch (_) {}
            }
          }

          const lower = target.toLowerCase();
          if (
            lower.includes('wa.link') || 
            lower.includes('wa.me') || 
            lower.includes('whatsapp.com') || 
            lower.includes('linktr.ee') || 
            lower.includes('beacons.ai')
          ) {
            waLinks.push(target);
          } else if (
            !lower.includes('instagram.com') && 
            !lower.includes('facebook.com') && 
            !lower.includes('meta.com') && 
            !lower.includes('threads.net') && 
            !lower.includes('threads.com') && 
            !lower.includes('google.com') && 
            !lower.includes('apple.com') && 
            !lower.includes('meta.ai') && 
            !lower.includes('muse.ai') && 
            !lower.includes('/accounts/') &&
            !lower.includes('/legal/') &&
            (lower.startsWith('http://') || lower.startsWith('https://'))
          ) {
            externalWebsites.push(target);
          }
        });

        return { text, waLink: waLinks[0] || null, externalWebsites };
      });

      bioText = pageData.text;
      linkInBio = pageData.waLink;
      if (pageData.externalWebsites && pageData.externalWebsites.length > 0) {
        websiteFromBio = pageData.externalWebsites[0];
      }

      // Se não achou website em links diretos do header, procura por texto na bio
      if (!websiteFromBio) {
        websiteFromBio = extractWebsiteCandidateFromText(bioText);
      }

      if (linkInBio) {
        const resolvedPhone = await resolveWaLink(linkInBio);
        if (resolvedPhone) {
          whatsappFromBio = resolvedPhone;
        }
      }

      // Se não achou link de WhatsApp, tenta achar telefone escrito na bio
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
      whatsappFromBio,
      websiteFromBio
    };
  }

  return { instagram: null, handle: null, bioText: '', linkInBio: null, whatsappFromBio: null, websiteFromBio: null };
}

module.exports = {
  huntInstagramBio,
  resolveWaLink
};
