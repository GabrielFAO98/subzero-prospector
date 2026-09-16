/**
 * Kell Distribuidora — Subzero Engine JavaScript Module
 * Padrões Técnicos: Headroom Navbar, Granular Scroll Reveal, Infinite Tracks
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

  // 2. Scroll Reveals Granulares por Item Individual (Regra Subzero)
  const revealElements = document.querySelectorAll('.stagger, .reveal-left, .reveal-right, .catalog-card, .diff-card');
  
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

  // 3. Duplicação Automática para Loop Perfeito nos Marquees
  const brandsTrack = document.querySelector('.brands-track');
  if (brandsTrack) {
    brandsTrack.innerHTML += brandsTrack.innerHTML;
  }

  const testTrack = document.querySelector('.testimonial-track');
  if (testTrack) {
    testTrack.innerHTML += testTrack.innerHTML;
  }
});
