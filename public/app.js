let allLeads = [];
let crmLeads = [];
let activeTab = 'oportunidade_quente';
let activeCategory = 'todas';
let allCategories = [];
let currentView = 'table';
let currentSelectedLead = null;
let currentAppView = 'leads'; // 'leads' | 'agent' | 'crm'
let agentEventSource = null;

// ==========================================
// SELETORES DO DOM
// ==========================================

// Navegação & Layout
const appSidebar = document.getElementById('appSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

const navLeads = document.getElementById('navLeads');
const navAgent = document.getElementById('navAgent');
const navCrm = document.getElementById('navCrm');
const navBadgeLeads = document.getElementById('navBadgeLeads');
const navBadgeCrm = document.getElementById('navBadgeCrm');
const agentPulseNav = document.getElementById('agentPulseNav');

const viewLeads = document.getElementById('view-leads');
const viewAgent = document.getElementById('view-agent');
const viewCrm = document.getElementById('view-crm');

const topbarPageTitle = document.getElementById('topbarPageTitle');
const topbarPageSubtitle = document.getElementById('topbarPageSubtitle');
const topbarLiveText = document.getElementById('topbarLiveText');
const topbarPulseDot = document.getElementById('topbarPulseDot');
const sidebarPulse = document.getElementById('sidebarPulse');
const sidebarAgentStatusText = document.getElementById('sidebarAgentStatusText');

// Prospecção & Filtros
const prospectForm = document.getElementById('prospectForm');
const nicheInput = document.getElementById('nicheInput');
const cityInput = document.getElementById('cityInput');
const btnProspect = document.getElementById('btnProspect');
const searchNotice = document.getElementById('searchNotice');
const filterSearch = document.getElementById('filterSearch');
const categoryChips = document.getElementById('categoryChips');

const statTotal = document.getElementById('statTotal');
const statHot = document.getElementById('statHot');
const statOnline = document.getElementById('statOnline');
const statReady = document.getElementById('statReady');
const statContacted = document.getElementById('statContacted');
const statDiscarded = document.getElementById('statDiscarded');

const tableContainer = document.getElementById('tableContainer');
const cardsContainer = document.getElementById('cardsContainer');
const tableBody = document.getElementById('leadsTableBody');
const emptyState = document.getElementById('emptyState');

// Modal de Detalhes do Lead
const leadModal = document.getElementById('leadModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalLeadName = document.getElementById('modalLeadName');
const modalLeadNiche = document.getElementById('modalLeadNiche');
const modalAiText = document.getElementById('modalAiText');
const modalLeadNameDisplay = document.getElementById('modalLeadNameDisplay');
const modalLeadMapsLink = document.getElementById('modalLeadMapsLink');
const modalLeadSite = document.getElementById('modalLeadSite');
const modalLeadWa = document.getElementById('modalLeadWa');
const modalLeadPhones = document.getElementById('modalLeadPhones');
const modalLeadInsta = document.getElementById('modalLeadInsta');
const modalLeadFb = document.getElementById('modalLeadFb');

const btnToggleEditLead = document.getElementById('btnToggleEditLead');
const btnCancelEditLead = document.getElementById('btnCancelEditLead');
const leadEditForm = document.getElementById('leadEditForm');
const leadViewFields = document.getElementById('leadViewFields');
const editLeadName = document.getElementById('editLeadName');
const editLeadInsta = document.getElementById('editLeadInsta');
const editLeadFb = document.getElementById('editLeadFb');
const editLeadWa = document.getElementById('editLeadWa');
const editLeadSite = document.getElementById('editLeadSite');

const modalStatusSelect = document.getElementById('modalStatusSelect');
const modalNotes = document.getElementById('modalNotes');
const btnSaveNotes = document.getElementById('btnSaveNotes');
const btnModalSendToCrm = document.getElementById('btnModalSendToCrm');

const modalWaText = document.getElementById('modalWaText');
const btnCopyWa = document.getElementById('btnCopyWa');
const btnOpenWaWeb = document.getElementById('btnOpenWaWeb');

const modalEmailSubject = document.getElementById('modalEmailSubject');
const modalEmailBody = document.getElementById('modalEmailBody');
const btnCopyEmail = document.getElementById('btnCopyEmail');

const prototypeIframe = document.getElementById('prototypeIframe');
const templateSelector = document.getElementById('templateSelector');
const btnGenerateProto = document.getElementById('btnGenerateProto');
const btnForceEnrichProto = document.getElementById('btnForceEnrichProto');
const btnOpenProtoTab = document.getElementById('btnOpenProtoTab');
const prototypeStatusLabel = document.getElementById('prototypeStatusLabel');

// Elementos do Agente em Tempo Real
const agentRadarCore = document.getElementById('agentRadarCore');
const agentRadarWrapper = document.querySelector('.agent-radar-wrapper');
const agentHeaderStatusText = document.getElementById('agentHeaderStatusText');
const agentHeaderDot = document.getElementById('agentHeaderDot');
const agentCurrentTaskTitle = document.getElementById('agentCurrentTaskTitle');
const agentCurrentTaskDetail = document.getElementById('agentCurrentTaskDetail');
const agentTargetName = document.getElementById('agentTargetName');
const agentTargetNiche = document.getElementById('agentTargetNiche');
const stepperProgressFill = document.getElementById('stepperProgressFill');
const agentProgressInner = document.getElementById('agentProgressInner');
const agentProgressPercent = document.getElementById('agentProgressPercent');
const agentProgressStepText = document.getElementById('agentProgressStepText');
const metricInspected = document.getElementById('metricInspected');
const metricPrototypes = document.getElementById('metricPrototypes');
const metricTimeElapsed = document.getElementById('metricTimeElapsed');
const agentLeadSelect = document.getElementById('agentLeadSelect');
const btnAgentTrigger = document.getElementById('btnAgentTrigger');
const terminalLogsBody = document.getElementById('terminalLogsBody');
const btnClearLogs = document.getElementById('btnClearLogs');

// Elementos do CRM
const crmTotalValue = document.getElementById('crmTotalValue');
const crmTotalCount = document.getElementById('crmTotalCount');
const crmWonCount = document.getElementById('crmWonCount');
const btnOpenAddCrmModal = document.getElementById('btnOpenAddCrmModal');
const crmEditModal = document.getElementById('crmEditModal');
const crmModalCloseBtn = document.getElementById('crmModalCloseBtn');
const crmEditForm = document.getElementById('crmEditForm');
const crmEditLeadId = document.getElementById('crmEditLeadId');
const crmModalLeadName = document.getElementById('crmModalLeadName');
const crmModalLeadNiche = document.getElementById('crmModalLeadNiche');
const crmEditStage = document.getElementById('crmEditStage');
const crmEditValue = document.getElementById('crmEditValue');
const crmEditNotes = document.getElementById('crmEditNotes');
const btnRemoveFromCrm = document.getElementById('btnRemoveFromCrm');

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupEventListeners();
  fetchLeads();
  fetchCrmLeads();
  initAgentMonitor();
});

