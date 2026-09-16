const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../templates/industrial');

const styleCss = `/* ==========================================================================
   Subzero Engine — Bespoke Architecture Template (Industrial & High-Tech)
   Identidade: Alta Precisão Técnica, Engenharia, Credibilidade e Conversão
   Paleta: Dark Obsidian (#060d1d), Electric Blue (#2563eb), Cyan Glow (#38bdf8)
   Tipografia: Montserrat (Títulos) + Inter (Corpo)
   ========================================================================== */

:root {
  --obsidian-dark: #060d1d;
  --obsidian-card: #0b152d;
  --obsidian-card-hover: #101e3e;
  --obsidian-border: rgba(56, 189, 248, 0.18);
  --blue-primary: #2563eb;
  --blue-hover: #1d4ed8;
  --cyan-accent: #38bdf8;
  --cyan-tint: rgba(56, 189, 248, 0.12);
  --gold-accent: #f59e0b;
  --text-light: #f8fafc;
  --text-muted-light: #94a3b8;

  --paper-bg: #f8fafc;
  --paper-card: #ffffff;
  --paper-text: #0f172a;
  --paper-muted: #475569;
  --paper-border: #e2e8f0;

  --whatsapp: #25d366;
  --whatsapp-hover: #20ba59;

  --font-heading: 'Montserrat', sans-serif;
  --font-body: 'Inter', sans-serif;

  --shadow-sm: 0 4px 14px rgba(6, 13, 29, 0.08);
  --shadow-md: 0 12px 32px rgba(6, 13, 29, 0.14);
  --shadow-glow: 0 0 25px rgba(56, 189, 248, 0.22);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
  background: var(--obsidian-dark);
}

body {
  font-family: var(--font-body);
  color: var(--paper-text);
  background: var(--paper-bg);
  overflow-x: hidden;
  padding-top: 76px;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
  letter-spacing: -0.025em;
}

/* ==========================================================================
   Header & Smart Headroom Navbar
   ========================================================================== */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 76px;
  background: rgba(6, 13, 29, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
  z-index: 1000;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease;
}

.header.headroom--unpinned {
  transform: translateY(-100%);
}

.header.headroom--pinned {
  transform: translateY(0);
}

.header-container {
  max-width: 1240px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-light);
}

.brand-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  border: 1px solid rgba(56, 189, 248, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
}

.brand-icon svg {
  width: 22px;
  height: 22px;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #ffffff;
}

.brand-tag {
  font-size: 0.7rem;
  color: var(--cyan-accent);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  list-style: none;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-muted-light);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: #ffffff;
}

.nav-cta-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-phone {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted-light);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: color 0.2s ease;
}

.nav-phone:hover {
  color: var(--cyan-accent);
}

.btn-header-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--whatsapp);
  color: #ffffff;
  padding: 0.6rem 1.15rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);
}

.btn-header-whatsapp:hover {
  background: var(--whatsapp-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 211, 102, 0.35);
}

.menu-toggle {
  display: none;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
}

/* ==========================================================================
   Hero Section
   ========================================================================== */
.hero {
  position: relative;
  background: radial-gradient(circle at 50% 20%, #11234a 0%, #060d1d 75%);
  color: var(--text-light);
  padding: 4.5rem 1.5rem 4rem;
  overflow: hidden;
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
}

.hero-overlay-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(56, 189, 248, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.hero-container {
  max-width: 1180px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  text-align: center;
}

.hero-badge-trust {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(37, 99, 235, 0.18);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: var(--cyan-accent);
  padding: 0.4rem 1.1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.12);
}

.hero-badge-trust .stars {
  color: var(--gold-accent);
}

.hero h1 {
  font-size: clamp(2rem, 4.8vw, 3.4rem);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.25rem;
  color: #ffffff;
}

.hero h1 em {
  font-style: normal;
  background: linear-gradient(135deg, #ffffff 30%, var(--cyan-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: block;
}

.hero-subtitle {
  font-size: clamp(1rem, 1.8vw, 1.2rem);
  color: var(--text-muted-light);
  max-width: 820px;
  margin: 0 auto 2.25rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3.5rem;
}

.btn-primary-hero {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  padding: 0.95rem 1.85rem;
  border-radius: 10px;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.25s ease;
}

.btn-primary-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.48);
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

.btn-secondary-hero {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.95rem 1.75rem;
  border-radius: 10px;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.25s ease;
}

.btn-secondary-hero:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--cyan-accent);
}

.hero-highlights-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  text-align: left;
}

.hero-highlight-card {
  background: rgba(11, 21, 45, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.18);
  padding: 1.25rem;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  transition: transform 0.25s ease, border-color 0.25s ease;
}

.hero-highlight-card:hover {
  transform: translateY(-3px);
  border-color: var(--cyan-accent);
}

.highlight-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.2);
  color: var(--cyan-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.85rem;
}

.highlight-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.35rem;
}

.highlight-desc {
  font-size: 0.8rem;
  color: var(--text-muted-light);
  line-height: 1.45;
}

/* ==========================================================================
   Continuous Specifications Marquee (Subzero Standard 24s)
   ========================================================================== */
.specs-marquee-section {
  background: #040813;
  padding: 1rem 0;
  overflow: hidden;
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
  position: relative;
}

.specs-marquee-section::before,
.specs-marquee-section::after {
  content: '';
  position: absolute;
  top: 0;
  width: 100px;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.specs-marquee-section::before {
  left: 0;
  background: linear-gradient(90deg, #040813, transparent);
}

.specs-marquee-section::after {
  right: 0;
  background: linear-gradient(-90deg, #040813, transparent);
}

.specs-marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-scroll 24s linear infinite;
  gap: 2rem;
  align-items: center;
}

.specs-marquee-track:hover,
.specs-marquee-track:active {
  animation-play-state: paused;
}

.spec-pill {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: #cbd5e1;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.spec-pill .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyan-accent);
  box-shadow: 0 0 8px var(--cyan-accent);
}

@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ==========================================================================
   Section Alternating Rhythm (Gelar Architecture)
   ========================================================================== */
.section {
  padding: 5rem 1.5rem;
}

.section.light {
  background: var(--paper-bg);
  color: var(--paper-text);
}

.section.dark {
  background: var(--obsidian-dark);
  color: var(--text-light);
  border-top: 1px solid rgba(56, 189, 248, 0.15);
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
}

.section-container {
  max-width: 1240px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  max-width: 820px;
  margin: 0 auto 3.5rem;
}

.section-tag {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--blue-primary);
  margin-bottom: 0.75rem;
}

.section.dark .section-tag {
  color: var(--cyan-accent);
}

.section-header h2 {
  font-size: clamp(1.8rem, 3.6vw, 2.6rem);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.section.light .section-header h2 {
  color: #0f172a;
}

.section.light .section-header h2 span {
  color: var(--blue-primary);
  display: block;
}

.section.dark .section-header h2 {
  color: #ffffff;
}

.section.dark .section-header h2 span {
  color: var(--cyan-accent);
  display: block;
}

.section-lead {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--paper-muted);
}

.section.dark .section-lead {
  color: var(--text-muted-light);
}

/* ==========================================================================
   Diferenciais / Engenharia (Section Light)
   ========================================================================== */
.diferenciais-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.75rem;
}

.diferencial-card {
  background: var(--paper-card);
  border: 1px solid var(--paper-border);
  border-radius: 14px;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.diferencial-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: rgba(37, 99, 235, 0.4);
}

.dif-icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.1);
  color: var(--blue-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.dif-icon-circle svg {
  width: 26px;
  height: 26px;
}

.diferencial-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.diferencial-card p {
  font-size: 0.95rem;
  color: var(--paper-muted);
  line-height: 1.6;
}

/* ==========================================================================
   Obras / Vitrine Técnica de Soluções Reais (Section Dark)
   ========================================================================== */
.obras-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.obra-card {
  background: var(--obsidian-card);
  border: 1px solid var(--obsidian-border);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.obra-card:hover {
  transform: translateY(-4px);
  border-color: var(--cyan-accent);
  box-shadow: 0 14px 34px rgba(6, 13, 29, 0.45);
}

.obra-img-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #030712;
}

.obra-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.obra-card:hover .obra-img-wrapper img {
  transform: scale(1.04);
}

.obra-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(6, 13, 29, 0.88);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: var(--cyan-accent);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.35rem 0.8rem;
  border-radius: 6px;
  backdrop-filter: blur(8px);
}

.obra-content {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.obra-content h3 {
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.75rem;
}

.obra-content p {
  font-size: 0.95rem;
  color: var(--text-muted-light);
  line-height: 1.55;
  margin-bottom: 1.25rem;
}

.obra-specs-list {
  list-style: none;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.obra-specs-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.45;
}

.obra-specs-list svg {
  width: 18px;
  height: 18px;
  color: var(--cyan-accent);
  flex-shrink: 0;
  margin-top: 2px;
}

.obra-footer {
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-obra-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(37, 99, 235, 0.2);
  color: var(--cyan-accent);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0.65rem 1.15rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-obra-cta:hover {
  background: var(--blue-primary);
  color: #ffffff;
  border-color: var(--blue-primary);
}

/* ==========================================================================
   Metodologia Passo a Passo (Section Light)
   ========================================================================== */
.metodologia-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  position: relative;
}

.metodologia-card {
  background: #ffffff;
  border: 1px solid var(--paper-border);
  border-radius: 14px;
  padding: 2.25rem 2rem;
  position: relative;
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s ease;
}

.metodologia-card:hover {
  transform: translateY(-3px);
}

.step-number {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  color: #ffffff;
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.metodologia-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.metodologia-card p {
  font-size: 0.95rem;
  color: var(--paper-muted);
  line-height: 1.6;
}

/* ==========================================================================
   Avaliações / Marquee de Depoimentos (Section Dark)
   ========================================================================== */
.reviews-container {
  overflow: hidden;
  position: relative;
}

.reviews-marquee-track {
  display: flex;
  gap: 1.5rem;
  width: max-content;
  animation: reviews-scroll 28s linear infinite;
  padding: 0.5rem 0;
}

.reviews-marquee-track:hover,
.reviews-marquee-track:active {
  animation-play-state: paused;
}

@keyframes reviews-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.review-box {
  background: var(--obsidian-card);
  border: 1px solid var(--obsidian-border);
  border-radius: 14px;
  padding: 1.75rem;
  width: 360px;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
}

.review-stars {
  color: var(--gold-accent);
  font-size: 1rem;
  margin-bottom: 0.85rem;
}

.review-quote {
  font-size: 0.95rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin-bottom: 1.25rem;
  font-style: italic;
  flex-grow: 1;
}

.review-author {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 0.85rem;
}

.author-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #ffffff;
}

.review-verified {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--cyan-accent);
  font-weight: 600;
}

/* ==========================================================================
   Contato & Vistoria Técnica (Section Light)
   ========================================================================== */
.contact-card-modern {
  background: #ffffff;
  border: 1px solid var(--paper-border);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  display: grid;
  grid-template-columns: 1fr 1.1fr;
}

.contact-info-side {
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.contact-info-side h3 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.contact-info-side p {
  color: var(--paper-muted);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.contact-items-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2.25rem;
}

.contact-detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.contact-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.1);
  color: var(--blue-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-detail-text strong {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--paper-muted);
  letter-spacing: 0.04em;
  margin-bottom: 0.2rem;
}

.contact-detail-text span,
.contact-detail-text a {
  font-size: 1rem;
  color: #0f172a;
  font-weight: 600;
  text-decoration: none;
}

.contact-detail-text a:hover {
  color: var(--blue-primary);
}

.btn-contact-whatsapp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  background: var(--whatsapp);
  color: #ffffff;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.3);
  transition: all 0.25s ease;
}

.btn-contact-whatsapp:hover {
  background: var(--whatsapp-hover);
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(37, 211, 102, 0.4);
}

.contact-map-side {
  width: 100%;
  height: 100%;
  min-height: 420px;
  background: #e2e8f0;
}

.contact-map-side iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

/* ==========================================================================
   Rodapé & Assinatura Gabriel Azevedo (Regra de Ouro)
   ========================================================================== */
.footer {
  background: #030712;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 2.5rem 1.5rem;
  color: #64748b;
  font-size: 0.85rem;
}

.footer-container {
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.footer-brand {
  color: #ffffff;
  font-weight: 700;
}

.footer-signature {
  color: #94a3b8;
}

.footer-signature a {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 600;
}

.footer-signature a:hover {
  text-decoration: underline;
}

/* ==========================================================================
   Floating WhatsApp Button
   ========================================================================== */
.floating-whatsapp {
  position: fixed;
  bottom: 1.75rem;
  right: 1.75rem;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--whatsapp);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
  z-index: 999;
  text-decoration: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.floating-whatsapp:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 26px rgba(37, 211, 102, 0.6);
}

.floating-whatsapp svg {
  width: 32px;
  height: 32px;
}

/* ==========================================================================
   Scroll Reveals Granulares (Regra Subzero)
   ========================================================================== */
.stagger, .reveal-left, .reveal-right {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: 0.16s;
  will-change: opacity, transform;
}

.reveal-left {
  transform: translateX(-30px);
}

.reveal-right {
  transform: translateX(30px);
}

.stagger.visible, .reveal-left.visible, .reveal-right.visible {
  opacity: 1;
  transform: translate(0, 0);
}

/* ==========================================================================
   Mobile First Real & Responsividade
   ========================================================================== */
@media (max-width: 992px) {
  .hero-highlights-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .diferenciais-grid,
  .metodologia-grid {
    grid-template-columns: 1fr;
  }
  .obras-grid {
    grid-template-columns: 1fr;
  }
  .contact-card-modern {
    grid-template-columns: 1fr;
  }
  .contact-map-side {
    height: 320px;
    min-height: 320px;
  }
}

@media (max-width: 768px) {
  body {
    padding-top: 68px;
  }
  .header {
    height: 68px;
  }
  .nav-links,
  .nav-phone {
    display: none;
  }
  .menu-toggle {
    display: block;
  }
  .header.menu-open .nav-links {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 68px;
    left: 0;
    width: 100%;
    background: #060d1d;
    padding: 1.5rem;
    gap: 1.25rem;
    border-bottom: 1px solid rgba(56, 189, 248, 0.2);
  }
  .hero {
    padding: 3.5rem 1.25rem 3rem;
  }
  .hero-highlights-grid {
    grid-template-columns: 1fr;
  }
  .hero-actions {
    flex-direction: column;
    width: 100%;
  }
  .btn-primary-hero,
  .btn-secondary-hero {
    width: 100%;
    justify-content: center;
  }
  .contact-info-side {
    padding: 2rem 1.5rem;
  }
  .footer-container {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
}
`;

