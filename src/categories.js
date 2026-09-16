/**
 * Catálogo e detector de Categorias de Negócio do Prospector
 * Mapeia nichos e nomes de estabelecimentos para categorias consolidadas e filtráveis
 */

const CATEGORIES = [
  {
    slug: 'pet_vet',
    nome: 'Pet & Veterinária',
    icone: '🐾',
    cor: '#059669',
    badgeClass: 'cat-pet',
    keywords: ['pet', 'vet', 'animal', 'banho e tosa', 'agropecuaria', 'cao', 'gato', 'cachorro', 'medcao', 'veterinaria']
  },
  {
    slug: 'odonto_saude',
    nome: 'Saúde & Odontologia',
    icone: '🩺',
    cor: '#0284c7',
    badgeClass: 'cat-health',
    keywords: ['odonto', 'dent', 'sorriso', 'implante', 'ortodontia', 'medica', 'estetica', 'fisioterapia', 'clinica', 'saude', 'consultorio', 'oftalmo', 'pediatra']
  },
  {
    slug: 'seguranca',
    nome: 'Segurança & CFTV',
    icone: '🛡️',
    cor: '#3b82f6',
    badgeClass: 'cat-security',
    keywords: ['seguranca', 'cerca', 'camera', 'alarme', 'cftv', 'portao', 'concertina', 'perimetral', 'monitoramento']
  },
  {
    slug: 'climatizacao',
    nome: 'Climatização & HVAC',
    icone: '❄️',
    cor: '#0ea5e9',
    badgeClass: 'cat-hvac',
    keywords: ['ar condicionado', 'refrigeracao', 'climatizacao', 'hvac', 'gelar', 'chiller', 'camara fria']
  },
  {
    slug: 'solar',
    nome: 'Energia Solar',
    icone: '☀️',
    cor: '#f59e0b',
    badgeClass: 'cat-solar',
    keywords: ['solar', 'fotovolt', 'placa solar', 'inversor', 'energia limpa']
  },
  {
    slug: 'auto_mecanica',
    nome: 'Automotivo & Mecânica',
    icone: '🚗',
    cor: '#ef4444',
    badgeClass: 'cat-auto',
    keywords: ['mecanica', 'auto', 'oficina', 'funilaria', 'pneu', 'reparacao', 'auto center', 'cambio', 'freio']
  }
];

/**
 * Determina a categoria de um lead com base em nicho e nome
 * @param {object} lead
 * @returns {{ slug: string, nome: string, icone: string, cor: string, badgeClass: string }}
 */
function getCategoryForLead(lead = {}) {
  const n = ((lead.nicho || '') + ' ' + (lead.nome || '')).toLowerCase();

  for (const cat of CATEGORIES) {
    if (cat.keywords.some(kw => n.includes(kw))) {
      return {
        slug: cat.slug,
        nome: cat.nome,
        icone: cat.icone,
        cor: cat.cor,
        badgeClass: cat.badgeClass
      };
    }
  }

  const cleanName = lead.nicho ? lead.nicho.charAt(0).toUpperCase() + lead.nicho.slice(1) : 'Geral';
  return {
    slug: 'outros',
    nome: cleanName,
    icone: '🏢',
    cor: '#64748b',
    badgeClass: 'cat-other'
  };
}

module.exports = {
  CATEGORIES,
  getCategoryForLead
};