// ==========================================
// GERENCIAMENTO DE NAVEGAÇÃO & TELAS
// ==========================================

function setupNavigation() {
  navLeads?.addEventListener('click', () => switchView('leads'));
  navAgent?.addEventListener('click', () => switchView('agent'));
  navCrm?.addEventListener('click', () => switchView('crm'));

  mobileMenuBtn?.addEventListener('click', () => {
    appSidebar?.classList.add('open');
    sidebarOverlay?.classList.add('active');
  });

    sidebarOverlay?.addEventListener('click', closeMobileSidebar);
}

function closeMobileSidebar() {
  appSidebar?.classList.remove('open');
  sidebarOverlay?.classList.remove('active');
}

function switchView(viewName) {
  currentAppView = viewName;
  closeMobileSidebar();

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.app-view').forEach(el => el.style.display = 'none');

  if (viewName === 'leads') {
    navLeads?.classList.add('active');
    if (viewLeads) viewLeads.style.display = 'block';
    topbarPageTitle.textContent = '🎯 Prospecção & Qualificação de Leads';
    topbarPageSubtitle.textContent = 'Mineração autônoma no Google Maps e inteligência de redes sociais';
    render();
  } else if (viewName === 'agent') {
    navAgent?.classList.add('active');
    if (viewAgent) viewAgent.style.display = 'block';
    topbarPageTitle.textContent = '⚡ Operação do Agente Autônomo';
    topbarPageSubtitle.textContent = 'Monitoramento visual em tempo real dos processos e etapas de mineração';
    refreshAgentLeadDropdown();
    fetchAgentSnapshot();
  } else if (viewName === 'crm') {
    navCrm?.classList.add('active');
    if (viewCrm) viewCrm.style.display = 'block';
    topbarPageTitle.textContent = '💼 Funil de Negociação & CRM';
    topbarPageSubtitle.textContent = 'Gestão do pipeline de vendas, empresas contatadas e fechamento de contratos';
    fetchCrmLeads();
  }
}

// ==========================================
// MÓDULO 1: PROSPECÇÃO & LEADS
// ==========================================

async function fetchLeads() {
  try {
    const res = await fetch('/api/leads');
    const data = await res.json();
    allLeads = data.leads || [];
    allCategories = data.categories || [];
    updateStats(data.stats);
    renderCategoryChips();
    render();
    refreshAgentLeadDropdown();
    if (navBadgeLeads) navBadgeLeads.textContent = allLeads.length;
  } catch (err) {
    console.error('Erro ao buscar leads:', err);
  }
}

