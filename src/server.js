const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const db = require('./db');
const agentMonitor = require('./agent_monitor');
const { searchLeadsGoogleMaps, enrichLead } = require('./scraper');
const { generatePrototype, generateOutreachMessages } = require('./generator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Servir frontend do Dashboard e pasta de previews dos sites
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/previews', express.static(path.join(__dirname, '..', 'previews')));
app.use('/templates', express.static(path.join(__dirname, '..', 'templates')));

// Rota: Listar leads com filtros
app.get('/api/leads', (req, res) => {
  const { status, nicho, categoria, search } = req.query;
  const leads = db.getAll({ status, nicho, categoria, search });
  res.json({ leads, stats: db.getStats(), categories: db.getCategories() });
});

// Rota: Estatísticas do Dashboard
app.get('/api/stats', (req, res) => {
  res.json(db.getStats());
});

// Rota: Categorias de Negócio Catalogadas
app.get('/api/categories', (req, res) => {
  res.json({ categories: db.getCategories() });
});

// Rota: Disparar mineração de leads em tempo real
let isProspectingActive = false;

app.post('/api/prospect', async (req, res) => {
  if (isProspectingActive) {
    return res.status(429).json({
      success: false,
      error: '⚠️ Uma mineração já está sendo executada no momento. Aguarde alguns instantes para não sobrecarregar os motores de busca.'
    });
  }
  isProspectingActive = true;
  const { niche, city = 'Franca SP', limit = 5 } = req.body;
  if (!niche) {
    return res.status(400).json({ error: 'Nicho é obrigatório.' });
  }

  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 5), 5);
  console.log(`\n🌐 [Dashboard API] Requisição de prospecção: "${niche}" em "${city}" (Limite Estrito: ${safeLimit})`);
  
  try {
    const rawLeads = await searchLeadsGoogleMaps(niche, city, safeLimit);
    const newLeads = rawLeads.filter(l => l._isNew === true);
    const existingLeads = rawLeads.filter(l => l._isNew === false);

    res.json({
      success: true,
      message: `${rawLeads.length} empresas analisadas: ${newLeads.length} nova(s) e ${existingLeads.length} já cadastrada(s).`,
      totalFound: rawLeads.length,
      newCount: newLeads.length,
      existingCount: existingLeads.length,
      newLeads,
      existingLeads,
      rawLeads,
      leads: db.getAll(),
      stats: db.getStats()
    });
  } catch (err) {
    console.error('Erro na rota de prospecção:', err);
    if (process.env.VERCEL || err.message.includes('Executable') || err.message.includes('browserType')) {
      return res.status(200).json({
        success: false,
        error: 'A raspagem em tempo real via Playwright roda no ambiente local. No Vercel, utilize o painel para consultar a base de leads, visualizar protótipos e gerenciar contatos.'
      });
    }
    res.status(500).json({ error: err.message });
  } finally {
    isProspectingActive = false;
  }
});

