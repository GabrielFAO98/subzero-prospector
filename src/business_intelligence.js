const cheerio = require('cheerio');

/**
 * Módulo de Inteligência Comercial e Extração de Identidade da Marca
 * Realiza mineração de postagens (Facebook e Instagram), extrai a paleta de cores
 * das artes do feed, detecta vídeos institucionais e sintetiza serviços reais.
 */

/**
 * Extrai a paleta de cores a partir do conjunto das imagens de postagens do feed
 * @param {import('playwright').Page} page
 * @param {string[]} imageUrls
 */
async function extractPaletteFromFeedImages(page, imageUrls = []) {
  if (!imageUrls || imageUrls.length === 0) {
    return {
      primaryBrand: '#2563eb',
      accentBrand: '#38bdf8',
      backgroundTone: 'dark',
      dominant: []
    };
  }

  // Limita a até 6 imagens mais representativas do feed
  const targetUrls = imageUrls.filter(Boolean).slice(0, 6);

  try {
    const palette = await page.evaluate(async (urls) => {
      let canvas = document.getElementById('palette-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'palette-canvas';
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
      }
      const ctx = canvas.getContext('2d');
      const colorCounts = {};

      for (const url of urls) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            img.src = url;
          });

          if (!img.width || !img.height) continue;
          canvas.width = 64;
          canvas.height = 64;
          ctx.drawImage(img, 0, 0, 64, 64);
          const data = ctx.getImageData(0, 0, 64, 64).data;

          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            if (a < 128) continue;

            // Rejeita brancos extremos e pretos extremos
            if (r > 235 && g > 235 && b > 235) continue;
            if (r < 25 && g < 25 && b < 25) continue;

            // Quantização (passo de 16)
            const qr = Math.round(r / 16) * 16;
            const qg = Math.round(g / 16) * 16;
            const qb = Math.round(b / 16) * 16;

            const max = Math.max(qr, qg, qb);
            const min = Math.min(qr, qg, qb);
            const delta = max - min;
            const isNeutral = delta < 20;

            const key = `${qr},${qg},${qb}`;
            if (!colorCounts[key]) {
              colorCounts[key] = { r: qr, g: qg, b: qb, count: 0, delta, isNeutral };
            }
            // Pondera mais cores saturadas das artes
            colorCounts[key].count += isNeutral ? 1 : 4;
          }
        } catch (_) {}
      }

      const sorted = Object.values(colorCounts).sort((a, b) => b.count - a.count);
      const toHex = (c) => '#' + [c.r, c.g, c.b].map(x => Math.min(255, x).toString(16).padStart(2, '0')).join('');

      const dominant = sorted.slice(0, 6).map(c => ({
        hex: toHex(c),
        weight: c.count,
        isNeutral: c.isNeutral
      }));

      const brandCandidate = dominant.find(c => !c.isNeutral) || dominant[0];
      const primaryBrand = brandCandidate ? brandCandidate.hex : '#2563eb';
      
      const accentCandidate = dominant.find(c => c.hex !== primaryBrand && !c.isNeutral);
      const accentBrand = accentCandidate ? accentCandidate.hex : '#38bdf8';

      return {
        dominant,
        primaryBrand,
        accentBrand,
        backgroundTone: 'dark'
      };
    }, targetUrls);

    return palette;
  } catch (err) {
    return {
      primaryBrand: '#2563eb',
      accentBrand: '#38bdf8',
      backgroundTone: 'dark',
      dominant: []
    };
  }
}

/**
 * Minera postagens públicas, legendas e vídeos de uma Fanpage do Facebook
 * @param {import('playwright').Page} page
 * @param {string} facebookUrl
 */
