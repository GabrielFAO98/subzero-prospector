/**
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
      const willOpen = !isExpanded;
      menuToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      header.classList.toggle('menu-open', willOpen);
      document.body.classList.toggle('menu-open-scroll-lock', willOpen);
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        header.classList.remove('menu-open');
        document.body.classList.remove('menu-open-scroll-lock');
      });
    });
  }

  // 3. Scroll Reveals Granulares por Item Individual (Regra Subzero) com Proteção Total Contra Void
  const revealElements = document.querySelectorAll('.stagger, .reveal-left, .reveal-right');

  // Revela o Hero imediatamente para visualização instantânea no carregamento
  document.querySelectorAll('.hero .stagger').forEach(el => el.classList.add('visible'));

  const makeVisible = (el) => el.classList.add('visible');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          makeVisible(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px 50px 0px',
      threshold: 0.05
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(makeVisible);
  }

  // Safety Fallback Universal: garante que em capturas automatizadas, iframes ou rolagem rápida nada fique invisível
  const ensureVisibility = () => {
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 350) {
        makeVisible(el);
      }
    });
  };

  setTimeout(ensureVisibility, 350);
  setTimeout(() => {
    revealElements.forEach(makeVisible);
  }, 1200);

  window.addEventListener('scroll', ensureVisibility, { passive: true });

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
