const fs = require('fs');
const path = require('path');

const TEMPLATES_ROOT = path.join(__dirname, '..', 'templates');
const PREVIEWS_DIR = path.join(__dirname, '..', 'previews');
const FALLBACK_TEMPLATE_DIR = path.join(TEMPLATES_ROOT, 'padrao');

/**
 * Mapeia o nicho/empresa para o arquétipo ideal
 */
function getArchetype(nicho = '', nome = '', templateHint = null) {
  if (templateHint && ['industrial', 'clinical', 'care', 'architectural'].includes(templateHint)) {
    return templateHint;
  }

  const norm = (str = '') => (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c');

  const n = norm(nicho);
  const nameLower = norm(nome);

  // 1. Arquitetura, Engenharia Civil, Cálculo Estrutural, Obras & Design -> architectural
  if (n.includes('arquitet') || n.includes('engenharia') || n.includes('construc') || n.includes('obras') || n.includes('interiores') || nameLower.includes('arquit') || nameLower.includes('engenharia') || nameLower.includes('construc') || nameLower.includes('obras')) {
    return 'architectural';
  }

  // 2. Odontologia, Médicos, Clínicas e Saúde -> clinical
  if (n.includes('odonto') || n.includes('dent') || n.includes('medic') || n.includes('clinic') || n.includes('saude') || n.includes('psico') || n.includes('estetica') || n.includes('fisio') || nameLower.includes('odonto') || nameLower.includes('dent')) {
    return 'clinical';
  }

  // 3. Veterinárias, Pet Shops, Banho & Tosa -> care
  if (n.includes('veterin') || n.includes('pet') || n.includes('cao') || n.includes('cachorro') || n.includes('gato') || n.includes('banho') || n.includes('tosa') || n.includes('animal') || nameLower.includes('pet') || nameLower.includes('vet')) {
    return 'care';
  }

  // 4. Climatização, Segurança, Solar, B2B e outros -> industrial
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

  // 5. CLIMATIZAÇÃO, AR-CONDICIONADO & REFRIGERAÇÃO
  if (n.includes('ar condicionado') || n.includes('ar-condicionado') || n.includes('climatiza') || n.includes('refrigera') || nameLower.includes('frio') || nameLower.includes('clima') || nameLower.includes('ar condicionado')) {
    const rawClim = `${lead?.nome || ''} ${nomeEmpresa} ${lead?.dadosEnriquecidos?.bioInstagram || ''} ${n}`.toLowerCase();
    
    if (rawClim.includes('evaporativo') || rawClim.includes('industrial') || rawClim.includes('prime')) {
      // Ângulo Industrial & Evaporativo (Ex: Franca Prime)
      return {
        subtitulo: 'Climatização Evaporativa Industrial & Comercial',
        tituloPrincipal: 'Conforto Térmico e Renovação de Ar para Grandes Ambientes Industriais',
        chamadaPrincipal: `Climatizadores Evaporativos e Manutenção em ${cidade}`,
        slogan: 'Ambientes mais frescos, produtividade elevada e redução de custos energéticos.',
        apresentacao: `Especialistas em sistemas de climatização evaporativa industrial e comercial em ${cidade}. Proporcionamos alívio térmico contínuo com alta eficiência e economia energética.`,
        servicos: [
          { nome: 'Climatizadores Evaporativos Industriais', desc: 'Instalação técnica para galpões, fábricas e grandes comércios com fluxo contínuo.' },
          { nome: 'Projetos e Dimensionamento Sob Medida', desc: 'Cálculo de vazão e renovação de ar para atender plenamente a área útil.' },
          { nome: 'Higienização e Troca de Colmeias', desc: 'Limpeza profunda e substituição de filtros para ar purificado e sem odores.' },
          { nome: 'Manutenção Preventiva & Contratos', desc: 'Acompanhamento periódico garantindo vida útil máxima aos equipamentos.' }
        ],
        diferenciais: [
          { titulo: 'Economia de Até 90% de Energia', desc: 'Eficiência incomparável se comparada a sistemas de ar-condicionado convencionais.' },
          { titulo: 'Renovação Contínua do Ar', desc: 'Ar sempre novo e filtrado, reduzindo poeira e aumentando o conforto da equipe.' },
          { titulo: 'Assistência Técnica Especializada', desc: 'Corpo técnico experiente com reposição rápida de peças e suporte ágil.' }
        ],
        avaliacoes: prepareReviews(lead, [
          { autor: 'Fernando Galvão', texto: `Instalamos os climatizadores da ${nomeEmpresa} no nosso galpão em Franca. A temperatura caiu mais de 8 graus e o consumo de energia é super baixo. Recomendo muito!` },
          { autor: 'Cláudia Meireles', texto: `Excelente atendimento comercial e instalação impecável. Equipe técnica muito educada e entregaram no prazo.` },
          { autor: 'Rodrigo Salles', texto: `A manutenção preventiva da ${nomeEmpresa} salvou nossa linha de produção no verão. Empresa ágil e de palavra.` },
          { autor: 'Vanessa Toledo', texto: `Melhor escolha para nosso atacado. O ar fica fresco e muito agradável o dia todo!` }
        ], nomeEmpresa),
        imagensServicos: ['higienizacao-profunda.jpg', 'instalacao-split.jpg', 'pmoc-comercial.jpg', 'manutencao-preventiva.jpg']
      };
    } else if (rawClim.includes('assistencia') || rawClim.includes('conserto') || rawClim.includes('gelar') || rawClim.includes('tecnica')) {
      // Ângulo Assistência Técnica & Conserto Rápido (Ex: Gelar)
      return {
        subtitulo: 'Assistência Técnica Especializada em Ar-Condicionado',
        tituloPrincipal: 'Conserto Rápido, Manutenção Preventiva e Higienização Profunda',
        chamadaPrincipal: `Diagnóstico Preciso e Assistência Técnica em ${cidade}`,
        slogan: 'Diagnóstico ágil, ferramentas de precisão e garantia documentada no reparo.',
        apresentacao: `Assistência técnica ágil em ${cidade} especializada em conserto, recarga ecológica de gás e higienização profunda com garantia e transparência no orçamento.`,
        servicos: [
          { nome: 'Conserto & Diagnóstico Eletrônico', desc: 'Detecção ágil de placas, compressores e falhas que impedem o aparelho de gelar.' },
          { nome: 'Recarga Ecológica de Gás & Vácuo', desc: 'Eliminação de microvazamentos e recarga precisa com bomba de vácuo profissional.' },
          { nome: 'Higienização Antibacteriana ANVISA', desc: 'Limpeza química detalhada eliminando fungos, bactérias e odores desagradáveis.' },
          { nome: 'Instalação e Desinstalação Técnica', desc: 'Montagem padrão de fábrica para modelos Split, Inverter e Cassete.' }
        ],
        diferenciais: [
          { titulo: 'Atendimento Rápido e Sem Enrolação', desc: 'Técnicos pontuais que resolvem o problema no menor tempo possível.' },
          { titulo: 'Orçamento Claro e Justo', desc: 'Preço fechado antes do serviço sem surpresas ou cobranças extras.' },
          { titulo: 'Garantia Comprovada no Reparo', desc: 'Tranquilidade e segurança com suporte pós-serviço em Franca.' }
        ],
        avaliacoes: prepareReviews(lead, [
          { autor: 'Otávio Mendonça', texto: `Meu ar parou de gelar no calor e a equipe da ${nomeEmpresa} veio no mesmo dia. Trocaram a peça e ficou perfeito. Salvou o verão!` },
          { autor: 'Beatriz Fontes', texto: `Preço honesto e atendimento super atencioso. Fizeram o vácuo correto e explicaram tudo. Muito satisfeita.` },
          { autor: 'Luciano Prado', texto: `Melhor assistência de Franca. Técnicos limpos, organizados e de confiança.` },
          { autor: 'Camila Duarte', texto: `Higienização impecável! O cheiro ruim sumiu completamente e o ar voltou a gelar como novo.` }
        ], nomeEmpresa),
        imagensServicos: ['manutencao-preventiva.jpg', 'higienizacao-profunda.jpg', 'instalacao-split.jpg', 'pmoc-comercial.jpg']
      };
    } else {
      // Ângulo Padrão Residencial / Comercial (Ex: Hunifrio, Daniel Climatização, Kliver)
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
        { nome: 'Homologação na Concessionária', desc: 'Projeto elétrico e aprovação técnica 100% gerenciada.' }
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

  // 8. ENGENHARIA & CONSTRUÇÃO CIVIL (Sub-ângulos dinâmicos: Arquitetura/3D, Construtora/Obras, Estrutural/Laudos)
  if (n.includes('engenharia') || n.includes('construc') || nameLower.includes('engenharia') || nameLower.includes('construc') || nameLower.includes('obras') || nameLower.includes('arquit')) {
    const rawAll = `${lead?.nome || ''} ${nomeEmpresa} ${lead?.dadosEnriquecidos?.bioInstagram || ''} ${n}`.toLowerCase();
    const hasArq = rawAll.includes('arquit');
    const hasConstrutora = rawAll.includes('construtora') || rawAll.includes('construc') || rawAll.includes('obras');

    if (hasArq) {
      // Ângulo 1: Arquitetura Contemporânea & Engenharia Estrutural (Ex: Leandro Freitas)
      return applyMinedOverrides({
        subtitulo: 'Arquitetura Contemporânea & Engenharia Estrutural',
        tituloPrincipal: 'Do Conceito Arquitetônico à Execução Estrutural de Alta Precisão',
        chamadaPrincipal: `Arquitetura Autoral, Estruturas e Obras em ${cidade}`,
        slogan: 'Projetos autorais em 3D, compatibilização técnica e direção de obras.',
        apresentacao: `Escritório integrado de arquitetura e projetos em ${cidade}. Unimos soluções contemporâneas, planejamento minucioso e assessoria completa para transformar ideias em espaços elegantes, seguros e valorizados.`,
        servicos: [
          { nome: 'Projetos Arquitetônicos & Design 3D', desc: 'Plantas humanizadas, volumetria detalhada e modelagem realista antes de iniciar a obra.' },
          { nome: 'Planejamento Estrutural & Executivo', desc: 'Dimensionamento inteligente que alia segurança técnica, soluções eficientes e economia de materiais.' },
          { nome: 'Direção & Acompanhamento de Obras', desc: 'Supervisão técnica contínua garantindo fidelidade absoluta ao projeto e alto padrão de acabamento.' },
          { nome: 'Regularização & Aprovações', desc: 'Aprovações técnicas, documentação completa e suporte com total conformidade e agilidade.' }
        ],
        diferenciais: [
          { titulo: 'Arquitetura + Engenharia Integradas', desc: 'Concepção estética e viabilidade estrutural compatibilizadas sem improvisos ou retrabalhos.' },
          { titulo: 'Economia Inteligente na Execução', desc: 'Detalhamento minucioso que evita compras excessivas de insumos e desperdícios no canteiro.' },
          { titulo: 'Acompanhamento Dedicado', desc: 'Supervisão atenta para garantir fidelidade absoluta ao projeto e conformidade com as normas.' }
        ],
        avaliacoes: prepareReviews(lead, [
          { autor: 'Ricardo Silveira', texto: `O projeto 3D da ${nomeEmpresa} superou todas as expectativas. Ver cada detalhe da casa antes de construir nos deu total segurança. Trabalho impecável!` },
          { autor: 'Carolina Prado', texto: `Excelente profissionalismo da ${nomeEmpresa}. Uniu um design moderno incrível com cálculo estrutural preciso e econômico. Super recomendo!` },
          { autor: 'Fernando Vasconcelos', texto: `Fizeram toda a aprovação na prefeitura e o acompanhamento técnico da nossa obra. Transparência, pontualidade e muita competência.` },
          { autor: 'Mariana Duarte', texto: `Capricho em cada planta e muito cuidado com o nosso orçamento. A equipe da ${nomeEmpresa} é diferenciada em Franca.` }
        ], nomeEmpresa),
        imagensServicos: ['project-1.jpg', 'project-2.jpg', 'project-3.jpg', 'hero-bg.jpg']
      }, lead);
    } else if (hasConstrutora) {
      // Ângulo 2: Construtora & Gestão Integral de Obras (Ex: Ulo Engenharia, Tríad)
      return applyMinedOverrides({
        subtitulo: 'Construção Civil, Reformas & Gestão de Obras',
        tituloPrincipal: 'Construções e Obras de Alto Padrão com Gestão Transparente e Sem Dor de Cabeça',
        chamadaPrincipal: `Execução de Obras Residenciais e Comerciais em ${cidade}`,
        slogan: 'Cronograma físico-financeiro rigoroso, equipe qualificada e entrega no prazo combinado.',
        apresentacao: `Atuação sólida em ${cidade}, especializada em construções residenciais e comerciais com controle orçamentário transparente, materiais de primeira linha e compromisso total com o cronograma.`,
        servicos: [
          { nome: 'Execução & Gerenciamento de Obras', desc: 'Acompanhamento técnico diário do alicerce aos acabamentos de fino padrão.' },
          { nome: 'Cálculo Estrutural de Precisão', desc: 'Dimensionamento avançado com segurança estrutural e otimização inteligente de insumos.' },
          { nome: 'Construções & Ampliações Comerciais', desc: 'Estruturação ágil para residências e empresas com cronograma pontual e total limpeza.' },
          { nome: 'Regularização Imobiliária & Laudos', desc: 'Habite-se, desdobros, alvarás e laudos periciais com total conformidade na prefeitura.' }
        ],
        diferenciais: [
          { titulo: 'Controle Orçamentário Rígido', desc: 'Transparência nos custos para sua construção não sofrer com aditivos ou despesas imprevistas.' },
          { titulo: 'Pontualidade e Cronograma', desc: 'Acompanhamento etapa por etapa para entrega rigorosamente no dia contratado.' },
          { titulo: 'Equipe Própria e Qualificada', desc: 'Profissionais experientes sob supervisão de engenharia do alicerce ao acabamento.' }
        ],
        avaliacoes: prepareReviews(lead, [
          { autor: 'Marcelo Rezende', texto: `A equipe da ${nomeEmpresa} gerenciou minha obra com muita seriedade. Entregaram no prazo e sem surpresas no orçamento.` },
          { autor: 'Luciana Fontes', texto: `Acompanhamento técnico diário e mão de obra de altíssimo nível. A melhor construtora de Franca!` },
          { autor: 'Fábio Guimarães', texto: `Profissionais capacitados e muito transparentes na ${nomeEmpresa}. Resolveram toda a regularização do imóvel com agilidade.` },
          { autor: 'Daniela P. Castro', texto: `Muito capricho e rigor técnico em cada detalhe. Recomendo com total certeza para quem vai construir ou reformar.` }
        ], nomeEmpresa),
        imagensServicos: ['project-1.jpg', 'project-2.jpg', 'project-3.jpg', 'hero-bg.jpg']
      }, lead);
    } else {
      // Ângulo 3: Engenharia Estrutural, Projetos Técnicos & Laudos (Ex: Fabor, Premmia)
      return applyMinedOverrides({
        subtitulo: 'Engenharia Civil, Projetos Estruturais & Laudos',
        tituloPrincipal: 'Segurança Estrutural, Rigor Técnico e Engenharia de Precisão',
        chamadaPrincipal: `Projetos Estruturais e Engenharia Especializada em ${cidade}`,
        slogan: 'Projetos estruturais seguros, laudos periciais e responsabilidade técnica documental.',
        apresentacao: `Engenharia de precisão em ${cidade}, prestando assessoria técnica especializada em cálculos estruturais, regularizações imobiliárias e vistorias cautelares de alta confiabilidade.`,
        servicos: [
          { nome: 'Cálculo Estrutural & Fundações', desc: 'Dimensionamento avançado em concreto armado e estruturas metálicas com segurança estrita.' },
          { nome: 'Laudos Técnicos & Vistorias Cautelares', desc: 'Perícias técnicas, vistorias de vizinhança e documentação com total conformidade.' },
          { nome: 'Supervisão & Gerenciamento de Obras', desc: 'Acompanhamento técnico independente para assegurar a conformidade da construção.' },
          { nome: 'Desdobros, Alvarás e Regularizações', desc: 'Assessoria completa para habite-se e regularização junto aos órgãos municipais.' }
        ],
        diferenciais: [
          { titulo: 'Rigor Normativo & Qualidade', desc: 'Projetos desenvolvidos rigorosamente de acordo com as melhores normas e padrões.' },
          { titulo: 'Otimização Estrutural de Custos', desc: 'Dimensionamento preciso que reduz consumo de aço e concreto sem abrir mão da segurança.' },
          { titulo: 'Agilidade Documental', desc: 'Laudos e memoriais descritivos prontos com celeridade para aprovação imediata.' }
        ],
        avaliacoes: prepareReviews(lead, [
          { autor: 'Eduardo Mantovani', texto: `O cálculo estrutural da ${nomeEmpresa} gerou uma economia fantástica de concreto e aço sem comprometer nada na segurança. Nota 10!` },
          { autor: 'Patrícia Alvarenga', texto: `Laudo técnico extremamente detalhado e entregue antes do prazo previsto. Excelente atendimento da ${nomeEmpresa}.` },
          { autor: 'Marcos Aurélio Lima', texto: `Empresa séria e altamente capacitada tecnicamente. Facilitaram todo o processo de aprovação na prefeitura.` },
          { autor: 'Beatriz Zanin', texto: `Supervisão de obra impecável. Tiraram todas as dúvidas com clareza e nos deram total tranquilidade.` }
        ], nomeEmpresa),
        imagensServicos: ['project-1.jpg', 'project-2.jpg', 'project-3.jpg', 'hero-bg.jpg']
      }, lead);
    }
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

  // 1. Remove cidade no final (Franca, Franca SP, EM Franca SP, Centro Franca, Franca/SP, etc)
  name = name.replace(/\s*(?:[-–—|/]\s*)?(?:em\s+)?(?:franca|sp|franca\s*[-/]?\s*sp|centro\s+franca|franca\s+centro)\s*$/i, '');
  name = name.replace(/\s+(?:em\s+)?franca(?:\s*[-/]?\s*sp)?$/i, '');
  name = name.replace(/\s+(?:franca\s*\/sp|franca\s*centro|centro\s*franca)$/i, '');

  // 2. Separadores comuns de título no Google Maps
  for (const sep of [' | ', ' - ', ' – ', ' — ', ' / ', ' • ']) {
    if (name.includes(sep)) {
      name = name.split(sep)[0].trim();
    }
  }

  // 3. Caso especial: Profissionais liberais com palavras-chave de busca (ex: LEANDRO FREITAS ARQUITETO ENGENHEIRO CIVIL)
  const profMatch = name.match(/^([A-Za-zÀ-ÖØ-öø-ÿ\s]{4,30}?)\s+(?:arquiteto|arquiteta|engenheiro|engenheira)\b(.*)$/i);
  if (profMatch) {
    const personName = profMatch[1].trim();
    const rest = (profMatch[0]).toLowerCase();
    const hasArq = rest.includes('arquit');
    const hasEng = rest.includes('engenh');
    if (hasArq && hasEng) {
      name = personName + ' | Arquitetura & Engenharia';
    } else if (hasArq) {
      name = personName + ' | Arquitetura';
    } else if (hasEng) {
      name = personName + ' | Engenharia Civil';
    }
  }

  // 4. Caso especial: Médicos / Dentistas
  const docMatch = name.match(/^((?:Dra?\.?|Dr\.)\s+[A-Za-zÀ-ÖØ-öø-ÿ\s]{4,30}?)\s+(?:cirurgi[aã]|dentista|m[eé]dic[ao])\b/i);
  if (docMatch) {
    name = docMatch[1].trim();
  }

  // 5. Caudas descritivas e palavras-chave de busca no Google Maps
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

  // 6. Formatação Title Case elegante para nomes com preservação de siglas e hífens
  const preps = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'com', '&', '|'];
  name = name.split(/\s+/).map((word, i) => {
    if (word === '|' || word === '&') return word;
    if (word.length > 1 && word === word.toUpperCase() && !/[0-9]/.test(word) && word.length <= 4) {
      return word; // Preserva siglas como CFTV, PMOC, ART, 3D
    }
    const parts = word.split('-');
    return parts.map((part, pIdx) => {
      const lower = part.toLowerCase();
      if (i > 0 && pIdx === 0 && preps.includes(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join('-');
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
  const defaultImgs = archetype === 'architectural'
    ? ['project-1.jpg', 'project-2.jpg', 'project-3.jpg', 'hero-bg.jpg']
    : ['hero.jpg', 'workshop.jpg', 'hero.jpg', 'workshop.jpg'];
  const heroImg = archetype === 'architectural' ? 'hero-bg.jpg' : 'hero.jpg';
  const img1 = realPhotoFiles[0] || content.imagensServicos[0] || defaultImgs[0];
  const img2 = realPhotoFiles[1] || content.imagensServicos[1] || defaultImgs[1];
  const img3 = realPhotoFiles[2] || content.imagensServicos[2] || defaultImgs[2];
  const img4 = realPhotoFiles[3] || content.imagensServicos[3] || defaultImgs[3];

  // 3. Substituir tags de placeholder
  const replacements = {
    '{{NOME_DA_EMPRESA}}': cleanCompanyName,
    '{{INICIAL_EMPRESA}}': cleanCompanyName.charAt(0).toUpperCase(),
    '{{ANO_ATUAL}}': new Date().getFullYear().toString(),
    '{{IMG_HERO}}': heroImg,
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
    '{{NOME_SERVICO_1}}': content.servicos[0]?.nome || 'Atendimento Especializado',
    '{{DESCRICAO_SERVICO_1}}': content.servicos[0]?.desc || 'Execução técnica de alto padrão.',
    '{{IMG_SERVICO_1}}': img1,
    '{{NOME_SERVICO_2}}': content.servicos[1]?.nome || 'Projetos e Soluções',
    '{{DESCRICAO_SERVICO_2}}': content.servicos[1]?.desc || 'Dimensionamento preciso e pontualidade.',
    '{{IMG_SERVICO_2}}': img2,
    '{{NOME_SERVICO_3}}': content.servicos[2]?.nome || 'Acompanhamento Técnico',
    '{{DESCRICAO_SERVICO_3}}': content.servicos[2]?.desc || 'Supervisão contínua em cada etapa.',
    '{{IMG_SERVICO_3}}': img3,
    '{{NOME_SERVICO_4}}': content.servicos[3]?.nome || 'Regularização & Suporte',
    '{{DESCRICAO_SERVICO_4}}': content.servicos[3]?.desc || 'Aprovações e suporte com conformidade total.',
    '{{IMG_SERVICO_4}}': img4,

    '{{SLOGAN_CURTO}}': content.slogan,
    '{{TITULO_DIFERENCIAIS_LINHA_1}}': 'Por que confiar',
    '{{TITULO_DIFERENCIAIS_LINHA_2}}': 'no nosso trabalho?',
    '{{SUBTEXTO_DE_AUTORIDADE_E_CONFIANCA}}': `Transparência, seriedade e dedicação em cada atendimento prestado em ${cidade}.`,
    '{{TITULO_DIFERENCIAL_1}}': content.diferenciais[0]?.titulo || 'Excelência & Rigor Técnico',
    '{{DESCRICAO_DIFERENCIAL_1}}': content.diferenciais[0]?.desc || 'Compromisso com os mais altos padrões de qualidade e conformidade.',
    '{{TITULO_DIFERENCIAL_2}}': content.diferenciais[1]?.titulo || 'Economia Inteligente',
    '{{DESCRICAO_DIFERENCIAL_2}}': content.diferenciais[1]?.desc || 'Planejamento minucioso que evita desperdícios.',
    '{{TITULO_DIFERENCIAL_3}}': content.diferenciais[2]?.titulo || 'Pontualidade Rigorosa',
    '{{DESCRICAO_DIFERENCIAL_3}}': content.diferenciais[2]?.desc || 'Cronograma transparente do início ao fim.',

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

  // Injeção contextual de banco de imagens para os arquétipos
  if (archetype === 'architectural') {
    const archImgDir = path.join(TEMPLATES_ROOT, 'assets', 'architectural');
    if (fs.existsSync(archImgDir)) {
      copyDirSync(archImgDir, targetImgDir);
      console.log(`📸 [Generator] Imagens contextuais de ARQUITETURA & ESTRUTURAS injetadas com sucesso em: ${targetImgDir}`);
    }
  } else if (archetype === 'industrial') {
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

  if (archetype === 'architectural') {
    gradStart = '#c5a880'; // Architectural Sand & Bronze
    gradEnd = '#8a6d45';
    accent = '#e2c399';
  } else if (archetype === 'care') {
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
  parseRatingData,
  cleanCompanyNameSmart
};
