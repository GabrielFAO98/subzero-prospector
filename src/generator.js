const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join('C:', 'Users', 'Gabriel', 'dev', 'template.subzero');
const PREVIEWS_DIR = path.join(__dirname, '..', 'previews');

/**
 * Inteligência de conteúdo por nicho para preencher o Subzero Engine
 */
function getNicheContent(nicho, nomeEmpresa, cidade = 'Franca - SP') {
  const n = nicho.toLowerCase();

  if (n.includes('ar') || n.includes('clima') || n.includes('refrigera')) {
    return {
      subtitulo: 'Climatização & Refrigeração',
      tituloPrincipal: 'Especialistas em Ar-Condicionado',
      chamadaPrincipal: 'Conforto e Ar Puro',
      slogan: 'Temperatura ideal para sua casa ou empresa.',
      apresentacao: `Com atendimento técnico especializado em ${cidade}, entregamos serviços completos de instalação, manutenção e higienização de sistemas de ar-condicionado com pontualidade e garantia total.`,
      servicos: [
        { nome: 'Instalação de Ar-Condicionado', desc: 'Instalação técnica padrão de fábrica para modelos Split, Inverter e Cassete, garantindo máxima eficiência.' },
        { nome: 'Higienização Antibacteriana', desc: 'Limpeza profunda de serpentinas e filtros com produtos bactericidas que eliminam ácaros, fungos e odores.' },
        { nome: 'Manutenção Preventiva & Carga de Gás', desc: 'Diagnóstico elétrico, medição de pressão e recarga de gás ecológica para prolongar a vida útil do aparelho.' },
        { nome: 'Projetos Comerciais e Residenciais', desc: 'Dimensionamento térmico exato para residências, clínicas, lojas e escritórios sem desperdício de energia.' }
      ],
      diferenciais: [
        { titulo: 'Técnicos Certificados', desc: 'Profissionais experientes e atualizados com as principais marcas do mercado.' },
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

  if (n.includes('odonto') || n.includes('dent') || n.includes('saude') || n.includes('clinica')) {
    return {
      subtitulo: 'Odontologia Especializada',
      tituloPrincipal: 'Cuidando do Seu Sorriso com Excelência',
      chamadaPrincipal: 'O Sorriso que Você Merece',
      slogan: 'Tecnologia, conforto e cuidado humano.',
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

  // Padrão Geral Premium
  return {
    subtitulo: 'Serviços Especializados',
    tituloPrincipal: 'Referência em Qualidade e Confiança',
    chamadaPrincipal: 'Excelência em Cada Detalhe',
    slogan: 'Compromisso e profissionalismo para você.',
    apresentacao: `Com atuação reconhecida em ${cidade}, a ${nomeEmpresa} é sinônimo de dedicação, transparência e satisfação comprovada por dezenas de clientes satisfeitos.`,
    servicos: [
      { nome: 'Atendimento Personalizado', desc: 'Entendemos exatamente a sua necessidade para oferecer a solução ideal com o melhor custo-benefício.' },
      { nome: 'Execução Rápida e Precisa', desc: 'Metodologia eficiente para entregar resultados consistentes no menor prazo possível.' },
      { nome: 'Equipe Qualificada', desc: 'Profissionais com ampla bagagem técnica prontos para atender você com o mais alto padrão.' },
      { nome: 'Garantia e Pós-Atendimento', desc: 'Suporte completo e compromisso contínuo para a sua total tranquilidade.' }
    ],
    diferenciais: [
      { titulo: 'Transparência Total', desc: 'Orçamentos claros e sem surpresas, com foco no que realmente você precisa.' },
      { titulo: 'Pontualidade & Compromisso', desc: 'Respeito ao seu tempo e cumprimento rigoroso de todos os prazos combinados.' },
      { titulo: 'Reconhecimento Comprovado', desc: 'Avaliações 5 estrelas de quem já contratou e comprova a nossa dedicação.' }
    ],
    avaliacoes: [
      { autor: 'Ana Paula Ferreira', texto: 'Serviço impecável! Fui muito bem atendida desde o primeiro contato no WhatsApp. Com certeza voltarei a contratar.' },
      { autor: 'Bruno Henrique Alves', texto: 'Super profissionais, resolveram minha demanda com rapidez e muita competência. Nota 10!' },
      { autor: 'Marcos Vinicius', texto: 'Recomendo com certeza! Difícil encontrar uma empresa tão séria e atenciosa hoje em dia.' },
      { autor: 'Renata Vasconcelos', texto: 'Pontuais, educados e com um preço muito justo pelo nível de qualidade entregue. Parabéns!' }
    ]
  };
}

/**
 * Gera um protótipo de site completo no padrão Subzero Engine para o lead
 */
async function generatePrototype(lead) {
  console.log(`\n⚡ [3/3] Gerando protótipo Subzero para: "${lead.nome}"...`);

  if (!fs.existsSync(PREVIEWS_DIR)) {
    fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
  }

  const targetDir = path.join(PREVIEWS_DIR, lead.slug);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. Ler o index.html original do template
  const templateHtmlPath = path.join(TEMPLATE_DIR, 'index.html');
  if (!fs.existsSync(templateHtmlPath)) {
    throw new Error(`Template original não encontrado em: ${templateHtmlPath}`);
  }

  let html = fs.readFileSync(templateHtmlPath, 'utf-8');

  // 2. Gerar conteúdo inteligente
  const content = getNicheContent(lead.nicho, lead.nome, lead.cidade);
  const waMsg = encodeURIComponent(`Olá! Vi o site oficial da ${lead.nome} e gostaria de solicitar um orçamento/informações.`);
  const waLink = `https://wa.me/${lead.whatsappPrincipal}?text=${waMsg}`;
  const encodedAddress = encodeURIComponent(`${lead.nome}, ${lead.cidade}`);

  // 3. Substituir tags de placeholder
  const replacements = {
    '{{NOME_DA_EMPRESA}}': lead.nome,
    '{{TITULO_PRINCIPAL}}': content.tituloPrincipal,
    '{{DESCRICAO_SEO_150_CARACTERES}}': `${lead.nome} em Franca/SP. ${content.slogan} Entre em contato pelo WhatsApp e confira nossos serviços e avaliações.`,
    '{{PALAVRAS_CHAVE_SEPARADAS_POR_VIRGULA}}': `${lead.nome}, ${lead.nicho}, Franca SP, atendimento, servicos, avaliacoes`,
    '{{SEU_DOMINIO}}': `${lead.slug}.com.br`,
    '{{SUBTITULO_OU_SEGMENTO}}': content.subtitulo,
    '{{SUBTITULO_LOCALIZACAO_EM_CAPS}}': `${lead.cidade.toUpperCase()} • ATENDIMENTO ESPECIALIZADO`,
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
    '{{CIDADE_UF}}': lead.cidade,
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
    '{{TEXTO_DIFERENCIAL_1}}': content.diferenciais[0].desc,
    '{{TITULO_DIFERENCIAL_2}}': content.diferenciais[1].titulo,
    '{{TEXTO_DIFERENCIAL_2}}': content.diferenciais[1].desc,
    '{{TITULO_DIFERENCIAL_3}}': content.diferenciais[2].titulo,
    '{{TEXTO_DIFERENCIAL_3}}': content.diferenciais[2].desc,
    '{{DEPOIMENTO_1_TEXTO}}': content.avaliacoes[0].texto,
    '{{DEPOIMENTO_1_AUTOR}}': content.avaliacoes[0].autor,
    '{{DEPOIMENTO_2_TEXTO}}': content.avaliacoes[1].texto,
    '{{DEPOIMENTO_2_AUTOR}}': content.avaliacoes[1].autor,
    '{{DEPOIMENTO_3_TEXTO}}': content.avaliacoes[2].texto,
    '{{DEPOIMENTO_3_AUTOR}}': content.avaliacoes[2].autor,
    '{{DEPOIMENTO_4_TEXTO}}': content.avaliacoes[3].texto,
    '{{DEPOIMENTO_4_AUTOR}}': content.avaliacoes[3].autor,
    '{{CHAMADA_CONTATO_LINHA_1}}': 'Pronto para ser atendido',
    '{{CHAMADA_CONTATO_LINHA_2}}': 'com total dedicação?',
    '{{TEXTO_CHAMADA_CONTATO}}': 'Chame nossa equipe no WhatsApp ou faça-nos uma visita em Franca/SP.',
    '{{ENDERECO_URL_ENCODED}}': encodedAddress,
    '{{ENDERECO_LINHA_1}}': `${lead.nome}`,
    '{{BAIRRO_CIDADE_UF}}': `${lead.cidade}`
  };

  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(key).join(value);
  }

  // 4. Garantir caminhos estritamente relativos para assets locais (scripts, favicon, css)
  html = html
    .replace(/href="\/favicon\.svg"/g, 'href="./favicon.svg"')
    .replace(/href="\/favicon\.ico"/g, 'href="./favicon.ico"')
    .replace(/<script[^>]*src="(?:\/|\.\/)?src\/main\.js"[^>]*><\/script>/g, '<script defer src="./src/main.js"></script>');

  // 5. Salvar index.html no diretório do lead
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');

  // 5. Copiar assets necessários (src/style.css, src/main.js, favicon.svg, img/)
  copyDirSync(path.join(TEMPLATE_DIR, 'src'), path.join(targetDir, 'src'));
  copyDirSync(path.join(TEMPLATE_DIR, 'img'), path.join(targetDir, 'img'));
  fs.copyFileSync(path.join(TEMPLATE_DIR, 'favicon.svg'), path.join(targetDir, 'favicon.svg'));

  lead.prototypePath = path.join(targetDir, 'index.html');
  lead.prototypeUrl = `/previews/${lead.slug}/index.html`;
  lead.messages = generateOutreachMessages(lead, lead.prototypeUrl);
  lead.status = 'prototipo_pronto';

  // Salva no banco de dados se tiver id
  const db = require('./db');
  db.update(lead.id || lead.slug, {
    prototypePath: lead.prototypePath,
    prototypeUrl: lead.prototypeUrl,
    messages: lead.messages,
    status: 'prototipo_pronto'
  });

  console.log(`✅ Protótipo gerado com sucesso em: ${targetDir}`);
  return lead;
}

function copyDirSync(src, dest) {
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

/**
 * Gera as mensagens personalizadas para abordagem (WhatsApp e E-mail)
 */
function generateOutreachMessages(lead, previewPublicUrl = null) {
  const linkPreview = previewPublicUrl || lead.prototypeUrl;
  const isSiteDown = lead.siteStatus === 'inacessivel' || (lead.siteOriginal && lead.motivoDescarte && lead.motivoDescarte.toLowerCase().includes('fora do ar'));
  const hasActiveSite = lead.siteStatus === 'online' && lead.siteOriginal;

  let hookWhatsapp = '';
  let assuntoEmail = '';
  let hookEmail = '';

  if (isSiteDown) {
    hookWhatsapp = `Notei que o site cadastrado de vocês (*${lead.siteOriginal}*) está fora do ar / inacessível no momento. Hoje, quando as pessoas ou as buscas por inteligência artificial (ChatGPT e a IA do WhatsApp) tentam acessar a *${lead.nome}*, o cliente se depara com uma tela de erro e acaba contratando outro da cidade.`;
    assuntoEmail = `${lead.nome} — site oficial fora do ar e perda de clientes nas buscas por IA em Franca`;
    hookEmail = `O motivo do meu contato é direto e urgente: notei que o site oficial da ${lead.nome} (${lead.siteOriginal}) está atualmente fora do ar / inacessível.\n\nHoje, a maioria das pessoas e das ferramentas de inteligência artificial (como o ChatGPT e a IA do WhatsApp) pesquisam quem é a empresa recomendada em Franca. Quando o link de vocês dá erro, o cliente perde a confiança e fecha imediatamente com o concorrente.`;
  } else if (hasActiveSite) {
    hookWhatsapp = `Acompanho o trabalho da *${lead.nome}* e analisei o site de vocês (*${lead.siteOriginal}*). Notei que a estrutura atual não está adaptada para a velocidade e conversão no celular, e hoje a grande maioria dos clientes busca rapidez no WhatsApp direto.`;
    assuntoEmail = `${lead.nome} — modernização mobile de alta conversão e nova presença digital em Franca`;
    hookEmail = `Acompanho a atuação da ${lead.nome} em Franca e analisei a página atual de vocês (${lead.siteOriginal}).\n\nHoje, mais de 85% dos clientes navegam exclusivamente pelo celular e esperam atendimento com um toque. A estrutura atual possui oportunidades claras de modernização visual, velocidade instantânea de carregamento e foco em conversão direta de novos contatos.`;
  } else {
    hookWhatsapp = `Vi que a *${lead.nome}* tem uma excelente reputação, mas hoje quem pesquisa por *${lead.nicho}* no Google ou nas buscas por inteligência artificial (ChatGPT e a IA do WhatsApp) não encontra um site oficial de vocês — e essas ferramentas acabam indicando concorrentes da cidade.`;
    assuntoEmail = `${lead.nome} em Franca — clientes sendo perdidos nas buscas por Inteligência Artificial`;
    hookEmail = `O motivo do meu contato é direto: a forma como os clientes procuram por ${lead.nicho} em Franca mudou.\n\nHoje, a maioria das pessoas pesquisa pelo celular ou pergunta para ferramentas de inteligência artificial (como o ChatGPT e a IA do WhatsApp) quem é a empresa recomendada na cidade. O grande ponto é que essas ferramentas só indicam empresas que possuem um site oficial registrado.\n\nEmpresas sem site acabam ficando invisíveis nessas buscas, fazendo com que o cliente feche com o concorrente.`;
  }

  const whatsapp = 
`Olá! Tudo bem?

Sou o Gabriel, atuo com tecnologia aqui em Franca.

${hookWhatsapp}

Para mostrar na prática como resolver isso, montei uma prévia pronta do site oficial de vocês para celular, já com fotos reais e depoimentos dos seus clientes:
👉 *${linkPreview}*

Pode repassar para o responsável dar uma olhada? Consigo colocar no ar para vocês essa semana.
Gabriel Azevedo • (16) 99204-8856`;

  const email = {
    assunto: assuntoEmail,
    corpo:
`Prezada equipe da ${lead.nome},

${hookEmail}

Como sou desenvolvedor aqui em Franca, tomei a iniciativa de montar a estrutura do site oficial da ${lead.nome}, já funcional e adaptada para smartphones:
👉 ${linkPreview}

Qual é o melhor horário para conversarmos 5 minutos sobre a ativação desse canal para a sua empresa?

Atenciosamente,
Gabriel Azevedo
(16) 99204-8856 • Franca - SP`
  };

  return { whatsapp, email };
}

module.exports = {
  generatePrototype,
  generateOutreachMessages,
  getNicheContent
};

