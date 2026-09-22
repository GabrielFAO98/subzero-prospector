/**
 * ANA MARCONI STORYMAKER - ORQUESTRAÇÃO DE ANIMAÇÕES & MÍDIA
 * Referência de Capa: giovannavital.com.br
 * Direção de Arte: Transições fluidas, cadência cinematográfica e luxo silencioso
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroExperience();
  initCinemaShowcaseVideo();
  initStorymakingCardsInteraction();
  initPortfolioMedia();
  initVideoModal();
  initGSAPScrollAnimations();
  initLuxuryInteractivity();
});

/**
 * CORREÇÃO DA EXPERIÊNCIA DA HERO SECTION (CONTROLE DE LOOP MANUAL PARA MOBILE)
 */
function initHeroExperience() {
  const hero = document.getElementById('hero');
  const video = document.getElementById('heroVideo');
  const startButton = document.getElementById('startButton');
  let heroReady = false;

  function triggerHeroEnter() {
    if (heroReady || !hero) return;
    heroReady = true;
    hero.classList.add('is-ready');
  }

  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('x5-playsinline', '');
    video.setAttribute('muted', '');

    // Controle manual de loop via evento 'ended' para evitar engasgos no telemóvel
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });

    const playHeroVideo = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => triggerHeroEnter())
          .catch(() => {
            const playOnInteraction = () => {
              video.play().catch(() => {});
              triggerHeroEnter();
              window.removeEventListener('touchstart', playOnInteraction);
              window.removeEventListener('scroll', playOnInteraction);
            };
            window.addEventListener('touchstart', playOnInteraction, { once: true, passive: true });
            window.addEventListener('scroll', playOnInteraction, { once: true, passive: true });
          });
      }
    };

    // Usar IntersectionObserver otimizado para garantir que o vídeo só toque se estiver na tela
    // Isso evita que dois vídeos rodem ao mesmo tempo e engasguem a GPU do celular
    if ('IntersectionObserver' in window && hero) {
      let isVisible = false;
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            playHeroVideo();
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.01 }); // Aciona com 1% visível
      heroObserver.observe(hero);
    } else {
      // Fallback
      window.setTimeout(() => playHeroVideo(), 150);
    }

    if (video.readyState >= 2) {
      triggerHeroEnter();
    } else {
      video.addEventListener('loadeddata', triggerHeroEnter, { once: true });
      video.addEventListener('canplay', triggerHeroEnter, { once: true });
    }

    video.addEventListener('error', (e) => {
      console.warn('[Ana Marconi Hero] Erro no vídeo do header', e);
      triggerHeroEnter();
    });
  }

  window.setTimeout(triggerHeroEnter, 500);

  if (startButton) {
    startButton.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollTo('#sobre');
    });
  }
}

/**
 * Animações de Scroll com GSAP e ScrollTrigger para o restante do site
 */
function initGSAPScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP ou ScrollTrigger não encontrados via CDN.');
    return;
  }

  if (typeof ScrollToPlugin !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  } else {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Fade up suave com stagger na seção Biografia
  gsap.fromTo(
    '.gsap-about-item',
    {
      y: 50,
      opacity: 0
    },
    {
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top 75%',
        toggleActions: 'play none none none'
      },
      y: 0,
      opacity: 1,
      duration: 1.3,
      stagger: 0.22,
      ease: 'power3.out'
    }
  );

  // Animação da Mensagem Sobreposta no Cinema Banner
  gsap.fromTo(
    '.cinema-banner-content > *',
    {
      y: 35,
      opacity: 0
    },
    {
      scrollTrigger: {
        trigger: '.cinema-banner-section',
        start: 'top 75%',
        toggleActions: 'play none none none'
      },
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.16,
      ease: 'power3.out'
    }
  );

  // Animações da Seção Storytelling
  gsap.fromTo(
    '.gsap-storytelling-header > *',
    {
      y: 35,
      opacity: 0
    },
    {
      scrollTrigger: {
        trigger: '.storytelling-section',
        start: 'top 78%',
        toggleActions: 'play none none none'
      },
      y: 0,
      opacity: 1,
      duration: 1.1,
      stagger: 0.15,
      ease: 'power3.out'
    }
  );

  gsap.fromTo(
    '.gsap-storytelling-card',
    {
      y: 50,
      opacity: 0
    },
    {
      scrollTrigger: {
        trigger: '.storytelling-grid',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: 0,
      opacity: 1,
      duration: 1.1,
      stagger: 0.18,
      ease: 'power3.out'
    }
  );

  gsap.fromTo(
    '.gsap-storytelling-quote',
    {
      y: 30,
      opacity: 0
    },
    {
      scrollTrigger: {
        trigger: '.storytelling-footer-quote',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'power3.out'
    }
  );

  // Fade up no cabeçalho do portfólio
  gsap.fromTo(
    '.gsap-header',
    {
      y: 35,
      opacity: 0
    },
    {
      scrollTrigger: {
        trigger: '.portfolio-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: 0,
      opacity: 1,
      duration: 1.1,
      ease: 'power3.out'
    }
  );

  // Cards do portfólio surgem flutuando de baixo para cima (stagger fade-up)
  gsap.fromTo(
    '.gsap-card',
    {
      y: 70,
      opacity: 0
    },
    {
      scrollTrigger: {
        trigger: '.portfolio-grid',
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.16,
      ease: 'power3.out',
      clearProps: 'opacity'
    }
  );

  // CTA Section
  gsap.fromTo(
    '.gsap-cta .cta-content > *',
    {
      y: 40,
      opacity: 0
    },
    {
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 75%',
        toggleActions: 'play none none none'
      },
      y: 0,
      opacity: 1,
      duration: 1.1,
      stagger: 0.15,
      ease: 'power3.out'
    }
  );

  // Rodapé
  gsap.fromTo(
    '.footer-container > *',
    {
      y: 20,
      opacity: 0
    },
    {
      scrollTrigger: {
        trigger: '.footer-section',
        start: 'top 92%',
        toggleActions: 'play none none none'
      },
      y: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.1,
      ease: 'power2.out'
    }
  );
}

/**
 * Interatividade de Luz Dinâmica (Spotlight) nos Cards de Storymaking
 */
function initStorymakingCardsInteraction() {
  const cards = document.querySelectorAll('.storytelling-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    });
  });
}

/**
 * Gerenciamento de reprodução nos cards do portfólio
 */
function initPortfolioMedia() {
  const cards = document.querySelectorAll('.portfolio-card');

  cards.forEach((card) => {
    const video = card.querySelector('.portfolio-video');
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('controlsList', 'nodownload noplaybackrate');
    video.disablePictureInPicture = true;

    // Desativa menu de contexto (botão direito / download)
    card.addEventListener('contextmenu', (e) => e.preventDefault());

    // Hover mouse enter: reproduz apenas o vídeo do card atual e esconde o título
    card.addEventListener('mouseenter', () => {
      // Pausa prévias de outros cards para não sobrecarregar decodificadores da GPU
      cards.forEach((otherCard) => {
        if (otherCard !== card) {
          otherCard.classList.remove('is-playing');
          const otherVideo = otherCard.querySelector('.portfolio-video');
          if (otherVideo && !otherVideo.paused) {
            otherVideo.pause();
          }
        }
      });

      card.classList.add('is-playing');
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
    });

    // Hover mouse leave: pausa o vídeo e volta a exibir a capa e o título
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-playing');
      video.pause();
    });

    // Clique no card: abre o vídeo no modal com áudio e controles
    card.addEventListener('click', () => {
      const source = video.querySelector('source');
      const videoSrc = source ? source.getAttribute('src') : (video.currentSrc || video.src);
      const title = card.querySelector('.portfolio-name')?.textContent || '';
      const category = card.querySelector('.portfolio-category')?.textContent || '';

      // Pausa a prévia do card
      card.classList.remove('is-playing');
      video.pause();

      if (window.openVideoModal) {
        window.openVideoModal(videoSrc, title, category);
      }
    });
  });
}

