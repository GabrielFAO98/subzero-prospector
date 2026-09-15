/**
 * Subzero Clinical — Engine JavaScript
 * Smart Headroom Navbar, Granular Scroll Reveal, Infinite Loops, Mobile Nav
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Smart Headroom Navbar
  const header = document.querySelector('.header');
  let lastScrollY = window.scrollY;
  const scrollThreshold = 8;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (Math.abs(currentScrollY - lastScrollY) < scrollThreshold) return;

    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      header.classList.add('headroom--unpinned');
      header.classList.remove('headroom--pinned');
    } else if (currentScrollY < lastScrollY) {
      header.classList.add('headroom--pinned');
      header.classList.remove('headroom--unpinned');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  // 2. Scroll Reveals Granulares por Item Individual (Diretriz Subzero Engine)
  const staggerItems = document.querySelectorAll('.stagger');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -65px 0px',
      threshold: 0.15
    });

    staggerItems.forEach(el => observer.observe(el));
  } else {
    staggerItems.forEach(el => el.classList.add('visible'));
  }

  // 3. Duplicação Automática para Loop Perfeito nos Marquees
  const marqueeTracks = document.querySelectorAll('.marquee-track, .rev-track');
  marqueeTracks.forEach(track => {
    if (track) {
      track.innerHTML += track.innerHTML;
    }
  });

  // 4. Carrossel de Serviços com Setas
  const svcTrack = document.getElementById('svcTrack');
  const prevBtn = document.getElementById('svcPrevBtn');
  const nextBtn = document.getElementById('svcNextBtn');

  if (svcTrack && prevBtn && nextBtn) {
    const getStep = () => {
      const card = svcTrack.querySelector('.service-card');
      return card ? card.offsetWidth + 20 : 320;
    };

    prevBtn.addEventListener('click', () => {
      svcTrack.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      svcTrack.scrollBy({ left: getStep(), behavior: 'smooth' });
    });
  }
});
