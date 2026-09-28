const cheerio = require('cheerio');

const LINK_HUB_DOMAINS = [
  'linktr.ee',
  'beacons.ai',
  'bio.site',
  'instabio.cc',
  'heylink.me',
  'taplink.cc',
  'linkr.bio',
  'app.link',
  'campsite.bio',
  'shor.by',
  'allmylinks.com',
  'linkin.bio'
];

const LINK_HUB_PATH_REGEX = /^\/(?:links|link|bio|linktree|social|meus-links)(?:\/.*)?$/i;

/**
 * Verifica se uma URL possui características evidentes de Link Hub / Linktree
 * @param {string} rawUrl
 * @returns {boolean}
 */
function isLinkHubUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const url = rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl;
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (LINK_HUB_DOMAINS.some(d => host === d || host.endsWith('.' + d))) {
      return true;
    }

    if (LINK_HUB_PATH_REGEX.test(parsed.pathname)) {
      return true;
    }
  } catch (_) {}
  return false;
}

/**
 * Inspeciona profundamente uma página de Link Hub / Linktree
 * Desempacota os links internos para encontrar o site oficial real, WhatsApp, Instagram e vídeo
 * @param {string} hubUrl
 */
async function inspectLinkHub(hubUrl) {
  if (!hubUrl) return { isHub: false, realWebsite: null };

  try {
    const targetUrl = hubUrl.startsWith('http') ? hubUrl : 'https://' + hubUrl;
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8'
      },
      signal: AbortSignal.timeout(7000)
    });

    if (!res.ok) {
      return { isHub: isLinkHubUrl(hubUrl), realWebsite: null };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const parsedHub = new URL(targetUrl);
    const hubHost = parsedHub.hostname.replace(/^www\./, '').toLowerCase();
    const hubPath = parsedHub.pathname.toLowerCase();

    const candidateSites = [];
    let detectedWhatsApp = null;
    let detectedInstagram = null;
    let detectedFacebook = null;
    let detectedVideo = null;

    $('a[href]').each((i, el) => {
      let href = $(el).attr('href') || '';
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      const lowerHref = href.toLowerCase();
      const lowerText = text.toLowerCase();

      // Desempacota links encapsulados do Instagram e Linktree (?u=...)
      if (href.includes('linktr.ee/url?') || href.includes('l.instagram.com') || href.includes('?u=')) {
        const m = href.match(/[?&]u=([^&]+)/);
        if (m) {
          try { href = decodeURIComponent(m[1]); } catch (_) {}
        }
      }

      if (!href.startsWith('http://') && !href.startsWith('https://')) return;

      // WhatsApp
      if (!detectedWhatsApp && (lowerHref.includes('wa.me/') || lowerHref.includes('api.whatsapp.com') || lowerHref.includes('whatsapp.com/send'))) {
        const numMatch = href.match(/(?:phone=|wa\.me\/|send\?phone=)([0-9]{10,13})/);
        detectedWhatsApp = numMatch ? numMatch[1] : href;
        return;
      }

      // Instagram
      if (!detectedInstagram && lowerHref.includes('instagram.com/')) {
        const m = href.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
        if (m && !['p', 'reel', 'explore', 'stories'].includes(m[1].toLowerCase())) {
          detectedInstagram = `https://www.instagram.com/${m[1]}/`;
        }
        return;
      }

      // Facebook
      if (!detectedFacebook && lowerHref.includes('facebook.com/')) {
        detectedFacebook = href.split('?')[0];
        return;
      }

      // Vídeo Institucional (YouTube, Vimeo)
      if (!detectedVideo && (lowerHref.includes('youtube.com/watch') || lowerHref.includes('youtu.be/') || lowerHref.includes('vimeo.com/'))) {
        detectedVideo = href;
        return;
      }

      // Descartar redes e mapas
      if (
        lowerHref.includes('google.com/maps') || lowerHref.includes('goo.gl/maps') ||
        lowerHref.includes('tiktok.com') || lowerHref.includes('linkedin.com') ||
        lowerHref.includes('twitter.com') || lowerHref.includes('x.com') ||
        lowerHref.includes('spotify.com') || lowerHref.includes('pinterest.com')
      ) {
        return;
      }

      try {
        const parsedTarget = new URL(href);
        const targetHost = parsedTarget.hostname.replace(/^www\./, '').toLowerCase();
        const targetPath = parsedTarget.pathname.toLowerCase();

        // Se for o mesmo domínio do hub e apontar para a raiz (ex: mirracosmeticos.com.br/links -> mirracosmeticos.com.br/)
        const isRootOfHub = (targetHost === hubHost) && (targetPath === '/' || targetPath === '');
        // Se for link interno para outros links do hub (ex: /en/links, /es/links)
        const isHubSubpath = (targetHost === hubHost) && LINK_HUB_PATH_REGEX.test(targetPath);

        if (isHubSubpath) return;

        let priority = 1;
        if (isRootOfHub) priority += 10;
        if (
          lowerText.includes('site') || lowerText.includes('início') || lowerText.includes('inicio') ||
          lowerText.includes('home') || lowerText.includes('loja') || lowerText.includes('produto') ||
          lowerText.includes('conheça') || lowerText.includes('catálogo') || lowerText.includes('quem somos')
        ) {
          priority += 5;
        }

        candidateSites.push({
          url: href,
          host: targetHost,
          text,
          priority
        });
      } catch (_) {}
    });

    candidateSites.sort((a, b) => b.priority - a.priority);
    const realWebsite = candidateSites.length > 0 ? candidateSites[0].url : null;

    return {
      isHub: true,
      realWebsite,
      detectedWhatsApp,
      detectedInstagram,
      detectedFacebook,
      detectedVideo,
      allCandidates: candidateSites
    };
  } catch (err) {
    return { isHub: isLinkHubUrl(hubUrl), realWebsite: null, error: err.message };
  }
}

module.exports = {
  isLinkHubUrl,
  inspectLinkHub
};
