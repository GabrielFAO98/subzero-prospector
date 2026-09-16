/**
 * Blitz Segurança Eletrônica — Subzero Engine JavaScript Module
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
