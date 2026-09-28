const EventEmitter = require('events');
const db = require('./db');
const { enrichLead } = require('./scraper');
const { generatePrototype, generateOutreachMessages } = require('./generator');

class AgentMonitor extends EventEmitter {
  constructor() {
    super();
    this.sseClients = new Set();
    this.state = {
      status: 'idle', // 'idle' | 'running' | 'error'
      statusLabel: 'Agente Ocioso',
      progressPercent: 0,
      currentJobName: 'Aguardando Nova Operação Autônoma',
      currentJobDetail: 'Pronto para minerar e enriquecer empresas de Franca/SP',
      stats: {
        leadsDiscovered: 0,
        prototypesBuilt: 0,
        outreachPrepared: 0
      }
    };
  }

  getState() {
    return { ...this.state };
  }

  addSseClient(res) {
    this.sseClients.add(res);
    // Envia snapshot inicial
    res.write(`data: ${JSON.stringify({ type: 'snapshot', data: this.state })}\n\n`);

    res.on('close', () => {
      this.sseClients.delete(res);
    });
  }

  broadcast(type, data) {
    const payload = `data: ${JSON.stringify({ type, data })}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(payload);
      } catch (_) {
        this.sseClients.delete(client);
      }
    }
  }

  log(tag, msg, type = 'info') {
    const time = new Date().toLocaleTimeString('pt-BR');
    const logItem = { time, tag: `[${tag.toUpperCase()}]`, msg, type };
    this.broadcast('log', logItem);
    console.log(`🤖 [Agente ${tag}] ${msg}`);
  }

  updateState(partial) {
    this.state = { ...this.state, ...partial };
    this.broadcast('update', this.state);
  }

  async runAutonomousJob(leadId) {
    if (this.state.status === 'running') {
      throw new Error('O agente já está executando uma tarefa no momento.');
    }

    const lead = db.getById(leadId);
    if (!lead) {
      throw new Error(`Lead "${leadId}" não encontrado no banco.`);
    }

    this.updateState({
      status: 'running',
      statusLabel: 'Em Operação Autônoma',
      progressPercent: 10,
      currentJobName: `Auditoria: ${lead.nome}`,
      currentJobDetail: 'Iniciando inspeção e enriquecimento de dados...'
    });

    this.log('SISTEMA', `Iniciando rotina autônoma para lead: "${lead.nome}"`);

    try {
      // 1. Enriquecimento
      this.log('ENRIQUECIMENTO', 'Coletando dados cadastrais, redes sociais e inteligência...');
      this.updateState({ progressPercent: 35, currentJobDetail: 'Minerando redes sociais e inteligência comercial' });
      
      const enrichedLead = await enrichLead(lead);
      this.state.stats.leadsDiscovered++;
      this.log('ENRIQUECIMENTO', 'Dados enriquecidos com sucesso!');

      // 2. Geração de Protótipo
      this.updateState({ progressPercent: 65, currentJobDetail: 'Sintetizando layout no Subzero Engine...' });
      this.log('PROTÓTIPO', `Compilando template de alto padrão para "${enrichedLead.nome}"...`);
      
      const prototypeLead = await generatePrototype(enrichedLead);
      this.state.stats.prototypesBuilt++;
      this.log('PROTÓTIPO', `Protótipo gerado com sucesso em: ${prototypeLead.prototypeUrl || prototypeLead.slug}`);

      // 3. Mensagens de Abordagem
      this.updateState({ progressPercent: 85, currentJobDetail: 'Elaborando copywriting de abordagem no WhatsApp...' });
      this.log('COPYWRITING', 'Gerando mensagens personalizadas de alto impacto...');
      
      const messages = generateOutreachMessages(prototypeLead);
      db.update(leadId, { messages, status: 'prototipo_pronto' });
      this.state.stats.outreachPrepared++;
      this.log('COPYWRITING', 'Copy de WhatsApp e e-mail pronta para envio!');

      // 4. Conclusão
      this.updateState({
        status: 'idle',
        statusLabel: 'Missão Concluída',
        progressPercent: 100,
        currentJobName: `Concluído: ${lead.nome}`,
        currentJobDetail: 'Protótipo e abordagem prontos no painel'
      });

      this.log('SUCESSO', `Fluxo autônomo para "${lead.nome}" concluído com 100% de sucesso!`);
      return { success: true, lead: db.getById(leadId) };
    } catch (err) {
      console.error('Erro na execução do agente:', err);
      this.log('ERRO', `Falha no processamento: ${err.message}`, 'error');
      this.updateState({
        status: 'error',
        statusLabel: 'Erro na Operação',
        progressPercent: 0,
        currentJobName: 'Falha na Operação',
        currentJobDetail: err.message
      });
      throw err;
    }
  }
}

const agentMonitor = new AgentMonitor();
module.exports = agentMonitor;
