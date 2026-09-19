let allLeads = [];
let activeTab = 'oportunidade_quente';
let activeCategory = 'todas';
let allCategories = [];
let currentView = 'table';
let currentSelectedLead = null;

// Elementos do DOM
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

const tableView = document.getElementById('tableView');
const cardsView = document.getElementById('cardsView');
const tableBody = document.getElementById('leadsTableBody');
const emptyState = document.getElementById('emptyState');
const loadingIndicator = document.getElementById('loadingIndicator');

// Modal Elements
const leadModal = document.getElementById('leadModal');
const modalClose = document.getElementById('modalClose');
const modalLeadName = document.getElementById('modalLeadName');
const modalLeadCategory = document.getElementById('modalLeadCategory');
const modalLeadBadge = document.getElementById('modalLeadBadge');
const modalLeadAnalysis = document.getElementById('modalLeadAnalysis');
const modalLeadMapsLink = document.getElementById('modalLeadMapsLink');
const modalLeadWa = document.getElementById('modalLeadWa');
const modalLeadPhones = document.getElementById('modalLeadPhones');
const modalLeadSite = document.getElementById('modalLeadSite');
const modalLeadInsta = document.getElementById('modalLeadInsta');
const modalLeadFb = document.getElementById('modalLeadFb');
const modalStatusSelect = document.getElementById('modalStatusSelect');
const modalNotes = document.getElementById('modalNotes');
const btnSaveNotes = document.getElementById('btnSaveNotes');
const templateSelector = document.getElementById('templateSelector');

// Lead Fields Edit Elements
const btnToggleEditLead = document.getElementById('btnToggleEditLead');
const leadViewFields = document.getElementById('leadViewFields');
const leadEditForm = document.getElementById('leadEditForm');
const modalLeadNameDisplay = document.getElementById('modalLeadNameDisplay');
const editLeadName = document.getElementById('editLeadName');
const editLeadInsta = document.getElementById('editLeadInsta');
const editLeadFb = document.getElementById('editLeadFb');
const editLeadWa = document.getElementById('editLeadWa');
const editLeadSite = document.getElementById('editLeadSite');
const btnCancelEditLead = document.getElementById('btnCancelEditLead');

// Helper: Formata avaliações no modelo "★ 4,2 (380 comentários)"
function formatRating(raw) {
  if (!raw || typeof raw !== 'string') return '<span style="color: var(--text-muted); font-size: 12px;">Sem nota</span>';
  
  const scoreMatch = raw.match(/(\d+[,\.]\d+|\d+)/);
  const countMatch = raw.match(/(?:estrelas?\s*|\(|\b)(\d+)\s*(?:coment[aá]rios|\))/i) || raw.match(/estrelas?\s+(\d+)/i) || raw.match(/\((\d+)\)/);
  
  if (!scoreMatch) return `<span style="color: var(--text-muted); font-size: 12px;">${escapeHtml(raw)}</span>`;
  
  const score = scoreMatch[1].replace('.', ',');
  const count = countMatch ? countMatch[1] : null;

  if (count) {
    return `<span class="rating-badge" title="${score} estrelas (${count} comentários)"><span class="rating-star">★</span> ${score} <span class="rating-count">(${count} comentários)</span></span>`;
  }
  
  return `<span class="rating-badge" title="${score} estrelas"><span class="rating-star">★</span> ${score}</span>`;
}

function getRecommendedArchetype(lead) {
  if (!lead) return 'industrial';
  if (lead.templateEscolhido && ['industrial', 'clinical', 'care', 'architectural'].includes(lead.templateEscolhido)) {
    return lead.templateEscolhido;
  }
  if (lead.archetype && ['industrial', 'clinical', 'care', 'architectural'].includes(lead.archetype)) {
    return lead.archetype;
  }
  const n = (lead.nicho || '').toLowerCase();
  const nm = (lead.nome || '').toLowerCase();

  // 1. Arquitetura, Engenharia Civil, Interiores e Obras -> architectural
  if (n.includes('arquitet') || n.includes('engenharia') || n.includes('construc') || n.includes('obras') || n.includes('interiores') || nm.includes('arquit') || nm.includes('engenharia') || nm.includes('construc') || nm.includes('obras')) {
    return 'architectural';
  }

  // 2. Odontologia, Médicos, Clínicas e Saúde -> clinical
  if (n.includes('odonto') || n.includes('dent') || n.includes('medic') || n.includes('clinic') || n.includes('saude') || n.includes('estet') || n.includes('fisio') || nm.includes('odonto') || nm.includes('clinica')) {
    return 'clinical';
  }

  // 3. Veterinárias, Pet Shops, Banho & Tosa -> care
  if (n.includes('pet') || n.includes('vet') || n.includes('cao') || n.includes('cachorro') || n.includes('gato') || n.includes('banho') || n.includes('tosa') || nm.includes('pet') || nm.includes('vet')) {
    return 'care';
  }

  return 'industrial';
}

const modalWaText = document.getElementById('modalWaText');
const btnCopyWa = document.getElementById('btnCopyWa');
const btnOpenWaWeb = document.getElementById('btnOpenWaWeb');

