const fs = require('fs');
const path = require('path');

const TEMPLATES_ROOT = path.join(__dirname, '..', 'templates');
const FALLBACK_TEMPLATE_DIR = path.join('C:', 'Users', 'Gabriel', 'dev', 'template.subzero');
const PREVIEWS_DIR = path.join(__dirname, '..', 'previews');

/**
 * Determina o arquétipo visual ideal de acordo com o nicho e regras de negócio
 * @param {string} nicho
 * @param {string} nomeEmpresa
 * @param {string} [templateHint]
 * @returns {'care' | 'clinical' | 'industrial'}
 */
function getArchetype(nicho = '', nomeEmpresa = '', templateHint = null) {
  if (templateHint && typeof templateHint === 'string') {
    const hint = templateHint.toLowerCase().trim();
    if (['care', 'clinical', 'industrial'].includes(hint)) {
      return hint;
    }
  }

  const n = (nicho || '').toLowerCase();
  const name = (nomeEmpresa || '').toLowerCase();

  // 1. Care (Acolhedor, luminoso, humanizado: Pet Shops, Clínicas Veterinárias, Banho & Tosa, Cuidados)
  if (n.includes('pet') || n.includes('vet') || n.includes('animal') || name.includes('pet') || name.includes('vet')) {
    return 'care';
  }

  // 2. Clinical (Ultra-Clean, médico, higiênico: Odontologia, Clínicas Médicas, Estética, Fisioterapia, Saúde humana)
  if (
    n.includes('odonto') || n.includes('dent') || n.includes('sorriso') || n.includes('implante') ||
    n.includes('ortodontia') || n.includes('medica') || n.includes('estetica') || n.includes('fisioterapia') ||
    (n.includes('clinica') && !n.includes('vet')) ||
    name.includes('odonto') || name.includes('dent') || name.includes('sorriso')
  ) {
    return 'clinical';
  }

  // 3. Industrial (Dark Tech / Alta Robustez: HVAC, Segurança Eletrônica, Energia Solar, Mecânica, Marcenaria)
  return 'industrial';
}


/**
 * Inteligência de conteúdo por nicho para preencher o Subzero Engine
 */
