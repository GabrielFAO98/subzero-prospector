const { deepEnrichLead } = require('../src/deep_extractor');

async function run() {
  console.log('--- Executando Prospecção Profunda para a Gelar Ar Condicionado ---');
  const enrichedLead = await deepEnrichLead('lead_1789434711738_0', msg => console.log('⚡', msg));
  
  console.log('\n=============================================');
  console.log('🎯 RESULTADO DO ENRIQUECIMENTO GELAR:');
  console.log('=============================================');
  console.log('Nome:', enrichedLead.nome);
  console.log('Tempo de Mercado:', enrichedLead.tempoMercado);
  console.log('Bio Instagram:', enrichedLead.instagramProfile ? enrichedLead.instagramProfile.bio : 'N/A');
  console.log('Destaques:', enrichedLead.instagramProfile ? enrichedLead.instagramProfile.destaques : []);
  console.log('Total Posts Analisados:', enrichedLead.postsAnalisados ? enrichedLead.postsAnalisados.length : 0);
  console.log('Marcas Detectadas:', enrichedLead.marcasAtendidas);
  console.log('Serviços Reais Detectados:', enrichedLead.servicosReais);
  console.log('Telefones Totais:', enrichedLead.telefones);
  console.log('Depoimentos Reais:', enrichedLead.depoimentosReais);
  console.log('Fotos Reais:', enrichedLead.fotosReais);
}

run().catch(console.error);

