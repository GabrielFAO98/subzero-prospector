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
 * Extrai links de site institucional da bio do Instagram
 */
function extractWebsiteCandidateFromText(text) {
  if (!text) return null;
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

  const cityClean = (city || 'Franca SP')
    .split(/[\s,-]+/)[0]
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

  // Nome base sem termos comuns de cidade ou tipo societário
  const cleanName = companyOrUrl
    .replace(/Franca[- /]?SP/gi, '')
    .replace(/LTDA|ME|EPP|S\/A|CIA/gi, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

  // Nome compacto sem palavras de nicho genéricas
  const shortName = companyOrUrl
    .replace(/Energia Solar/gi, '')
    .replace(/Assistência Técnica|Assistencia Tecnica/gi, '')
    .replace(/Clínica|Clinica/gi, '')
    .replace(/Odontologia|Dentista/gi, '')
    .replace(/Segurança Eletrônica|Seguranca Eletronica/gi, '')
    .replace(/Ar Condicionado/gi, '')
    .replace(/Franca[- /]?SP/gi, '')
    .replace(/LTDA|ME|EPP|S\/A|CIA/gi, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

  const handleSet = new Set();
  if (foundHandle) {
    handleSet.add(foundHandle);
  } else {
    // Variantes com sufixo oficial (padrão mais comum no Brasil), cidade e nicho
    [shortName, cleanName].filter(Boolean).forEach(base => {
      handleSet.add(base);
      handleSet.add(base + 'oficial');
      handleSet.add(base + '_oficial');
      handleSet.add(base + '.oficial');
      handleSet.add(base + 'oficial_');
      handleSet.add(base + cityClean);
      handleSet.add(base + '_' + cityClean);
      handleSet.add(base + '.' + cityClean);
      handleSet.add(base + 'solar');
      handleSet.add(base + 'energiasolar');
    });
  }
  const candidateHandles = Array.from(handleSet);

  let bioText = '';
  let linkInBio = null;
  let whatsappFromBio = null;
  let websiteFromBio = null;

  let bestCandidate = null;
  let bestScore = -1;

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

        // Ignora perfis fantasmas com 0 seguidores e 0 posts
        if (
          (desc.includes('0 seguidores, seguindo 0, 0 posts') || desc.includes('0 followers, 0 following, 0 posts')) &&
          !title.toLowerCase().includes(cityClean)
        ) {
          continue;
        }

        if (desc.includes('seguidores') || desc.includes('followers') || desc.includes('posts')) {
          let score = 1;
          const combined = (title + ' ' + desc).toLowerCase();
          if (cityClean && combined.includes(cityClean)) score += 10;
          if (combined.includes('franca')) score += 10;
          if (combined.includes('solar') || combined.includes('energia')) score += 5;
          if (h.includes('oficial')) score += 3;

          const postsMatch = desc.match(/([0-9.,]+)\s*posts/i);
          if (postsMatch) {
            const pCount = parseInt(postsMatch[1].replace(/\D/g, '')) || 0;
            if (pCount > 5) score += 5;
          }

          if (score > bestScore) {
            bestScore = score;
            bestCandidate = { handle: h, title, desc };
            // Se achou o perfil com a cidade na bio ou título e posts, match imediato de alta precisão
            if (score >= 15) break;
          }
        }
      }
    } catch (_) {}
  }

  if (bestCandidate) {
    foundHandle = bestCandidate.handle;
  }

  // Se achou o handle via candidate ou já tinha
  if (foundHandle) {
    const igUrl = `https://www.instagram.com/${foundHandle}/`;
    
    // Busca profunda com Playwright no perfil para pegar a bio e os links exatos
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

        return { text, waLinks, externalWebsites };
      });

      bioText = pageData.text;
      if (pageData.externalWebsites && pageData.externalWebsites.length > 0) {
        websiteFromBio = pageData.externalWebsites[0];
      }

      // Varredura profunda de wa.me no código da página para perfis com links múltiplos
      const fullHtml = await page.content();
      const allWaMatches = (fullHtml.match(/wa\.me\/[0-9]+/gi) || [])
        .map(m => m.replace(/wa\.me\//i, ''));

      // Se achou números wa.me
      if (allWaMatches.length > 0) {
        // Se a cidade for Franca (DDD 16), prioriza o que tiver 16
        const ddd16Match = allWaMatches.find(num => num.startsWith('16'));
        const chosen = ddd16Match || allWaMatches[0];
        let cleanNum = chosen.replace(/\D/g, '');
        if (!cleanNum.startsWith('55')) cleanNum = '55' + cleanNum;
        whatsappFromBio = cleanNum;
        linkInBio = `https://wa.me/${cleanNum.replace(/^55/, '')}`;
      } else if (pageData.waLinks && pageData.waLinks.length > 0) {
        linkInBio = pageData.waLinks[0];
        const resolvedPhone = await resolveWaLink(linkInBio);
        if (resolvedPhone) {
          whatsappFromBio = resolvedPhone;
        }
      }

      // Se não achou website em links diretos do header, procura por texto na bio
      if (!websiteFromBio) {
        websiteFromBio = extractWebsiteCandidateFromText(bioText);
      }

      // Se ainda não achou telefone, tenta achar telefone escrito no texto da bio
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
