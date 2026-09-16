const fs = require('fs');
const path = require('path');

const previewsDir = path.resolve(__dirname, '../previews');
const items = fs.readdirSync(previewsDir);

for (const dir of items) {
  const file = path.join(previewsDir, dir, 'index.html');
  if (fs.existsSync(file)) {
    const html = fs.readFileSync(file, 'utf8');
    const matches = html.match(/wa\.me\/[0-9]+\?text=([^"'\s>]+)/g) || [];
    console.log(`[${dir}] -> ${matches.length} links`);
    if (matches.length > 0) {
      const decoded = decodeURIComponent(matches[0].split('text=')[1]);
      console.log(`   Exemplo: "${decoded}"`);
    }
  }
}
