const fs = require('fs');
const path = require('path');
const db = require('./db');

const updates = [
  {
    match: 'odontofranca',
    data: {
      nome: 'Clínica Odontofranca - Odontologia e Estética',
      status: 'oportunidade_quente',
      instagram: 'https://www.instagram.com/clinicaodontofranca/',
      facebook: 'https://www.facebook.com/odontofranca.clinica/',
      whatsappPrincipal: '5516999986906',
      whatsappFormatado: '(16) 99986-7378',
      telefones: ['(16) 99986-7378', '(16) 3724-4892'],
      siteStatus: 'nenhum',
      siteHealthReason: 'Não possui site próprio de conversão cadastrado no Google Maps',
      analiseIA: 'Alta reputação no Google sem site próprio. Excelente oportunidade para criar página mobile rápida conectando direto ao WhatsApp.',
      dadosEnriquecidos: {
        instagram: 'https://www.instagram.com/clinicaodontofranca/',
        facebook: 'https://www.facebook.com/odontofranca.clinica/',
        whatsapp: '(16) 99986-7378',
        servicos: ['Odontologia Clínica', 'Clareamento Dental', 'Ortodontia', 'Próteses Dentárias', 'Prevenção e Profilaxia'],
        diferenciais: ['Atendimento humanizado', 'Ambiente moderno no centro de Franca', 'Agendamento rápido']
      }
    }
  },
  {
    match: 'Sano Clinic',
    data: {
      nome: 'Sano Clinic Odonto Prime - Estética e Reabilitação Oral',
      status: 'oportunidade_quente',
      instagram: 'https://www.instagram.com/sanoclinicodonto/',
      facebook: 'https://www.facebook.com/p/Sano-Clinic-Odonto-100063901413813/',
      siteOriginal: 'https://sanoclinicodonto.com.br/',
      siteStatus: 'online',
      siteHealthReason: 'Site oficial ativo em HTTP, oportunidade de redesign mobile de alta conversão',
      whatsappPrincipal: '5516996065790',
      whatsappFormatado: '(16) 99606-5790',
      telefones: ['(16) 99606-5790', '(16) 99631-9991', '(16) 3432-3010'],
      analiseIA: 'Clínica odontológica prime multiespecialidades. O site atual possui design antigo; oportunidade de modernização Subzero focando em conversão mobile.',
      dadosEnriquecidos: {
        instagram: 'https://www.instagram.com/sanoclinicodonto/',
        facebook: 'https://www.facebook.com/p/Sano-Clinic-Odonto-100063901413813/',
        whatsapp: '(16) 99606-5790',
        site: 'https://sanoclinicodonto.com.br/',
        servicos: ['Implantes Dentários', 'Prótese Fixa e Móvel', 'Ortodontia e Alinhadores', 'Endodontia (Canal)', 'Cirurgias Avançadas', 'Estética Dental'],
        diferenciais: ['Todas as especialidades em um só lugar', 'Equipe multidisciplinar', 'Estrutura completa na Rua Francisco Jorge']
      }
    }
  },
  {
    match: 'Roberta David',
    data: {
      nome: 'Dra. Roberta David - Cirurgiã Dentista & Emergência Odontológica',
      status: 'oportunidade_quente',
      whatsappPrincipal: '5516988358830',
      whatsappFormatado: '(16) 98835-8830',
      telefones: ['(16) 98835-8830', '(16) 99159-3840'],
      siteStatus: 'nenhum',
      siteHealthReason: 'Sem site cadastrado no Google Maps',
      analiseIA: '🚨 GATILHO COMERCIAL DE ALTA CONVERSÃO: O nicho de emergência odontológica exige ação imediata. Paciente com dor precisa de botão de WhatsApp imediato. Landing page focada em urgência trará retorno imediato.',
      dadosEnriquecidos: {
        whatsapp: '(16) 98835-8830',
        servicos: ['Emergências Odontológicas', 'Alívio Imediato de Dor de Dente', 'Extrações Emergenciais', 'Tratamento de Canal Urgente', 'Traumatismos Dentários'],
        diferenciais: ['Atendimento rápido para alívio imediato da dor', 'Localização central em Franca', 'Atendimento com hora marcada e emergência']
      }
    }
  },
  {
    match: 'Maxsorriso',
    data: {
      nome: 'Maxsorriso Implantes Dentários & Reabilitação Oral',
      status: 'oportunidade_quente',
      instagram: 'https://www.instagram.com/maxsorrisoimplantes/',
      facebook: 'https://www.facebook.com/maxsorrisoimplantes',
      siteOriginal: 'https://maxsorrisoclinicas.com.br',
      siteStatus: 'online',
      whatsappPrincipal: '5516981470693',
      whatsappFormatado: '(16) 98147-0693',
      telefones: ['(16) 98147-0693', '(16) 3409-4996'],
      analiseIA: 'Clínica especializada em implantes e protocolos com alta demanda em Franca. Oportunidade de protótipo de alta conversão para os plantões de implante.',
      dadosEnriquecidos: {
        instagram: 'https://www.instagram.com/maxsorrisoimplantes/',
        facebook: 'https://www.facebook.com/maxsorrisoimplantes',
        whatsapp: '(16) 98147-0693',
        site: 'https://maxsorrisoclinicas.com.br',
        responsavel: 'Dra. Renata Araújo Mendes (CRO/SP 103710)',
        servicos: ['Implantes Dentários', 'Prótese Protocolo All-on-4', 'Lentes de Contato Dental', 'Clareamento a Laser', 'Reabilitação Oral Completa'],
        diferenciais: ['Plantões especiais de implantes', 'Tecnologia digital de ponta', 'Condições facilitadas de pagamento']
      }
    }
  },
  {
    match: 'OralBellus',
    data: {
      nome: 'OralBellus Clínica de Odontologia & Implantes',
      status: 'oportunidade_quente',
      facebook: 'https://www.facebook.com/oralbellus/',
      siteOriginal: 'http://www.oralbellus.com.br/',
      siteStatus: 'inacessivel',
      siteHealthReason: '🚨 Site oficial cadastrado no Maps está FORA DO AR (falha de conexão)',
      whatsappPrincipal: '5516991739805',
      whatsappFormatado: '(16) 99173-9805',
      telefones: ['(16) 99173-9805', '(16) 3723-5218', '(16) 3706-8604'],
      analiseIA: '🚨 GATILHO DE OURO: O site oficial da clínica cadastrado no Google está FORA DO AR. A clínica está perdendo pacientes que buscam próteses e implantes no centro de Franca.',
      dadosEnriquecidos: {
        facebook: 'https://www.facebook.com/oralbellus/',
        whatsapp: '(16) 99173-9805',
        endereco: 'Rua Monsenhor Rosa, 2087, Centro – Franca/SP',
        servicos: ['Prótese Protocolo sobre 4 Implantes', 'Implantes Dentários Unitários e Múltiplos', 'Estética do Sorriso', 'Aparelhos Ortodônticos', 'Próteses Dentárias'],
        diferenciais: ['Especialistas em prótese protocolo fixa', 'Localização privilegiada no centro', 'Atendimento humanizado']
      }
    }
  },
  {
    match: 'Liares',
    data: {
      nome: 'Instituto Liares - Odontologia e Plantão 24 Horas',
      status: 'oportunidade_quente',
      instagram: 'https://www.instagram.com/instituto.liares/',
      facebook: 'https://www.facebook.com/instituto.liares/',
      siteOriginal: 'http://www.institutoliares.com.br/',
      siteStatus: 'inacessivel',
      siteHealthReason: '🚨 Site oficial cadastrado no Maps retornando Erro 404',
      whatsappPrincipal: '5516992793838',
      whatsappFormatado: '(16) 99279-3838',
      telefones: ['(16) 99279-3838'],
      analiseIA: '🚨 GATILHO DE OURO: Clínica 24h com site oficial fora do ar (404)! Em emergências odontológicas de madrugada, o paciente clica no site para chamar no WhatsApp e encontra página quebrada.',
      dadosEnriquecidos: {
        instagram: 'https://www.instagram.com/instituto.liares/',
        facebook: 'https://www.facebook.com/instituto.liares/',
        whatsapp: '(16) 99279-3838',
        endereco: 'Rua Campos Sales, 2134, Centro, Franca - SP',
        responsavel: 'Dr. Phillype de Lima Moreira (CRO-SP 138639)',
        servicos: ['Plantão Odontológico 24 Horas', 'Urgência e Emergência Odontológica', 'Cirurgias Bucomaxilofaciais', 'Tratamento de Canal de Urgência', 'Clínica Geral'],
        diferenciais: ['Atendimento 24 horas todos os dias', 'Especialista de plantão', 'Localização central de fácil acesso']
      }
    }
  },
  {
    match: 'Dentistas de Todos',
    data: {
      nome: 'Clínica Dentistas de Todos - AmorSaúde Franca',
      status: 'oportunidade_quente',
      whatsappPrincipal: '551631116523',
      whatsappFormatado: '(16) 3111-6523',
      telefones: ['(16) 3111-6523'],
      siteStatus: 'nenhum',
      siteHealthReason: 'Sem site individualizado em Franca',
      analiseIA: 'Clínica odontológica popular de alto volume de consultas. Falta landing page local rápida para agendamentos particulares.',
      dadosEnriquecidos: {
        whatsapp: '(16) 3111-6523',
        servicos: ['Ortodontia e Manutenção de Aparelho', 'Limpeza e Raspagem Dental', 'Restaurações Estéticas', 'Extrações', 'Próteses Dentárias'],
        diferenciais: ['Valores acessíveis para a população', 'Diversas especialidades', 'Localização central']
      }
    }
  },
  {
    match: 'DL ODONTOLOGIA',
    data: {
      nome: 'DL Odontologia Clínica & Harmonização Orofacial',
      status: 'oportunidade_quente',
      instagram: 'https://www.instagram.com/dlodontologiafranca/',
      facebook: 'https://www.facebook.com/people/DL-Odontologia-Franca/61556608560384/',
      siteOriginal: 'https://dlodontologiafranca.com.br/',
      siteStatus: 'inacessivel',
      siteHealthReason: '🚨 Link do Maps (/estetica-facial) quebrado com Erro 404',
      whatsappPrincipal: '5516991756434',
      whatsappFormatado: '(16) 99175-6434',
      telefones: ['(16) 99175-6434'],
      analiseIA: '🚨 GATILHO COMERCIAL: O link cadastrado no Maps leva para página quebrada (404). Clínica de alta classe especializada em lentes e estética orofacial com excelente visual no Instagram.',
      dadosEnriquecidos: {
        instagram: 'https://www.instagram.com/dlodontologiafranca/',
        facebook: 'https://www.facebook.com/people/DL-Odontologia-Franca/61556608560384/',
        whatsapp: '(16) 99175-6434',
        site: 'https://dlodontologiafranca.com.br/',
        socias: 'Larissa Govoni Silva e Patricia de Lima',
        servicos: ['Harmonização Orofacial', 'Lentes em Resina Composta e Porcelana', 'Facetas Dentárias', 'Implantes Dentários', 'Clareamento Dental a Laser'],
        diferenciais: ['Design de sorriso personalizado', 'Técnicas avançadas de estética facial', 'Ambiente sofisticado e acolhedor']
      }
    }
  },
  {
    match: 'Silveira Odontológica',
    data: {
      nome: 'Silveira Odontologia - Especialistas em Implantes e Protocolos',
      status: 'oportunidade_quente',
      motivoDescarte: null,
      instagram: 'https://www.instagram.com/odontologiasilveira/',
      facebook: 'https://www.facebook.com/silveiraodontologia',
      siteOriginal: 'https://silveiraodontologia.com/',
      siteStatus: 'online',
      whatsappPrincipal: '5516999133292',
      whatsappFormatado: '(16) 99913-3292',
      telefones: ['(16) 99913-3292', '(16) 99376-7908'],
      analiseIA: '💡 REQUALIFICADO COM DADOS RICOS EXTRAÍDOS DO SITE: 30+ anos de tradição, carga imediata (sorriso em até 72h), scanner 3D e sedação consciente. Excelente oportunidade para protótipo de alta conversão.',
      dadosEnriquecidos: {
        instagram: 'https://www.instagram.com/odontologiasilveira/',
        facebook: 'https://www.facebook.com/silveiraodontologia',
        whatsapp: '(16) 99913-3292',
        site: 'https://silveiraodontologia.com/',
        endereco: 'Rua Marechal Deodoro, 1940, Centro, Franca/SP',
        servicos: ['Implantes Dentários', 'Prótese Protocolo', 'Cirurgia Ortognática e Bucomaxilo', 'Ortodontia', 'Lentes de Contato Dental'],
        diferenciais: ['Técnica de Carga Imediata (Sorriso em até 72h)', 'Planejamento Digital e Scanner 3D', 'Sedação Consciente (Sem Dor)', 'Laserterapia Pós-operatória', 'Mais de 30 anos de tradição']
      }
    }
  },
  {
    match: 'Sorria Já',
    data: {
      nome: 'Clínica Sorria Já - Odontologia & Implantes 3D',
      status: 'oportunidade_quente',
      motivoDescarte: null,
      siteOriginal: 'https://clinicasorriaja.com.br/',
      siteStatus: 'online',
      whatsappPrincipal: '5516993265002',
      whatsappFormatado: '(16) 99326-5002',
      telefones: ['(16) 99326-5002'],
      analiseIA: '💡 REQUALIFICADO COM DADOS DO SITE: Clínica liderada pelo Dr. Ivan Ferreira (implantodontia 3D). Dados extraídos do site oficial prontos para gerar protótipo de alta performance.',
      dadosEnriquecidos: {
        whatsapp: '(16) 99326-5002',
        site: 'https://clinicasorriaja.com.br/',
        endereco: 'Rua Monsenhor Rosa, 2162, Centro, Franca - SP',
        responsavel: 'Dr. Ivan Ferreira (Especialista em Implantodontia)',
        servicos: ['Implantes Dentários', 'Próteses Sobre Implante', 'Protocolos All-on-4 e All-on-6', 'Próteses Móveis', 'Planejamento Digital 3D'],
        diferenciais: ['Cirurgias guiadas por computador', 'Protocolos rápidos', 'Equipe altamente especializada']
      }
    }
  },
  {
    match: 'DentFran',
    data: {
      nome: 'Clínica Odontológica Dent Fran',
      status: 'oportunidade_quente',
      motivoDescarte: null,
      facebook: 'https://www.facebook.com/clinicaodontologicadentfran',
      siteStatus: 'apenas_social',
      siteHealthReason: 'Possuía apenas link Bitly encurtador no Google Maps',
      whatsappPrincipal: '5516992397028',
      whatsappFormatado: '(16) 99239-7028',
      telefones: ['(16) 99239-7028', '(16) 3723-0100', '(16) 99223-0257'],
      analiseIA: '💡 REQUALIFICADO: Não possui site institucional próprio (apenas Bitly e redes sociais). Duas unidades ativas em Franca (Leporace e Aeroporto). Oportunidade perfeita de site unificado.',
      dadosEnriquecidos: {
        facebook: 'https://www.facebook.com/clinicaodontologicadentfran',
        whatsapp: '(16) 99239-7028',
        unidades: ['Unidade Leporace: Av. Abraão Brickmann, 1521', 'Unidade Aeroporto: Av. Carlos Roberto Haddad, 409'],
        servicos: ['Implantes Dentários', 'Aparelhos Ortodônticos', 'Estética Dental', 'Clínica Geral e Limpeza'],
        diferenciais: ['Duas unidades estratégicas em Franca', 'Atendimento familiar e acessível', 'Condições facilitadas']
      }
    }
  },
  {
    match: 'Blitz Segurança',
    data: {
      instagram: 'https://www.instagram.com/blitzsegurancaeletronica/',
      facebook: 'https://www.facebook.com/blitzsegurancaeletronica/',
      emails: ['contato@blitzsegbrasil.com.br'],
      dadosEnriquecidos: {
        instagram: 'https://www.instagram.com/blitzsegurancaeletronica/',
        facebook: 'https://www.facebook.com/blitzsegurancaeletronica/',
        whatsapp: '(16) 99397-4382',
        email: 'contato@blitzsegbrasil.com.br',
        servicos: ['Cercas Elétricas e Concertinas', 'CFTV e Câmeras HD / Noturnas', 'Sistemas de Alarme e Sensores', 'Motores de Portão Automático', 'Vídeo Porteiro e Interfonia'],
        diferenciais: ['Atendimento rápido em toda Franca e região', 'Instalação padrão industrial e residencial', 'Equipamentos homologados Intelbras e JFL']
      }
    }
  },
  {
    match: 'Coltseg',
    data: {
      instagram: 'https://www.instagram.com/coltseg/',
      facebook: 'https://www.facebook.com/61555258761464/',
      telefones: ['(16) 99998-6906'],
      whatsappPrincipal: '5516999986906',
      whatsappFormatado: '(16) 99998-6906',
      dadosEnriquecidos: {
        instagram: 'https://www.instagram.com/coltseg/',
        facebook: 'https://www.facebook.com/61555258761464/',
        whatsapp: '(16) 99998-6906',
        servicos: ['Câmeras de Segurança e Monitoramento', 'Cercas Elétricas de Alta Voltagem', 'Alarmes Residenciais e Comerciais', 'Motores para Portão Deslizante e Basculante', 'Interfonia'],
        diferenciais: ['Nota 5.0 no Google Maps', 'Técnicos especializados com garantia', 'Suporte pós-instalação']
      }
    }
  }
];

const leads = db.getAll();
let updatedCount = 0;

updates.forEach(u => {
  const lead = leads.find(l => l.nome && l.nome.toLowerCase().includes(u.match.toLowerCase()));
  if (lead) {
    db.update(lead.id, u.data);
    updatedCount++;
    console.log(`✅ Lead atualizado com dados ricos: ${lead.nome}`);
  } else {
    console.log(`⚠️ Lead não localizado para match: "${u.match}"`);
  }
});

console.log(`\n🎉 Total de leads renovados e enriquecidos: ${updatedCount}`);
console.log('Estatísticas atuais do banco:', db.getStats());