/**
 * Modal de Vídeo Interativo com Som e Controles de Reprodução Otimizados
 */
function initVideoModal() {
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategory = document.getElementById('modalCategory');
  const mediaContainer = modal ? modal.querySelector('.video-modal-media') : null;

  if (!modal || !modalVideo) return;

  // Bloqueia menu de contexto e download no modal
  modalVideo.setAttribute('controlsList', 'nodownload noplaybackrate');
  modalVideo.disablePictureInPicture = true;
  modal.addEventListener('contextmenu', (e) => e.preventDefault());

  function openModal(src, title, category) {
    if (!src) return;

    // 1. Pausa todos os vídeos de fundo para liberar 100% da GPU/decodificador para o vídeo principal
    const heroVideo = document.getElementById('heroVideo');
    const cinemaVideo = document.getElementById('cinemaVideo');
    if (heroVideo && !heroVideo.paused) heroVideo.pause();
    if (cinemaVideo && !cinemaVideo.paused) cinemaVideo.pause();

    document.querySelectorAll('.portfolio-card').forEach((c) => {
      c.classList.remove('is-playing');
      const v = c.querySelector('.portfolio-video');
      if (v) v.pause();
    });

    // 2. Preenche dados do card
    if (modalTitle) modalTitle.textContent = title.trim();
    if (modalCategory) modalCategory.textContent = category.trim();

    // 3. Prepara o player com áudio e sem opção de download
    modalVideo.muted = false;
    modalVideo.volume = 1.0;
    modalVideo.controls = true;
    modalVideo.setAttribute('controlsList', 'nodownload noplaybackrate');
    modalVideo.disablePictureInPicture = true;

    // Ativa spinner sutil de buffer
    if (mediaContainer) mediaContainer.classList.add('is-buffering');

    // Carrega o arquivo
    modalVideo.src = src;
    modalVideo.load();

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // 4. Início de reprodução sem travamentos: aguarda buffer inicial de segurança
    let playStarted = false;
    const startPlayback = () => {
      if (playStarted) return;
      playStarted = true;
      if (mediaContainer) mediaContainer.classList.remove('is-buffering');

      const playPromise = modalVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Reprodução requer clique de play do usuário:', err);
        });
      }
    };

    if (modalVideo.readyState >= 3) {
      startPlayback();
    } else {
      modalVideo.addEventListener('canplay', startPlayback, { once: true });
      // Fallback para caso o evento canplay já tenha ocorrido
      setTimeout(startPlayback, 350);
    }
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (mediaContainer) mediaContainer.classList.remove('is-buffering');

    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();

    // Reativa vídeos de background de forma leve
    const heroVideo = document.getElementById('heroVideo');
    const cinemaVideo = document.getElementById('cinemaVideo');
    if (heroVideo && window.scrollY < window.innerHeight) {
      heroVideo.play().catch(() => {});
    }
    if (cinemaVideo) {
      cinemaVideo.play().catch(() => {});
    }
  }

  // Registra globalmente para abertura pelos cards
  window.openVideoModal = openModal;
  window.closeVideoModal = closeModal;

  // Fechar ao clicar no backdrop ou botão de fechar (X)
  modal.querySelectorAll('[data-close-modal]').forEach((elem) => {
    elem.addEventListener('click', closeModal);
  });

  // Fechar com a tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

/**
 * Inicialização e reprodução sob demanda do Banner de Vídeo Cinematográfico
 * Otimizado para NÃO concorrer com a Hero Section (economia de ~48MB no carregamento inicial)
 */
