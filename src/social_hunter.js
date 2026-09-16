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
  // Se o handle possui termos explícitos de outros setores (ex: ferragens, imoveis, advocacia, restaurante)
  // e nem o nome da empresa nem o nicho contêm essa palavra, rejeita sumariamente o perfil!
  const industryKeywords = [
    'ferragens', 'imoveis', 'imobiliaria', 'advocacia', 'advogado', 'veiculos', 'motos',
    'restaurante', 'bar', 'pizzaria', 'hamburgueria', 'roupas', 'calcados', 'otica',
    'farmacia', 'drogaria', 'supermercado', 'padaria', 'hotel', 'pousada',
    'salao', 'barbearia', 'contabilidade', 'transportadora', 'madeireira', 'tintas'
  ];

  for (const kw of industryKeywords) {
    if (normHandle.includes(kw)) {
      if (!normCompany.includes(kw) && !normNiche.includes(kw)) {
        return false; // Rejeita falso positivo por setor industrial incompatível!
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
      return false; // Rejeita se o termo principal sequer existe no perfil
    }

    return true;
  }

  // 3. Se a empresa for composta apenas de termos comuns (ex: "Clínica Veterinária Franca")
  // Exige que pelo menos 2 palavras da empresa estejam no handle
  const matchedWords = companyWords.filter(w => normHandle.includes(w));
  return matchedWords.length >= 2;
}

async function querySearchEngines(query) {
  // 1. Tenta DuckDuckGo HTML
  try {
    const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8'
      }
    });

    if (res.ok) {
      const html = await res.text();
      if (!html.includes('challenge') && !html.includes('Anomaly')) {
        const $ = cheerio.load(html);
        const results = [];
        $('.result').each((_, el) => {
          let href = $(el).find('.result__url, .result__snippet, a.result__snippet').attr('href') || $(el).find('a.result__url').attr('href') || '';
          if (href.includes('uddg=')) {
            const m = href.match(/uddg=([^&"']+)/);
            if (m) {
              try { href = decodeURIComponent(m[1]); } catch (_) { href = m[1]; }
            }
          }
          const title = $(el).find('.result__title').text().trim();
          const snippet = $(el).find('.result__snippet').text().trim();
          results.push({ href, title, snippet });
        });
        if (results.length > 0) return results;
      }
    }
  } catch (_) {}

  return [];
}

/**
 * Caça criteriosa de Instagram e Facebook com validação de handle e título
 * @param {string} companyName
 * @param {string} city
 * @returns {Promise<{ instagram: string|null, facebook: string|null }>}
 */
async function huntSocials(companyName, city = 'Franca SP', niche = '') {
  let instagram = null;
  let facebook = null;

  const cleanName = companyName
    .replace(/Assistência Técnica/gi, '')
    .replace(/Instalação e Manutenção/gi, '')
    .replace(/Franca[- /]?SP/gi, '')
    .trim();

  // 1. Busca focada no Instagram
  try {
    const instaResults = await querySearchEngines(`${cleanName} ${city} instagram site:instagram.com`);
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
            // Valida se o handle tem afinidade real com o nome da empresa e nicho
            if (isHandleMatchingCompany(companyName, handle, item.title, niche)) {
              instagram = `https://www.instagram.com/${handle}/`;
              break;
            }
          }
        }
      }
    }
  } catch (_) {}

  // 2. Busca focada no Facebook
  try {
    const fbResults = await querySearchEngines(`${cleanName} ${city} facebook site:facebook.com`);
    for (const item of fbResults) {
      const link = item.href;
      if (link.includes('facebook.com/')) {
        const match = link.match(/facebook\.com\/([a-zA-Z0-9._-]+)/i);
        if (match) {
          const pageId = match[1];
          const blacklistedPages = [
            'sharer', 'policies', 'dialog', 'login', 'groups', 'help',
            'recover', 'pages', 'events', 'marketplace', 'watch'
          ];
          if (!blacklistedPages.includes(pageId.toLowerCase())) {
            if (isHandleMatchingCompany(companyName, pageId, item.title, niche)) {
              facebook = `https://www.facebook.com/${pageId}/`;
              break;
            }
          }
        }
      }
    }
  } catch (_) {}

  return {
    instagram,
    facebook
  };
}

module.exports = {
  isHandleMatchingCompany,
  huntSocials
};
