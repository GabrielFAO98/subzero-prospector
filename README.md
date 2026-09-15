# 🎯 Subzero Prospector — Máquina Autônoma de Prospecção Local

Sistema desenvolvido para **Gabriel Azevedo** para prospectar empresas locais em **Franca - SP** e região, identificar estabelecimentos de alta reputação sem site próprio, manter banco de dados com histórico anti-repetição, gerar protótipos de alta performance no padrão **Subzero Engine** e gerenciar abordagens através de uma interface visual moderna.

---

## 🖥️ Painel Visual (Dashboard Web)

Para gerenciar tudo visualmente no seu navegador sem depender de terminal:

```bash
npm start
```

*O navegador abrirá automaticamente em:* **`http://localhost:3000`**

### Recursos da Interface:
1. **Mineração Visual:** Digite o nicho (ex: *"energia solar"*, *"odontologia"*) e clique em *"Buscar Empresas"*. O Playwright busca no Google Maps em segundo plano e preenche a tela em tempo real.
2. **Critérios Explícitos de Seleção vs Descarte:**
   * 🔥 **Oportunidades Quentes:** Empresas com notas altas (4.5★+) e sem site oficial (apenas Linktree ou sem link).
   * 🚫 **Descartadas:** Apresenta claramente o motivo (ex: *"Já possui site próprio ativo: https://empresa.com.br"* ou *"Sem telefone disponível"*).
3. **Memória de Histórico Permanente:** Banco de dados local (`leads.db.json`) que reconhece empresas já avaliadas ou cotadas no passado, impedindo contatos repetidos.
4. **Central de Ações por Empresa:**
   * **Inspecionar:** Visualização do diagnóstico da empresa, notas e contatos.
   * **WhatsApp:** Mensagem otimizada para leitura em 10s pronta para copiar ou abrir com 1 clique no WhatsApp Web.
   * **E-mail Frio:** Proposta comercial consultiva sobre perda de clientes para buscas por IA.
   * **Protótipo ao Vivo:** Visualizador do site gerado no template Subzero Engine diretamente dentro do painel.
   * **Anotações:** Bloco de anotações persistente para salvar o status de cada conversa.

---

## ⌨️ Comandos Alternativos via Terminal (CLI)

Se preferir rodar direto por linha de comando:

| Comando | Descrição |
|---|---|
| `npm start` | Inicia o Dashboard Visual e abre no navegador (`http://localhost:3000`) |
| `node src/cli.js pipeline "<nicho>"` | Executa o pipeline completo pelo terminal |
| `node src/cli.js list` | Lista todas as empresas salvas no banco de dados local |
| `node src/cli.js open <id_ou_slug>` | Abre o protótipo no navegador |
| `node src/cli.js message <id_ou_slug>` | Exibe a mensagem pronta de WhatsApp e E-mail |

---

*Desenvolvido por Gabriel Azevedo • (16) 99204-8856*
