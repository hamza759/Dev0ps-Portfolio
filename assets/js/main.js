(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const EMAIL = 'hamzajamilhj11@gmail.com';

  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

  /* ----------------------------------------------------------------------
     Theme
  ---------------------------------------------------------------------- */
  const metaTheme = $('#meta-theme');
  const themeButtons = $$('.theme-toggle');
  const lightMedia = window.matchMedia('(prefers-color-scheme: light)');

  function readSavedTheme() {
    try {
      const value = localStorage.getItem('theme');
      return value === 'light' || value === 'dark' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function applyTheme(theme, persist = false) {
    const next = theme === 'light' ? 'light' : 'dark';
    const light = next === 'light';
    root.dataset.theme = next;
    if (metaTheme) metaTheme.setAttribute('content', light ? '#f3f4ec' : '#070907');
    themeButtons.forEach((button) => {
      button.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    });
    if (persist) {
      try { localStorage.setItem('theme', next); } catch (error) { /* storage may be unavailable */ }
    }
  }

  function toggleTheme() {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next, true);
    showToast(next === 'light' ? 'Light theme on' : 'Dark theme on');
  }

  applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');

  themeButtons.forEach((button) => button.addEventListener('click', toggleTheme));

  lightMedia.addEventListener?.('change', (event) => {
    if (!readSavedTheme()) applyTheme(event.matches ? 'light' : 'dark');
  });

  /* ----------------------------------------------------------------------
     Palette shortcut labels
  ---------------------------------------------------------------------- */
  $$('.kbd-mod').forEach((element) => { element.textContent = isMac ? '⌘' : 'Ctrl'; });
  $$('[data-palette-open]').forEach((button) => {
    button.setAttribute('aria-label', `Open command palette (${isMac ? 'Command' : 'Control'} K)`);
  });

  /* ----------------------------------------------------------------------
     Clock + year
  ---------------------------------------------------------------------- */
  let clockFormat;
  let dateFormat;
  try {
    clockFormat = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    dateFormat = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit'
    });
  } catch (error) {
    clockFormat = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    dateFormat = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  const clockNodes = $$('[data-clock]');
  const dateNodes = $$('[data-date]');

  function updateClock() {
    const now = new Date();
    const time = clockFormat.format(now);
    const date = dateFormat.format(now).replace(/-/g, '.');
    clockNodes.forEach((node) => { node.textContent = time; });
    dateNodes.forEach((node) => { node.textContent = date; });
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  const yearNode = $('#year');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------------------------
     Toast
  ---------------------------------------------------------------------- */
  const toast = $('#toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => {
        if (!toast.classList.contains('is-visible')) toast.textContent = '';
      }, 220);
    }, 2600);
  }

  /* ----------------------------------------------------------------------
     Copy email
  ---------------------------------------------------------------------- */
  function legacyCopy(text) {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0';
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    field.remove();
    return copied;
  }

  async function copyEmail(email = EMAIL) {
    try {
      await navigator.clipboard.writeText(email);
      showToast(`Email copied — ${email}`);
    } catch (error) {
      showToast(legacyCopy(email) ? `Email copied — ${email}` : `Copy failed — ${email}`);
    }
  }

  $$('button[data-copy-email]').forEach((button) => {
    button.addEventListener('click', () => copyEmail(button.dataset.copyEmail || EMAIL));
  });

  /* ----------------------------------------------------------------------
     Scroll lock + mobile menu
  ---------------------------------------------------------------------- */
  let menuOpen = false;
  let paletteOpen = false;
  let lightboxOpen = false;

  function updateScrollLock() {
    const locked = menuOpen || paletteOpen || lightboxOpen;
    document.body.classList.toggle('is-locked', locked);
    root.classList.toggle('is-locked', locked);
  }

  const menuButton = $('#menu-toggle');
  const mobileNav = $('#mobile-nav');

  function setMenu(open) {
    menuOpen = open;
    root.classList.toggle('nav-open', open);
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    if (mobileNav && open) mobileNav.removeAttribute('aria-hidden');
    if (mobileNav && !open) mobileNav.setAttribute('aria-hidden', 'true');
    updateScrollLock();
  }

  menuButton?.addEventListener('click', () => setMenu(!menuOpen));

  $$('[data-menu-close]').forEach((element) => {
    element.addEventListener('click', () => setMenu(false));
  });

  $$('#mobile-nav a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setMenu(false);
      goTo(link.getAttribute('href'));
    });
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (window.innerWidth > 1120 && menuOpen) setMenu(false);
    }, 120);
  });

  /* ----------------------------------------------------------------------
     Smooth section navigation
  ---------------------------------------------------------------------- */
  function goTo(selector) {
    const target = document.querySelector(selector);
    if (!target) return;

    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });

    if (history.replaceState) history.replaceState(null, '', selector);

    const heading = target.querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  /* ----------------------------------------------------------------------
     Scroll progress, header shadow, active section
  ---------------------------------------------------------------------- */
  const progressBar = $('#scroll-progress');
  const topbar = $('.topbar');
  const railIndex = $('#rail-index');
  const navLinks = $$('[data-nav]');
  const sectionIds = ['about', 'skills', 'experience', 'projects', 'training', 'contact'];
  const sectionNumbers = {
    about: '01', skills: '02', experience: '03', projects: '04', training: '05', contact: '06'
  };

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      if (link.dataset.nav === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (railIndex) railIndex.textContent = sectionNumbers[id] || '00';
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => setActiveNav(link.dataset.nav || ''));
  });

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveNav(entry.target.id);
      });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  let scrollTicking = false;

  function onScrollFrame() {
    scrollTicking = false;

    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${ratio})`;

    if (topbar) topbar.classList.toggle('is-scrolled', window.scrollY > 8);

    if (window.scrollY < 120) setActiveNav('');

    const nearBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 48;
    if (nearBottom) setActiveNav('contact');
  }

  function requestScrollFrame() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(onScrollFrame);
  }

  window.addEventListener('scroll', requestScrollFrame, { passive: true });
  window.addEventListener('resize', requestScrollFrame);
  onScrollFrame();

  /* ----------------------------------------------------------------------
     Reveal on scroll
  ---------------------------------------------------------------------- */
  const revealNodes = $$('.reveal');

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealNodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.92) {
        node.classList.add('will-reveal');
        revealObserver.observe(node);
      }
    });

    /* A deep link can jump past content before the observer sees it.
       Reveal anything already at or above the fold once the page settles. */
    const settleReveals = () => {
      revealNodes.forEach((node) => {
        if (!node.classList.contains('will-reveal')) return;
        if (node.getBoundingClientRect().top < window.innerHeight * 0.92) {
          node.classList.add('is-visible');
          revealObserver.unobserve(node);
        }
      });
    };

    window.setTimeout(settleReveals, 400);
    window.addEventListener('load', settleReveals);
    window.addEventListener('hashchange', () => window.setTimeout(settleReveals, 350));
  }

  /* ----------------------------------------------------------------------
     Counters
  ---------------------------------------------------------------------- */
  let countersStarted = false;

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;

    $$('.counter').forEach((counter) => {
      const target = Number.parseFloat(counter.dataset.target || '0');
      const decimals = Number.parseInt(counter.dataset.decimals || '0', 10);
      const suffix = counter.dataset.suffix || '';
      const finalValue = `${target.toFixed(decimals)}${suffix}`;

      if (reduceMotion) {
        counter.textContent = finalValue;
        return;
      }

      const duration = 1300;
      const start = performance.now();

      function frame() {
        const progress = Math.min(1, Math.max(0, (performance.now() - start) / duration));
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = `${(target * eased).toFixed(decimals)}${suffix}`;
        if (progress < 1) window.requestAnimationFrame(frame);
      }

      window.requestAnimationFrame(frame);

      /* If frames are throttled, land on the real value instead of a
         half-counted or out-of-range number. */
      window.setTimeout(() => { counter.textContent = finalValue; }, duration + 700);
    });
  }

  /* ----------------------------------------------------------------------
     Rotating role
  ---------------------------------------------------------------------- */
  const rotator = $('#rotator');
  const roles = ['DevOps Engineer', 'Site Reliability Engineer', 'Observability Engineer', 'HA PostgreSQL'];
  let rotatorTimer = null;
  let rotatorStarted = false;

  function startRotator() {
    if (!rotator || rotatorStarted) return;
    rotatorStarted = true;

    if (reduceMotion) {
      rotator.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let charIndex = roles[0].length;
    let deleting = true;

    function schedule(delay) {
      rotatorTimer = window.setTimeout(tick, delay);
    }

    function tick() {
      rotatorTimer = null;
      const role = roles[roleIndex];

      if (deleting) {
        charIndex -= 1;
        rotator.textContent = role.slice(0, Math.max(0, charIndex));
        if (charIndex <= 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          charIndex = 0;
          schedule(320);
        } else {
          schedule(26);
        }
      } else {
        charIndex += 1;
        rotator.textContent = role.slice(0, charIndex);
        if (charIndex >= role.length) {
          deleting = true;
          schedule(1900);
        } else {
          schedule(52 + Math.random() * 34);
        }
      }
    }

    schedule(1900);
  }

  /* ----------------------------------------------------------------------
     Hero + GSAP
  ---------------------------------------------------------------------- */
  let heroStarted = false;

  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    startCounters();
    startRotator();

    /* Hidden tabs suspend requestAnimationFrame, which would leave GSAP's
       from() initial states frozen and the hero invisible. Skip the intro
       choreography when the page is not being painted. */
    if (reduceMotion || !window.gsap || document.hidden) return;

    const gsap = window.gsap;
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    timeline
      .from('.hero-kicker', { autoAlpha: 0, y: 14, duration: 0.45 })
      .from('.hero-line > span', { yPercent: 112, duration: 0.9, stagger: 0.1, ease: 'power4.out' }, '-=0.2')
      .from('.hero-role', { autoAlpha: 0, y: 12, duration: 0.45 }, '-=0.55')
      .from('.hero-lead', { autoAlpha: 0, y: 14, duration: 0.5 }, '-=0.35')
      .from('.hero-actions', { autoAlpha: 0, y: 14, duration: 0.45 }, '-=0.35')
      .from('.hero-stats', { autoAlpha: 0, y: 14, duration: 0.5 }, '-=0.3')
      .from('.telemetry', { autoAlpha: 0, x: 24, duration: 0.8 }, '<-0.15')
      .from('.tp-node, .tp-mini', {
        autoAlpha: 0, scale: 0.96, transformOrigin: 'center', duration: 0.45, stagger: 0.03
      }, '<0.1');

    /* Trace the monitoring links after the nodes land. The dash pattern is
       restored by the tween end; the dashed probe path keeps its CSS flow. */
    const flowPaths = $$('.tp-path:not(.tp-path--dash)');
    flowPaths.forEach((path) => {
      let length = 0;
      try { length = path.getTotalLength(); } catch (error) { length = 0; }
      if (!length) return;
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
    if (flowPaths.length) {
      timeline.to(flowPaths, {
        strokeDashoffset: 0, duration: 0.8, stagger: 0.05, ease: 'power2.out'
      }, 1.05);
    }

    /* Safety net: a throttled tab or suspended frame loop can freeze the
       timeline part-way through, leaving most of the hero hidden. Once the
       choreography should be over, snap to the end if it has not finished. */
    const settle = () => {
      if (timeline.progress() < 1) timeline.progress(1);
    };
    window.setTimeout(settle, 2800);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) window.setTimeout(settle, 900);
    });
  }

  function initScrollMotion() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const stagger = (targets, trigger, options = {}) => {
      const list = Array.from(targets || []).filter(Boolean);
      if (!list.length || !trigger) return;
      gsap.from(list, {
        y: options.y ?? 12,
        autoAlpha: 0,
        duration: options.duration ?? 0.55,
        stagger: options.stagger ?? 0.06,
        ease: 'power3.out',
        scrollTrigger: {
          trigger,
          start: options.start || 'top 86%',
          once: true
        }
      });
    };

    /* Section chrome */
    $$('.section-rule').forEach((rule) => {
      gsap.fromTo(rule, { scaleX: 0 }, {
        scaleX: 1,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: rule, start: 'top 90%', once: true }
      });
    });

    $$('.section-kicker').forEach((kicker) => {
      gsap.from(kicker, {
        autoAlpha: 0,
        x: -10,
        duration: 0.5,
        ease: 'power3.out',
        scrollTrigger: { trigger: kicker, start: 'top 92%', once: true }
      });
    });

    $$('.section-title h2, .contact-copy h2').forEach((heading) => {
      gsap.from(heading, {
        autoAlpha: 0,
        yPercent: 14,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: heading, start: 'top 91%', once: true }
      });
    });

    $$('.section-lead').forEach((lead) => {
      gsap.from(lead, {
        autoAlpha: 0,
        y: 10,
        duration: 0.55,
        delay: 0.06,
        ease: 'power2.out',
        scrollTrigger: { trigger: lead, start: 'top 93%', once: true }
      });
    });

    /* About */
    stagger($$('.fact-grid li'), $('.fact-grid'), {
      y: 8, duration: 0.4, stagger: 0.04, start: 'top 92%'
    });

    /* Stack rows — title and chips travel separately so the row keeps a
       faint sense of assembly instead of fading in as one flat block. */
    $$('.stack-row').forEach((row) => {
      stagger([$('.stack-id', row), $('h3', row)], row, {
        y: 10, duration: 0.5, stagger: 0.05, start: 'top 90%'
      });
      stagger($$('.chips li', row), row, {
        y: 7, duration: 0.38, stagger: 0.022, start: 'top 90%'
      });
    });

    $$('.chips').forEach((group) => {
      if (group.closest('.stack-row')) return;
      stagger($$('li', group), group, {
        y: 7, duration: 0.38, stagger: 0.03, start: 'top 93%'
      });
    });

    /* Experience */
    $$('.release').forEach((release) => {
      stagger($$('.bullets li', release), release, {
        y: 10, duration: 0.45, stagger: 0.05, start: 'top 86%'
      });
      const card = $('.release-card', release);
      if (card) {
        gsap.from(card, {
          autoAlpha: 0,
          y: 16,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: release, start: 'top 84%', once: true }
        });
      }
    });

    $$('.release-line').forEach((line) => {
      gsap.fromTo(line, { scaleX: 0, transformOrigin: 'left center' }, {
        scaleX: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: line, start: 'top 94%', once: true }
      });
    });

    /* Case files */
    $$('.case-file').forEach((caseFile) => {
      stagger([$('.case-file-head', caseFile), $('.case-file-title', caseFile)], caseFile, {
        y: 12, duration: 0.55, start: 'top 88%'
      });
      const chain = $('.signal-chain, .pipeline, .flow-steps', caseFile);
      if (chain) {
        stagger($$('li', chain), chain, {
          y: 10, duration: 0.45, stagger: 0.05, start: 'top 90%'
        });
      }
    });

    $$('.case-block, .case-result, .case-links').forEach((block) => {
      gsap.from(block, {
        autoAlpha: 0,
        y: 14,
        duration: 0.55,
        ease: 'power3.out',
        scrollTrigger: { trigger: block, start: 'top 93%', once: true }
      });
    });

    stagger($$('.terraform-rail > *'), $('.terraform-rail'), {
      y: 6, duration: 0.35, stagger: 0.03, start: 'top 93%'
    });

    /* Training */
    $$('.record').forEach((record) => {
      stagger([$('.record-id', record), $('.record-type', record), $('.record-year', record)], record, {
        y: 8, duration: 0.45, stagger: 0.04, start: 'top 90%'
      });
      const body = $('div', record);
      if (body) {
        stagger(body.children, record, {
          y: 10, duration: 0.45, stagger: 0.05, start: 'top 90%'
        });
      }
    });

    /* Contact */
    const contact = $('.contact-panel');
    if (contact) {
      stagger($$('.contact-copy > *:not(h2):not(.section-kicker)', contact), contact, {
        y: 12, duration: 0.55, stagger: 0.05, start: 'top 82%'
      });
      stagger($$('.contact-links li', contact), contact, {
        y: 10, duration: 0.45, stagger: 0.05, start: 'top 78%'
      });
    }

    /* Depth on scroll */
    $$('.figure').forEach((figure) => {
      gsap.fromTo(figure, { y: 12 }, {
        y: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: figure,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });
    });

    const heroGrid = $('.hero-grid-bg');
    if (heroGrid) {
      gsap.to(heroGrid, {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    /* The ticker leans into fast scrolls, then settles back on its own.
       Pointer-fine only; touch scrolling stays steady. */
    const ticker = $('.ticker');
    if (ticker && window.matchMedia('(hover: hover) and (pointer: fine)').matches && typeof gsap.quickTo === 'function') {
      const skewTo = gsap.quickTo(ticker, 'skewX', { duration: 0.45, ease: 'power3.out' });
      const clampSkew = gsap.utils.clamp(-3.5, 3.5);
      let skewTimer = 0;

      ScrollTrigger.create({
        onUpdate(self) {
          skewTo(clampSkew(self.getVelocity() / 420));
          window.clearTimeout(skewTimer);
          skewTimer = window.setTimeout(() => skewTo(0), 140);
        }
      });
    }

    /* Desktop-only pointer tilt on the telemetry panel. Touch stays still. */
    const hero = $('.hero');
    const telemetry = $('.telemetry');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (hero && telemetry && finePointer && typeof gsap.quickTo === 'function') {
      gsap.set(telemetry, { transformPerspective: 1000 });
      const rotateX = gsap.quickTo(telemetry, 'rotationX', { duration: 0.7, ease: 'power2.out' });
      const rotateY = gsap.quickTo(telemetry, 'rotationY', { duration: 0.7, ease: 'power2.out' });
      const clampUnit = gsap.utils.clamp(-1, 1);

      hero.addEventListener('pointermove', (event) => {
        if (event.pointerType && event.pointerType !== 'mouse') return;
        const rect = telemetry.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = clampUnit((event.clientX - rect.left) / rect.width - 0.5);
        const y = clampUnit((event.clientY - rect.top) / rect.height - 0.5);
        rotateY(x * 5);
        rotateX(y * -5);
      });

      hero.addEventListener('pointerleave', () => {
        rotateX(0);
        rotateY(0);
      });
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  }

  /* ----------------------------------------------------------------------
     Boot intro
  ---------------------------------------------------------------------- */
  const intro = $('#intro');

  function finishIntro() {
    if (!intro || intro.dataset.done === '1') return;
    intro.dataset.done = '1';

    try { sessionStorage.setItem('hj-intro', '1'); } catch (error) { /* storage may be unavailable */ }

    intro.classList.add('is-done');
    window.setTimeout(startHero, reduceMotion ? 0 : 120);
    window.setTimeout(() => {
      if (intro.isConnected) intro.remove();
    }, 900);
  }

  if (!intro || root.classList.contains('intro-skip')) {
    if (intro) intro.remove();
    startHero();
  } else {
    let introTimer = window.setTimeout(finishIntro, 2150);

    const skipIntro = () => {
      window.clearTimeout(introTimer);
      finishIntro();
    };

    intro.addEventListener('pointerdown', skipIntro, { once: true });
    window.addEventListener('keydown', skipIntro, { once: true });
    window.addEventListener('wheel', skipIntro, { once: true, passive: true });
  }

  initScrollMotion();

  /* ----------------------------------------------------------------------
     Lightbox
  ---------------------------------------------------------------------- */
  const lightbox = $('#lightbox');
  const lightboxTitle = $('#lightbox-title');
  const lightboxImage = $('#lightbox-img');
  const lightboxCaption = $('#lightbox-caption');
  const lightboxClose = $('.lightbox-close');
  const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  let lastLightboxFocus = null;
  let lightboxTimer = null;

  function openLightbox(trigger) {
    if (!lightbox || !lightboxImage) return;

    lastLightboxFocus = trigger;
    lightboxOpen = true;

    window.clearTimeout(lightboxTimer);

    if (lightboxTitle) lightboxTitle.textContent = trigger.dataset.title || 'Diagram';
    lightboxImage.src = trigger.dataset.full || trigger.getAttribute('href') || '';
    lightboxImage.alt = trigger.dataset.alt || '';
    if (lightboxCaption) lightboxCaption.textContent = trigger.dataset.caption || '';

    lightbox.hidden = false;
    window.requestAnimationFrame(() => {
      lightbox.classList.add('is-open');
      lightboxClose?.focus({ preventScroll: true });
    });

    updateScrollLock();
  }

  function closeLightbox() {
    if (!lightbox || !lightboxOpen) return;

    lightboxOpen = false;
    lightbox.classList.remove('is-open');
    updateScrollLock();

    window.clearTimeout(lightboxTimer);
    lightboxTimer = window.setTimeout(() => {
      lightbox.hidden = true;
      if (lightboxImage) {
        lightboxImage.src = placeholder;
        lightboxImage.alt = '';
      }
    }, 190);

    if (lastLightboxFocus && lastLightboxFocus.isConnected) {
      lastLightboxFocus.focus({ preventScroll: true });
    }
  }

  $$('[data-lightbox]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openLightbox(trigger);
    });
  });

  $$('[data-close]').forEach((element) => {
    element.addEventListener('click', closeLightbox);
  });

  lightbox?.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      lightboxClose?.focus();
    }
  });

  /* ----------------------------------------------------------------------
     Command palette
  ---------------------------------------------------------------------- */
  const palette = $('#palette');
  const paletteInput = $('#palette-input');
  const paletteList = $('#palette-list');
  const paletteEmpty = $('.palette-empty');
  const paletteItems = $$('.palette-item');
  let visiblePaletteItems = [];
  let paletteIndex = 0;
  let lastPaletteFocus = null;
  let paletteCloseTimer = null;

  function setPaletteIndex(index) {
    if (!visiblePaletteItems.length || !paletteInput) return;

    paletteIndex = (index + visiblePaletteItems.length) % visiblePaletteItems.length;

    visiblePaletteItems.forEach((item, itemIndex) => {
      item.setAttribute('aria-selected', itemIndex === paletteIndex ? 'true' : 'false');
    });

    const active = visiblePaletteItems[paletteIndex];
    paletteInput.setAttribute('aria-activedescendant', active.id);
    active.scrollIntoView({ block: 'nearest' });
  }

  function filterPalette(query) {
    const term = query.trim().toLowerCase();

    visiblePaletteItems = paletteItems.filter((item) => {
      const haystack = `${item.textContent} ${item.dataset.keywords || ''}`.toLowerCase();
      const matches = !term || haystack.includes(term);
      item.hidden = !matches;
      item.setAttribute('aria-selected', 'false');
      return matches;
    });

    if (paletteEmpty) paletteEmpty.hidden = visiblePaletteItems.length > 0;

    if (visiblePaletteItems.length) {
      setPaletteIndex(0);
    } else if (paletteInput) {
      paletteInput.removeAttribute('aria-activedescendant');
    }
  }

  function runPaletteAction(item) {
    if (!item) return;

    const action = item.dataset.action;

    if (action === 'goto') {
      const target = item.dataset.target;
      closePalette(false);
      goTo(target);
    } else if (action === 'copy') {
      closePalette();
      copyEmail(item.dataset.copyEmail || EMAIL);
    } else if (action === 'external') {
      closePalette();
      if (item.dataset.href) window.open(item.dataset.href, '_blank', 'noopener,noreferrer');
    } else if (action === 'theme') {
      closePalette();
      toggleTheme();
    } else {
      closePalette();
    }
  }

  function openPalette() {
    if (!palette || !paletteInput) return;

    paletteOpen = true;
    lastPaletteFocus = document.activeElement;
    palette.hidden = false;
    paletteInput.value = '';
    filterPalette('');
    updateScrollLock();

    window.clearTimeout(paletteCloseTimer);
    window.requestAnimationFrame(() => {
      palette.classList.add('is-open');
      paletteInput.focus({ preventScroll: true });
      setPaletteIndex(0);
    });
  }

  function closePalette(restoreFocus = true) {
    if (!palette || !paletteOpen) return;

    paletteOpen = false;
    palette.classList.remove('is-open');
    updateScrollLock();

    window.clearTimeout(paletteCloseTimer);
    paletteCloseTimer = window.setTimeout(() => {
      palette.hidden = true;
      if (paletteInput) paletteInput.value = '';
    }, 190);

    if (restoreFocus && lastPaletteFocus && lastPaletteFocus.isConnected) {
      lastPaletteFocus.focus({ preventScroll: true });
    }
  }

  $$('[data-palette-open]').forEach((button) => {
    button.addEventListener('click', openPalette);
  });

  $$('[data-palette-close]').forEach((element) => {
    element.addEventListener('click', () => closePalette());
  });

  paletteItems.forEach((item) => {
    item.addEventListener('click', () => runPaletteAction(item));
  });

  paletteInput?.addEventListener('input', () => filterPalette(paletteInput.value));

  paletteInput?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setPaletteIndex(paletteIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setPaletteIndex(paletteIndex - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setPaletteIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setPaletteIndex(visiblePaletteItems.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runPaletteAction(visiblePaletteItems[paletteIndex]);
    } else if (event.key === 'Tab') {
      event.preventDefault();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
    }
  });

  paletteList?.addEventListener('mousemove', (event) => {
    const item = event.target.closest('.palette-item');
    if (!item || item.hidden) return;
    const index = visiblePaletteItems.indexOf(item);
    if (index >= 0 && index !== paletteIndex) setPaletteIndex(index);
  });

  /* ----------------------------------------------------------------------
     Global keyboard shortcuts
  ---------------------------------------------------------------------- */
  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();

    if ((event.metaKey || event.ctrlKey) && key === 'k') {
      event.preventDefault();
      if (paletteOpen) closePalette();
      else openPalette();
      return;
    }

    if (event.key === 'Escape') {
      if (paletteOpen) closePalette();
      else if (lightboxOpen) closeLightbox();
      else if (menuOpen) setMenu(false);
    }
  });
})();
