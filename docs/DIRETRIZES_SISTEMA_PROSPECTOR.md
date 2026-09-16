# ❄️ Diretrizes Oficiais do Sistema Prospector & Subzero Engine

> **Documento de Parametrização Oficial Permanente**  
> **Autor:** Gabriel Azevedo • Engenheiro de Software & Desenvolvedor Subzero  
> **Contato Oficial:** (16) 99204-8856 • gfdaoliveira@gmail.com  
> **Versão:** 2.0.0 (Consolidação Multi-Arquétipos & Prospecção Inteligente)

---

## 🎯 1. Tese Comercial & Benefícios Estratégicos do Site Próprio

### 1.1 O Problema Central Solucionado
O principal gargalo de pequenas e médias empresas locais (clínicas veterinárias, consultórios odontológicos, climatização, segurança eletrônica, energia solar, mecânicas) é a **perda de clientes nas buscas locais diárias por falta de presença oficial indexada**.

O site próprio resolve essa dor atuando nos seguintes pilares:
1. **Ranqueamento Orgânico no Google & Map Pack (O Trio de Topo):**
   * Empresas com domínio próprio oficial (`.com.br`) ganham prioridade de relevância algorítmica no Google Meu Negócio / Google Maps. Perfis com site recebem até 70% mais cliques e chamadas do que fichas que só têm telefone ou endereço.
2. **SEO Local On-Page Estruturado:**
   * Código semântico, metadados Schema.org e carregamento instantâneo mobile garantem indexação para termos de alta intenção (ex: *"veterinário 24 horas franca"*, *"conserto ar condicionado franca"*).
3. **Visibilidade perante Buscas por Inteligência Artificial (IA Search):**
   * Motores como ChatGPT Search, Meta AI no WhatsApp e Google Gemini vasculham domínios oficiais para indicar prestadores de serviço recomendados na cidade. Empresas sem site são desconsideradas pela IA.

### 1.2 Benefícios Adicionais para Argumentação de Vendas
Além da visibilidade e ranqueamento, um site próprio oferece vantagens que o empresário valoriza imediatamente:
* **Fim do "Terreno Alugado" (Patrimônio Digital Real):**
  Redes sociais (Instagram/Facebook) não pertencem à empresa. O alcance orgânico médio é inferior a 5%, e contas podem ser banidas ou invadidas a qualquer momento. O domínio oficial `.com.br` é um ativo definitivo da empresa.
* **Conversão Direta em 1 Toque para o WhatsApp:**
  No Instagram, o cliente é bombardeado por notificações, concorrentes e reels. No site Subzero, a atenção é retida e cada serviço possui um botão de WhatsApp com mensagem contextual pré-preenchida, reduzindo a fricção a zero.
* **Filtro de Amadorismo & Ticket Médio Mais Alto:**
  Em serviços de maior valor ou de saúde (cirurgias, implantes, sistemas de alarme, instalações térmicas), o cliente busca segurança. A empresa com site oficial estruturado transmite autoridade, garantia e endereço físico consolidado, justificando preços maiores.
* **Habilitação Obrigatória para Google Ads de Pesquisa:**
  Anúncios no Google para pessoas com intenção de compra imediata exigem uma página de destino rápida e otimizada para celular. Sem site, a empresa não consegue disputar os clientes mais lucrativos do Google.
* **Atendimento Autônomo 24 Horas por Dia:**
  O site tira dúvidas, exibe especialidades, credenciais, horários de plantão e localização mesmo à noite, aos domingos e feriados, alimentando o WhatsApp de contatos.

---

## 🎨 2. Manifesto Visual & Diretriz de Imagens

### 2.1 Presença Humana, Rostos e Fotografias Reais
* **Permitido e Encorajado:** Fotografias comerciais autênticas de alta resolução contendo pessoas reais, profissionais trabalhando uniformizados, clientes satisfeitos e interação humana natural. Rostos reais geram empatia, calor humano e acolhimento.
* **Proibido Absoluto:** Imagens geradas por IA que apresentem distorções anatômicas, dedos deformados, olhos desalinhados, pele plastificada ("efeito boneco de cera") ou iluminação artificial bizarra.
* **Critério de Qualidade:** Todas as imagens devem ter resolução nítida, tratamento de cores profissional e peso comprimido para carregamento instantâneo no celular.

### 2.2 Coerência Contextual Estrita por Nicho
Toda imagem deve obrigatoriamente condizer com a atividade real do negócio. É terminantemente proibido inserir fotos desconexas:
* **Pet Shop & Veterinária (`care`):**
  * O paciente é **SEMPRE um animal** (cão, gato).
  * Imagem de vacina deve retratar um veterinário aplicando vacina em um cão ou gato, com carinho e cuidado.
  * Imagem de banho/tosa deve mostrar o animal sendo higienizado ou tosquiado.
  * *ERRO PROIBIDO:* Foto de braço humano recebendo injeção em site de pet shop.
* **Saúde & Odontologia (`clinical`):**
  * Dentistas paramentados com luvas e máscaras, sorrisos humanos estéticos e naturais, equipamentos clínicos esterilizados, consultórios modernos e iluminados.
