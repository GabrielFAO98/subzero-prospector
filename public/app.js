let allLeads = [];
let activeTab = 'oportunidade_quente';
let currentView = 'table';
let currentSelectedLead = null;

// Elementos do DOM
const prospectForm = document.getElementById('prospectForm');
const nicheInput = document.getElementById('nicheInput');
const cityInput = document.getElementById('cityInput');
const btnProspect = document.getElementById('btnProspect');
const searchNotice = document.getElementById('searchNotice');
const filterSearch = document.getElementById('filterSearch');

const statTotal = document.getElementById('statTotal');
const statHot = document.getElementById('statHot');
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
const modalLeadBadge = document.getElementById('modalLeadBadge');
const modalLeadAnalysis = document.getElementById('modalLeadAnalysis');
const modalLeadWa = document.getElementById('modalLeadWa');
const modalLeadPhones = document.getElementById('modalLeadPhones');
const modalLeadSite = document.getElementById('modalLeadSite');
const modalLeadInsta = document.getElementById('modalLeadInsta');
const modalLeadFb = document.getElementById('modalLeadFb');
const modalStatusSelect = document.getElementById('modalStatusSelect');
const modalNotes = document.getElementById('modalNotes');
const btnSaveNotes = document.getElementById('btnSaveNotes');

const modalWaText = document.getElementById('modalWaText');
const btnCopyWa = document.getElementById('btnCopyWa');
const btnOpenWaWeb = document.getElementById('btnOpenWaWeb');

const modalEmailSubject = document.getElementById('modalEmailSubject');
const modalEmailBody = document.getElementById('modalEmailBody');
const btnCopyEmail = document.getElementById('btnCopyEmail');

const prototypeIframe = document.getElementById('prototypeIframe');
const btnGenerateProto = document.getElementById('btnGenerateProto');
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

  // Filtro de texto em tempo real
  filterSearch.addEventListener('input', () => {
    render();
  });

  // Abas de navegação
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      render();
    });
  });

  // Cards de métricas clicáveis
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeTab = card.dataset.filter;
      // Sincroniza aba correspondente
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === activeTab);
      });
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
    btnGenerateProto.disabled = true;
    btnGenerateProto.textContent = 'Gerando...';
    await generatePrototypeForLead(currentSelectedLead.id);
    btnGenerateProto.disabled = false;
    btnGenerateProto.textContent = '⚡ Gerar/Regerar Protótipo';
  });
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
    updateStats(data.stats || {});
    render();
  } catch (err) {
    console.error('Erro ao buscar leads:', err);
  } finally {
    loadingIndicator.style.display = 'none';
  }
}

