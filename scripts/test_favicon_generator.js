const fs = require('fs');
const path = require('path');

function generateFaviconSvg(lead, cleanCompanyName, archetype) {
  const name = cleanCompanyName || (lead && lead.nome) || 'Empresa';
  const initial = name.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase() || 'S';
  const niche = ((lead && lead.nicho) || '').toLowerCase();
  const nameLower = name.toLowerCase();

  // 1. Detect category archetype
  const isSecurity = niche.includes('seguran') || niche.includes('cftv') || niche.includes('cerca') || niche.includes('alarme') || nameLower.includes('seguran') || nameLower.includes('blitz') || nameLower.includes('coltseg');
  const isClimate = niche.includes('ar condicionado') || niche.includes('climatiz') || niche.includes('refrigera') || nameLower.includes('gelar') || nameLower.includes('ecol');
  const isVet = niche.includes('vet') || niche.includes('pet') || niche.includes('animal') || nameLower.includes('vet') || nameLower.includes('pet');
  const isDental = niche.includes('odont') || niche.includes('dent') || niche.includes('sorriso') || nameLower.includes('odonto');
  const isWholesale = niche.includes('distribuid') || niche.includes('atacado') || nameLower.includes('distribuidora') || nameLower.includes('kell');

  if (isSecurity && !isWholesale) {
    // High-impact Security Shield with Lightning / Protection
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="secBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060d1d"/>
      <stop offset="100%" stop-color="#0b1733"/>
    </linearGradient>
    <linearGradient id="secShield" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="secGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#00f0ff"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="15" fill="url(#secBg)"/>
  <rect x="1.5" y="1.5" width="61" height="61" rx="13.5" fill="none" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.5"/>
  
  <!-- Outer Shield -->
  <path d="M32 12 L48 18 v14 c0 11.5 -8.5 20 -16 23 c-7.5 -3 -16 -11.5 -16 -23 V18 Z" fill="url(#secShield)" stroke="#38bdf8" stroke-width="1.5"/>
  
  <!-- Lightning Bolt Symbol -->
  <path d="M34 20 L24 33 h7 l-3 12 l12 -14 h-7 l4 -11 Z" fill="url(#secGlow)"/>
</svg>`;
  }

  if (isWholesale) {
    // High-tech B2B Monogram with Tech Cyan & Amber Gold
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="whlBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070f22"/>
      <stop offset="100%" stop-color="#0e1d3d"/>
    </linearGradient>
    <linearGradient id="whlCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <linearGradient id="whlGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="15" fill="url(#whlBg)"/>
  <rect x="1.5" y="1.5" width="61" height="61" rx="13.5" fill="none" stroke="rgba(6, 182, 212, 0.35)" stroke-width="1.5"/>
  
  <!-- Geometric Bold Monogram Initial -->
  <text x="32" y="44" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="34" font-weight="900" text-anchor="middle" fill="url(#whlCyan)">${initial}</text>
  
  <!-- Tech Accent Indicator -->
  <circle cx="48" cy="18" r="4" fill="url(#whlGold)"/>
  <circle cx="48" cy="18" r="7" fill="none" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.5"/>
</svg>`;
  }

  if (isClimate) {
    // Stylized Cooling Frost / Air Wave
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="climBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#081329"/>
      <stop offset="100%" stop-color="#102142"/>
    </linearGradient>
    <linearGradient id="climCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="15" fill="url(#climBg)"/>
  <rect x="1.5" y="1.5" width="61" height="61" rx="13.5" fill="none" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.5"/>
  
  <!-- Monogram with Cool Wind Swoosh -->
  <text x="32" y="44" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="34" font-weight="900" text-anchor="middle" fill="#ffffff">${initial}</text>
  <path d="M16 50 Q 32 46 48 50" stroke="url(#climCyan)" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>`;
  }

  if (isVet) {
    // Warm Emerald / Teal Paw + Care Monogram
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="vetBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06281e"/>
      <stop offset="100%" stop-color="#0d4734"/>
    </linearGradient>
    <linearGradient id="vetEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="15" fill="url(#vetBg)"/>
  <rect x="1.5" y="1.5" width="61" height="61" rx="13.5" fill="none" stroke="rgba(52, 211, 153, 0.35)" stroke-width="1.5"/>
  
  <!-- Stylized Paw Print in Center -->
  <ellipse cx="32" cy="40" rx="9" ry="7" fill="url(#vetEmerald)"/>
  <circle cx="21" cy="27" r="4.5" fill="url(#vetEmerald)"/>
  <circle cx="43" cy="27" r="4.5" fill="url(#vetEmerald)"/>
  <circle cx="28" cy="20" r="4" fill="#ffffff"/>
  <circle cx="36" cy="20" r="4" fill="#ffffff"/>
</svg>`;
  }

  if (isDental) {
    // Clean Aesthetic Tooth / Sparkle
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="dentBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a192f"/>
      <stop offset="100%" stop-color="#11294a"/>
    </linearGradient>
    <linearGradient id="dentCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="15" fill="url(#dentBg)"/>
  <rect x="1.5" y="1.5" width="61" height="61" rx="13.5" fill="none" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.5"/>
  
  <!-- Stylized Tooth Path -->
  <path d="M32 15 c-8 0 -13 4 -13 12 c0 7 3 13 4 20 c1 3 3 5 5 5 c2 0 3 -2 4 -5 c1 -4 1 -6 2 -6 s1 2 2 6 c1 3 2 5 4 5 c2 0 4 -2 5 -5 c1 -7 4 -13 4 -20 c0 -8 -5 -12 -13 -12 Z" fill="#ffffff"/>
  
  <!-- Sparkle Accent -->
  <polygon points="46,14 48,18 52,20 48,22 46,26 44,22 40,20 44,18" fill="url(#dentCyan)"/>
</svg>`;
  }

  // Universal Titanium Bespoke Monogram
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="uniBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#151d2f"/>
    </linearGradient>
    <linearGradient id="uniAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="15" fill="url(#uniBg)"/>
  <rect x="1.5" y="1.5" width="61" height="61" rx="13.5" fill="none" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1.5"/>
  <text x="32" y="44" font-family="'Montserrat', 'Arial Black', sans-serif" font-size="34" font-weight="900" text-anchor="middle" fill="url(#uniAccent)">${initial}</text>
  <circle cx="48" cy="18" r="3.5" fill="#38bdf8"/>
</svg>`;
}

module.exports = { generateFaviconSvg };

// Self test
if (require.main === module) {
  const kellSvg = generateFaviconSvg({ nicho: 'segurança eletronica' }, 'Kell Distribuidora', 'industrial');
  fs.writeFileSync('previews/kell-distribuidora/favicon.svg', kellSvg, 'utf8');
  console.log('Kell favicon generated successfully!');

  const blitzSvg = generateFaviconSvg({ nicho: 'segurança eletronica' }, 'Blitz Segurança Eletrônica', 'industrial');
  fs.writeFileSync('previews/blitz-seguranca-eletronica/favicon.svg', blitzSvg, 'utf8');
  console.log('Blitz favicon generated successfully!');

  const saudeSvg = generateFaviconSvg({ nicho: 'veterinaria' }, 'Saúde Vet', 'care');
  fs.writeFileSync('previews/saude-vet-pet-shop-e-clinica-veterinaria/favicon.svg', saudeSvg, 'utf8');
  console.log('Saúde Vet favicon generated successfully!');

  const dlSvg = generateFaviconSvg({ nicho: 'odontologia' }, 'DL Odontologia', 'clinical');
  fs.writeFileSync('previews/dl-odontologia-clinica/favicon.svg', dlSvg, 'utf8');
  console.log('DL Odontologia favicon generated successfully!');

  const ecolSvg = generateFaviconSvg({ nicho: 'ar condicionado' }, 'Ecol Ar Condicionado', 'industrial');
  fs.writeFileSync('previews/ecol-ar-condicionado/favicon.svg', ecolSvg, 'utf8');
  console.log('Ecol favicon generated successfully!');
}

