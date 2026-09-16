/**
 * Arcofran - Interactive Behaviors
 * Handles infinite testimonial marquee, scroll reveals,
 * smart headroom navbar (shows on scroll up), and mobile menu.
 */

function initArcofran() {
  // 1. Duplicate Testimonial Track Content for Seamless Infinite Loop
  const testimonialTrack = document.querySelector('.testimonial-track');
  if (testimonialTrack && !testimonialTrack.dataset.duplicated) {
    testimonialTrack.innerHTML += testimonialTrack.innerHTML;
    testimonialTrack.dataset.duplicated = 'true';
  }

  // 2. Scroll Reveal Animations (Robust IntersectionObserver + Scroll Sync)
  const animatedElements = document.querySelectorAll(
    '.stagger, .reveal-left, .reveal-right, .reveal-scale, .image-reveal'
  );

  const checkReveals = () => {
    const triggerBottom = window.innerHeight * 0.84;
    animatedElements.forEach((el) => {
      if (!el.classList.contains('visible')) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerBottom) {
          el.classList.add('visible');
        }
      }
    });
  };

  // Check on initial load with slight beat so entry is visible
  setTimeout(checkReveals, 100);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting, boundingClientRect }) => {
          if (isIntersecting || (boundingClientRect && boundingClientRect.top <= window.innerHeight * 0.84)) {
            target.classList.add('visible');
            observer.unobserve(target);
          }
        });
      },
      { threshold: [0, 0.08], rootMargin: '0px 0px -65px 0px' }
    );

    animatedElements.forEach((el) => {
      if (!el.classList.contains('visible')) {
        observer.observe(el);
      }
    });
  } else {
    animatedElements.forEach((el) => el.classList.add('visible'));
  }

  // 3. Smart Header: Hides on scroll down, reappears on scroll up!
  const header = document.querySelector('.header');
  const nav = document.querySelector('nav');
  let lastScrollY = window.pageYOffset || window.scrollY || 0;
  let ticking = false;

  const handleScroll = () => {
    const currentScrollY = window.pageYOffset || window.scrollY || 0;
    const isMenuOpen = nav && nav.classList.contains('open');

    // Run reveal checks on scroll to guarantee zero dropped animations
    checkReveals();

    // Toggle background shadow
    if (header) {
      header.classList.toggle('scrolled', currentScrollY > 15);

      // Hide when scrolling down, show when scrolling up
      if (!isMenuOpen) {
        if (currentScrollY <= 40) {
          // Near the very top -> always visible
          header.classList.remove('header--hidden');
        } else if (currentScrollY > 80 && currentScrollY > lastScrollY + 5) {
          // Scrolling down -> hide smoothly
          header.classList.add('header--hidden');
        } else if (currentScrollY < lastScrollY - 5) {
          // Scrolling up -> reveal immediately
          header.classList.remove('header--hidden');
        }
      }
    }

    lastScrollY = Math.max(0, currentScrollY);
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  // 4. Mobile Navigation Menu Toggle & Auto-Close
  const menuToggle = document.querySelector('.menu-toggle');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen && header) {
        header.classList.remove('header--hidden');
      }
    });

    // Close menu when clicking any navigation link
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (
        nav.classList.contains('open') &&
        !nav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// Execute immediately if DOM is ready, otherwise on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initArcofran);
} else {
  initArcofran();
}
