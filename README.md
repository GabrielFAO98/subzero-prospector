# 🎯 Subzero Prospector

Máquina autônoma de prospecção local, mineração profunda de estabelecimentos e compilação de protótipos de alta performance desenvolvida para **Gabriel Azevedo**.

O sistema prospecta estabelecimentos em Franca SP e região, identifica empresas de alta reputação que não possuem presença digital profissional (ou que utilizam apenas agregadores como Linktree), enriquece dados de redes sociais e compila protótipos sob medida com o padrão de engenharia **Subzero Engine**.

---

## 🖥️ Painel Visual (Dashboard Web)

O sistema possui uma interface web moderna para operação em tempo real sem necessidade de terminal:

```bash
npm start
```

Acesse no navegador: **`http://localhost:3000`**

### Principais Funcionalidades da Interface:
1. **Mineração Visual no Google Maps:**
   * Busca automatizada via Playwright com extração de endereço, telefone, notas, comentários reais e fotos autênticas.
   * Sugestões de nichos de alta conversão com preenchimento assistido (*Clínica Odontológica, Cerca Elétrica / Segurança, Ar Condicionado, Energia Solar, Marcenaria, Estética Automotiva*).
   * Trava de concorrência ativa no frontend e backend para evitar bloqueios de taxa por requisições simultâneas.
2. **Caçador de Redes Sociais Multimotor:**
   * Caça automática e validação semântica de perfis no Instagram e Facebook com fallback redundante via DuckDuckGo.
   * Reconhecimento automático de handles e bio das empresas locais.
3. **Compilador Instantâneo de Protótipos (< 500ms):**
   * Recompilação em milissegundos utilizando a inteligência e fotos salvas no banco de dados local (`leads.db.json`), eliminando minerações redundantes desnecessárias.
   * Seletor de arquétipos dinâmico (*Industrial & Tech, Architectural, Clinical & Saúde, Care & Pet, Studio Visual*).
   * Visualizador embutido em iframe perfeitamente emoldurado com cabeçalho de status e ações rápidas.
4. **Telemetria do Agente em Tempo Real:**
   * Radar de pulso e barra de progresso no painel lateral.
   * Terminal mini-feed com streaming de eventos via Server-Sent Events (SSE).
   * Métricas ao vivo de leads minerados e protótipos compilados.
5. **Módulo Kanban CRM:**
   * Gestão de funil de vendas por estágios (*Identificado, Contatado, Protótipo Enviado, Em Negociação, Fechado, Descartado*).
   * Adição rápida de leads ao pipeline comercial diretamente da modal.
6. **Central de Abordagem Comercial:**
   * Textos de WhatsApp otimizados para leitura em 10 segundos prontos para envio.
   * Propostas em e-mail frio com foco em autoridade e buscas por inteligência artificial.
   * Bloco vertical de anotações persistentes por empresa.

---

## ⚡ Padrões de Engenharia Frontend (Subzero Engine)

Todos os protótipos de sites gerados pelo sistema seguem rigorosamente:

* **Stack Padrão:** HTML5 semântico, CSS3 moderno com variáveis customizadas (`:root`) e Vanilla JavaScript modular.
* **Rodapé Corporativo em 5 Colunas (Referência Obrigatória: `referencias/footer-inspiracao.png`):**
  1. Marca, slogan de valor e botões circulares modernos com ícones de redes sociais.
  2. Links Rápidos com âncoras internas da página.
  3. Lista com os principais serviços ou especialidades.
  4. Contato direto com ícones alinhados (endereço com link Maps, telefone, WhatsApp direto e e-mail).
  5. Quadro com horários de atendimento comercial.
  * Títulos das colunas em caixa alta com traço sublinhado colorido (`accent underline` de 28px).
  * Sub-footer inferior com direitos autorais e a assinatura inline:
    `Desenvolvido por Gabriel Azevedo • (16) 99204-8856`
* **Animações de Scroll Granulares:**
  * Cards e blocos de conteúdo animados individualmente conforme entram na viewport.
  * Curva fluida `cubic-bezier(0.22, 1, 0.36, 1)` com delay de 0.16s para fixação do olhar.
* **Smart Headroom Navbar:** Cabeçalho inteligente que se oculta ao descer a página e reaparece instantaneamente ao rolar para cima.
* **Carrossel de Avaliações / Marquee:** Rotação contínua de 15s sem saltos visuais e pausa automática ao toque ou hover.
* **Mobile-First Real & Performance:**
  * Imagens de hero otimizadas em WebP (< 100KB).
  * Vídeo de fundo em loop restrito ao Desktop (< 2MB, `preload="none"`) e substituído por foto estática no celular.
* **SEO Local & Schema JSON-LD:** Marcação estruturada `LocalBusiness` embutida no `<head>` de cada site gerado.
* **Metadados Open Graph:** Pré-visualização rica com imagem e título ao compartilhar links no WhatsApp.
* **Indexação para IAs (Arquivo `/llms.txt`):** Documento semântico em Markdown disponibilizado na raiz pública para leitura instantânea por motores de busca baseados em IA (ChatGPT Search, Perplexity, Claude, Gemini).

---

## ⌨️ Comandos Alternativos via Linha de Comando (CLI)

| Comando | Descrição |
|---|---|
| `npm start` | Inicia o servidor e abre o painel visual no navegador |
| `node src/cli.js pipeline "<nicho>"` | Executa a prospecção e mineração diretamente pelo terminal |
| `node src/cli.js list` | Lista todos os leads ativos no banco local |
| `node src/cli.js open <id_ou_slug>` | Abre a prévia do protótipo no navegador |
| `node src/cli.js message <id_ou_slug>` | Exibe as mensagens comerciais de WhatsApp e E-mail |

---

*Desenvolvido por Gabriel Azevedo • (16) 99204-8856*
