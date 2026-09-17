const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hashFile(p) {
  if (!fs.existsSync(p)) return null;
  return crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');
}

const PREVIEWS_DIR = path.join(__dirname, '..', 'previews');
const ASSETS_DIR = path.join(__dirname, '..', 'templates', 'assets');

console.log('🔍 [Auditoria de Protótipos] Iniciando verificação de integridade...\n');

let totalChecked = 0;
let errors = [];

const solarHeroHash = hashFile(path.join(ASSETS_DIR, 'solar', 'hero.jpg'));
const climaHeroHash = hashFile(path.join(ASSETS_DIR, 'climatizacao', 'hero.jpg'));
const secHeroHash = hashFile(path.join(ASSETS_DIR, 'seguranca', 'hero.jpg'));

const previews = fs.readdirSync(PREVIEWS_DIR);

for (const slug of previews) {
  const dir = path.join(PREVIEWS_DIR, slug);
  if (!fs.statSync(dir).isDirectory()) continue;

  const htmlPath = path.join(dir, 'index.html');
  if (!fs.existsSync(htmlPath)) continue;

  totalChecked++;
  const html = fs.readFileSync(htmlPath, 'utf8');

  // 1. Verificar placeholders não substituídos
  const rawTags = html.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (rawTags && rawTags.length > 0) {
    errors.push(`[${slug}] Tags soltas no HTML: ${[...new Set(rawTags)].join(', ')}`);
  }

  // 2. Verificar favicon
  const faviconPath = path.join(dir, 'favicon.svg');
  if (!fs.existsSync(faviconPath)) {
    errors.push(`[${slug}] favicon.svg ausente no protótipo.`);
  }

  // 3. Verificar coerência estrita de imagens em nichos industriais
  const heroPath = path.join(dir, 'img', 'hero.jpg');
  if (fs.existsSync(heroPath)) {
    const currentHash = hashFile(heroPath);

    if (slug.includes('solar') && currentHash !== solarHeroHash) {
      errors.push(`[${slug}] ERRO DE NICHO: Site solar com imagem que NÃO é do pacote solar! (Hash: ${currentHash})`);
    }

    if ((slug.includes('ar-condicionado') || slug.includes('climatiza')) && currentHash !== climaHeroHash) {
      errors.push(`[${slug}] ERRO DE NICHO: Site de climatização com imagem incorreta!`);
    }

    if (slug.includes('seguranca') && currentHash !== secHeroHash) {
      errors.push(`[${slug}] ERRO DE NICHO: Site de segurança com imagem incorreta!`);
    }
  }

  // 4. Verificar assinatura do Gabriel Azevedo no rodapé
  if (!html.includes('Gabriel Azevedo') || !html.includes('(16) 99204-8856')) {
    errors.push(`[${slug}] Rodapé fora de padrão (assinatura Gabriel Azevedo ausente).`);
  }

  // 5. Verificar link de WhatsApp com rastreabilidade
  if (!html.includes('wa.me/')) {
    errors.push(`[${slug}] Nenhum link de WhatsApp encontrado.`);
  }
}

console.log(`📊 Total de protótipos auditados: ${totalChecked}`);

if (errors.length > 0) {
  console.error('\n🚨 FALHAS DE INTEGRIDADE ENCONTRADAS:');
  errors.forEach(e => console.error('  ❌ ' + e));
  process.exit(1);
} else {
  console.log('\n✅ Todos os protótipos passaram 100% nas checagens de integridade visual e técnica!');
  process.exit(0);
}

