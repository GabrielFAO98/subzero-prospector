const fs = require('fs');
const path = require('path');

// 1. Update src/generator.js
{
  const file = path.resolve(__dirname, '../src/generator.js');
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    'já com fotos reais e depoimentos dos seus clientes:',
    'destacando as principais especialidades e os depoimentos dos seus clientes:'
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('src/generator.js updated');
}

// 2. Update leads.db.json
{
  const file = path.resolve(__dirname, '../leads.db.json');
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /j[áa] com fotos reais e depoimentos dos seus clientes:/g,
    'destacando as principais especialidades e os depoimentos dos seus clientes:'
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('leads.db.json updated');
}

// 3. Update previews/blitz-seguranca-eletronica/index.html
{
  const file = path.resolve(__dirname, '../previews/blitz-seguranca-eletronica/index.html');
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('<li><a href="#obras">Obras Entregues</a></li>', '<li><a href="#solucoes">Soluções</a></li>');
  content = content.replace('<a href="#obras" class="btn-secondary-hero">', '<a href="#solucoes" class="btn-secondary-hero">');
  content = content.replace('<span>Ver Obras e Soluções</span>', '<span>Conhecer Soluções</span>');
  content = content.replace('<!-- Section Dark: Obras & Soluções Entregues (Vitrine Técnica) -->', '<!-- Section Dark: Especialidades & Soluções Técnicas -->');
  content = content.replace('<section class="section dark" id="obras">', '<section class="section dark" id="solucoes">');
  content = content.replace('<span class="section-tag">Vitrine Técnica Blitz</span>', '<span class="section-tag">Soluções de Proteção</span>');
  content = content.replace(
    '<h2>Fotografia Real de Soluções Instaladas<br/><span>Equipamentos industriais e acabamento estético impecável.</span></h2>',
    '<h2>Especialidades & Soluções Técnicas<br/><span>Equipamentos industriais certificados e máxima durabilidade.</span></h2>'
  );
  content = content.replace(
    'Transparência total sem bancos de imagens artificiais. Confira a robustez e a precisão do nosso trabalho em Franca:',
    'Conheça em detalhes como cada tecnologia atua na proteção do seu patrimônio em Franca:'
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('previews/blitz-seguranca-eletronica/index.html updated');
}

// 4. Update previews/gelar-ar-condicionado-assistencia-tecnica-franca-sp/index.html
{
  const file = path.resolve(__dirname, '../previews/gelar-ar-condicionado-assistencia-tecnica-franca-sp/index.html');
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('<a href="#obras">Obras Reais</a>', '<a href="#especialidades">Especialidades</a>');
  content = content.replace('<a class="button outline-button" href="#obras">', '<a class="button outline-button" href="#especialidades">');
  content = content.replace('Ver Obras Reais <b>&darr;</b>', 'Conhecer Especialidades <b>&darr;</b>');
  content = content.replace('Ver Obras Reais <b>↓</b>', 'Conhecer Especialidades <b>↓</b>');
  content = content.replace('<!-- 02 — FOTOS REAIS DE INSTALAÇÕES (GALERIA TÉCNICA) -->', '<!-- 02 — ESPECIALIDADES E PADRÃO TÉCNICO -->');
  content = content.replace('<section class="section dark" id="obras">', '<section class="section dark" id="especialidades">');
  content = content.replace('<span class="eyebrow" style="color: var(--sky);">FOTOS REAIS</span>', '<span class="eyebrow" style="color: var(--sky);">PADRÃO DE QUALIDADE</span>');
  content = content.replace(
    '<h2>Fotografia Real de Obras Entregues<br/><span>Transparência total sem fotos genéricas.</span></h2>',
    '<h2>Especialidades & Soluções em Climatização<br/><span>Equipamentos modernos e padrão técnico de engenharia.</span></h2>'
  );
  content = content.replace('Transparência total sem fotos genéricas.', 'Padrão técnico rigoroso de engenharia.');
  fs.writeFileSync(file, content, 'utf8');
  console.log('previews/gelar index.html updated');
}

// 5. Update templates/industrial/index.html
{
  const file = path.resolve(__dirname, '../templates/industrial/index.html');
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('<li><a href="#obras">Serviços & Obras</a></li>', '<li><a href="#solucoes">Soluções</a></li>');
  content = content.replace('<a href="#obras" class="btn-secondary-hero">', '<a href="#solucoes" class="btn-secondary-hero">');
  content = content.replace('<!-- Section Dark: Vitrine Técnica / Obras Entregues -->', '<!-- Section Dark: Especialidades & Soluções Técnicas -->');
  content = content.replace('<section class="section dark" id="obras">', '<section class="section dark" id="solucoes">');
  content = content.replace('<span class="section-tag">Soluções Entregues</span>', '<span class="section-tag">Soluções & Especialidades</span>');
  content = content.replace(
    '<h2>Fotografia Real de Soluções Executadas<br/><span>Equipamentos certificados e acabamento de alto padrão.</span></h2>',
    '<h2>Equipamentos & Padrão Técnico de Execução<br/><span>Tecnologia de ponta e acabamento de alto padrão.</span></h2>'
  );
  content = content.replace(
    'Confira a qualidade do atendimento e o padrão técnico que entregamos em {{CIDADE_UF}}:',
    'Conheça em detalhes o padrão das soluções que disponibilizamos em {{CIDADE_UF}}:'
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('templates/industrial/index.html updated');
}

// 6. Update scripts/build_blitz_custom.js and scripts/build_industrial_template.js
{
  const file = path.resolve(__dirname, 'build_blitz_custom.js');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/Obras Entregues/g, 'Soluções');
    content = content.replace(/#obras/g, '#solucoes');
    content = content.replace(/Fotografia Real de Soluções Instaladas/g, 'Especialidades & Soluções Técnicas');
    content = content.replace(/Transparência total sem bancos de imagens artificiais\./g, 'Conheça em detalhes nossas soluções técnicas.');
    fs.writeFileSync(file, content, 'utf8');
    console.log('scripts/build_blitz_custom.js updated');
  }

  const fileInd = path.resolve(__dirname, 'build_industrial_template.js');
  if (fs.existsSync(fileInd)) {
    let content = fs.readFileSync(fileInd, 'utf8');
    content = content.replace(/Serviços & Obras/g, 'Soluções');
    content = content.replace(/#obras/g, '#solucoes');
    content = content.replace(/Fotografia Real de Soluções Executadas/g, 'Equipamentos & Padrão Técnico de Execução');
    fs.writeFileSync(fileInd, content, 'utf8');
    console.log('scripts/build_industrial_template.js updated');
  }
}