function render() {
  let filtered = allLeads;

  if (activeTab === 'todos') {
    // Todos
  } else if (activeTab === 'oportunidade_quente') {
    filtered = filtered.filter(l => l.status === 'oportunidade_quente' || (!l.siteOriginal && l.status !== 'descartado'));
  } else if (activeTab === 'site_ativo') {
    filtered = filtered.filter(l => l.status === 'site_ativo');
  } else if (activeTab === 'prototipo_pronto') {
    filtered = filtered.filter(l => l.status === 'prototipo_pronto' || l.prototypePath);
  } else if (activeTab === 'contatado') {
    filtered = filtered.filter(l => l.status === 'contatado' || l.status === 'negociando' || l.inCrm);
  } else if (activeTab === 'descartado') {
    filtered = filtered.filter(l => l.status === 'descartado');
  }

  if (activeCategory !== 'todas') {
    filtered = filtered.filter(l => (l.categoria && (l.categoria.slug === activeCategory || l.categoria.id === activeCategory)));
  }

  const q = filterSearch ? filterSearch.value.trim().toLowerCase() : '';
  if (q) {
    filtered = filtered.filter(l => {
      const n = (l.nome || '').toLowerCase();
      const ni = (l.nicho || '').toLowerCase();
      const f = (l.whatsappFormatado || l.whatsappPrincipal || (l.telefones && l.telefones[0]) || '').toLowerCase();
      const r = (l.motivoDescarte || '').toLowerCase();
      const s = (l.siteOriginal || '').toLowerCase();
      return n.includes(q) || ni.includes(q) || f.includes(q) || r.includes(q) || s.includes(q);
    });
  }

  if (filtered.length === 0) {
    if (tableContainer) tableContainer.style.display = 'none';
    if (cardsContainer) cardsContainer.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  if (currentView === 'table') {
    if (tableContainer) tableContainer.style.display = 'block';
    if (cardsContainer) cardsContainer.style.display = 'none';
    renderTable(filtered);
  } else {
    if (tableContainer) tableContainer.style.display = 'none';
    if (cardsContainer) cardsContainer.style.display = 'grid';
    renderCards(filtered);
  }
}

function renderTable(leads) {
  if (!tableBody) return;
  tableBody.innerHTML = leads.map(l => {
    const wa = l.whatsappFormatado || l.whatsappPrincipal || (l.telefones && l.telefones[0]) || 'Sem telefone';
    const hasWa = !!(l.whatsappPrincipal || l.whatsappFormatado);
    const badgeClass = getBadgeClass(l.status);
    const badgeLabel = getBadgeLabel(l.status);
    const catClass = l.categoria ? l.categoria.badgeClass : 'cat-other';
    const catNome = l.categoria ? l.categoria.nome : 'Geral';
    const catIcon = l.categoria ? (l.categoria.icone || '🏷️') : '🏷️';
    const waUrl = l.whatsappPrincipal ? `https://web.whatsapp.com/send?phone=${l.whatsappPrincipal}` : (hasWa ? `https://web.whatsapp.com/send?phone=${wa.replace(/\D/g, '')}` : '#');

    return `
      <tr class="lead-row" data-id="${l.id}">
        <td class="lead-name-cell">
          <div class="lead-cat-row">
            <span class="badge-category ${catClass}">${catIcon} ${catNome}</span>
          </div>
          <strong>${escapeHtml(l.nome)}</strong>
          <small>📍 ${escapeHtml(l.cidade || 'Franca SP')}</small>
        </td>
        <td>
          ${renderSiteCell(l)}
        </td>
        <td>
          <div style="font-weight: 700; color: #fff;">★ ${escapeHtml(l.avaliacao || '5.0')}</div>
          ${l.totalAvaliacoes ? `<small style="display:block; color:var(--text-muted); font-size:11px;">(${l.totalAvaliacoes} avaliações)</small>` : ''}
        </td>
        <td>
          ${hasWa && waUrl !== '#' ? `<a href="${waUrl}" target="_blank" class="contact-link-wa">💬 ${escapeHtml(wa)}</a>` : `<span class="contact-text-phone">📞 ${escapeHtml(wa)}</span>`}
          <div class="social-chips-row">
            ${l.instagram ? `<a href="${l.instagram}" target="_blank" class="chip-social chip-insta" title="Instagram">📸 Insta</a>` : ''}
            ${l.facebook ? `<a href="${l.facebook}" target="_blank" class="chip-social chip-fb" title="Facebook">📘 Face</a>` : ''}
            ${l.mapsUrl ? `<a href="${l.mapsUrl}" target="_blank" class="maps-link-btn" title="Ver ficha no Google Maps">📍 Maps</a>` : ''}
          </div>
        </td>
        <td>
          <span class="badge ${badgeClass}">${badgeLabel}</span>
        </td>
        <td style="text-align: right;">
          <div class="actions-cell">
            ${l.prototypeUrl ? `<a href="${l.prototypeUrl}" target="_blank" class="btn btn-outline btn-xs" title="Ver Protótipo">💻 Site</a>` : ''}
            <button type="button" class="btn btn-primary btn-xs btn-open-detail" data-id="${l.id}">Ficha Completa ↗</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  attachRowEvents();
}

function renderCards(leads) {
  if (!cardsContainer) return;
  cardsContainer.innerHTML = leads.map(l => {
    const wa = l.whatsappFormatado || l.whatsappPrincipal || (l.telefones && l.telefones[0]) || 'Sem telefone';
    const badgeClass = getBadgeClass(l.status);
    const badgeLabel = getBadgeLabel(l.status);
    const catClass = l.categoria ? l.categoria.badgeClass : 'cat-gen';
    const catNome = l.categoria ? l.categoria.nome : 'Outros';

    return `
      <div class="lead-card" data-id="${l.id}">
        <div class="lead-card-header">
          <div>
            <span class="cat-pill ${catClass}">${catNome}</span>
            <h3 class="card-company-name">${escapeHtml(l.nome)}</h3>
            <small class="card-niche-text">${escapeHtml(l.nicho || 'Geral')} • Franca/SP</small>
          </div>
          <span class="badge ${badgeClass}">${badgeLabel}</span>
        </div>

        <div class="lead-card-body">
          <div class="card-info-row">
            <span>Presença Web:</span>
            <strong>${renderSiteStatusLabel(l)}</strong>
          </div>
          <div class="card-info-row">
            <span>Avaliação Google:</span>
            <strong>${escapeHtml(l.avaliacao || '5.0')}</strong>
          </div>
          <div class="card-info-row">
            <span>Contato Principal:</span>
            <strong>${escapeHtml(wa)}</strong>
          </div>
        </div>

        <div class="lead-card-footer">
          <button type="button" class="btn btn-primary btn-sm btn-open-detail" style="width: 100%;" data-id="${l.id}">
            Ver Ficha Completa
          </button>
        </div>
      </div>
    `;
  }).join('');

  attachRowEvents();
}

function renderSiteCell(lead) {
  if (lead.siteStatus === 'online' && lead.siteOriginal) {
    return `<a href="${lead.siteOriginal}" target="_blank" class="site-link-ok" title="${lead.siteOriginal}">🌐 ${formatDisplayUrl(lead.siteOriginal)} ↗</a>`;
  } else if (lead.siteStatus === 'apenas_linktree') {
    return `<span class="badge-site badge-site-social">🌲 Agrupador / Linktree</span>`;
  } else if (lead.siteStatus === 'inacessivel') {
    return `<span class="badge-site badge-site-down">⚠️ Site Inacessível</span>`;
  } else {
    return `<span class="badge-site badge-site-none">❌ Sem Site Cadastrado</span>`;
  }
}

function renderSiteStatusLabel(lead) {
  if (lead.siteStatus === 'online') return 'Site Ativo (Candidato a Redesign)';
  if (lead.siteStatus === 'apenas_linktree') return 'Apenas Linktree';
  if (lead.siteStatus === 'inacessivel') return 'Site Inacessível / Fora do Ar';
  return 'Nenhum Site Encontrado (Ouro)';
}

function attachRowEvents() {
  document.querySelectorAll('.btn-open-detail, .lead-row').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.classList.contains('mini-social-link')) return;
      const id = el.dataset.id || el.closest('[data-id]')?.dataset.id;
      if (id) {
        const lead = allLeads.find(l => (l.id === id || l.slug === id));
        if (lead) openModal(lead);
      }
    });
  });
}

function renderCategoryChips() {
  if (!categoryChips) return;
  const countMap = {};
  allLeads.forEach(l => {
    const id = l.categoria ? l.categoria.id : 'outros';
    countMap[id] = (countMap[id] || 0) + 1;
  });

  let html = `
    <button class="cat-chip ${activeCategory === 'todas' ? 'active' : ''}" data-cat="todas">
      <span class="cat-chip-icon">🌐</span>
      <span class="cat-chip-label">Todos os Segmentos</span>
      <span class="cat-chip-count">${allLeads.length}</span>
    </button>
  `;

  allCategories.forEach(cat => {
    const count = countMap[cat.id] || 0;
    if (count > 0) {
      html += `
        <button class="cat-chip ${activeCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
          <span class="cat-chip-icon">${cat.icone}</span>
          <span class="cat-chip-label">${cat.nome}</span>
          <span class="cat-chip-count">${count}</span>
        </button>
      `;
    }
  });

  categoryChips.innerHTML = html;

  categoryChips.querySelectorAll('.cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      categoryChips.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });
}

function calculateStatsFromLeads(leads) {
  return {
    total: leads.length,
    hot: leads.filter(l => l.status === 'oportunidade_quente' || (!l.siteOriginal && l.status !== 'descartado')).length,
    online: leads.filter(l => l.status === 'site_ativo' || (l.siteOriginal && l.siteStatus === 'online' && l.status !== 'descartado')).length,
    prototypes: leads.filter(l => l.status === 'prototipo_pronto' || l.prototypePath || l.prototypeUrl).length,
    contacted: leads.filter(l => l.status === 'contatado' || l.status === 'negociando' || l.inCrm).length,
    discarded: leads.filter(l => l.status === 'descartado').length
  };
}

function updateStats(backendStats) {
  const stats = calculateStatsFromLeads(allLeads);

  if (statTotal) statTotal.textContent = stats.total;
  if (statHot) statHot.textContent = stats.hot;
  if (statOnline) statOnline.textContent = stats.online;
  if (statReady) statReady.textContent = stats.prototypes;
  if (statContacted) statContacted.textContent = stats.contacted;
  if (statDiscarded) statDiscarded.textContent = stats.discarded;
}

// ==========================================
// MODAL DE DETALHES DO LEAD
// ==========================================

function openModal(lead) {
  currentSelectedLead = lead;

  if (modalLeadName) modalLeadName.textContent = lead.nome;
  if (modalLeadNiche) modalLeadNiche.textContent = `${lead.nicho || 'Geral'} • ${lead.cidade || 'Franca SP'}`;
  if (modalAiText) modalAiText.textContent = lead.analiseIA || 'Diagnóstico automático: Excelente oportunidade local.';

  if (modalLeadNameDisplay) modalLeadNameDisplay.textContent = lead.nome;
  if (modalLeadMapsLink) {
    modalLeadMapsLink.href = lead.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(lead.nome + ' ' + (lead.cidade || 'Franca SP'))}`;
  }
  if (modalLeadSite) modalLeadSite.textContent = lead.siteOriginal || 'Nenhum site cadastrado';
  if (modalLeadWa) modalLeadWa.textContent = lead.whatsappFormatado || lead.whatsappPrincipal || 'Não informado';
  if (modalLeadPhones) modalLeadPhones.textContent = (lead.telefones && lead.telefones.join(', ')) || 'Nenhum';

  if (modalLeadInsta) {
    if (lead.instagram) {
      modalLeadInsta.textContent = lead.instagram;
      modalLeadInsta.href = lead.instagram;
    } else {
      modalLeadInsta.textContent = 'Não localizado';
      modalLeadInsta.removeAttribute('href');
    }
  }

  if (modalLeadFb) {
    if (lead.facebook) {
      modalLeadFb.textContent = lead.facebook;
      modalLeadFb.href = lead.facebook;
    } else {
      modalLeadFb.textContent = 'Não localizado';
      modalLeadFb.removeAttribute('href');
    }
  }

  // Preenche modo de edição
  if (editLeadName) editLeadName.value = lead.nome || '';
  if (editLeadInsta) editLeadInsta.value = lead.instagram || '';
  if (editLeadFb) editLeadFb.value = lead.facebook || '';
  if (editLeadWa) editLeadWa.value = lead.whatsappFormatado || lead.whatsappPrincipal || '';
  if (editLeadSite) editLeadSite.value = lead.siteOriginal || '';

  if (leadEditForm) leadEditForm.style.display = 'none';
  if (leadViewFields) leadViewFields.style.display = 'block';

  if (templateSelector) {
    templateSelector.value = getRecommendedArchetype(lead);
  }

  if (modalStatusSelect) modalStatusSelect.value = lead.status || 'oportunidade_quente';
  if (modalNotes) modalNotes.value = lead.anotacoes || '';

  // Mensagem WhatsApp
  if (lead.messages && lead.messages.whatsapp) {
    modalWaText.textContent = lead.messages.whatsapp;
    if (btnCopyWa) btnCopyWa.style.display = 'inline-flex';
    if (lead.whatsappPrincipal && btnOpenWaWeb) {
      btnOpenWaWeb.href = `https://web.whatsapp.com/send?phone=${lead.whatsappPrincipal}&text=${encodeURIComponent(lead.messages.whatsapp)}`;
      btnOpenWaWeb.style.display = 'inline-flex';
    } else if (btnOpenWaWeb) {
      btnOpenWaWeb.style.display = 'none';
    }
  } else {
    modalWaText.textContent = 'Protótipo ainda não construído para esta empresa.\n\nPara gerar o site completo e as mensagens de WhatsApp e E-mail, vá até a aba "💻 Protótipo do Site" e clique em "⚡ Criar Protótipo".';
    if (btnCopyWa) btnCopyWa.style.display = 'none';
    if (btnOpenWaWeb) btnOpenWaWeb.style.display = 'none';
  }

  // Mensagem E-mail
  if (lead.messages && lead.messages.email) {
    modalEmailSubject.textContent = lead.messages.email.assunto;
    modalEmailBody.textContent = lead.messages.email.corpo;
    if (btnCopyEmail) btnCopyEmail.style.display = 'inline-flex';
  } else {
    modalEmailSubject.textContent = '-';
    modalEmailBody.textContent = 'Crie o protótipo na aba ao lado para liberar a proposta de e-mail pronta.';
    if (btnCopyEmail) btnCopyEmail.style.display = 'none';
  }

  // Protótipo
  if (lead.prototypeUrl) {
    prototypeIframe.src = lead.prototypeUrl;
    if (btnOpenProtoTab) {
      btnOpenProtoTab.href = lead.prototypeUrl;
      btnOpenProtoTab.style.display = 'inline-flex';
    }
    if (btnGenerateProto) btnGenerateProto.textContent = '🔄 Regerar Protótipo';
    if (prototypeStatusLabel) prototypeStatusLabel.textContent = `✅ Protótipo no ar (${lead.templateEscolhido || 'Subzero Engine'})`;
  } else {
    prototypeIframe.src = 'about:blank';
    if (btnOpenProtoTab) btnOpenProtoTab.style.display = 'none';
    if (btnGenerateProto) btnGenerateProto.textContent = '⚡ Criar Protótipo';
    if (prototypeStatusLabel) prototypeStatusLabel.textContent = '⚠️ Protótipo ainda não construído (Aguardando seu clique)';
  }

  leadModal.style.display = 'flex';
}

function closeModal() {
  leadModal.style.display = 'none';
  if (prototypeIframe) prototypeIframe.src = 'about:blank';
  currentSelectedLead = null;
}

// ==========================================
// MÓDULO 2: AGENTE EM TEMPO REAL (LIVE OPS)
// ==========================================

function initAgentMonitor() {
  fetchAgentSnapshot();

  if (window.EventSource) {
    agentEventSource = new EventSource('/api/agent/stream');

    agentEventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'snapshot' || payload.type === 'update') {
          applyAgentState(payload.data);
        } else if (payload.type === 'log') {
          appendLogLine(payload.data);
        }
      } catch (err) {
        console.warn('Erro ao processar stream do agente:', err);
      }
    };
  }

  btnAgentTrigger?.addEventListener('click', async () => {
    const selectedId = agentLeadSelect.value;
    if (!selectedId) {
      alert('Por favor, selecione um lead no menu suspenso.');
      return;
    }

    btnAgentTrigger.disabled = true;
    btnAgentTrigger.innerHTML = '<span>⏳ Iniciando...</span>';

    try {
      const res = await fetch('/api/agent/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedId })
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Erro ao disparar agente');
      }
    } catch (err) {
      alert(`Falha: ${err.message}`);
    } finally {
      btnAgentTrigger.disabled = false;
      btnAgentTrigger.innerHTML = '<span>Iniciar Auditoria</span>';
    }
  });

  btnClearLogs?.addEventListener('click', () => {
    if (terminalLogsBody) {
      terminalLogsBody.innerHTML = `
        <div class="terminal-line system">
          <span class="t-time">[${new Date().toLocaleTimeString('pt-BR')}]</span>
          <span class="t-tag">[SISTEMA]</span>
          <span class="t-msg">Logs limpos manualmente pelo usuário.</span>
        </div>
      `;
    }
  });
}

