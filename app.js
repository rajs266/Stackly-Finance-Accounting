/* ============================================================
   Stackly — Premium UI (Pure JS)
   Shared behaviours for all pages (feature-detected).
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $id = (id) => document.getElementById(id);
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  /* ============================================================
     1) Toast helpers (shared)
     ============================================================ */
  function baseToast(el, msg, type = 'success') {
    if (!el) return;
    el.textContent = msg;

    // Support both patterns used across the site
    if (el.id === 'toast') {
      el.className = 'toast toast--' + type + ' show';
      window.setTimeout(() => el.classList.remove('show'), 3500);
      return;
    }

    // signin/signup toasts
    const base = el.className.split(' ')[0] || 'toast';
    el.className = base + ' ' + base + '--' + type + ' show';
    window.setTimeout(() => el.classList.remove('show'), 3500);
  }

  window.showToast = function showToast(msg, type = 'success') {
    baseToast($id('toast'), msg, type);
  };

  window.showSigninToast = function showSigninToast(msg, type = 'success') {
    baseToast($id('signinToast'), msg, type);
  };

  window.showSignupToast = function showSignupToast(msg, type = 'success') {
    baseToast($id('signupToast'), msg, type);
  };

  /* ============================================================
     2) Preloader
     ============================================================ */
  window.addEventListener('load', () => {
    const pre = $id('preloader');
    if (!pre) return;
    window.setTimeout(() => pre.classList.add('hide'), 500);
  });

  /* ============================================================
     3) Header scroll state + Scroll-to-top
     ============================================================ */
  (function initHeaderScroll() {
    const header = $id('siteHeader');
    const scrollTopBtn = $id('scrollTop');
    if (!header && !scrollTopBtn) return;

    const onScroll = () => {
      const y = window.scrollY || 0;
      header && header.classList.toggle('scrolled', y > 40);
      scrollTopBtn && scrollTopBtn.classList.toggle('visible', y > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    on(scrollTopBtn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  })();

  /* ============================================================
     4) Mobile overlay menu
     ============================================================ */
  (function initMobileMenu() {
    const hamburger = $id('hamburger');
    const overlay = $id('mobileOverlay');
    const overlayClose = $id('overlayClose');
    if (!hamburger || !overlay) return;

    function openMenu() {
      hamburger.classList.add('open');
      overlay.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.classList.remove('open');
      overlay.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    on(hamburger, 'click', () => (overlay.classList.contains('open') ? closeMenu() : openMenu()));
    on(overlayClose, 'click', closeMenu);
    document.querySelectorAll('.mobile-nav__link').forEach((link) => on(link, 'click', closeMenu));
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  })();

  /* ============================================================
     5) Scroll reveal (IntersectionObserver) + stagger
     ============================================================ */
  (function initReveal() {
    const els = document.querySelectorAll('.reveal, .stagger-children');
    if (!els.length) return;

    // Reduced motion → instantly show
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => obs.observe(el));
  })();

  /* ============================================================
     6) Subtle cursor glow (premium effect)
     ============================================================ */
  (function initCursorGlow() {
    if (prefersReducedMotion) return;
    const hasTouch =
      'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    if (hasTouch) return;

    let raf = 0;
    let lastX = 0;
    let lastY = 0;

    function commit() {
      raf = 0;
      document.documentElement.style.setProperty('--mx', lastX + 'px');
      document.documentElement.style.setProperty('--my', lastY + 'px');
    }

    on(document, 'pointermove', (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!raf) raf = requestAnimationFrame(commit);
    }, { passive: true });
  })();

  /* ============================================================
     7) FAQ accordion (pages that have it)
     ============================================================ */
  (function initFaq() {
    const headers = document.querySelectorAll('.faq-item__header');
    if (!headers.length) return;

    headers.forEach((btn) => {
      on(btn, 'click', () => {
        const item = btn.closest('.faq-item');
        if (!item) return;
        const isOpen = item.classList.contains('open');

        document.querySelectorAll('.faq-item').forEach((i) => {
          i.classList.remove('open');
          const h = i.querySelector('.faq-item__header');
          h && h.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  })();

  /* ============================================================
     8) Pricing toggle (index)
     ============================================================ */
  (function initPricingToggle() {
    const toggle = $id('billingToggle');
    const monthlyLabel = $id('monthlyLabel');
    const yearlyLabel = $id('yearlyLabel');
    if (!toggle) return;

    let isYearly = false;

    function updatePricing() {
      document.querySelectorAll('.price-amount').forEach((el) => {
        const monthly = parseInt(el.dataset.monthly || '0', 10);
        const yearly = parseInt(el.dataset.yearly || '0', 10);
        const val = isYearly ? yearly : monthly;
        el.textContent = val.toLocaleString('en-IN');
      });
    }

    function flip() {
      isYearly = !isYearly;
      toggle.classList.toggle('active', isYearly);
      toggle.setAttribute('aria-checked', String(isYearly));
      monthlyLabel && monthlyLabel.classList.toggle('active', !isYearly);
      yearlyLabel && yearlyLabel.classList.toggle('active', isYearly);
      updatePricing();
    }

    on(toggle, 'click', flip);
    on(toggle, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flip();
      }
    });

    updatePricing();
  })();

  /* ============================================================
     9) Testimonial slider (index)
     ============================================================ */
  (function initTestimonialSlider() {
    const track = $id('testimonialTrack');
    const dotsEl = $id('testimonialDots');
    if (!track) return;
    const cards = Array.from(track.children);
    if (!cards.length) return;

    let current = 0;
    let perView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    let total = Math.max(1, cards.length - perView + 1);
    let autoTimer;

    function buildDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      total = Math.max(1, cards.length - perView + 1);
      for (let i = 0; i < total; i++) {
        const d = document.createElement('button');
        d.className = 'slider-dot' + (i === current ? ' active' : '');
        d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        d.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(d);
      }
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, total - 1));
      const gap = 24; // 1.5rem approx
      const cardW = cards[0].offsetWidth + gap;
      track.style.transform = 'translateX(-' + current * cardW + 'px)';
      dotsEl &&
        dotsEl.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() {
      goTo(current < total - 1 ? current + 1 : 0);
    }
    function prev() {
      goTo(current > 0 ? current - 1 : total - 1);
    }

    const nextBtn = $id('testimonialNext');
    const prevBtn = $id('testimonialPrev');
    on(nextBtn, 'click', () => {
      clearInterval(autoTimer);
      next();
      startAuto();
    });
    on(prevBtn, 'click', () => {
      clearInterval(autoTimer);
      prev();
      startAuto();
    });

    function startAuto() {
      autoTimer = window.setInterval(next, 4500);
    }

    window.addEventListener(
      'resize',
      () => {
        perView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
        buildDots();
        goTo(0);
      },
      { passive: true }
    );

    buildDots();
    goTo(0);
    startAuto();
  })();

  /* ============================================================
     10) Blog: category filter + search
     ============================================================ */
  (function initBlogFilters() {
    const catButtons = document.querySelectorAll('.blog-cat-btn');
    const search = $id('blogSearch');
    const cards = document.querySelectorAll('.blog-page-card');
    if (!catButtons.length && !search) return;

    catButtons.forEach((btn) => {
      on(btn, 'click', () => {
        catButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat || 'all';

        cards.forEach((card) => {
          const ok = cat === 'all' || card.dataset.category === cat;
          card.style.display = ok ? '' : 'none';
          if (ok) card.style.animation = 'slide-up 0.5s var(--ease) both';
        });
      });
    });

    on(search, 'input', function () {
      const term = String(this.value || '').toLowerCase();
      cards.forEach((card) => {
        const title = (card.querySelector('.blog-page-card__title')?.textContent || '').toLowerCase();
        const text = (card.querySelector('.blog-page-card__text')?.textContent || '').toLowerCase();
        card.style.display = title.includes(term) || text.includes(term) ? '' : 'none';
      });
    });
  })();

  /* ============================================================
     11) Forms used on multiple pages
     ============================================================ */
  window.handleNewsletter = function handleNewsletter(e) {
    e.preventDefault();
    window.showToast('✅ Subscribed! Welcome to Stackly Insights.');
    e.target && e.target.reset && e.target.reset();
  };

  // Index quick enquiry (light validation)
  window.handleContact = function handleContact(e) {
    e.preventDefault();
    window.showToast("✅ Enquiry sent! We'll contact you within 24 hours.");
    e.target && e.target.reset && e.target.reset();
  };

  /* Contact page full validation */
  (function initContactPageValidation() {
    const form = $id('contactForm');
    if (!form) return;

    function validateName(name) {
      return /^[a-zA-Z\s]+$/.test(name) && name.trim().length >= 2;
    }
    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function validatePhone(phone) {
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.length === 10;
    }

    window.handleContactSubmit = function handleContactSubmit(e) {
      e.preventDefault();
      let isValid = true;

      const fname = $id('fname');
      const email = $id('email');
      const phone = $id('phone');
      const message = $id('message');

      const fnameGroup = $id('fnameGroup');
      const emailGroup = $id('emailGroup');
      const phoneGroup = $id('phoneGroup');
      const messageGroup = $id('messageGroup');

      if (fname && fnameGroup && !validateName(fname.value.trim())) {
        fnameGroup.classList.add('error');
        isValid = false;
      } else fnameGroup && fnameGroup.classList.remove('error');

      if (email && emailGroup && !validateEmail(email.value.trim())) {
        emailGroup.classList.add('error');
        isValid = false;
      } else emailGroup && emailGroup.classList.remove('error');

      if (phone && phoneGroup && !validatePhone(phone.value.trim())) {
        phoneGroup.classList.add('error');
        isValid = false;
      } else phoneGroup && phoneGroup.classList.remove('error');

      if (message && messageGroup && message.value.trim().length < 10) {
        messageGroup.classList.add('error');
        isValid = false;
      } else messageGroup && messageGroup.classList.remove('error');

      if (isValid) {
        window.showToast("✅ Enquiry sent successfully! We'll contact you within 24 hours.");
        e.target && e.target.reset && e.target.reset();
      } else {
        window.showToast('❌ Please fix the errors in the form.', 'error');
      }
    };

    // realtime blur validation (only if fields exist)
    on($id('fname'), 'blur', function () {
      const group = $id('fnameGroup');
      if (!group) return;
      if (this.value.trim() && !validateName(this.value.trim())) group.classList.add('error');
      else group.classList.remove('error');
    });

    on($id('email'), 'blur', function () {
      const group = $id('emailGroup');
      if (!group) return;
      if (this.value.trim() && !validateEmail(this.value.trim())) group.classList.add('error');
      else group.classList.remove('error');
    });

    on($id('phone'), 'blur', function () {
      const group = $id('phoneGroup');
      if (!group) return;
      if (this.value.trim() && !validatePhone(this.value.trim())) group.classList.add('error');
      else group.classList.remove('error');
    });

    on($id('message'), 'blur', function () {
      const group = $id('messageGroup');
      if (!group) return;
      if (this.value.trim() && this.value.trim().length < 10) group.classList.add('error');
      else group.classList.remove('error');
    });

    // Highlight today's day in hours table (if present)
    (function highlightToday() {
      const table = document.querySelector('.hours-table');
      if (!table) return;
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      document.querySelectorAll('.hours-table td:first-child').forEach((td) => {
        if (td.textContent.trim() === today) {
          td.classList.add('today');
          td.nextElementSibling && td.nextElementSibling.classList.add('today');
        }
      });
    })();
  })();

  /* ============================================================
     12) Index: counters + tech physics (pure JS)
     ============================================================ */
  (function initCounters() {
    const grids = document.querySelectorAll('.stats__grid');
    if (!grids.length) return;

    function animateCounter(el) {
      const raw = (el.textContent || '').replace(/[^0-9.]/g, '');
      const target = parseFloat(raw || '0');
      const suffix = (el.textContent || '').replace(/[0-9.,]/g, '').trim();
      const duration = 1800;
      const steps = 60;
      let step = 0;

      const timer = window.setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = current.toLocaleString('en-IN') + suffix;
        if (step >= steps) {
          window.clearInterval(timer);
          el.textContent = target.toLocaleString('en-IN') + suffix;
        }
      }, duration / steps);
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.stat-item__num').forEach((num) => animateCounter(num));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.querySelectorAll('.stat-item__num').forEach((num) => animateCounter(num));
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    grids.forEach((g) => obs.observe(g));
  })();

  (function initTechGravityCards() {
    const arena = document.querySelector('.tech__grid--physics');
    if (!arena) return;

    const cards = Array.from(arena.querySelectorAll('.tech-card'));
    if (!cards.length) return;

    let items = [];
    let arenaW = 0;
    let arenaH = 0;
    let rafId = 0;
    let running = false;
    let lastTime = 0;
    let dragging = null;

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function measure() {
      const rect = arena.getBoundingClientRect();
      arenaW = rect.width;
      arenaH = rect.height;
    }

    function syncDom() {
      items.forEach((item) => {
        item.card.style.transform =
          'translate(' + item.x.toFixed(1) + 'px, ' + item.y.toFixed(1) + 'px) rotate(' + item.angle.toFixed(4) + 'rad)';
      });
    }

    function layoutCards() {
      measure();
      const cardW = arenaW < 420 ? 104 : 116;
      const cardH = arenaW < 420 ? 68 : 74;
      const gap = arenaW < 420 ? 8 : 10;
      const cols = Math.max(1, Math.floor((arenaW - gap) / (cardW + gap)));

      items = cards.map((card, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = clamp(gap + col * (cardW + gap), 0, arenaW - cardW);
        const y = Math.min(18 + row * 10, Math.max(0, arenaH - cardH - 12));

        Object.assign(card.style, {
          position: 'absolute',
          left: '0',
          top: '0',
          width: cardW + 'px',
          minHeight: cardH + 'px',
          margin: '0',
          cursor: 'grab',
          userSelect: 'none',
          willChange: 'transform',
          transformOrigin: 'center center',
        });

        return {
          card,
          x,
          y,
          w: cardW,
          h: cardH,
          vx: (Math.random() - 0.5) * 50,
          vy: 0,
          angle: (Math.random() - 0.5) * 0.12,
          av: (Math.random() - 0.5) * 0.8,
        };
      });

      syncDom();
    }

    function resolveWalls(item) {
      const bounce = 0.42;

      if (item.x < 0) {
        item.x = 0;
        item.vx = Math.abs(item.vx) * bounce;
      } else if (item.x + item.w > arenaW) {
        item.x = arenaW - item.w;
        item.vx = -Math.abs(item.vx) * bounce;
      }

      if (item.y < 0) {
        item.y = 0;
        item.vy = Math.abs(item.vy) * bounce;
      } else if (item.y + item.h > arenaH) {
        item.y = arenaH - item.h;
        item.vy = -Math.abs(item.vy) * bounce;
        item.vx *= 0.86;
        item.av *= 0.72;

        if (Math.abs(item.vy) < 24) item.vy = 0;
        if (Math.abs(item.vx) < 4) item.vx = 0;
        if (Math.abs(item.av) < 0.02) item.av = 0;
      }
    }

    function resolveCollisions() {
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];
          if (a === dragging || b === dragging) continue;

          const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
          const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
          if (overlapX <= 0 || overlapY <= 0) continue;

          if (overlapX < overlapY) {
            const push = overlapX / 2;
            if (a.x < b.x) {
              a.x -= push;
              b.x += push;
            } else {
              a.x += push;
              b.x -= push;
            }
            const impulse = (a.vx - b.vx) * 0.18;
            a.vx -= impulse;
            b.vx += impulse;
          } else {
            const push = overlapY / 2;
            if (a.y < b.y) {
              a.y -= push;
              b.y += push;
            } else {
              a.y += push;
              b.y -= push;
            }
            const impulse = (a.vy - b.vy) * 0.18;
            a.vy -= impulse;
            b.vy += impulse;
          }

          resolveWalls(a);
          resolveWalls(b);
        }
      }
    }

    function step(time) {
      if (!running) return;
      rafId = requestAnimationFrame(step);

      const dt = Math.min((time - lastTime) / 1000 || 0.016, 0.033);
      lastTime = time;

      items.forEach((item) => {
        if (item === dragging) return;

        item.vy += 980 * dt;
        item.x += item.vx * dt;
        item.y += item.vy * dt;
        item.angle += item.av * dt;
        item.vx *= 0.995;
        item.vy *= 0.998;
        item.av *= 0.985;

        resolveWalls(item);
      });

      resolveCollisions();
      syncDom();
    }

    function start() {
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(step);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    cards.forEach((card, index) => {
      on(card, 'pointerdown', (event) => {
        const item = items[index];
        if (!item) return;

        event.preventDefault();
        card.setPointerCapture(event.pointerId);
        card.classList.add('is-dragging');

        const arenaRect = arena.getBoundingClientRect();
        dragging = item;
        dragging.offsetX = event.clientX - arenaRect.left - item.x;
        dragging.offsetY = event.clientY - arenaRect.top - item.y;
      });

      on(card, 'pointermove', (event) => {
        if (!dragging || items[index] !== dragging) return;
        const arenaRect = arena.getBoundingClientRect();
        dragging.x = clamp(event.clientX - arenaRect.left - dragging.offsetX, 0, arenaW - dragging.w);
        dragging.y = clamp(event.clientY - arenaRect.top - dragging.offsetY, 0, arenaH - dragging.h);
        dragging.vx = 0;
        dragging.vy = 0;
        syncDom();
      });

      on(card, 'pointerup', () => {
        if (!dragging || items[index] !== dragging) return;
        card.classList.remove('is-dragging');
        dragging = null;
      });
    });

    layoutCards();

    // Start only when visible (performance)
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? start() : stop()),
        { threshold: 0.05 }
      );
      io.observe(arena);
    } else {
      start();
    }

    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        layoutCards();
      }).observe(arena);
    } else {
      window.addEventListener(
        'resize',
        () => {
          layoutCards();
        },
        { passive: true }
      );
    }
  })();

  /* ============================================================
     13) Sign in / Sign up logic (shared)
     ============================================================ */
  (function initAuthPages() {
    const signinForm = $id('signinForm');
    const signupForm = $id('signupForm');
    if (!signinForm && !signupForm) return;

    // Role badge (used on both pages)
    (function roleBadgeInit() {
      const inputs = document.querySelectorAll('input[name="role"]');
      const badge = $id('roleBadge');
      if (!inputs.length || !badge) return;
      inputs.forEach((input) => {
        on(input, 'change', () => {
          const role = input.value;
          const isAdmin = role === 'admin';
          badge.className = 'role-badge ' + (isAdmin ? 'role-badge--admin' : 'role-badge--guest');
          const action = signupForm ? 'Creating account as' : 'Signing in as';
          badge.innerHTML = isAdmin
            ? '<i class="fa-solid fa-user-shield"></i> ' + action + ' <strong>Admin</strong>'
            : '<i class="fa-solid fa-user"></i> ' + action + ' <strong>Guest</strong>';
        });
      });
    })();

    // Password toggles (signin: #passwordToggle, signup: #passwordToggle + #confirmToggle)
    function bindPasswordToggle(btnId, inputId) {
      const btn = $id(btnId);
      const pw = $id(inputId);
      if (!btn || !pw) return;
      on(btn, 'click', () => {
        const icon = btn.querySelector('i');
        if (pw.type === 'password') {
          pw.type = 'text';
          icon && (icon.className = 'fa-solid fa-eye-slash');
        } else {
          pw.type = 'password';
          icon && (icon.className = 'fa-solid fa-eye');
        }
      });
    }
    bindPasswordToggle('passwordToggle', 'password');
    bindPasswordToggle('confirmToggle', 'confirmPassword');

    // Password strength (signup)
    (function passwordStrength() {
      const pw = $id('password');
      const meter = $id('passwordStrength');
      const fill = $id('strengthFill');
      const text = $id('strengthText');
      if (!pw || !meter || !fill || !text || !signupForm) return;

      on(pw, 'input', () => {
        const val = pw.value || '';
        if (!val.length) {
          meter.classList.remove('show');
          return;
        }
        meter.classList.add('show');

        let strength = 0;
        if (val.length >= 8) strength++;
        if (/[a-z]/.test(val) && /[A-Z]/.test(val)) strength++;
        if (/[0-9]/.test(val)) strength++;
        if (/[^a-zA-Z0-9]/.test(val)) strength++;

        fill.className = 'password-strength__fill';
        text.className = 'password-strength__text';

        if (strength <= 1) {
          fill.classList.add('weak');
          text.classList.add('weak');
          text.textContent = 'Weak — Add more characters and symbols';
        } else if (strength === 2 || strength === 3) {
          fill.classList.add('medium');
          text.classList.add('medium');
          text.textContent = 'Medium — Good, but could be stronger';
        } else {
          fill.classList.add('strong');
          text.classList.add('strong');
          text.textContent = 'Strong — Excellent password!';
        }
      });
    })();

    function validateName(name) {
      return /^[a-zA-Z\s]+$/.test(name) && name.trim().length >= 3;
    }
    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function validatePhone(phone) {
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.length === 10;
    }
    function validatePasswordSignin(pw) {
      return String(pw || '').length >= 6;
    }
    function validatePasswordSignup(pw) {
      const s = String(pw || '');
      return s.length >= 8 && /[a-zA-Z]/.test(s) && /[0-9]/.test(s);
    }

    /* Social buttons */
    window.handleSocialSignin = function handleSocialSignin(provider) {
      window.showSigninToast('Redirecting to ' + provider + '… (demo)', 'success');
    };
    window.handleSocialSignup = function handleSocialSignup(provider) {
      window.showSignupToast('Redirecting to ' + provider + '… (demo)', 'success');
    };

    /* Sign in submit (demo) */
    window.handleSignin = function handleSignin(e) {
      e.preventDefault();

      const submitBtn = $id('signinSubmit');
      const nameGroup = $id('nameGroup');
      const emailGroup = $id('emailGroup');
      const passwordGroup = $id('passwordGroup');

      const fullName = ($id('fullName')?.value || '').trim();
      const email = ($id('email')?.value || '').trim();
      const password = $id('password')?.value || '';
      const role = document.querySelector('input[name="role"]:checked')?.value || 'guest';

      let isValid = true;
      if (nameGroup && !validateName(fullName)) {
        nameGroup.classList.add('has-error');
        isValid = false;
      } else nameGroup && nameGroup.classList.remove('has-error');

      if (emailGroup && !validateEmail(email)) {
        emailGroup.classList.add('has-error');
        isValid = false;
      } else emailGroup && emailGroup.classList.remove('has-error');

      if (passwordGroup && !validatePasswordSignin(password)) {
        passwordGroup.classList.add('has-error');
        isValid = false;
      } else passwordGroup && passwordGroup.classList.remove('has-error');

      if (!isValid) {
        window.showSigninToast('Please fix the errors in the form.', 'error');
        return;
      }

      submitBtn && submitBtn.classList.add('loading');
      submitBtn && (submitBtn.disabled = true);

      window.setTimeout(() => {
        submitBtn && submitBtn.classList.remove('loading');
        submitBtn && (submitBtn.disabled = false);

        localStorage.setItem(
          'stackly_user',
          JSON.stringify({
            loggedIn: true,
            role,
            name: fullName,
            email,
          })
        );

        window.showSigninToast('✅ Signed in successfully! Redirecting…', 'success');
        window.setTimeout(() => {
          window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'guest-dashboard.html';
        }, 650);
      }, 900);
    };

    /* Sign up submit (demo) */
    window.handleSignup = function handleSignup(e) {
      e.preventDefault();

      const submitBtn = $id('signupSubmit');
      const fnameGroup = $id('fnameGroup');
      const lnameGroup = $id('lnameGroup');
      const emailGroup = $id('emailGroup');
      const phoneGroup = $id('phoneGroup');
      const passwordGroup = $id('passwordGroup');
      const confirmGroup = $id('confirmPasswordGroup');
      const termsError = $id('termsError');

      const firstName = ($id('firstName')?.value || '').trim();
      const lastName = ($id('lastName')?.value || '').trim();
      const email = ($id('email')?.value || '').trim();
      const phone = ($id('phone')?.value || '').trim();
      const password = $id('password')?.value || '';
      const confirmPassword = $id('confirmPassword')?.value || '';
      const terms = Boolean($id('terms')?.checked);
      const role = document.querySelector('input[name="role"]:checked')?.value || 'guest';

      let isValid = true;

      if (fnameGroup && !validateName(firstName)) {
        fnameGroup.classList.add('has-error');
        isValid = false;
      } else fnameGroup && fnameGroup.classList.remove('has-error');

      if (lnameGroup && !validateName(lastName)) {
        lnameGroup.classList.add('has-error');
        isValid = false;
      } else lnameGroup && lnameGroup.classList.remove('has-error');

      if (emailGroup && !validateEmail(email)) {
        emailGroup.classList.add('has-error');
        isValid = false;
      } else emailGroup && emailGroup.classList.remove('has-error');

      if (phoneGroup && !validatePhone(phone)) {
        phoneGroup.classList.add('has-error');
        isValid = false;
      } else phoneGroup && phoneGroup.classList.remove('has-error');

      if (passwordGroup && !validatePasswordSignup(password)) {
        passwordGroup.classList.add('has-error');
        isValid = false;
      } else passwordGroup && passwordGroup.classList.remove('has-error');

      if (confirmGroup && (password !== confirmPassword || !confirmPassword)) {
        confirmGroup.classList.add('has-error');
        isValid = false;
      } else confirmGroup && confirmGroup.classList.remove('has-error');

      if (!terms) {
        if (termsError) termsError.style.display = 'block';
        isValid = false;
      } else if (termsError) termsError.style.display = 'none';

      if (!isValid) {
        window.showSignupToast('Please fix the errors in the form.', 'error');
        return;
      }

      submitBtn && submitBtn.classList.add('loading');
      submitBtn && (submitBtn.disabled = true);

      window.setTimeout(() => {
        submitBtn && submitBtn.classList.remove('loading');
        submitBtn && (submitBtn.disabled = false);

        localStorage.setItem(
          'stackly_user',
          JSON.stringify({
              loggedIn: false,
            role,
            firstName,
            lastName,
            name: firstName + ' ' + lastName,
            email,
            phone,
            company: $id('company')?.value || '',
          })
        );

          window.showSignupToast('✅ Account created! Redirecting to Sign In…', 'success');
        window.setTimeout(() => {
            window.location.href = 'signin.html';
        }, 650);
      }, 1000);
    };
  })();
})();
