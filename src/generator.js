const fs = require('fs');
const path = require('path');

const TEMPLATES_ROOT = path.join(__dirname, '..', 'templates');
const PREVIEWS_DIR = path.join(__dirname, '..', 'previews');
const FALLBACK_TEMPLATE_DIR = path.join(TEMPLATES_ROOT, 'padrao');

/**
 * Mapeia o nicho/empresa para o arquétipo ideal
 */
function getArchetype(nicho = '', nome = '', templateHint = null) {
  if (templateHint && ['industrial', 'clinical', 'care'].includes(templateHint)) {
    return templateHint;
  }

  const norm = (str = '') => (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c');

  const n = norm(nicho);
  const nameLower = norm(nome);

  // 1. Odontologia, Médicos, Clínicas e Saúde -> clinical
  if (n.includes('odonto') || n.includes('dent') || n.includes('medic') || n.includes('clinic') || n.includes('saude') || n.includes('psico') || n.includes('estetica') || n.includes('fisio') || nameLower.includes('odonto') || nameLower.includes('dent')) {
    return 'clinical';
  }

  // 2. Veterinárias, Pet Shops, Banho & Tosa -> care
  if (n.includes('veterin') || n.includes('pet') || n.includes('cao') || n.includes('cachorro') || n.includes('gato') || n.includes('banho') || n.includes('tosa') || n.includes('animal') || nameLower.includes('pet') || nameLower.includes('vet')) {
    return 'care';
  }

  // 3. Engenharia, Construção, Climatização, Segurança, Solar, B2B e outros -> industrial
  return 'industrial';
}

/**
 * Analisa e extrai dados reais de avaliação do Google Maps
 */
function parseRatingData(avaliacaoStr, cidade = 'Franca SP') {
  let starsRating = '★ 5.0';
  let ratingNum = '5.0';
  let reviewCount = null;

  if (avaliacaoStr && typeof avaliacaoStr === 'string') {
    const numMatch = avaliacaoStr.match(/(\d+[\.,]\d+)/);
    if (numMatch) {
      ratingNum = numMatch[1].replace(',', '.');
      starsRating = `★ ${ratingNum}`;
    }
    const countMatch = avaliacaoStr.match(/(\d+)\s*(?:coment[aá]rios|avalia[çc][õo]es|reviews)/i);
    if (countMatch) {
      reviewCount = countMatch[1];
    }
  }

  let badgeTrustText = '';
  if (reviewCount) {
    badgeTrustText = `Nota ${ratingNum} no Google Maps • Mais de ${reviewCount} avaliações em ${cidade}`;
  } else if (ratingNum && ratingNum !== '5.0') {
    badgeTrustText = `Nota ${ratingNum} no Google Maps • Clientes Satisfeitos em ${cidade}`;
  } else {
    badgeTrustText = `Referência em Qualidade • Avaliações Reais • ${cidade}`;
  }

  return {
    starsRating,
    ratingNum,
    reviewCount,
    badgeTrustText
  };
}

/**
 * Retorna conteúdo bespoke, realista e persuasivo adaptado à empresa e nicho
 */
/**
 * Prepara depoimentos priorizando 100% depoimentos autênticos minerados do Google Maps
 */
function cleanAuthorName(author) {
  let name = (author || 'Cliente Google Maps').trim();

  // Remove corporate suffixes for cleaner badge display
  name = name.replace(/\s+(?:Consultoria|Ltda|ME|EPP|S\/A|Assessoria|Com[eé]rcio|Servi[çc]os).*/i, '');
  if (name.includes(' - ')) name = name.split(' - ')[0].trim();
  if (name.includes(' | ')) name = name.split(' | ')[0].trim();

  // Title case if lowercase or all uppercase
  const preps = ['de', 'da', 'do', 'das', 'dos', 'e'];
  name = name.split(/\s+/).map((w, i) => {
    const lower = w.toLowerCase();
    if (i > 0 && preps.includes(lower)) return lower;
    return lower.replace(/^([(["]?)([a-z\u00C0-\u00FF])/, (_, p1, p2) => p1 + p2.toUpperCase());
  }).join(' ');

  return name;
}

function formatAddressNicely(rawAddress, cidade = 'Franca SP') {
  if (!rawAddress || rawAddress.trim().length < 4) {
    return {
      linha1: 'Atendimento em Domicílio e Empresas',
      bairroCidade: `${cidade} e Região`,
      completo: `Atendimento em ${cidade} e Região`
    };
  }

  let clean = rawAddress
    .replace(/^[^a-zA-Z0-9]+/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Fix doubled words like "Elias Elias"
  clean = clean.replace(/\b(\w+)\s+\1\b/gi, '$1');

  let linha1 = clean;
  let bairroCidade = cidade;

  if (clean.includes(',')) {
    const parts = clean.split(',');
    linha1 = parts[0].trim();
    if (parts[1]) {
      bairroCidade = parts.slice(1).join(', ').trim();
    }
  }

  return {
    linha1,
    bairroCidade,
    completo: clean
  };
}

function prepareReviews(lead, defaultReviews, cleanCompanyName) {
  const reviews = [];

  if (lead && lead.depoimentosReais && Array.isArray(lead.depoimentosReais) && lead.depoimentosReais.length > 0) {
    for (const r of lead.depoimentosReais) {
      if (reviews.length >= 4) break;
      if (r && r.text && r.text.trim().length > 15) {
        reviews.push({
          autor: cleanAuthorName(r.author),
          texto: r.text.replace(/^"|"$/g, '').trim()
        });
      }
    }
  }

  // Completa com fallbacks de alta conversão caso o estabelecimento tenha menos de 4 reviews textuais
  let fbIdx = 0;
  while (reviews.length < 4 && fbIdx < defaultReviews.length) {
    reviews.push(defaultReviews[fbIdx]);
    fbIdx++;
  }

  return reviews;
}

function getNicheContent(nicho = '', nomeEmpresa = '', cidade = 'Franca SP', lead = {}) {
  const norm = (str = '') => str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c');

  const n = norm(nicho);
  const nameLower = norm(nomeEmpresa);

  // 1. CLÍNICA VETERINÁRIA & PET
  if (n.includes('veterin') || n.includes('pet') || nameLower.includes('vet') || nameLower.includes('pet')) {
    return {
      subtitulo: 'Medicina Veterinária & Estética Animal',
      tituloPrincipal: 'Cuidado Dedicado e Medicina de Precisão para Seu Pet',
      chamadaPrincipal: 'Saúde, Prevenção e Bem-Estar Animal em Franca',
      slogan: 'Medicina preventiva, exames rápidos e atendimento acolhedor.',
      apresentacao: `Atendimento veterinário humanizado em ${cidade}, com estrutura moderna e cuidados preventivos para a saúde do seu pet.`,
      servicos: [
        { nome: 'Consultas Clínicas & Check-up', desc: 'Avaliação clínica detalhada e exames preventivos completos.' },
        { nome: 'Centro Cirúrgico & Procedimentos', desc: 'Estrutura cirúrgica esterilizada com monitoramento contínuo.' },
        { nome: 'Vacinação Importada & Prevenção', desc: 'Protocolos vacinais completos com refrigeração rigorosa.' },
        { nome: 'Estética Animal, Banho & Tosa', desc: 'Cosméticos hipoalergênicos e tosa especializada sem estresse.' }
      ],
      diferenciais: [
        { titulo: 'Medicina Humanizada', desc: 'Trato calmo e empático, respeitando o tempo do seu pet.' },
        { titulo: 'Diagnóstico Preciso', desc: 'Exames laboratoriais ágeis para conduta médica segura.' },
        { titulo: 'Clínica Integrada', desc: 'Consultas, cirurgias e estética animal no mesmo local.' }
      ],
      avaliacoes: prepareReviews(lead, [
        { autor: 'Mariana Silveira', texto: `Equipe da ${nomeEmpresa} é maravilhosa! Cuidaram do meu cachorro com muito carinho e profissionalismo. Recomendo!` },
        { autor: 'Renato F. Oliveira', texto: `O melhor atendimento de Franca! Meus pets voltam sempre tranquilos, limpinhos e cheirosos. Lugar de total confiança.` },
        { autor: 'Carla Beatriz Ramos', texto: `Profissionais muito capacitados e transparentes na ${nomeEmpresa}. Explicam tudo com calma e sem empurrar gastos extras.` },
        { autor: 'Diego M. Santos', texto: `Ambiente super limpo e atendimento acolhedor desde a recepção. Toda a equipe da ${nomeEmpresa} está de parabéns.` }
      ], nomeEmpresa),
      imagensServicos: ['hero.jpg', 'workshop.jpg', 'hero.jpg', 'workshop.jpg']
    };
  }

  // 2. SEGURANÇA: DISTRIBUIDORA / ATACADISTA
  if ((nameLower.includes('distribuidora') || nameLower.includes('atacado') || nameLower.includes('distribuicao')) && 
      (n.includes('seguranca') || n.includes('eletronica') || nameLower.includes('seguranca') || nameLower.includes('eletronica') || nameLower.includes('kell'))) {
    return {
      subtitulo: 'Distribuidora de Segurança Eletrônica',
      tituloPrincipal: 'Equipamentos e Tecnologia para Integradores e Instaladores',
      chamadaPrincipal: 'Pronta-Entrega e Preço de Distribuidor em Franca',
      slogan: 'Câmeras, alarmes, motores e controle de acesso com suporte técnico.',
      apresentacao: `Estoque local com pronta-entrega e suporte técnico para integradores e empresas de segurança em ${cidade}.`,
      servicos: [
        { nome: 'Câmeras CFTV & Gravadores', desc: 'Linhas completas em alta definição para residências e comércios.' },
        { nome: 'Centrais de Alarme & Sensores', desc: 'Sistemas com alerta no celular e detecção perimetral precisa.' },
        { nome: 'Motores para Portão & Acessórios', desc: 'Automatizadores ultrarrápidos com garantia oficial de fábrica.' },
        { nome: 'Concertinas & Fios de Choque', desc: 'Hastes reforçadas, cabeamento homologado e concertinas galvalume.' }
      ],
      diferenciais: [
        { titulo: 'Estoque Local em Franca', desc: 'Retirada imediata sem frete para cumprir seus prazos de obra.' },
        { titulo: 'Marcas Líderes Originais', desc: 'Equipamentos certificados com garantia oficial dos fabricantes.' },
        { titulo: 'Suporte aos Instaladores', desc: 'Equipe especializada para auxiliar na especificação de cada projeto.' }
      ],
      avaliacoes: prepareReviews(lead, [
        { autor: 'Marcos Vinicius (Instalador)', texto: `Melhor distribuidora de Franca! Preço justo de atacado e a ${nomeEmpresa} sempre tem o material a pronta entrega quando preciso.` },
        { autor: 'Lucas Andrade', texto: `Compro equipamentos com a ${nomeEmpresa} há anos. O suporte técnico deles tira qualquer dúvida e os produtos são de ponta.` },
        { autor: 'Carlos Eduardo Souza', texto: `Atendimento nota dez! Agilidade na separação de pedidos e marcas confiáveis para quem trabalha com segurança profissional.` },
        { autor: 'Fernando Silveira', texto: `Excelente estoque de motores e câmeras. Parceria de confiança para instaladores em toda a região de Franca.` }
      ], nomeEmpresa),
      imagensServicos: ['camera-cftv.jpg', 'alarme-sensores.jpg', 'motor-portao.jpg', 'concertina-dupla.jpg']
    };
  }

  // 3. SEGURANÇA: MONITORAMENTO 24H, RASTREAMENTO & ALARMES (Ex: TELEPÚBLICO, ICON, BLACKOUT)
  if (nameLower.includes('monitoramento') || nameLower.includes('alarme') || nameLower.includes('rastreamento') || n.includes('monitoramento') || n.includes('rastreamento')) {
    return {
      subtitulo: 'Central de Monitoramento 24 Horas & Segurança',
      tituloPrincipal: 'Vigilância Ativa e Resposta Rápida 24 Horas',
      chamadaPrincipal: 'Proteção Ininterrupta para Sua Residência e Empresa',
      slogan: 'Monitoramento 24 horas de alta precisão com pronta-resposta e app móvel.',
      apresentacao: `Proteção patrimonial ativa em ${cidade} com monitoramento 24 horas, equipe de pronta-resposta e alertas em tempo real no celular.`,
      servicos: [
        { nome: 'Central de Monitoramento 24 Horas', desc: 'Vigilância 365 dias ao ano com protocolo de checagem imediata.' },
        { nome: 'Alarmes com Sensores Inteligentes', desc: 'Detecção precisa sem disparos falsos e alerta instantâneo no app.' },
        { nome: 'Câmeras CFTV HD com Acesso Móvel', desc: 'Imagens em alta definição com visão noturna e visualização no celular.' },
        { nome: 'Controle de Acesso & Automação', desc: 'Videoporteiros IP, biometria e motores rápidos para entrada segura.' }
      ],
      diferenciais: [
        { titulo: 'Central Ativa 24h', desc: 'Equipe monitorando seu imóvel com tempo recorde de atendimento.' },
        { titulo: 'Controle no Aplicativo', desc: 'Arme, desarme e visualize câmeras de qualquer lugar pelo celular.' },
        { titulo: 'Apoio Tático em Campo', desc: 'Deslocamento ágil de equipe tática em acionamentos suspeitos.' }
      ],
      avaliacoes: prepareReviews(lead, [
        { autor: 'Eduardo Fagundes', texto: `A equipe da ${nomeEmpresa} instalou o sistema na nossa empresa em Franca. A central 24h é super atenta e o aplicativo no celular funciona perfeitamente.` },
        { autor: 'Luciana Bernardes', texto: `Depois que contratamos o monitoramento da ${nomeEmpresa}, temos total tranquilidade em casa. Quando disparou por engano, ligaram em menos de 1 minuto. Impecável!` },
        { autor: 'Roberto Guimarães', texto: `Profissionais muito qualificados. Fizeram uma instalação limpa, sem cabos aparentes, e explicaram todo o sistema com muita paciência. Recomendo!` },
        { autor: 'Patrícia Mendes', texto: `Melhor empresa de segurança e monitoramento de Franca. Pontualidade, suporte imediato e preço justo pelo nível do serviço prestado.` }
      ], nomeEmpresa),
      imagensServicos: ['camera-cftv.jpg', 'alarme-sensores.jpg', 'videoporteiro.jpg', 'motor-portao.jpg']
    };
  }

  // 4. SEGURANÇA: CERCAS ELÉTRICAS, CONCERTINAS & CFTV
  if (n.includes('seguranca') || n.includes('cerca') || n.includes('camera') || n.includes('cftv') || n.includes('portao') || nameLower.includes('seguranca') || nameLower.includes('eletronica')) {
    return {
      subtitulo: 'Proteção Perimetral & CFTV em Franca',
      tituloPrincipal: 'Proteja Sua Família e Seu Patrimônio com Segurança Reforçada',
      chamadaPrincipal: 'Barreiras de Alta Resistência Que Fazem o Invasor Desistir',
      slogan: 'Cercas elétricas, concertinas galvalume e câmeras no celular com garantia.',
      apresentacao: `Instalação técnica de cercas elétricas, concertinas e câmeras em ${cidade} com agilidade e garantia documentada.`,
      servicos: [
        { nome: 'Cercas Elétricas & Alarmes', desc: 'Proteção perimetral com choque pulsativo e sirene de alta potência.' },
        { nome: 'Concertinas Duplas Galvalume', desc: 'Lâminas afiadas em aço galvalume resistente a cortes e corrosão.' },
        { nome: 'Câmeras de Segurança CFTV', desc: 'Imagens nítidas no escuro com alertas e acompanhamento no celular.' },
        { nome: 'Motores para Portão & Interfonia', desc: 'Abertura rápida com travas elétricas e acionamento seguro no controle.' }
      ],
      diferenciais: [
        { titulo: 'Instalação Rápida e Limpa', desc: 'Execução técnica sem quebra-quebra, respeitando seu imóvel.' },
        { titulo: 'Equipamentos Homologados', desc: 'Centrais e fiação normatizadas pelo Inmetro com máxima segurança.' },
        { titulo: 'Garantia e Suporte Local', desc: 'Orçamento transparente e atendimento ágil direto no WhatsApp.' }
      ],
      avaliacoes: prepareReviews(lead, [
        { autor: 'André Martins', texto: `Instalação impecável da concertina e do motor de portão pela ${nomeEmpresa}. Ficou super alinhado e o atendimento foi rápido e pontual.` },
        { autor: 'Luciana Meireles', texto: `A cerca elétrica e as câmeras ficaram excelentes. Acompanho tudo no celular. Equipe da ${nomeEmpresa} muito honesta e prestativa.` },
        { autor: 'Roberto Faria', texto: `Melhor empresa de segurança de Franca. Preço justo, serviço profissional e pontualidade na entrega.` },
        { autor: 'Patrícia Prado', texto: `Cerca elétrica muito bem estruturada. Passa muita segurança para quem mora em casa térrea. Recomendo a ${nomeEmpresa}!` }
      ], nomeEmpresa),
      imagensServicos: ['cerca-eletrica.jpg', 'concertina-dupla.jpg', 'camera-cftv.jpg', 'motor-portao.jpg']
    };
  }

  // 5. CLIMATIZAÇÃO, AR-CONDICIONADO & REFRIGERAÇÃO (Ex: HUNIFRIO)
  if (n.includes('ar condicionado') || n.includes('ar-condicionado') || n.includes('climatiza') || n.includes('refrigera') || nameLower.includes('frio') || nameLower.includes('clima') || nameLower.includes('ar condicionado')) {
    return {
      subtitulo: 'Climatização & Refrigeração Especializada',
      tituloPrincipal: 'Especialistas em Instalação, Higienização e Manutenção de Ar-Condicionado',
      chamadaPrincipal: 'Temperatura Ideal e Ar Puro para Sua Casa ou Empresa',
      slogan: 'Conforto térmico, economia de energia e ar puro o ano inteiro.',
      apresentacao: `Instalação técnica, manutenção preventiva e higienização profunda em ${cidade} com pontualidade e garantia de fábrica.`,
      servicos: [
        { nome: 'Instalação Split & Inverter', desc: 'Instalação técnica com bomba de vácuo preservando a garantia de fábrica.' },
        { nome: 'Higienização Antibacteriana', desc: 'Limpeza profunda que elimina fungos, odores e reduz o consumo elétrico.' },
        { nome: 'Manutenção Preventiva & Gás', desc: 'Detecção de microvazamentos, recarga ecológica e teste operacional.' },
        { nome: 'Contratos PMOC para Empresas', desc: 'Planos de manutenção em conformidade total com as normas da Anvisa.' }
      ],
      diferenciais: [
        { titulo: 'Padrão Rigoroso de Fábrica', desc: 'Ferramentas de precisão que preservam o compressor e a garantia.' },
        { titulo: 'Ar Puro e Livre de Alergias', desc: 'Higienização química certificada para proteger a saúde de todos.' },
        { titulo: 'Pontualidade e Garantia', desc: 'Horário respeitado e orçamento transparente sem custos ocultos.' }
      ],
      avaliacoes: prepareReviews(lead, [
        { autor: 'Marcelo Siqueira', texto: `Contratei a ${nomeEmpresa} para instalação de dois aparelhos split no meu escritório. Serviço impecável, técnicos organizados e deixaram tudo limpo. Nota 10!` },
        { autor: 'Camila Andrade', texto: `Fizeram a higienização completa e manutenção preventiva do ar-condicionado da minha casa em Franca. Tirou totalmente o cheiro ruim e o aparelho voltou a gelar rápido. Recomendo!` },
        { autor: 'Dr. Marcos Vinicius', texto: `Empresa séria e de total confiança. O atendimento no WhatsApp foi ágil e o técnico da ${nomeEmpresa} chegou exatamente no horário agendado. Vale cada centavo.` },
        { autor: 'Renata Silveira', texto: `Excelente pós-venda da ${nomeEmpresa}. Fizeram o diagnóstico correto sem enrolação e resolveram o problema no mesmo dia. Recomendo de olhos fechados.` }
      ], nomeEmpresa),
      imagensServicos: ['instalacao-split.jpg', 'higienizacao-profunda.jpg', 'manutencao-preventiva.jpg', 'pmoc-comercial.jpg']
    };
  }

  // 6. ENERGIA SOLAR & FOTOVOLTAICA
  if (n.includes('solar') || n.includes('fotovolta') || n.includes('energia') || nameLower.includes('solar')) {
    return {
      subtitulo: 'Energia Solar Fotovoltaica em Franca',
      tituloPrincipal: 'Economize até 95% na Sua Conta de Luz com Energia Solar',
      chamadaPrincipal: 'Independência Energética com Engenharia de Alta Performance',
      slogan: 'Projetos completos com módulos tier-1, engenharia e homologação rápida.',
      apresentacao: `Reduza até 95% dos custos com energia solar fotovoltaica em ${cidade}, com homologação rápida e sem burocracia.`,
      servicos: [
        { nome: 'Projetos Solares Residenciais', desc: 'Geração própria para zerar a conta de luz com garantia de 25 anos.' },
        { nome: 'Usinas Comerciais & Galpões', desc: 'Sistemas de alta potência para reduzir despesas fixas da sua empresa.' },
        { nome: 'Limpeza Técnica & Manutenção', desc: 'Inspeção e limpeza especializada para manter a geração no pico máximo.' },
        { nome: 'Homologação na Concessionária', desc: 'Projeto elétrico com ART e aprovação técnica 100% gerenciada.' }
      ],
      diferenciais: [
        { titulo: 'Módulos Tier-1 Certificados', desc: 'Painéis e inversores líderes mundiais com 25 anos de garantia.' },
        { titulo: 'Engenharia Especializada', desc: 'Dimensionamento sob medida para maximizar o retorno do investimento.' },
        { titulo: 'Aprovação Sem Burocracia', desc: 'Cuidamos de tudo até a ativação dos créditos junto à concessionária.' }
      ],
      avaliacoes: prepareReviews(lead, [
        { autor: 'Carlos Eduardo Silva', texto: `Minha conta de energia caiu para a taxa mínima! A equipe da ${nomeEmpresa} cuidou de tudo com muita seriedade e no prazo combinado.` },
        { autor: 'Vanessa Toledo', texto: `Todo o processo de homologação foi super tranquilo. A ${nomeEmpresa} cuidou de cada detalhe e já estou gerando energia em casa.` },
        { autor: 'Gustavo Mendonça', texto: `Excelente investimento para minha empresa em Franca. A ${nomeEmpresa} tem corpo técnico capacitado e materiais de primeira linha.` },
        { autor: 'Tatiane Lopes', texto: `Profissionais transparentes e prestativos. Recomendo a ${nomeEmpresa} para quem quer energia solar confiável e sem enrolação.` }
      ], nomeEmpresa),
      imagensServicos: ['painel-solar-residencial.jpg', 'hero.jpg', 'manutencao-inversor.jpg', 'workshop.jpg']
    };
  }

  // 7. ODONTOLOGIA & SAÚDE INTEGRADA (Estilo Silveira / DL Odontologia)
  if (n.includes('odonto') || n.includes('dent') || n.includes('medic') || n.includes('saude') || n.includes('clinic') || nameLower.includes('odonto') || nameLower.includes('dent')) {
    return applyMinedOverrides({
      subtitulo: 'Odontologia Especializada & Estética Orofacial',
      tituloPrincipal: 'A Confiança de um Sorriso Perfeito com Conforto e Tecnologia',
      chamadaPrincipal: `Tratamentos Odontológicos Avançados em ${cidade}`,
      slogan: 'Atendimento particular com tecnologia 3D, conforto e biossegurança.',
      apresentacao: `Consultório moderno em ${cidade} dedicado a tratamentos de alta precisão, reabilitação oral e odontologia humanizada sem dor.`,
      servicos: [
        { nome: 'Implantes Dentários & Protocolo', desc: 'Recupere sua mastigação e sorriso com implantes guiados e seguros.' },
        { nome: 'Lentes de Contato & Clareamento', desc: 'Estética dental com porcelana de alta durabilidade e acabamento natural.' },
        { nome: 'Harmonização Orofacial Avançada', desc: 'Procedimentos seguros de equilíbrio estético e rejuvenescimento facial.' },
        { nome: 'Prevenção & Odontologia Sem Dor', desc: 'Protocolos modernos com anestesia precisa e atendimento acolhedor.' }
      ],
      diferenciais: [
        { titulo: 'Tecnologia Digital 3D', desc: 'Planejamento computadorizado para tratamentos precisos e confortáveis.' },
        { titulo: 'Atendimento Particular', desc: 'Pontualidade rigorosa e atenção individualizada a cada paciente.' },
        { titulo: 'Biossegurança Hospitalar', desc: 'Protocolos estéreis rigorosos para a sua total proteção e tranquilidade.' }
      ],
      avaliacoes: prepareReviews(lead, [
        { autor: 'Camila Ferreira', texto: `Excelente atendimento! A equipe da ${nomeEmpresa} é extremamente cuidadosa e pontual. Recomendo de olhos fechados.` },
        { autor: 'Rodrigo Alcantara', texto: `Ambiente impecável e tecnologia de ponta. Fiquei muito satisfeito com o resultado do meu tratamento na ${nomeEmpresa}.` },
        { autor: 'Patricia Meireles', texto: `Profissionais maravilhosos! Tiraram todas as minhas dúvidas com calma e o procedimento foi completamente indolor.` },
        { autor: 'Thiago Nogueira', texto: `A melhor experiência odontológica que já tive em Franca. Super atenciosos desde a recepção!` }
      ], nomeEmpresa),
      imagensServicos: ['hero.jpg', 'workshop.jpg', 'hero.jpg', 'workshop.jpg']
    }, lead);
  }

  // 8. ENGENHARIA & CONSTRUÇÃO CIVIL (Estilo Ulo Engenharia)
  if (n.includes('engenharia') || n.includes('construc') || nameLower.includes('engenharia') || nameLower.includes('construc') || nameLower.includes('obras')) {
    return applyMinedOverrides({
      subtitulo: 'Engenharia Civil, Obras & Projetos Estruturais',
      tituloPrincipal: 'Projetos de Alta Precisão e Execução de Obras Sem Dor de Cabeça',
      chamadaPrincipal: `Engenharia, Construção e Regularização em ${cidade}`,
      slogan: 'Projetos estruturais, acompanhamento rigoroso e entrega no prazo.',
      apresentacao: `Soluções completas em engenharia civil e construção em ${cidade}, unindo rigor técnico, segurança e economia inteligente de materiais.`,
      servicos: [
        { nome: 'Gerenciamento & Execução de Obras', desc: 'Acompanhamento técnico diário do alicerce ao acabamento fino.' },
        { nome: 'Cálculo Estrutural de Precisão', desc: 'Dimensionamento em concreto e aço com segurança máxima e economia.' },
        { nome: 'Projetos Arquitetônicos & 3D', desc: 'Planejamento detalhado em 3D para visualização antes de construir.' },
        { nome: 'Regularização Imobiliária & Laudos', desc: 'Habite-se, desdobros, alvarás e laudos periciais junto à prefeitura.' }
      ],
      diferenciais: [
        { titulo: 'Rigor Técnico & ART', desc: 'Projetos assinados com responsabilidade técnica e conformidade total.' },
        { titulo: 'Economia de Materiais', desc: 'Dimensionamento exato que evita desperdícios e reduz o custo da obra.' },
        { titulo: 'Compromisso com Prazos', desc: 'Cronograma de execução planejado e cumprido com transparência.' }
      ],
      avaliacoes: prepareReviews(lead, [
        { autor: 'Marcelo Rezende', texto: `A equipe da ${nomeEmpresa} gerenciou minha obra com muita seriedade. Entregaram no prazo e sem surpresas no orçamento.` },
        { autor: 'Luciana Fontes', texto: `Projeto estrutural impecável e acompanhamento técnico nota 10. Excelente empresa de engenharia em Franca!` },
        { autor: 'Fábio Guimarães', texto: `Profissionais capacitados e muito transparentes na ${nomeEmpresa}. Resolveram toda a regularização do imóvel com agilidade.` },
        { autor: 'Daniela P. Castro', texto: `Muito capricho e rigor técnico em cada detalhe. Recomendo com total certeza para quem vai construir ou reformar.` }
      ], nomeEmpresa),
      imagensServicos: ['hero.jpg', 'workshop.jpg', 'hero.jpg', 'workshop.jpg']
    }, lead);
  }

  // 9. PADRÃO GERAL INDUSTRIAL / PRESTAÇÃO DE SERVIÇOS
  return applyMinedOverrides({
    subtitulo: 'Atendimento Técnico Especializado em Franca',
    tituloPrincipal: `Excelência e Soluções Confiáveis com a ${nomeEmpresa}`,
    chamadaPrincipal: 'Qualidade Comprovada e Compromisso com Seus Resultados',
    slogan: 'Profissionalismo, agilidade no atendimento e compromisso em cada detalhe.',
    apresentacao: `Soluções técnicas especializadas em ${cidade} com atendimento ágil, transparência e garantia em cada etapa.`,
    servicos: [
      { nome: 'Atendimento Personalizado', desc: 'Consultoria técnica para entregar a solução ideal com custo justo.' },
      { nome: 'Execução Especializada', desc: 'Profissionais capacitados utilizando materiais de alta durabilidade.' },
      { nome: 'Orçamento Transparente', desc: 'Proposta clara e detalhada sem surpresas ou cobranças extras.' },
      { nome: 'Garantia e Suporte Local', desc: 'Atendimento ágil com acompanhamento pós-serviço para tranquilidade.' }
    ],
    diferenciais: [
      { titulo: 'Equipe Qualificada', desc: 'Profissionais experientes prontos para resolver com eficiência.' },
      { titulo: 'Pontualidade Rigorosa', desc: 'Respeito ao prazo com comunicação transparente do início ao fim.' },
      { titulo: 'Garantia Comprovada', desc: 'Segurança e confiança atestadas por clientes satisfeitos locais.' }
    ],
    avaliacoes: prepareReviews(lead, [
      { autor: 'Carlos Eduardo', texto: `Serviço de altíssimo nível. A ${nomeEmpresa} resolveu super rápido, com muita atenção e preço justo. Com certeza voltarei a contratar.` },
      { autor: 'Juliana Prado', texto: `Excelente atendimento desde o primeiro contato no WhatsApp. Muito prestativos, honestos e pontuais.` },
      { autor: 'Marcos Vinicius', texto: `Profissionais sérios e de palavra na ${nomeEmpresa}. Entregaram exatamente o combinado com muita qualidade.` },
      { autor: 'Beatriz Costa', texto: `Super recomendo a ${nomeEmpresa}! Transparência total e equipe muito educada e caprichosa.` }
    ], nomeEmpresa),
    imagensServicos: ['hero.jpg', 'workshop.jpg', 'hero.jpg', 'workshop.jpg']
  }, lead);
}

function applyMinedOverrides(content, lead) {
  if (!content) return content;
  if (lead && lead.dadosEnriquecidos) {
    if (Array.isArray(lead.dadosEnriquecidos.servicosDetectados) && lead.dadosEnriquecidos.servicosDetectados.length >= 2) {
      content.servicos = lead.dadosEnriquecidos.servicosDetectados.slice(0, 4);
    }
    if (Array.isArray(lead.dadosEnriquecidos.diferenciais) && lead.dadosEnriquecidos.diferenciais.length >= 2) {
      content.diferenciais = lead.dadosEnriquecidos.diferenciais.slice(0, 3);
    }
  }
  return content;
}

function cleanCompanyNameSmart(rawName = '') {
  let name = (rawName || '').trim();

  // 1. Separadores comuns de título no Google Maps: | , - , / , : , •
  for (const sep of ['|', ' - ', ' – ', ' / ', ':', '•']) {
    if (name.includes(sep)) {
      name = name.split(sep)[0].trim();
    }
  }

  // 2. Caudas descritivas e palavras-chave de busca no Google Maps
  const regexPatterns = [
    /^(.*?climatiza[çc][aã]o)\s+(?:instala[çc][aã]o|manuten[çc][aã]o|vendas|assist[eê]ncia).*/i,
    /^(.*?ar[- ]condicionado)\s+(?:instala[çc][aã]o|manuten[çc][aã]o|assist[eê]ncia).*/i,
    /^(.*?seguran[çc]a\s+eletr[oô]nica)\s+(?:instala[çc][aã]o|monitoramento|c[aâ]meras).*/i,
    /^(.*?energia\s+solar)\s+(?:instala[çc][aã]o|fotovoltaica|projetos).*/i,
    /^(.*?\bmonitoramento)\s+(?:e\s+rastreamento|24\s*h(?:oras?|rs?)?).*/i,
    /^(.*?\brastreamento)\s+(?:e\s+monitoramento|24\s*h(?:oras?|rs?)?).*/i
  ];

  for (const pattern of regexPatterns) {
    const match = name.match(pattern);
    if (match && match[1]) {
      name = match[1].trim();
      break;
    }
  }

  // Caudas residuais
  name = name.replace(/\s+24\s*(?:h(?:oras?|rs?)?)$/i, '');
  name = name.replace(/\s+e\s+rastreamento.*$/i, '');
  name = name.replace(/\s+(?:ltda|epp|me|s\/a|eireli)\b.*/i, '');

  // 3. Formatação Title Case elegante para nomes que vieram em minúsculo ou com pontuação estranha
  const preps = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'com'];
  name = name.split(/\s+/).map((word, i) => {
    if (word.length > 1 && word === word.toUpperCase() && !/[0-9]/.test(word) && word.length <= 4) {
      return word; // Preserva siglas como CFTV, PMOC
    }
    const lower = word.toLowerCase();
    if (i > 0 && preps.includes(lower)) return lower;
    return lower.replace(/^([(["]?)([a-z\u00C0-\u00FF])/, (_, p1, p2) => p1 + p2.toUpperCase());
  }).join(' ');

  return name;
}

function generateSlug(nome = '') {
  return (nome || '')
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `lead-${Date.now()}`;
}

async function downloadRealPhotos(photoUrls, targetImgDir) {
  const downloaded = [];
  if (!Array.isArray(photoUrls) || photoUrls.length === 0) return downloaded;

  for (let i = 0; i < Math.min(4, photoUrls.length); i++) {
    const url = photoUrls[i];
    if (!url || typeof url !== 'string' || !url.startsWith('http')) continue;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > 1000) {
          const filename = `real-${i + 1}.jpg`;
          fs.writeFileSync(path.join(targetImgDir, filename), buffer);
          downloaded.push(filename);
        }
      }
    } catch (e) {
      // Ignora falha de download individual
    }
  }
  return downloaded;
}

/**
 * Gera ou atualiza o protótipo Subzero para o lead baseado no arquétipo do seu nicho
 * @param {object} lead
 * @param {string} [templateHint]
 */
async function generatePrototype(lead, templateHint = null) {
  if (!lead.slug) {
    lead.slug = generateSlug(lead.nome);
  }

  const archetype = getArchetype(lead.nicho, lead.nome, templateHint || lead.templateEscolhido);
  console.log(`\n⚡ [Protótipo] Gerando arquétipo "${archetype}" para: "${lead.nome}"...`);

  if (!fs.existsSync(PREVIEWS_DIR)) {
    fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
  }

  const targetDir = path.join(PREVIEWS_DIR, lead.slug);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  } else {
    // Limpa pastas de mídia antigas para evitar arquivos órfãos
    const oldAssets = path.join(targetDir, 'assets');
    const oldImg = path.join(targetDir, 'img');
    if (fs.existsSync(oldAssets)) fs.rmSync(oldAssets, { recursive: true, force: true });
    if (fs.existsSync(oldImg)) fs.rmSync(oldImg, { recursive: true, force: true });
  }

  // 1. Determinar o diretório do template selecionado
  let templateDir = path.join(TEMPLATES_ROOT, archetype);
  if (!fs.existsSync(templateDir)) {
    templateDir = path.join(TEMPLATES_ROOT, 'industrial');
    if (!fs.existsSync(templateDir)) {
      templateDir = FALLBACK_TEMPLATE_DIR;
    }
  }

  const templateHtmlPath = path.join(templateDir, 'index.html');
  if (!fs.existsSync(templateHtmlPath)) {
    throw new Error(`Template não encontrado em: ${templateHtmlPath}`);
  }

  let html = fs.readFileSync(templateHtmlPath, 'utf-8');

  // 2. Extrair dados da empresa e inteligência de avaliações
  const cleanCompanyName = cleanCompanyNameSmart(lead.nome);

  const cidade = lead.cidade || 'Franca SP';
  const ratingData = parseRatingData(lead.avaliacao, cidade);
  const content = getNicheContent(lead.nicho, cleanCompanyName, cidade, lead);

  const waMsg = encodeURIComponent(`Olá! Vim pelo site da ${cleanCompanyName} e gostaria de conversar com um atendente.`);
  const waLink = `https://wa.me/${lead.whatsappPrincipal}?text=${waMsg}`;
  const encodedAddress = encodeURIComponent(lead.endereco ? `${cleanCompanyName}, ${lead.endereco}, ${cidade}` : `${cleanCompanyName}, ${cidade}`);
  const cleanDomain = lead.slug.endsWith('.com.br') ? lead.slug : `${lead.slug}.com.br`;

  // Tratamento inteligente e limpo de endereço
  const addrInfo = formatAddressNicely(lead.endereco, cidade);
  const enderecoLinha1 = addrInfo.linha1;
  const bairroCidadeUf = addrInfo.bairroCidade;
  const enderecoCompleto = addrInfo.completo;

  const googleMapsUrl = lead.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  const targetImgDir = path.join(targetDir, 'img');
  fs.mkdirSync(targetImgDir, { recursive: true });

  // Download e vinculação de fotos autênticas da empresa (Instagram / Google Maps)
  let realPhotoFiles = [];
  if (Array.isArray(lead.fotosReais) && lead.fotosReais.length > 0) {
    realPhotoFiles = await downloadRealPhotos(lead.fotosReais, targetImgDir);
    if (realPhotoFiles.length > 0) {
      console.log(`📸 [Generator] ${realPhotoFiles.length} fotos reais vinculadas à vitrine do protótipo!`);
    }
  }

  // Imagens dos 4 serviços (prioriza fotos autênticas de obras/atendimento)
  const img1 = realPhotoFiles[0] || content.imagensServicos[0] || 'hero.jpg';
  const img2 = realPhotoFiles[1] || content.imagensServicos[1] || 'workshop.jpg';
  const img3 = realPhotoFiles[2] || content.imagensServicos[2] || 'hero.jpg';
  const img4 = realPhotoFiles[3] || content.imagensServicos[3] || 'workshop.jpg';

  // 3. Substituir tags de placeholder
  const replacements = {
    '{{NOME_DA_EMPRESA}}': cleanCompanyName,
    '{{TITULO_PRINCIPAL}}': content.tituloPrincipal,
    '{{DESCRICAO_SEO_150_CARACTERES}}': `${cleanCompanyName} em ${cidade}. ${content.slogan} Fale conosco no WhatsApp!`,
    '{{PALAVRAS_CHAVE_SEPARADAS_POR_VIRGULA}}': `${cleanCompanyName}, ${lead.nicho}, ${cidade}, atendimento, servicos, avaliacoes, orcamento`,
    '{{SEU_DOMINIO}}': cleanDomain,
    '{{SUBTITULO_OU_SEGMENTO}}': content.subtitulo,
    '{{SUBTITULO_LOCALIZACAO_EM_CAPS}}': `${cidade.toUpperCase()} • ATENDIMENTO ESPECIALIZADO`,
    '{{CHAMADA_PRINCIPAL}}': content.chamadaPrincipal,
    '{{SLOGAN_OU_PROMESSA}}': content.slogan,
    '{{TEXTO_DE_APRESENTACAO_DA_EMPRESA_FOCO_EM_CONFIANCA_E_QUALIDADE}}': content.apresentacao,
    '{{LINK_WHATSAPP_COM_MENSAGEM}}': waLink,
    '{{TELEFONE_FORMATADO}}': lead.whatsappFormatado || '(16) 99200-0000',
    '{{TELEFONE_DIGITOS}}': (lead.whatsappPrincipal || '5516992000000').replace(/\D/g, ''),
    '{{WHATSAPP_FORMATADO}}': lead.whatsappFormatado || '(16) 99200-0000',
    '{{LINK_INSTAGRAM}}': lead.instagram || 'https://instagram.com',
    '{{LINK_FACEBOOK}}': lead.facebook || 'https://facebook.com',
    '{{HORARIO_RESUMIDO_LINHA_1}}': 'Segunda a Sexta: 08h às 18h',
    '{{HORARIO_RESUMIDO_LINHA_2}}': 'Sábados: 08h às 12h',
    '{{HORARIO_COMPLETO}}': 'Segunda a Sexta das 08h às 18h • Sábados das 08h às 12h',
    '{{CIDADE_UF}}': cidade,

    // Avaliações & Trust Hero Badge
    '{{STARS_RATING}}': ratingData.starsRating,
    '{{BADGE_TRUST_TEXT}}': ratingData.badgeTrustText,

    // Seção de Serviços / Soluções (4 Cards)
    '{{TITULO_SECAO_SERVICOS_LINHA_1}}': 'Soluções completas',
    '{{TITULO_SECAO_SERVICOS_LINHA_2}}': 'para sua tranquilidade',
    '{{DESCRICAO_CURTA_DA_SECAO_DE_SERVICOS}}': 'Conheça em detalhes o padrão e as principais especialidades que tornam nosso atendimento diferenciado na cidade.',
    '{{NOME_SERVICO_1}}': content.servicos[0].nome,
    '{{DESCRICAO_SERVICO_1}}': content.servicos[0].desc,
    '{{IMG_SERVICO_1}}': img1,
    '{{NOME_SERVICO_2}}': content.servicos[1].nome,
    '{{DESCRICAO_SERVICO_2}}': content.servicos[1].desc,
    '{{IMG_SERVICO_2}}': img2,
    '{{NOME_SERVICO_3}}': content.servicos[2].nome,
    '{{DESCRICAO_SERVICO_3}}': content.servicos[2].desc,
    '{{IMG_SERVICO_3}}': img3,
    '{{NOME_SERVICO_4}}': content.servicos[3].nome,
    '{{DESCRICAO_SERVICO_4}}': content.servicos[3].desc,
    '{{IMG_SERVICO_4}}': img4,

    '{{SLOGAN_CURTO}}': content.slogan,
    '{{TITULO_DIFERENCIAIS_LINHA_1}}': 'Por que confiar',
    '{{TITULO_DIFERENCIAIS_LINHA_2}}': 'no nosso trabalho?',
    '{{SUBTEXTO_DE_AUTORIDADE_E_CONFIANCA}}': `Transparência, seriedade e dedicação em cada atendimento prestado em ${cidade}.`,
    '{{TITULO_DIFERENCIAL_1}}': content.diferenciais[0].titulo,
    '{{DESCRICAO_DIFERENCIAL_1}}': content.diferenciais[0].desc,
    '{{TITULO_DIFERENCIAL_2}}': content.diferenciais[1].titulo,
    '{{DESCRICAO_DIFERENCIAL_2}}': content.diferenciais[1].desc,
    '{{TITULO_DIFERENCIAL_3}}': content.diferenciais[2].titulo,
    '{{DESCRICAO_DIFERENCIAL_3}}': content.diferenciais[2].desc,

    // Depoimentos Hiperpersonalizados
    '{{NOME_DO_CLIENTE_1}}': content.avaliacoes[0].autor,
    '{{DEPOIMENTO_DO_CLIENTE_1}}': content.avaliacoes[0].texto,
    '{{NOME_DO_CLIENTE_2}}': content.avaliacoes[1].autor,
    '{{DEPOIMENTO_DO_CLIENTE_2}}': content.avaliacoes[1].texto,
    '{{NOME_DO_CLIENTE_3}}': content.avaliacoes[2].autor,
    '{{DEPOIMENTO_DO_CLIENTE_3}}': content.avaliacoes[2].texto,
    '{{NOME_DO_CLIENTE_4}}': content.avaliacoes[3].autor,
    '{{DEPOIMENTO_DO_CLIENTE_4}}': content.avaliacoes[3].texto,

    // Contato e Localização
    '{{ENDERECO_COMPLETO_DO_GOOGLE_MAPS}}': enderecoCompleto,
    '{{LINK_DIRECIONAMENTO_ROTA_GOOGLE_MAPS}}': googleMapsUrl,
    '{{ENDERECO_URL_ENCODED}}': encodedAddress,
    '{{ENDERECO_LINHA_1}}': enderecoLinha1,
    '{{BAIRRO_CIDADE_UF}}': bairroCidadeUf,

    // Compatibilidade reversa
    '{{TEXTO_DIFERENCIAL_1}}': content.diferenciais[0].desc,
    '{{TEXTO_DIFERENCIAL_2}}': content.diferenciais[1].desc,
    '{{TEXTO_DIFERENCIAL_3}}': content.diferenciais[2].desc,
    '{{DEPOIMENTO_1_TEXTO}}': content.avaliacoes[0].texto,
    '{{DEPOIMENTO_1_AUTOR}}': content.avaliacoes[0].autor,
    '{{DEPOIMENTO_2_TEXTO}}': content.avaliacoes[1].texto,
    '{{DEPOIMENTO_2_AUTOR}}': content.avaliacoes[1].autor,
    '{{DEPOIMENTO_3_TEXTO}}': content.avaliacoes[2].texto,
    '{{DEPOIMENTO_3_AUTOR}}': content.avaliacoes[2].autor,
    '{{DEPOIMENTO_4_TEXTO}}': content.avaliacoes[3].texto,
    '{{DEPOIMENTO_4_AUTOR}}': content.avaliacoes[3].autor,
    '{{CHAMADA_CONTATO_LINHA_1}}': 'Fale Conosco e Garanta',
    '{{CHAMADA_CONTATO_LINHA_2}}': 'Sua Tranquilidade Hoje',
    '{{TEXTO_CHAMADA_CONTATO}}': 'Atendimento ágil direto no WhatsApp para tirar dúvidas, solicitar orçamentos e agendar visitas técnicas.'
  };

  for (const [key, val] of Object.entries(replacements)) {
    html = html.replaceAll(key, val);
  }

  // Validação estrita de placeholders: remove qualquer tag não mapeada
  const remainingTags = html.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (remainingTags && remainingTags.length > 0) {
    const uniqueRemaining = [...new Set(remainingTags)];
    console.warn(`⚠️ [Generator] Aviso: ${uniqueRemaining.length} tags sem substituição encontradas (${uniqueRemaining.join(', ')}). Limpando tags para integridade visual.`);
    uniqueRemaining.forEach(t => {
      html = html.replaceAll(t, '');
    });
  }

  // 4. Copiar assets estruturais do template selecionado
  if (fs.existsSync(path.join(templateDir, 'src'))) {
    copyDirSync(path.join(templateDir, 'src'), path.join(targetDir, 'src'));
  }

  // Base fallback: copia imagens padrão do template
  if (fs.existsSync(path.join(templateDir, 'public', 'img'))) {
    copyDirSync(path.join(templateDir, 'public', 'img'), targetImgDir);
  }
  if (fs.existsSync(path.join(templateDir, 'img'))) {
    copyDirSync(path.join(templateDir, 'img'), targetImgDir);
  }
  if (fs.existsSync(path.join(templateDir, 'assets'))) {
    copyDirSync(path.join(templateDir, 'assets'), path.join(targetDir, 'assets'));
  }

  // Injeção contextual refinada de banco de imagens para o arquétipo industrial
  if (archetype === 'industrial') {
    const normNFD = (str = '') => (str || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/ç/g, 'c');

    const n = normNFD(lead.nicho);
    const nameLower = normNFD(lead.nome);

    if (n.includes('solar') || n.includes('fotovolta') || n.includes('energia') || nameLower.includes('solar')) {
      const solarImgDir = path.join(TEMPLATES_ROOT, 'assets', 'solar');
      if (fs.existsSync(solarImgDir)) {
        copyDirSync(solarImgDir, targetImgDir);
        console.log(`📸 [Generator] Imagens contextuais de ENERGIA SOLAR injetadas com sucesso em: ${targetImgDir}`);
      }
    } else if (n.includes('seguranca') || n.includes('cerca') || n.includes('camera') || n.includes('cftv') || nameLower.includes('seguranca') || nameLower.includes('kell') || nameLower.includes('distribuidora') || nameLower.includes('blitz') || nameLower.includes('monitoramento')) {
      const secImgDir = path.join(TEMPLATES_ROOT, 'assets', 'seguranca');
      if (fs.existsSync(secImgDir)) {
        copyDirSync(secImgDir, targetImgDir);
        console.log(`📸 [Generator] Imagens contextuais de SEGURANÇA injetadas com sucesso em: ${targetImgDir}`);
      }
    } else if (n.includes('ar condicionado') || n.includes('ar-condicionado') || n.includes('climatiza') || n.includes('refrigera') || nameLower.includes('frio') || nameLower.includes('clima')) {
      const climImgDir = path.join(TEMPLATES_ROOT, 'assets', 'climatizacao');
      if (fs.existsSync(climImgDir)) {
        copyDirSync(climImgDir, targetImgDir);
        console.log(`📸 [Generator] Imagens contextuais de CLIMATIZAÇÃO injetadas com sucesso em: ${targetImgDir}`);
      }
    }
  }

  // 4.1 Gerar Favicon SVG sob demanda exclusivo para o protótipo
  const faviconSvg = generateFaviconSvg(lead, cleanCompanyName, archetype);
  fs.writeFileSync(path.join(targetDir, 'favicon.svg'), faviconSvg, 'utf-8');

  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
  console.log(`✅ Protótipo (${archetype}) gerado em: ${targetDir}`);

  // 5. Mensagens personalizadas de abordagem
  const messages = generateOutreachMessages(lead, cleanDomain);

  lead.prototypePath = path.join(targetDir, 'index.html');
  lead.prototypeUrl = `/previews/${lead.slug}/index.html`;
  lead.status = 'prototipo_pronto';
  lead.messages = messages;
  lead.archetype = archetype;
  lead.templateEscolhido = archetype;
  lead.targetDir = targetDir;
  lead.indexPath = lead.prototypePath;
  lead.url = lead.prototypeUrl;

  try {
    const db = require('./db');
    if (lead.id && db.getById(lead.id)) {
      db.update(lead.id, {
        prototypePath: lead.prototypePath,
        prototypeUrl: lead.prototypeUrl,
        status: 'prototipo_pronto',
        messages: lead.messages,
        archetype: lead.archetype,
        templateEscolhido: lead.templateEscolhido
      });
    }
  } catch (err) {
    console.warn('Aviso: Não foi possível sincronizar lead no banco local:', err.message);
  }

  return lead;
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function generateFaviconSvg(lead, cleanName, archetype) {
  const initial = (cleanName || 'S').trim().charAt(0).toUpperCase();
  const isSolar = (lead.nicho || '').toLowerCase().includes('solar');
  const isSec = (lead.nicho || '').toLowerCase().includes('segur') || (cleanName || '').toLowerCase().includes('monitoramento');

  let gradStart = '#0284c7';
  let gradEnd = '#0369a1';
  let accent = '#38bdf8';

  if (archetype === 'care') {
    gradStart = '#059669'; // Emerald Care
    gradEnd = '#047857';
    accent = '#34d399';
  } else if (archetype === 'clinical') {
    gradStart = '#0284c7'; // Clinical Cyan
    gradEnd = '#0369a1';
    accent = '#38bdf8';
  } else if (isSolar) {
    gradStart = '#d97706';
    gradEnd = '#b45309';
    accent = '#fbbf24';
  } else if (isSec) {
    gradStart = '#2563eb';
    gradEnd = '#1d4ed8';
    accent = '#60a5fa';
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradStart}"/>
      <stop offset="100%" stop-color="${gradEnd}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="#030712"/>
  <rect x="2" y="2" width="60" height="60" rx="12" fill="url(#grad)" stroke="${accent}" stroke-width="2"/>
  <text x="32" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">${initial}</text>
</svg>`;
}

function generateOutreachMessages(lead, domain) {
  const cleanPhone = (lead.whatsappPrincipal || '').replace(/\D/g, '');
  const previewUrl = `/previews/${lead.slug}/index.html`;
  const cleanName = cleanCompanyNameSmart(lead.nome);

  let gapReason = 'não possui site oficial cadastrado no Google';
  if (lead.siteStatus === 'inacessivel') {
    gapReason = `está com o site (${lead.siteOriginal}) fora do ar`;
  } else if (lead.siteStatus === 'apenas_social') {
    gapReason = 'utiliza apenas rede social no Google em vez de um site próprio de conversão';
  }

  const whatsappMsg = `Olá! Tudo bem?

Sou o Gabriel, atuo com tecnologia aqui em Franca.

Vi que a *${cleanName}* tem uma excelente reputação, mas hoje quem pesquisa por *${lead.nicho}* no Google ou nas buscas por inteligência artificial (ChatGPT e a IA do WhatsApp) encontra esse gargalo: ${gapReason} — e essas ferramentas acabam indicando concorrentes da cidade.

Para mostrar na prática como resolver isso, montei uma prévia pronta do site oficial de vocês para celular, destacando as principais especialidades e os depoimentos dos seus clientes:
👉 *${previewUrl}*

Pode repassar para o responsável dar uma olhada? Consigo colocar no ar para vocês essa semana.
Gabriel Azevedo • (16) 99204-8856`;

  const emailSubject = `${cleanName} em Franca — clientes sendo perdidos nas buscas por Inteligência Artificial`;
  const emailBody = `Prezada equipe da ${cleanName},

O motivo do meu contato é direto: a forma como os clientes procuram por ${lead.nicho} em Franca mudou.

Hoje, a maioria das pessoas pesquisa pelo celular ou pergunta para ferramentas de inteligência artificial (como o ChatGPT e a IA do WhatsApp) quem é a empresa recomendada na cidade. O grande ponto é que essas ferramentas priorizam empresas com presença estruturada e site oficial próprio.

Como sou desenvolvedor aqui em Franca, tomei a iniciativa de montar a estrutura do site oficial da ${cleanName}, já funcional e adaptada para smartphones:
👉 ${previewUrl}

Qual é o melhor horário para conversarmos 5 minutos sobre a ativação desse canal para a sua empresa?

Atenciosamente,
Gabriel Azevedo
(16) 99204-8856 • Franca - SP`;

  return {
    whatsapp: whatsappMsg,
    email: {
      assunto: emailSubject,
      corpo: emailBody
    }
  };
}

module.exports = {
  generatePrototype,
  getNicheContent,
  generateOutreachMessages,
  getArchetype,
  parseRatingData
};