async function fetchAgentSnapshot() {
  try {
    const res = await fetch('/api/agent/status');
    const state = await res.json();
    applyAgentState(state);
  } catch (err) {
    console.warn('Erro ao obter snapshot do agente:', err);
  }
}

function applyAgentState(state) {
  if (!state) return;

  const isRunning = state.status === 'running';

  if (agentRadarWrapper) {
    if (isRunning) agentRadarWrapper.classList.add('running');
    else agentRadarWrapper.classList.remove('running');
  }

  if (agentHeaderStatusText) agentHeaderStatusText.textContent = state.statusLabel || 'Agente Ocioso';
  if (topbarLiveText) topbarLiveText.textContent = isRunning ? `Agente: Em Operação (${state.progressPercent}%)` : 'Agente: Ocioso';
  if (sidebarAgentStatusText) sidebarAgentStatusText.textContent = isRunning ? 'Agente Minerando...' : 'Agente Pronto';

  const pulseColor = isRunning ? 'var(--cyan)' : (state.status === 'error' ? 'var(--red)' : 'var(--green)');
  [topbarPulseDot, sidebarPulse, agentHeaderDot, agentPulseNav].forEach(dot => {
    if (dot) {
      dot.style.backgroundColor = pulseColor;
      dot.style.boxShadow = `0 0 10px ${pulseColor}`;
    }
  });

  if (agentCurrentTaskTitle) {
    agentCurrentTaskTitle.textContent = state.currentJobName || 'Aguardando Nova Operação Autônoma';
  }
  if (agentCurrentTaskDetail) {
    agentCurrentTaskDetail.textContent = state.stepDetail || state.stepLabel || 'Conectado localmente ao motor Subzero Engine.';
  }

  if (agentTargetName) agentTargetName.textContent = state.currentLeadName || '—';
  if (agentTargetNiche) agentTargetNiche.textContent = state.currentLeadNiche ? `${state.currentLeadNiche} • Franca SP` : 'Nenhuma empresa em análise';

  const currentStep = state.currentStep || 0;
  for (let i = 1; i <= 5; i++) {
    const node = document.getElementById(`stepNode${i}`);
    if (node) {
      node.classList.remove('completed', 'active');
      if (i < currentStep || (state.status === 'completed' && i <= 5)) {
        node.classList.add('completed');
      } else if (i === currentStep && isRunning) {
        node.classList.add('active');
      }
    }
  }

  const stepPercentMap = { 0: 0, 1: 15, 2: 38, 3: 62, 4: 85, 5: 100 };
  const fillPct = isRunning ? (stepPercentMap[currentStep] || state.progressPercent) : (state.status === 'completed' ? 100 : 0);
  if (stepperProgressFill) stepperProgressFill.style.width = `${fillPct}%`;

  if (agentProgressInner) agentProgressInner.style.width = `${state.progressPercent || 0}%`;
  if (agentProgressPercent) agentProgressPercent.textContent = `${state.progressPercent || 0}%`;
  if (agentProgressStepText) agentProgressStepText.textContent = `Etapa ${currentStep} de 5: ${state.stepLabel || ''}`;

  if (metricInspected) metricInspected.textContent = state.stats?.totalEnriched || allLeads.length;
  if (metricPrototypes) metricPrototypes.textContent = state.stats?.totalPrototypes || allLeads.filter(l => l.prototypePath).length;
  if (metricTimeElapsed) metricTimeElapsed.textContent = `${state.elapsedSeconds || 0}s`;

  if (terminalLogsBody && state.logs && terminalLogsBody.children.length <= 1) {
    state.logs.forEach(appendLogLine);
  }
}