const modalEmailSubject = document.getElementById('modalEmailSubject');
const modalEmailBody = document.getElementById('modalEmailBody');
const btnCopyEmail = document.getElementById('btnCopyEmail');

const prototypeIframe = document.getElementById('prototypeIframe');
const btnGenerateProto = document.getElementById('btnGenerateProto');
const btnForceEnrichProto = document.getElementById('btnForceEnrichProto');
const btnOpenProtoTab = document.getElementById('btnOpenProtoTab');
const prototypeStatusLabel = document.getElementById('prototypeStatusLabel');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  fetchLeads();
  setupEventListeners();
});

function setupEventListeners() {
  // Submissão de prospecção
  prospectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const niche = nicheInput.value.trim();
    const city = cityInput.value.trim() || 'Franca SP';
    if (!niche) return;
    await triggerProspecting(niche, city);
  });

  // Sugestões rápidas de nichos (chips)
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const niche = btn.dataset.niche;
      if (!niche) return;
      nicheInput.value = niche;
      const city = cityInput.value.trim() || 'Franca SP';
      await triggerProspecting(niche, city);
    });
  });

  // Filtro de texto em tempo real
  filterSearch.addEventListener('input', () => {
    render();
  });

  // Cards de métricas clicáveis (Filtro principal)
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeTab = card.dataset.filter;
      render();
    });
  });

  // Alternar visualização (Tabela vs Cards)
  document.getElementById('viewTable').addEventListener('click', () => {
    currentView = 'table';
    document.getElementById('viewTable').classList.add('active');
    document.getElementById('viewCards').classList.remove('active');
    tableView.style.display = 'block';
    cardsView.style.display = 'none';
  });

  document.getElementById('viewCards').addEventListener('click', () => {
    currentView = 'cards';
    document.getElementById('viewCards').classList.add('active');
    document.getElementById('viewTable').classList.remove('active');
    tableView.style.display = 'none';
    cardsView.style.display = 'grid';
  });

  // Fechar Modal
  modalClose.addEventListener('click', closeModal);
  leadModal.addEventListener('click', (e) => {
    if (e.target === leadModal) closeModal();
  });

  // Alternar Modo de Edição de Dados da Empresa
  if (btnToggleEditLead) {
    btnToggleEditLead.addEventListener('click', () => {
      const isEditing = leadEditForm.style.display !== 'none';
      if (isEditing) {
        leadEditForm.style.display = 'none';
        leadViewFields.style.display = 'block';
        btnToggleEditLead.textContent = '✏️ Editar';
      } else {
        leadEditForm.style.display = 'block';
        leadViewFields.style.display = 'none';
        btnToggleEditLead.textContent = '👁️ Ver';
      }
    });
  }

  if (btnCancelEditLead) {
    btnCancelEditLead.addEventListener('click', () => {
      leadEditForm.style.display = 'none';
      leadViewFields.style.display = 'block';
      btnToggleEditLead.textContent = '✏️ Editar';
    });
  }

  if (leadEditForm) {
    leadEditForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentSelectedLead) return;

      const submitBtn = document.getElementById('btnSaveLeadFields');
      const origText = submitBtn ? submitBtn.textContent : 'Salvar Alterações';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvando...';
      }

      const nome = editLeadName ? editLeadName.value.trim() : '';
      const instagram = editLeadInsta ? editLeadInsta.value.trim() : '';
      const facebook = editLeadFb ? editLeadFb.value.trim() : '';
      const whatsapp = editLeadWa ? editLeadWa.value.trim() : '';
      const siteOriginal = editLeadSite ? editLeadSite.value.trim() : '';

      const targetId = currentSelectedLead.id || currentSelectedLead.slug;
      const success = await updateLeadOnServer(targetId, {
        nome,
        instagram,
        facebook,
        whatsapp,
        siteOriginal
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = success ? '✅ Salvo!' : origText;
      }

      if (success) {
        setTimeout(() => {
          if (submitBtn) submitBtn.textContent = origText;
          leadEditForm.style.display = 'none';
          leadViewFields.style.display = 'block';
          btnToggleEditLead.textContent = '✏️ Editar';
          if (currentSelectedLead) {
            openModal(currentSelectedLead);
          }
        }, 350);
      } else {
        alert('Não foi possível salvar as alterações no momento.');
      }
    });
  }

  // Abas do Modal
  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tabId = 'tabContent' + btn.dataset.modaltab.charAt(0).toUpperCase() + btn.dataset.modaltab.slice(1);
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');
    });
  });

  // Copiar WhatsApp
  btnCopyWa.addEventListener('click', () => {
    navigator.clipboard.writeText(modalWaText.textContent);
    showTempBtnText(btnCopyWa, '✅ Copiado!');
  });

  // Copiar E-mail
  btnCopyEmail.addEventListener('click', () => {
    const fullEmail = `Assunto: ${modalEmailSubject.textContent}\n\n${modalEmailBody.textContent}`;
    navigator.clipboard.writeText(fullEmail);
    showTempBtnText(btnCopyEmail, '✅ Copiado!');
  });

  // Salvar Anotações
  btnSaveNotes.addEventListener('click', async () => {
    if (!currentSelectedLead) return;
    const text = modalNotes.value.trim();
    await updateLeadOnServer(currentSelectedLead.id, { anotacoes: text });
    showTempBtnText(btnSaveNotes, 'Salvo!');
  });

  // Alterar Status no Modal
  modalStatusSelect.addEventListener('change', async () => {
    if (!currentSelectedLead) return;
    const newStatus = modalStatusSelect.value;
    await updateLeadOnServer(currentSelectedLead.id, { status: newStatus });
  });

  // Gerar Protótipo dentro do Modal
  btnGenerateProto.addEventListener('click', async () => {
    if (!currentSelectedLead) return;
    const selectedTemplate = templateSelector ? templateSelector.value : getRecommendedArchetype(currentSelectedLead);
    btnGenerateProto.disabled = true;
    btnGenerateProto.textContent = 'Gerando Protótipo...';
    await generatePrototypeForLead(currentSelectedLead.id || currentSelectedLead.slug, selectedTemplate);
    btnGenerateProto.disabled = false;
  });

  // Forçar Re-mineração Completa (Google Maps + Instagram)
  if (btnForceEnrichProto) {
    btnForceEnrichProto.addEventListener('click', async () => {
      if (!currentSelectedLead) return;
      const selectedTemplate = templateSelector ? templateSelector.value : getRecommendedArchetype(currentSelectedLead);
      await generatePrototypeForLead(currentSelectedLead.id || currentSelectedLead.slug, selectedTemplate, true);
    });
  }
}

