const fs = require('fs');

function check(slug, name) {
  const p = `previews/${slug}/index.html`;
  if (!fs.existsSync(p)) {
    console.log(`[!] ${slug} not found`);
    return;
  }
  const html = fs.readFileSync(p, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] || '';
  const brand = html.match(/class=["']brand-name["']>([^<]+)</)?.[1] || '';
  const subtitle = html.match(/class=["']hero-subtitle[^"']*["']>([^<]+)</)?.[1]?.trim() || '';
  const highlights = [...html.matchAll(/class=["']highlight-desc["']>([^<]+)</g)].map(m => m[1].trim());

  console.log(`=== ${name} (${slug}) ===`);
  console.log(`Brand Name: "${brand}"`);
  console.log(`Title: "${title}"`);
  console.log(`Hero Subtitle (${subtitle.length} chars): "${subtitle}"`);
  console.log(`Highlights (${highlights.length}):`);
  highlights.forEach((h, i) => console.log(`  ${i+1}. [${h.length} chars] ${h}`));
  console.log('');
}

check('telepublico-monitoramento-e-rastreamento-24-hrs', 'Telepúblico Monitoramento');
check('daniel-climatizacao-instalacao-e-manutencao-de-ar-condicionado', 'Daniel Climatização');

