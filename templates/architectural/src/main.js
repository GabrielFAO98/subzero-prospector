/**
 * Atelier Structural — Architectural Archetype Engine
 * Vanilla JavaScript Modular (Subzero Engine Standard)
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmartHeadroom();
  initGranularScrollAnimations();
  initMarqueeLoop();
  initPortfolioFilters();
  initMobileMenu();
});

/**
 * Smart Headroom Navbar
 * Oculta ao rolar para baixo, reaparece de imediato ao rolar para cima
 */
function initSmartHeadroom() {
  const header = document.querySelector('.smart-header');
  if (!header) return;

  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  const scrollThreshold = 10;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Background blur & border ao rolar além do topo
    if (currentScrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Lógica de direção de rolagem
    if (Math.abs(currentScrollY - lastScrollY) < scrollThreshold) return;

    if (currentScrollY > lastScrollY && currentScrollY > 120) {
      // Rolando para baixo
      header.classList.add('headroom--unpinned');
      header.classList.remove('headroom--pinned');
    } else {
      // Rolando para cima
      header.classList.add('headroom--pinned');
      header.classList.remove('headroom--unpinned');
    }

    lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
  }, { passive: true });
}

/**
 * Animações de Scroll Granulares
 * Disparo por item individual com timing intencional (0.84 * innerHeight)
 */
function initGranularScrollAnimations() {
  const revealElements = document.querySelectorAll('.subzero-reveal, .subzero-reveal-left');
  if (!revealElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -65px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));
}

/**
 * Duplicação Automática do Marquee de Avaliações
 * Garante loop contínuo perfeito sem saltos visuais
 */
function initMarqueeLoop() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  // Duplica os cards para preenchimento de 100% da largura
  const cards = Array.from(track.children);
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
}

/**
 * Filtro Interativo do Portfólio de Obras
 */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-pill-btn');
  const projectCards = document.querySelectorAll('.project-card-item');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-primary-container', 'text-on-primary-container', 'border-primary-container');
        b.classList.add('bg-transparent', 'text-on-surface-variant', 'border-outline-variant');
      });

      btn.classList.remove('bg-transparent', 'text-on-surface-variant', 'border-outline-variant');
      btn.classList.add('bg-primary-container', 'text-on-primary-container', 'border-primary-container');

      const filter = btn.getAttribute('data-filter') || 'all';

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category') || 'all';
        if (filter === 'all' || category === filter || category.includes(filter)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/**
 * Menu Mobile Drawer
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuToggle');
  const mobileNav = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('closeMobileNav');

  if (!menuBtn || !mobileNav) return;

  const toggle = () => {
    const isOpen = mobileNav.classList.contains('open');
    if (isOpen) {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    } else {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  menuBtn.addEventListener('click', toggle);
  if (closeBtn) closeBtn.addEventListener('click', toggle);

  // Fecha menu ao clicar em links
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

