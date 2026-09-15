const { chromium } = require('playwright');
const fs = require('fs');

async function inspectPlace(url, name) {
  console.log(`\n========================================`);
  console.log(`🔍 Inspecionando: ${name}`);
  console.log(`========================================`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const info = await page.evaluate(() => {
      const title = document.querySelector('h1.DUwDvf')?.innerText?.trim() || '';
      const rating = document.querySelector('div.F7nice')?.innerText?.replace(/\n/g, ' ').trim() || '';
      const address = document.querySelector('button[data-item-id="address"]')?.innerText?.trim() || '';
      const phone = document.querySelector('button[data-item-id*="phone"]')?.innerText?.trim() || '';
      const site = document.querySelector('a[data-item-id="authority"]')?.href || '';
      
      const photos = [];
      document.querySelectorAll('img[src*="googleusercontent.com"]').forEach(img => {
        if (img.src && !photos.includes(img.src)) {
          photos.push(img.src);
        }
      });

      return { title, rating, address, phone, site, photos: photos.slice(0, 6) };
    });

    // Clicar em avaliações se disponível
    let reviews = [];
    try {
      const revTab = await page.$('button[role="tab"][aria-label*="Avaliações"]');
      if (revTab) {
        await revTab.click();
        await page.waitForTimeout(2500);
        reviews = await page.evaluate(() => {
          const res = [];
          document.querySelectorAll('div.jftiEf').forEach(el => {
            const author = el.querySelector('.d4r55')?.innerText?.trim();
            const text = el.querySelector('.wiI7pd')?.innerText?.trim();
            const stars = el.querySelector('.kvMYJc')?.getAttribute('aria-label') || '5 estrelas';
            if (author && text) res.push({ author, text, stars });
          });
          return res;
        });
      }
    } catch(e) {
      console.log('Erro ao ler reviews:', e.message);
    }

    info.reviews = reviews;
    console.log(JSON.stringify(info, null, 2));
    await browser.close();
    return info;
  } catch(err) {
    console.error('Erro na extração:', err.message);
    await browser.close();
    return null;
  }
}

async function run() {
  const blitz = await inspectPlace('https://www.google.com/maps/place/Blitz+Seguran%C3%A7a+Eletr%C3%B4nica+%7C+Concertina+%7C+C%C3%A2meras+%7C+Alarmes+%7C+Cerca+El%C3%A9trica+%7C+Motor+de+Port%C3%B5es/data=!4m7!3m6!1s0x94b0a7007e19eadb:0xbd8fc7a7b6e25605!8m2!3d-20.531419!4d-47.4189592!16s%2Fg%2F11b6lkcfw3!19sChIJ2-oZfgCnsJQRBVbitqfHj70?authuser=0&hl=pt-BR&g_ep=EgoyMDI2MDkwOS4wIJJjKgBIAVAD&rclk=1', 'Blitz Seguranca');
  
  const coltseg = await inspectPlace('https://www.google.com/maps/place/Coltseg+eletr%C3%B4nica+-+C%C3%A2meras+e+alarmes+de+seguran%C3%A7a,+cercas+el%C3%A9tricas+e+motores+para+port%C3%A3o/data=!4m7!3m6!1s0x94b0a7f237aa18f9:0xb3a93a26760574fd!8m2!3d-20.5346422!4d-47.415326!16s%2Fg%2F11s3633dn5!19sChIJ-RiqN_KnsJQR_XQFdiY6qbM?authuser=0&hl=pt-BR&g_ep=EgoyMDI2MDkwOS4wIJJjKgBIAVAD&rclk=1', 'Coltseg Eletronica');

  fs.writeFileSync('fence_leads_raw.json', JSON.stringify({ blitz, coltseg }, null, 2));
  console.log('\nDados gravados em fence_leads_raw.json!');
}

run().catch(console.error);
