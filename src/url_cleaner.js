/**
 * Utilitário de Sanitização, Normalização e Validação de URLs
 * Remove redirecionamentos do Google, parâmetros de rastreamento (UTM, gclid, fbclid)
 * e identifica agregadores de diretórios / redes sociais.
 */

const AGGREGATOR_DOMAINS = [
  { domain: 'guiamais.com.br', name: 'GuiaMais' },
  { domain: 'telelistas.net', name: 'TeleListas' },
  { domain: 'apontador.com.br', name: 'Apontador' },
  { domain: 'doctoralia.com.br', name: 'Doctoralia' },
  { domain: 'consultaremedios.com.br', name: 'Consulta Remédios' },
  { domain: 'encontrafranca.com.br', name: 'Encontra Franca' },
  { domain: 'encontrasp.com.br', name: 'Encontra SP' },
  { domain: 'jusbrasil.com.br', name: 'Jusbrasil' },
  { domain: 'tripadvisor.com', name: 'TripAdvisor' },
  { domain: 'tripadvisor.com.br', name: 'TripAdvisor' },
  { domain: 'ifood.com.br', name: 'iFood' },
  { domain: 'hotmart.com', name: 'Hotmart' },
  { domain: 'sympla.com.br', name: 'Sympla' },
  { domain: 'yellowpages.com', name: 'Yellow Pages' },
  { domain: 'foursquare.com', name: 'Foursquare' }
];

const SOCIAL_DOMAINS = [
  { match: 'instagram.com', platform: 'Instagram' },
  { match: 'facebook.com', platform: 'Facebook' },
  { match: 'fb.com', platform: 'Facebook' },
  { match: 'linktr.ee', platform: 'Linktree' },
  { match: 'beacons.ai', platform: 'Beacons' },
  { match: 'bio.site', platform: 'BioSite' },
  { match: 'wa.me', platform: 'WhatsApp' },
  { match: 'api.whatsapp.com', platform: 'WhatsApp' },
  { match: 'youtube.com', platform: 'YouTube' },
  { match: 'linkedin.com', platform: 'LinkedIn' },
  { match: 'tiktok.com', platform: 'TikTok' },
  { match: 'twitter.com', platform: 'X/Twitter' },
  { match: 'x.com', platform: 'X/Twitter' }
];

const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'igshid', 'srsltid', '_ga', '_gl', 'mc_cid', 'mc_eid',
  'ref', 'source', 'ved', 'usg', 'sa', 'biw', 'bih'
];

/**
 * Desempacota redirecionamentos do Google (Google Ads, /url?q=, /aclk)
 * e retorna a URL real de destino
 */
function unwrapGoogleRedirect(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  if (rawUrl.includes('google.com/url') || rawUrl.includes('google.com/aclk') || rawUrl.includes('google.com.br/url')) {
    try {
      const u = new URL(rawUrl);
      const target = u.searchParams.get('adurl') || u.searchParams.get('q') || u.searchParams.get('url');
      if (target && !target.includes('google.com')) {
        return target;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  if (rawUrl.includes('goo.gl/maps') || rawUrl.includes('maps.google.com') || rawUrl.includes('google.com/maps')) {
    return null; // Link de ficha do maps, não site
  }

  return rawUrl;
}

/**
 * Sanitiza, normaliza e remove lixo de rastreamento de uma URL
 * @param {string} rawUrl
 * @returns {{
 *   originalUrl: string,
 *   cleanedUrl: string | null,
 *   domain: string | null,
 *   isAggregator: boolean,
 *   aggregatorName: string | null,
 *   isSocial: boolean,
 *   socialPlatform: string | null
 * }}
 */
function cleanAndNormalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      originalUrl: rawUrl,
      cleanedUrl: null,
      domain: null,
      isAggregator: false,
      aggregatorName: null,
      isSocial: false,
      socialPlatform: null
    };
  }

  let unwrapped = unwrapGoogleRedirect(rawUrl.trim());
  if (!unwrapped) {
    return {
      originalUrl: rawUrl,
      cleanedUrl: null,
      domain: null,
      isAggregator: false,
      aggregatorName: null,
      isSocial: false,
      socialPlatform: null
    };
  }

  // Se não possuir protocolo, acrescenta https://
  if (!unwrapped.startsWith('http://') && !unwrapped.startsWith('https://')) {
    unwrapped = 'https://' + unwrapped;
  }

  try {
    const parsed = new URL(unwrapped);

    // Remove portas padrão redundantes
    if (parsed.port === '80' || parsed.port === '443') {
      parsed.port = '';
    }

    // Limpa parâmetros de rastreamento conhecidos
    TRACKING_PARAMS.forEach(param => {
      parsed.searchParams.delete(param);
    });

    const cleanHostname = parsed.hostname.toLowerCase();

    // 1. Detecta agregadores de diretórios
    const aggMatch = AGGREGATOR_DOMAINS.find(a => cleanHostname.endsWith(a.domain) || cleanHostname === a.domain);
    const isAggregator = !!aggMatch;
    const aggregatorName = aggMatch ? aggMatch.name : null;

    // 2. Detecta redes sociais
    const socMatch = SOCIAL_DOMAINS.find(s => cleanHostname.includes(s.match));
    const isSocial = !!socMatch;
    const socialPlatform = socMatch ? socMatch.platform : null;

    // Monta URL limpa
    let cleaned = parsed.toString();
    // Remove barra final se for apenas domínio raiz (ex: https://site.com/ -> https://site.com)
    if (parsed.pathname === '/' && !parsed.search && !parsed.hash) {
      cleaned = `${parsed.protocol}//${parsed.host}`;
    }

    return {
      originalUrl: rawUrl,
      cleanedUrl: cleaned,
      domain: cleanHostname.replace(/^www\./, ''),
      isAggregator,
      aggregatorName,
      isSocial,
      socialPlatform
    };
  } catch (_) {
    return {
      originalUrl: rawUrl,
      cleanedUrl: null,
      domain: null,
      isAggregator: false,
      aggregatorName: null,
      isSocial: false,
      socialPlatform: null
    };
  }
}

module.exports = {
  cleanAndNormalizeUrl,
  unwrapGoogleRedirect,
  AGGREGATOR_DOMAINS,
  SOCIAL_DOMAINS
};

