const fs = require('fs');
const path = require('path');

const TEMPLATES_ROOT = path.join(__dirname, '..', 'templates');
const PREVIEWS_DIR = path.join(__dirname, '..', 'previews');
const FALLBACK_TEMPLATE_DIR = path.join(TEMPLATES_ROOT, 'padrao');

/**
 * Mapeia o nicho/empresa para o arquétipo ideal
 */
function getArchetype(nicho = '', nome = '', templateHint = null) {
  if (templateHint && ['industrial', 'saude', 'institucional', 'comercio'].includes(templateHint)) {
    return templateHint;
  }

  const norm = (str = '') => str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c');

  const n = norm(nicho);
  const nameLower = norm(nome);

  if (n.includes('veterin') || n.includes('pet') || n.includes('odonto') || n.includes('clinic') || n.includes('saude') || n.includes('medic') || n.includes('psico') || n.includes('estetica')) {
    return 'saude';
  }

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
      tituloPrincipal: `Cuidado Dedicado e Medicina de Precisão para Seu Pet`,
      chamadaPrincipal: 'Saúde, Prevenção e Amor em Cada Consulta',
      slogan: 'Medicina veterinária humanizada, estrutura moderna e atendimento acolhedor.',
      apresentacao: `Com atendimento cuidadoso em ${cidade}, a ${nomeEmpresa} oferece consultas preventivas, diagnósticos detalhados e cuidados estéticos completos para o bem-estar da sua família de quatro patas.`,
      servicos: [
        { nome: 'Consultas Clínicas & Check-up Geral', desc: 'Atendimento atencioso com anamnese detalhada, controle de peso e exames preventivos completos.' },
        { nome: 'Centro Cirúrgico & Procedimentos', desc: 'Estrutura cirúrgica esterilizada com monitoramento cardíaco multiparâmetro e foco absoluto na segurança.' },
        { nome: 'Vacinação Importada & Prevenção', desc: 'Protocolos vacinais V10, antirrábica, gripe e giardíase com controle rigoroso de refrigeração e carteirinha digital.' },
        { nome: 'Estética Animal, Banho & Tosa', desc: 'Banhos com cosméticos dermatológicos hipoalergênicos, tosa na máquina/tesoura e tosa higiênica sem estresse.' }
      ],
      diferenciais: [
        { titulo: 'Medicina Humanizada', desc: 'Trato empático, acolhedor e calmo, respeitando o tempo de adaptação e conforto de cada animalzinho.' },
        { titulo: 'Diagnóstico Preciso', desc: 'Exames laboratoriais rápidos e conduta médica ética para tratar o problema na raiz.' },
        { titulo: 'Clínica e Cuidados Integrados', desc: 'Consulta médica, procedimentos preventivos e produtos dermatológicos de alta qualidade no mesmo local.' }
      ],
      avaliacoes: [
        { autor: 'Mariana Silveira', texto: `Equipe da ${nomeEmpresa} é maravilhosa! Cuidaram do meu cachorro com muito carinho e profissionalismo quando ele precisou. Recomendo!` },
        { autor: 'Renato F. Oliveira', texto: `O melhor atendimento de Franca! Meus pets voltam sempre tranquilos, limpinhos e cheirosos. Lugar de total confiança.` },
        { autor: 'Carla Beatriz Ramos', texto: `Profissionais muito capacitados e transparentes na ${nomeEmpresa}. Explicam tudo com calma e sem empurrar gastos desnecessários.` },
        { autor: 'Diego M. Santos', texto: `Ambiente super limpo e atendimento acolhedor desde a recepção. Toda a equipe da ${nomeEmpresa} está de parabéns.` }
      ],
      imagensServicos: ['hero.jpg', 'workshop.jpg', 'hero.jpg', 'workshop.jpg']
    };
  }

  // 2. SEGURANÇA: DISTRIBUIDORA / ATACADISTA
  if ((nameLower.includes('distribuidora') || nameLower.includes('atacado') || nameLower.includes('distribuicao')) && 
      (n.includes('seguranca') || n.includes('eletronica') || nameLower.includes('seguranca') || nameLower.includes('eletronica') || nameLower.includes('kell'))) {
    return {
      subtitulo: 'Distribuidora Atacadista de Segurança Eletrônica',
      tituloPrincipal: 'Equipamentos e Tecnologia para Integradores e Instaladores',
      chamadaPrincipal: 'Pronta-Entrega e Preço de Distribuidor em Franca',
      slogan: 'Câmeras, alarmes, motores de portão e controle de acesso das melhores marcas.',
      apresentacao: `Estoque local com pronta-entrega e suporte técnico especializado para instaladores e empresas de segurança em ${cidade}.`,
      servicos: [
        { nome: 'Câmeras CFTV & Gravadores DVR/NVR', desc: 'Linhas completas em alta definição, com pronta-entrega para projetos residenciais, comerciais e industriais.' },
        { nome: 'Centrais de Alarme & Sensores Infravermelho', desc: 'Sistemas com discadora, aplicativo móvel e detecção de alta precisão para máxima proteção perimetral.' },
        { nome: 'Motores para Portão & Cremalheiras', desc: 'Automatizadores ultrarrápidos para portões deslizantes, basculantes e pivotantes com garantia de fábrica.' },
        { nome: 'Concertinas, Fios de Choque & Acessórios', desc: 'Concertinas duplas galvalume, hastes reforçadas, baterias e cabeamento homologado com o melhor custo.' }
      ],
      diferenciais: [
        { titulo: 'Estoque Local & Pronta-Entrega', desc: 'Retirada imediata em Franca sem esperar frete para fechar seu projeto no prazo.' },
        { titulo: 'Marcas Líderes Certificadas', desc: 'Equipamentos originais e certificados com garantia oficial e procedência garantida.' },
        { titulo: 'Suporte Técnico aos Instaladores', desc: 'Equipe especializada para auxiliar na especificação do equipamento ideal para cada obra.' }
      ],
      avaliacoes: [
        { autor: 'Marcos Vinicius (Instalador)', texto: `Melhor distribuidora de Franca! Preço justo de atacado e a ${nomeEmpresa} sempre tem o material a pronta entrega quando preciso.` },
        { autor: 'Lucas Andrade', texto: `Compro equipamentos com a ${nomeEmpresa} há anos. O suporte técnico deles tira qualquer dúvida e os produtos são de ponta.` },
        { autor: 'Carlos Eduardo Souza', texto: `Atendimento nota dez! Agilidade na separação de pedidos e marcas confiáveis para quem trabalha com segurança profissional.` },
        { autor: 'Fernando Silveira', texto: `Excelente estoque de motores e câmeras. Parceria de confiança para instaladores em toda a região de Franca.` }
      ],
      imagensServicos: ['camera-cftv.jpg', 'alarme-sensores.jpg', 'motor-portao.jpg', 'concertina-dupla.jpg']
    };
  }

  // 3. SEGURANÇA: MONITORAMENTO 24H, RASTREAMENTO & ALARMES (Ex: ICON MONITORAMENTO 24HS)
  if (nameLower.includes('monitoramento') || nameLower.includes('alarme') || nameLower.includes('rastreamento') || n.includes('monitoramento') || n.includes('rastreamento')) {
    return {
      subtitulo: 'Central de Monitoramento 24 Horas & Segurança Eletrônica',
      tituloPrincipal: 'Vigilância Ativa e Resposta Rápida 24 Horas',
      chamadaPrincipal: 'Proteção Ininterrupta para Sua Residência e Empresa',
      slogan: 'Monitoramento 24 horas de alta precisão, pronta-resposta e controle total no seu smartphone.',
      apresentacao: `Com central operacional de prontidão em ${cidade}, a ${nomeEmpresa} protege o seu patrimônio dia e noite com tecnologia de ponta, conexão sem fio à central e equipe treinada para pronta-resposta imediata.`,
      servicos: [
        { nome: 'Central de Monitoramento 24 Horas', desc: 'Vigilância ininterrupta 365 dias ao ano, com protocolo de checagem imediata e equipe de resposta rápida em campo.' },
        { nome: 'Sistemas de Alarme com Sensores Inteligentes', desc: 'Centrais com sensores infravermelhos antimascaração, proteção contra animais domésticos e notificações no celular.' },
        { nome: 'Câmeras CFTV HD com Acesso Móvel', desc: 'Monitoramento em alta definição com visão noturna no escuro total, gravação em nuvem e visualização ao vivo no smartphone.' },
        { nome: 'Controle de Acesso & Automação de Portões', desc: 'Videoporteiros IP, biometria digital e motores rápidos para assegurar que apenas pessoas autorizadas acessem o local.' }
      ],
      diferenciais: [
        { titulo: 'Central Ativa 24h em Franca', desc: 'Equipe monitorando seu imóvel ininterruptamente com tempo recorde de atendimento.' },
        { titulo: 'Controle Total no Aplicativo', desc: 'Arme, desarme e visualize imagens em tempo real de qualquer lugar pelo celular.' },
        { titulo: 'Pronta-Resposta de Campo', desc: 'Deslocamento ágil de viatura tática em qualquer acionamento suspeito do alarme.' }
      ],
      avaliacoes: [
        { autor: 'Eduardo Fagundes', texto: `A equipe da ${nomeEmpresa} instalou o sistema na nossa empresa em Franca. A central 24h é super atenta e o aplicativo no celular funciona perfeitamente.` },
        { autor: 'Luciana Bernardes', texto: `Depois que contratamos o monitoramento da ${nomeEmpresa}, temos total tranquilidade em casa. Quando disparou por engano, ligaram em menos de 1 minuto. Impecável!` },
        { autor: 'Roberto Guimarães', texto: `Profissionais muito qualificados. Fizeram uma instalação limpa, sem cabos aparentes, e explicaram todo o sistema com muita paciência. Recomendo!` },
        { autor: 'Patrícia Mendes', texto: `Melhor empresa de segurança e monitoramento de Franca. Pontualidade, suporte imediato e preço justo pelo nível do serviço prestado.` }
      ],
      imagensServicos: ['camera-cftv.jpg', 'alarme-sensores.jpg', 'videoporteiro.jpg', 'motor-portao.jpg']
    };
  }

  // 4. SEGURANÇA: CERCAS ELÉTRICAS, CONCERTINAS & CFTV
  if (n.includes('seguranca') || n.includes('cerca') || n.includes('camera') || n.includes('cftv') || n.includes('portao') || nameLower.includes('seguranca') || nameLower.includes('eletronica')) {
    return {
      subtitulo: 'Proteção Perimetral & CFTV em Franca',
      tituloPrincipal: 'Proteja Sua Família e Seu Patrimônio com Segurança Reforçada',
      chamadaPrincipal: 'Barreiras de Alta Resistência Que Fazem o Invasor Desistir',
      slogan: 'Cercas elétricas de alta voltagem, concertinas galvalume e câmeras no celular com garantia.',
      apresentacao: `Com sólida atuação em ${cidade}, a ${nomeEmpresa} instala sistemas perimétricos de máxima resistência e durabilidade, combinando barreiras físicas inibidoras com tecnologia de vigilância contínua.`,
      servicos: [
        { nome: 'Cerca Elétrica de Choque Ativo & Alarme', desc: 'Pulso de alta voltagem com disparo sonoro imediato em tentativa de corte ou toque na fiação reforçada.' },
        { nome: 'Concertina Dupla em Aço Galvalume', desc: 'Lâminas afiadas altamente perfurantes com liga galvalume anticorrosão que blindam muros contra escaladas.' },
        { nome: 'Câmeras CFTV HD com Visão Noturna', desc: 'Acesso em tempo real na tela do smartphone, com imagens nítidas no escuro, gravação e alertas inteligentes de movimento.' },
        { nome: 'Motores para Portão & Automatização Rápida', desc: 'Abertura veloz em até 4 segundos com acionamento seguro no controle ou celular, reduzindo tempo de espera na rua.' }
      ],
      diferenciais: [
        { titulo: 'Aço Galvalume & Equipamentos Certificados', desc: 'Materiais de altíssima resistência mecânica contra intempéries e tentativas de corte.' },
        { titulo: 'Instalação Técnica Limpa e Rápida', desc: 'Técnicos especializados, acabamento profissional e zero sujeira no seu imóvel.' },
        { titulo: 'Garantia e Assistência Local', desc: 'Suporte ágil direto em Franca com pós-venda garantido para sua total tranquilidade.' }
      ],
      avaliacoes: [
        { autor: 'André Martins', texto: `Instalação impecável da concertina e do motor de portão pela ${nomeEmpresa}. Ficou super alinhado e o atendimento foi rápido e pontual.` },
        { autor: 'Luciana Meireles', texto: `A cerca elétrica e as câmeras ficaram excelentes. Acompanho tudo no celular. Equipe da ${nomeEmpresa} muito honesta e prestativa.` },
        { autor: 'Roberto Faria', texto: `Melhor empresa de segurança de Franca. Preço justo, serviço profissional e pontualidade na entrega.` },
        { autor: 'Patrícia Prado', texto: `Cerca elétrica muito bem estruturada. Passa muita segurança para quem mora em casa térrea. Recomendo a ${nomeEmpresa}!` }
      ],
      imagensServicos: ['cerca-eletrica.jpg', 'concertina-dupla.jpg', 'camera-cftv.jpg', 'motor-portao.jpg']
    };
  }

  // 5. CLIMATIZAÇÃO, AR-CONDICIONADO & REFRIGERAÇÃO (Ex: HUNIFRIO)
  if (n.includes('ar condicionado') || n.includes('ar-condicionado') || n.includes('climatiza') || n.includes('refrigera') || nameLower.includes('frio') || nameLower.includes('clima') || nameLower.includes('ar condicionado')) {
    return {
      subtitulo: 'Climatização & Refrigeração',
      tituloPrincipal: 'Especialistas em Instalação, Higienização e Manutenção de Ar-Condicionado',
      chamadaPrincipal: 'Temperatura Ideal e Ar Puro para Sua Casa ou Empresa',
      slogan: 'Conforto térmico, economia de energia e ar puro o ano inteiro.',
      apresentacao: `Com atendimento técnico especializado em ${cidade}, a ${nomeEmpresa} entrega serviços completos de instalação técnica, manutenção preventiva e higienização antibacteriana de aparelhos de ar-condicionado com pontualidade e garantia total.`,
      servicos: [
        { nome: 'Instalação de Ar-Condicionado Split & Inverter', desc: 'Instalação especializada seguindo rigorosamente o manual dos fabricantes, com processo de vácuo e teste de estanqueidade para preservar a garantia.' },
        { nome: 'Higienização Profunda & Limpeza Antibacteriana', desc: 'Eliminação completa de fungos, ácaros e bactérias com produtos bactericidas homologados, devolvendo ar 100% puro e reduzindo o consumo de energia.' },
        { nome: 'Manutenção Preventiva & Carga de Gás', desc: 'Revisão completa das pressões operacionais, detecção de microvazamentos, recarga com fluido refrigerante ecológico e checagem elétrica.' },
        { nome: 'Contratos PMOC & Climatização Comercial', desc: `Planos de Manutenção, Operação e Controle (PMOC) para clínicas, escritórios e comércios em ${cidade}, em total conformidade com as normas da Anvisa.` }
      ],
      diferenciais: [
        { titulo: 'Instalação Padrão dos Fabricantes', desc: 'Procedimento com flangeadores de precisão e bomba de vácuo, garantindo máxima vida útil ao compressor.' },
        { titulo: 'Ar Puro e Livre de Alergias', desc: 'Higienização química profunda que remove mofo e odores, protegendo a saúde da sua família ou equipe.' },
        { titulo: 'Pontualidade e Garantia Formal', desc: 'Compromisso com o horário agendado, transparência de orçamento e garantia documentada do serviço.' }
      ],
      avaliacoes: [
        { autor: 'Marcelo Siqueira', texto: `Contratei a ${nomeEmpresa} para instalação de dois aparelhos split no meu escritório. Serviço impecável, técnicos organizados e deixaram tudo limpo. Nota 10!` },
        { autor: 'Camila Andrade', texto: `Fizeram a higienização completa e manutenção preventiva do ar-condicionado da minha casa em Franca. Tirou totalmente o cheiro ruim e o aparelho voltou a gelar rápido. Recomendo!` },
        { autor: 'Dr. Marcos Vinicius', texto: `Empresa séria e de total confiança. O atendimento no WhatsApp foi ágil e o técnico da ${nomeEmpresa} chegou exatamente no horário agendado. Vale cada centavo.` },
        { autor: 'Renata Silveira', texto: `Excelente pós-venda da ${nomeEmpresa}. Fizeram o diagnóstico correto sem enrolação e resolveram o problema no mesmo dia. Recomendo de olhos fechados.` }
      ],
      imagensServicos: ['instalacao-split.jpg', 'higienizacao-profunda.jpg', 'manutencao-preventiva.jpg', 'pmoc-comercial.jpg']
    };
  }

  // 6. ENERGIA SOLAR & FOTOVOLTAICA
  if (n.includes('solar') || n.includes('fotovolta') || n.includes('energia') || nameLower.includes('solar')) {
    return {
      subtitulo: 'Energia Solar Fotovoltaica em Franca',
      tituloPrincipal: 'Economize até 95% na Sua Conta de Luz com Energia Solar',
      chamadaPrincipal: 'Independência Energética com Engenharia de Alta Performance',
      slogan: 'Projetos completos com módulos tier-1, engenharia especializada e homologação sem burocracia.',
      apresentacao: `Especialistas em projetos fotovoltaicos conectados à rede em ${cidade}, a ${nomeEmpresa} cuida de cada etapa, desde o dimensionamento técnico de engenharia até a ativação na concessionária, com foco em máxima economia.`,
      servicos: [
        { nome: 'Projetos Solares Residenciais', desc: 'Geração própria de energia limpa para abastecer sua casa, reduzindo sua conta de energia drasticamente com durabilidade de 25 anos.' },
        { nome: 'Usinas Fotovoltaicas Comerciais', desc: 'Sistemas de alta potência para indústrias, comércios e galpões em Franca, reduzindo despesas fixas e aumentando a rentabilidade do negócio.' },
        { nome: 'Manutenção Preventiva & Limpeza de Painéis', desc: 'Inspeção térmica dos módulos, checagem dos inversores e limpeza técnica especializada para garantir geração no pico máximo.' },
        { nome: 'Homologação Completa na Concessionária', desc: 'Projeto elétrico com ART assinada e trâmite 100% gerenciado junto à concessionária local com zero burocracia para você.' }
      ],
      diferenciais: [
        { titulo: 'Módulos Tier-1 de Alta Eficiência', desc: 'Painéis fotovoltaicos e inversores líderes mundiais em tecnologia com 25 anos de garantia de geração.' },
        { titulo: 'Engenharia Própria Especializada', desc: 'Dimensionamento milimétrico adaptado à sua demanda e orientação do telhado para maximizar o retorno.' },
        { titulo: 'Homologação Rápida e Sem Surpresas', desc: 'Cuidamos de toda a documentação até o seu sistema começar a gerar créditos na conta.' }
      ],
      avaliacoes: [
        { autor: 'Carlos Eduardo Silva', texto: `Minha conta de energia caiu para a taxa mínima! A equipe da ${nomeEmpresa} cuidou de tudo com muita seriedade e no prazo combinado.` },
        { autor: 'Vanessa Toledo', texto: `Todo o processo de homologação foi super tranquilo. A ${nomeEmpresa} cuidou de cada detalhe e já estou gerando energia em casa.` },
        { autor: 'Gustavo Mendonça', texto: `Excelente investimento para minha empresa em Franca. A ${nomeEmpresa} tem corpo técnico capacitado e materiais de primeira linha.` },
        { autor: 'Tatiane Lopes', texto: `Profissionais transparentes e prestativos. Recomendo a ${nomeEmpresa} para quem quer energia solar confiável e sem enrolação.` }
      ],
      imagensServicos: ['painel-solar-residencial.jpg', 'hero.jpg', 'manutencao-inversor.jpg', 'workshop.jpg']
    };
  }

  // 7. PADRÃO GERAL INDUSTRIAL / PRESTAÇÃO DE SERVIÇOS
  return {
    subtitulo: 'Atendimento Técnico Especializado em Franca',
    tituloPrincipal: `Excelência e Soluções Confiáveis com a ${nomeEmpresa}`,
    chamadaPrincipal: 'Qualidade Comprovada e Compromisso com Seus Resultados',
    slogan: 'Profissionalismo, agilidade no atendimento e compromisso em cada detalhe.',
    apresentacao: `Com sólida reputação em ${cidade}, a ${nomeEmpresa} oferece soluções sob medida com equipe qualificada, pontualidade rigorosa e foco total na satisfação de cada cliente.`,
    servicos: [
      { nome: 'Atendimento Personalizado', desc: 'Consultoria detalhada para entender exatamente sua necessidade e entregar a melhor solução técnica com excelente custo-benefício.' },
      { nome: 'Execução Técnica Especializada', desc: 'Profissionais experientes utilizando materiais de primeira linha para garantir alta durabilidade, segurança e acabamento impecável.' },
      { nome: 'Diagnóstico Ágil e Transparente', desc: 'Orçamento claro e detalhado sem surpresas ou taxas ocultas, respeitando o seu tempo e o seu orçamento.' },
      { nome: 'Garantia Formal e Suporte Local', desc: 'Atendimento direto com suporte completo e acompanhamento pós-serviço para sua total tranquilidade.' }
    ],
    diferenciais: [
      { titulo: 'Profissionais Qualificados', desc: 'Equipe com vasta experiência prática pronta para resolver com agilidade e eficiência.' },
      { titulo: 'Pontualidade e Compromisso', desc: 'Respeito ao prazo e comunicação transparente em todas as etapas da contratação.' },
      { titulo: 'Garantia Comprovada', desc: 'Segurança e confiança atestadas por avaliações positivas de clientes locais.' }
    ],
    avaliacoes: [
      { autor: 'Carlos Eduardo', texto: `Serviço de altíssimo nível. A ${nomeEmpresa} resolveu super rápido, com muita atenção e preço justo. Com certeza voltarei a contratar.` },
      { autor: 'Juliana Prado', texto: `Excelente atendimento desde o primeiro contato no WhatsApp. Muito prestativos, honestos e pontuais.` },
      { autor: 'Marcos Vinicius', texto: `Profissionais sérios e de palavra na ${nomeEmpresa}. Entregaram exatamente o combinado com muita qualidade.` },
      { autor: 'Beatriz Costa', texto: `Super recomendo a ${nomeEmpresa}! Transparência total e equipe muito educada e caprichosa.` }
    ],
    imagensServicos: ['hero.jpg', 'workshop.jpg', 'hero.jpg', 'workshop.jpg']
  };
}

