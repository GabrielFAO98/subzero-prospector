const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const db = require('./db');
const { searchLeadsGoogleMaps, enrichLead } = require('./scraper');
const { generatePrototype, generateOutreachMessages } = require('./generator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Servir frontend do Dashboard e pasta de previews dos sites
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/previews', express.static(path.join(__dirname, '..', 'previews')));

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
app.post('/api/prospect', async (req, res) => {
  const { niche, city = 'Franca SP', limit = 5 } = req.body;
  if (!niche) {
    return res.status(400).json({ error: 'Nicho é obrigatório.' });
  }

  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 5), 5);
  console.log(`\n🌐 [Dashboard API] Requisição de prospecção: "${niche}" em "${city}" (Limite Estrito: ${safeLimit})`);
  
  try {
    const rawLeads = await searchLeadsGoogleMaps(niche, city, safeLimit);
    res.json({
      success: true,
      message: `${rawLeads.length} empresas mineradas e catalogadas.`,
      newLeads: rawLeads,
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

// Rota: Gerar protótipo Subzero sob demanda
app.post('/api/leads/:id/generate', async (req, res) => {
  let lead = db.getById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

  try {
    const { template = 'subzero' } = req.body || {};
    // Garante que o WhatsApp principal e dados estejam preenchidos
    if (!lead.whatsappPrincipal && lead.telefones && lead.telefones[0]) {
      const num = lead.telefones[0].replace(/\D/g, '');
      lead.whatsappPrincipal = num.length === 11 ? '55' + num : num;
    }

    lead.templateEscolhido = template;
    lead = await generatePrototype(lead, template);
    res.json({ success: true, lead, stats: db.getStats() });
  } catch (err) {
    console.error('Erro ao gerar protótipo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota: Atualizar status ou anotações do lead
app.patch('/api/leads/:id', (req, res) => {
  const { status, anotacoes, motivoDescarte } = req.body;
  const updates = {};
  if (status !== undefined) updates.status = status;
  if (anotacoes !== undefined) updates.anotacoes = anotacoes;
  if (motivoDescarte !== undefined) updates.motivoDescarte = motivoDescarte;

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