function appendLogLine(log) {
  if (!terminalLogsBody || !log) return;
  const line = document.createElement('div');
  line.className = 'terminal-line';

  const typeClass = log.type || 'info';
  const tagUpper = (log.type || 'INFO').toUpperCase();

  line.innerHTML = `
    <span class="t-time">[${log.timestamp || new Date().toLocaleTimeString('pt-BR')}]</span>
    <span class="t-tag ${typeClass}">[${tagUpper}]</span>
    <span class="t-msg">${escapeHtml(log.message)}</span>
  `;

  terminalLogsBody.appendChild(line);

  while (terminalLogsBody.children.length > 150) {
    terminalLogsBody.removeChild(terminalLogsBody.firstChild);
  }

  terminalLogsBody.scrollTop = terminalLogsBody.scrollHeight;
}

function refreshAgentLeadDropdown() {
  if (!agentLeadSelect) return;
  if (allLeads.length === 0) {
    agentLeadSelect.innerHTML = '<option value="">Nenhum lead disponível ainda</option>';
    return;
  }

  agentLeadSelect.innerHTML = allLeads.map(l => {
    return `<option value="${l.id}">${escapeHtml(l.nome)} (${escapeHtml(l.nicho || 'Geral')})</option>`;
  }).join('');
}

// ==========================================
// MÓDULO 3: CRM & FUNIL DE NEGOCIAÇÃO KANBAN
// ==========================================