// Rota: Enriquecer redes sociais e contatos do lead
app.post('/api/leads/:id/enrich', async (req, res) => {
  const lead = db.getById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

  try {
    const enriched = await enrichLead(lead);
    res.json({ success: true, lead: enriched, stats: db.getStats() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota: Gerar protótipo Subzero sob demanda com Mineração Profunda do Google Maps
app.post('/api/leads/:id/generate', async (req, res) => {
  let lead = db.getById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

  try {
    const { template = 'industrial', archetype, forceEnrich = false } = req.body || {};
    const chosenArchetype = archetype || template;

    // Marca status transitório
    db.update(lead.id, { status: 'gerando_prototipo' });

    // Verifica se a empresa já possui dados salvos para evitar nova mineração demorada
    const hasStoredData = Boolean(
      (lead.depoimentosReais && lead.depoimentosReais.length > 0) ||
      (lead.dadosEnriquecidos && Object.keys(lead.dadosEnriquecidos).length > 0) ||
      (lead.fotosReais && lead.fotosReais.length > 0) ||
      lead.prototypePath
    );

    const isForce = forceEnrich === true || forceEnrich === 'true';
    const shouldMineMaps = isForce || (!hasStoredData && (!lead.depoimentosReais || lead.depoimentosReais.length === 0));

    if (!isForce && hasStoredData) {
      console.log(`\n⚡ [Regerar Rápido] Recompilando protótipo para: "${lead.nome}" (${chosenArchetype}) usando dados já salvos no banco...`);
    }

    // 1. Mineração Profunda de Avaliações e Dados Reais no Google Maps (Playwright)
    const mapsUrl = lead.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(lead.nome + ' ' + (lead.cidade || 'Franca SP'))}`;

    if (shouldMineMaps) {
      console.log(`\n🔍 [Deep Mining] Minerando dados autênticos do Google Maps para: "${lead.nome}"...`);
      try {
        const { extractMapsDeep } = require('./deep_extractor');
        const mapsData = await extractMapsDeep(mapsUrl, msg => console.log('  📍 [Maps]', msg));

        const updates = {};
        if (mapsData.reviews && mapsData.reviews.length > 0) {
          updates.depoimentosReais = mapsData.reviews;
          console.log(`  ⭐ [Maps] ${mapsData.reviews.length} avaliações autênticas 5★ extraídas com sucesso!`);
        }
        if (mapsData.photos && mapsData.photos.length > 0) {
          updates.fotosReais = mapsData.photos;
        }
        if (mapsData.endereco && (!lead.endereco || lead.endereco.trim().length < 5)) {
          updates.endereco = mapsData.endereco;
          console.log(`  📍 [Maps] Endereço real detectado: "${mapsData.endereco}"`);
        }
        if (mapsData.telefones && mapsData.telefones.length > 0 && (!lead.telefones || lead.telefones.length === 0)) {
          updates.telefones = mapsData.telefones;
        }
        if (mapsData.ratingText && mapsData.ratingNum) {
          const countStr = mapsData.reviewCount ? `${mapsData.reviewCount} comentários` : 'comentários';
          updates.avaliacao = `★ ${mapsData.ratingNum} (${countStr})`;
        }

        db.update(lead.id, updates);
        lead = db.getById(lead.id);
      } catch (scrapErr) {
        console.warn('⚠️ [Deep Mining] Falha ao extrair Maps (seguindo com fallback de alta qualidade):', scrapErr.message);
      }
    }

    // 1.5 Mineração Profunda de Redes Sociais / Instagram (Bio, Destaques, Postagens & Legendas estilo Arcofran)
    const instaUrl = lead.instagram || (lead.siteOriginal && lead.siteOriginal.includes('instagram.com') ? lead.siteOriginal : null);
    const shouldMineInsta = isForce || (!hasStoredData && !lead.dadosEnriquecidos?.servicosDetectados?.length);
    if (instaUrl && shouldMineInsta) {
      console.log(`\n📸 [Instagram Deep] Minerando bio, legendas e postagens de: "${instaUrl}"...`);
      try {
        const handleMatch = instaUrl.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
        const handle = handleMatch ? handleMatch[1].replace(/\/$/, '') : null;
        if (handle && handle !== 'p' && handle !== 'reel' && handle !== 'explore') {
          const { extractInstagramDeep, synthesizeBusinessIntelligence } = require('./deep_extractor');
          const instaData = await extractInstagramDeep(handle, msg => console.log('  📱 [Instagram]', msg));

          if (instaData) {
            const intelligence = synthesizeBusinessIntelligence(instaData, lead.nicho, lead.nome, lead.cidade);

            const updates = {
              instagram: `https://www.instagram.com/${handle}/`,
              instagramProfile: {
                handle: instaData.handle,
                bio: instaData.bio,
                avatar: instaData.avatar,
                destaques: instaData.destaques,
                totalPostsAnalisados: instaData.posts.length
              }
            };

            const postImgs = instaData.posts.filter(p => p.img).map(p => p.img);
            if (postImgs.length > 0) {
              const existingPhotos = lead.fotosReais || [];
              updates.fotosReais = [...new Set([...postImgs, ...existingPhotos])];
            }

            if (!lead.dadosEnriquecidos) lead.dadosEnriquecidos = {};
            lead.dadosEnriquecidos.bioInstagram = instaData.bio;
            if (Array.isArray(intelligence.servicos) && intelligence.servicos.length >= 2) {
              lead.dadosEnriquecidos.servicosDetectados = intelligence.servicos;
            }
            if (Array.isArray(intelligence.diferenciais) && intelligence.diferenciais.length >= 2) {
              lead.dadosEnriquecidos.diferenciais = intelligence.diferenciais;
            }
            if (intelligence.linkNaBio) lead.dadosEnriquecidos.linkNaBio = intelligence.linkNaBio;
            updates.dadosEnriquecidos = lead.dadosEnriquecidos;

            db.update(lead.id, updates);
            lead = db.getById(lead.id);
            console.log(`  ✨ [Instagram] ${intelligence.servicos.length} serviços reais minerados com sucesso!`);
          }
        }
      } catch (instaErr) {
        console.warn('⚠️ [Instagram Deep] Falha ao extrair Instagram (seguindo com fallback):', instaErr.message);
      }
    }

    // 2. Garante que o WhatsApp principal e dados estejam preenchidos
    if (!lead.whatsappPrincipal && lead.telefones && lead.telefones[0]) {
      const num = lead.telefones[0].replace(/\D/g, '');
      lead.whatsappPrincipal = num.length === 11 ? '55' + num : num;
    }

    lead.templateEscolhido = chosenArchetype;

    // 3. Constrói o protótipo com os dados reais
    lead = await generatePrototype(lead, chosenArchetype);
    lead.status = 'prototipo_pronto';
    db.update(lead.id, { status: 'prototipo_pronto', templateEscolhido: chosenArchetype, archetype: chosenArchetype });

    res.json({ success: true, lead, stats: db.getStats() });
  } catch (err) {
    console.error('Erro ao gerar protótipo:', err);
    db.update(lead.id, { status: lead.prototypeUrl ? 'prototipo_pronto' : 'oportunidade_quente' });
    res.status(500).json({ error: err.message });
  }
});