* **Segurança Eletrônica & Industrial (`industrial`):**
  * Técnicos instalando câmeras, cercas elétricas galvalume, motores de portão, equipamentos de monitoramento, tubulações de cobre, ferramentas de precisão.

---

## 🔍 3. Prospecção Inteligente — Qualidade sobre Quantidade

### 3.1 Gatekeeper de Redes e Franquias Nacionais
Antes de auditar qualquer dado, o sistema deve verificar se o nome ou domínio pertence a uma grande rede nacional (Cobasi, Petz, Droga Raia, Sorridents, OdontoCompany, etc.).
* **Regra:** Franquias nacionais devem ser marcadas imediatamente como `descartado` com motivo *"Grande Rede / Franquia Nacional"*, sem gastar processamento nem poluir a fila de prospecção local.

### 3.2 Higienização e Sanity Check de URLs
* Decodificação de parâmetros de redirecionamento do Google (`google.com/aclk?...` ou `google.com/url?q=...`).
* Remoção de parâmetros de rastreamento (`utm_*`, `gclid`, `fbclid`).
* Rejeição de URLs gigantescas com centenas de caracteres de parâmetros.
* Identificação de agregadores genéricos (GuiaMais, Apontador, Jusbrasil) como ausência de site próprio.

### 3.3 Classificação Rígida de Status do Lead
* **🔥 Oportunidade Quente:**
  1. **Nenhum site cadastrado** no Google Maps, mas com boa reputação e telefone/WhatsApp válido.
  2. **Site Fora do Ar / Inacessível:** Erro 404, 500, domínio expirado, falha de DNS ou timeout.
  3. **Apenas Rede Social / Linktree:** Empresa que cadastrou Instagram ou Linktree no campo de website no Google.
* **🚫 Descartado:**
  1. Franquia ou grande rede corporativa nacional.
  2. Sem canal de telefone ou WhatsApp para abordagem direta.
  3. Estabelecimento fechado permanentemente ou com reputação destrutiva (< 3.0 estrelas com dezenas de reclamações graves).
* **🌐 Site Ativo:**
  * Empresa local que já possui um site institucional `.com.br` moderno e funcional com SSL. Deve ser catalogada separadamente, sem concorrer com as oportunidades quentes que não possuem presença digital.

### 3.4 Verificação de Contatos
* Priorização de WhatsApp no formato celular local (DDD 16 com 9 dígitos).
* Validação de números antes de gerar links de mensagem pronta.

---

## ⚡ 4. Padrões de Engenharia Frontend (Subzero Engine)

### 4.1 Arquétipos Visuais Suportados
1. **`templates/care`:**
   * **Nichos:** Pet Shops, Clínicas Veterinárias, Banho & Tosa, Cuidados Infantis, Creches.
   * **Cores:** Warm Stone (`#fafaf9`), Verde Esmeralda (`#059669`), Âmbar (`#f59e0b`), texto Slate (`#0f172a`).
   * **Geometria:** Cantos arredondados suaves (20px), sombras difusas, sensação acolhedora e calorosa.
2. **`templates/clinical`:**
   * **Nichos:** Odontologia, Consultórios Médicos, Estética Avançada, Fisioterapia.
   * **Cores:** Pure White (`#ffffff`), Ice Blue (`#f0f9ff`), Clinical Cyan (`#0284c7`), Navy (`#0f172a`).
   * **Geometria:** Grid cirúrgico, precisão técnica, atmosfera estéril e de alta autoridade científica.
3. **`templates/industrial`:**
   * **Nichos:** Climatização (HVAC), Segurança Eletrônica, Energia Solar, Marcenaria, Mecânica.
   * **Cores:** Dark Armor (`#060a12`), Steel Blue (`#0e204b`), Aço e Dourado.
   * **Geometria:** Cartões densos, alto contraste, atmosfera robusta de engenharia e garantia física.

### 4.2 Regras Frontend Invioláveis
* **Mobile-First Real:** Testado entre 360px e 430px sem transbordamento horizontal (`overflow-x: hidden`).
* **Smart Headroom Navbar:** Cabeçalho inteligente que oculta na descida e ressurge na subida.
* **Scroll Reveal Granular por Item:**
  * Threshold: `0.84 * window.innerHeight` com `rootMargin: '0px 0px -65px 0px'`.
  * Pausa perceptiva: `transition-delay: 0.16s`.
  * Transição fluida: `0.85s cubic-bezier(0.22, 1, 0.36, 1)`.
* **Marquee de Avaliações Contínuo:** Trilha infinita a 15s com pausa ao passar o mouse ou tocar.
* **Assinatura Oficial do Gabriel:**
  `Desenvolvido por Gabriel Azevedo • (16) 99204-8856`
  Link WhatsApp contextual: `https://wa.me/5516992048856?text=...`

---

## 🚨 5. Regra de Ouro: Git & Deploy
* **NUNCA FAÇA PUSH SEM PEDIDO EXPLÍCITO:** Todas as alterações, commits e builds devem permanecer locais. O comando `git push` só pode ser executado quando o Gabriel disser expressamente *"faça o push"*, *"pode subir"*, *"envie para produção"* ou equivalente.
* **Autoria de Commits:** Nome: `Gabriel` | E-mail: `gfdaoliveira@gmail.com`.

