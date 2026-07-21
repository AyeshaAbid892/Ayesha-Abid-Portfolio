// ========================================================
// PREMIUM ENHANCEMENT LAYER (JS)
// Additive only: does not touch existing functions in
// script.js. Respects prefers-reduced-motion and touch input.
// ========================================================

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    injectAmbientOrbs();
    // initCursorGlow() and initTiltCards() are handled by motion3d.js now
    // (broader element coverage + stronger tilt) — running both here too
    // made every card's transform fight itself on every mousemove.
    initStatCounters();
    initStaggerReveal();
    initHeroParallax();
  });

  // ---------------- Ambient floating orbs in hero ----------------
  function injectAmbientOrbs() {
    const hero = document.getElementById('home');
    if (!hero || prefersReducedMotion) return;

    const field = document.createElement('div');
    field.className = 'ambient-field';
    field.innerHTML =
      '<div class="ambient-orb o1"></div>' +
      '<div class="ambient-orb o2"></div>' +
      '<div class="ambient-orb o3"></div>';
    hero.prepend(field);
  }

  // ---------------- Cursor glow (desktop only) ----------------
  function initCursorGlow() {
    if (isTouch || prefersReducedMotion) return;

    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    document.body.appendChild(glow);

    let raf = null;
    window.addEventListener('mousemove', (e) => {
      glow.classList.add('active');
      if (raf) return;
      raf = requestAnimationFrame(() => {
        glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        raf = null;
      });
    });

    document.addEventListener('mouseleave', () => glow.classList.remove('active'));
  }

  // ---------------- Mouse-based 3D tilt ----------------
  function initTiltCards() {
    if (isTouch || prefersReducedMotion) return;

    const selectors = [
      '.service-card', '.tool-card', '.expertise-card',
      '.exp-card', '.about-image-wrapper'
    ];
    const cards = document.querySelectorAll(selectors.join(','));

    cards.forEach((card) => {
      const maxTilt = card.classList.contains('tool-card') ? 6 : 8;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = x / rect.width;
        const py = y / rect.height;

        const rotateX = (0.5 - py) * maxTilt;
        const rotateY = (px - 0.5) * maxTilt;

        card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ---------------- Animated stat counters ----------------
  function initStatCounters() {
    const stats = document.querySelectorAll('.stat-number, .skill-percent');
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    stats.forEach((el) => observer.observe(el));
  }

  function animateCount(el) {
    const raw = el.textContent.trim();
    const match = raw.match(/^(\d+)(.*)$/);
    if (!match) return;

    const target = parseInt(match[1], 10);
    const suffix = match[2] || '';
    const duration = prefersReducedMotion ? 0 : 1400;

    if (duration === 0) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = `${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------------- Staggered reveal delays ----------------
  function initStaggerReveal() {
    const groups = document.querySelectorAll(
      '.services-grid, .expertise-grid, .skills-grid, .projects-grid, ' +
      '.blog-grid, .career-grid, .exp-grid'
    );

    groups.forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        child.style.setProperty('--stagger', String(i % 6));
      });
    });
  }

  // ---------------- Subtle hero portrait parallax ----------------
  function initHeroParallax() {
    if (isTouch || prefersReducedMotion) return;
    const hero = document.getElementById('home');
    if (!hero) return;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty('--tx', `${px * -14}px`);
      hero.style.setProperty('--ty', `${py * -10}px`);
    });
  }
})();
