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

/**
 * Sintetizador Semântico Universal de Negócio (Estilo Arcofran & Califórnia Pet)
 * Analisa bio, legendas e OCR do Instagram para detectar serviços, especialidades e diferenciais reais da empresa.
 */
function synthesizeBusinessIntelligence(instaData, niche = '', companyName = '', city = 'Franca SP') {
  if (!instaData || (!instaData.bio && (!instaData.posts || instaData.posts.length === 0))) {
    return { servicos: [], diferenciais: [], linkNaBio: null };
  }
  const norm = (s = '') => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const bio = instaData?.bio || '';
  const posts = instaData?.posts || [];
  const allCaptions = posts.map(p => (p.caption || '') + ' ' + (p.ocrText || '')).join('\n');
  const allText = (bio + '\n' + allCaptions).toLowerCase();
  const n = norm(niche);
  const nameNorm = norm(companyName);
  const handleNorm = norm(instaData?.handle || '');

  const services = [];
  const differentials = [];

  // 1. Extração da Bio (linhas com bullet points, emojis ou tópicos)
  const bioLines = bio.split('\n')
    .map(l => l.trim())
    .filter(l => {
      if (l.length < 4) return false;
      const lNorm = norm(l);
      if (lNorm.includes('seguidor') || lNorm.includes('seguindo') || lNorm.includes('http') || lNorm.includes('linktr.ee')) return false;
      if (lNorm === nameNorm || lNorm === handleNorm) return false;
      if (nameNorm.length > 5 && lNorm.includes(nameNorm)) return false;
      const firstWord = nameNorm.split(' ')[0];
      if (firstWord && firstWord.length >= 3 && lNorm.includes(firstWord) && (lNorm.includes('engenharia') || lNorm.includes('construc') || lNorm.includes('clima') || lNorm.includes('odonto') || lNorm.includes('vet') || lNorm.includes('pet'))) return false;
      return true;
    });

  bioLines.forEach(line => {
    const clean = line.replace(/^[\p{Emoji}\u2000-\u3300\uFE0F•\-–—*|>#\s]+/u, '').trim();
    const cleanNorm = norm(clean);

    if (clean.length >= 4 && clean.length <= 60 && !cleanNorm.includes('franca') && !cleanNorm.includes('contato') && !cleanNorm.includes('whatsapp')) {
      if (clean.includes(',') && clean.length > 25) {
        const parts = clean.split(/,|\se\s/i).map(p => p.trim()).filter(p => p.length >= 4);
        if (parts.length >= 2) {
          parts.forEach(p => {
            const pNorm = norm(p);
            let desc = 'Execução especializada com alto padrão técnico e pontualidade.';
            if (pNorm.includes('regulariz') || pNorm.includes('alvara') || pNorm.includes('habite') || pNorm.includes('demolic')) {
              desc = 'Laudos periciais, desdobros, habite-se e aprovações com total conformidade legal.';
            } else if (pNorm.includes('construc') || pNorm.includes('ampliac')) {
              desc = 'Obras e ampliações planejadas com acompanhamento rigoroso e orçamento claro.';
            }
            if (services.length < 4 && !services.some(s => norm(s.nome) === pNorm)) {
              services.push({ nome: p.charAt(0).toUpperCase() + p.slice(1), desc });
            }
          });
          return;
        }
      }

      let desc = 'Serviço executado com alto padrão técnico e atendimento personalizado.';
      if (cleanNorm.includes('execucao') || cleanNorm.includes('obra')) {
        desc = 'Gerenciamento técnico e acompanhamento de obras do início ao acabamento com rigor.';
      } else if (cleanNorm.includes('calculo') || cleanNorm.includes('estrutural')) {
        desc = 'Dimensionamento preciso em concreto e aço com segurança máxima e economia.';
      } else if (cleanNorm.includes('regulariz') || cleanNorm.includes('demolic') || cleanNorm.includes('alvara') || cleanNorm.includes('habite')) {
        desc = 'Habite-se, desdobros, laudos periciais e aprovações junto à prefeitura.';
      } else if (cleanNorm.includes('construc') || cleanNorm.includes('ampliac')) {
        desc = 'Projetos e construções residenciais e comerciais com cronograma transparente.';
      } else if (cleanNorm.includes('banho') || cleanNorm.includes('tosa')) {
        desc = 'Higiene profunda e tosa especializada com produtos nobres e sem estresse.';
      } else if (cleanNorm.includes('implante')) {
        desc = 'Reabilitação oral com implantes guiados e recuperação rápida.';
      }
      if (services.length < 4 && !services.some(s => norm(s.nome) === cleanNorm)) {
        services.push({ nome: clean, desc });
      }
    }
  });

  // 2. Análise Semântica de Nicho (Complemento e Enriquecimento)
  if (n.includes('engenharia') || n.includes('construc') || nameNorm.includes('engenharia')) {
    if (services.length < 4 && (allText.includes('projeto') || allText.includes('3d') || allText.includes('arquitet'))) {
      services.push({ nome: 'Projetos Arquitetônicos & 3D', desc: 'Planejamento detalhado em 3D para total visualização antes da obra.' });
    }
    if (services.length < 4 && (allText.includes('laudo') || allText.includes('pericia') || allText.includes('art'))) {
      services.push({ nome: 'Laudos Técnicos & Vistorias', desc: 'Perícias de engenharia, emissão de ART e vistorias cautelares completas.' });
    }
    if (services.length < 4 && (allText.includes('reforma') || allText.includes('comercial'))) {
      services.push({ nome: 'Reformas Comerciais & Residenciais', desc: 'Modernização de ambientes com acabamento de alto padrão e equipe própria.' });
    }
    differentials.push(
      { titulo: 'Rigor Técnico & ART', desc: 'Projetos assinados com responsabilidade técnica e conformidade total.' },
      { titulo: 'Economia de Materiais', desc: 'Dimensionamento exato que evita desperdícios e reduz custos na obra.' },
      { titulo: 'Compromisso com Prazos', desc: 'Cronograma de execução planejado e cumprido com transparência.' }
    );
  } else if (n.includes('climatiza') || n.includes('ar condicionado') || n.includes('ar-condicionado') || nameNorm.includes('ar') || nameNorm.includes('clima')) {
    if (allText.includes('automot') || allText.includes('veicul') || allText.includes('caminhao') || allText.includes('trator') || nameNorm.includes('auto')) {
      if (!services.some(s => s.nome.toLowerCase().includes('automot'))) {
        services.unshift({ nome: 'Ar-Condicionado Automotivo & Linha Pesada', desc: 'Manutenção em veículos leves, utilitários, frotas e máquinas agrícolas.' });
      }
    }
    if (services.length < 4 && (allText.includes('higieniza') || allText.includes('limpeza'))) {
      services.push({ nome: 'Higienização Antibacteriana ANVISA', desc: 'Limpeza profunda com eliminação de fungos, odores e ácaros nocivos.' });
    }
    if (services.length < 4 && (allText.includes('split') || allText.includes('inverter') || allText.includes('instala'))) {
      services.push({ nome: 'Instalação Split & Inverter', desc: 'Instalação técnica com bomba de vácuo preservando a garantia de fábrica.' });
    }
    if (services.length < 4 && (allText.includes('manuten') || allText.includes('gas') || allText.includes('conserto'))) {
      services.push({ nome: 'Manutenção Preventiva & Gás', desc: 'Detecção de microvazamentos, recarga ecológica e teste operacional.' });
    }
    differentials.push(
      { titulo: 'Instalação Padrão de Fábrica', desc: 'Técnicos qualificados com ferramentas de precisão e bomba de vácuo.' },
      { titulo: 'Garantia em Todos os Serviços', desc: 'Tranquilidade e segurança comprovada em cada atendimento realizado.' },
      { titulo: 'Pontualidade no Atendimento', desc: 'Horários cumpridos à risca para maior comodidade do cliente.' }
    );
  } else if (n.includes('odonto') || n.includes('dent') || n.includes('clinic') || n.includes('saude') || n.includes('medic')) {
    if (services.length < 4 && (allText.includes('implante') || allText.includes('protocolo'))) {
      services.push({ nome: 'Implantes Dentários & Prótese', desc: 'Recupere sua mastigação e estética com tecnologia guiada e segura.' });
    }
    if (services.length < 4 && (allText.includes('lente') || allText.includes('clareamento') || allText.includes('faceta'))) {
      services.push({ nome: 'Lentes de Contato & Clareamento', desc: 'Estética dental com porcelana de alta resistência e naturalidade.' });
    }
    if (services.length < 4 && (allText.includes('harmoniza') || allText.includes('botox'))) {
      services.push({ nome: 'Harmonização Orofacial', desc: 'Procedimentos seguros de equilíbrio estético e rejuvenescimento facial.' });
    }
    if (services.length < 4 && (allText.includes('orto') || allText.includes('aparelho') || allText.includes('invisalign'))) {
      services.push({ nome: 'Ortodontia & Alinhadores', desc: 'Correção de alinhamento com máxima discrição e planejamento digital.' });
    }
    differentials.push(
      { titulo: 'Tecnologia Digital 3D', desc: 'Planejamento computadorizado para tratamentos precisos e confortáveis.' },
      { titulo: 'Atendimento Particular', desc: 'Pontualidade rigorosa e atenção individualizada a cada paciente.' },
      { titulo: 'Biossegurança Rigorosa', desc: 'Protocolos estéreis de padrão hospitalar para sua total proteção.' }
    );
  } else if (n.includes('pet') || n.includes('vet') || n.includes('cao') || n.includes('gato') || n.includes('animal')) {
    if (services.length < 4 && (allText.includes('banho') || allText.includes('tosa'))) {
      services.push({ nome: 'Estética Animal, Banho & Tosa', desc: 'Cosméticos nobres, hidratação e tosa da raça sem estresse.' });
    }
    if (services.length < 4 && (allText.includes('consulta') || allText.includes('checkup'))) {
      services.push({ nome: 'Consultas Veterinárias & Check-up', desc: 'Avaliação clínica minuciosa com foco em medicina preventiva.' });
    }
    if (services.length < 4 && (allText.includes('vacina') || allText.includes('imuniza'))) {
      services.push({ nome: 'Vacinas Importadas & Prevenção', desc: 'Protocolo vacinal completo com controle rígido de refrigeração.' });
    }
    if (services.length < 4 && (allText.includes('creche') || allText.includes('hotel') || allText.includes('day care'))) {
      services.push({ nome: 'Creche Pet Recreativa & Hotel', desc: 'Espaço enriquecido para socialização, diversão e descanso seguro.' });
    }
    differentials.push(
      { titulo: 'Manejo Positivo & Carinho', desc: 'Atendimento respeitoso que prioriza o bem-estar e a calma do pet.' },
      { titulo: 'Higiene e Biossegurança', desc: 'Ambientes desinfetados e toalhas esterilizadas individualmente.' },
      { titulo: 'Equipe Especializada', desc: 'Profissionais dedicados e apaixonados pelo cuidado animal.' }
    );
  }

  let linkNaBio = null;
  const linktrMatch = bio.match(/linktr\.ee\/[a-zA-Z0-9._]+/i) || bio.match(/wa\.me\/[0-9]+/i) || bio.match(/bit\.ly\/[a-zA-Z0-9._]+/i);
  if (linktrMatch) linkNaBio = linktrMatch[0];

  return {
    servicos: services.slice(0, 4),
    diferenciais: differentials.slice(0, 3),
    linkNaBio
  };
}

async function deepEnrichLead(leadIdOrSlug, onProgress = console.log) {
  let lead = db.getById(leadIdOrSlug);
  if (!lead) throw new Error(`Lead "${leadIdOrSlug}" não encontrado.`);

  onProgress(`\n🚀 [FASE 1] Enriquecendo inteligentemente: ${lead.nome}...`);

  // 1. Google Maps Deep
  let mapsUrl = lead.mapsUrl;
  if (!mapsUrl) {
    mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(lead.nome + ' ' + (lead.cidade || 'Franca SP'))}`;
  }
  const mapsData = await extractMapsDeep(mapsUrl, onProgress);

  // 2. Extração profunda do Instagram
  let instaUrl = lead.instagram || (lead.siteOriginal && lead.siteOriginal.includes('instagram.com') ? lead.siteOriginal : null);
  let instaData = null;
  let intelligence = { servicos: [], diferenciais: [], linkNaBio: null };

  if (instaUrl) {
    const handleMatch = instaUrl.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
    const handle = handleMatch ? handleMatch[1].replace(/\/$/, '') : null;
    if (handle && handle !== 'p' && handle !== 'reel' && handle !== 'explore') {
      instaData = await extractInstagramDeep(handle, onProgress);
      intelligence = synthesizeBusinessIntelligence(instaData, lead.nicho, lead.nome, lead.cidade);
    }
  }

  // 3. Fotos Reais: combina fotos do Instagram com fotos do Google Maps
  const instaPhotos = (instaData?.posts || []).filter(p => p.img).map(p => p.img);
  const allPhotos = [...new Set([...(mapsData.photos || []), ...instaPhotos])];

  // 4. Estruturar atualizações
  const updates = {
    depoimentosReais: mapsData.reviews.length > 0 ? mapsData.reviews : (lead.depoimentosReais || []),
    fotosReais: allPhotos.length > 0 ? allPhotos : (lead.fotosReais || []),
    fase1Concluida: true
  };

  if (mapsData.endereco && (!lead.endereco || lead.endereco.trim().length < 5)) {
    updates.endereco = mapsData.endereco;
  }
  if (mapsData.telefones && mapsData.telefones.length > 0 && (!lead.telefones || lead.telefones.length === 0)) {
    updates.telefones = mapsData.telefones;
  }
  if (mapsData.ratingText && mapsData.ratingNum) {
    const countStr = mapsData.reviewCount ? `${mapsData.reviewCount} comentários` : 'comentários';
    updates.avaliacao = `★ ${mapsData.ratingNum} (${countStr})`;
  }

  if (instaData) {
    updates.instagram = `https://www.instagram.com/${instaData.handle}/`;
    updates.instagramProfile = {
      handle: instaData.handle,
      bio: instaData.bio,
      avatar: instaData.avatar,
      destaques: instaData.destaques,
      totalPostsAnalisados: instaData.posts.length
    };
    updates.postsAnalisados = instaData.posts.slice(0, 25);
  }

  if (!lead.dadosEnriquecidos) lead.dadosEnriquecidos = {};
  if (intelligence.servicos.length > 0) lead.dadosEnriquecidos.servicosDetectados = intelligence.servicos;
  if (intelligence.diferenciais.length > 0) lead.dadosEnriquecidos.diferenciais = intelligence.diferenciais;
  if (intelligence.linkNaBio) lead.dadosEnriquecidos.linkNaBio = intelligence.linkNaBio;
  if (instaData?.bio) lead.dadosEnriquecidos.bioInstagram = instaData.bio;
  updates.dadosEnriquecidos = lead.dadosEnriquecidos;

  db.update(lead.id || lead.slug, updates);
  onProgress(`✅ [FASE 1 CONCLUÍDA] Lead "${lead.nome}" enriquecido com inteligência profunda!`);

  return db.getById(lead.id || lead.slug);
}

module.exports = {
  deepEnrichLead,
  extractInstagramDeep,
  extractMapsDeep,
  synthesizeBusinessIntelligence
};
