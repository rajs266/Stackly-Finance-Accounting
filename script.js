function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast toast--' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 3500);
}


window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (pre) setTimeout(() => pre.classList.add('hide'), 500);
});


const header = document.getElementById('siteHeader');
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
}, { passive: true });


const hamburger = document.getElementById('hamburger');
const overlay = document.getElementById('mobileOverlay');
const overlayClose = document.getElementById('overlayClose');

function openMenu() {
  if (hamburger) hamburger.classList.add('open');
  if (overlay) overlay.classList.add('open');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
}

function closeMenu() {
  if (hamburger) hamburger.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

if (hamburger) hamburger.addEventListener('click', () => overlay.classList.contains('open') ? closeMenu() : openMenu());
if (overlayClose) overlayClose.addEventListener('click', closeMenu);

document.querySelectorAll('.mobile-nav__link').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });


window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMenu();
  }
}, { passive: true });


if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    scrollTopBtn.classList.add('launching');
    const video = document.getElementById('scrollTopVideo');
    const img = document.getElementById('scrollTopImg');
    
    if (video && img) {
      video.style.display = 'none';
      img.style.display = 'block';
      
    
      void img.offsetWidth;
      
      img.style.transition = 'transform 1.5s ease-in';
      img.style.transform = 'translateY(-1000px)';
      
      
      img.src = 'assets/launching.webp?' + new Date().getTime();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    
    setTimeout(() => {
      scrollTopBtn.classList.remove('launching');
      if (video && img) {
        img.style.transition = 'none';
        img.style.transform = 'translateY(0)';
        img.style.display = 'none';
        video.style.display = 'block';
      }
    }, 1500);
  });
}


const revealEls = document.querySelectorAll('.reveal, .stagger-children');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.02, rootMargin: '0px 0px -20px 0px' });
revealEls.forEach(el => revealObs.observe(el));


function animateCounter(el) {
  const target = parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
  const suffix = el.textContent.replace(/[0-9.,]/g, '').trim();
  const duration = 1800;
  const steps = 60;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    const progress = step / steps;
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current.toLocaleString('en-IN') + suffix;
    if (step >= steps) { clearInterval(timer); el.textContent = target.toLocaleString('en-IN') + suffix; }
  }, duration / steps);
}

const statsObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-item__num').forEach(num => {
        animateCounter(num);
      });
      statsObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.stats-section').forEach(el => statsObs.observe(el));


(function () {
  const track = document.getElementById('testimonialTrack');
  const cards = track ? Array.from(track.children) : [];
  const dotsEl = document.getElementById('testimonialDots');
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
    const cardW = cards[0].offsetWidth + 24; 
    track.style.transform = 'translateX(-' + (current * cardW) + 'px)';
    dotsEl && dotsEl.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo(current < total - 1 ? current + 1 : 0); }
  function prev() { goTo(current > 0 ? current - 1 : total - 1); }

  const nextBtn = document.getElementById('testimonialNext');
  const prevBtn = document.getElementById('testimonialPrev');
  if (nextBtn) nextBtn.addEventListener('click', () => { clearInterval(autoTimer); next(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { clearInterval(autoTimer); prev(); startAuto(); });

  function startAuto() { autoTimer = setInterval(next, 4500); }

  window.addEventListener('resize', () => {
    perView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    buildDots();
    goTo(0);
  }, { passive: true });

  buildDots();
  goTo(0);
  startAuto();
})();


const toggle = document.getElementById('billingToggle');
const monthlyLabel = document.getElementById('monthlyLabel');
const yearlyLabel = document.getElementById('yearlyLabel');
if (toggle && monthlyLabel && yearlyLabel) {
  let isYearly = false;

  function updatePricing() {
    document.querySelectorAll('.price-amount').forEach(el => {
      const monthly = parseInt(el.dataset.monthly);
      const yearly = parseInt(el.dataset.yearly);
      const val = isYearly ? yearly : monthly;
      el.textContent = val.toLocaleString('en-IN');
    });
  }

  toggle.addEventListener('click', () => {
    isYearly = !isYearly;
    toggle.classList.toggle('active', isYearly);
    toggle.setAttribute('aria-checked', isYearly);
    monthlyLabel.classList.toggle('active', !isYearly);
    yearlyLabel.classList.toggle('active', isYearly);
    updatePricing();
  });

  toggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
  });
}


document.querySelectorAll('.faq-item__header').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-item__header').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});