async function fetchCrmLeads() {
  try {
    const res = await fetch('/api/crm');
    const data = await res.json();
    crmLeads = data.crmLeads || [];
    renderCrmBoard(crmLeads);
    if (navBadgeCrm) navBadgeCrm.textContent = crmLeads.length;
  } catch (err) {
    console.error('Erro ao buscar CRM:', err);
  }
}

function renderCrmBoard(leads) {
  const stages = ['contato_enviado', 'em_conversa', 'prototipo_apresentado', 'negociando', 'fechado_ganho', 'standby'];
  const columns = {};
  const values = {};
  const counts = {};

  stages.forEach(s => {
    columns[s] = document.getElementById(`cards-${s}`);
    if (columns[s]) columns[s].innerHTML = '';
    values[s] = 0;
    counts[s] = 0;
  });

  let totalVal = 0;
  let wonCount = 0;

  leads.forEach(lead => {
    const stage = lead.crmStage || 'contato_enviado';
    const targetCol = columns[stage] || columns['contato_enviado'];
    const val = parseFloat(lead.crmValor) || 0;

    values[stage] = (values[stage] || 0) + val;
    counts[stage] = (counts[stage] || 0) + 1;
    totalVal += val;
    if (stage === 'fechado_ganho') wonCount += 1;

    if (targetCol) {
      targetCol.appendChild(createKanbanCardElement(lead));
    }
  });

  stages.forEach(s => {
    const cntEl = document.getElementById(`count-${s}`);
    const valEl = document.getElementById(`val-${s}`);
    if (cntEl) cntEl.textContent = counts[s] || 0;
    if (valEl) valEl.textContent = `R$ ${(values[s] || 0).toLocaleString('pt-BR')}`;
  });

  if (crmTotalValue) crmTotalValue.textContent = `R$ ${totalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  if (crmTotalCount) crmTotalCount.textContent = leads.length;
  if (crmWonCount) crmWonCount.textContent = wonCount;
}

function createKanbanCardElement(lead) {
  const card = document.createElement('div');
  card.className = 'kanban-card';
  card.dataset.id = lead.id;

  const valFormatted = (parseFloat(lead.crmValor) || 1500).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
  const wa = lead.whatsappFormatado || lead.whatsappPrincipal;
  const waLink = lead.whatsappPrincipal ? `https://web.whatsapp.com/send?phone=${lead.whatsappPrincipal}` : '#';

  const relativeDate = formatRelativeDate(lead.crmUltimoContato || lead.updatedAt);

  card.innerHTML = `
    <div class="kanban-card-head">
      <div class="kanban-card-title">${escapeHtml(lead.nome)}</div>
    </div>
    <span class="kanban-card-niche">${escapeHtml(lead.nicho || 'Geral')} • Franca/SP</span>

    <div class="kanban-card-val-row">
      <span class="kanban-val-tag">R$ ${valFormatted}</span>
      <span class="kanban-date-tag">🕒 ${relativeDate}</span>
    </div>

    ${lead.anotacoes ? `<div class="kanban-card-notes">${escapeHtml(lead.anotacoes)}</div>` : ''}

    <div class="kanban-card-actions">
      <div class="kanban-btns-left">
        ${wa ? `<a href="${waLink}" target="_blank" class="btn btn-outline btn-xs" title="Conversar no WhatsApp">💬 WA</a>` : ''}
        ${lead.prototypeUrl ? `<a href="${lead.prototypeUrl}" target="_blank" class="btn btn-outline btn-xs" title="Ver Protótipo">💻 Site</a>` : ''}
        <button type="button" class="btn btn-outline btn-xs btn-crm-edit" title="Editar proposta e anotações">✏️</button>
      </div>

      <div class="kanban-stage-mover">
        <button type="button" class="btn-move btn-move-prev" title="Voltar estágio">←</button>
        <button type="button" class="btn-move btn-move-next" title="Avançar estágio">→</button>
      </div>
    </div>
  `;

  card.querySelector('.btn-crm-edit')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openCrmEditModal(lead);
  });

  card.querySelector('.btn-move-prev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    moveCrmLeadStage(lead, -1);
  });

  card.querySelector('.btn-move-next')?.addEventListener('click', (e) => {
    e.stopPropagation();
    moveCrmLeadStage(lead, 1);
  });

  card.addEventListener('click', () => {
    openModal(lead);
  });

  return card;
}

const CRM_STAGES_ORDER = ['contato_enviado', 'em_conversa', 'prototipo_apresentado', 'negociando', 'fechado_ganho', 'standby'];

async function moveCrmLeadStage(lead, direction) {
  const currentIdx = CRM_STAGES_ORDER.indexOf(lead.crmStage || 'contato_enviado');
  let newIdx = currentIdx + direction;
  if (newIdx < 0) newIdx = 0;
  if (newIdx >= CRM_STAGES_ORDER.length) newIdx = CRM_STAGES_ORDER.length - 1;

  const nextStage = CRM_STAGES_ORDER[newIdx];
  if (nextStage === lead.crmStage) return;

  try {
    const res = await fetch(`/api/crm/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crmStage: nextStage, crmUltimoContato: new Date().toISOString() })
    });
    const data = await res.json();
    if (data.success) {
      lead.crmStage = nextStage;
      lead.crmUltimoContato = new Date().toISOString();
      fetchCrmLeads();
    }
  } catch (err) {
    console.error('Erro ao mover lead no CRM:', err);
  }
}

function openCrmEditModal(lead) {
  if (crmEditLeadId) crmEditLeadId.value = lead.id;
  if (crmModalLeadName) crmModalLeadName.textContent = lead.nome;
  if (crmModalLeadNiche) crmModalLeadNiche.textContent = `${lead.nicho || 'Geral'} • Franca/SP`;
  if (crmEditStage) crmEditStage.value = lead.crmStage || 'contato_enviado';
  if (crmEditValue) crmEditValue.value = lead.crmValor !== undefined ? lead.crmValor : 1500;
  if (crmEditNotes) crmEditNotes.value = lead.anotacoes || '';

  if (crmEditModal) crmEditModal.style.display = 'flex';
}

function closeCrmEditModal() {
  if (crmEditModal) crmEditModal.style.display = 'none';
}

crmEditForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = crmEditLeadId.value;
  if (!id) return;

  const stage = crmEditStage.value;
  const valor = parseFloat(crmEditValue.value) || 0;
  const notes = crmEditNotes.value.trim();

  try {
    const res = await fetch(`/api/crm/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crmStage: stage,
        crmValor: valor,
        crmNotas: notes,
        crmUltimoContato: new Date().toISOString(),
        inCrm: true
      })
    });
    const data = await res.json();
    if (data.success) {
      closeCrmEditModal();
      fetchCrmLeads();
      fetchLeads();
    }
  } catch (err) {
    alert(`Erro ao salvar no CRM: ${err.message}`);
  }
});

