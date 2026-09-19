/**
 * Architectural Archetype Engine
 * Vanilla JavaScript Modular (Subzero Engine Standard)
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmartHeadroom();
  initGranularScrollAnimations();
  initMobileMenu();
  initGalleryDragScroll();
});

/**
 * Smart Headroom Navbar
 * Oculta ao rolar para baixo, reaparece de imediato ao rolar para cima
 */
function initSmartHeadroom() {
  const header = document.querySelector('.smart-header');
  if (!header) return;

  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  const scrollThreshold = 8;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Sombra ao rolar além do topo
    if (currentScrollY > 30) {
      header.classList.add('shadow-md');
    } else {
      header.classList.remove('shadow-md');
    }

    if (Math.abs(currentScrollY - lastScrollY) < scrollThreshold) return;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
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
 * Animações de Scroll Granulares (Subzero Engine)
 * Disparo por item individual com timing intencional (0.84 * innerHeight)
 */
function initGranularScrollAnimations() {
  const revealElements = document.querySelectorAll('.subzero-reveal');
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
 * Menu Mobile Drawer (Hambúrguer de 2 linhas estilo Arcofran)
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    drawer.classList.toggle('hidden');
    drawer.classList.toggle('flex');
  });

  // Fecha menu ao clicar em qualquer link interno
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.add('hidden');
      drawer.classList.remove('flex');
    });
  });
}

/**
 * Suporte a Arrastar (Drag-to-Scroll) na Galeria Horizontal com Mouse
 */
function initGalleryDragScroll() {
  const gallery = document.querySelector('.portfolio-gallery-scroll');
  if (!gallery) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  gallery.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - gallery.offsetLeft;
    scrollLeft = gallery.scrollLeft;
  });

  gallery.addEventListener('mouseleave', () => {
    isDown = false;
  });

  gallery.addEventListener('mouseup', () => {
    isDown = false;
  });

  gallery.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - gallery.offsetLeft;
    const walk = (x - startX) * 1.5;
    gallery.scrollLeft = scrollLeft - walk;
  });
}