// Rota: Atualizar status, dados da empresa ou anotações do lead
app.patch('/api/leads/:id', (req, res) => {
  const { status, anotacoes, motivoDescarte, nome, instagram, facebook, whatsapp, siteOriginal } = req.body;
  const updates = {};
  if (status !== undefined) updates.status = status;
  if (anotacoes !== undefined) updates.anotacoes = anotacoes;
  if (motivoDescarte !== undefined) updates.motivoDescarte = motivoDescarte;

  if (nome !== undefined && typeof nome === 'string' && nome.trim()) {
    updates.nome = nome.trim();
  }

  if (instagram !== undefined) {
    let ig = (instagram || '').trim();
    if (ig && !ig.startsWith('http')) {
      ig = ig.replace(/^@/, '');
      ig = `https://www.instagram.com/${ig}/`;
    }
    updates.instagram = ig || null;
  }

  if (facebook !== undefined) {
    let fb = (facebook || '').trim();
    if (fb && !fb.startsWith('http')) {
      fb = fb.replace(/^@/, '');
      fb = `https://www.facebook.com/${fb}/`;
    }
    updates.facebook = fb || null;
  }

  if (whatsapp !== undefined) {
    const raw = (whatsapp || '').trim();
    const digits = raw.replace(/\D/g, '');
    if (digits.length >= 10) {
      const waNumber = digits.startsWith('55') ? digits : `55${digits}`;
      updates.whatsappPrincipal = waNumber;
      const ddd = digits.slice(-11, -9);
      const num = digits.slice(-9);
      updates.whatsappFormatado = `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
    } else {
      updates.whatsappPrincipal = digits || null;
      updates.whatsappFormatado = raw || null;
    }
  }

  if (siteOriginal !== undefined) {
    updates.siteOriginal = (siteOriginal || '').trim() || null;
  }

  // Registrar histórico se status mudou para contatado
  if (status === 'contatado') {
    const current = db.getById(req.params.id);
    if (current) {
      const history = current.historicoContatos || [];
      history.push({
        data: new Date().toISOString(),
        tipo: 'WhatsApp / Contato Direto',
        nota: anotacoes || 'Abordagem realizada'
      });
      updates.historicoContatos = history;
    }
  }

  const updated = db.update(req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Lead não encontrado.' });

  res.json({ success: true, lead: updated, stats: db.getStats() });
});

// Rota: Deletar lead
app.delete('/api/leads/:id', (req, res) => {
  const ok = db.delete(req.params.id);
  res.json({ success: ok, stats: db.getStats() });
});


// ==========================================
// ROTAS DE CRM & FUNIL DE NEGOCIAÇÃO KANBAN
// ==========================================

// Rota: Listar leads no CRM
app.get('/api/crm', (req, res) => {
  const allLeads = db.getAll();
  const crmLeads = allLeads.filter(l => l.inCrm === true);
  res.json({ success: true, crmLeads, total: crmLeads.length });
});

// Rota: Atualizar dados de CRM de um lead (stage, valor, notas, etc)
app.patch('/api/crm/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const updated = db.update(id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Lead não encontrado.' });
  }
  res.json({ success: true, lead: updated });
});

// Rota: Adicionar lead existente ao Funil CRM
app.post('/api/crm/add/:id', (req, res) => {
  const { id } = req.params;
  const { stage = 'contato_enviado', valor = 1500 } = req.body || {};
  const updated = db.update(id, {
    inCrm: true,
    crmStage: stage,
    crmValor: valor,
    crmUltimoContato: new Date().toISOString()
  });
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Lead não encontrado.' });
  }
  res.json({ success: true, lead: updated });
});

// ==========================================
// ROTAS DO AGENTE AUTÔNOMO (LIVE OPS & SSE)
// ==========================================

// Stream SSE para logs e status em tempo real
app.get('/api/agent/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  agentMonitor.addSseClient(res);
});

// Status atual do agente
app.get('/api/agent/status', (req, res) => {
  res.json(agentMonitor.getState());
});

// Disparo de auditoria autônoma de um lead
app.post('/api/agent/trigger', async (req, res) => {
  const { leadId } = req.body || {};
  if (!leadId) {
    return res.status(400).json({ success: false, error: 'leadId é obrigatório.' });
  }

  try {
    // Executa em background para não bloquear a resposta HTTP
    agentMonitor.runAutonomousJob(leadId).catch(err => {
      console.error('Erro na execução assíncrona do agente:', err.message);
    });

    res.json({ success: true, message: 'Operação autônoma iniciada com sucesso.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n======================================================`);
    console.log(`❄️ SUBZERO PROSPECTOR DASHBOARD`);
    console.log(`Painel visual disponível em: ${url}`);
    console.log(`======================================================\n`);

    // Abre automaticamente no navegador padrão do Gabriel no Windows
    if (process.platform === 'win32') {
      try { exec(`start ${url}`); } catch (_) {}
    }
  });
}

module.exports = app;

