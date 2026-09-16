const fs = require('fs');
const path = require('path');

const companies = [
  { dir: 'coltseg-seguranca-eletronica', name: 'Coltseg' },
  { dir: 'dl-odontologia-clinica', name: 'DL Odontologia' },
  { dir: 'ecol-ar-condicionado', name: 'Ecol Ar Condicionado' },
  { dir: 'gelar-ar-condicionado-assistencia-tecnica-franca-sp', name: 'Gelar Ar Condicionado' },
  { dir: 'saude-vet-pet-shop-e-clinica-veterinaria', name: 'Saúde Vet' }
];

const previewsDir = path.resolve(__dirname, '../previews');

for (const c of companies) {
  const file = path.join(previewsDir, c.dir, 'index.html');
  if (!fs.existsSync(file)) continue;

  let html = fs.readFileSync(file, 'utf8');
  const standardMsg = encodeURIComponent(`Olá! Vim pelo site da ${c.name} e gostaria de conversar com um atendente.`);

  // Replace any wa.me link for the company (excluding Gabriel's developer link 5516992048856)
  html = html.replace(/href="https:\/\/wa\.me\/(?!5516992048856)(\d+)(\?text=[^"]*)?"/g, (match, phone) => {
    return `href="https://wa.me/${phone}?text=${standardMsg}"`;
  });

  fs.writeFileSync(file, html, 'utf8');
  console.log(`Successfully updated links for ${c.name}`);
}