const mainJs = `/**
 * Subzero Engine — JavaScript Modular
 * Padrões Técnicos: Headroom Navbar, Granular Scroll Reveal, Infinite Tracks, Mobile Menu
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Smart Headroom Navbar (Hide on scroll down, show on scroll up)
  const header = document.querySelector('.header');
  let lastScrollY = window.scrollY;
  const scrollThreshold = 10;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (Math.abs(currentScrollY - lastScrollY) < scrollThreshold) return;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      header.classList.add('headroom--unpinned');
      header.classList.remove('headroom--pinned');
    } else if (currentScrollY < lastScrollY) {
      header.classList.add('headroom--pinned');
      header.classList.remove('headroom--unpinned');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  // 2. Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle && header) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      header.classList.toggle('menu-open');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        header.classList.remove('menu-open');
      });
    });
  }

  // 3. Scroll Reveals Granulares por Item Individual (Regra Subzero)
  const revealElements = document.querySelectorAll('.stagger, .reveal-left, .reveal-right');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -65px 0px',
      threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('visible'));
  }

  // 4. Duplicação Automática para Loop Perfeito nos Marquees
  const duplicateTrack = (selector) => {
    const track = document.querySelector(selector);
    if (!track) return;
    const content = track.innerHTML;
    track.innerHTML = content + content;
  };

  duplicateTrack('.specs-marquee-track');
  duplicateTrack('.reviews-marquee-track');
});
`;

const indexHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- SEO & Metadados -->
  <title>{{NOME_DA_EMPRESA}} | {{SLOGAN_OU_PROMESSA}}</title>
  <meta name="description" content="{{DESCRICAO_SEO_150_CARACTERES}}" />
  <meta name="keywords" content="{{PALAVRAS_CHAVE_SEPARADAS_POR_VIRGULA}}" />
  <link rel="canonical" href="https://{{SEU_DOMINIO}}/" />
  
  <!-- Favicon gerado sob demanda pelo sistema -->
  <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
  <meta name="theme-color" content="#060d1d" />

  <!-- Tipografia: Montserrat (Títulos) + Inter (Corpo) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800;900&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="./src/style.css" />
</head>
<body>
  <!-- Biblioteca de Ícones SVG -->
  <svg style="display: none;" aria-hidden="true">
    <symbol id="icon-brand" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
    </symbol>
    <symbol id="icon-bolt" viewBox="0 0 24 24">
      <path fill="currentColor" d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66c.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/>
    </symbol>
    <symbol id="icon-check" viewBox="0 0 24 24">
      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </symbol>
    <symbol id="icon-phone" viewBox="0 0 24 24">
      <path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24c1.12.37 2.33.57 3.57.57c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1c-9.39 0-17-7.61-17-17c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </symbol>
    <symbol id="icon-map-pin" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </symbol>
    <symbol id="icon-clock" viewBox="0 0 24 24">
      <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </symbol>
    <symbol id="wa" viewBox="0 0 24 24">
      <path fill="currentColor" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.79.98c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.5c.11-.11.25-.29.37-.43c.12-.14.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.23.25-.87.85-.87 2.08s.89 2.42 1.01 2.59c.12.17 1.75 2.67 4.24 3.74c.59.26 1.05.41 1.41.53c.6.19 1.14.16 1.57.1c.48-.07 1.47-.6 1.68-1.18c.21-.58.21-1.07.14-1.18c-.06-.11-.22-.17-.47-.29z"/>
    </symbol>
  </svg>

  <!-- Cabeçalho / Navbar Inteligente (Headroom) -->
  <header class="header">
    <div class="header-container">
      <a href="#inicio" class="brand-logo" aria-label="{{NOME_DA_EMPRESA}} Início">
        <div class="brand-icon">
          <svg><use href="#icon-brand"/></svg>
        </div>
        <div class="brand-text">
          <span class="brand-name">{{NOME_DA_EMPRESA}}</span>
          <span class="brand-tag">Atendimento Oficial</span>
        </div>
      </a>

      <ul class="nav-links">
        <li><a href="#diferenciais">Diferenciais</a></li>
        <li><a href="#obras">Serviços & Obras</a></li>
        <li><a href="#metodologia">Como Funciona</a></li>
        <li><a href="#avaliacoes">Depoimentos</a></li>
        <li><a href="#contato">Contato</a></li>
      </ul>

      <div class="nav-cta-group">
        <a href="tel:{{TELEFONE_DIGITOS}}" class="nav-phone" title="Ligar para {{NOME_DA_EMPRESA}}">
          <svg width="16" height="16"><use href="#icon-phone"/></svg>
          <span>{{TELEFONE_FORMATADO}}</span>
        </a>
        <a href="{{LINK_WHATSAPP_COM_MENSAGEM}}" target="_blank" rel="noopener noreferrer" class="btn-header-whatsapp">
          <svg width="16" height="16"><use href="#wa"/></svg>
          <span>Atendimento WhatsApp</span>
        </a>
      </div>

      <button class="menu-toggle" aria-label="Abrir Menu" aria-expanded="false">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>
  </header>

  <!-- Hero Section (Obsidian Dark) -->
  <section class="hero" id="inicio">
    <div class="hero-overlay-grid"></div>
    <div class="hero-container">
      <div class="hero-badge-trust stagger">
        <span class="stars">★★★★★</span>
        <span>Referência em Qualidade • Avaliações Reais • {{CIDADE_UF}}</span>
      </div>

      <h1 class="stagger">
        {{TITULO_PRINCIPAL}}
      </h1>

      <p class="hero-subtitle stagger">
        {{TEXTO_DE_APRESENTACAO_DA_EMPRESA_FOCO_EM_CONFIANCA_E_QUALIDADE}}
      </p>

      <div class="hero-actions stagger">
        <a href="{{LINK_WHATSAPP_COM_MENSAGEM}}" target="_blank" rel="noopener noreferrer" class="btn-primary-hero">
          <svg width="20" height="20"><use href="#wa"/></svg>
          <span>Conversar no WhatsApp</span>
        </a>
        <a href="#obras" class="btn-secondary-hero">
          <span>Conhecer Soluções</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </a>
      </div>

      <div class="hero-highlights-grid">
        <div class="hero-highlight-card stagger">
          <div class="highlight-icon-box">
            <svg width="22" height="22"><use href="#icon-brand"/></svg>
          </div>
          <h3 class="highlight-title">{{NOME_SERVICO_1}}</h3>
          <p class="highlight-desc">{{DESCRICAO_SERVICO_1}}</p>
        </div>

        <div class="hero-highlight-card stagger">
          <div class="highlight-icon-box">
            <svg width="22" height="22"><use href="#icon-bolt"/></svg>
          </div>
          <h3 class="highlight-title">{{NOME_SERVICO_2}}</h3>
          <p class="highlight-desc">{{DESCRICAO_SERVICO_2}}</p>
        </div>

        <div class="hero-highlight-card stagger">
          <div class="highlight-icon-box">
            <svg width="22" height="22"><use href="#icon-check"/></svg>
          </div>
          <h3 class="highlight-title">{{NOME_SERVICO_3}}</h3>
          <p class="highlight-desc">{{DESCRICAO_SERVICO_3}}</p>
        </div>

        <div class="hero-highlight-card stagger">
          <div class="highlight-icon-box">
            <svg width="22" height="22"><use href="#icon-phone"/></svg>
          </div>
          <h3 class="highlight-title">{{NOME_SERVICO_4}}</h3>
          <p class="highlight-desc">{{DESCRICAO_SERVICO_4}}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Continuous Specifications Marquee (Subzero Standard 24s Loop) -->
  <section class="specs-marquee-section" aria-label="Destaques e Qualidade">
    <div class="specs-marquee-track">
      <div class="spec-pill"><span class="dot"></span>ATENDIMENTO ESPECIALIZADO</div>
      <div class="spec-pill"><span class="dot"></span>EQUIPE TÉCNICA CAPACITADA</div>
      <div class="spec-pill"><span class="dot"></span>MATERIAIS DE PRIMEIRA LINHA</div>
      <div class="spec-pill"><span class="dot"></span>PONTUALIDADE E COMPROMISSO</div>
      <div class="spec-pill"><span class="dot"></span>GARANTIA EM TODOS OS SERVIÇOS</div>
      <div class="spec-pill"><span class="dot"></span>TRANSPARÊNCIA TOTAL NO ORÇAMENTO</div>
      <div class="spec-pill"><span class="dot"></span>SUPORTE ÁGIL NO WHATSAPP</div>
    </div>
  </section>

  <!-- Section Light: Diferenciais Técnicos -->
  <section class="section light" id="diferenciais">
    <div class="section-container">
      <div class="section-header stagger">
        <span class="section-tag">Por que Nos Escolher</span>
        <h2>{{TITULO_DIFERENCIAIS_LINHA_1}}<br/><span>{{TITULO_DIFERENCIAIS_LINHA_2}}</span></h2>
        <p class="section-lead">{{SUBTEXTO_DE_AUTORIDADE_E_CONFIANCA}}</p>
      </div>

      <div class="diferenciais-grid">
        <div class="diferencial-card stagger">
          <div class="dif-icon-circle">
            <svg><use href="#icon-brand"/></svg>
          </div>
          <h3>{{TITULO_DIFERENCIAL_1}}</h3>
          <p>{{DESCRICAO_DIFERENCIAL_1}}</p>
        </div>

        <div class="diferencial-card stagger">
          <div class="dif-icon-circle">
            <svg><use href="#icon-bolt"/></svg>
          </div>
          <h3>{{TITULO_DIFERENCIAL_2}}</h3>
          <p>{{DESCRICAO_DIFERENCIAL_2}}</p>
        </div>

        <div class="diferencial-card stagger">
          <div class="dif-icon-circle">
            <svg><use href="#icon-check"/></svg>
          </div>
          <h3>{{TITULO_DIFERENCIAL_3}}</h3>
          <p>{{DESCRICAO_DIFERENCIAL_3}}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section Dark: Vitrine Técnica / Obras Entregues -->
  <section class="section dark" id="obras">
    <div class="section-container">
      <div class="section-header stagger">
        <span class="section-tag">Soluções Entregues</span>
        <h2>Fotografia Real de Soluções Executadas<br/><span>Equipamentos certificados e acabamento de alto padrão.</span></h2>
        <p class="section-lead">Confira a qualidade do atendimento e o padrão técnico que entregamos em {{CIDADE_UF}}:</p>
      </div>

      <div class="obras-grid">
        <!-- Card 1 -->
        <div class="obra-card stagger">
          <div class="obra-img-wrapper">
            <img src="./img/hero.jpg" alt="{{NOME_SERVICO_1}}" loading="lazy" />
            <span class="obra-badge">Especialidade</span>
          </div>
          <div class="obra-content">
            <h3>{{NOME_SERVICO_1}}</h3>
            <p>{{DESCRICAO_SERVICO_1}}</p>
            <ul class="obra-specs-list">
              <li><svg><use href="#icon-check"/></svg> Execução com materiais normatizados e alta durabilidade</li>
              <li><svg><use href="#icon-check"/></svg> Profissionais qualificados e atendimento cuidadoso</li>
              <li><svg><use href="#icon-check"/></svg> Garantia formal em cada serviço realizado</li>
            </ul>
            <div class="obra-footer">
              <a href="{{LINK_WHATSAPP_COM_MENSAGEM}}" target="_blank" rel="noopener noreferrer" class="btn-obra-cta">
                <span>Conversar no WhatsApp</span>
                <svg width="16" height="16"><use href="#wa"/></svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="obra-card stagger">
          <div class="obra-img-wrapper">
            <img src="./img/workshop.jpg" alt="{{NOME_SERVICO_2}}" loading="lazy" />
            <span class="obra-badge">Qualidade Garantida</span>
          </div>
          <div class="obra-content">
            <h3>{{NOME_SERVICO_2}}</h3>
            <p>{{DESCRICAO_SERVICO_2}}</p>
            <ul class="obra-specs-list">
              <li><svg><use href="#icon-check"/></svg> Diagnóstico detalhado e orçamento sem surpresas</li>
              <li><svg><use href="#icon-check"/></svg> Agilidade no prazo e respeito à sua rotina</li>
              <li><svg><use href="#icon-check"/></svg> Suporte direto pós-atendimento</li>
            </ul>
            <div class="obra-footer">
              <a href="{{LINK_WHATSAPP_COM_MENSAGEM}}" target="_blank" rel="noopener noreferrer" class="btn-obra-cta">
                <span>Conversar no WhatsApp</span>
                <svg width="16" height="16"><use href="#wa"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section Light: Metodologia Passo a Passo -->
  <section class="section light" id="metodologia">
    <div class="section-container">
      <div class="section-header stagger">
        <span class="section-tag">Passo a Passo</span>
        <h2>Como Funciona Nosso Atendimento<br/><span>Simplicidade, agilidade e clareza do início ao fim.</span></h2>
        <p class="section-lead">Da primeira conversa no WhatsApp até a conclusão com satisfação garantida.</p>
      </div>

      <div class="metodologia-grid">
        <div class="metodologia-card stagger">
          <div class="step-number">1</div>
          <h3>Contato & Entendimento Rápido</h3>
          <p>Você nos envia sua necessidade pelo WhatsApp. Respondemos prontamente para entender os detalhes do projeto ou serviço.</p>
        </div>

        <div class="metodologia-card stagger">
          <div class="step-number">2</div>
          <h3>Orçamento Transparente e Sem Surpresas</h3>
          <p>Apresentamos a proposta clara, com prazos realistas e materiais adequados, alinhando exatamente cada etapa antes da execução.</p>
        </div>

        <div class="metodologia-card stagger">
          <div class="step-number">3</div>
          <h3>Execução com Limpeza e Garantia</h3>
          <p>Nossa equipe realiza o trabalho com extremo capricho técnico, testa o resultado e entrega o serviço com garantia e nota.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section Dark: Avaliações do Google Maps -->
  <section class="section dark" id="avaliacoes">
    <div class="section-container">
      <div class="section-header stagger">
        <span class="section-tag">Avaliações Reais</span>
        <h2>O que Nossos Clientes Dizem<br/><span>Confiança comprovada por quem já contratou.</span></h2>
        <p class="section-lead">Depoimentos reais de clientes satisfeitos com o nosso padrão de qualidade em {{CIDADE_UF}}.</p>
      </div>

      <div class="reviews-container">
        <div class="reviews-marquee-track">
          <div class="review-box">
            <div class="review-stars">★★★★★</div>
            <p class="review-quote">"{{DEPOIMENTO_DO_CLIENTE_1}}"</p>
            <div class="review-author">
              <span class="author-name">{{NOME_DO_CLIENTE_1}}</span>
              <span class="review-verified"><svg width="14" height="14"><use href="#icon-check"/></svg> Google Maps</span>
            </div>
          </div>

          <div class="review-box">
            <div class="review-stars">★★★★★</div>
            <p class="review-quote">"{{DEPOIMENTO_DO_CLIENTE_2}}"</p>
            <div class="review-author">
              <span class="author-name">{{NOME_DO_CLIENTE_2}}</span>
              <span class="review-verified"><svg width="14" height="14"><use href="#icon-check"/></svg> Google Maps</span>
            </div>
          </div>

          <div class="review-box">
            <div class="review-stars">★★★★★</div>
            <p class="review-quote">"{{DEPOIMENTO_DO_CLIENTE_3}}"</p>
            <div class="review-author">
              <span class="author-name">{{NOME_DO_CLIENTE_3}}</span>
              <span class="review-verified"><svg width="14" height="14"><use href="#icon-check"/></svg> Google Maps</span>
            </div>
          </div>

          <div class="review-box">
            <div class="review-stars">★★★★★</div>
            <p class="review-quote">"{{DEPOIMENTO_DO_CLIENTE_4}}"</p>
            <div class="review-author">
              <span class="author-name">{{NOME_DO_CLIENTE_4}}</span>
              <span class="review-verified"><svg width="14" height="14"><use href="#icon-check"/></svg> Google Maps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section Light: Contato & Localização -->
  <section class="section light" id="contato">
    <div class="section-container">
      <div class="section-header stagger">
        <span class="section-tag">Atendimento Local</span>
        <h2>Fale com a Nossa Equipe Hoje<br/><span>Tire suas dúvidas ou solicite seu orçamento direto no WhatsApp.</span></h2>
        <p class="section-lead">{{TEXTO_CHAMADA_CONTATO}}</p>
      </div>

      <div class="contact-card-modern stagger">
        <div class="contact-info-side">
          <h3>Estamos Prontos para te Atender</h3>
          <p>Atendimento comercial e técnico em {{CIDADE_UF}} e região.</p>

          <div class="contact-items-list">
            <div class="contact-detail-item">
              <div class="contact-icon-box">
                <svg width="20" height="20"><use href="#icon-map-pin"/></svg>
              </div>
              <div class="contact-detail-text">
                <strong>Localização</strong>
                <span>{{ENDERECO_COMPLETO_DO_GOOGLE_MAPS}}</span>
              </div>
            </div>

            <div class="contact-detail-item">
              <div class="contact-icon-box">
                <svg width="20" height="20"><use href="#icon-phone"/></svg>
              </div>
              <div class="contact-detail-text">
                <strong>WhatsApp & Telefone</strong>
                <span><a href="{{LINK_WHATSAPP_COM_MENSAGEM}}" target="_blank" rel="noopener noreferrer">{{WHATSAPP_FORMATADO}}</a></span>
              </div>
            </div>

            <div class="contact-detail-item">
              <div class="contact-icon-box">
                <svg width="20" height="20"><use href="#icon-clock"/></svg>
              </div>
              <div class="contact-detail-text">
                <strong>Horário de Funcionamento</strong>
                <span>{{HORARIO_COMPLETO}}</span>
              </div>
            </div>
          </div>

          <a href="{{LINK_WHATSAPP_COM_MENSAGEM}}" target="_blank" rel="noopener noreferrer" class="btn-contact-whatsapp">
            <svg width="22" height="22"><use href="#wa"/></svg>
            <span>Conversar no WhatsApp Agora</span>
          </a>
        </div>

        <div class="contact-map-side">
          <iframe 
            src="https://maps.google.com/maps?q={{ENDERECO_URL_ENCODED}}&t=&z=15&ie=UTF8&iwloc=&output=embed" 
            title="Localização {{NOME_DA_EMPRESA}}" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    </div>
  </section>

  <!-- Rodapé & Assinatura Gabriel Azevedo (Regra de Ouro) -->
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-brand">
        © 2026 {{NOME_DA_EMPRESA}}. Todos os direitos reservados.
      </div>
      <div class="footer-signature">
        Desenvolvido por <a href="https://wa.me/5516992048856?text=Ol%C3%A1%20Gabriel!%20Vi%20o%20site%20da%20{{NOME_DA_EMPRESA}}%20e%20gostaria%20de%20um%20projeto." target="_blank" rel="noopener noreferrer">Gabriel Azevedo</a> • (16) 99204-8856
      </div>
    </div>
  </footer>

  <!-- Botão Flutuante de WhatsApp -->
  <a href="{{LINK_WHATSAPP_COM_MENSAGEM}}" target="_blank" rel="noopener noreferrer" class="floating-whatsapp" aria-label="Falar pelo WhatsApp">
    <svg><use href="#wa"/></svg>
  </a>

  <script src="./src/main.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(targetDir, 'src/style.css'), styleCss, 'utf8');
fs.writeFileSync(path.join(targetDir, 'src/main.js'), mainJs, 'utf8');
fs.writeFileSync(path.join(targetDir, 'index.html'), indexHtml, 'utf8');

console.log('Subzero Bespoke template built successfully in templates/industrial!');
