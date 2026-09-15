/**
 * Verifica a saúde e acessibilidade de um website cadastrado no Google Maps
 */
async function checkWebsiteHealth(url) {
  if (!url) return { hasWebsite: false, isOnline: false, status: 'nenhum', reason: 'Nenhum site cadastrado' };

  // Tratamento de URLs de redes sociais ou linktree
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com') || lower.includes('facebook.com') || lower.includes('linktr.ee')) {
    return {
      hasWebsite: false,
      isSocialLink: true,
      url,
      status: 'apenas_social',
      reason: `Utiliza link de rede social no lugar de site próprio (${url})`
    };
  }

  let formattedUrl = url;
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(formattedUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      },
      redirect: 'follow'
    });

    clearTimeout(timeoutId);

    if (res.status >= 200 && res.status < 400) {
      return {
        hasWebsite: true,
        isOnline: true,
        statusCode: res.status,
        url: formattedUrl,
        status: 'online',
        reason: `Site oficial ativo e respondendo normalmente (HTTP ${res.status})`
      };
    } else {
      return {
        hasWebsite: true,
        isOnline: false,
        statusCode: res.status,
        url: formattedUrl,
        status: 'inacessivel',
        reason: `🚨 Site cadastrado está INACESSÍVEL / FORA DO AR (HTTP ${res.status})`
      };
    }
  } catch (err) {
    let errorMsg = err.message;
    if (err.name === 'AbortError') errorMsg = 'Tempo limite excedido (Timeout)';
    return {
      hasWebsite: true,
      isOnline: false,
      statusCode: null,
      url: formattedUrl,
      status: 'inacessivel',
      reason: `🚨 Site cadastrado está FORA DO AR (${errorMsg})`
    };
  }
}

module.exports = {
  checkWebsiteHealth
};

