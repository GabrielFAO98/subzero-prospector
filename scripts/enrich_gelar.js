const { chromium } = require('playwright');
const { huntSocials } = require('../src/social_hunter');
const { checkWebsiteHealth } = require('../src/site_checker');
const { generateOutreachMessages } = require('../src/generator');
const db = require('../src/db');

async function enrichGelar() {
  console.log('🔍 Iniciando auditoria completa da Gelar Ar Condicionado...');

  // 1. Caça redes sociais e telefones
  const socials = await huntSocials('Gelar Ar Condicionado Assistência Técnica', 'Franca SP');
  console.log('📱 Redes & Telefones encontrados:', socials);

  // 2. Playwright no Google Maps
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const searchUrl = 'https://www.google.com/maps/search/Gelar+Ar+Condicionado+Assistencia+Tecnica+Franca+SP';
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const currentUrl = page.url();
  console.log('📍 URL Oficial do Maps:', currentUrl);

  // Verifica se há link de site na ficha
  const siteLink = await page.$('a[data-item-id="authority"]');
  let siteUrl = null;
  if (siteLink) {
    siteUrl = await siteLink.getAttribute('href');
  }
  console.log('🌐 Site listado no Maps:', siteUrl);

  // Avaliação
  let avaliacao = '4,8 estrelas';
  const ratingEl = await page.$('div.F7nice');
  if (ratingEl) {
    avaliacao = (await ratingEl.innerText()).replace(/\n/g, ' ').trim();
  }
  console.log('⭐ Avaliação:', avaliacao);

  // Endereço
  let endereco = 'Franca - SP';
  const addrEl = await page.$('button[data-item-id="address"]');
  if (addrEl) {
    endereco = (await addrEl.innerText()).trim();
  }
  console.log('🏢 Endereço:', endereco);

  await browser.close();

  // 3. Auditoria de site se houver
  const siteAudit = await checkWebsiteHealth(siteUrl);
  console.log('📊 Auditoria de Saúde do Site:', siteAudit);

  // 4. Monta o lead atualizado
  const leadId = 'lead_1789434711738_0';
  const existing = db.getById(leadId);

  const telefonesLimpos = Array.from(new Set([
    '(16) 99966-7658',
    '(16) 3722-7940'
  ]));

  const updates = {
    nome: 'Gelar Ar Condicionado Assistência Técnica Franca/SP',
    nicho: 'ar condicionado',
    cidade: 'Franca SP',
    endereco: endereco,
    avaliacao: avaliacao || '4,8 estrelas (176 comentários)',
    mapsUrl: currentUrl,
    siteOriginal: siteAudit.urlOriginal,
    siteStatus: siteAudit.status, // 'nenhum' ou 'online' ou 'inacessivel'
    siteHealthReason: siteAudit.motivo,
    telefones: telefonesLimpos,
    whatsappPrincipal: '5516999667658',
    whatsappFormatado: '(16) 99966-7658',
    instagram: socials.instagram || 'https://www.instagram.com/gelar_ar_condicionado.franca/',
    facebook: socials.facebook || 'https://www.facebook.com/Gelararcondicionadoo/',
    emails: socials.emails || [],
    prototypePath: existing ? existing.prototypePath : 'C:\\Users\\Gabriel\\dev\\prospector\\previews\\gelar-ar-condicionado-assistencia-tecnica-franca-sp\\index.html',
    prototypeUrl: '/previews/gelar-ar-condicionado-assistencia-tecnica-franca-sp/index.html',
    status: 'prototipo_pronto',
    analiseIA: '🔥 EXCELENTE OPORTUNIDADE: Uma das maiores assistências técnicas de Franca (4.8★ com alta reputação no Google), porém NÃO POSSUI SITE OFICIAL registrado. Conta com perfis ativos nas redes sociais (@gelar_ar_condicionado.franca), mas permanece invisível nas buscas diretas por inteligência artificial (ChatGPT, Meta AI) que exigem domínio oficial.'
  };

  // 5. Gera as mensagens com links relativos/corretos
  updates.messages = generateOutreachMessages(updates, updates.prototypeUrl);

  const updatedLead = db.update(leadId, updates);
  console.log('\n🎉 Lead Gelar Ar Condicionado atualizado com sucesso no banco!');
  console.log(JSON.stringify(updatedLead, null, 2));
}

enrichGelar().catch(console.error);
