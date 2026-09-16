const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'leads.db.json');
const LEGACY_FILE = path.join(__dirname, '..', 'leads.json');
const { getCategoryForLead } = require('./categories');

function normalizeName(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

class LeadDatabase {
  constructor() {
    this.leads = this.init();
  }

  init() {
    const tmpFile = '/tmp/leads.db.json';
    if (fs.existsSync(tmpFile)) {
      try {
        return JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
      } catch (_) {}
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      } catch (err) {
        console.error('Erro ao carregar leads.db.json, criando novo:', err.message);
        return [];
      }
    }

    // Migração de leads.json anterior se existir
    if (fs.existsSync(LEGACY_FILE)) {
      try {
        const legacy = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf-8'));
        console.log(`📦 Migrando ${legacy.length} leads anteriores para o novo banco de histórico...`);
        const migrated = legacy.map((l, idx) => ({
          id: `lead_${Date.now()}_${idx}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...l,
          status: l.prototypePath ? 'prototipo_pronto' : (l.status === 'enriquecido' ? 'oportunidade_quente' : (l.status || 'oportunidade_quente')),
          anotacoes: '',
          historicoContatos: []
        }));
        this.save(migrated);
        return migrated;
      } catch (_) {}
    }

    this.save([]);
    return [];
  }

  load() {
    const tmpFile = '/tmp/leads.db.json';
    if (fs.existsSync(tmpFile)) {
      try {
        this.leads = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
        return this.leads;
      } catch (_) {}
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        this.leads = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        let needsSave = false;
        this.leads.forEach(l => {
          if (!l.categoria || !l.categoria.slug) {
            l.categoria = getCategoryForLead(l);
            needsSave = true;
          }
        });
        if (needsSave) this.save();
      } catch (err) {
        console.error('Erro ao ler DB_FILE:', err.message);
      }
    }
    return this.leads;
  }

  save(data = null) {
    if (data !== null) this.leads = data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.leads, null, 2), 'utf-8');
    } catch (err) {
      // Em ambientes de nuvem somente leitura (ex: Vercel Lambda), grava em /tmp
      try {
        fs.writeFileSync('/tmp/leads.db.json', JSON.stringify(this.leads, null, 2), 'utf-8');
      } catch (_) {}
    }
  }

  getAll(filters = {}) {
    this.load();
    let result = [...this.leads];

    if (filters.status && filters.status !== 'todos') {
      result = result.filter(l => l.status === filters.status);
    }

    if (filters.categoria && filters.categoria !== 'todas') {
      result = result.filter(l => l.categoria && l.categoria.slug === filters.categoria);
    }

    if (filters.nicho && filters.nicho !== 'todos') {
      result = result.filter(l => l.nicho.toLowerCase().includes(filters.nicho.toLowerCase()));
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(l => 
        l.nome.toLowerCase().includes(q) ||
        (l.categoria && l.categoria.nome.toLowerCase().includes(q)) ||
        (l.whatsappFormatado && l.whatsappFormatado.includes(q)) ||
        (l.telefones && l.telefones.some(t => t.includes(q))) ||
        (l.motivoDescarte && l.motivoDescarte.toLowerCase().includes(q))
      );
    }

    // Ordenar: Oportunidades quentes e protótipos primeiro, mais recentes primeiro
    return result.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }

  getById(id) {
    this.load();
    return this.leads.find(l => l.id === id || l.slug === id);
  }

  findExisting(nome, telefones = [], mapsUrl = null) {
    const normName = normalizeName(nome);
    const normPhones = telefones.map(normalizePhone).filter(p => p.length >= 8);

    return this.leads.find(l => {
      if (mapsUrl && l.mapsUrl && l.mapsUrl === mapsUrl) return true;
      if (normName && normalizeName(l.nome) === normName) return true;
      if (l.telefones && l.telefones.length > 0) {
        const existingPhones = l.telefones.map(normalizePhone);
        if (normPhones.some(p => existingPhones.includes(p))) return true;
      }
      return false;
    });
  }

  upsert(leadData) {
    if (!leadData.categoria || !leadData.categoria.slug) {
      leadData.categoria = getCategoryForLead(leadData);
    }
    const existing = this.findExisting(leadData.nome, leadData.telefones, leadData.mapsUrl);

    if (existing) {
      // Atualiza sem perder o histórico de contato ou anotações já feitas
      Object.assign(existing, {
        ...leadData,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
        anotacoes: existing.anotacoes || leadData.anotacoes || '',
        historicoContatos: existing.historicoContatos || leadData.historicoContatos || [],
        status: existing.status || leadData.status
      });
      this.save();
      return { lead: existing, isNew: false };
    }

    const newLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      anotacoes: '',
      historicoContatos: [],
      ...leadData
    };

    this.leads.unshift(newLead);
    this.save();
    return { lead: newLead, isNew: true };
  }

  update(id, updates) {
    const lead = this.getById(id);
    if (!lead) return null;

    Object.assign(lead, updates, {
      updatedAt: new Date().toISOString()
    });

    this.save();
    return lead;
  }

  delete(id) {
    const initialLen = this.leads.length;
    this.leads = this.leads.filter(l => l.id !== id && l.slug !== id);
    if (this.leads.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  getStats() {
    const stats = {
      total: this.leads.length,
      oportunidadesQuentes: 0,
      sitesAtivos: 0,
      prototiposProntos: 0,
      contatados: 0,
      negociando: 0,
      descartados: 0,
      porCategoria: {}
    };

    this.leads.forEach(l => {
      if (l.status === 'oportunidade_quente') stats.oportunidadesQuentes++;
      else if (l.status === 'site_ativo') stats.sitesAtivos++;
      else if (l.status === 'prototipo_pronto') stats.prototiposProntos++;
      else if (l.status === 'contatado') stats.contatados++;
      else if (l.status === 'negociando') stats.negociando++;
      else if (l.status === 'descartado') stats.descartados++;

      const catSlug = (l.categoria && l.categoria.slug) || 'outros';
      stats.porCategoria[catSlug] = (stats.porCategoria[catSlug] || 0) + 1;
    });

    return stats;
  }

  getCategories() {
    this.load();
    const map = new Map();

    this.leads.forEach(l => {
      const cat = l.categoria || getCategoryForLead(l);
      if (!map.has(cat.slug)) {
        map.set(cat.slug, {
          slug: cat.slug,
          nome: cat.nome,
          icone: cat.icone,
          cor: cat.cor,
          badgeClass: cat.badgeClass,
          total: 0,
          oportunidades: 0,
          prototipos: 0
        });
      }
      const entry = map.get(cat.slug);
      entry.total++;
      if (l.status === 'oportunidade_quente') entry.oportunidades++;
      if (l.status === 'prototipo_pronto') entry.prototipos++;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }
}

const db = new LeadDatabase();
module.exports = db;
