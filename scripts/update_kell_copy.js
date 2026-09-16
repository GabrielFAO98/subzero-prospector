const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../previews/kell-distribuidora/index.html');
let html = fs.readFileSync(file, 'utf8');

const standardMsg = encodeURIComponent('Olá! Vim pelo site da Kell Distribuidora e gostaria de conversar com um atendente.');

// Replace ALL wa.me links for Kell with the standard message
html = html.replace(
  /href="https:\/\/wa\.me\/551692012222(\?text=[^"]*)?"/g,
  `href="https://wa.me/551692012222?text=${standardMsg}"`
);

// Menu link
html = html.replace('<li><a href="#contato">Balcão</a></li>', '<li><a href="#contato">Contato</a></li>');

// Header button text
html = html.replace('Falar no Balcão', 'Atendimento WhatsApp');

// Hero button text
html = html.replace('Solicitar Tabela de Atacado no WhatsApp', 'Conversar no WhatsApp');

// Differentials
html = html.replace('no nosso balcão em Franca', 'na nossa loja em Franca');
html = html.replace('<h3>Suporte Técnico de Balcão</h3>', '<h3>Suporte Técnico Especializado</h3>');

// Structure
html = html.replace('<h3>Estoque Físico e Balcão no Jardim Ângela Rosa</h3>', '<h3>Estoque Físico e Loja no Jardim Ângela Rosa</h3>');
html = html.replace('Consultar Disponibilidade de Itens', 'Consultar Disponibilidade no WhatsApp');

// Contact
html = html.replace('<!-- CONTATO E BALCÃO (SECTION LIGHT) -->', '<!-- CONTATO (SECTION LIGHT) -->');
html = html.replace('<div class="badge-direct">BALCÃO DE ATENDIMENTO</div>', '<div class="badge-direct">ATENDIMENTO RÁPIDO</div>');
html = html.replace('<h2>Fale com Nosso Balcão <span>e Garanta Seus Preços</span></h2>', '<h2>Fale com Nossa Equipe <span>e Garanta Seus Preços</span></h2>');
html = html.replace('<strong>Endereço do Balcão</strong>', '<strong>Endereço da Loja</strong>');
html = html.replace('Chamar Balcão no WhatsApp Agora', 'Conversar no WhatsApp Agora');

fs.writeFileSync(file, html, 'utf8');
console.log('Updated all Kell links and text!');

