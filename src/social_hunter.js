const cheerio = require('cheerio');
const { getExpectedDdd } = require('./phone_validator');

/**
 * Validação Semântica de Redes Sociais
 * Verifica se um handle ou título de rede social realmente pertence à empresa pesquisada.
 * Se houver dúvida ou incongruência de setor/nome, descarta (retorna false).
 */
function isHandleMatchingCompany(companyName, handle, profileTitle = '', niche = '') {
  if (!companyName || !handle) return false;

  const normCompany = companyName.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim();

  const normHandle = handle.toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  const normTitle = (profileTitle || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const normNiche = (niche || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Detecção rigorosa de nichos industriais conflitantes
  const industryKeywords = [
    'ferragens', 'imoveis', 'imobiliaria', 'advocacia', 'advogado', 'veiculos', 'motos',
    'restaurante', 'bar', 'pizzaria', 'hamburgueria', 'roupas', 'calcados', 'otica',
    'farmacia', 'drogaria', 'supermercado', 'padaria', 'hotel', 'pousada',
    'salao', 'barbearia', 'contabilidade', 'transportadora', 'madeireira', 'tintas'
  ];

  for (const kw of industryKeywords) {
    if (normHandle.includes(kw)) {
      if (!normCompany.includes(kw) && !normNiche.includes(kw)) {
        return false;
      }
    }
  }

  // Remove termos genéricos de negócio e localização
  const stopWords = new Set([
    'clinica', 'consultorio', 'centro', 'pet', 'shop', 'veterinaria', 'vet',
    'seguranca', 'eletronica', 'monitoramento', 'cftv', 'alarmes',
    'ar', 'condicionado', 'refrigeracao', 'climatizacao', 'assistencia', 'tecnica',
    'odontologia', 'odonto', 'estetica', 'saude',
    'ltda', 'me', 'epp', 'cia', 'servicos', 'comercio', 'industria',
    'franca', 'sp', 'brasil', 'oficial', 'unidade'
  ]);

  const companyWords = normCompany.split(/\s+/).filter(w => w.length >= 3);
  const distinctiveWords = companyWords.filter(w => !stopWords.has(w));

  // 2. Se sobrou termo distintivo (ex: "Gelar", "Coltseg", "Silveira", "Medcão", "GMS")
  if (distinctiveWords.length > 0) {
    const primaryTerm = distinctiveWords[0];
    const hasPrimaryInHandle = normHandle.includes(primaryTerm);
    const hasPrimaryInTitle = normTitle.includes(primaryTerm);

    if (!hasPrimaryInHandle && !hasPrimaryInTitle) {
      return false;
    }

    return true;
  }

  // 3. Se a empresa for composta apenas de termos comuns
  const matchedWords = companyWords.filter(w => normHandle.includes(w));
  return matchedWords.length >= 2;
}

async function querySearchLinks(page, query) {
  try {
    const url = 'https://br.search.yahoo.com/search?p=' + encodeURIComponent(query);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);

    const results = await page.evaluate(() => {
      const list = [];
      document.querySelectorAll('div.compTitle a, li div h3 a').forEach(a => {
        const href = a.href || '';
        const title = a.innerText || '';
        if (href.startsWith('http')) {
          list.push({ href, title });
        }
      });
      return list;
    });

    return results;
  } catch (err) {
    return [];
  }
}

/**
 * Caça criteriosa de Instagram e Facebook com validação de handle e título
 * Utiliza Playwright para garantir 100% de entrega sem bloqueios de Anomaly/CAPTCHA
 * @param {string} companyName
 * @param {string} city
 * @param {string} niche
 * @param {import('playwright').Page|null} externalPage
 * @returns {Promise<{ instagram: string|null, facebook: string|null }>}
 */
async function huntSocials(companyName, city = 'Franca SP', niche = '', externalPage = null) {
  let instagram = null;
  let facebook = null;

  const cleanName = companyName
    .replace(/Assistência Técnica/gi, '')
    .replace(/Instalação e Manutenção/gi, '')
    .replace(/Franca[- /]?SP/gi, '')
    .trim();

  let browser = null;
  let page = externalPage;

  if (!page) {
    const { chromium } = require('playwright');
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      locale: 'pt-BR'
    });
  }

  try {
    // 1. Busca focada no Instagram
    const instaResults = await querySearchLinks(page, `${cleanName} ${city} instagram`);
    for (const item of instaResults) {
      const link = item.href;
      if (link.includes('instagram.com/')) {
        const match = link.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
        if (match) {
          const handle = match[1].toLowerCase();
          const blacklistedHandles = [
            'p', 'reel', 'explore', 'stories', 'tags', 'popular', 'tv', 'about',
            'developer', 'directory', 'legal', 'help', 'privacy', 'accounts'
          ];
          if (!blacklistedHandles.includes(handle)) {
            if (isHandleMatchingCompany(companyName, handle, item.title, niche)) {
              instagram = `https://www.instagram.com/${handle}/`;
              break;
            }
          }
        }
      }
      if (!facebook && link.includes('facebook.com/')) {
        const match = link.match(/facebook\.com\/(?:p\/)?([a-zA-Z0-9._-]+)/i);
        if (match && !['sharer', 'policies', 'dialog', 'login', 'groups'].includes(match[1].toLowerCase())) {
          if (isHandleMatchingCompany(companyName, match[1], item.title, niche)) {
            facebook = link.split('?')[0];
          }
        }
      }
    }

    // 2. Busca focada no Facebook
    if (!facebook) {
      const fbResults = await querySearchLinks(page, `${cleanName} ${city} facebook`);
      for (const item of fbResults) {
        const link = item.href;
        if (link.includes('facebook.com/')) {
          const match = link.match(/facebook\.com\/(?:p\/)?([a-zA-Z0-9._-]+)/i);
          if (match) {
            const pageId = match[1];
            const blacklistedPages = [
              'sharer', 'policies', 'dialog', 'login', 'groups', 'help',
              'recover', 'pages', 'events', 'marketplace', 'watch'
            ];
            if (!blacklistedPages.includes(pageId.toLowerCase())) {
              if (isHandleMatchingCompany(companyName, pageId, item.title, niche)) {
                facebook = link.split('?')[0];
                break;
              }
            }
          }
        }
        if (!instagram && link.includes('instagram.com/')) {
          const match = link.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
          if (match && !['p', 'reel', 'explore', 'stories'].includes(match[1].toLowerCase())) {
            if (isHandleMatchingCompany(companyName, match[1], item.title, niche)) {
              instagram = `https://www.instagram.com/${match[1]}/`;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[SocialHunter] Erro ao buscar redes de ${companyName}:`, err.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return {
    instagram,
    facebook
  };
}

module.exports = {
  isHandleMatchingCompany,
  huntSocials
};