function showTempBtnText(btn, tempText) {
  const original = btn.textContent;
  btn.textContent = tempText;
  setTimeout(() => { btn.textContent = original; }, 2000);
}

// Buscar dados do servidor
async function fetchLeads() {
  loadingIndicator.style.display = 'block';
  try {
    const res = await fetch('/api/leads');
    const data = await res.json();
    allLeads = data.leads || [];
    allCategories = data.categories || [];
    updateStats(data.stats || {});
    renderCategoryChips();
    render();
  } catch (err) {
    console.error('Erro ao buscar leads:', err);
  } finally {
    loadingIndicator.style.display = 'none';
  }
}

// Renderizar botões de filtro de categoria de negócio
function renderCategoryChips() {
  if (!categoryChips) return;

  // Se não vier do backend, calcula a partir de allLeads
  let categoriesToRender = allCategories;
  if (!categoriesToRender || categoriesToRender.length === 0) {
    const map = new Map();
    allLeads.forEach(l => {
      const cat = l.categoria || { slug: 'outros', nome: 'Geral', icone: '🏢', badgeClass: 'cat-other' };
      if (!map.has(cat.slug)) {
        map.set(cat.slug, {
          slug: cat.slug,
          nome: cat.nome,
          icone: cat.icone,
          badgeClass: cat.badgeClass || 'cat-other',
          total: 0
        });
      }
      map.get(cat.slug).total++;
    });
    categoriesToRender = Array.from(map.values()).sort((a, b) => b.total - a.total);
  }

  let html = `
    <button class="cat-chip ${activeCategory === 'todas' ? 'active' : ''}" data-cat="todas">
      <span class="cat-chip-icon">🌐</span>
      <span class="cat-chip-label">Todos os Segmentos</span>
      <span class="cat-chip-count">${allLeads.length}</span>
    </button>
  `;

  categoriesToRender.forEach(cat => {
    const count = allLeads.filter(l => l.categoria && l.categoria.slug === cat.slug).length;
    html += `
      <button class="cat-chip ${activeCategory === cat.slug ? 'active' : ''}" data-cat="${cat.slug}">
        <span class="cat-chip-icon">${cat.icone}</span>
        <span class="cat-chip-label">${cat.nome}</span>
        <span class="cat-chip-count">${count}</span>
      </button>
    `;
  });

  categoryChips.innerHTML = html;

  // Listeners de clique nas categorias
  categoryChips.querySelectorAll('.cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.cat;
      activeCategory = selected;
      renderCategoryChips();
      render();
    });
  });
}

function updateStats(stats) {
  statTotal.textContent = stats.total || 0;
  statHot.textContent = stats.oportunidadesQuentes || 0;
  if (statOnline) statOnline.textContent = stats.sitesAtivos || 0;
  statReady.textContent = stats.prototiposProntos || 0;
  statContacted.textContent = (stats.contatados || 0) + (stats.negociando || 0);
  statDiscarded.textContent = stats.descartados || 0;
}