function initCinemaShowcaseVideo() {
  const section = document.getElementById('filme-destaque');
  const video = document.getElementById('cinemaVideo');
  if (!video || !section) return;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('x5-playsinline', '');
  video.setAttribute('muted', '');

  // Controlo manual de loop via evento 'ended' para evitar congelamento no telemóvel
  video.addEventListener('ended', () => {
    video.currentTime = 0;
    video.play().catch(() => {});
  });

  const playCinemaVideo = () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        window.addEventListener('touchstart', () => video.play().catch(() => {}), { once: true, passive: true });
        window.addEventListener('scroll', () => video.play().catch(() => {}), { once: true, passive: true });
      });
    }
  };

  // Observador rígido: o vídeo só toca quando estiver visível no viewport (evita sobrecarga da GPU)
  if ('IntersectionObserver' in window) {
    let isVisible = false;
    const cinemaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          playCinemaVideo();
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px 400px 0px" }); // Pre-carrega e toca antes de aparecer totalmente
    cinemaObserver.observe(section);
  } else {
    window.setTimeout(() => {
      playCinemaVideo();
    }, 200);
  }
}

/**
 * Experiências Interativas Adicionais de Luxo:
 * - Cursor editorial com rastro e efeito magnético sutil
 * - Barra de progresso de leitura suave no topo
 * - Floating Navbar inteligente (surge após a hero)
 * - Spotlight suave e interativo na foto da seção Sobre
 */
function initLuxuryInteractivity() {
  initReadingProgressBar();
  initCustomLuxuryCursor();
  initFloatingNavbar();
  initAboutInteractiveSpotlight();
  initGlobalAnchorScroll();
  initProtectedContactLinks();
}

/**
 * Proteção de contatos (e-mail e WhatsApp) contra raspadores/crawlers de spam
 */
function initProtectedContactLinks() {
  const contactLinks = document.querySelectorAll('.js-contact-link');
  contactLinks.forEach((link) => {
    const type = link.getAttribute('data-type');
    if (type === 'wa') {
      const phone = link.getAttribute('data-p');
      const msg = link.getAttribute('data-msg');
      const url = msg 
        ? `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(msg)}&type=phone_number&app_absent=0`
        : `https://api.whatsapp.com/send/?phone=${phone}&text&type=phone_number&app_absent=0`;
      link.setAttribute('href', url);
    } else if (type === 'email') {
      const user = link.getAttribute('data-user');
      const domain = link.getAttribute('data-domain');
      link.setAttribute('href', `mailto:${user}@${domain}`);
    }
  });
}

/**
 * Atribui rolagem cinematográfica a todos os links âncora (#) do site (ex: footer, botões)
 */
function initGlobalAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    // Evita duplicar os que já estão na navbar flutuante ou botão start
    if (anchor.classList.contains('nav-anchor') || anchor.id === 'startButton') return;

    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href !== '#' && document.querySelector(href)) {
        e.preventDefault();
        const offset = href === '#hero' ? 0 : 45;
        smoothScrollTo(href, offset);
      }
    });
  });
}

/**
 * Barra de Leitura Superior Discreta
 */
function initReadingProgressBar() {
  const bar = document.getElementById('readingProgressBar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }, { passive: true });
}

/**
 * Cursor Editorial de Alta Costura com Acompanhamento Fluido
 */
function initCustomLuxuryCursor() {
  const cursor = document.getElementById('customCursor');
  const follower = document.getElementById('customCursorFollower');
  if (!cursor || !follower) return;

  // Apenas ativa se houver suporte a mouse real
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!document.body.classList.contains('cursor-active')) {
      document.body.classList.add('cursor-active');
    }

    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(renderFollower);
    }
  }, { passive: true });

  function renderFollower() {
    // Interpolação suave (lerp) para um movimento aveludado e cinematográfico
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;

    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;

    const dist = Math.hypot(mouseX - followerX, mouseY - followerY);
    if (dist > 0.1) {
      requestAnimationFrame(renderFollower);
    } else {
      isMoving = false;
    }
  }

  // Detecta elementos interativos para expandir suavemente o seguidor
  const interactiveTargets = 'a, button, .portfolio-card, .storytelling-card, .about-image-card, .cinema-banner-section';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveTargets)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveTargets)) {
      document.body.classList.remove('cursor-hover');
    }
  });

  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-active');
  });
}