btnRemoveFromCrm?.addEventListener('click', async () => {
  const id = crmEditLeadId.value;
  if (!id || !confirm('Deseja remover esta empresa do Funil de Negociação?')) return;

  try {
    await fetch(`/api/crm/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inCrm: false })
    });
    closeCrmEditModal();
    fetchCrmLeads();
  } catch (err) {
    alert(`Erro ao remover: ${err.message}`);
  }
});

crmModalCloseBtn?.addEventListener('click', closeCrmEditModal);
crmEditModal?.addEventListener('click', (e) => {
  if (e.target === crmEditModal) closeCrmEditModal();
});

btnOpenAddCrmModal?.addEventListener('click', () => {
  const unassigned = allLeads.filter(l => !l.inCrm);
  if (unassigned.length === 0) {
    alert('Todas as empresas mineradas já estão no Funil de Negociação!');
    return;
  }
  openModal(unassigned[0]);
});

btnModalSendToCrm?.addEventListener('click', async () => {
  if (!currentSelectedLead) return;
  try {
    const res = await fetch(`/api/crm/add/${currentSelectedLead.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'contato_enviado', valor: 1500 })
    });
    const data = await res.json();
    if (data.success) {
      btnModalSendToCrm.innerHTML = '<span>✅ Adicionado ao Funil!</span>';
      setTimeout(() => {
        btnModalSendToCrm.innerHTML = '<span>💼 Enviar para o Funil CRM</span>';
      }, 2000);
      fetchCrmLeads();
    }
  } catch (err) {
    alert(`Erro ao adicionar ao CRM: ${err.message}`);
  }
});

// ==========================================
// CONFIGURAÇÃO GERAL DE EVENTOS
// ==========================================

function setupEventListeners() {
  prospectForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const niche = nicheInput.value.trim();
    const city = cityInput.value.trim() || 'Franca SP';
    if (!niche) return;

    btnProspect.disabled = true;
    btnProspect.querySelector('.btn-text').textContent = 'Minerando...';
    btnProspect.querySelector('.spinner').style.display = 'inline-block';
    if (searchNotice) searchNotice.style.display = 'none';

    try {
      const res = await fetch('/api/prospect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, city, limit: 5 })
      });
      const data = await res.json();

      if (data.success) {
        allLeads = data.leads || allLeads;
        updateStats(data.stats);
        renderCategoryChips();
        render();
        refreshAgentLeadDropdown();
        if (searchNotice) {
          searchNotice.textContent = data.message;
          searchNotice.style.display = 'block';
        }
      } else {
        alert(data.error || 'Aviso durante a mineração.');
      }
    } catch (err) {
      alert(`Falha na busca: ${err.message}`);
    } finally {
      btnProspect.disabled = false;
      btnProspect.querySelector('.btn-text').textContent = 'Buscar Empresas';
      btnProspect.querySelector('.spinner').style.display = 'none';
    }
  });

  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      nicheInput.value = btn.dataset.niche;
      prospectForm.dispatchEvent(new Event('submit'));
    });
  });

  filterSearch?.addEventListener('input', () => {
    render();
  });

  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeTab = card.dataset.filter;
      render();
    });
  });

  document.getElementById('viewTable')?.addEventListener('click', () => {
    currentView = 'table';
    document.getElementById('viewTable')?.classList.add('active');
    document.getElementById('viewCards')?.classList.remove('active');
    render();
  });

  document.getElementById('viewCards')?.addEventListener('click', () => {
    currentView = 'cards';
    document.getElementById('viewCards')?.classList.add('active');
    document.getElementById('viewTable')?.classList.remove('active');
    render();
  });

  modalCloseBtn?.addEventListener('click', closeModal);
  leadModal?.addEventListener('click', (e) => {
    if (e.target === leadModal) closeModal();
  });

  btnToggleEditLead?.addEventListener('click', () => {
    const isEditing = leadEditForm.style.display !== 'none';
    if (isEditing) {
      leadEditForm.style.display = 'none';
      leadViewFields.style.display = 'block';
      btnToggleEditLead.textContent = '✏️ Editar';
    } else {
      leadEditForm.style.display = 'block';
      leadViewFields.style.display = 'none';
      btnToggleEditLead.textContent = '👁️ Visualizar';
    }
  });

  btnCancelEditLead?.addEventListener('click', () => {
    leadEditForm.style.display = 'none';
    leadViewFields.style.display = 'block';
    btnToggleEditLead.textContent = '✏️ Editar';
  });

  leadEditForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentSelectedLead) return;

    const updates = {
      nome: editLeadName.value.trim(),
      instagram: editLeadInsta.value.trim(),
      facebook: editLeadFb.value.trim(),
      whatsapp: editLeadWa.value.trim(),
      siteOriginal: editLeadSite.value.trim()
    };

    const ok = await updateLeadOnServer(currentSelectedLead.id, updates);
    if (ok) {
      leadEditForm.style.display = 'none';
      leadViewFields.style.display = 'block';
      btnToggleEditLead.textContent = '✏️ Editar';
    }
  });

  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabName = btn.dataset.modaltab;
      const content = document.getElementById(`tabContent${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
      if (content) content.classList.add('active');
    });
  });

  btnCopyWa?.addEventListener('click', () => {
    navigator.clipboard.writeText(modalWaText.textContent);
    showTempBtnText(btnCopyWa, '✓ Copiado!');
  });

  btnCopyEmail?.addEventListener('click', () => {
    const full = `Assunto: ${modalEmailSubject.textContent}\n\n${modalEmailBody.textContent}`;
    navigator.clipboard.writeText(full);
    showTempBtnText(btnCopyEmail, '✓ Copiado!');
  });

  btnSaveNotes?.addEventListener('click', async () => {
    if (!currentSelectedLead) return;
    const text = modalNotes.value.trim();
    await updateLeadOnServer(currentSelectedLead.id, { anotacoes: text });
    showTempBtnText(btnSaveNotes, '✓ Salvo!');
  });

  modalStatusSelect?.addEventListener('change', async () => {
    if (!currentSelectedLead) return;
    await updateLeadOnServer(currentSelectedLead.id, { status: modalStatusSelect.value });
  });

  btnGenerateProto?.addEventListener('click', async () => {
    if (!currentSelectedLead) return;
    const selectedTemplate = templateSelector ? templateSelector.value : getRecommendedArchetype(currentSelectedLead);
    await generatePrototypeForLead(currentSelectedLead.id, selectedTemplate, false);
  });

  btnForceEnrichProto?.addEventListener('click', async () => {
    if (!currentSelectedLead) return;
    const selectedTemplate = templateSelector ? templateSelector.value : getRecommendedArchetype(currentSelectedLead);
    await generatePrototypeForLead(currentSelectedLead.id, selectedTemplate, true);
  });
}

// ==========================================
// FUNÇÕES AUXILIARES DO GERADOR
// ==========================================

async function generatePrototypeForLead(id, template = 'subzero', forceEnrich = true) {
  const leadIdx = allLeads.findIndex(l => (l.id === id || l.slug === id));
  const leadObj = leadIdx !== -1 ? allLeads[leadIdx] : null;

  if (leadObj) {
    leadObj.status = 'gerando_prototipo';
    render();
  }

  if (btnGenerateProto) {
    btnGenerateProto.disabled = true;
    btnGenerateProto.innerHTML = '⏳ Minerando Redes & Construindo...';
  }
  if (prototypeStatusLabel) {
    prototypeStatusLabel.innerHTML = '⏳ <strong>Minerando redes sociais, Google Maps & construindo site sob medida...</strong> Aguarde alguns instantes...';
  }

  try {
    const res = await fetch(`/api/leads/${id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, archetype: template, forceEnrich: true })
    });
    const data = await res.json();

    if (data.success) {
      if (leadIdx !== -1) allLeads[leadIdx] = data.lead;
      if (currentSelectedLead && (currentSelectedLead.id === id || currentSelectedLead.slug === id)) {
        currentSelectedLead = data.lead;
        openModal(data.lead);
      }
      updateStats(data.stats);
      render();
      fetchCrmLeads();
    } else {
      alert(`Aviso: ${data.error || 'Erro desconhecido'}`);
      if (leadObj) {
        leadObj.status = leadObj.prototypeUrl ? 'prototipo_pronto' : 'oportunidade_quente';
        render();
      }
    }
  } catch (err) {
    alert(`Erro ao gerar protótipo: ${err.message}`);
  } finally {
    if (btnGenerateProto) {
      btnGenerateProto.disabled = false;
      btnGenerateProto.innerHTML = '🔄 Regerar Protótipo';
    }
  }
}