// Disparar mineração de leads
async function triggerProspecting(niche, city) {
  const btnText = btnProspect.querySelector('.btn-text');
  const spinner = btnProspect.querySelector('.spinner');
  
  btnProspect.disabled = true;
  btnText.textContent = 'Minerando no Google Maps...';
  spinner.style.display = 'inline-block';
  searchNotice.className = 'search-notice';
  searchNotice.style.display = 'block';
  searchNotice.textContent = `Buscando até 5 estabelecimentos qualificados de "${niche}" em ${city} com Playwright em segundo plano. Aguarde alguns instantes...`;

  try {
    const res = await fetch('/api/prospect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche, city, limit: 5 })
    });

    const data = await res.json();
    if (data.success) {
      allLeads = data.leads || [];
      updateStats(data.stats || {});

      const totalFound = data.totalFound ?? (data.rawLeads ? data.rawLeads.length : 0);
      const newLeads = data.newLeads || [];
      const newCount = data.newCount ?? newLeads.length;
      const existingCount = data.existingCount ?? (totalFound - newCount);
      const hotCount = newLeads.filter(l => l.status === 'oportunidade_quente').length;

      if (totalFound === 0) {
        searchNotice.className = 'search-notice';
        searchNotice.textContent = `Nenhum estabelecimento retornado pelo Google Maps para "${niche}" em ${city}.`;
      } else if (newCount === 0) {
        searchNotice.className = 'search-notice';
        searchNotice.textContent = `ℹ️ ${totalFound} empresa(s) analisada(s) no Google Maps, mas TODAS as ${existingCount} já constavam na sua base de dados (dados e status foram sincronizados). Não há novos estabelecimentos para este nicho neste lote.`;
        activeTab = 'todos';
      } else {
        const existingInfo = existingCount > 0 ? ` (${existingCount} já constavam no histórico e foram atualizadas)` : '';
        
        if (hotCount > 0) {
          searchNotice.className = 'search-notice success';
          searchNotice.textContent = `🎉 Concluído! ${totalFound} empresas analisadas: ${newCount} NOVA(S) adicionada(s), sendo ${hotCount} oportunidade(s) quente(s) (sem site próprio)!${existingInfo}. Exibindo em Oportunidades!`;
          activeTab = 'oportunidade_quente';
        } else {
          searchNotice.className = 'search-notice';
          searchNotice.textContent = `ℹ️ Concluído! ${totalFound} empresas analisadas: ${newCount} NOVA(S) adicionada(s) (com site ativo com SSL)${existingInfo}. Exibindo em Sites Ativos!`;
          activeTab = 'site_ativo';
        }
      }

      document.querySelectorAll('.stat-card').forEach(c => {
        c.classList.toggle('active', c.dataset.filter === activeTab);
      });
      render();
    } else {
      searchNotice.className = 'search-notice error';
      searchNotice.textContent = `Aviso: ${data.error || 'Nenhum lead encontrado'}`;
    }
  } catch (err) {
    searchNotice.className = 'search-notice error';
    searchNotice.textContent = `Erro ao conectar com o robô de mineração: ${err.message}`;
  } finally {
    btnProspect.disabled = false;
    btnText.textContent = 'Buscar Empresas';
    spinner.style.display = 'none';
  }
}

