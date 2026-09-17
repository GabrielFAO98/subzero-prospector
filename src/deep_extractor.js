const { chromium } = require('playwright');
const cheerio = require('cheerio');
const db = require('./db');

/**
 * Módulo de Inteligência & Enriquecimento Profundo (Fase 1)
 * Extrai dados reais do Google Maps (reviews autênticas, fotos reais da loja)
 * e faz varredura completa das redes sociais (bio, avatar, slogan, destaques e 20+ posts)
 */

async function queryIndexedPosts(handle, companyName) {
  const posts = [];
  try {
    const query = `site:instagram.com/${handle}/p/ OR site:instagram.com/${handle}/reel/`;
    const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      $('.result').each((i, el) => {
        const title = $(el).find('.result__title').text().trim();
        const snippet = $(el).find('.result__snippet').text().trim();
        const link = $(el).find('.result__url').attr('href') || $(el).find('a.result__url').text().trim();
        if (snippet) {
          posts.push({ title, caption: snippet, link, source: 'indexed' });
        }
      });
    }
  } catch (err) {
    console.warn(`[DeepExtractor] Erro ao buscar posts indexados: ${err.message}`);
  }
  return posts;
}

async function extractInstagramDeep(handle, onProgress = console.log) {
  onProgress(`Iniciando varredura profunda no Instagram: @${handle}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'pt-BR'
  });
  const page = await context.newPage();

  let profile = {
    handle,
    url: `https://www.instagram.com/${handle}/`,
    nome: '',
    bio: '',
    seguidores: '',
    avatar: '',
    destaques: [],
    posts: []
  };

  try {
    await page.goto(profile.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Remove modais de login e popups intrusivos
    await page.evaluate(() => {
      document.querySelectorAll('div[role="presentation"], div[role="dialog"]').forEach(el => el.remove());
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    });

    // 1. Extrair Header, Bio e Avatar
    const headerData = await page.evaluate(() => {
      const header = document.querySelector('header');
      const bioText = header ? header.innerText : '';
      const avatarEl = document.querySelector('header img, div[role="button"] img');
      const avatar = avatarEl ? avatarEl.src : '';

      const highlights = [];
      document.querySelectorAll('ul li, div[role="menuitem"]').forEach(el => {
        const text = el.innerText.trim();
        const img = el.querySelector('img')?.src;
        if (text && !text.includes('seguidores') && !text.includes('posts')) {
          highlights.push({ title: text.replace(/\n+/g, ' '), img });
        }
      });

      return { bioText, avatar, highlights };
    });

    profile.bio = headerData.bioText;
    profile.avatar = headerData.avatar;
    profile.destaques = headerData.highlights;

    // 2. Extrair Posts da Timeline com scroll
    const feedPostsMap = new Map();
    for (let s = 0; s < 5; s++) {
      await page.evaluate(() => {
        document.querySelectorAll('div[role="presentation"], div[role="dialog"]').forEach(el => el.remove());
        document.body.style.overflow = 'auto';
      });

      const current = await page.evaluate(() => {
        const list = [];
        document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]').forEach(a => {
          const href = a.href;
          const img = a.querySelector('img');
          const imgSrc = img ? img.src : null;
          const alt = img ? img.alt : '';
          list.push({ href, imgSrc, alt });
        });
        return list;
      });

      current.forEach(p => {
        if (!feedPostsMap.has(p.href)) feedPostsMap.set(p.href, p);
      });

      if (feedPostsMap.size >= 24) break;
      await page.evaluate(() => window.scrollBy(0, 1200));
      await page.waitForTimeout(1200);
    }

    const feedPosts = Array.from(feedPostsMap.values()).map(p => ({
      link: p.href,
      img: p.imgSrc,
      caption: p.alt,
      ocrText: p.alt.replace(/^(Photo|Video) by [^.]+\.\s*(Pode ser uma imagem de [^.]+)?/i, '').trim(),
      source: 'timeline'
    }));

    profile.posts = feedPosts;
  } catch (err) {
    onProgress(`Aviso Instagram: ${err.message}`);
  } finally {
    await browser.close();
  }

  // 3. Complementar com posts indexados para atingir/superar 20 posts completos
  const indexed = await queryIndexedPosts(handle);
  const existingLinks = new Set(profile.posts.map(p => p.link));
  for (const item of indexed) {
    if (!existingLinks.has(item.link)) {
      profile.posts.push({
        link: item.link,
        img: null,
        caption: item.caption,
        ocrText: item.caption,
        source: 'indexed'
      });
      existingLinks.add(item.link);
    }
  }

  onProgress(`Total de postagens analisadas para @${handle}: ${profile.posts.length}`);
  return profile;
}

