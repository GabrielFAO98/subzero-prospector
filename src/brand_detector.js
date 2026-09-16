/**
 * Detector de Grandes Redes Nacionais, Franquias e Verificador Ativo de Domínios
 */

const { cleanAndNormalizeUrl } = require('./url_cleaner');

const KNOWN_NATIONAL_BRANDS = [
  // Pet & Veterinária
  'cobasi', 'petz', 'petlove', 'doghero', 'polipet', 'centauro dos bichos', 'petland', '100% pet',
  
  // Farmácias & Saúde
  'droga raia', 'drogasil', 'pague menos', 'farmacia sao paulo', 'ultrafarma', 'drogarias pacheco',
  'panvel', 'farmacias nissei', 'bifarma', 'drogaria araujo',
  
  // Alimentação & Fast Food
  'mcdonald', 'burger king', 'subway', 'cacau show', 'kopenhagen', 'habib', 'domino', 'bob\'s',
  'giraffas', 'spoleto', 'outback', 'madalosso', 'madero', 'jeronymo', 'pizza hut', 'starbucks', 'kfc', 'china in box',
  
  // Varejo, Supermercados & Magazines
  'magazine luiza', 'magalu', 'casas bahia', 'ponto frio', 'lojas americanas', 'leroy merlin', 'kalunga',
  'carrefour', 'pao de acucar', 'assai', 'atacadao', 'havan', 'telhanorte', 'c&c', 'marabraz',
  'riachuelo', 'renner', 'c&a', 'pernambucanas',
  
  // Franquias Odontológicas, Médicas & Estética Massiva
  'odontocompany', 'sorridents', 'amorsaude', 'orthopride', 'espacolaser', 'oral sin', 'oral unic',
  'odonto excellence', 'dr consulta', 'doutor consulta', 'botoclinic', 'laser fast',
  
  // Automotivo, Locadoras & Seguradoras
  'porto seguro', 'localiza', 'movida', 'unidas', 'autozone', 'auto zone', 'dellavia', 'campneus', 'dpaschoal',
  
  // Academias & Cursos
  'smart fit', 'bluefit', 'skyfit', 'wizard', 'cna', 'fisk', 'kumon'
];

/**
 * Identifica se o estabelecimento é uma grande rede ou franquia nacional
 * @param {string} name
 * @param {string|null} websiteUrl
 * @returns {boolean}
 */
function isNationalBrand(name, websiteUrl = null) {
  if (!name) return false;
  const normName = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Checagem por nome conhecido com fronteira de palavras
  const matchedBrand = KNOWN_NATIONAL_BRANDS.find(b => {
    const regex = new RegExp(`(^|\\s|[-_])${b}(\\s|[-_]|$)`, 'i');
    return regex.test(normName);
  });

  if (matchedBrand) return true;

  // 2. Checagem por domínio de rede conhecida (mínimo 3 caracteres para evitar falsos positivos)
  if (websiteUrl) {
    const normUrl = (cleanAndNormalizeUrl(websiteUrl).domain || websiteUrl.toLowerCase()).replace(/[^a-z0-9.]/g, '');
    if (KNOWN_NATIONAL_BRANDS.some(b => {
      const brandClean = b.replace(/[^a-z0-9]/g, '');
      if (brandClean.length < 3) return false; // Impede que siglas curtas como 'c&a' (ca) casem com 'seguranca'
      return normUrl.includes(brandClean);
    })) {
      return true;
    }
  }

  return false;
}

/**
 * Quando o Google Maps oculta o botão de website, faz sondagem rápida do domínio oficial
 * @param {string} companyName
 * @returns {Promise<string|null>}
 */
async function probeBrandWebsite(companyName) {
  if (!companyName) return null;

  const clean = companyName
    .replace(/Clínica/gi, '')
    .replace(/Veterinária/gi, '')
    .replace(/Pet\s*Shop/gi, '')
    .replace(/Assistência Técnica/gi, '')
    .replace(/Franca[- /]?SP/gi, '')
    .replace(/Centro/gi, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();

  const words = clean.split(/\s+/).filter(w => w.length >= 3);
  if (words.length === 0) return null;

  const candidates = [];
  // Ex: "Vet Franca" -> "vetfranca", "Cobasi" -> "cobasi"
  if (words.length === 1) {
    candidates.push(words[0].toLowerCase());
  } else {
    candidates.push((words[0] + words[1]).toLowerCase());
    candidates.push(words[0].toLowerCase());
  }

  const cheerio = require('cheerio');

  for (const c of candidates) {
    // Pula se for palavra genérica demais
    if (['pet', 'vet', 'shop', 'agro', 'clinica', 'auto'].includes(c)) continue;

    const urlsToTry = [
      `https://www.${c}.com.br`,
      `https://${c}.com.br`
    ];

    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(3000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept-Language': 'pt-BR,pt;q=0.9'
          }
        });

        if (res.ok) {
          const html = await res.text();
          const $ = cheerio.load(html);
          const pageTitle = $('title').text() || '';
          const bodyText = $('body').text().slice(0, 1500);

          // Verifica se o conteúdo do site realmente tem a ver com a empresa
          const firstWord = words[0].toLowerCase();
          if (pageTitle.toLowerCase().includes(firstWord) || bodyText.toLowerCase().includes(firstWord)) {
            return res.url || url;
          }
        }
      } catch (_) {}
    }
  }

  return null;
}

module.exports = {
  KNOWN_NATIONAL_BRANDS,
  isNationalBrand,
  probeBrandWebsite
};