// Renderização Principal
function render() {
  const query = filterSearch.value.toLowerCase().trim();
  let filtered = [...allLeads];

  // Filtro por Aba
  if (activeTab !== 'todos') {
    filtered = filtered.filter(l => l.status === activeTab);
  }

  // Filtro por Categoria de Negócio
  if (activeCategory !== 'todas') {
    filtered = filtered.filter(l => l.categoria && l.categoria.slug === activeCategory);
  }

  // Filtro por Texto
  if (query) {
    filtered = filtered.filter(l => 
      l.nome.toLowerCase().includes(query) ||
      (l.categoria && l.categoria.nome.toLowerCase().includes(query)) ||
      (l.whatsappFormatado && l.whatsappFormatado.includes(query)) ||
      (l.telefones && l.telefones.some(t => t.includes(query))) ||
      (l.motivoDescarte && l.motivoDescarte.toLowerCase().includes(query)) ||
      (l.nicho && l.nicho.toLowerCase().includes(query))
    );
  }

  // Estado Vazio
  if (filtered.length === 0) {
    tableView.style.display = 'none';
    cardsView.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  if (currentView === 'table') {
    tableView.style.display = 'block';
    cardsView.style.display = 'none';
  } else {
    tableView.style.display = 'none';
    cardsView.style.display = 'grid';
  }

  // Renderizar Tabela
  tableBody.innerHTML = filtered.map(lead => renderTableRow(lead)).join('');

  // Renderizar Cards
  cardsView.innerHTML = filtered.map(lead => renderCard(lead)).join('');

  attachActionEvents();
}

function renderTableRow(lead) {
  const isDiscarded = lead.status === 'descartado';
  const badgeClass = getBadgeClass(lead.status);
  const badgeLabel = getBadgeLabel(lead.status);

  // Formatação de Contatos
  const phoneDisplay = lead.whatsappFormatado || (lead.telefones && lead.telefones[0]) || 'Sem telefone';
  const waLink = lead.whatsappPrincipal ? `https://wa.me/${lead.whatsappPrincipal}` : '#';

  // Diagnóstico de Site e Presença
  let siteDiagnosticHtml = '';
  if (lead.siteStatus === 'inacessivel') {
    siteDiagnosticHtml = `
      <div>
        <span class="badge-site badge-site-down">🚨 SITE FORA DO AR ${lead.siteHttpCode ? `(${lead.siteHttpCode})` : ''}</span>
        <div style="margin-top: 3px;"><a href="${lead.siteOriginal}" target="_blank" class="site-link-broken" title="${escapeHtml(lead.siteOriginal)}">${escapeHtml(formatDisplayUrl(lead.siteOriginal))}</a></div>
      </div>
    `;
  } else if (lead.siteStatus === 'nenhum' || !lead.siteOriginal) {
    siteDiagnosticHtml = `
      <div>
        <span class="badge-site badge-site-none">⚠️ SEM SITE OFICIAL</span>
      </div>
    `;
  } else if (lead.siteStatus === 'apenas_social') {
    siteDiagnosticHtml = `
      <div>
        <span class="badge-site badge-site-social">📱 APENAS REDES</span>
        <div style="margin-top: 3px;"><a href="${lead.siteOriginal}" target="_blank" class="site-link-social" title="${escapeHtml(lead.siteOriginal)}">${escapeHtml(formatDisplayUrl(lead.siteOriginal))}</a></div>
      </div>
    `;
  } else if (lead.siteStatus === 'online') {
    siteDiagnosticHtml = `
      <div>
        <span class="badge-site badge-site-ok">✅ Site Online</span>
        <div style="margin-top: 3px;"><a href="${lead.siteOriginal}" target="_blank" class="site-link-ok" title="${escapeHtml(lead.siteOriginal)}">${escapeHtml(formatDisplayUrl(lead.siteOriginal))}</a></div>
      </div>
    `;
  } else {
    siteDiagnosticHtml = `<span style="color: var(--text-muted); font-size: 12px;">${escapeHtml(lead.motivoDescarte || 'Sem site')}</span>`;
  }

  // Redes Sociais
  let socialChips = '';
  if (lead.instagram || lead.facebook) {
    socialChips = `
      <div class="social-chips-row">
        ${lead.instagram ? `<a href="${lead.instagram}" target="_blank" class="chip-social chip-insta" title="Instagram da empresa">📸 Insta</a>` : ''}
        ${lead.facebook ? `<a href="${lead.facebook}" target="_blank" class="chip-social chip-fb" title="Facebook da empresa">📘 Face</a>` : ''}
      </div>
    `;
  }

  // Telefones secundários e e-mails
  let extraPhones = '';
  if (lead.telefones && lead.telefones.length > 1) {
    const others = lead.telefones.filter(t => t !== lead.whatsappFormatado && t !== lead.telefones[0]);
    if (others.length > 0) {
      extraPhones = `<br/><small style="color: var(--text-muted);">☎️ ${others.join(', ')}</small>`;
    }
  }

  let emailDisplay = '';
  if (lead.emails && lead.emails.length > 0) {
    emailDisplay = `<br/><small style="color: var(--cyan);">✉️ ${lead.emails[0]}</small>`;
  }

  const accurateMapsUrl = (lead.mapsUrl && lead.mapsUrl.includes('search/?api=1'))
    ? lead.mapsUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.nome + ' ' + (lead.endereco || lead.cidade || 'Franca SP'))}`;

  return `
    <tr data-id="${lead.id || lead.slug}">
      <td class="lead-name-cell">
        <div class="lead-cat-row">
          <span class="badge-category ${(lead.categoria && lead.categoria.badgeClass) || 'cat-other'}">
            ${(lead.categoria && lead.categoria.icone) || '🏢'} ${escapeHtml((lead.categoria && lead.categoria.nome) || lead.nicho || 'Geral')}
          </span>
        </div>
        <strong>${escapeHtml(lead.nome)}</strong>
        <small>${escapeHtml(lead.nicho)} • ${escapeHtml(lead.cidade)}</small>
        ${lead.endereco ? `<br/><small style="color: var(--muted); font-size: 0.72rem;">📍 ${escapeHtml(lead.endereco)}</small>` : ''}
        <div style="margin-top: 4px;"><a href="${accurateMapsUrl}" target="_blank" class="maps-link-btn" title="Abrir ficha oficial no Google Maps">📍 Ver no Google Maps</a></div>
      </td>
      <td>
        ${formatRating(lead.avaliacao)}
      </td>
      <td>
        ${siteDiagnosticHtml}
        ${socialChips}
      </td>
      <td>
        <div>
          ${lead.whatsappPrincipal ? `<a href="${waLink}" target="_blank" class="contact-link-wa">📱 ${phoneDisplay}</a>` : `<span class="contact-text-phone">${phoneDisplay}</span>`}
          ${extraPhones}
          ${emailDisplay}
        </div>
      </td>
      <td>
        <span class="badge ${badgeClass}">${badgeLabel}</span>
      </td>
      <td style="text-align: right;">
        <div class="actions-cell">
          <button class="btn btn-outline btn-sm btn-open-modal" data-id="${lead.id || lead.slug}">
            👁️ Inspecionar
          </button>
          ${lead.status !== 'prototipo_pronto' && !isDiscarded ? `
            <button class="btn btn-primary btn-sm btn-gen-proto" data-id="${lead.id || lead.slug}">
              ⚡ Criar Protótipo
            </button>
          ` : ''}
          ${lead.prototypeUrl ? `
            <a href="${lead.prototypeUrl}" target="_blank" class="btn btn-secondary btn-sm" title="Abrir site em nova aba">
              ↗ Ver Site
            </a>
          ` : ''}
        </div>
      </td>
    </tr>
  `;
}

function renderCard(lead) {
  const badgeClass = getBadgeClass(lead.status);
  const badgeLabel = getBadgeLabel(lead.status);
  const phoneDisplay = lead.whatsappFormatado || (lead.telefones && lead.telefones[0]) || 'Sem telefone';
  const waLink = lead.whatsappPrincipal ? `https://wa.me/${lead.whatsappPrincipal}` : '#';

  // Site Badge
  let siteBadge = '';
  if (lead.siteStatus === 'inacessivel') {
    siteBadge = `<span class="badge-site badge-site-down">🚨 FORA DO AR ${lead.siteHttpCode ? `(${lead.siteHttpCode})` : ''}</span>`;
  } else if (lead.siteStatus === 'nenhum' || !lead.siteOriginal) {
    siteBadge = `<span class="badge-site badge-site-none">⚠️ SEM SITE</span>`;
  } else if (lead.siteStatus === 'apenas_social') {
    siteBadge = `<span class="badge-site badge-site-social">📱 APENAS REDES</span>`;
  } else if (lead.siteStatus === 'online') {
    siteBadge = `<span class="badge-site badge-site-ok">✅ Site Online</span>`;
  }

  // Social chips
  let socialChips = '';
  if (lead.instagram || lead.facebook) {
    socialChips = `
      <div class="social-chips-row" style="margin-bottom: 8px;">
        ${lead.instagram ? `<a href="${lead.instagram}" target="_blank" class="chip-social chip-insta">📸 Insta</a>` : ''}
        ${lead.facebook ? `<a href="${lead.facebook}" target="_blank" class="chip-social chip-fb">📘 Face</a>` : ''}
      </div>
    `;
  }

  return `
    <div class="lead-card" data-id="${lead.id || lead.slug}">
      <div>
        <div class="lead-card-header">
          <span class="badge-category ${(lead.categoria && lead.categoria.badgeClass) || 'cat-other'}">
            ${(lead.categoria && lead.categoria.icone) || '🏢'} ${escapeHtml((lead.categoria && lead.categoria.nome) || lead.nicho || 'Geral')}
          </span>
          <span class="badge ${badgeClass}">${badgeLabel}</span>
        </div>
        <h3 style="font-size: 16px; margin-bottom: 4px;">${escapeHtml(lead.nome)}</h3>
        <p style="font-size: 12px; color: var(--cyan); margin-bottom: 8px;">${escapeHtml(lead.nicho)} • ${escapeHtml(lead.cidade)}</p>
        
        <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          ${siteBadge}
          ${lead.mapsUrl ? `<a href="${lead.mapsUrl}" target="_blank" class="maps-link-btn">📍 Maps</a>` : ''}
        </div>

        ${socialChips}

        <div class="lead-card-body">
          <p><strong>Avaliação:</strong> ${formatRating(lead.avaliacao)}</p>
          <p><strong>Contato:</strong> ${lead.whatsappPrincipal ? `<a href="${waLink}" target="_blank" class="contact-link-wa">${phoneDisplay}</a>` : phoneDisplay}</p>
          <p><strong>Diagnóstico:</strong> ${lead.motivoDescarte || lead.analiseIA || 'Em análise'}</p>
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 14px;">
        <button class="btn btn-outline btn-sm flex-1 btn-open-modal" data-id="${lead.id || lead.slug}">
          Inspecionar
        </button>
        ${lead.status !== 'prototipo_pronto' && lead.status !== 'descartado' ? `
          <button class="btn btn-primary btn-sm flex-1 btn-gen-proto" data-id="${lead.id || lead.slug}">
            Criar Protótipo
          </button>
        ` : ''}
        ${lead.prototypeUrl ? `
          <a href="${lead.prototypeUrl}" target="_blank" class="btn btn-secondary btn-sm flex-1" style="text-align: center;">
            ↗ Ver Site
          </a>
        ` : ''}
      </div>
    </div>
  `;
}

