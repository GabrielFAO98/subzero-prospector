/**
 * Architectural Archetype Engine
 * Vanilla JavaScript Modular (Subzero Engine Standard)
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmartHeadroom();
  initGranularScrollAnimations();
  initVerticalTestimonialsMarquee();
  initPortfolioDragScroll();
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
 * Carrossel Vertical Contínuo de Avaliações (Estilo Arcofran)
 * Duplicação automática para loop vertical sem saltos
 */
function initVerticalTestimonialsMarquee() {
  const track = document.querySelector('.testimonial-track');
  if (!track) return;

  // Duplica os cards para permitir rotação contínua perfeita
  const cards = Array.from(track.children);
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
}

/**
 * Suporte a Arrastar (Drag to Scroll) na Galeria Horizontal de Projetos
 */
function initPortfolioDragScroll() {
  const slider = document.querySelector('.portfolio-gallery-scroll');
  if (!slider) return;

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('cursor-grabbing');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('cursor-grabbing');
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('cursor-grabbing');
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5;
    slider.scrollLeft = scrollLeft - walk;
  });
}

/**
 * Menu Hambúrguer Mobile (Clean, 2 Linhas - Arcofran Inspiration)
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuToggle');
  const mobileNav = document.getElementById('mobileNavDrawer');
  if (!menuBtn || !mobileNav) return;

  const toggle = () => {
    const isClosed = mobileNav.classList.contains('hidden');
    if (isClosed) {
      mobileNav.classList.remove('hidden');
      mobileNav.classList.add('flex');
      document.body.style.overflow = 'hidden';
    } else {
      mobileNav.classList.add('hidden');
      mobileNav.classList.remove('flex');
      document.body.style.overflow = '';
    }
  };

  menuBtn.addEventListener('click', toggle);

  // Fecha o menu ao clicar em qualquer link de ancoragem
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.add('hidden');
      mobileNav.classList.remove('flex');
      document.body.style.overflow = '';
    });
  });
}
