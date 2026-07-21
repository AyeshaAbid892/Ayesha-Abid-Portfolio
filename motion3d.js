/* ==========================================================================
   MOTION 3D — cursor, extreme 3D tilt cards, magnetic buttons, scroll
   reveals, ambient floating shapes. Vanilla JS, no dependencies.

   Uses Pointer Events (not mouse-only events) throughout, so touch users
   get the exact same tilt/magnetic behavior as desktop: dragging a finger
   across a card tilts it live, and a quick tap fires a self-releasing
   tilt "pulse" so touch users still get visible feedback without a drag.

   Class names: "m3-reveal" / "m3-in" — deliberately NOT "reveal", because
   the original template (enhance.css) already owns a `.reveal` class that
   blurs an element forever unless a `.revealed` class is added — and
   nothing in the codebase ever adds `.revealed`. Own namespace = no
   collision.
   ========================================================================== */

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    injectLoader();
    injectFloatingShapes();
    initScrollReveal();
    initTiltCards();     // works for mouse AND touch (pointer events)
    initMagneticButtons(); // works for mouse AND touch (pointer events)

    if (!isTouch) {
      initCustomCursor(); // decorative cursor dot/ring — mouse only, makes no sense on touch
    }
  });

  /* ---- Boot loader ---- */
  function injectLoader() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = '<span class="page-loader-mark">AYESHA ABID</span>';
    document.body.prepend(loader);
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('loaded'), 350);
      setTimeout(() => loader.remove(), 1200);
    });
  }

  /* ---- Ambient floating shapes in a few key sections ---- */
  function injectFloatingShapes() {
    const targets = [
      { selector: '#about', count: 1 },
      { selector: '#services', count: 2 },
      { selector: '#expertise', count: 1 },
      { selector: '#contact', count: 1 },
    ];

    targets.forEach(({ selector, count }) => {
      const el = document.querySelector(selector);
      if (!el) return;
      for (let i = 0; i < count; i++) {
        const shape = document.createElement('div');
        shape.className = 'float-shape';
        const size = 160 + Math.random() * 160;
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.top = `${Math.random() * 80}%`;
        shape.style.left = `${Math.random() * 90}%`;
        shape.style.animationDuration = `${14 + Math.random() * 10}s`;
        shape.style.animationDelay = `${Math.random() * 4}s`;
        el.prepend(shape);
      }
    });
  }

  /* ==========================================================================
     Scroll reveal — every section from About down to Footer, each card
     TYPE gets a different entrance personality (up / left / right / flip /
     zoom / drop). Works identically on mobile: it's pure scroll position,
     no hover needed, so it's the "auto animation as you scroll" for touch.
     ========================================================================== */
  function initScrollReveal() {
    // [selector, variant, alternate-per-index?]
    const groups = [
      // About
      ['.about-image-wrapper', 'flip', false],
      ['.about-text', 'up', false],
      ['.stat', 'up', true],
      // Career
      ['.career-column', 'left', true],
      ['.timeline-item', 'left', true],
      // Digital arsenal
      ['.tool-card', 'zoom', false],
      // Skills
      ['.skill-card', 'flip', false],
      // Experience (internships / company / software house)
      ['.exp-card', 'drop', false],
      ['.category-title', 'up', false],
      // Services
      ['.service-card', 'up', false],
      // Expertise
      ['.expertise-card', 'right', true],
      // Process
      ['.process-item', 'drop', false],
      // Projects
      ['.project-card', 'zoom', false],
      // Blog
      ['.blog-card', 'left', true],
      // Testimonials
      ['.testimonials-slider', 'zoom', false],
      // Contact
      ['.contact-info', 'left', false],
      ['.contact-form', 'right', false],
      // Footer
      ['.footer-brand', 'up', false],
      ['.footer-links', 'up', false],
      ['.footer-services', 'up', false],
      ['.footer-connect', 'up', false],
      // Section headers everywhere
      ['.section-header', 'up', false],
    ];

    const seen = new Set();
    const queued = [];

    groups.forEach(([selector, variant, alternate]) => {
      document.querySelectorAll(selector).forEach((el, i) => {
        if (seen.has(el)) return; // avoid double-tagging if selectors overlap
        seen.add(el);
        const v = alternate ? (i % 2 === 0 ? variant : oppositeVariant(variant)) : variant;
        queued.push({ el, variant: v, index: i });
      });
    });

    if (!queued.length) return;

    if (reduceMotion) {
      queued.forEach(({ el }) => el.classList.add('m3-reveal', 'm3-in'));
      return;
    }

    queued.forEach(({ el, variant, index }) => {
      el.classList.add('m3-reveal', `m3-r-${variant}`);
      el.style.transitionDelay = `${(index % 6) * 45}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('m3-in');
            // clear the entrance stagger delay so it can never bleed into
            // hover transitions afterward
            setTimeout(() => { entry.target.style.transitionDelay = ''; }, 950);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.03, rootMargin: '0px 0px 0px 0px' }
    );

    queued.forEach(({ el }) => observer.observe(el));
  }

  function oppositeVariant(v) {
    if (v === 'left') return 'right';
    if (v === 'right') return 'left';
    return v;
  }

  /* ---- Custom cursor (dot + lagging ring) — mouse only ---- */
  function initCustomCursor() {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }, { passive: true });

    function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    const hoverables = 'a, button, .btn, .skill-card, .service-card, .project-card, .tool-card, .blog-card, .exp-card, .expertise-card, .testimonial-card, .career-column, input, textarea';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) ring.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) ring.classList.remove('cursor-hover');
    });
  }

  /* ==========================================================================
     Extreme 3D tilt + spotlight glow — Pointer Events, so mouse drag AND
     touch drag both live-tilt the card the same way. A plain tap (no drag)
     still fires a quick self-releasing "pulse" tilt so touch users always
     get visible feedback, not just draggers.
     ========================================================================== */
  function initTiltCards() {
    const cards = document.querySelectorAll(
      '.skill-card, .service-card, .project-card, .exp-card, .expertise-card, ' +
      '.blog-card, .testimonial-card, .tool-card, .career-column, .about-image-wrapper'
    );

    cards.forEach((card) => {
      const isSmallCard = card.classList.contains('tool-card');
      const maxTilt = isSmallCard ? 6 : 8;

      const state = { targetRX: 0, targetRY: 0, targetScale: 1, rx: 0, ry: 0, scale: 1, active: false };
      let raf = null;
      let tapTimer = null;

      function tick() {
        state.rx += (state.targetRX - state.rx) * 0.13;
        state.ry += (state.targetRY - state.ry) * 0.13;
        state.scale += (state.targetScale - state.scale) * 0.13;

        card.style.transform =
          `perspective(1000px) rotateX(${state.rx.toFixed(2)}deg) rotateY(${state.ry.toFixed(2)}deg) scale3d(${state.scale.toFixed(3)}, ${state.scale.toFixed(3)}, ${state.scale.toFixed(3)})`;

        const settled = !state.active &&
          Math.abs(state.rx) < 0.02 && Math.abs(state.ry) < 0.02 && Math.abs(state.scale - 1) < 0.001;

        if (settled) {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
          raf = null;
          return;
        }
        raf = requestAnimationFrame(tick);
      }

      function ensureLoop() {
        if (!raf) raf = requestAnimationFrame(tick);
      }

      function setFromPoint(clientX, clientY) {
        const rect = card.getBoundingClientRect();
        const px = (clientX - rect.left) / rect.width;
        const py = (clientY - rect.top) / rect.height;

        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);

        state.active = true;
        state.targetRY = (px - 0.5) * maxTilt;
        state.targetRX = (0.5 - py) * maxTilt;
        state.targetScale = 1.018;
        ensureLoop();
      }

      function release() {
        state.active = false;
        state.targetRX = 0;
        state.targetRY = 0;
        state.targetScale = 1;
        ensureLoop();
      }

      card.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
          setFromPoint(e.clientX, e.clientY);
        }
      });

      card.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') release();
      });

      // Touch: dragging tilts live (touch also fires pointermove while down)
      card.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'touch') return;
        setFromPoint(e.clientX, e.clientY);
        clearTimeout(tapTimer);
        // auto-release shortly after, whether it was a tap or a short drag
        tapTimer = setTimeout(release, 420);
      });

      card.addEventListener('touchmove', (e) => {
        if (!e.touches || !e.touches[0]) return;
        setFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        clearTimeout(tapTimer);
        tapTimer = setTimeout(release, 420);
      }, { passive: true });

      card.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'touch') {
          clearTimeout(tapTimer);
          tapTimer = setTimeout(release, 260);
        }
      });

      card.addEventListener('pointercancel', release);
    });
  }

  /* ---- Magnetic pull effect on primary buttons — mouse drag + touch drag ---- */
  function initMagneticButtons() {
    const magnets = document.querySelectorAll('.btn-primary, .btn-secondary');
    magnets.forEach((btn) => {
      function pull(clientX, clientY) {
        const rect = btn.getBoundingClientRect();
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.4}px) translateZ(0)`;
      }
      function reset() { btn.style.transform = ''; }

      btn.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') pull(e.clientX, e.clientY);
      });
      btn.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') reset();
      });

      btn.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) pull(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      btn.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) pull(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      btn.addEventListener('touchend', reset);
      btn.addEventListener('touchcancel', reset);
    });
  }
})();