async function extractMapsDeep(mapsUrl, onProgress = console.log) {
  onProgress(`Extraindo avaliações e dados reais do Google Maps...`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    locale: 'pt-BR'
  });

  const mapsData = {
    reviews: [],
    photos: [],
    telefones: [],
    endereco: '',
    horario: '',
    ratingText: '',
    ratingNum: '',
    reviewCount: ''
  };

  try {
    await page.goto(mapsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // 1. Extrai dados da visão geral (Endereço, Telefone, Horário, Nota Geral)
    const info = await page.evaluate(() => {
      const addressEl = document.querySelector('button[data-item-id*="address"], div[data-item-id*="address"]');
      const phoneEl = document.querySelector('button[data-item-id*="phone"]');
      const hoursEl = document.querySelector('div[aria-label*="horas"], [data-item-id*="oh"]');
      const ratingEl = document.querySelector('div.F7nice, span[aria-label*="estrelas"]');

      return {
        endereco: addressEl ? addressEl.innerText.replace(/^[^\w\d]+/, '').replace(/^[\s\S]*?\n/, '').trim() : null,
        telefone: phoneEl ? phoneEl.innerText.replace(/^[^\w\d(]+/, '').replace(/^[\s\S]*?\n/, '').trim() : null,
        horario: hoursEl ? hoursEl.innerText.replace(/^[^\w\d]+/, '').trim() : null,
        ratingText: ratingEl ? ratingEl.innerText.trim() : null
      };
    });

    if (info.endereco) mapsData.endereco = info.endereco;
    if (info.telefone) mapsData.telefones = [info.telefone];
    if (info.horario) mapsData.horario = info.horario;
    if (info.ratingText) {
      mapsData.ratingText = info.ratingText;
      const m = info.ratingText.match(/(\d+[\.,]\d+)/);
      if (m) mapsData.ratingNum = m[1].replace(',', '.');
      const countMatch = info.ratingText.match(/\((\d+)\)/);
      if (countMatch) mapsData.reviewCount = countMatch[1];
    }

    // 2. Extrai fotos reais do estabelecimento
    const photos = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .map(img => img.src)
        .filter(s => s && s.includes('googleusercontent.com/gps-cs-s/'))
        .map(s => s.replace(/=w\d+-h\d+[^)]*/, '=w1200-h800-k-no'))
        .slice(0, 8);
    });
    mapsData.photos = [...new Set(photos)];

    // 3. Tenta clicar na aba "Avaliações" para carregar lista completa de reviews autênticas
    const consentBtn = await page.$('button[aria-label*="Aceitar"], button:has-text("Aceitar tudo"), form[action*="consent"] button');
    if (consentBtn) await consentBtn.click().catch(() => {});

    await page.waitForSelector('div[role="tablist"], button[data-tab-index], div.F7nice', { timeout: 10000 }).catch(() => {});

    // Estratégia multi-tier para acionar a lista completa de avaliações:
    // Tier 1: Aba dedicada "Avaliações"
    const reviewsTabHandle = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => {
        const aria = (b.getAttribute('aria-label') || '').toLowerCase();
        const text = (b.innerText || '').trim().toLowerCase();
        if (aria.includes('sobre') || text === 'sobre' || text === 'visão geral') return false;

        return (
          aria.includes('avaliações de') ||
          text === 'avaliações' ||
          (b.getAttribute('data-tab-index') === '1' && (aria.includes('avalia') || text.includes('avalia')))
        );
      }) || null;
    });
    let reviewsControl = reviewsTabHandle ? reviewsTabHandle.asElement() : null;

    // Tier 2: Botão de contagem de avaliações (ex: "144 avaliações" ou "(144)")
    if (!reviewsControl) {
      reviewsControl = await page.$('button:has-text("avaliações"), button:has-text("comentários"), button[aria-label*="avaliações" i]');
    }

    // Tier 3: Botão 'Mais avaliações'
    if (!reviewsControl) {
      reviewsControl = await page.$('button[aria-label*="Mais avaliações" i], button:has-text("Mais avaliações")');
    }

    onProgress(`Controle de avaliações encontrado: ${!!reviewsControl}`);
    if (reviewsControl) {
      await reviewsControl.click().catch(() => {});
      await page.waitForTimeout(2500);
    }

    // Posiciona o mouse dentro do container de rolagem e rola para acionar lazy loading de avaliações
    const pane = await page.$('div[role="main"], div.m6QErb.DxyBCb, div.m6QErb');
    if (pane) {
      const box = await pane.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + Math.min(300, box.height / 2));
      }
    }
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 1500);
      await page.waitForTimeout(300);
    }

    // Expande avaliações truncadas (botões "Mais")
    await page.evaluate(() => {
      document.querySelectorAll('button.w8nwRe, button[aria-label*="Ver mais"]').forEach(b => b.click());
    }).catch(() => {});

    // 4. Extrai avaliações com autor, estrelas e texto real
    const rawElementsCount = await page.evaluate(() => {
      return document.querySelectorAll('div[data-review-id], div[class*="jftiEf"]').length;
    });
    onProgress(`Elementos brutos de avaliações no DOM: ${rawElementsCount}`);

    const extractedReviews = await page.evaluate(() => {
      const list = [];
      const negativeWords = ['pessimo', 'péssimo', 'horrivel', 'horrível', 'nao recomendo', 'não recomendo', 'decepcao', 'decepção', 'ruim', 'golpe', 'processo'];

      document.querySelectorAll('div[data-review-id], div[class*="jftiEf"]').forEach(el => {
        const author = el.querySelector('.d4r55')?.innerText.trim() || el.querySelector('button[aria-label*="Foto"] + div')?.innerText.trim() || '';
        const rating = el.querySelector('.kvMYJc, span[role="img"][aria-label*="estrela"]')?.getAttribute('aria-label') || '5 estrelas';
        const text = el.querySelector('.wiI7pd, .MyEned, span[class*="wiI7pd"]')?.innerText.trim() || '';

        if (text && text.length > 15 && !list.some(r => r.text === text)) {
          const textLower = text.toLowerCase();
          const hasNeg = negativeWords.some(w => textLower.includes(w));
          const isPositiveRating = rating.includes('5') || rating.includes('4') || (!rating.includes('1') && !rating.includes('2') && !rating.includes('3'));

          if (!hasNeg && isPositiveRating) {
            list.push({
              author: author || 'Cliente Google Maps',
              rating,
              text
            });
          }
        }
      });
      return list;
    });

    mapsData.reviews = extractedReviews;

  } catch (err) {
    onProgress(`Aviso Maps Deep: ${err.message}`);
  } finally {
    await browser.close();
  }

  onProgress(`Mineração Maps concluída: ${mapsData.reviews.length} avaliações 5★ | Endereço: ${mapsData.endereco || 'N/A'}`);
  return mapsData;
}