/**
 * Função de Rolagem Aveludada e Dinâmica (Leve, nem rápida nem lenta)
 * Usa GSAP com ScrollToPlugin para uma desaceleração cinematográfica perfeita (power3.inOut / power2.out)
 */
function smoothScrollTo(targetSelector, offset = 40) {
  const target = typeof targetSelector === 'string' ? document.querySelector(targetSelector) : targetSelector;
  if (!target) return;

  const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
  const currentY = window.scrollY;
  const distance = Math.abs(targetY - currentY);

  // Duração calculada dinamicamente:
  // Se estiver perto: ~0.75s; se estiver mais longe: no máximo 1.15s (nem arrastado nem instantâneo)
  const duration = Math.min(1.15, Math.max(0.72, (distance / 2500) + 0.65));

  if (typeof gsap !== 'undefined') {
    // Se GSAP estiver disponível, animação com curva elegante
    if (gsap.plugins && gsap.plugins.scrollTo) {
      gsap.to(window, {
        duration: duration,
        scrollTo: { y: Math.max(0, targetY), autoKill: true },
        ease: 'power2.inOut',
        overwrite: 'auto'
      });
      return;
    }

    // Fallback animando objeto com GSAP
    const scrollObj = { y: currentY };
    gsap.to(scrollObj, {
      duration: duration,
      y: Math.max(0, targetY),
      ease: 'power2.inOut',
      overwrite: 'auto',
      onUpdate: () => {
        window.scrollTo(0, scrollObj.y);
      }
    });
    return;
  }

  // Fallback suave sem GSAP
  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: 'smooth'
  });
}

/**
 * Floating Navbar Inteligente com Revelação Suave e Rolagem Aveludada nos Links
 */
function initFloatingNavbar() {
  const nav = document.getElementById('floatingNav');
  if (!nav) return;

  const navLinks = nav.querySelectorAll('.nav-anchor, .floating-nav-logo');
  const sections = [
    { id: 'sobre', el: document.getElementById('sobre') },
    { id: 'storytelling', el: document.getElementById('storytelling') },
    { id: 'portfolio', el: document.getElementById('portfolio') },
    { id: 'contato', el: document.getElementById('contato') }
  ];

  // Intercepta o clique para rolagem calculada e aveludada
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const offset = href === '#hero' ? 0 : 45;
        smoothScrollTo(href, offset);
      }
    });
  });

  // Atualização de visibilidade e estado ativo (active link)
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const heroHeight = window.innerHeight * 0.65;

    // Visibilidade da Navbar
    if (currentScrollY > heroHeight) {
      nav.classList.add('is-visible');
    } else {
      nav.classList.remove('is-visible');
    }

    // Destacar o link correspondente à seção atual na tela
    const scrollPosition = currentScrollY + 120;
    let activeId = '';

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section.el && section.el.offsetTop <= scrollPosition) {
        activeId = section.id;
        break;
      }
    }

    nav.querySelectorAll('.nav-anchor').forEach((anchor) => {
      const href = anchor.getAttribute('href');
      if (href === `#${activeId}`) {
        anchor.classList.add('is-active');
      } else {
        anchor.classList.remove('is-active');
      }
    });
  }, { passive: true });
}

/**
 * Spotlight Dinâmico de Luz na Foto Editorial de Ana Marconi
 */
function initAboutInteractiveSpotlight() {
  const card = document.querySelector('.about-image-card');
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--about-mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--about-mouse-y', `${e.clientY - rect.top}px`);
  });

  card.addEventListener('mouseleave', () => {
    card.style.removeProperty('--about-mouse-x');
    card.style.removeProperty('--about-mouse-y');
  });
}