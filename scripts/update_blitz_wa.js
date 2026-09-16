const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../previews/blitz-seguranca-eletronica/index.html');
let html = fs.readFileSync(file, 'utf8');

const standardMsg = encodeURIComponent('Olá! Vim pelo site da Blitz Segurança e gostaria de conversar com um atendente.');
const concertinaMsg = encodeURIComponent('Olá! Vim pelo site da Blitz Segurança e gostaria de conversar com um atendente sobre concertina.');
const cercaMsg = encodeURIComponent('Olá! Vim pelo site da Blitz Segurança e gostaria de conversar com um atendente sobre cerca elétrica.');
const cftvMsg = encodeURIComponent('Olá! Vim pelo site da Blitz Segurança e gostaria de conversar com um atendente sobre câmeras CFTV.');
const motorMsg = encodeURIComponent('Olá! Vim pelo site da Blitz Segurança e gostaria de conversar com um atendente sobre motor de portão.');

// Header button
html = html.replace(
  /<a href="https:\/\/wa\.me\/5516993974382\?text=[^"]*" target="_blank" rel="noopener noreferrer" class="btn-header-whatsapp">/,
  `<a href="https://wa.me/5516993974382?text=${standardMsg}" target="_blank" rel="noopener noreferrer" class="btn-header-whatsapp">`
);

// Hero button
html = html.replace(
  /<a href="https:\/\/wa\.me\/5516993974382\?text=[^"]*" target="_blank" rel="noopener noreferrer" class="btn-primary-hero">/,
  `<a href="https://wa.me/5516993974382?text=${standardMsg}" target="_blank" rel="noopener noreferrer" class="btn-primary-hero">`
);

// Concertina
html = html.replace(
  /<a href="https:\/\/wa\.me\/5516993974382\?text=[^"]*" target="_blank" rel="noopener noreferrer" class="btn-obra-cta">\s*<span>Orçar Concertina<\/span>/,
  `<a href="https://wa.me/5516993974382?text=${concertinaMsg}" target="_blank" rel="noopener noreferrer" class="btn-obra-cta">\n                <span>Orçar Concertina</span>`
);

// Cerca
html = html.replace(
  /<a href="https:\/\/wa\.me\/5516993974382\?text=[^"]*" target="_blank" rel="noopener noreferrer" class="btn-obra-cta">\s*<span>Orçar Cerca Elétrica<\/span>/,
  `<a href="https://wa.me/5516993974382?text=${cercaMsg}" target="_blank" rel="noopener noreferrer" class="btn-obra-cta">\n                <span>Orçar Cerca Elétrica</span>`
);

// CFTV
html = html.replace(
  /<a href="https:\/\/wa\.me\/5516993974382\?text=[^"]*" target="_blank" rel="noopener noreferrer" class="btn-obra-cta">\s*<span>Orçar Câmeras CFTV<\/span>/,
  `<a href="https://wa.me/5516993974382?text=${cftvMsg}" target="_blank" rel="noopener noreferrer" class="btn-obra-cta">\n                <span>Orçar Câmeras CFTV</span>`
);

// Motor
html = html.replace(
  /<a href="https:\/\/wa\.me\/5516993974382\?text=[^"]*" target="_blank" rel="noopener noreferrer" class="btn-obra-cta">\s*<span>Orçar Motor de Portão<\/span>/,
  `<a href="https://wa.me/5516993974382?text=${motorMsg}" target="_blank" rel="noopener noreferrer" class="btn-obra-cta">\n                <span>Orçar Motor de Portão</span>`
);

// Contact
html = html.replace(
  /<a href="https:\/\/wa\.me\/5516993974382\?text=[^"]*" target="_blank" rel="noopener noreferrer" class="btn-contact-whatsapp">/,
  `<a href="https://wa.me/5516993974382?text=${standardMsg}" target="_blank" rel="noopener noreferrer" class="btn-contact-whatsapp">`
);

// Floating
html = html.replace(
  /<a href="https:\/\/wa\.me\/5516993974382\?text=[^"]*" target="_blank" rel="noopener noreferrer" class="floating-whatsapp"/,
  `<a href="https://wa.me/5516993974382?text=${standardMsg}" target="_blank" rel="noopener noreferrer" class="floating-whatsapp"`
);

fs.writeFileSync(file, html, 'utf8');
console.log('Blitz WhatsApp links updated successfully!');

