/**
 * Saúde Vet — Pet Shop e Clínica Veterinária Subzero Engine JavaScript
 * Headroom Navbar, Granular Scroll Reveal, Infinite Tracks, Mobile Menu
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Smart Headroom Navbar
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

    document.querySelectorAll('.header nav a').forEach(link => {
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
  const brandsTrack = document.querySelector('.brands-track');
  if (brandsTrack) {
    brandsTrack.innerHTML += brandsTrack.innerHTML;
  }

  const revTrack = document.querySelector('.rev-track');
  if (revTrack) {
    revTrack.innerHTML += revTrack.innerHTML;
  }

  // 5. Carrossel de Serviços com Setas e Indicadores (Dots)
  const svcTrack = document.getElementById('svcTrack');
  const svcPrevBtn = document.getElementById('svcPrevBtn');
  const svcNextBtn = document.getElementById('svcNextBtn');
  const svcDots = document.querySelectorAll('#svcDots .dot');

  if (svcTrack && svcPrevBtn && svcNextBtn) {
    const getCardWidth = () => {
      const card = svcTrack.querySelector('.service-photo-card');
      return card ? card.offsetWidth + 20 : 320;
    };

    svcPrevBtn.addEventListener('click', () => {
      svcTrack.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
    });

    svcNextBtn.addEventListener('click', () => {
      svcTrack.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
    });

    svcTrack.addEventListener('scroll', () => {
      const step = getCardWidth();
      const activeIdx = Math.min(svcDots.length - 1, Math.max(0, Math.round(svcTrack.scrollLeft / step)));
      svcDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIdx);
      });
    }, { passive: true });

    svcDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index, 10);
        svcTrack.scrollTo({ left: idx * getCardWidth(), behavior: 'smooth' });
      });
    });
  }
});