async function updateLeadOnServer(id, updates) {
  try {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (data.success && data.lead) {
      const idx = allLeads.findIndex(l => (l.id === id || l.slug === id));
      if (idx !== -1) allLeads[idx] = data.lead;
      if (currentSelectedLead && (currentSelectedLead.id === id || currentSelectedLead.slug === id)) {
        currentSelectedLead = data.lead;
        openModal(data.lead);
      }
      updateStats(data.stats);
      render();
      fetchCrmLeads();
      return true;
    }
  } catch (err) {
    console.error('Erro ao atualizar lead:', err);
  }
  return false;
}

function getRecommendedArchetype(lead) {
  if (lead?.templateEscolhido) return lead.templateEscolhido;
  const n = (lead?.nicho || '').toLowerCase();
  const name = (lead?.nome || '').toLowerCase();

  if (n.includes('arquitet') || n.includes('engenhar') || n.includes('constru') || name.includes('engenhar') || name.includes('arquiteto') || name.includes('construtora')) {
    return 'architectural';
  }
  if (n.includes('odont') || n.includes('dentist') || n.includes('clinica') || n.includes('estetica') || n.includes('saude') || n.includes('medico')) {
    return 'clinical';
  }
  if (n.includes('pet') || n.includes('veterin')) {
    return 'care';
  }
  return 'industrial';
}

function getBadgeClass(status) {
  switch(status) {
    case 'oportunidade_quente': return 'badge-hot';
    case 'site_ativo': return 'badge-online';
    case 'gerando_prototipo': return 'badge-generating';
    case 'prototipo_pronto': return 'badge-ready';
    case 'contatado': case 'negociando': return 'badge-contacted';
    case 'descartado': return 'badge-discarded';
    default: return 'badge-ready';
  }
}

function getBadgeLabel(status) {
  switch(status) {
    case 'oportunidade_quente': return '🔥 Oportunidade';
    case 'site_ativo': return '🌐 Site Ativo';
    case 'gerando_prototipo': return '⏳ Minerando...';
    case 'prototipo_pronto': return '⚡ Protótipo Pronto';
    case 'contatado': return '📞 Contatado';
    case 'negociando': return '🤝 Negociando';
    case 'descartado': return '🏢 Descartado';
    default: return status;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDisplayUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    let path = parsed.pathname !== '/' ? parsed.pathname : '';
    if (path.length > 15) path = path.slice(0, 15) + '...';
    return (host + path).slice(0, 28);
  } catch (_) {
    return url.length > 28 ? url.slice(0, 25) + '...' : url;
  }
}

function formatRelativeDate(isoDate) {
  if (!isoDate) return 'Hoje';
  try {
    const d = new Date(isoDate);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch (_) {
    return 'Hoje';
  }
}

function showTempBtnText(btn, text) {
  const old = btn.innerHTML;
  btn.textContent = text;
  setTimeout(() => { btn.innerHTML = old; }, 1800);
}

