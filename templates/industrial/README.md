# ❄️ Template Subzero

Template de Landing Page de alta conversão, estética premium, performance máxima e responsividade mobile impecável.

Desenvolvido e arquitetado por **Gabriel Azevedo**.

---

## 🚀 Como usar para um novo cliente em 5 minutos

### 1. Duplicar a pasta do template
Copie a pasta `template.subzero` para o novo projeto (ex: `c:\Users\Gabriel\dev\site.novocliente`).

### 2. Instalar dependências e rodar
```bash
npm install
npm run dev
```

### 3. Personalizar o `index.html`
Abra o `index.html` e substitua as tags de placeholder:
* `{{NOME_DA_EMPRESA}}` — Nome do negócio
* `{{TITULO_PRINCIPAL}}` — Título da aba e SEO
* `{{LINK_WHATSAPP_COM_MENSAGEM}}` — URL `https://wa.me/55...` com texto pré-definido
* `{{TELEFONE_FORMATADO}}` — Número visível no topo e rodapé
* `{{CIDADE_UF}}` — Cidade e estado
* `{{SERVICOS}}` — Nomes e descrições dos 4 serviços principais
* `{{DIFERENCIAIS}}` — Os 3 pilares de confiança e honestidade
* `{{AVALIACOES}}` — Depoimentos reais de clientes no Google

### 4. Personalizar a paleta de cores (`src/style.css`)
No topo do arquivo `src/style.css`, ajuste as variáveis CSS para as cores da marca do cliente:
```css
:root {
  --navy: #0e204b;        /* Cor primária de contraste */
  --navy-dark: #071330;   /* Fundo escuro do rodapé/seções */
  --cyan: #1ee4ff;        /* Cor de destaque/acento principal */
  --cyan-dark: #008fa8;   /* Acento secundário para textos */
  --green: #25D366;       /* Verde do WhatsApp */
}
```

### 5. Substituir as Imagens
* `img/hero.jpg` — Imagem de fundo do Hero (ou deixe limpo/com gradiente).
* `img/workshop.jpg` — Foto principal da estrutura física / diferencial.
* `favicon.svg` — Ícone de aba do navegador.

---

## ⚡ Recursos Nativos Incluídos

1. **Smart Headroom Navbar:** Cabeçalho inteligente que se oculta suavemente ao rolar para baixo e reaparece instantaneamente ao rolar para cima.
2. **Scroll Reveal Granular (Subzero Engine):**
   * Disparo por elemento individual (e não por contêiner grande), evitando que a animação ocorra fora da tela no celular.
   * Pausa de percepção (`0.16s delay`) e transição fluida (`0.85s cubic-bezier`).
3. **Carrossel Infinito a 15s:**
   * Marquee vertical contínuo de avaliações duplicado via JS para loop sem emendas.
   * Pausa automática ao passar o mouse (`:hover`) ou tocar no celular (`:active`).
4. **Mobile First:** 100% testado contra transbordamento horizontal (`overflow-x`), quebras de layout ou fontes ilegíveis.
5. **SEO & GEO Local:** Marcação semântica pronta para buscas locais no Google.
6. **Crédito de Desenvolvedor Integrado:** Link discreto no rodapé para o WhatsApp de Gabriel Azevedo: `(16) 99204-8856`.

---

## 📦 Build para Produção
```bash
npm run build
```
A pasta gerada `dist/` está pronta para deploy imediato na Vercel, Netlify ou qualquer CDN estática.