function attachActionEvents() {
  document.querySelectorAll('.btn-open-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const leadId = btn.dataset.id;
      const lead = allLeads.find(l => (l.id === leadId || l.slug === leadId));
      if (lead) openModal(lead);
    });
  });

  document.querySelectorAll('.btn-gen-proto').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const leadId = btn.dataset.id;
      btn.disabled = true;
      btn.innerHTML = '⏳ Minerando...';
      const leadObj = allLeads.find(l => (l.id === leadId || l.slug === leadId));
      const selectedTemplate = getRecommendedArchetype(leadObj);
      await generatePrototypeForLead(leadId, selectedTemplate);
    });
  });
}

// Abertura do Modal de Inspeção
function openModal(lead) {
  currentSelectedLead = lead;

  modalLeadName.textContent = lead.nome;
  modalLeadBadge.className = `badge ${getBadgeClass(lead.status)}`;
  modalLeadBadge.textContent = getBadgeLabel(lead.status);

  if (modalLeadCategory && lead.categoria) {
    modalLeadCategory.className = `badge-category ${lead.categoria.badgeClass || 'cat-other'}`;
    modalLeadCategory.textContent = `${lead.categoria.icone || '🏢'} ${lead.categoria.nome}`;
    modalLeadCategory.style.display = 'inline-flex';
  } else if (modalLeadCategory) {
    modalLeadCategory.style.display = 'none';
  }

  // Diagnóstico detalhado
  let analysisText = '';
  if (lead.siteStatus === 'inacessivel') {
    analysisText = `🚨 ATENÇÃO: O site oficial (${lead.siteOriginal}) está FORA DO AR (HTTP ${lead.siteHttpCode || 403}).\n\nEssa é a melhor abordagem de venda: potenciais clientes e ferramentas de IA (ChatGPT, Meta AI) encontram um erro ao pesquisar a empresa. Oportunidade imediata para ativação do site Subzero!\n\n${lead.analiseIA || ''}`;
  } else if (lead.motivoDescarte) {
    analysisText = `Motivo: ${lead.motivoDescarte}\n${lead.analiseIA || ''}`;
  } else {
    analysisText = lead.analiseIA || 'Empresa qualificada sem presença web oficial.';
  }
  modalLeadAnalysis.textContent = analysisText;

  // Sincronização dos campos de visualização e edição
  if (modalLeadNameDisplay) modalLeadNameDisplay.textContent = lead.nome;
  if (editLeadName) editLeadName.value = lead.nome || '';
  if (editLeadInsta) editLeadInsta.value = lead.instagram || '';
  if (editLeadFb) editLeadFb.value = lead.facebook || '';
  if (editLeadWa) editLeadWa.value = lead.whatsappFormatado || (lead.whatsappPrincipal ? '+' + lead.whatsappPrincipal : '');
  if (editLeadSite) editLeadSite.value = lead.siteOriginal || '';

  if (leadEditForm) leadEditForm.style.display = 'none';
  if (leadViewFields) leadViewFields.style.display = 'block';
  if (btnToggleEditLead) btnToggleEditLead.textContent = '✏️ Editar';

  // Google Maps Ficha
  const modalMapsHref = (lead.mapsUrl && lead.mapsUrl.includes('search/?api=1'))
    ? lead.mapsUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.nome + ' ' + (lead.endereco || lead.cidade || 'Franca SP'))}`;

  modalLeadMapsLink.href = modalMapsHref;
  modalLeadMapsLink.style.display = 'inline-block';

  // Site Original
  if (lead.siteOriginal) {
    const statusNote = lead.siteStatus === 'inacessivel' ? ` [🚨 FORA DO AR ${lead.siteHttpCode ? `(${lead.siteHttpCode})` : ''}]` : '';
    modalLeadSite.innerHTML = `<a href="${lead.siteOriginal}" target="_blank" title="${escapeHtml(lead.siteOriginal)}" style="color: ${lead.siteStatus === 'inacessivel' ? 'var(--red)' : 'var(--cyan)'}; text-decoration: underline; max-width: 300px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle;">${escapeHtml(formatDisplayUrl(lead.siteOriginal))}</a>${statusNote}`;
  } else {
    modalLeadSite.textContent = 'Nenhum site cadastrado';
  }

  // Contatos
  modalLeadWa.textContent = lead.whatsappFormatado || (lead.whatsappPrincipal ? '+' + lead.whatsappPrincipal : 'Não informado');
  modalLeadPhones.textContent = (lead.telefones && lead.telefones.join(', ')) || 'N/A';

  // Instagram
  if (lead.instagram) {
    modalLeadInsta.href = lead.instagram;
    modalLeadInsta.textContent = lead.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@');
    modalLeadInsta.style.display = 'inline-block';
  } else {
    modalLeadInsta.textContent = 'Não localizado';
    modalLeadInsta.removeAttribute('href');
  }

  // Facebook
  if (lead.facebook) {
    modalLeadFb.href = lead.facebook;
    modalLeadFb.textContent = lead.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, '');
    modalLeadFb.style.display = 'inline-block';
  } else {
    modalLeadFb.textContent = 'Não localizado';
    modalLeadFb.removeAttribute('href');
  }

  // Sincroniza seletor de template com arquétipo recomendado ou salvo
  if (templateSelector) {
    templateSelector.value = getRecommendedArchetype(lead);
  }

  modalStatusSelect.value = lead.status;
  modalNotes.value = lead.anotacoes || '';

  // Mensagem WhatsApp
  if (lead.messages && lead.messages.whatsapp) {
    modalWaText.textContent = lead.messages.whatsapp;
    btnCopyWa.style.display = 'inline-flex';
    if (lead.whatsappPrincipal) {
      btnOpenWaWeb.href = `https://web.whatsapp.com/send?phone=${lead.whatsappPrincipal}&text=${encodeURIComponent(lead.messages.whatsapp)}`;
      btnOpenWaWeb.style.display = 'inline-flex';
    } else {
      btnOpenWaWeb.style.display = 'none';
    }
  } else {
    modalWaText.textContent = 'Protótipo ainda não construído para esta empresa.\n\nPara gerar o site completo e as mensagens personalizadas para WhatsApp e E-mail, vá até a aba "💻 Protótipo do Site" e clique em "⚡ Criar Protótipo".';
    btnCopyWa.style.display = 'none';
    btnOpenWaWeb.style.display = 'none';
  }

  // Mensagem E-mail
  if (lead.messages && lead.messages.email) {
    modalEmailSubject.textContent = lead.messages.email.assunto;
    modalEmailBody.textContent = lead.messages.email.corpo;
    btnCopyEmail.style.display = 'inline-flex';
  } else {
    modalEmailSubject.textContent = '-';
    modalEmailBody.textContent = 'Crie o protótipo na aba ao lado para liberar a proposta de e-mail pronta.';
    btnCopyEmail.style.display = 'none';
  }

  // Protótipo
  if (lead.prototypeUrl) {
    prototypeIframe.src = lead.prototypeUrl;
    btnOpenProtoTab.href = lead.prototypeUrl;
    btnOpenProtoTab.style.display = 'inline-flex';
    btnGenerateProto.textContent = '🔄 Regerar Protótipo';
    prototypeStatusLabel.textContent = `✅ Protótipo no ar (${lead.templateEscolhido || 'Subzero Engine'})`;
  } else {
    prototypeIframe.src = 'about:blank';
    btnOpenProtoTab.style.display = 'none';
    btnGenerateProto.textContent = '⚡ Criar Protótipo';
    prototypeStatusLabel.textContent = '⚠️ Protótipo ainda não construído (Aguardando seu clique)';
  }

  leadModal.style.display = 'flex';
}

