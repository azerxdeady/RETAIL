/**
 * Karthik Jewellers — Luxury Splash Screen & Global Loading System
 * ================================================================
 * Features:
 *  - Interactive 3D Tilt on Logo (tracks cursor / touch)
 *  - Interactive Gold Sparkle Bursts on Logo Click/Tap
 *  - Sacred Geometry Celestial Halo (smooth continuous orbit)
 *  - Ambient Gold Particle Canvas (floating star dust & embers)
 *  - Dynamic Bullion / Hallmark Calibration Status Ticker (0% -> 100%)
 *  - Auto-dismiss with smooth cinematic scale-fade aperture
 *  - Reusable Global API: window.KJLoader.show(msg), hide(), replay()
 */

(function () {
  'use strict';

  const STATUS_MESSAGES = [
    { at: 0,  text: 'Connecting to Coimbatore Bullion Assaying Index…' },
    { at: 28, text: 'Synchronizing Live 22KT & 24KT Gold Rates…' },
    { at: 55, text: 'Verifying BIS 916 Hallmark & HUID Laser Traceability…' },
    { at: 80, text: 'Polishing Imperial Heritage Bridal Masterpieces…' },
    { at: 96, text: 'Welcome to Karthik Jewellers • Entering Boutique…' }
  ];

  let splashEl, canvas, ctx, logoCard, logoWrap, progressBar, percentEl, statusEl, enterBtn;
  let particles = [];
  let animFrameId = null;
  let progress = 0;
  let progressInterval = null;
  let isDismissed = false;
  let isCustomLoading = false;

  /* ── 1. AMBIENT PARTICLES CANVAS ───────────────────────── */
  function initParticleCanvas() {
    canvas = document.getElementById('kj-splash-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    function resize() {
      if (!canvas || !splashEl) return;
      canvas.width  = splashEl.offsetWidth  || window.innerWidth;
      canvas.height = splashEl.offsetHeight || window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const GOLD_COLORS = [
      'rgba(212,175,55,',
      'rgba(255,235,160,',
      'rgba(197,160,89,',
      'rgba(255,248,220,',
      'rgba(245,158,11,'
    ];

    class SplashParticle {
      constructor() { this.reset(true); }
      reset(initial) {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 15;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = -(0.35 + Math.random() * 0.75);
        this.r = 1 + Math.random() * 2.2;
        this.maxAlpha = 0.25 + Math.random() * 0.55;
        this.alpha = 0;
        this.life = 0;
        this.maxLife = 160 + Math.random() * 200;
        this.color = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];
        this.isStar = Math.random() > 0.65;
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.04;
      }
      update() {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;
        this.rot += this.rotSpeed;
        const progressRatio = this.life / this.maxLife;
        if (progressRatio < 0.2) {
          this.alpha = (progressRatio / 0.2) * this.maxAlpha;
        } else if (progressRatio > 0.8) {
          this.alpha = ((1 - progressRatio) / 0.2) * this.maxAlpha;
        } else {
          this.alpha = this.maxAlpha;
        }
        if (this.life >= this.maxLife || this.y < -15) {
          this.reset(false);
        }
      }
      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        if (this.isStar) {
          ctx.rotate(this.rot);
          ctx.fillStyle = this.color + '1)';
          draw4PointStar(ctx, 0, 0, this.r * 0.4, this.r * 1.3);
        } else {
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r);
          grad.addColorStop(0, this.color + '1)');
          grad.addColorStop(1, this.color + '0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, this.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    function draw4PointStar(c, x, y, r1, r2) {
      c.beginPath();
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 - Math.PI / 2;
        const r = i % 2 === 0 ? r2 : r1;
        const px = x + r * Math.cos(ang);
        const py = y + r * Math.sin(ang);
        i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
      }
      c.closePath();
      c.fill();
    }

    particles = [];
    for (let i = 0; i < 48; i++) {
      particles.push(new SplashParticle());
    }

    function renderLoop() {
      if (isDismissed && !isCustomLoading) return;
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animFrameId = requestAnimationFrame(renderLoop);
    }
    renderLoop();
  }

  /* ── 2. INTERACTIVE 3D LOGO TILT & SPARKLE BURST ────────── */
  function initLogoInteractions() {
    logoCard = document.getElementById('kj-splash-logo-card');
    logoWrap = document.querySelector('.kj-splash-logo-wrap');
    if (!logoCard) return;

    let isHover = false;
    const MAX_TILT = 18; // degrees

    function onMove(clientX, clientY) {
      const rect = logoCard.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (clientX - cx) / (window.innerWidth / 2);
      const dy = (clientY - cy) / (window.innerHeight / 2);

      const tiltX = -(dy * MAX_TILT).toFixed(2);
      const tiltY = (dx * MAX_TILT).toFixed(2);

      logoCard.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(24px) scale(1.05)`;

      const sheen = document.querySelector('.kj-splash-sheen');
      if (sheen) {
        const px = ((clientX - rect.left) / rect.width) * 100;
        const py = ((clientY - rect.top) / rect.height) * 100;
        sheen.style.background = `radial-gradient(circle 120px at ${px}% ${py}%, rgba(255,248,220,0.4) 0%, transparent 70%)`;
      }
    }

    window.addEventListener('mousemove', (e) => {
      if (isDismissed && !isCustomLoading) return;
      onMove(e.clientX, e.clientY);
    }, { passive: true });

    logoCard.addEventListener('mouseleave', () => {
      logoCard.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
    });

    // Touch device support
    window.addEventListener('touchmove', (e) => {
      if (isDismissed && !isCustomLoading) return;
      if (e.touches.length > 0) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Click/tap on logo emits festive luxury gold sparkles!
    logoCard.addEventListener('click', (e) => {
      createSparkleBurst(e.clientX || (window.innerWidth / 2), e.clientY || (window.innerHeight / 2));
      // Give logo a tactile micro-bounce
      logoCard.style.transform = 'perspective(900px) scale(0.96) translateZ(10px)';
      setTimeout(() => {
        logoCard.style.transform = 'perspective(900px) scale(1.05) translateZ(24px)';
      }, 120);
    });
  }

  /* ── 3. CELEBRATORY GOLD SPARKLE BURST ──────────────────── */
  function createSparkleBurst(x, y) {
    if (window.KJ3D && typeof window.KJ3D.emitSparkle === 'function') {
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          const offsetX = x + (Math.random() - 0.5) * 60;
          const offsetY = y + (Math.random() - 0.5) * 60;
          window.KJ3D.emitSparkle(offsetX, offsetY);
        }, i * 25);
      }
    }
  }

  /* ── 4. LOADING PROGRESSION ENGINE ──────────────────────── */
  function updateStatusText(pct) {
    if (!statusEl) return;
    for (let i = STATUS_MESSAGES.length - 1; i >= 0; i--) {
      if (pct >= STATUS_MESSAGES[i].at) {
        if (statusEl.textContent !== STATUS_MESSAGES[i].text) {
          statusEl.style.opacity = '0';
          setTimeout(() => {
            statusEl.textContent = STATUS_MESSAGES[i].text;
            statusEl.style.opacity = '1';
          }, 150);
        }
        break;
      }
    }
  }

  function startSplashProgress() {
    progress = 0;
    const targetDurationMs = 1800; // fast, graceful ~1.8 seconds
    const intervalMs = 25;
    const increment = 100 / (targetDurationMs / intervalMs);

    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      // Dynamic easing: quick burst at start, smooth deceleration
      let step = increment;
      if (progress < 40) step *= 1.4;
      else if (progress > 85) step *= 0.6;

      progress = Math.min(100, progress + step);

      if (progressBar) progressBar.style.width = progress + '%';
      if (percentEl) percentEl.textContent = Math.floor(progress) + '%';
      updateStatusText(progress);

      if (progress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          dismissSplash();
        }, 350);
      }
    }, intervalMs);
  }

  /* ── 5. CINEMATIC DISMISS ───────────────────────────────── */
  function dismissSplash() {
    if (isDismissed) return;
    isDismissed = true;
    clearInterval(progressInterval);

    if (splashEl) {
      splashEl.classList.add('kj-splash-dismissed');
      setTimeout(() => {
        splashEl.style.display = 'none';
        if (animFrameId) cancelAnimationFrame(animFrameId);
      }, 750);
    }

    // Trigger initial hero reveal in ux3d if available
    if (window.KJ3D && typeof window.KJ3D.reinit === 'function') {
      window.KJ3D.reinit();
    }
  }

  /* ── 6. REUSABLE GLOBAL LOADER API (Splash + Loader) ─────── */
  const KJLoader = {
    // Show splash / loader with custom message
    show: function (message) {
      if (!splashEl) return;
      isDismissed = false;
      isCustomLoading = true;
      splashEl.style.display = 'flex';
      splashEl.classList.remove('kj-splash-dismissed');
      if (enterBtn) enterBtn.style.display = 'none';

      if (message && statusEl) statusEl.textContent = message;
      if (progressBar) progressBar.style.width = '75%';
      if (percentEl) percentEl.textContent = '…';

      initParticleCanvas();
    },

    // Update progress dynamically
    update: function (pct, message) {
      if (progressBar) progressBar.style.width = pct + '%';
      if (percentEl) percentEl.textContent = Math.floor(pct) + '%';
      if (message && statusEl) statusEl.textContent = message;
    },

    // Hide loader
    hide: function () {
      isCustomLoading = false;
      dismissSplash();
    },

    // Dismiss current splash
    dismiss: function () {
      dismissSplash();
    },

    // Replay full splash screen with animation
    replay: function () {
      if (!splashEl) return;
      isDismissed = false;
      isCustomLoading = false;
      splashEl.style.display = 'flex';
      splashEl.classList.remove('kj-splash-dismissed');
      if (enterBtn) enterBtn.style.display = 'inline-flex';
      if (progressBar) progressBar.style.width = '0%';
      if (percentEl) percentEl.textContent = '0%';
      if (statusEl) statusEl.textContent = STATUS_MESSAGES[0].text;

      initParticleCanvas();
      startSplashProgress();
    }
  };

  window.KJLoader = KJLoader;

  /* ── 7. DOM READY INIT ───────────────────────────────────── */
  function init() {
    splashEl    = document.getElementById('kj-splash-screen');
    progressBar = document.getElementById('kj-splash-progress-fill');
    percentEl   = document.getElementById('kj-splash-percent');
    statusEl    = document.getElementById('kj-splash-status-text');
    enterBtn    = document.getElementById('kj-splash-enter-btn');

    if (!splashEl) return;

    initParticleCanvas();
    initLogoInteractions();
    startSplashProgress();

    // Allow user to click anywhere on splash after 400ms to dismiss immediately
    setTimeout(() => {
      splashEl.addEventListener('click', (e) => {
        // If clicking on logo card or enter button, let their own handlers run
        if (e.target.closest('#kj-splash-logo-card') || e.target.closest('#kj-splash-enter-btn')) return;
        dismissSplash();
      });
    }, 400);

    // Escape or Space key dismisses splash
    window.addEventListener('keydown', (e) => {
      if (!isDismissed && (e.key === 'Escape' || e.key === ' ')) {
        dismissSplash();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
