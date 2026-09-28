/**
 * Utilitário de Limpeza e Humanização de Nomes de Empresas
 * Remove keyword stuffing de SEO do Google Maps, cidades, sufixos jurídicos e formata em Title Case elegante.
 */

const KNOWN_ACRONYMS = new Set([
  'CFTV', 'PMOC', 'ART', 'WEG', '3D', 'GMS', 'IP', 'TI', 'MEI', 'EPP', 'LTDA', 'EIRELI', 'AC', 'DJ'
]);

function cleanCompanyName(raw = '', niche = '') {
  let name = (raw || '').trim();
  if (!name) return '';

  // 1. Remove cidade e UF no final (Franca SP, Franca, em Franca SP, Centro Franca, Franca/SP, etc.)
  name = name.replace(/\s*(?:[-–—|/•,]\s*)?(?:em\s+)?(?:franca|sp|franca\s*[-/]?\s*sp|centro\s+franca|franca\s+centro)\s*$/i, '');
  name = name.replace(/\s+(?:em\s+)?franca(?:\s*[-/]?\s*sp)?$/i, '');
  name = name.replace(/\s+(?:franca\s*\/sp|franca\s*centro|centro\s*franca)$/i, '');

  // 2. Separadores comuns de título no Google Maps (ex: 'Empresa | Serviços', 'Empresa - Subtítulo', 'Empresa • Descrição')
  for (const sep of [' | ', ' - ', ' – ', ' — ', ' / ', ' • ', ' · ', ' : ']) {
    if (name.includes(sep)) {
      const parts = name.split(sep);
      if (parts[0].trim().length >= 3) {
        name = parts[0].trim();
        break;
      }
    }
  }

  // 3. Caso especial: Profissionais liberais com palavras-chave de busca (ex: LEANDRO FREITAS ARQUITETO ENGENHEIRO CIVIL)
  const profMatch = name.match(/^([A-Za-zÀ-ÖØ-öø-ÿ\s]{4,30}?)\s+(?:arquiteto|arquiteta|engenheiro|engenheira)\b(.*)$/i);
  if (profMatch) {
    const personName = profMatch[1].trim().toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const rest = (profMatch[0]).toLowerCase();
    const hasArq = rest.includes('arquit');
    const hasEng = rest.includes('engenh');
    if (hasArq && hasEng) {
      name = personName + ' | Arquitetura & Engenharia';
    } else if (hasArq) {
      name = personName + ' | Arquitetura';
    } else if (hasEng) {
      name = personName + ' | Engenharia Civil';
    }
  }

  // 4. Caso especial: Médicos / Dentistas com título inicial
  const docMatch = name.match(/^((?:Dra?\.?|Dr\.)\s+[A-Za-zÀ-ÖØ-öø-ÿ\s]{4,30}?)\s+(?:cirurgi[aã]|dentista|m[eé]dic[ao])\b/i);
  if (docMatch) {
    name = docMatch[1].trim().toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // 5. Poda Inteligente de Keyword Stuffing (acumulação de termos de SEO sem separador)
  const keywordCutoffs = [
    // Estética, Beleza e Saúde
    /(?:\b|\s)(?:limpeza(?:\s+de)?\s+pele|peeling|massagem|criofrequ[eê]ncia|flacidez|gordura(?:\s+localizada)?|enzimas|celulite|depila[cç][aã]o|drenagem|botox|harmoniza[cç][aã]o|emagrecimento|est[eé]tica\s+facial|est[eé]tica\s+corporal|microagulhamento|preenchimento)\b.*/i,
    // Climatização e Refrigeração
    /(?:\b|\s)(?:instala[cç][aã]o(?:\s+e\s+manuten[cç][aã]o)?|manuten[cç][aã]o|higieniza[cç][aã]o|conserto|reparo|assist[eê]ncia(?:\s+t[eé]cnica)?|pmoc|vendas?|pe[cç]as)\b.*/i,
    // Segurança Eletrônica
    /(?:\b|\s)(?:c[aâ]meras(?:\\s+cftv)?|cftv|alarmes?|cercas?(?:\\s+el[eé]tricas?)?|concertinas?|motores?|port[aã]o(?:\\s+eletr[oô]nico)?|interfones?)\b.*/i,
    // Engenharia e Solar
    /(?:\b|\s)(?:engenheiro(?:\\s+civil)?|arquiteto|constru[cç][aã]o(?:\\s+civil)?|reformas?|laudos?|per[ií]cias?|fotovoltaic[ao]|energia\s+solar)\b.*/i,
    // Pet & Veterinária
    /(?:\b|\s)(?:banho\s+e\s+tosa|tosa|consultas?\s+veterin[aá]rias?)\b.*/i
  ];

  for (const regex of keywordCutoffs) {
    const idx = name.search(regex);
    // Só corta se a porção anterior tiver pelo menos 3 caracteres
    if (idx > 3) {
      name = name.slice(0, idx).trim();
      break;
    }
  }

  // 6. Remove pontuações e conjunções soltas no final após cortes (ex: 'Saúde Vet e', 'Empresa -')
  let prev;
  do {
    prev = name;
    name = name.replace(/\s*(?:[-–—|/•,.:;]|\s+e\b|\s+&\b|\s+em\b|\s+com\b|\s+de\b|\s+da\b|\s+do\b)\s*$/i, '').trim();
  } while (name !== prev);

  // 7. Remove sufixos jurídicos e de horário
  name = name.replace(/\s+(?:ltda|epp|me|s\/a|eireli|s\.a\.)\b.*/i, '');
  name = name.replace(/\s+24\s*(?:h(?:oras?|rs?)?)$/i, '');

  // 8. Formatação Title Case elegante
  const preps = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'com', '&', 'a']);
  const words = name.split(/\s+/).filter(Boolean);

  const isAllCaps = name === name.toUpperCase() && /[A-Z]/.test(name);
  if (isAllCaps || words.length > 2) {
    name = words.map((w, i) => {
      const upper = w.toUpperCase();
      const lower = w.toLowerCase();
      if (i > 0 && preps.has(lower)) return lower;
      // Trata caso especial de Ar condicionado
      if (lower === 'ar') return 'Ar';
      // Preserva siglas genuínas conhecidas
      if (KNOWN_ACRONYMS.has(upper)) return upper;
      // Se não for todo em maiúsculas originalmente, preserva maiúsculas internas (ex: MobTech, Triad)
      if (!isAllCaps && w.length >= 2 && w.slice(1).match(/[A-Z]/)) return w;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join(' ');
  }

  return name.trim();
}

module.exports = {
  cleanCompanyName
};
