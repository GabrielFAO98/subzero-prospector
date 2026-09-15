const { program } = require('commander');
const { searchLeadsGoogleMaps, enrichLead, saveLeadsToFile, loadLeadsFromFile } = require('./scraper');
const { generatePrototype, generateOutreachMessages } = require('./generator');
const { exec } = require('child_process');

program
  .name('prospector')
  .description('Sistema Autônomo de Prospecção e Geração de Protótipos Subzero Engine em Franca/SP')
  .version('1.0.0');

// Comando: listar leads salvos
program
  .command('list')
  .description('Lista todos os leads salvos na base local')
  .action(() => {
    const leads = loadLeadsFromFile();
    if (leads.length === 0) {
      console.log('Nenhum lead salvo ainda. Use: node src/cli.js pipeline "nicho"');
      return;
    }
    console.log(`\n📋 Base de Leads (${leads.length} encontrados):`);
    leads.forEach((l, idx) => {
      console.log(`\n[#${idx + 1}] ${l.nome} (${l.nicho})`);
      console.log(`    WhatsApp: ${l.whatsappFormatado || l.telefones[0] || 'N/A'}`);
      console.log(`    E-mail:   ${l.emails.join(', ') || 'N/A'}`);
      console.log(`    Instagram: ${l.instagram || 'N/A'}`);
      console.log(`    Status:   ${l.status}`);
      if (l.prototypePath) {
        console.log(`    Protótipo: ${l.prototypePath}`);
      }
    });
  });

// Comando: pipeline completo de ponta a ponta
program
  .command('pipeline <nicho>')
  .option('-c, --city <cidade>', 'Cidade para prospecção', 'Franca SP')
  .option('-l, --limit <limite>', 'Quantidade de empresas para prototipar', '3')
  .description('Executa o pipeline completo: Minera leads, enriquece dados, gera protótipos e mensagens de abordagem')
  .action(async (nicho, options) => {
    const city = options.city;
    const limit = parseInt(options.limit, 10);

    console.log(`\n======================================================`);
    console.log(`🚀 INICIANDO PIPELINE SUBZERO: "${nicho}" em ${city}`);
    console.log(`======================================================`);

    // 1. Mineração Google Maps
    const foundLeads = await searchLeadsGoogleMaps(nicho, city, 15);
    if (foundLeads.length === 0) {
      console.log('Nenhum lead identificado no Google Maps.');
      return;
    }

    // Priorizar quem NÃO TEM SITE próprio
    const hotLeads = foundLeads.filter(l => !l.temSiteProprio);
    console.log(`🔥 ${hotLeads.length} empresas SEM SITE próprio encontradas com alta reputação.`);

    const targetList = (hotLeads.length > 0 ? hotLeads : foundLeads).slice(0, limit);
    const completedLeads = [];

    for (let i = 0; i < targetList.length; i++) {
      let lead = targetList[i];
      console.log(`\n------------------------------------------------------`);
      console.log(`[Lead ${i + 1}/${targetList.length}] Processando: ${lead.nome}`);
      console.log(`------------------------------------------------------`);

      // 2. Enriquecimento Autônomo
      lead = await enrichLead(lead);

      // 3. Geração de Protótipo Subzero
      lead = await generatePrototype(lead);

      // 4. Geração das Mensagens Comerciais
      const messages = generateOutreachMessages(lead);
      lead.messages = messages;
      completedLeads.push(lead);

      console.log(`\n💬 MENSAGEM DE WHATSAPP GERADA:`);
      console.log(`----------------------------------------`);
      console.log(messages.whatsapp);
      console.log(`----------------------------------------`);
    }

    // Salva tudo no banco de leads local
    saveLeadsToFile(completedLeads);

    console.log(`\n======================================================`);
    console.log(`🎉 PIPELINE CONCLUÍDO COM SUCESSO!`);
    console.log(`Total de ${completedLeads.length} protótipos gerados e prontos.`);
    console.log(`Para abrir um protótipo no navegador, use:`);
    console.log(`node src/cli.js open "${completedLeads[0].slug}"`);
    console.log(`======================================================\n`);
  });

// Comando: abrir protótipo no navegador
program
  .command('open <slugOrIndex>')
  .description('Abre o protótipo gerado no navegador')
  .action((identifier) => {
    const leads = loadLeadsFromFile();
    let lead = null;

    if (!isNaN(parseInt(identifier, 10))) {
      const idx = parseInt(identifier, 10) - 1;
      lead = leads[idx];
    } else {
      lead = leads.find(l => l.slug.includes(identifier.toLowerCase()));
    }

    if (!lead || !lead.prototypePath) {
      console.log('Protótipo não encontrado para este identificador.');
      return;
    }

    console.log(`Abrindo protótipo de "${lead.nome}" no navegador...`);
    exec(`start "" "${lead.prototypePath}"`);
  });

// Comando: exibir mensagem de abordagem
program
  .command('message <slugOrIndex>')
  .description('Exibe a mensagem pronta de WhatsApp e E-mail para o lead')
  .action((identifier) => {
    const leads = loadLeadsFromFile();
    let lead = null;

    if (!isNaN(parseInt(identifier, 10))) {
      const idx = parseInt(identifier, 10) - 1;
      lead = leads[idx];
    } else {
      lead = leads.find(l => l.slug.includes(identifier.toLowerCase()));
    }

    if (!lead || !lead.messages) {
      console.log('Mensagens não encontradas para este lead.');
      return;
    }

    console.log(`\n======================================================`);
    console.log(`📱 MENSAGEM DE WHATSAPP PRONTA: ${lead.nome}`);
    console.log(`======================================================`);
    console.log(lead.messages.whatsapp);
    console.log(`\n======================================================`);
    console.log(`📧 MENSAGEM DE E-MAIL PRONTA:`);
    console.log(`Assunto: ${lead.messages.email.assunto}`);
    console.log(`------------------------------------------------------`);
    console.log(lead.messages.email.corpo);
    console.log(`======================================================\n`);
  });

program.parse(process.argv);

