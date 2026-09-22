# 💎 Template Studio Visual — Imagem, Estética, Arte & Fotografia

Template de altíssimo padrão visual e taxa de conversão desenvolvido sobre o **Subzero Engine** (HTML5 Semântico + CSS3 puro moderno com variáveis customizadas + Vanilla JS modular). 

Concebido especialmente para empresas e profissionais que **vendem através da imagem e da sofisticação**:
- Clínicas de Estética Avançada & Harmonização
- Fotógrafos Autoriais & Estúdios de Moda/Retrato
- Storymakers & Produtoras Audiovisuais
- Designers de Interiores & Escritórios de Arquitetura Visual
- Artistas Plásticos, Joalherias & Ateliês de Alta Costura

---

## 🚀 Como Testar Localmente

O template já está integrado ao servidor do projeto:
👉 **URL:** [http://localhost:3000/templates/studio-visual/](http://localhost:3000/templates/studio-visual/)

---

## 🏷️ Guia de Placeholders (Personalização Rápida)

Todos os textos e links personalizáveis no arquivo `index.html` estão destacados no formato `[TAG_PLACEHOLDER]`. Basta dar um "Localizar e Substituir" no seu editor:

| Placeholder | Descrição | Exemplo de Preenchimento |
|---|---|---|
| `[NOME_EMPRESA]` | Nome da marca, clínica ou profissional | `Aura Studio` ou `Dra. Camila Ramos` |
| `[INICIAL]` | Letra única para o monograma e ícone da barra | `A` ou `C` |
| `[NICHO_OU_TITULO]` | Título principal / Nicho de atuação | `Estética Avançada & Cosmiatria` |
| `[NICHO_OU_SLOGAN]` | Tagline elegante exibida no Hero | `Harmonia • Precisão • Arte Visual` |
| `[DESCRICAO_CURTA_SEO]` | Meta tag de descrição para Google e WhatsApp | `Experiências estéticas personalizadas...` |
| `[TAG_SOBRE]` | Olho/categoria acima do título da Bio | `BIOGRAFIA & PROPÓSITO` |
| `[SUBTITULO_SOBRE]` | Complemento elegante do título | `A Essência por Trás de Cada Detalhe` |
| `[BIO_PARAGRAFO_1]` | Primeiro parágrafo da história | `Somos especialistas em realçar...` |
| `[BIO_PARAGRAFO_2]` | Segundo parágrafo com diferenciais | `Com atendimento exclusivo e privativo...` |
| `[FRASE_IMPACTO_FILOSOFIA]` | Frase de impacto em destaque (blockquote) | `A verdadeira sofisticação é discreta e atemporal.` |
| `[NOME_RESPONSAVEL_OU_FUNDADOR]` | Assinatura da frase | `Dra. Camila Ramos` |
| `[PILARES_TITULO]` | Título da seção de diferenciais/serviços | `Pilares de Excelência` |
| `[PILAR_1_TITULO]` | Nome do primeiro serviço / diferencial | `Consulta Personalizada` |
| `[PILAR_2_TITULO]` | Nome do segundo serviço / diferencial | `Tecnologia de Ponta` |
| `[PILAR_3_TITULO]` | Nome do terceiro serviço / diferencial | `Acompanhamento Contínuo` |
| `[PORTFOLIO_TITULO]` | Título da galeria / portfólio | `Galeria de Casos & Ensaios` |
| `[WHATSAPP_LINK_5516999999999]` | Número com DDI e DDD sem caracteres | `5516992048856` |
| `[WHATSAPP_NUMERO_FORMATADO]` | Número formatado para leitura | `(16) 99204-8856` |
| `[WHATSAPP_MENSAGEM_URL_ENCODED]` | Mensagem pronta codificada para URL | `Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento.` |
| `[INSTAGRAM_USUARIO]` | Nome de usuário no Instagram | `aurastudio.oficial` |
| `[EMAIL_CONTATO]` | E-mail para contato direto | `contato@aurastudio.com.br` |

---

## 🎨 Paleta de Cores e Tipografia (`style.css`)

As cores e fontes estão centralizadas no seletor `:root` no início de `style.css`:

```css
:root {
  /* Tons Principais (Warm Luxury) */
  --bg-warm-base: #EAE4D9;       /* Linho Marfim Aveludado (Anti-ofuscamento) */
  --bg-warm-sand: #E2DBD0;       /* Bege Areia Dourada */
  --text-black: #151412;         /* Café Profundo de Alto Contraste */
  --text-beige: #F5EFE6;         /* Creme Champanhe */
  --gold-accent: #B59358;        /* Dourado Champanhe Refinado */

  /* Tipografia */
  --font-serif-brand: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Montserrat', sans-serif;
}
```

> **Dica para Nicho Dark (ex: Tatuagem, Cinema, Barbearia de Luxo):**
> Para transformar em tema Dark, basta inverter as variáveis no `:root`: definir `--bg-warm-base: #101010`, `--bg-warm-sand: #181818`, `--text-black: #F5EFE6` e `--gold-accent: #D4AF37`.

---

## 🎬 Mídia: Vídeos e Imagens (`img/` e `videos/`)

- **Vídeo do Hero (`videos/hero-bg.mp4`):** Vídeo vertical ou cinematográfico em loop. O script JS já gerencia o loop manual e a inicialização suave sem travar o navegador em celulares.
- **Showcase Full-Width (`videos/showcase-bg.mp4`):** Vídeo de transição em tela cheia com overlay escuro.
- **Imagens do Portfólio (`img/`):** Proporção vertical recomendada `3:4` ou `9:16`. Cada card suporta imagem estática de capa e mini-vídeo em hover.

---

## ⚡ Engenharia e Performance
- **Zero transbordamento horizontal** (`overflow-x: hidden`).
- **Smart Headroom Navbar:** Barra flutuante tipo pílula com vidro fosco (*glassmorphism*) que se esconde na descida e reaparece instantaneamente na rolagem para cima.
- **Auto-split de Nome:** O script reconhece automaticamente strings simples em `#nameRow` e monta os caracteres espaçados com animação editorial.
- **Lightbox Integrado:** Modal nativo leve para visualização de vídeos em alta resolução ao clicar nos cards de portfólio.