function getNicheContent(nicho, nomeEmpresa, cidade = 'Franca - SP', lead = {}) {
  const n = (nicho || '').toLowerCase();
  const nameLower = (nomeEmpresa || '').toLowerCase();

  // 1. PET SHOP & CLÍNICA VETERINÁRIA
  if (n.includes('pet') || n.includes('vet') || n.includes('animal') || nameLower.includes('vet') || nameLower.includes('pet')) {
    return {
      subtitulo: 'Clínica Veterinária & Pet Shop Especializado',
      tituloPrincipal: 'Medicina Veterinária com Amor e Tecnologia',
      chamadaPrincipal: 'O Cuidado Que Seu Pet Merece',
      slogan: 'Medicina veterinária humanizada, exames, vacinas e cuidados completos.',
      apresentacao: `Com dedicação e carinho pelos animais em ${cidade}, a ${nomeEmpresa} oferece atendimento veterinário de excelência, centro cirúrgico com anestesia inalatória, vacinas importadas, farmácia veterinária e banho & tosa especializado.`,
      servicos: [
        { nome: 'Consultas Clínicas & Check-up', desc: 'Diagnóstico clínico detalhado, avaliação nutricional e acompanhamento integral da saúde e longevidade do seu pet.' },
        { nome: 'Centro Cirúrgico & Procedimentos', desc: 'Estrutura cirúrgica esterilizada com monitoramento cardíaco multiparâmetro e foco absoluto na segurança.' },
        { nome: 'Vacinação Importada & Prevenção', desc: 'Protocolos vacinais V10, antirrábica, gripe e giardíase com controle rigoroso de refrigeração e carteirinha digital.' },
        { nome: 'Estética Animal, Banho & Tosa', desc: 'Banhos com cosméticos dermatológicos hipoalergênicos, tosa na máquina/tesoura e tosa higiênica sem estresse.' }
      ],
      diferenciais: [
        { titulo: 'Medicina Humanizada', desc: 'Trato empático, acolhedor e calmo, respeitando o tempo de adaptação e conforto de cada animalzinho.' },
        { titulo: 'Diagnóstico Preciso', desc: 'Exames laboratoriais rápidos e conduta médica ética para tratar o problema na raiz.' },
        { titulo: 'Clínica e Loja Integradas', desc: 'Consulta médica, farmácia completa de medicamentos e produtos de alta qualidade no mesmo lugar.' }
      ],
      avaliacoes: [
        { autor: 'Mariana Silveira', texto: 'Equipe maravilhosa! Cuidaram do meu cachorro com muito profissionalismo e carinho quando ele precisou de cirurgia.' },
        { autor: 'Renato F. Oliveira', texto: 'O melhor banho e tosa de Franca! Meus pets voltam limpinhos, cheirosos e sem trauma nenhum. Recomendo muito.' },
        { autor: 'Carla Beatriz Ramos', texto: 'Veterinários muito capacitados e transparentes. Explicam tudo com calma e sem empurrar gastos desnecessários.' },
        { autor: 'Diego M. Santos', texto: 'Ambiente super limpo e atendimento acolhedor desde a recepção. Lugar de total confiança para nossa família.' }
      ]
    };
  }

  // 2. SEGURANÇA ELETRÔNICA, CERCAS & CFTV
  if (n.includes('seguranca') || n.includes('cerca') || n.includes('camera') || n.includes('alarme') || n.includes('cftv') || n.includes('portao') || nameLower.includes('seguranca') || nameLower.includes('eletronica')) {
    return {
      subtitulo: 'Proteção Perimetral & CFTV em Franca',
      tituloPrincipal: 'Proteja Sua Família e Seu Patrimônio',
      chamadaPrincipal: 'Proteção Que Faz o Invasor Desistir',
      slogan: 'Cercas elétricas, concertinas e monitoramento no celular com garantia.',
      apresentacao: `Com atuação reconhecida em ${cidade}, entregamos barreiras físicas de alta visibilidade e máxima resistência com instalação técnica limpa e equipamentos líderes em durabilidade.`,
      servicos: [
        { nome: 'Cerca Elétrica de Choque Ativo', desc: 'Choque imediato inibidor com sirene instantânea e alarme em caso de corte ou toque no fio.' },
        { nome: 'Concertina Dupla & Rede Laminada', desc: 'Lâminas de aço galvalume afiadas que tornam qualquer tentativa de invasão pelo muro impossível.' },
        { nome: 'Câmeras CFTV HD com Visão Noturna', desc: 'Acesso em tempo real na tela do smartphone, com imagens nítidas no escuro e alertas inteligentes.' },
        { nome: 'Motores para Portão & Automatização', desc: 'Abertura rápida em até 4 segundos com acionamento seguro no controle ou celular.' }
      ],
      diferenciais: [
        { titulo: 'Aço Galvalume & Equipamentos Certificados', desc: 'Materiais de altíssima resistência contra intempéries e tentativa de corte.' },
        { titulo: 'Instalação Rápida e Limpa', desc: 'Técnicos próprios, pontualidade e zero sujeira no seu imóvel.' },
        { titulo: 'Garantia e Pós-Venda Local', desc: 'Atendimento e suporte direto em Franca com suporte ágil.' }
      ],
      avaliacoes: [
        { autor: 'André Martins', texto: 'Instalação impecável da concertina e do motor de portão. Ficou super alinhado e o atendimento foi rápido.' },
        { autor: 'Luciana Meireles', texto: 'Agora consigo acompanhar as câmeras pelo celular de qualquer lugar. Equipe muito prestativa e honesta.' },
        { autor: 'Roberto Faria', texto: 'Melhor empresa de segurança de Franca. Preço justo, serviço profissional e sem enrolação.' },
        { autor: 'Patrícia Prado', texto: 'Cerca elétrica muito bem instalada. Passa muita segurança para quem mora em casa térrea.' }
      ]
    };
  }

  // 3. AR-CONDICIONADO & REFRIGERAÇÃO
  if (n.includes('ar') || n.includes('clima') || n.includes('refrigera')) {
    return {
      subtitulo: 'Climatização & Refrigeração',
      tituloPrincipal: 'Especialistas em Ar-Condicionado',
      chamadaPrincipal: 'Conforto e Ar Puro o Ano Todo',
      slogan: 'Temperatura ideal para sua casa ou empresa com máxima economia.',
      apresentacao: `Com atendimento técnico especializado em ${cidade}, entregamos serviços completos de instalação, manutenção e higienização de sistemas de ar-condicionado com pontualidade e garantia total.`,
      servicos: [
        { nome: 'Instalação de Ar-Condicionado', desc: 'Instalação técnica padrão de fábrica para modelos Split, Inverter e Cassete, garantindo máxima eficiência.' },
        { nome: 'Higienização Antibacteriana', desc: 'Limpeza profunda de serpentinas e filtros com produtos bactericidas que eliminam ácaros, fungos e odores.' },
        { nome: 'Manutenção Preventiva & Carga de Gás', desc: 'Diagnóstico elétrico, medição de pressão e recarga de gás ecológica para prolongar a vida útil do aparelho.' },
        { nome: 'Contratos PMOC e Projetos Comerciais', desc: 'Dimensionamento térmico exato para residências, clínicas, lojas e indústrias com conformidade ANVISA.' }
      ],
      diferenciais: [
        { titulo: 'Técnicos Certificados', desc: 'Profissionais experientes e atualizados com as principais marcas do mercado (Daikin, Gree, Midea).' },
        { titulo: 'Pontualidade Rigorosa', desc: 'Respeitamos seu tempo com horário marcado e atendimento ágil em toda a cidade.' },
        { titulo: 'Peças Originais e Garantia', desc: 'Uso de insumos de primeira linha e garantia por escrito em todos os serviços realizados.' }
      ],
      avaliacoes: [
        { autor: 'Marcelo Ribeiro', texto: 'Atendimento impecável! Resolveram o problema do ar da minha sala no mesmo dia. Trabalho limpo e muito profissional.' },
        { autor: 'Dra. Fernanda Castro', texto: 'Contratei para a higienização dos aparelhos do consultório. Muito atenciosos, pontuais e com preço justo. Recomendo!' },
        { autor: 'Carlos Eduardo Santos', texto: 'Excelente instalação. Explicaram tudo sobre o funcionamento econômico do inverter. Nota 10!' },
        { autor: 'Juliana Prado', texto: 'Melhor equipe de refrigeração de Franca. Sempre que preciso de manutenção já sei quem chamar.' }
      ]
    };
  }

  // 4. ODONTOLOGIA & CLÍNICAS DENTÁRIAS
  if (n.includes('odonto') || n.includes('dent') || n.includes('sorriso') || n.includes('implante') || nameLower.includes('odonto') || nameLower.includes('dentist')) {
    return {
      subtitulo: 'Odontologia Especializada',
      tituloPrincipal: 'Cuidando do Seu Sorriso com Excelência',
      chamadaPrincipal: 'O Sorriso que Você Merece',
      slogan: 'Tecnologia, conforto e cuidado humano para toda a família.',
      apresentacao: `Referência em cuidados odontológicos em ${cidade}, aliamos tratamentos modernos a um ambiente acolhedor para transformar a sua saúde bucal e autoestima.`,
      servicos: [
        { nome: 'Implantes & Próteses Dentárias', desc: 'Reabilitação oral segura e com materiais de alta durabilidade para você mastigar e sorrir com segurança.' },
        { nome: 'Ortodontia & Alinhadores Invisíveis', desc: 'Correção de alinhamento com aparelhos modernos e alinhadores discretos para adultos e crianças.' },
        { nome: 'Estética Dental & Facetas', desc: 'Clareamento a laser e facetas em resina/porcelana para um sorriso uniforme, harmônico e natural.' },
        { nome: 'Clínica Geral & Prevenção', desc: 'Limpeza profunda, restaurações estéticas e acompanhamento contínuo para manter sua saúde bucal em dia.' }
      ],
      diferenciais: [
        { titulo: 'Tecnologia de Ponta', desc: 'Equipamentos modernos para diagnósticos precisos e procedimentos sem dor.' },
        { titulo: 'Atendimento Personalizado', desc: 'Planejamento individualizado focado no seu conforto e bem-estar em cada etapa.' },
        { titulo: 'Ambiente Confortável e Acolhedor', desc: 'Estrutura pensada para que você se sinta seguro e relaxado durante a consulta.' }
      ],
      avaliacoes: [
        { autor: 'Camila Nogueira', texto: 'Melhor consultório da cidade! O atendimento é humanizado e fiz meu clareamento sem sensibilidade nenhuma.' },
        { autor: 'Rodrigo Alcantara', texto: 'Profissionais de altíssimo nível. A clínica é linda e super limpa. Muito satisfeito com meu implante.' },
        { autor: 'Patrícia Mendes', texto: 'Equipe super atenciosa desde a recepção. Me senti acolhida e o resultado superou minhas expectativas.' },
        { autor: 'Lucas Silveira', texto: 'Pontuais e muito transparentes no orçamento. Recomendo de olhos fechados para toda a família.' }
      ]
    };
  }

  // 5. ENERGIA SOLAR
  if (n.includes('solar') || n.includes('fotovolta') || n.includes('energia')) {
    return {
      subtitulo: 'Engenharia Fotovoltaica & Energia Solar',
      tituloPrincipal: 'Economize até 95% na Conta de Luz',
      chamadaPrincipal: 'Energia Limpa, Sustentável e Lucrativa',
      slogan: 'Projetos solares residenciais e comerciais com homologação completa.',
      apresentacao: `Especialistas em projetos fotovoltaicos em ${cidade}, entregamos soluções completas de engenharia solar com painéis de alta eficiência e inversor com garantia de longa duração.`,
      servicos: [
        { nome: 'Energia Solar Residencial', desc: 'Reduza a conta de luz da sua casa e valorize seu imóvel gerando sua própria energia limpa.' },
        { nome: 'Projetos Comerciais e Industriais', desc: 'Dimensionamento estratégico para empresas e indústrias reduzirem custos operacionais fixos.' },
        { nome: 'Homologação junto à Concessionária', desc: 'Cuidamos de todo o processo burocrático de aprovação técnica e conexão à rede sem estresse.' },
        { nome: 'Manutenção & Limpeza de Painéis', desc: 'Limpeza especializada e revisão preventiva para manter a geração no pico máximo de rendimento.' }
      ],
      diferenciais: [
        { titulo: 'Engenharia Própria', desc: 'Projetos desenhados sob medida por engenheiros qualificados sem terceirização.' },
        { titulo: 'Equipamentos Tier 1', desc: 'Módulos e inversores das marcas mais confiáveis do mercado global.' },
        { titulo: 'Retorno Sobre o Investimento Rápido', desc: 'Sistema que se paga em poucos anos e gera economia por mais de 25 anos.' }
      ],
      avaliacoes: [
        { autor: 'Fábio Guimarães', texto: 'Minha conta de energia caiu de R$ 900 para a taxa mínima. Instalação rápida e equipe muito atenciosa.' },
        { autor: 'Vanessa Toledo', texto: 'Todo o processo de homologação foi super tranquilo. Eles cuidaram de tudo e já estou gerando energia.' },
        { autor: 'Gustavo Mendonça', texto: 'Excelente investimento para minha empresa. Reduziu nosso custo fixo significativamente.' },
        { autor: 'Tatiane Lopes', texto: 'Profissionais transparentes e materiais de primeira linha. Recomendo para quem quer energia solar sem surpresas.' }
      ]
    };
  }

  // Padrão Geral Premium Cuidadoso
  return {
    subtitulo: 'Atendimento Técnico Especializado',
    tituloPrincipal: 'Excelência e Soluções Confiáveis em Franca',
    chamadaPrincipal: 'Qualidade Comprovada para Você',
    slogan: 'Profissionalismo, agilidade e compromisso em cada detalhe.',
    apresentacao: `Com sólida reputação em ${cidade}, a ${nomeEmpresa} oferece soluções sob medida com equipe qualificada, pontualidade rigorosa e foco total na satisfação dos clientes.`,
    servicos: [
      { nome: 'Atendimento Personalizado', desc: 'Consultoria detalhada para entender exatamente sua necessidade e entregar a solução ideal com o melhor custo-benefício.' },
      { nome: 'Execução Técnica Especializada', desc: 'Profissionais experientes utilizando métodos comprovados para garantir alta durabilidade e segurança.' },
      { nome: 'Diagnóstico Ágil e Transparente', desc: 'Orçamento claro e detalhado sem surpresas ou taxas ocultas, respeitando o seu tempo.' },
      { nome: 'Garantia e Suporte Local', desc: 'Atendimento direto com suporte completo e acompanhamento pós-serviço para sua tranquilidade.' }
    ],
    diferenciais: [
      { titulo: 'Profissionais Qualificados', desc: 'Equipe com vasta experiência prática pronta para resolver com eficiência.' },
      { titulo: 'Pontualidade e Compromisso', desc: 'Respeito ao prazo e clareza em todas as etapas da contratação.' },
      { titulo: 'Garantia Comprovada', desc: 'Segurança e confiança atestadas por avaliações positivas de clientes locais.' }
    ],
    avaliacoes: [
      { autor: 'Carlos Eduardo', texto: 'Serviço de altíssimo nível. Resolveram rápido, com muita atenção e preço justo. Com certeza voltarei a contratar.' },
      { autor: 'Juliana Prado', texto: 'Excelente atendimento desde o primeiro contato no WhatsApp. Muito prestativos e pontuais.' },
      { autor: 'Marcos Vinicius', texto: 'Profissionais sérios e de palavra. Entregaram exatamente o combinado com muita qualidade.' },
      { autor: 'Beatriz Costa', texto: 'Super recomendo! Transparência total e equipe muito educada e caprichosa.' }
    ]
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
    // Limpa pastas de mídia antigas para evitar conflitos entre arquétipos
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

  // 2. Gerar conteúdo inteligente e específico
  const content = getNicheContent(lead.nicho, lead.nome, lead.cidade, lead);
  const waMsg = encodeURIComponent(`Olá! Vi o site oficial da ${lead.nome} e gostaria de solicitar um orçamento/informações.`);
  const waLink = `https://wa.me/${lead.whatsappPrincipal}?text=${waMsg}`;
  const encodedAddress = encodeURIComponent(`${lead.nome}, ${lead.cidade}`);
  const cleanDomain = lead.slug.endsWith('.com.br') ? lead.slug : `${lead.slug}.com.br`;

  // 3. Substituir tags de placeholder
  const replacements = {
    '{{NOME_DA_EMPRESA}}': lead.nome,
    '{{TITULO_PRINCIPAL}}': content.tituloPrincipal,
    '{{DESCRICAO_SEO_150_CARACTERES}}': `${lead.nome} em Franca/SP. ${content.slogan} Fale conosco no WhatsApp!`,
    '{{PALAVRAS_CHAVE_SEPARADAS_POR_VIRGULA}}': `${lead.nome}, ${lead.nicho}, Franca SP, atendimento, servicos, avaliacoes`,
    '{{SEU_DOMINIO}}': cleanDomain,
    '{{SUBTITULO_OU_SEGMENTO}}': content.subtitulo,
    '{{SUBTITULO_LOCALIZACAO_EM_CAPS}}': `${(lead.cidade || 'FRANCA SP').toUpperCase()} • ATENDIMENTO ESPECIALIZADO`,
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
    '{{CIDADE_UF}}': lead.cidade || 'Franca - SP',
    '{{TITULO_SECAO_SERVICOS_LINHA_1}}': 'Soluções completas',
    '{{TITULO_SECAO_SERVICOS_LINHA_2}}': 'para sua tranquilidade',
    '{{DESCRICAO_CURTA_DA_SECAO_DE_SERVICOS}}': 'Conheça as principais especialidades que tornam nosso atendimento diferenciado na cidade.',
    '{{NOME_SERVICO_1}}': content.servicos[0].nome,
    '{{DESCRICAO_SERVICO_1}}': content.servicos[0].desc,
    '{{NOME_SERVICO_2}}': content.servicos[1].nome,
    '{{DESCRICAO_SERVICO_2}}': content.servicos[1].desc,
    '{{NOME_SERVICO_3}}': content.servicos[2].nome,
    '{{DESCRICAO_SERVICO_3}}': content.servicos[2].desc,
    '{{NOME_SERVICO_4}}': content.servicos[3].nome,
    '{{DESCRICAO_SERVICO_4}}': content.servicos[3].desc,
    '{{SLOGAN_CURTO}}': content.slogan,
    '{{TITULO_DIFERENCIAIS_LINHA_1}}': 'Por que confiar',
    '{{TITULO_DIFERENCIAIS_LINHA_2}}': 'no nosso trabalho?',
    '{{SUBTEXTO_DE_AUTORIDADE_E_CONFIANCA}}': 'Transparência, seriedade e dedicação em cada atendimento prestado em Franca.',
    '{{TITULO_DIFERENCIAL_1}}': content.diferenciais[0].titulo,
    '{{DESCRICAO_DIFERENCIAL_1}}': content.diferenciais[0].desc,
    '{{TITULO_DIFERENCIAL_2}}': content.diferenciais[1].titulo,
    '{{DESCRICAO_DIFERENCIAL_2}}': content.diferenciais[1].desc,
    '{{TITULO_DIFERENCIAL_3}}': content.diferenciais[2].titulo,
    '{{DESCRICAO_DIFERENCIAL_3}}': content.diferenciais[2].desc,
    '{{NOME_DO_CLIENTE_1}}': content.avaliacoes[0].autor,
    '{{DEPOIMENTO_DO_CLIENTE_1}}': content.avaliacoes[0].texto,
    '{{NOME_DO_CLIENTE_2}}': content.avaliacoes[1].autor,
    '{{DEPOIMENTO_DO_CLIENTE_2}}': content.avaliacoes[1].texto,
    '{{NOME_DO_CLIENTE_3}}': content.avaliacoes[2].autor,
    '{{DEPOIMENTO_DO_CLIENTE_3}}': content.avaliacoes[2].texto,
    '{{NOME_DO_CLIENTE_4}}': content.avaliacoes[3].autor,
    '{{DEPOIMENTO_DO_CLIENTE_4}}': content.avaliacoes[3].texto,
    '{{ENDERECO_COMPLETO_DO_GOOGLE_MAPS}}': lead.endereco || `${lead.cidade}`,
    '{{LINK_DIRECIONAMENTO_ROTA_GOOGLE_MAPS}}': `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
  };

  for (const [key, val] of Object.entries(replacements)) {
    html = html.replaceAll(key, val);
  }

  // 4. Copiar assets estruturais do template selecionado (src, favicon, img ou assets)
  copyDirSync(path.join(templateDir, 'src'), path.join(targetDir, 'src'));

  if (fs.existsSync(path.join(templateDir, 'assets'))) {
    copyDirSync(path.join(templateDir, 'assets'), path.join(targetDir, 'assets'));
  }
  if (fs.existsSync(path.join(templateDir, 'img'))) {
    copyDirSync(path.join(templateDir, 'img'), path.join(targetDir, 'img'));
  }

  const faviconSrc = path.join(templateDir, 'favicon.svg');
  if (fs.existsSync(faviconSrc)) {
    fs.copyFileSync(faviconSrc, path.join(targetDir, 'favicon.svg'));
  }

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

Para mostrar na prática como resolver isso, montei uma prévia pronta do site oficial de vocês para celular, já com fotos reais e depoimentos dos seus clientes:
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
  getArchetype
};