window.handleNewsletter = function(e) {
  e.preventDefault();
  showToast('✅ Subscribed! Welcome to Stackly Insights.');
  e.target.reset();
}

window.handleContact = function(e) {
  e.preventDefault();
  showToast();
  e.target.reset();
}


if (window.location.pathname.includes('dashboard')) {
  const user = JSON.parse(localStorage.getItem('stackly_user') || 'null');
  if (!user || !user.loggedIn) {
    window.location.replace('signin.html');
  } else {
    const name = user.name || (user.firstName ? user.firstName + ' ' + user.lastName : (window.location.pathname.includes('admin') ? 'Admin' : 'Guest'));
    const email = user.email || (window.location.pathname.includes('admin') ? 'admin@stackly.com' : 'guest@stackly.com');
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const updateText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    
    updateText('sidebarUserName', name);
    updateText('sidebarUserEmail', email);
    updateText('sidebarAvatarText', initials);
    updateText('topbarAvatarText', initials);
    updateText('topbarUserName', name.split(' ')[0]);
    updateText('welcomeName', name.split(' ')[0]);
    updateText('profileAvatarText', initials);
    updateText('profileName', name);
    updateText('profileEmail', email);

    if (window.location.pathname.includes('admin')) {
      updateText('welcomeEmail', email + ' · Last login: Today, 9:42 AM');
      document.title = 'Admin Dashboard — ' + name;
    } else {
      updateText('welcomeEmail', email + ' · View-only access');
      document.title = 'Guest Dashboard — ' + name;
    }
  }

  
  let sidebarOpen = false;
  window.toggleSidebar = function() {
    sidebarOpen = !sidebarOpen;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const icon = document.getElementById('hamburgerIcon');
    if (sidebarOpen) {
      if (sidebar) sidebar.classList.add('open');
      if (overlay) overlay.classList.add('active');
      if (icon) icon.className = 'fa-solid fa-xmark';
    } else {
      closeSidebar();
    }
  }

  window.closeSidebar = function() {
    sidebarOpen = false;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const icon = document.getElementById('hamburgerIcon');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    if (icon) icon.className = 'fa-solid fa-bars';
  }

  window.setActive = function(el, sectionName) {
    document.querySelectorAll('.sidebar__nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    const title = document.querySelector('.topbar__page-title');
    if (title) title.innerHTML = (window.location.pathname.includes('admin') ? 'Admin <span>' : 'My <span>') + sectionName + '</span>';
    if (window.innerWidth <= 1024) closeSidebar();
    showToast('Navigated to ' + sectionName);
  }

  window.showLogoutModal = function() { const m = document.getElementById('logoutModal'); if(m) m.classList.add('active'); }
  window.closeLogoutModal = function() { const m = document.getElementById('logoutModal'); if(m) m.classList.remove('active'); }
  window.confirmLogout = function() { localStorage.removeItem('stackly_user'); window.location.replace('signin.html'); }
  
  const logoutModal = document.getElementById('logoutModal');
  if(logoutModal) {
    logoutModal.addEventListener('click', function(e) { if (e.target === this) closeLogoutModal(); });
  }

  window.toggleTask = function(item) {
    item.classList.toggle('completed');
    const cb = item.querySelector('.task-checkbox');
    if(cb) cb.classList.toggle('done');
  }

  window.addEventListener('resize', function() {
    if (window.innerWidth > 1024 && typeof closeSidebar === 'function') closeSidebar();
  });
}



(function () {
  'use strict';

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

  function layoutCards() {
    measure();
    const cardW = arenaW < 480 ? 96 : 116;
    const cardH = arenaW < 480 ? 62 : 74;
    const gap = arenaW < 480 ? 8 : 10;
    const cols = Math.max(1, Math.floor((arenaW - gap) / (cardW + gap)));

    items = cards.map((card, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = clamp(gap + col * (cardW + gap), 0, arenaW - cardW);
      
      const startY = arenaW < 768 ? 240 : 200;
      const y = clamp(startY + row * (cardH + gap), 0, Math.max(0, arenaH - cardH - 16));

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
        vx: (Math.random() - 0.5) * 40,
        vy: 0,
        angle: arenaW < 480 ? 0 : (Math.random() - 0.5) * 0.12,
        av: arenaW < 480 ? 0 : (Math.random() - 0.5) * 0.8,
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

  function syncDom() {
    items.forEach(item => {
      item.card.style.transform =
        `translate(${item.x.toFixed(1)}px, ${item.y.toFixed(1)}px) rotate(${item.angle.toFixed(4)}rad)`;
    });
  }

  function step(time) {
    if (!running) return;
    rafId = requestAnimationFrame(step);

    const dt = Math.min((time - lastTime) / 1000 || 0.016, 0.033);
    lastTime = time;

    items.forEach(item => {
      if (item === dragging) return;

      
      item.vy += 980 * dt;

      item.x += item.vx * dt;
      item.y += item.vy * dt;
      
      if (arenaW < 480) {
        item.angle = 0;
        item.av = 0;
      } else {
        item.angle += item.av * dt;
      }
      
      item.vx *= 0.995;
      item.vy *= 0.998;
      item.av *= 0.985;

      resolveWalls(item);
    });

    const iterations = arenaW < 480 ? 8 : 4;
    for (let iter = 0; iter < iterations; iter++) {
      resolveCollisions();
    }
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
    card.addEventListener('pointerdown', event => {
      const item = items[index];
      if (!item) return;

      card.setPointerCapture(event.pointerId);
      card.classList.add('is-dragging');

      const arenaRect = arena.getBoundingClientRect();
      dragging = item;
      dragging.offsetX = event.clientX - arenaRect.left - item.x;
      dragging.offsetY = event.clientY - arenaRect.top - item.y;
      dragging.lastX = event.clientX;
      dragging.lastY = event.clientY;
      dragging.lastMove = performance.now();
      dragging.vx = 0;
      dragging.vy = 0;
      if (arenaW < 480) {
        dragging.angle = 0;
        dragging.av = 0;
      }
      start();
    });

    card.addEventListener('pointermove', event => {
      const item = items[index];
      if (dragging !== item) return;

      const now = performance.now();
      const arenaRect = arena.getBoundingClientRect();
      const nextX = event.clientX - arenaRect.left - item.offsetX;
      const nextY = event.clientY - arenaRect.top - item.offsetY;
      const dt = Math.max((now - item.lastMove) / 1000, 0.016);

      item.vx = (event.clientX - item.lastX) / dt;
      item.vy = (event.clientY - item.lastY) / dt;
      item.x = clamp(nextX, 0, arenaW - item.w);
      item.y = clamp(nextY, 0, arenaH - item.h);
      
      if (arenaW < 480) {
        item.angle = 0;
        item.av = 0;
      } else {
        item.av = clamp(item.vx / 500, -2.4, 2.4);
        item.angle += item.av * 0.015;
      }

      item.lastX = event.clientX;
      item.lastY = event.clientY;
      item.lastMove = now;
      syncDom();
    });

    function release(event) {
      const item = items[index];
      if (dragging !== item) return;

      card.classList.remove('is-dragging');
      if (card.hasPointerCapture(event.pointerId)) {
        card.releasePointerCapture(event.pointerId);
      }
      dragging = null;
    }

    card.addEventListener('pointerup', release);
    card.addEventListener('pointercancel', release);
  });

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) start();
    else stop();
  }, { threshold: 0.05 });

  layoutCards();
  observer.observe(arena);

  if (window.ResizeObserver) {
    let resizeTimer = 0;
    new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layoutCards, 120);
    }).observe(arena);
  }
})();




