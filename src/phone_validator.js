/**
 * Validador Geográfico e Sanitizador Telefônico
 * - Filtra estritamente telefones pelo DDD da cidade pesquisada
 * - Detecta redes nacionais e franquias através da dispersão de múltiplos DDDs
 * - Sanitiza e formata números com limite saudável (1 WhatsApp + 1 Fixo local)
 */

const CITY_DDD_MAP = [
  { keywords: ['franca', 'ribeirao preto', 'batatais', 'patrocinio', 'cristais paulista', 'pedregulho', 'ituverava', 'orlandia', 'sao carlos', 'araraquara', 'sertaozinho'], ddd: '16' },
  { keywords: ['sao paulo', 'sp capital', 'guarulhos', 'osasco', 'abc', 'santo andre', 'sao bernardo'], ddd: '11' },
  { keywords: ['campinas', 'piracicaba', 'limeira', 'americana', 'indaiatuba'], ddd: '19' },
  { keywords: ['sao jose do rio preto', 'rio preto', 'catanduva', 'votuporanga', 'barretos'], ddd: '17' },
  { keywords: ['sorocaba', 'itu', 'tatui'], ddd: '15' },
  { keywords: ['santos', 'guaruja', 'praia grande', 'baixada santista'], ddd: '13' },
  { keywords: ['sao jose dos campos', 'taubate', 'jacarei', 'vale do paraiba'], ddd: '12' },
  { keywords: ['bauru', 'marilia', 'botucatu', 'jau'], ddd: '14' },
  { keywords: ['presidente prudente', 'aracatuba', 'assis'], ddd: '18' },
  { keywords: ['belo horizonte', 'bh', 'contagem', 'betim'], ddd: '31' },
  { keywords: ['uberlandia', 'uberaba', 'triangulo'], ddd: '34' },
  { keywords: ['rio de janeiro', 'rj capital', 'niteroi'], ddd: '21' },
  { keywords: ['curitiba', 'sao jose dos pinhais'], ddd: '41' }
];

/**
 * Obtém o DDD esperado para a cidade informada
 * @param {string} city
 * @returns {string} DDD padrão (default '16')
 */
function getExpectedDdd(city = '') {
  const norm = (city || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const entry of CITY_DDD_MAP) {
    if (entry.keywords.some(kw => norm.includes(kw))) {
      return entry.ddd;
    }
  }

  // Fallback padrão da base do Gabriel: Franca SP (DDD 16)
  return '16';
}

/**
 * Extrai e normaliza os dígitos de um número telefônico brasileiro
 * @param {string} phone
 * @param {string} expectedDdd
 * @returns {{ valid: boolean, ddd: string|null, number: string, fullDigits: string, isMobile: boolean }}
 */
function parseBrazilianPhone(phone, expectedDdd = '16') {
  if (!phone || typeof phone !== 'string') return { valid: false };

  const digits = phone.replace(/\D/g, '');

  // Rejeita padrões explícitos de ano/intervalo de datas (ex: 2021-2023, 2020-2024, 1990-2025)
  if (/^(?:19|20)\d{2}[-\s]?(?:19|20)\d{2}$/.test(phone.trim()) || /^(?:19|20)\d{2}(?:19|20)\d{2}$/.test(digits)) {
    return { valid: false };
  }

  // 1. Número com código de país 55 (12 ou 13 dígitos)
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    const ddd = digits.slice(2, 4);
    const num = digits.slice(4);
    const isMobile = num.length === 9 && num.startsWith('9');
    // Para fixos com DDD, exige início com [2-5]
    if (!isMobile && !/^[2-5]/.test(num)) return { valid: false };
    return {
      valid: true,
      ddd,
      number: num,
      fullDigits: digits,
      isMobile
    };
  }

  // 2. Número com DDD (10 ou 11 dígitos)
  if (digits.length === 10 || digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const num = digits.slice(2);
    const isMobile = num.length === 9 && num.startsWith('9');
    // Para fixos com DDD, exige início com [2-5]
    if (!isMobile && !/^[2-5]/.test(num)) return { valid: false };
    return {
      valid: true,
      ddd,
      number: num,
      fullDigits: '55' + digits,
      isMobile
    };
  }

  // 3. Número local sem DDD (8 ou 9 dígitos) -> Assume o DDD esperado da cidade
  if (digits.length === 8 || digits.length === 9) {
    const isMobile = digits.length === 9 && digits.startsWith('9');
    // Fixo local de 8 dígitos deve começar com [2-5] e não pode ser ano
    if (!isMobile) {
      if (!/^[2-5]/.test(digits)) return { valid: false };
      if (/^20[12]\d{5}$/.test(digits)) return { valid: false };
    }
    return {
      valid: true,
      ddd: expectedDdd,
      number: digits,
      fullDigits: '55' + expectedDdd + digits,
      isMobile
    };
  }

  return { valid: false };
}

