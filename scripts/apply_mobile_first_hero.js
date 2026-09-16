const fs = require('fs');
const path = require('path');

// 1. UPDATE KELL DISTRIBUIDORA
{
  const htmlFile = path.resolve(__dirname, '../previews/kell-distribuidora/index.html');
  let html = fs.readFileSync(htmlFile, 'utf8');

  // Shorten H1 and hero description in Kell
  html = html.replace(
    /<div class="hero-tag stagger">[\s\S]*?<\/div>/,
    `<div class="hero-tag stagger">\n        <svg width="14" height="14"><use href="#icon-shield"/></svg>\n        FRANCA SP • ATACADISTA OFICIAL\n      </div>`
  );

  html = html.replace(
    /<h1 class="stagger">[\s\S]*?<\/h1>/,
    `<h1 class="stagger">\n        Equipamentos de Segurança a<br/>\n        <em>Preço de Distribuidor em Franca.</em>\n      </h1>`
  );

  html = html.replace(
    /<p class="hero-desc stagger">[\s\S]*?<\/p>/,
    `<p class="hero-desc stagger">\n        Estoque local com pronta-entrega e suporte técnico especializado para instaladores e empresas.\n      </p>`
  );

  fs.writeFileSync(htmlFile, html, 'utf8');

  const cssFile = path.resolve(__dirname, '../previews/kell-distribuidora/src/style.css');
  let css = fs.readFileSync(cssFile, 'utf8');

  // Optimize mobile CSS in Kell
  css = css.replace(
    /@media \(max-width: 600px\) \{[\s\S]*?\.hero \{[\s\S]*?padding: [^;]+;[\s\S]*?\}[\s\S]*?\.hero h1 \{[\s\S]*?font-size: [^;]+;[\s\S]*?\}[\s\S]*?\.hero-desc \{[\s\S]*?font-size: [^;]+;[\s\S]*?\}/,
    `@media (max-width: 600px) {
  .hero {
    padding: 32px 16px 28px;
  }

  .hero-tag {
    font-size: 0.72rem;
    padding: 4px 10px;
    margin-bottom: 12px;
  }

  .hero h1 {
    font-size: 1.55rem;
    line-height: 1.2;
    margin-bottom: 10px;
  }

  .hero-desc {
    font-size: 0.92rem;
    line-height: 1.45;
    margin-bottom: 18px;
    max-width: 100%;
  }

  .hero-cta-group {
    margin-bottom: 22px;
    gap: 10px;
  }`
  );

  fs.writeFileSync(cssFile, css, 'utf8');
  console.log('Kell Distribuidora hero optimized for mobile!');
}

// 2. UPDATE BLITZ SEGURANÇA
{
  const htmlFile = path.resolve(__dirname, '../previews/blitz-seguranca-eletronica/index.html');
  let html = fs.readFileSync(htmlFile, 'utf8');

  html = html.replace(
    /<p class="hero-subtitle stagger">[\s\S]*?<\/p>/,
    `<p class="hero-subtitle stagger">\n        Proteção perimetral de alto impacto e monitoramento CFTV inteligente no seu celular para residências e empresas em Franca.\n      </p>`
  );

  fs.writeFileSync(htmlFile, html, 'utf8');

  const cssFile = path.resolve(__dirname, '../previews/blitz-seguranca-eletronica/src/style.css');
  let css = fs.readFileSync(cssFile, 'utf8');

  css = css.replace(
    /@media \(max-width: 768px\) \{[\s\S]*?\.hero \{[\s\S]*?padding: [^;]+;[\s\S]*?\}/,
    `@media (max-width: 768px) {
  .hero {
    padding: 2.75rem 1.25rem 2rem;
  }
  .hero-badge-trust {
    font-size: 0.72rem;
    padding: 0.35rem 0.85rem;
    margin-bottom: 0.85rem;
  }
  .hero h1 {
    font-size: 1.6rem;
    line-height: 1.2;
    margin-bottom: 0.75rem;
  }
  .hero-subtitle {
    font-size: 0.92rem;
    line-height: 1.45;
    margin-bottom: 1.5rem;
  }
  .hero-actions {
    margin-bottom: 2rem;
  }`
  );

  fs.writeFileSync(cssFile, css, 'utf8');
  console.log('Blitz Segurança hero optimized for mobile!');
}

// 3. UPDATE TEMPLATES/INDUSTRIAL
{
  const htmlFile = path.resolve(__dirname, '../templates/industrial/index.html');
  let html = fs.readFileSync(htmlFile, 'utf8');

  html = html.replace(
    /<p class="hero-subtitle stagger">[\s\S]*?<\/p>/,
    `<p class="hero-subtitle stagger">\n        {{TEXTO_DE_APRESENTACAO_DA_EMPRESA_FOCO_EM_CONFIANCA_E_QUALIDADE}}\n      </p>`
  );

  fs.writeFileSync(htmlFile, html, 'utf8');

  const cssFile = path.resolve(__dirname, '../templates/industrial/src/style.css');
  let css = fs.readFileSync(cssFile, 'utf8');

  css = css.replace(
    /@media \(max-width: 768px\) \{[\s\S]*?\.hero \{[\s\S]*?padding: [^;]+;[\s\S]*?\}/,
    `@media (max-width: 768px) {
  .hero {
    padding: 2.75rem 1.25rem 2rem;
  }
  .hero-badge-trust {
    font-size: 0.72rem;
    padding: 0.35rem 0.85rem;
    margin-bottom: 0.85rem;
  }
  .hero h1 {
    font-size: 1.6rem;
    line-height: 1.2;
    margin-bottom: 0.75rem;
  }
  .hero-subtitle {
    font-size: 0.92rem;
    line-height: 1.45;
    margin-bottom: 1.5rem;
  }
  .hero-actions {
    margin-bottom: 2rem;
  }`
  );

  fs.writeFileSync(cssFile, css, 'utf8');
  console.log('templates/industrial hero optimized for mobile!');
}

// 4. UPDATE SRC/GENERATOR.JS (CONCISE HERO PRESENTATION COPY)
{
  const genFile = path.resolve(__dirname, '../src/generator.js');
  let gen = fs.readFileSync(genFile, 'utf8');

  // Pet / Vet concise presentation
  gen = gen.replace(
    /apresentacao:\s*`Com dedicação e carinho pelos animais em \${cidade}, a \${nomeEmpresa} oferece atendimento veterinário de excelência, centro cirúrgico com anestesia inalatória, vacinas importadas, farmácia veterinária e banho & tosa especializado\.`,/,
    `apresentacao: \`Atendimento veterinário humanizado, exames rápidos e cuidados completos para a saúde e bem-estar do seu pet em \${cidade}.\`,`
  );

  // Distribuidora concise presentation
  gen = gen.replace(
    /apresentacao:\s*`Com sólida trajetória desde 2009 em \${cidade}, a \${nomeEmpresa} é o principal parceiro de técnicos, instaladores e empresas de segurança, oferecendo catálogo completo com suporte técnico e condições de atacado\.`,/,
    `apresentacao: \`Estoque local com pronta-entrega e suporte técnico especializado para instaladores e empresas em \${cidade}.\`,`
  );

  // Climatização concise presentation
  gen = gen.replace(
    /apresentacao:\s*`Com ampla experiência em climatização em \${cidade}, a \${nomeEmpresa} é referência em instalação de precisão, manutenção preventiva e conserto de placas inverter residenciais e industriais\.`,/,
    `apresentacao: \`Especialistas em conserto de placas inverter, higienização e climatização com garantia em \${cidade}.\`,`
  );

  // Odonto concise presentation
  gen = gen.replace(
    /apresentacao:\s*`Referência em odontologia moderna em \${cidade}, a \${nomeEmpresa} reúne especialistas dedicados em próteses, implantes, ortodontia e harmonização com foco em saúde e estética do sorriso\.`,/,
    `apresentacao: \`Tecnologia odontológica avançada, implantes e estética do sorriso com conforto e segurança em \${cidade}.\`,`
  );

  // Segurança geral concise presentation
  gen = gen.replace(
    /apresentacao:\s*`Especializada em blindagem perimetral e segurança eletrônica em \${cidade}, a \${nomeEmpresa} entrega tranquilidade definitiva com cerca elétrica industrial, concertina e câmeras no celular\.`,/,
    `apresentacao: \`Proteção perimetral de alto impacto e monitoramento CFTV inteligente no celular para residências e empresas em \${cidade}.\`,`
  );

  fs.writeFileSync(genFile, gen, 'utf8');
  console.log('src/generator.js concise presentation copy updated!');
}
