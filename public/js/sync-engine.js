/**
 * Karthik Jewellers - Ecosystem Universal Synchronization Engine
 * Provides instant real-time synchronization across all tabs and portals:
 * Flagship Storefront, Viswanandini Bridal House, Master Hub Cockpit,
 * Admin Operations & Shopify-Grade Theme Customizer, and GST Tax Invoices.
 */

(function (window) {
  'use strict';

  class EcosystemSyncEngine {
    constructor() {
      this.channel = null;
      this.eventSource = null;
      this.listeners = new Map();
      this.currentVersion = Date.now();
      this.isConnected = false;
      this.toastContainer = null;

      this.initBroadcastChannel();
      this.initServerSentEvents();
      this.initHeartbeat();
      this.initWindowPostMessage();
      this.createSyncToastUI();
    }

    // 0. Window PostMessage (for live Theme Customizer iframe preview)
    initWindowPostMessage() {
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'KJ_THEME_PREVIEW') {
          this.applyThemeSettingsToDOM(event.data.theme);
        }
      });
    }

    // 1. Browser Tab Broadcast Channel (0ms cross-tab latency)
    initBroadcastChannel() {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel('kj_ecosystem_sync');
          this.channel.onmessage = (event) => {
            const { type, payload, timestamp } = event.data || {};
            this.dispatch(type, payload, 'broadcast_channel');
          };
        }
      } catch (err) {
        console.warn('[KJ Sync] BroadcastChannel not supported, falling back to SSE:', err);
      }
    }

    // 2. Server-Sent Events (Live connection to Node server)
    initServerSentEvents() {
      if (!('EventSource' in window)) return;

      try {
        if (this.eventSource) this.eventSource.close();
        this.eventSource = new EventSource('/api/sync/stream');

        this.eventSource.onopen = () => {
          this.isConnected = true;
          this.dispatch('SYNC_READY', { status: 'connected' }, 'sse');
        };

        this.eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.version && data.version > this.currentVersion) {
              this.currentVersion = data.version;
            }
            this.dispatch(data.type, data.payload, 'sse');
          } catch (err) {
            console.error('[KJ Sync] Error parsing SSE payload:', err);
          }
        };

        this.eventSource.onerror = () => {
          this.isConnected = false;
          // EventSource automatically attempts reconnection
        };
      } catch (err) {
        console.warn('[KJ Sync] Failed to initialize SSE stream:', err);
      }
    }

    // 3. Polling Fallback Heartbeat (every 12 seconds)
    initHeartbeat() {
      setInterval(async () => {
        try {
          const res = await fetch('/api/sync/version');
          if (res.ok) {
            const data = await res.json();
            if (data.version && data.version > this.currentVersion) {
              this.currentVersion = data.version;
              this.dispatch('HEARTBEAT_SYNC', data, 'heartbeat');
            }
          }
        } catch (err) {
          // Silent catch for offline or server restart
        }
      }, 12000);
    }

    // Register event listener
    on(eventType, callback) {
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, new Set());
      }
      this.listeners.get(eventType).add(callback);
      return () => this.off(eventType, callback);
    }

    off(eventType, callback) {
      if (this.listeners.has(eventType)) {
        this.listeners.get(eventType).delete(callback);
      }
    }

    // Broadcast an event across all tabs and notify the server
    broadcast(eventType, payload = {}) {
      const envelope = {
        type: eventType,
        payload,
        timestamp: new Date().toISOString()
      };

      // 1. Dispatch locally on current page
      this.dispatch(eventType, payload, 'local');

      // 2. Broadcast to other open browser tabs
      if (this.channel) {
        try {
          this.channel.postMessage(envelope);
        } catch (err) {
          console.warn('[KJ Sync] Broadcast postMessage error:', err);
        }
      }

      // 3. Notify server so other browsers/devices receive it via SSE
      fetch('/api/sync/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: eventType, payload })
      }).catch(() => {});
    }

    // Internal dispatcher with built-in ecosystem reactive handlers
    dispatch(type, payload, source) {
      // Built-in DOM handler for live updates
      this.applyAutomaticDOMUpdates(type, payload, source);

      // Invoke custom registered page callbacks
      if (this.listeners.has(type)) {
        for (const cb of this.listeners.get(type)) {
          try {
            cb(payload, source);
          } catch (err) {
            console.error(`[KJ Sync] Error in listener for ${type}:`, err);
          }
        }
      }

      // Also trigger wildcard listeners
      if (this.listeners.has('*')) {
        for (const cb of this.listeners.get('*')) {
          try {
            cb(type, payload, source);
          } catch (err) {}
        }
      }
    }

    // Automatic synchronized DOM reactivity
    applyAutomaticDOMUpdates(type, payload, source) {
      switch (type) {
        case 'RATES_UPDATED':
          this.showSyncToast('✨ Live Bullion Index Synchronized with National Assaying Exchange');
          if (payload && payload.allCityRates && window.LocationRates) {
            window.LocationRates.cachedCities = payload.allCityRates;
          }
          if (typeof window.loadRates === 'function') {
            window.loadRates();
          } else if (typeof window.loadViswaRates === 'function') {
            window.loadViswaRates();
          }
          break;

        case 'PRODUCTS_UPDATED':
          if (source !== 'local') {
            this.showSyncToast('💎 Catalog Updated & Synchronized');
            if (typeof window.loadProducts === 'function') window.loadProducts();
            if (typeof window.loadViswaProducts === 'function') window.loadViswaProducts();
            if (typeof window.loadCategories === 'function') window.loadCategories();
            if (typeof window.loadAdminProducts === 'function') window.loadAdminProducts();
          }
          break;

        case 'ORDERS_UPDATED':
        case 'ORDER_CREATED':
          if (source !== 'local') {
            this.showSyncToast('📦 Order Pipeline Synchronized');
            if (typeof window.loadAdminOrders === 'function') window.loadAdminOrders();
            if (typeof window.loadAdminStats === 'function') window.loadAdminStats();
            if (typeof window.refreshHubData === 'function') window.refreshHubData();
          }
          break;

        case 'THEME_UPDATED':
          this.showSyncToast('🎨 Store Theme Customization Applied in Real-Time');
          this.applyThemeSettingsToDOM(payload?.settings || payload?.theme);
          break;

        case 'SCHEMES_UPDATED':
          if (typeof window.loadAdminSchemes === 'function') window.loadAdminSchemes();
          if (typeof window.refreshHubData === 'function') window.refreshHubData();
          break;

        case 'SETTINGS_UPDATED':
          this.showSyncToast('⚙️ Enterprise Store Settings Updated');
          break;
      }
    }

    // Dynamically apply theme changes without full page reload
    applyThemeSettingsToDOM(themeSettings) {
      if (!themeSettings) return;

      const isViswa = window.location.pathname.includes('viswanandini');
      const brandKey = isViswa ? 'viswanandini' : 'karthik';
      const settings = themeSettings[brandKey] || themeSettings;
      if (!settings) return;

      // 1. Update Announcement Bar
      const annBar = document.getElementById(isViswa ? 'viswa-announcement-bar' : 'announcement-bar');
      const annTextEl = document.getElementById(isViswa ? 'viswa-announcement-bar-text' : 'announcement-bar-text');

      if (annBar && settings.announcement) {
        annBar.style.display = settings.announcement.enabled !== false ? 'block' : 'none';
        if (settings.announcement.bgColor) annBar.style.backgroundColor = settings.announcement.bgColor;
        if (settings.announcement.textColor) annBar.style.color = settings.announcement.textColor;
      }
      if (annTextEl && settings.announcement?.text) {
        annTextEl.innerText = settings.announcement.text;
      }

      // 2. Update Brand Monogram, Name & Tagline
      const monogramEl = document.getElementById(isViswa ? 'viswa-brand-monogram' : 'navbar-brand-monogram');
      if (monogramEl && settings.monogramChar) {
        if (!monogramEl.querySelector('img')) {
          monogramEl.innerText = settings.monogramChar;
        }
      }

      const brandNameEl = document.getElementById(isViswa ? 'viswa-brand-name' : 'navbar-brand-name');
      if (brandNameEl && settings.brandName) {
        brandNameEl.innerText = settings.brandName;
      }

      const brandTaglineEl = document.getElementById(isViswa ? 'viswa-brand-tagline' : 'navbar-brand-tagline');
      if (brandTaglineEl && settings.brandTagline) {
        brandTaglineEl.innerText = settings.brandTagline;
      }

      const vipBtn = document.getElementById(isViswa ? 'viswa-vip-lounge-btn' : 'vip-lounge-btn');
      if (vipBtn) {
        if (settings.header?.vipLoungeText) vipBtn.innerText = settings.header.vipLoungeText;
        vipBtn.style.display = settings.header?.showVipLounge !== false ? 'inline-flex' : 'none';
      }

      // 3. Typography CSS Custom Properties
      if (settings.typography?.headingFont) {
        document.documentElement.style.setProperty('--theme-heading-font', settings.typography.headingFont);
        document.documentElement.style.setProperty('--font-serif', settings.typography.headingFont);
      }
      if (settings.typography?.bodyFont) {
        document.documentElement.style.setProperty('--theme-body-font', settings.typography.bodyFont);
        document.documentElement.style.setProperty('--font-sans', settings.typography.bodyFont);
      }

      // 4. Color Palette
      const priColor = settings.colors?.primaryGold || settings.colors?.royalBurgundy;
      const richColor = settings.colors?.richGold || settings.colors?.burgundyDark;
      if (priColor) document.documentElement.style.setProperty('--theme-primary-gold', priColor);
      if (richColor) document.documentElement.style.setProperty('--theme-rich-gold', richColor);

      // 5. Button Shape & Radius
      if (settings.buttons?.radius) {
        document.documentElement.style.setProperty('--theme-btn-radius', settings.buttons.radius);
      }

      // 6. Navigation Architecture
      const navbar = document.getElementById(isViswa ? 'viswa-navbar' : 'main-navbar');
      if (navbar) {
        navbar.classList.remove('glass-nav', 'solid-nav', 'transparent-nav');
        const navStyle = settings.header?.style || 'glass';
        navbar.classList.add(`${navStyle}-nav`);

        if (settings.header?.sticky !== false) {
          navbar.classList.add('sticky', 'top-0');
        } else {
          navbar.classList.remove('sticky', 'top-0');
        }
      }

      const searchCont = document.getElementById(isViswa ? 'viswa-search-container' : 'search-container');
      if (searchCont) {
        searchCont.style.display = settings.header?.showSearch !== false ? 'flex' : 'none';
      }

      const catNav = document.getElementById(isViswa ? 'viswa-category-navbar' : 'category-navbar');
      if (catNav) {
        catNav.style.display = settings.header?.showCategoryNav !== false ? 'block' : 'none';
      }

      // 7. Hero Elements
      const heroEyebrow = document.getElementById(isViswa ? 'viswa-hero-eyebrow' : 'hero-eyebrow-text');
      if (heroEyebrow && settings.hero?.eyebrowText) {
        heroEyebrow.innerText = settings.hero.eyebrowText;
      }

      const heroHeadingPart1 = document.getElementById(isViswa ? 'viswa-hero-heading-part1' : 'hero-heading-part1');
      if (heroHeadingPart1 && settings.hero?.headingPart1) {
        heroHeadingPart1.innerText = settings.hero.headingPart1;
      }

      const heroHeadingShimmer = document.getElementById(isViswa ? 'viswa-hero-heading-shimmer' : 'hero-heading-shimmer');
      if (heroHeadingShimmer && settings.hero?.headingShimmer) {
        heroHeadingShimmer.innerText = settings.hero.headingShimmer;
      }

      const heroSubtitle = document.getElementById(isViswa ? 'viswa-hero-subtitle' : 'hero-subtitle');
      if (heroSubtitle && settings.hero?.subheading) {
        heroSubtitle.innerText = settings.hero.subheading;
      }

      const cta1 = document.getElementById(isViswa ? 'viswa-hero-cta1' : 'hero-cta-btn1');
      if (cta1 && settings.hero?.primaryBtnText) cta1.innerText = settings.hero.primaryBtnText;

      const cta2 = document.getElementById(isViswa ? 'viswa-hero-cta2' : 'hero-cta-btn2');
      if (cta2 && settings.hero?.secondaryBtnText) cta2.innerText = settings.hero.secondaryBtnText;

      const heroText = document.getElementById(isViswa ? 'viswa-hero-text-block' : 'hero-text-block');
      if (heroText && settings.hero?.textAlignment) {
        if (settings.hero.textAlignment === 'center') {
          heroText.classList.remove('text-left', 'lg:text-left');
          heroText.classList.add('text-center', 'mx-auto');
        } else {
          heroText.classList.remove('text-center', 'mx-auto');
          heroText.classList.add('text-left', 'lg:text-left');
        }
      }

      // Hero Showcase Image Dynamic Sync
      const heroImg = document.getElementById(isViswa ? 'viswa-hero-showcase-img' : 'hero-showcase-img');
      if (heroImg && settings.hero?.imageUrl) {
        heroImg.src = settings.hero.imageUrl;
      }

      // 8. Product Grid & Cards
      const pGrid = document.getElementById(isViswa ? 'viswa-products-grid' : 'products-grid');
      if (pGrid && settings.productGrid?.columns) {
        pGrid.classList.remove('xl:grid-cols-4', 'lg:grid-cols-3', 'sm:grid-cols-2', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4');
        const cols = settings.productGrid.columns;
        if (cols === 2) {
          pGrid.classList.add('grid-cols-1', 'sm:grid-cols-2');
        } else if (cols === 3) {
          pGrid.classList.add('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
        } else {
          pGrid.classList.add('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
        }
      }

      if (settings.productGrid?.cardRadius) {
        document.documentElement.style.setProperty('--theme-card-radius', settings.productGrid.cardRadius);
      }

      const cards = document.querySelectorAll('.jewellery-card, .viswa-card');
      const cardStyle = settings.productGrid?.cardStyle || 'elevated';
      cards.forEach(c => {
        c.classList.remove('card-elevated', 'card-flat', 'card-bordered');
        c.classList.add(`card-${cardStyle}`);
      });

      // 9. Spacing & Density
      if (settings.spacing?.density) {
        document.body.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
        document.body.classList.add(`density-${settings.spacing.density}`);
      }

      // 10. Footer Customization
      const footer = document.getElementById(isViswa ? 'viswa-footer' : 'main-footer');
      const footerCopy = document.getElementById(isViswa ? 'viswa-footer-copyright' : 'footer-copyright');
      if (footer) {
        if (settings.footer?.bgColor) footer.style.backgroundColor = settings.footer.bgColor;
        if (settings.footer?.textColor) footer.style.color = settings.footer.textColor;
      }
      if (footerCopy && settings.footer?.copyrightText) {
        footerCopy.innerText = settings.footer.copyrightText;
      }

      // 11. Feature Modules Visibility
      const huidSec = document.getElementById('huid-section');
      const trackSec = document.getElementById('track-section');
      const schemeSec = document.getElementById(isViswa ? 'nandini-scheme-section' : 'scheme-section');
      if (huidSec) huidSec.style.display = settings.features?.showHuidVerifier !== false ? 'block' : 'none';
      if (trackSec) trackSec.style.display = settings.features?.showOrderTracker !== false ? 'block' : 'none';
      if (schemeSec) schemeSec.style.display = settings.features?.showSwarnaNidhiChits !== false ? 'block' : 'none';
    }

    // Luxury Golden Sync Toast Notification
    createSyncToastUI() {
      if (document.getElementById('kj-sync-toast-container')) return;
      const container = document.createElement('div');
      container.id = 'kj-sync-toast-container';
      container.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:99999;pointer-events:none;display:flex;flex-direction:column;gap:8px;';
      document.body.appendChild(container);
      this.toastContainer = container;
    }

    showSyncToast(message) {
      if (!this.toastContainer) this.createSyncToastUI();
      if (!this.toastContainer) return;

      const toast = document.createElement('div');
      toast.style.cssText = `
        background: linear-gradient(135deg, rgba(18, 14, 6, 0.95), rgba(30, 23, 10, 0.95));
        border: 1px solid rgba(212, 175, 55, 0.6);
        color: #faecd0;
        font-family: 'Outfit', sans-serif;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.05em;
        padding: 10px 16px;
        border-radius: 9999px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(212, 175, 55, 0.25);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        gap: 8px;
        opacity: 0;
        transform: translateY(12px);
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
      `;

      toast.innerHTML = `
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#d4af37;box-shadow:0 0 8px #d4af37;animation:pulse 1.5s infinite;"></span>
        <span>${message}</span>
      `;

      this.toastContainer.appendChild(toast);

      // Animate in
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      });

      // Auto dismiss after 3.2 seconds
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => toast.remove(), 400);
      }, 3200);
    }
  }

  // Export singleton on window
  window.KJSync = new EcosystemSyncEngine();

})(window);