/**
 * Formata um número em padrão nacional limpo: (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX
 */
function formatPhoneClean(parsed) {
  if (!parsed || !parsed.valid) return '';
  const d = parsed.ddd;
  const num = parsed.number;

  if (num.length === 9) {
    return `(${d}) ${num.slice(0, 5)}-${num.slice(5)}`;
  }
  if (num.length === 8) {
    return `(${d}) ${num.slice(0, 4)}-${num.slice(4)}`;
  }
  return num;
}

/**
 * Filtra e higieniza uma lista de telefones brutos, aplicando regras anti-franquia
 * @param {string[]} rawPhones
 * @param {string} city
 * @returns {{
 *   phones: string[],
 *   whatsappPrincipal: string|null,
 *   whatsappFormatado: string|null,
 *   isMultiRegionChain: boolean,
 *   detectedDdds: string[]
 * }}
 */
function sanitizePhonesForCity(rawPhones = [], city = 'Franca SP') {
  const expectedDdd = getExpectedDdd(city);
  const parsedList = [];
  const distinctDdds = new Set();

  rawPhones.forEach(p => {
    const parsed = parseBrazilianPhone(p, expectedDdd);
    if (parsed.valid) {
      parsedList.push(parsed);
      if (parsed.ddd) distinctDdds.add(parsed.ddd);
    }
  });

  // Gatilho Anti-Franquia: Se houver telefones de 3 ou mais DDDs diferentes no mesmo lead/site,
  // ou múltiplos DDDs de outros estados, trata-se de portal ou franquia nacional
  const isMultiRegionChain = distinctDdds.size >= 3 || (distinctDdds.size >= 2 && !distinctDdds.has(expectedDdd));

  // Filtra estritamente apenas números que pertencem ao DDD da cidade pesquisada
  const localPhones = parsedList.filter(p => p.ddd === expectedDdd);

  // Desduplica por número
  const seenNumbers = new Set();
  const uniqueLocal = [];
  localPhones.forEach(p => {
    if (!seenNumbers.has(p.number)) {
      seenNumbers.add(p.number);
      uniqueLocal.push(p);
    }
  });

  // Prioriza celulares (WhatsApp) primeiro, depois fixos
  const mobiles = uniqueLocal.filter(p => p.isMobile);
  const landlines = uniqueLocal.filter(p => !p.isMobile);

  let whatsappPrincipal = null;
  let whatsappFormatado = null;

  if (mobiles.length > 0) {
    whatsappPrincipal = mobiles[0].fullDigits;
    whatsappFormatado = formatPhoneClean(mobiles[0]);
  } else if (landlines.length > 0) {
    whatsappPrincipal = landlines[0].fullDigits;
    whatsappFormatado = formatPhoneClean(landlines[0]);
  }

  // Limita a no máximo 2 telefones no card (1 celular + 1 fixo, ou até 2 celulares)
  const finalPhonesList = [];
  if (mobiles[0]) finalPhonesList.push(formatPhoneClean(mobiles[0]));
  if (landlines[0]) finalPhonesList.push(formatPhoneClean(landlines[0]));
  else if (mobiles[1]) finalPhonesList.push(formatPhoneClean(mobiles[1]));

  return {
    phones: finalPhonesList,
    whatsappPrincipal,
    whatsappFormatado,
    isMultiRegionChain,
    detectedDdds: Array.from(distinctDdds)
  };
}

module.exports = {
  getExpectedDdd,
  parseBrazilianPhone,
  formatPhoneClean,
  sanitizePhonesForCity
};