function updateStats(stats) {
  statTotal.textContent = stats.total || 0;
  statHot.textContent = stats.oportunidadesQuentes || 0;
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
  searchNotice.style.display = 'block';
  searchNotice.textContent = `Buscando estabelecimentos de "${niche}" em ${city} com Playwright em segundo plano. Aguarde alguns instantes...`;

  try {
    const res = await fetch('/api/prospect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche, city, limit: 15 })
    });

    const data = await res.json();
    if (data.success) {
      allLeads = data.leads || [];
      updateStats(data.stats || {});
      searchNotice.textContent = `🎉 Concluído! ${data.message} A lista foi atualizada abaixo.`;
      activeTab = 'oportunidade_quente';
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === 'oportunidade_quente');
      });
      render();
    } else {
      searchNotice.textContent = `Aviso: ${data.error || 'Nenhum lead encontrado'}`;
    }
  } catch (err) {
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

  // Filtro por Texto
  if (query) {
    filtered = filtered.filter(l => 
      l.nome.toLowerCase().includes(query) ||
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

  // Análise / Presença
  let presencaHtml = '';
  if (isDiscarded) {
    presencaHtml = `<span style="color: var(--red);">🚫 Descartada:</span> <small>${lead.motivoDescarte || 'Critério de descarte atingido'}</small>`;
  } else if (lead.status === 'prototipo_pronto') {
    presencaHtml = `<span style="color: var(--cyan);">🌐 Protótipo Subzero Ativo</span><br/><small>Pronto para apresentação comercial</small>`;
  } else {
    presencaHtml = `<span style="color: #ff7675;">🔥 Oportunidade Quente</span><br/><small>${lead.siteOriginal ? 'Link: ' + lead.siteOriginal : 'Nenhum site oficial na web'}</small>`;
  }

  return `
    <tr data-id="${lead.id || lead.slug}">
      <td class="lead-name-cell">
        <strong>${escapeHtml(lead.nome)}</strong>
        <small>${escapeHtml(lead.nicho)} • ${escapeHtml(lead.cidade)}</small>
      </td>
      <td>
        <strong>${lead.avaliacao || 'Sem nota'}</strong>
      </td>
      <td>
        ${presencaHtml}
      </td>
      <td>
        <div>
          ${lead.whatsappPrincipal ? `<a href="${waLink}" target="_blank" style="color: var(--green); text-decoration: none; font-weight: 600;">📱 ${phoneDisplay}</a>` : `<span>${phoneDisplay}</span>`}
        </div>
        ${lead.emails && lead.emails.length > 0 ? `<small style="color: var(--text-muted);">${lead.emails[0]}</small>` : ''}
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
              ⚡ Gerar Site
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

  return `
    <div class="lead-card" data-id="${lead.id || lead.slug}">
      <div>
        <div class="lead-card-header">
          <span class="badge ${badgeClass}">${badgeLabel}</span>
          <small style="color: var(--text-muted);">${lead.avaliacao || ''}</small>
        </div>
        <h3 style="font-size: 16px; margin-bottom: 4px;">${escapeHtml(lead.nome)}</h3>
        <p style="font-size: 12px; color: var(--cyan); margin-bottom: 12px;">${escapeHtml(lead.nicho)} • ${escapeHtml(lead.cidade)}</p>
        
        <div class="lead-card-body">
          <p><strong>Contato:</strong> ${phoneDisplay}</p>
          <p><strong>Diagnóstico:</strong> ${lead.motivoDescarte || lead.analiseIA || 'Em análise'}</p>
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 14px;">
        <button class="btn btn-outline btn-sm flex-1 btn-open-modal" data-id="${lead.id || lead.slug}">
          Inspecionar
        </button>
        ${lead.status !== 'prototipo_pronto' && lead.status !== 'descartado' ? `
          <button class="btn btn-primary btn-sm flex-1 btn-gen-proto" data-id="${lead.id || lead.slug}">
            Gerar Site
          </button>
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
      btn.textContent = 'Gerando...';
      await generatePrototypeForLead(leadId);
    });
  });
}

// Abertura do Modal de Inspeção
function openModal(lead) {
  currentSelectedLead = lead;

  modalLeadName.textContent = lead.nome;
  modalLeadBadge.className = `badge ${getBadgeClass(lead.status)}`;
  modalLeadBadge.textContent = getBadgeLabel(lead.status);

  modalLeadAnalysis.textContent = lead.motivoDescarte 
    ? `Motivo de Descarte: ${lead.motivoDescarte}\n${lead.analiseIA || ''}`
    : (lead.analiseIA || 'Empresa qualificada sem presença web oficial.');

  modalLeadWa.textContent = lead.whatsappFormatado || 'Não informado';
  modalLeadPhones.textContent = (lead.telefones && lead.telefones.join(', ')) || 'N/A';
  modalLeadSite.textContent = lead.siteOriginal || 'Nenhum site oficial cadastrado';
  modalLeadInsta.textContent = lead.instagram || 'Não localizado';
  modalLeadFb.textContent = lead.facebook || 'Não localizado';

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
    modalWaText.textContent = 'Protótipo ainda não gerado. Clique em "Gerar/Regerar Protótipo" para gerar a mensagem personalizada.';
    btnOpenWaWeb.style.display = 'none';
  }

  // Mensagem E-mail
  if (lead.messages && lead.messages.email) {
    modalEmailSubject.textContent = lead.messages.email.assunto;
    modalEmailBody.textContent = lead.messages.email.corpo;
  } else {
    modalEmailSubject.textContent = '-';
    modalEmailBody.textContent = 'Gere o protótipo para liberar o e-mail.';
  }

  // Protótipo
  if (lead.prototypeUrl) {
    prototypeIframe.src = lead.prototypeUrl;
    btnOpenProtoTab.href = lead.prototypeUrl;
    btnOpenProtoTab.style.display = 'inline-flex';
    prototypeStatusLabel.textContent = '✅ Protótipo no ar (Local)';
  } else {
    prototypeIframe.src = 'about:blank';
    btnOpenProtoTab.style.display = 'none';
    prototypeStatusLabel.textContent = '⚠️ Protótipo ainda não construído';
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
    if (data.success) {
      // Atualiza localmente
      const idx = allLeads.findIndex(l => (l.id === id || l.slug === id));
      if (idx !== -1) allLeads[idx] = data.lead;
      if (currentSelectedLead && (currentSelectedLead.id === id || currentSelectedLead.slug === id)) {
        currentSelectedLead = data.lead;
        modalLeadBadge.className = `badge ${getBadgeClass(data.lead.status)}`;
        modalLeadBadge.textContent = getBadgeLabel(data.lead.status);
      }
      updateStats(data.stats);
      render();
    }
  } catch (err) {
    console.error('Erro ao atualizar lead:', err);
  }
}

// Gerar protótipo para um lead
async function generatePrototypeForLead(id) {
  try {
    const res = await fetch(`/api/leads/${id}/generate`, {
      method: 'POST'
    });
    const data = await res.json();
    if (data.success) {
      const idx = allLeads.findIndex(l => (l.id === id || l.slug === id));
      if (idx !== -1) allLeads[idx] = data.lead;
      if (currentSelectedLead && (currentSelectedLead.id === id || currentSelectedLead.slug === id)) {
        openModal(data.lead);
      }
      updateStats(data.stats);
      render();
    }
  } catch (err) {
    alert(`Erro ao gerar protótipo: ${err.message}`);
  }
}

// Utilitários
function getBadgeClass(status) {
  switch(status) {
    case 'oportunidade_quente': return 'badge-hot';
    case 'prototipo_pronto': return 'badge-ready';
    case 'contatado': case 'negociando': return 'badge-contacted';
    case 'descartado': return 'badge-discarded';
    default: return 'badge-ready';
  }
}

function getBadgeLabel(status) {
  switch(status) {
    case 'oportunidade_quente': return '🔥 Oportunidade';
    case 'prototipo_pronto': return '🌐 Protótipo Pronto';
    case 'contatado': return '📞 Contatado';
    case 'negociando': return '🤝 Negociando';
    case 'descartado': return '🚫 Descartado';
    default: return status;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