(function() {
  const imgRevealEls = document.querySelectorAll('.img-reveal');
  if (!imgRevealEls.length) return;
  const imgObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        imgObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  imgRevealEls.forEach(el => imgObs.observe(el));
})();


(function() {
  const catBtns = document.querySelectorAll('.blog-cat-btn');
  if (!catBtns.length) return;
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.blog-page-card').forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = '';
          card.style.animation = 'slide-up 0.4s var(--ease) both';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();


(function() {
  const blogSearch = document.getElementById('blogSearch');
  if (!blogSearch) return;
  blogSearch.addEventListener('input', function() {
    const term = this.value.toLowerCase();
    document.querySelectorAll('.blog-page-card').forEach(card => {
      const title = card.querySelector('.blog-page-card__title');
      const text = card.querySelector('.blog-page-card__text');
      const titleText = title ? title.textContent.toLowerCase() : '';
      const bodyText = text ? text.textContent.toLowerCase() : '';
      card.style.display = (titleText.includes(term) || bodyText.includes(term)) ? '' : 'none';
    });
  });
})();


(function() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  function validateName(name) { return /^[a-zA-Z\s]+$/.test(name) && name.trim().length >= 1; }
  function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  function validatePhone(phone) { return phone.replace(/\D/g, '').length === 10; }

  window.handleContactSubmit = function(e) {
    e.preventDefault();
    let isValid = true;

    const fields = [
      { id: 'fname', groupId: 'fnameGroup', validate: v => validateName(v) },
      { id: 'lname', groupId: 'lnameGroup', validate: v => validateName(v) },
      { id: 'email', groupId: 'emailGroup', validate: v => validateEmail(v) },
      { id: 'phone', groupId: 'phoneGroup', validate: v => validatePhone(v) },
      { id: 'message', groupId: 'messageGroup', validate: v => v.trim().length >= 10 },
    ];

    fields.forEach(f => {
      const el = document.getElementById(f.id);
      const group = document.getElementById(f.groupId);
      if (!el || !group) return;
      if (!f.validate(el.value.trim())) {
        group.classList.add('error');
        isValid = false;
      } else {
        group.classList.remove('error');
      }
    });

    if (isValid) {
      window.location.href = '404.html';
    } else {
      showToast('Please fix the errors in the form.', 'error');
    }
  };

  
  ['fname', 'lname', 'email', 'phone', 'message'].forEach(id => {
    const el = document.getElementById(id);
    const group = document.getElementById(id + 'Group');
    if (!el || !group) return;
    el.addEventListener('blur', function() {
      if (this.value.trim()) group.classList.toggle('error', !this.value.trim());
    });
  });

  
  (function highlightToday() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    document.querySelectorAll('.hours-table td:first-child').forEach(td => {
      if (td.textContent.trim() === today) {
        td.classList.add('today');
        if (td.nextElementSibling) td.nextElementSibling.classList.add('today');
      }
    });
  })();
})();