async function scrapeFacebookPage(page, facebookUrl) {
  if (!facebookUrl) return { posts: [], introText: '', images: [] };

  try {
    await page.goto(facebookUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(3000);

    // Remove eventuais modais intrusivos de login
    await page.evaluate(() => {
      document.querySelectorAll('[role="dialog"], div[aria-label*="Fechar"], div[role="banner"]').forEach(el => {
        const text = el.innerText || '';
        if (text.includes('Entrar') || text.includes('Criar nova conta') || text.includes('Conectar ao Facebook')) {
          el.remove();
        }
      });
      document.body.style.overflow = 'auto';
    }).catch(() => {});

    // Scroll leve e paciente (1 a 2 telas) para carregar os primeiros 5 a 8 posts
    for (let s = 0; s < 2; s++) {
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(1500);
    }

    const data = await page.evaluate(() => {
      // 1. Textos e legendas dos posts
      const postElements = Array.from(document.querySelectorAll('div[role="article"], div[data-ad-preview="message"], div[dir="auto"]'));
      const posts = [];
      const seen = new Set();

      postElements.forEach(el => {
        const text = el.innerText.trim();
        // Posts informativos relevantes com mais de 35 caracteres
        if (text.length >= 35 && text.length <= 1500) {
          const firstLine = text.split('\n')[0].trim();
          if (!seen.has(firstLine) && !text.includes('Entrar no Facebook') && !text.includes('Esqueceu a conta')) {
            seen.add(firstLine);
            posts.push(text);
          }
        }
      });

      // 2. Imagens de artes dos posts (exclui emojis e ícones de interface)
      const images = Array.from(document.querySelectorAll('div[role="article"] img, div[role="feed"] img, main img'))
        .map(img => img.src)
        .filter(s => s && s.includes('fbcdn.net') && !s.includes('emoji.php') && !s.includes('rsrc.php'));

      // 3. Texto da seção Sobre / Intro
      const introEl = document.querySelector('div[data-pagelet*="ProfileIntro"], div.x1n2onr6');
      const introText = introEl ? introEl.innerText.trim() : '';

      return {
        posts: posts.slice(0, 8),
        introText,
        images: images.slice(0, 8)
      };
    });

    return data;
  } catch (err) {
    return { posts: [], introText: '', images: [] };
  }
}

/**
 * Minera perfil do Instagram (Bio, Destaques, Primeiros 6-9 posts e artes)
 * @param {import('playwright').Page} page
 * @param {string} instagramUrl
 */
async function scrapeInstagramProfile(page, instagramUrl) {
  if (!instagramUrl) return { bio: '', avatar: '', highlights: [], posts: [], postImages: [] };

  try {
    await page.goto(instagramUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(3000);

    // Remove modais intrusivos de login
    await page.evaluate(() => {
      document.querySelectorAll('[role="dialog"], [role="presentation"]').forEach(el => el.remove());
      document.body.style.overflow = 'auto';
    }).catch(() => {});

    const data = await page.evaluate(() => {
      const header = document.querySelector('header');
      const bio = header ? header.innerText.trim() : '';
      const avatar = header?.querySelector('img')?.src || '';

      // Títulos dos destaques (Highlights)
      const highlights = [];
      document.querySelectorAll('ul li, div[role="menuitem"]').forEach(el => {
        const t = el.innerText.trim();
        if (t && !t.includes('seguidor') && !t.includes('post') && t.length <= 25) {
          highlights.push(t.replace(/\n+/g, ' '));
        }
      });

      // Imagens e legendas das postagens
      const postImages = [];
      const posts = [];
      document.querySelectorAll('article img, main img').forEach(img => {
        const src = img.src || '';
        const alt = img.alt || '';
        if (src && src.includes('cdninstagram.com') && !src.includes('s150x150')) {
          postImages.push(src);
          if (alt && alt.length > 15 && !alt.startsWith('Foto do perfil')) {
            posts.push(alt);
          }
        }
      });

      return {
        bio,
        avatar,
        highlights: highlights.slice(0, 6),
        posts: posts.slice(0, 9),
        postImages: postImages.slice(0, 9)
      };
    });

    return data;
  } catch (err) {
    return { bio: '', avatar: '', highlights: [], posts: [], postImages: [] };
  }
}

/**
 * Sintetizador Semântico de Negócio:
 * Consolida Facebook + Instagram + Google Maps e gera a ficha completa de inteligência
 */
function synthesizeBusinessIntelligence({
  companyName = '',
  niche = '',
  city = 'Franca SP',
  fbData = {},
  igData = {},
  mapsData = {},
  palette = {}
}) {
  const norm = (s = '') => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const allPosts = [...(fbData.posts || []), ...(igData.posts || [])];
  const allText = [
    companyName,
    niche,
    igData.bio || '',
    fbData.introText || '',
    ...(igData.highlights || []),
    ...allPosts,
    ...(mapsData.reviews ? mapsData.reviews.map(r => r.texto || r.text || '') : [])
  ].join('\n');

  const allTextLower = allText.toLowerCase();

  // 1. Extração Inteligente de Serviços Reais
  const detectedServices = [];
  const seenServiceNames = new Set();
  const nameNorm = norm(companyName);

  function addService(nome, desc) {
    const cleanNome = nome.trim();
    const key = norm(cleanNome);
    if (key.length >= 4 && !seenServiceNames.has(key) && detectedServices.length < 4) {
      seenServiceNames.add(key);
      detectedServices.push({ nome: cleanNome, desc: desc.trim() });
    }
  }

  // Analisa linhas da Bio do Instagram (linhas curtas com termos explícitos de serviços)
  if (igData.bio) {
    const bioLines = igData.bio.split('\n')
      .map(l => l.trim())
      .filter(l => l.length >= 4 && l.length <= 50)
      .map(l => l.replace(/^[\p{Emoji}\u2000-\u3300\uFE0F•\-–—*|>#\s]+/u, '').trim())
      .filter(l => {
        const ln = norm(l);
        if (ln.includes('seguidor') || ln.includes('seguindo') || ln.includes('posts')) return false;
        if (ln.includes('franca') || ln.includes('contato') || ln.includes('whatsapp') || ln.includes('seg a sex') || ln.includes('horario')) return false;
        if (nameNorm && (nameNorm === ln || nameNorm.includes(ln) || (ln.length > 5 && ln.includes(nameNorm)))) return false;
        if (ln.includes('ribeirao') || ln.includes('minas gerais') || ln.includes('triangulo mineiro')) return false;
        return true;
      });

    const serviceKeywords = [
      'instal', 'manuten', 'higieniz', 'limpez', 'climatiz', 'refrigera',
      'conserto', 'reparo', 'pmoc', 'split', 'ar condicionado',
      'facial', 'corporal', 'pele', 'estetica', 'botox', 'preench', 'harmoniz', 'melasma', 'laser',
      'projeto', 'arquitet', 'obra', 'reforma', 'calculo', 'laudo', 'art',
      'cftv', 'camera', 'alarme', 'cerca', 'concertina', 'monitoramento', 'portao',
      'pet', 'veterin', 'vacina', 'cirurgia', 'banho', 'tosa', 'consulta',
      'solar', 'fotovoltaic', 'energia'
    ];

    bioLines.forEach(line => {
      const ln = norm(line);
      const isActualService = serviceKeywords.some(kw => ln.includes(kw));
      if (!isActualService) return;

      let desc = 'Execução profissional com alto padrão técnico e atendimento especializado.';
      if (ln.includes('instal') || ln.includes('montag')) desc = 'Instalação técnica especializada com materiais homologados e garantia.';
      else if (ln.includes('manuten') || ln.includes('conserto') || ln.includes('repar')) desc = 'Diagnóstico ágil e manutenção corretiva para máxima eficiência.';
      else if (ln.includes('higieniz') || ln.includes('limpez')) desc = 'Higienização profunda eliminando impurezas, fungos e odores.';
      else if (ln.includes('facial') || ln.includes('pele') || ln.includes('estetica')) desc = 'Protocolos personalizados para rejuvenescimento e realce natural.';
      else if (ln.includes('corporal') || ln.includes('drenagem') || ln.includes('massag')) desc = 'Tratamentos corporais com técnicas avançadas para seu bem-estar.';
      else if (ln.includes('botox') || ln.includes('preench') || ln.includes('harmoniz')) desc = 'Harmonização avançada respeitando os traços e a naturalidade.';
      else if (ln.includes('projeto') || ln.includes('arquitet') || ln.includes('obra')) desc = 'Projetos completos com visualização 3D e acompanhamento rigoroso.';
      else if (ln.includes('alarme') || ln.includes('cftv') || ln.includes('camera')) desc = 'Monitoramento ativo e gravação de alta definição para seu patrimônio.';

      addService(line, desc);
    });
  }

  // Se não atingiu 4 serviços via Bio, busca termos recorrentes nos posts do Facebook/Instagram
  if (detectedServices.length < 4) {
    const servicePatterns = [
      { trigger: /manuten[cç][aã]o\s+preventiva/i, nome: 'Manutenção Preventiva', desc: 'Revisão periódica programada que evita quebras inesperadas e paradas.' },
      { trigger: /instala[cç][aã]o\s+de\s+ar/i, nome: 'Instalação de Ar Condicionado', desc: 'Instalação seguindo os parâmetros oficiais dos fabricantes com garantia.' },
      { trigger: /higieniza[cç][aã]o\s+completa|limpeza\s+qu[ií]mica/i, nome: 'Higienização & Limpeza Profunda', desc: 'Desinfecção completa com laudo técnico e remoção de fungos.' },
      { trigger: /pmoc/i, nome: 'Contratos de PMOC Empresarial', desc: 'Plano de Manutenção, Operação e Controle conforme a Lei 13.589/2018.' },
      { trigger: /limpeza\s+de\s+pele/i, nome: 'Limpeza de Pele Profunda', desc: 'Desobstrução e renovação celular com dermocosméticos de alta performance.' },
      { trigger: /bioestimulador|col[aá]geno/i, nome: 'Bioestimuladores de Colágeno', desc: 'Estímulo natural da firmeza e regeneração profunda da pele.' },
      { trigger: /harmoniza[cç][aã]o|preenchimento/i, nome: 'Harmonização & Preenchimento', desc: 'Realce dos pontos de iluminação e sustentação facial natural.' },
      { trigger: /cerca\s+el[eé]trica|concertina/i, nome: 'Cercas Elétricas & Concertinas', desc: 'Proteção perimetral reforçada com lâminas afiadas e choque homologado.' },
      { trigger: /monitoramento\s+24/i, nome: 'Central de Monitoramento 24h', desc: 'Vigilância contínua com protocolo de resposta rápida a disparos.' },
      { trigger: /c[aâ]meras\s+cftv|gravadores/i, nome: 'Câmeras de Segurança CFTV', desc: 'Monitoramento em tempo real no smartphone em alta resolução.' },
      { trigger: /energia\s+solar|fotovoltaic/i, nome: 'Energia Solar Fotovoltaica', desc: 'Projetos completos com redução de até 95% na conta de luz.' },
      { trigger: /laudo\s+t[eé]cnico|per[ií]cia/i, nome: 'Laudos Técnicos & ART', desc: 'Vistorias especializadas com emissão de ART e conformidade legal.' }
    ];

    for (const pat of servicePatterns) {
      if (pat.trigger.test(allTextLower)) {
        addService(pat.nome, pat.desc);
        if (detectedServices.length >= 4) break;
      }
    }
  }

  // 2. Extração de Diferenciais Reais citados
  const differentials = [];
  if (/atendimento\s+24h|24\s*horas|plant[aã]o/i.test(allTextLower)) {
    differentials.push({ titulo: 'Atendimento Ágil / Plantão', desc: 'Pronta-resposta para atendimentos e emergências na região.' });
  }
  if (/(?:mais\s+de\s*)?(\d{1,2})\s*anos/i.test(allTextLower)) {
    const m = allTextLower.match(/(?:mais\s+de\s*)?(\d{1,2})\s*anos/i);
    differentials.push({ titulo: `${m[0].toUpperCase()} no Mercado`, desc: 'Tradição, experiência comprovada e credibilidade consolidada.' });
  }
  if (/autorizad[oa]|credenciad[oa]/i.test(allTextLower)) {
    differentials.push({ titulo: 'Empresa Credenciada & Autorizada', desc: 'Padrão oficial de fábrica, ferramentas calibradas e peças originais.' });
  }
  if (/garantia/i.test(allTextLower) && differentials.length < 3) {
    differentials.push({ titulo: 'Garantia Comprovada em Contrato', desc: 'Segurança absoluta e suporte pós-atendimento sem complicações.' });
  }
  if (/pontualidade|prazo/i.test(allTextLower) && differentials.length < 3) {
    differentials.push({ titulo: 'Compromisso Rigoroso com Prazos', desc: 'Respeito ao seu tempo com cronograma claro do início ao fim.' });
  }

  // 3. Tom de Voz da Comunicação
  let tomDeVoz = 'Profissional e Especializado';
  if (/doutora|dra\.|m[eé]dic|procedimento|avalia[cç][aã]o/i.test(allTextLower)) {
    tomDeVoz = 'Acolhedor, Técnico e Clínico';
  } else if (/engenharia|laudo|norma|c[aá]lculo|pmoc/i.test(allTextLower)) {
    tomDeVoz = 'Técnico, Preciso e Normativo';
  } else if (/parceria|fam[ií]lia|carinho|amor|dedica[cç][aã]o/i.test(allTextLower)) {
    tomDeVoz = 'Humanizado, Próximo e Confiável';
  }

  // 4. Avatar / Logotipo Real
  const avatarOuLogo = igData.avatar || null;

  return {
    servicos: detectedServices,
    diferenciais: differentials.slice(0, 3),
    tomDeVoz,
    avatarOuLogo,
    paletaCores: palette,
    totalPostsAnalisados: allPosts.length
  };
}

/**
 * Ponto de entrada principal: Executa o enriquecimento profundo completo de um lead
 */
async function mineBusinessIntelligence(page, {
  companyName,
  city = 'Franca SP',
  niche = '',
  instagramUrl = null,
  facebookUrl = null,
  mapsData = {}
}) {
  console.log(`  🔍 [BI] Minerando inteligência profunda de: "${companyName}"...`);

  // 1. Minera Facebook se houver URL
  let fbData = { posts: [], introText: '', images: [] };
  if (facebookUrl) {
    console.log(`  📘 [Facebook] Lendo posts e legendas em: ${facebookUrl}`);
    fbData = await scrapeFacebookPage(page, facebookUrl);
    console.log(`    ↳ ${fbData.posts.length} posts do Facebook lidos, ${fbData.images.length} fotos coletadas.`);
  }

  // 2. Minera Instagram se houver URL
  let igData = { bio: '', avatar: '', highlights: [], posts: [], postImages: [] };
  if (instagramUrl) {
    console.log(`  📸 [Instagram] Lendo bio, destaques e feed em: ${instagramUrl}`);
    igData = await scrapeInstagramProfile(page, instagramUrl);
    console.log(`    ↳ Bio lida. ${igData.posts.length} posts do Instagram lidos, ${igData.postImages.length} artes coletadas.`);
  }

  // 3. Extrai paleta de cores a partir do conjunto de artes coletadas dos feeds
  const allFeedImages = [...(igData.postImages || []), ...(fbData.images || [])];
  console.log(`  🎨 [Paleta] Amostrando cores de ${allFeedImages.length} artes gráficas do feed...`);
  const palette = await extractPaletteFromFeedImages(page, allFeedImages);
  console.log(`    ↳ Paleta da marca identificada: Primária ${palette.primaryBrand} | Acento ${palette.accentBrand}`);

  // 4. Sintetiza a inteligência do negócio
  const intelligence = synthesizeBusinessIntelligence({
    companyName,
    niche,
    city,
    fbData,
    igData,
    mapsData,
    palette
  });

  console.log(`  ✨ [Síntese] ${intelligence.servicos.length} serviços reais detectados, tom: "${intelligence.tomDeVoz}".`);
  return intelligence;
}

module.exports = {
  extractPaletteFromFeedImages,
  scrapeFacebookPage,
  scrapeInstagramProfile,
  synthesizeBusinessIntelligence,
  mineBusinessIntelligence
};