function generateSlug(nome = '') {
  return (nome || '')
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `lead-${Date.now()}`;
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
  const cleanCompanyName = lead.nome.includes('|')
    ? lead.nome.split('|')[0].trim()
    : (lead.nome.includes(' - ') ? lead.nome.split(' - ')[0].trim() : lead.nome);

  const cidade = lead.cidade || 'Franca SP';
  const ratingData = parseRatingData(lead.avaliacao, cidade);
  const content = getNicheContent(lead.nicho, cleanCompanyName, cidade, lead);

  const waMsg = encodeURIComponent(`Olá! Vim pelo site da ${cleanCompanyName} e gostaria de conversar com um atendente.`);
  const waLink = `https://wa.me/${lead.whatsappPrincipal}?text=${waMsg}`;
  const encodedAddress = encodeURIComponent(lead.endereco ? `${cleanCompanyName}, ${lead.endereco}, ${cidade}` : `${cleanCompanyName}, ${cidade}`);
  const cleanDomain = lead.slug.endsWith('.com.br') ? lead.slug : `${lead.slug}.com.br`;

  // Tratamento inteligente de endereço para evitar vazios
  let enderecoLinha1 = 'Atendimento em Domicílio e Empresas';
  let bairroCidadeUf = `${cidade} e Região`;

  if (lead.endereco && lead.endereco.trim().length > 3) {
    const rawEnd = lead.endereco.trim();
    if (rawEnd.includes(',')) {
      const parts = rawEnd.split(',');
      enderecoLinha1 = parts[0].trim() + (parts[1] ? `, ${parts[1].trim()}` : '');
      bairroCidadeUf = parts.slice(2).join(', ').trim() || cidade;
    } else {
      enderecoLinha1 = rawEnd;
      bairroCidadeUf = cidade;
    }
  }

  const googleMapsUrl = lead.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  // Imagens dos 4 serviços
  const img1 = content.imagensServicos[0] || 'hero.jpg';
  const img2 = content.imagensServicos[1] || 'workshop.jpg';
  const img3 = content.imagensServicos[2] || 'hero.jpg';
  const img4 = content.imagensServicos[3] || 'workshop.jpg';

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
    '{{ENDERECO_COMPLETO_DO_GOOGLE_MAPS}}': lead.endereco ? `${lead.endereco}, ${cidade}` : `${cleanCompanyName} - Atendimento em ${cidade}`,
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
  copyDirSync(path.join(templateDir, 'src'), path.join(targetDir, 'src'));

  const targetImgDir = path.join(targetDir, 'img');
  fs.mkdirSync(targetImgDir, { recursive: true });

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

  if (isSolar) {
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

  let gapReason = 'não possui site oficial cadastrado no Google';
  if (lead.siteStatus === 'inacessivel') {
    gapReason = `está com o site (${lead.siteOriginal}) fora do ar`;
  } else if (lead.siteStatus === 'apenas_social') {
    gapReason = 'utiliza apenas rede social no Google em vez de um site próprio de conversão';
  }

  const whatsappMsg = `Olá! Tudo bem?

Sou o Gabriel, atuo com tecnologia aqui em Franca.

Vi que a *${lead.nome}* tem uma excelente reputação, mas hoje quem pesquisa por *${lead.nicho}* no Google ou nas buscas por inteligência artificial (ChatGPT e a IA do WhatsApp) encontra esse gargalo: ${gapReason} — e essas ferramentas acabam indicando concorrentes da cidade.

Para mostrar na prática como resolver isso, montei uma prévia pronta do site oficial de vocês para celular, destacando as principais especialidades e os depoimentos dos seus clientes:
👉 *${previewUrl}*

Pode repassar para o responsável dar uma olhada? Consigo colocar no ar para vocês essa semana.
Gabriel Azevedo • (16) 99204-8856`;

  const emailSubject = `${lead.nome} em Franca — clientes sendo perdidos nas buscas por Inteligência Artificial`;
  const emailBody = `Prezada equipe da ${lead.nome},

O motivo do meu contato é direto: a forma como os clientes procuram por ${lead.nicho} em Franca mudou.

Hoje, a maioria das pessoas pesquisa pelo celular ou pergunta para ferramentas de inteligência artificial (como o ChatGPT e a IA do WhatsApp) quem é a empresa recomendada na cidade. O grande ponto é que essas ferramentas priorizam empresas com presença estruturada e site oficial próprio.

Como sou desenvolvedor aqui em Franca, tomei a iniciativa de montar a estrutura do site oficial da ${lead.nome}, já funcional e adaptada para smartphones:
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