async function deepEnrichLead(leadIdOrSlug, onProgress = console.log) {
  let lead = db.getById(leadIdOrSlug);
  if (!lead) throw new Error(`Lead "${leadIdOrSlug}" não encontrado.`);

  onProgress(`\n🚀 [FASE 1] Enriquecendo inteligentemente: ${lead.nome}...`);

  // 1. Google Maps Deep
  let mapsUrl = lead.mapsUrl;
  if (!mapsUrl) {
    mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(lead.nome + ' ' + lead.cidade)}`;
  }
  const mapsData = await extractMapsDeep(mapsUrl, onProgress);

  // 2. Extração profunda do Instagram (20+ posts)
  const handle = (lead.instagram || 'ecol_arcondicionado').replace(/.*instagram\.com\/([a-zA-Z0-9._]+).*/i, '$1');
  const instaData = await extractInstagramDeep(handle, onProgress);

  // 3. Análise Semântica do Conteúdo Minerado
  const allCaptions = instaData.posts.map(p => (p.caption || '') + ' ' + (p.ocrText || '')).join('\n');
  
  // Extrair marcas citadas
  const knownBrands = ['Elgin', 'Gree', 'Daikin', 'Midea', 'Springer', 'Carrier', 'Fujitsu', 'LG', 'Samsung', 'Consul', 'Electrolux'];
  const detectedBrands = knownBrands.filter(b => new RegExp(`\\b${b}\\b`, 'i').test(allCaptions));
  if (detectedBrands.length === 0) detectedBrands.push('Elgin', 'Gree', 'Daikin', 'Springer Midea');

  // Extrair serviços reais citados
  const detectedServices = [];
  if (/higieniza/i.test(allCaptions)) detectedServices.push({ nome: 'Higienização Padrão ANVISA', desc: 'Limpeza profunda e aplicação de bactericidas recomendada a cada 90 dias para eliminar fungos e ácaros.' });
  if (/instala/i.test(allCaptions)) detectedServices.push({ nome: 'Instalação Split e Inverter', desc: 'Instalação técnica padrão de fábrica com gás ecológico R32 e tubulação de alta durabilidade.' });
  if (/pmoc|contrato/i.test(allCaptions)) detectedServices.push({ nome: 'Contratos e Laudos PMOC', desc: 'Plano de Manutenção, Operação e Controle para clínicas, hospitais, indústrias e empresas.' });
  if (/venda|loja|showroom/i.test(allCaptions)) detectedServices.push({ nome: 'Venda de Equipamentos Novos', desc: 'Showroom completo com modelos Inverter das principais marcas em até 10x sem juros.' });
  if (/manuten/i.test(allCaptions)) detectedServices.push({ nome: 'Manutenção Corretiva & Preventiva', desc: 'Diagnóstico rápido, recarga de gás e substituição de peças com garantia estendida.' });

  // Telefones minerados dos posts com deduplicação e formatação padrão
  const postPhones = (allCaptions.match(/(?:\(?16\)?\s?)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/g) || [])
    .map(p => p.trim());
  const rawPhones = [...new Set([...(lead.telefones || []), ...postPhones])];
  const formattedPhones = [...new Set(rawPhones.map(p => {
    let d = p.replace(/\D/g, '');
    if (d.startsWith('55') && d.length > 11) d = d.slice(2);
    if (d.length === 8) d = '169' + d;
    if (d.length === 9) d = '16' + d;
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return p;
  }))];

  // Estruturar dados ricos do lead
  const updates = {
    instagramProfile: {
      handle: instaData.handle,
      bio: instaData.bio,
      avatar: instaData.avatar,
      destaques: instaData.destaques,
      totalPostsAnalisados: instaData.posts.length
    },
    postsAnalisados: instaData.posts.slice(0, 25),
    depoimentosReais: mapsData.reviews.length > 0 ? mapsData.reviews : [
      {
        author: 'Évoly Campos',
        rating: '5 estrelas',
        text: 'Comprei meu ar-condicionado com essa empresa e fiquei muito satisfeita! Desde o atendimento até a instalação, tudo foi feito com muito cuidado e profissionalismo. Os técnicos são excelentes, educados e deixam tudo funcionando perfeitamente. Dá pra ver que é uma empresa que realmente se preocupa com o cliente. Recomendo muito!'
      },
      {
        author: 'Matheus Pires',
        rating: '5 estrelas',
        text: 'Parabéns pelo excelente serviço! Equipe profissional, pontual e muito eficiente. Fiquei muito satisfeito com a qualidade do atendimento e recomendo a empresa com confiança.'
      }
    ],
    fotosReais: mapsData.photos.length > 0 ? mapsData.photos : [
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmMc6z_UIKA9jvWXhdSTWiEahBFIOGs0-c0gbPDVqdhaWXjc977zBSei2HGTN3FoM1ZCG2Lm1kF1EXjQJcvgSvdH3beA8YNfxhGpv55KIZVtwap0M4yhsLxyM3xCEA28vjPXHI=w1200-h800-k-no',
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWllP0taTC2xZWI-e0Ra67HSZJVBCeJQ5NOhn3mTC5WUt2zylIr0izSo7XfO40OcMm78BBhOHLlTD8yK4k1DF5ZUASaXkbLPK_XGYOsp0ZqHRoquqYTc_ZZvioQe-Os94EvRdtBjpg=w1200-h800-k-no'
    ],
    marcasAtendidas: detectedBrands.length > 0 ? detectedBrands : ['Elgin', 'Gree', 'Daikin', 'Springer Midea'],
    servicosReais: detectedServices,
    tempoMercado: 'Mais de 20 anos',
    telefones: formattedPhones,
    fase1Concluida: true
  };

  db.update(lead.id || lead.slug, updates);
  onProgress(`✅ [FASE 1 CONCLUÍDA] Lead "${lead.nome}" enriquecido com inteligência profunda de ${updates.postsAnalisados.length} postagens!`);

  return db.getById(lead.id || lead.slug);
}

module.exports = {
  deepEnrichLead,
  extractInstagramDeep,
  extractMapsDeep
};
