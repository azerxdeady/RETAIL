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

  /* ─── HERO CARD 3D FLOAT ─────────────────────────────────── */
  function initHeroCardFloat() {
    const heroCard = document.querySelector('#hero-section .w-full.max-w-md > div');
    if (!heroCard) return;

    heroCard.style.transformStyle = 'preserve-3d';
    heroCard.style.transform = 'perspective(1000px) rotateY(-6deg) rotateX(2deg) translateZ(0px)';
    heroCard.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1), box-shadow 0.7s ease';
    heroCard.style.boxShadow  = '-20px 30px 60px -8px rgba(212,175,55,0.22), 0 15px 35px rgba(0,0,0,0.12)';

    heroCard.addEventListener('mouseenter', () => {
      heroCard.style.transform = 'perspective(1000px) rotateY(-2deg) rotateX(1deg) translateZ(20px)';
      heroCard.style.boxShadow = '-10px 40px 80px -8px rgba(212,175,55,0.35), 0 20px 50px rgba(0,0,0,0.18)';
    });
    heroCard.addEventListener('mouseleave', () => {
      heroCard.style.transform = 'perspective(1000px) rotateY(-6deg) rotateX(2deg) translateZ(0px)';
      heroCard.style.boxShadow = '-20px 30px 60px -8px rgba(212,175,55,0.22), 0 15px 35px rgba(0,0,0,0.12)';
    });

    // Subtle ambient rocking animation
    let frame = 0;
    function ambientRock() {
      frame++;
      const t  = frame * 0.012;
      const rx = Math.sin(t * 0.7) * 1.5;
      const ry = -6 + Math.sin(t * 0.4) * 2.5;
      const tz = Math.sin(t * 0.9) * 4;

      if (!heroCard.matches(':hover')) {
        heroCard.style.transition = 'none';
        heroCard.style.transform  = `perspective(1000px) rotateY(${ry}deg) rotateX(${rx}deg) translateZ(${tz}px)`;
      }
      requestAnimationFrame(ambientRock);
    }
    requestAnimationFrame(ambientRock);
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