(function() {
  
  window.showSigninToast = function(msg, type = 'success') {
    const t = document.getElementById('signinToast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'signin-toast signin-toast--' + type + ' show';
    setTimeout(() => t.classList.remove('show'), 3500);
  };

  
  const roleInputs = document.querySelectorAll('input[name="role"]');
  const roleBadge = document.getElementById('roleBadge');
  if (roleInputs.length && roleBadge) {
    roleInputs.forEach(input => {
      input.addEventListener('change', () => {
        const role = input.value;
        const isAdmin = role === 'admin';
        roleBadge.className = 'role-badge ' + (isAdmin ? 'role-badge--admin' : 'role-badge--guest');
        roleBadge.innerHTML = isAdmin
          ? '<i class="fa-solid fa-user-shield"></i> Signing in as <strong>Admin</strong>'
          : '<i class="fa-solid fa-user"></i> Signing in as <strong>Guest</strong>';
      });
    });
  }


  const pwToggle = document.getElementById('passwordToggle');
  if (pwToggle) {
    pwToggle.addEventListener('click', function() {
      const pw = document.getElementById('password');
      const icon = this.querySelector('i');
      if (!pw || !icon) return;
      if (pw.type === 'password') {
        pw.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
      } else {
        pw.type = 'password';
        icon.className = 'fa-solid fa-eye';
      }
    });
  }

  const signinForm = document.getElementById('signinForm');
  if (!signinForm) return;

  function validateName(name) { return /^[a-zA-Z\s]+$/.test(name) && name.trim().length >= 1; }
  function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  function validatePassword(pw) { return pw.length >= 6; }

  window.handleSignin = function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('signinSubmit');
    const nameGroup = document.getElementById('nameGroup');
    const emailGroup = document.getElementById('emailGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    const name = (document.getElementById('fullName') || {}).value || '';
    const email = (document.getElementById('email') || {}).value || '';
    const password = (document.getElementById('password') || {}).value || '';
    const roleEl = document.querySelector('input[name="role"]:checked');
    const role = roleEl ? roleEl.value : 'guest';
    let isValid = true;

    if (!validateName(name.trim())) { if (nameGroup) nameGroup.classList.add('has-error'); isValid = false; }
    else { if (nameGroup) nameGroup.classList.remove('has-error'); }
    if (!validateEmail(email.trim())) { if (emailGroup) emailGroup.classList.add('has-error'); isValid = false; }
    else { if (emailGroup) emailGroup.classList.remove('has-error'); }
    if (!validatePassword(password)) { if (passwordGroup) passwordGroup.classList.add('has-error'); isValid = false; }
    else { if (passwordGroup) passwordGroup.classList.remove('has-error'); }

    if (!isValid) { window.showSigninToast('Please fix the errors in the form.', 'error'); return; }

    if (submitBtn) { submitBtn.classList.add('loading'); submitBtn.disabled = true; }
    setTimeout(() => {
      if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
      localStorage.setItem('stackly_user', JSON.stringify({ name: name.trim(), email: email.trim(), role, loggedIn: true, loginTime: new Date().toISOString() }));
      window.showSigninToast('Welcome back, ' + name.trim().split(' ')[0] + '! Redirecting...', 'success');
      setTimeout(() => { window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'guest-dashboard.html'; }, 1500);
    }, 1500);
  };

  window.handleSocialSignin = function(provider) {
    window.showSigninToast('Signing in with ' + provider + '...', 'success');
    setTimeout(() => {
      const role = (document.querySelector('input[name="role"]:checked') || {}).value || 'guest';
      localStorage.setItem('stackly_user', JSON.stringify({ name: 'Social User', email: 'user@' + provider.toLowerCase() + '.com', role, loggedIn: true, loginTime: new Date().toISOString(), provider }));
      window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'guest-dashboard.html';
    }, 1500);
  };

  document.querySelectorAll('.signin-form-input').forEach(input => {
    input.addEventListener('input', function() {
      const g = this.closest('.signin-form-group');
      if (g) g.classList.remove('has-error');
    });
  });
})();


(function() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute;border-radius:50%;
        width:${size}px;height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        background:rgba(255,255,255,0.25);
        transform:scale(0);animation:ripple-btn 0.55s ease forwards;
        pointer-events:none;`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  
  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = '@keyframes ripple-btn { to { transform: scale(2.5); opacity: 0; } }';
    document.head.appendChild(s);
  }
})();


(function() {
  const tiltCards = document.querySelectorAll('.service-card, .pricing-card, .blog-card, .team-card');
  if (window.matchMedia('(hover: hover)').matches) {
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(10px)`;
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s ease';
        setTimeout(() => { card.style.transition = ''; }, 400);
      });
    });
  }
})();


