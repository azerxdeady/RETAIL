/**
 * KJ3D — Karthik Jewellers 3D Luxury UX Engine
 * =================================================
 * Provides: Card Tilt · Hero Parallax · Magnetic Buttons ·
 *           Gold Sparkle Trail · Scroll Reveal · Ambient Orbs
 *
 * Zero external dependencies. Pure vanilla JS + CSS transforms.
 * Uses MutationObserver to re-init on dynamically injected cards.
 * Compatible with dark/light mode (html.dark class).
 */

(function () {
  'use strict';

  /* ─── CONFIG ─────────────────────────────────────────────── */
  const CFG = {
    tilt: {
      maxAngle: 12,          // degrees
      perspective: 900,      // px
      scale: 1.035,
      transitionMs: 80,
      resetTransitionMs: 450,
    },
    sparkle: {
      poolSize: 24,
      colors: ['#fef3c7', '#d4af37', '#f59e0b', '#fbbf24', '#fff8e1', '#fffbeb'],
      sizes: [4, 5, 6, 7, 8],
      durationMs: 650,
    },
    magnetic: {
      radiusPx: 70,
      strength: 0.28,
    },
    parallax: {
      heroRate: 0.35,         // hero bg moves at 35% of scroll speed
      heroImgRate: 0.55,
    },
    reveal: {
      threshold: 0.12,
      staggerMs: 90,
    },
  };

  /* ─── SPARKLE POOL ───────────────────────────────────────── */
  let sparklePool = [];
  let sparkleIndex = 0;

  function buildSparklePool() {
    if (sparklePool.length) return;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes kjSparkleRise {
        0%   { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
        60%  { opacity: 0.8; }
        100% { transform: translateY(-38px) scale(0) rotate(45deg); opacity: 0; }
      }
      @keyframes kjSparkleOrbit {
        0%   { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
        100% { transform: translateY(-28px) translateX(var(--kj-sx,10px)) scale(0); opacity: 0; }
      }
      .kj-sparkle {
        position: fixed;
        pointer-events: none;
        border-radius: 50%;
        z-index: 99999;
        mix-blend-mode: screen;
        will-change: transform, opacity;
      }
      .kj-sparkle.kj-sp-star {
        clip-path: polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
        border-radius: 0;
      }
    `;
    document.head.appendChild(style);

    for (let i = 0; i < CFG.sparkle.poolSize; i++) {
      const el = document.createElement('div');
      el.className = 'kj-sparkle';
      el.style.display = 'none';
      document.body.appendChild(el);
      sparklePool.push(el);
    }
  }

  function emitSparkle(x, y) {
    if (!sparklePool.length) return;
    const el = sparklePool[sparkleIndex % sparklePool.length];
    sparkleIndex++;

    const color = CFG.sparkle.colors[Math.floor(Math.random() * CFG.sparkle.colors.length)];
    const size  = CFG.sparkle.sizes[Math.floor(Math.random() * CFG.sparkle.sizes.length)];
    const isStar = Math.random() > 0.6;
    const dx = (Math.random() - 0.5) * 24;

    el.style.cssText = `
      left: ${x + (Math.random() - 0.5) * 20}px;
      top:  ${y + (Math.random() - 0.5) * 20}px;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, #fff 0%, ${color} 55%, transparent 100%);
      box-shadow: 0 0 ${size + 2}px ${color};
      --kj-sx: ${dx}px;
      display: block;
      animation: none;
    `;
    if (isStar) el.classList.add('kj-sp-star');
    else el.classList.remove('kj-sp-star');

    // Force reflow so animation restarts
    void el.offsetWidth;

    el.style.animation = `${isStar ? 'kjSparkleOrbit' : 'kjSparkleRise'} ${CFG.sparkle.durationMs}ms ease-out forwards`;
    setTimeout(() => { el.style.display = 'none'; }, CFG.sparkle.durationMs + 50);
  }

  /* ─── CARD TILT ──────────────────────────────────────────── */
  const tiltedCards = new WeakSet();
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

  function applyTilt(card) {
    if (tiltedCards.has(card)) return;
    tiltedCards.add(card);

    if (isTouchDevice) {
      // Touch-friendly tactile press on mobile/tablet without scroll interference
      card.addEventListener('touchstart', () => {
        card.style.transition = 'transform 0.12s ease';
        card.style.transform = 'scale(0.985)';
      }, { passive: true });
      card.addEventListener('touchend', () => {
        card.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = 'scale(1)';
      }, { passive: true });
      return;
    }

    card.style.willChange = 'transform';
    card.style.transformStyle = 'preserve-3d';

    let sparkleThrottle = 0;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);   // -1 to 1
      const dy = (e.clientY - cy) / (rect.height / 2);   // -1 to 1
      const tiltX = -(dy * CFG.tilt.maxAngle).toFixed(2);
      const tiltY =  (dx * CFG.tilt.maxAngle).toFixed(2);

      card.style.transition = `transform ${CFG.tilt.transitionMs}ms linear`;
      card.style.transform = [
        `perspective(${CFG.tilt.perspective}px)`,
        `rotateX(${tiltX}deg)`,
        `rotateY(${tiltY}deg)`,
        `translateZ(10px)`,
        `scale(${CFG.tilt.scale})`,
      ].join(' ');

      // Sparkle throttle: max 1 per 90ms per card
      const now = Date.now();
      if (now - sparkleThrottle > 90) {
        sparkleThrottle = now;
        emitSparkle(e.clientX, e.clientY);
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = `transform ${CFG.tilt.resetTransitionMs}ms cubic-bezier(0.16,1,0.3,1)`;
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
    });
  }

  function initCardTilt() {
    const selectors = [
      '.jewellery-card',
      '.viswa-card',
      '.category-card',
      '.kalyan-story-card',
      '.trust-pillar-card',
      '.kj-collection-card',
    ].join(',');

    document.querySelectorAll(selectors).forEach(applyTilt);
  }

  /* ─── MUTATIONOBSERVER — re-init tilt on dynamic cards ───── */
  function watchForNewCards() {
    const grids = [
      document.getElementById('products-grid'),
      document.getElementById('viswa-catalog-grid'),
      document.getElementById('category-grid-container'),
      document.getElementById('catalog-grid'),
      document.getElementById('scheme-grid'),
      document.querySelector('[id*="scheme"]'),
      document.querySelector('[id*="category"]'),
      document.body,            // fallback: watch everything
    ].filter(Boolean);

    const obs = new MutationObserver(() => {
      initCardTilt();
      initScrollReveal();       // re-check new elements for reveal
    });

    // Only observe body-level additions (cheaper than every subtree element)
    obs.observe(grids[grids.length - 1], { childList: true, subtree: true });
  }

  /* ─── HERO PARALLAX ──────────────────────────────────────── */
  function initHeroParallax() {
    const hero    = document.getElementById('hero-section');
    const heroImg = document.getElementById('hero-showcase-img') || document.querySelector('#hero-section img');
    const heroBg  = hero ? hero.querySelectorAll('.absolute') : [];
    if (!hero) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroH   = hero.offsetHeight;
        if (scrollY > heroH * 1.5) { ticking = false; return; }

        // Ambient blobs parallax
        heroBg.forEach((blob, i) => {
          const rate = i % 2 === 0 ? 0.2 : 0.3;
          blob.style.transform = `translateY(${scrollY * rate}px)`;
        });

        // Hero product image lift
        if (heroImg) {
          heroImg.style.transform = `translateY(${-scrollY * CFG.parallax.heroImgRate * 0.3}px)`;
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ─── MAGNETIC BUTTONS ───────────────────────────────────── */
  function initMagneticButtons() {
    if (isTouchDevice) return;
    const btns = document.querySelectorAll('.gold-btn, .viswa-btn, .btn-gold, .kj-magnetic');
    btns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < CFG.magnetic.radiusPx) {
          const mx = dx * CFG.magnetic.strength;
          const my = dy * CFG.magnetic.strength;
          btn.style.transition = 'transform 0.15s ease';
          btn.style.transform  = `translate(${mx}px, ${my}px) scale(1.045)`;
        }
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
        btn.style.transform  = 'translate(0px, 0px) scale(1)';
      });
    });
  }

  /* ─── HERO CARD 3D FLOAT + MOUSE TILT + SPOTLIGHT ─────── */
  function initHeroCardFloat() {
    const wrap    = document.getElementById('hero-card-3d-wrap');
    const inner   = document.getElementById('hero-card-inner');
    const spot    = document.getElementById('hero-spotlight-layer');
    if (!inner) {
      // Legacy fallback
      const heroCard = document.querySelector('#hero-section .w-full.max-w-md > div');
      if (!heroCard) return;
      heroCard.style.transformStyle = 'preserve-3d';
      heroCard.style.transform = 'perspective(1000px) rotateY(-6deg) rotateX(2deg) translateZ(0px)';
      heroCard.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1), box-shadow 0.7s ease';
      heroCard.style.boxShadow  = '-20px 30px 60px -8px rgba(212,175,55,0.22), 0 15px 35px rgba(0,0,0,0.12)';
      return;
    }

    const MAX_TILT  = 14;
    const PERSP     = 1400;
    let   isHovered = false;
    let   frame     = 0;

    function ambientRock() {
      frame++;
      const t = frame * 0.010;
      if (!isHovered) {
        const rx = Math.sin(t * 0.55) * 1.8;
        const ry = -5 + Math.sin(t * 0.38) * 3;
        const tz = Math.sin(t * 0.72) * 6;
        inner.style.transition = 'none';
        inner.style.transform  = `perspective(${PERSP}px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px)`;
        inner.style.boxShadow  = `-22px 32px 70px -6px rgba(212,175,55,0.22), 0 18px 40px rgba(0,0,0,0.13)`;
      }
      requestAnimationFrame(ambientRock);
    }
    requestAnimationFrame(ambientRock);

    wrap.addEventListener('mousemove', (e) => {
      isHovered = true;
      const rect = wrap.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      const tiltX = -(dy * MAX_TILT).toFixed(2);
      const tiltY =  (dx * MAX_TILT).toFixed(2);

      inner.style.transition = 'transform 0.07s linear, box-shadow 0.07s linear';
      inner.style.transform  = `perspective(${PERSP}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(28px) scale(1.025)`;
      inner.style.boxShadow  = `${-dx*18}px ${dy*18+28}px 80px -6px rgba(212,175,55,0.38), 0 20px 55px rgba(0,0,0,0.18)`;

      if (spot) {
        const imgEl = wrap.querySelector('.hero-img-wrap');
        if (imgEl) {
          const ir  = imgEl.getBoundingClientRect();
          const ix  = ((e.clientX - ir.left) / ir.width  * 100).toFixed(1);
          const iy  = ((e.clientY - ir.top)  / ir.height * 100).toFixed(1);
          spot.style.background = `radial-gradient(circle 160px at ${ix}% ${iy}%, rgba(255,248,210,0.25) 0%, transparent 70%)`;
        }
      }
      if (Math.random() < 0.08) emitSparkle(e.clientX, e.clientY);
    });

    wrap.addEventListener('mouseleave', () => {
      isHovered = false;
      inner.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.55s ease';
    });
  }

  /* ─── HERO GOLD PARTICLES ─────────────────────────────────── */
  function initHeroParticles() {
    const hero = document.getElementById('hero-section');
    if (!hero || isTouchDevice) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'hero-particle-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0.65;';
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    const GOLD_COLORS = ['rgba(212,175,55,', 'rgba(255,235,160,', 'rgba(197,160,89,', 'rgba(255,248,200,'];
    let W, H, particles = [];

    function resize() {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function drawStar(ctx, x, y, r1, r2, pts) {
      ctx.beginPath();
      for (let i = 0; i < pts * 2; i++) {
        const ang = (i * Math.PI) / pts - Math.PI / 2;
        const r   = i % 2 === 0 ? r2 : r1;
        i === 0 ? ctx.moveTo(x + r * Math.cos(ang), y + r * Math.sin(ang))
                : ctx.lineTo(x + r * Math.cos(ang), y + r * Math.sin(ang));
      }
      ctx.closePath();
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x  = Math.random() * W;
        this.y  = init ? Math.random() * H : H + 10;
        this.vy = -(0.3 + Math.random() * 0.7);
        this.vx = (Math.random() - 0.5) * 0.4;
        this.r  = 1 + Math.random() * 2.5;
        this.a  = 0;
        this.maxA = 0.3 + Math.random() * 0.5;
        this.life = 0;
        this.maxLife = 180 + Math.random() * 240;
        this.color = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];
        this.isStar = Math.random() > 0.65;
        this.rot = Math.random() * Math.PI * 2;
        this.rotV = (Math.random() - 0.5) * 0.03;
      }
      update() {
        this.life++;
        this.x  += this.vx;
        this.y  += this.vy;
        this.rot += this.rotV;
        const prog = this.life / this.maxLife;
        this.a = prog < 0.2 ? (prog / 0.2) * this.maxA : prog > 0.75 ? ((1 - prog) / 0.25) * this.maxA : this.maxA;
        if (this.life >= this.maxLife || this.y < -10) this.reset(false);
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.a;
        ctx.translate(this.x, this.y);
        if (this.isStar) {
          ctx.rotate(this.rot);
          ctx.fillStyle = this.color + '1)';
          drawStar(ctx, 0, 0, this.r * 0.5, this.r, 4);
          ctx.fill();
        } else {
          const g = ctx.createRadialGradient(0,0,0, 0,0,this.r);
          g.addColorStop(0, this.color + '1)');
          g.addColorStop(1, this.color + '0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(0, 0, this.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    for (let i = 0; i < 55; i++) particles.push(new Particle());
    let running = true;
    const heroObs = new IntersectionObserver(([e]) => { running = e.isIntersecting; });
    heroObs.observe(hero);

    function loop() {
      requestAnimationFrame(loop);
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
    }
    loop();
  }

  /* ─── HERO PRODUCT CAROUSEL ───────────────────────────────── */
  function initHeroProductCarousel() {
    const imgEl    = document.getElementById('hero-showcase-img');
    const nameEl   = document.getElementById('hero-product-name');
    const tagEl    = document.getElementById('hero-product-tag');
    const weightEl = document.getElementById('hero-product-weight');
    const dots     = document.querySelectorAll('.hero-carousel-dot');
    if (!imgEl) return;

    const PRODUCTS = [
      {
        src:    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        name:   'Mayuri Heritage Antique Haram',
        tag:    'Burmese Rubies & Emerald Cabochons',
        weight: '45.2g',
        cat:    'necklaces',
      },
      {
        src:    'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=800&q=80',
        name:   'Lakshmi Devi Temple Necklace',
        tag:    '22KT Antique Gold · BIS Hallmarked',
        weight: '38.8g',
        cat:    'necklaces',
      },
      {
        src:    'https://images.unsplash.com/photo-1573408301185-9519f94816d7?auto=format&fit=crop&w=800&q=80',
        name:   'Bridal Diamond Jhumka Set',
        tag:    'IGI Certified Natural Diamonds',
        weight: '12.4g',
        cat:    'earrings',
      },
      {
        src:    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
        name:   'Solitaire Eternity Bangle',
        tag:    '18KT White Gold · VS1 Diamonds',
        weight: '22.1g',
        cat:    'bangles',
      },
    ];

    let current = 0, paused = false, timer = null;

    function goTo(idx) {
      current = ((idx % PRODUCTS.length) + PRODUCTS.length) % PRODUCTS.length;
      const p = PRODUCTS[current];
      imgEl.classList.add('hero-showcase-crossfade', 'fading');
      setTimeout(() => {
        imgEl.src = p.src;
        imgEl.alt = p.name;
        imgEl.onload = () => imgEl.classList.remove('fading');
        if (nameEl)   nameEl.textContent   = p.name;
        if (tagEl)    tagEl.textContent    = p.tag;
        if (weightEl) weightEl.textContent = p.weight + ' Net';
        const viewBtn = document.getElementById('hero-view-btn');
        if (viewBtn) viewBtn.onclick = () => filterByCategory(p.cat);
      }, 320);
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => { if (!paused) next(); }, 4200);
    }

    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startTimer(); }));

    const prevBtn = document.getElementById('hero-carousel-prev');
    const nextBtn = document.getElementById('hero-carousel-next');
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); startTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); startTimer(); });

    const wrap = document.getElementById('hero-card-3d-wrap');
    if (wrap) {
      wrap.addEventListener('mouseenter', () => { paused = true;  });
      wrap.addEventListener('mouseleave', () => { paused = false; });
      let touchStartX = 0;
      wrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
      wrap.addEventListener('touchend',   e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); startTimer(); }
      }, { passive: true });
    }

    if (dots.length) dots[0].classList.add('active');
    startTimer();
  }

  /* ─── HERO LIVE GOLD RATE BADGE ──────────────────────────── */
  function initHeroGoldRateBadge() {
    const badge  = document.getElementById('hero-gold-rate-val');
    const change = document.getElementById('hero-gold-rate-change');
    if (!badge) return;

    async function fetchRate() {
      try {
        const r = await fetch('/api/rates');
        if (!r.ok) return;
        const d = await r.json();
        const rates = d.rates || d;
        const price = rates.gold22k || rates.gold_22k;
        if (!price) return;
        badge.textContent  = '\u20b9' + Number(price).toLocaleString('en-IN') + '/g';
        if (change) {
          const delta = rates.dailyTrend || (rates.changePercent != null ? (rates.changePercent >= 0 ? '+' : '') + rates.changePercent + '%' : null);
          if (delta) {
            change.textContent = delta;
            change.style.color = String(delta).startsWith('-') ? '#f87171' : '#4ade80';
          }
        }
      } catch (_) { /* silently ignore */ }
    }
    fetchRate();
    setInterval(fetchRate, 90000);
  }

  /* ─── HERO FLOATING STAT BADGES ──────────────────────────── */
  function initHeroFloatBadges() {
    const badges = document.querySelectorAll('.hero-float-badge');
    badges.forEach((b, i) => {
      setTimeout(() => {
        b.classList.add(i % 2 === 0 ? 'hfb-in-left' : 'hfb-in-right');
      }, 600 + i * 180);
    });
  }
  /* ─── SCROLL REVEAL ──────────────────────────────────────── */
  function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
      '.trust-pillar-card:not(.kj-revealed-init),' +
      '.category-card:not(.kj-revealed-init),' +
      '.kalyan-story-ring:not(.kj-revealed-init),' +
      '.jewellery-card:not(.kj-revealed-init),' +
      '.viswa-card:not(.kj-revealed-init),' +
      '.kj-reveal:not(.kj-revealed-init)'
    );

    if (!revealTargets.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = (parseInt(el.dataset.kjDelay || '0')) || 0;
          setTimeout(() => {
            el.classList.add('kj-revealed');
            el.classList.remove('kj-reveal-hidden');
          }, delay);
          obs.unobserve(el);
        }
      });
    }, { threshold: CFG.reveal.threshold, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((el, i) => {
      el.classList.add('kj-revealed-init', 'kj-reveal', 'kj-reveal-hidden');
      // Stagger siblings in same parent
      const siblings = el.parentElement ? [...el.parentElement.children] : [el];
      const sibIdx   = siblings.indexOf(el);
      el.dataset.kjDelay = (sibIdx * CFG.reveal.staggerMs).toString();
      obs.observe(el);
    });
  }

  /* ─── AMBIENT GOLD ORBS (subtle background depth) ───────── */
  function initAmbientOrbs() {
    const hero = document.getElementById('hero-section');
    if (!hero) return;

    const orb = document.createElement('div');
    orb.style.cssText = `
      position: absolute;
      width: 320px; height: 320px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%);
      pointer-events: none;
      top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      animation: kjOrbPulse 6s ease-in-out infinite;
      z-index: 1;
    `;
    hero.style.position = 'relative';
    hero.appendChild(orb);

    const orbStyle = document.createElement('style');
    orbStyle.textContent = `
      @keyframes kjOrbPulse {
        0%, 100% { transform: translate(-50%,-50%) scale(1);   opacity: 0.6; }
        50%       { transform: translate(-50%,-50%) scale(1.3); opacity: 1;   }
      }
      @keyframes kjGoldShimmerX {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }
      /* Shimmer line under hero heading */
      #hero-heading-shimmer::after {
        content: '';
        display: block;
        height: 2px;
        margin-top: 4px;
        background: linear-gradient(90deg, transparent, #d4af37, #fef3c7, #d4af37, transparent);
        background-size: 200% 100%;
        animation: kjGoldShimmerX 2.4s linear infinite;
        border-radius: 2px;
      }
    `;
    document.head.appendChild(orbStyle);
  }

  /* ─── CUSTOM CURSOR RING REMOVED (standard browser cursor preserved) ─────── */
  function removeCursorRing() {
    const existing = document.getElementById('kj-cursor-ring');
    if (existing) existing.remove();
  }

  /* ─── SECTION DEPTH SHADOW ───────────────────────────────── */
  function initSectionDepth() {
    // Add subtle entrance pop to trust pillars
    const pillars = document.querySelectorAll('.trust-pillar-card');
    pillars.forEach(p => {
      p.addEventListener('mouseenter', () => {
        p.style.transform   = 'perspective(600px) rotateX(-3deg) translateY(-6px) translateZ(8px)';
        p.style.boxShadow   = '0 24px 48px rgba(0,0,0,0.25), 0 0 0 1px rgba(212,175,55,0.4), 0 0 20px rgba(212,175,55,0.08)';
        p.style.transition  = 'transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease';
      });
      p.addEventListener('mouseleave', () => {
        p.style.transform   = '';
        p.style.boxShadow   = '';
        p.style.transition  = 'transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s ease';
      });
    });
  }

  /* ─── GOLD BUTTON 3D PRESS ───────────────────────────────── */
  function initButtonPress() {
    document.addEventListener('mousedown', (e) => {
      const btn = e.target.closest('.gold-btn, .viswa-btn, .btn-gold');
      if (!btn) return;
      btn.style.transform   = 'scale(0.97) translateY(1.5px)';
      btn.style.boxShadow   = '0 2px 8px rgba(212,175,55,0.3)';
      btn.style.transition  = 'transform 0.08s ease, box-shadow 0.08s ease';
    });
    document.addEventListener('mouseup', (e) => {
      const btn = e.target.closest('.gold-btn, .viswa-btn, .btn-gold');
      if (!btn) return;
      btn.style.transform   = '';
      btn.style.boxShadow   = '';
      btn.style.transition  = 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease';
    });
  }

  /* ─── PAGE LOAD GOLD SHIMMER SWEEP ──────────────────────── */
  function initPageLoadSweep() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 999999;
      pointer-events: none;
      background: linear-gradient(105deg, transparent 0%, transparent 40%, rgba(212,175,55,0.08) 50%, rgba(255,248,220,0.12) 55%, transparent 65%, transparent 100%);
      background-size: 300% 100%;
      background-position: 150% center;
      animation: kjPageSweep 1.1s cubic-bezier(0.16,1,0.3,1) forwards;
    `;
    document.head.insertAdjacentHTML('beforeend', `
      <style>
        @keyframes kjPageSweep {
          0%   { background-position: 150% center; opacity: 1; }
          100% { background-position: -50% center; opacity: 0; }
        }
        @keyframes kjRevealFadeIn {
          from { opacity: 0; transform: translateY(16px) perspective(600px) rotateX(5deg); }
          to   { opacity: 1; transform: translateY(0)   perspective(600px) rotateX(0deg); }
        }
        .kj-reveal {
          transition: opacity 0.65s ease, transform 0.65s cubic-bezier(0.16,1,0.3,1);
        }
        .kj-reveal.kj-reveal-hidden {
          opacity: 0;
          transform: translateY(18px) perspective(600px) rotateX(6deg);
        }
        .kj-reveal.kj-revealed {
          opacity: 1 !important;
          transform: translateY(0) perspective(600px) rotateX(0deg) !important;
        }
      </style>
    `);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1200);
  }

  /* ─── INIT ───────────────────────────────────────────────── */
  function init() {
    buildSparklePool();
    initPageLoadSweep();
    initHeroCardFloat();
    initHeroParallax();
    initHeroParticles();
    initHeroProductCarousel();
    initHeroGoldRateBadge();
    initHeroFloatBadges();
    initAmbientOrbs();
    initCardTilt();
    initMagneticButtons();
    initScrollReveal();
    initSectionDepth();
    initButtonPress();
    removeCursorRing();
    watchForNewCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external call if needed
  window.KJ3D = {
    reinit: () => {
      initCardTilt();
      initMagneticButtons();
      initScrollReveal();
      initSectionDepth();
    },
    emitSparkle,
  };
})();