function closeModal() {
  leadModal.style.display = 'none';
  prototypeIframe.src = 'about:blank';
  currentSelectedLead = null;
}

// Atualizar Lead no Servidor
async function updateLeadOnServer(id, updates) {
  try {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (data.success && data.lead) {
      // Atualiza localmente
      const idx = allLeads.findIndex(l => (l.id === id || l.slug === id));
      if (idx !== -1) allLeads[idx] = data.lead;
      if (currentSelectedLead && (currentSelectedLead.id === id || currentSelectedLead.slug === id)) {
        currentSelectedLead = data.lead;
        modalLeadBadge.className = `badge ${getBadgeClass(data.lead.status)}`;
        modalLeadBadge.textContent = getBadgeLabel(data.lead.status);
        if (modalLeadName) modalLeadName.textContent = data.lead.nome;
        if (modalLeadNameDisplay) modalLeadNameDisplay.textContent = data.lead.nome;
      }
      updateStats(data.stats);
      render();
      return true;
    }
  } catch (err) {
    console.error('Erro ao atualizar lead:', err);
  }
  return false;
}

// Gerar protótipo para um lead com feedback visual e mineração real
async function generatePrototypeForLead(id, template = 'subzero', forceEnrich = null) {
  const leadIdx = allLeads.findIndex(l => (l.id === id || l.slug === id));
  const leadObj = leadIdx !== -1 ? allLeads[leadIdx] : null;

  if (leadObj) {
    leadObj.status = 'gerando_prototipo';
    render();
  }

  // Se já temos avaliações ou dados minerados, geramos instantaneamente em 1s!
  const hasMinedData = (leadObj?.depoimentosReais?.length > 0) || (leadObj?.dadosEnriquecidos?.servicosDetectados?.length > 0) || (leadObj?.fotosReais?.length > 0);
  const shouldForceEnrich = (forceEnrich !== null) ? forceEnrich : !hasMinedData;

  if (btnGenerateProto) {
    btnGenerateProto.disabled = true;
    btnGenerateProto.innerHTML = shouldForceEnrich ? '⏳ Minerando Redes & Construindo...' : '⚡ Compilando Protótipo...';
  }
  if (prototypeStatusLabel) {
    prototypeStatusLabel.innerHTML = shouldForceEnrich 
      ? '⏳ <strong>Minerando redes sociais, Google Maps & construindo site sob medida...</strong> Aguarde alguns segundos...'
      : '⚡ <strong>Compilando novo protótipo com os dados já minerados...</strong> Pronto em segundos!';
  }

  try {
    const res = await fetch(`/api/leads/${id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, archetype: template, forceEnrich: shouldForceEnrich })
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
    } else {
      alert(`Aviso ao gerar protótipo: ${data.error || 'Erro desconhecido'}`);
      if (leadObj) {
        leadObj.status = leadObj.prototypeUrl ? 'prototipo_pronto' : 'oportunidade_quente';
        render();
      }
    }
  } catch (err) {
    alert(`Erro ao gerar protótipo: ${err.message}`);
    if (leadObj) {
      leadObj.status = leadObj.prototypeUrl ? 'prototipo_pronto' : 'oportunidade_quente';
      render();
    }
  } finally {
    if (btnGenerateProto) {
      btnGenerateProto.disabled = false;
      btnGenerateProto.innerHTML = '🔄 Regerar Protótipo';
    }
  }
}

// Utilitários
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