(function() {
  const typingEl = document.querySelector('.typewriter-text');
  if (!typingEl) return;
  const words = ["Modern Business", "Strategic Growth", "Financial Success"];
  let wordIndex = 0;
  let charIndex = words[0].length;
  let isDeleting = true;
  
  typingEl.textContent = words[0];

  function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      typingEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }
    
    let typeSpeed = isDeleting ? 50 : 100;
    
    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 2000; 
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 500; 
    }
    
    setTimeout(type, typeSpeed);
  }
  
  
  setTimeout(type, 2000);
})();


(function() {
  document.querySelectorAll('a[href]').forEach(link => {
    if (link.hostname !== location.hostname) return;
    if (link.href.includes('#') || link.target === '_blank') return;
    link.addEventListener('click', function(e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      
    });
  });
})();


(function() {
  window.showSignupToast = function(msg, type = 'success') {
    const t = document.getElementById('signupToast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'signup-toast signup-toast--' + type + ' show';
    setTimeout(() => t.classList.remove('show'), 3500);
  };

  const signupForm = document.getElementById('signupForm');
  if (!signupForm) return;

  
  const roleInputs = document.querySelectorAll('input[name="role"]');
  const roleBadge = document.getElementById('roleBadge');
  if (roleInputs.length && roleBadge) {
    roleInputs.forEach(input => {
      input.addEventListener('change', () => {
        const role = input.value;
        const isAdmin = role === 'admin';
        roleBadge.className = 'role-badge ' + (isAdmin ? 'role-badge--admin' : 'role-badge--guest');
        roleBadge.innerHTML = isAdmin
          ? '<i class="fa-solid fa-user-shield"></i> Creating account as <strong>Admin</strong>'
          : '<i class="fa-solid fa-user"></i> Creating account as <strong>Guest</strong>';
      });
    });
  }

  
  const confirmToggle = document.getElementById('confirmToggle');
  if (confirmToggle) {
    confirmToggle.addEventListener('click', function() {
      const pw = document.getElementById('confirmPassword');
      const icon = this.querySelector('i');
      if (!pw || !icon) return;
      if (pw.type === 'password') { pw.type = 'text'; icon.className = 'fa-solid fa-eye-slash'; }
      else { pw.type = 'password'; icon.className = 'fa-solid fa-eye'; }
    });
  }

  
  const pwInput = document.getElementById('password');
  if (pwInput) {
    pwInput.addEventListener('input', function() {
      const val = this.value;
      const strengthBar = document.getElementById('passwordStrength');
      const fill = document.getElementById('strengthFill');
      const text = document.getElementById('strengthText');
      if (!strengthBar || !fill || !text) return;
      if (val.length === 0) { strengthBar.classList.remove('show'); return; }
      strengthBar.classList.add('show');
      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[a-z]/.test(val) && /[A-Z]/.test(val)) strength++;
      if (/[0-9]/.test(val)) strength++;
      if (/[^a-zA-Z0-9]/.test(val)) strength++;
      fill.className = 'password-strength__fill';
      text.className = 'password-strength__text';
      if (strength <= 1) { fill.classList.add('weak'); text.classList.add('weak'); text.textContent = 'Weak — Add more characters and symbols'; }
      else if (strength <= 3) { fill.classList.add('medium'); text.classList.add('medium'); text.textContent = 'Medium — Good, but could be stronger'; }
      else { fill.classList.add('strong'); text.classList.add('strong'); text.textContent = 'Strong — Excellent password!'; }
    });
  }

  function validateName(n) { return /^[a-zA-Z\s]+$/.test(n) && n.trim().length >= 1; }
  function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  function validatePhone(p) { return p.replace(/\D/g, '').length === 10; }
  function validatePassword(p) { return p.length >= 8; }

  window.handleSignup = function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('signupSubmit');
    const firstName = (document.getElementById('firstName') || {}).value || '';
    const lastName = (document.getElementById('lastName') || {}).value || '';
    const email = (document.getElementById('email') || {}).value || '';
    const phone = (document.getElementById('phone') || {}).value || '';
    const password = (document.getElementById('password') || {}).value || '';
    const confirmPassword = (document.getElementById('confirmPassword') || {}).value || '';
    const terms = (document.getElementById('terms') || {}).checked;
    const roleEl = document.querySelector('input[name="role"]:checked');
    const role = roleEl ? roleEl.value : 'guest';
    let isValid = true;

    const checks = [
      { id: 'fnameGroup', valid: validateName(firstName.trim()) },
      { id: 'lnameGroup', valid: validateName(lastName.trim()) },
      { id: 'emailGroup', valid: validateEmail(email.trim()) },
      { id: 'phoneGroup', valid: validatePhone(phone.trim()) },
      { id: 'passwordGroup', valid: validatePassword(password) },
      { id: 'confirmPasswordGroup', valid: (password === confirmPassword && confirmPassword !== '') },
    ];

    checks.forEach(c => {
      const g = document.getElementById(c.id);
      if (!g) return;
      if (!c.valid) { g.classList.add('has-error'); isValid = false; }
      else { g.classList.remove('has-error'); }
    });

    const termsError = document.getElementById('termsError');
    if (!terms) { if (termsError) termsError.style.display = 'block'; isValid = false; }
    else { if (termsError) termsError.style.display = 'none'; }

    if (!isValid) { window.showSignupToast('Please fix the errors in the form.', 'error'); return; }

    if (submitBtn) { submitBtn.classList.add('loading'); submitBtn.disabled = true; }
    setTimeout(() => {
      if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
      localStorage.setItem('stackly_user', JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), name: firstName.trim() + ' ' + lastName.trim(), email: email.trim(), phone, company: (document.getElementById('company') || {}).value, role, loggedIn: false, signupTime: new Date().toISOString() }));
      window.showSignupToast('Account created successfully! Redirecting to Sign In...', 'success');
      setTimeout(() => { window.location.href = 'signin.html'; }, 2000);
    }, 1800);
  };

  window.handleSocialSignup = function(provider) {
    window.showSignupToast('Account created with ' + provider + '! Redirecting to Sign In...', 'success');
    setTimeout(() => {
      localStorage.setItem('stackly_user', JSON.stringify({ name: 'Social User', email: 'user@' + provider.toLowerCase() + '.com', role: (document.querySelector('input[name="role"]:checked') || {}).value || 'guest', loggedIn: false, signupTime: new Date().toISOString(), provider }));
      window.location.href = 'signin.html';
    }, 1500);
  };

  
  document.querySelectorAll('.signup-form-input').forEach(input => {
    input.addEventListener('input', function() {
      const g = this.closest('.signup-form-group');
      if (g) g.classList.remove('has-error');
    });
  });

  const termsEl = document.getElementById('terms');
  if (termsEl) termsEl.addEventListener('change', function() {
    const te = document.getElementById('termsError');
    if (te) te.style.display = 'none';
  });
})();
