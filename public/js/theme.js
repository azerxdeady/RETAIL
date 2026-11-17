/**
 * Karthik Jewellers & Viswanandini Jewellers
 * Luxury Dark / Light Theme Mode Engine
 * Synchronizes across tabs, portals, and real-time SSE bus
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'kj_theme_mode';

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Respect OS preference if no stored preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(mode, broadcast = true) {
    const isDark = mode === 'dark';
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }

    localStorage.setItem(STORAGE_KEY, mode);
    updateToggleButtons(mode);

    // Broadcast across windows & tabs
    if (broadcast && window.KJSync && typeof window.KJSync.broadcast === 'function') {
      window.KJSync.broadcast('THEME_MODE_CHANGED', { mode });
    }
  }

  function updateToggleButtons(mode) {
    const isDark = mode === 'dark';
    const switches = document.querySelectorAll('.theme-mode-switch, #theme-toggle-btn, .theme-toggle-btn');
    
    switches.forEach(btn => {
      btn.setAttribute('aria-checked', isDark ? 'true' : 'false');
      btn.setAttribute('title', isDark ? 'Switch to Golden Ivory Light Mode' : 'Switch to Imperial Obsidian Dark Mode');
      
      const thumb = btn.querySelector('.theme-toggle-thumb, .theme-switch-thumb');
      if (thumb) {
        if (isDark) {
          thumb.classList.remove('translate-x-0');
          thumb.classList.add('translate-x-3.5', 'translate-x-3');
        } else {
          thumb.classList.remove('translate-x-3.5', 'translate-x-3');
          thumb.classList.add('translate-x-0');
        }
      }

      const sunIcon = btn.querySelector('.theme-icon-sun');
      const moonIcon = btn.querySelector('.theme-icon-moon');
      if (sunIcon) {
        sunIcon.style.opacity = isDark ? '0.4' : '1';
        sunIcon.style.color = isDark ? '#78716c' : '#f59e0b';
      }
      if (moonIcon) {
        moonIcon.style.opacity = isDark ? '1' : '0.4';
        moonIcon.style.color = isDark ? '#ecc874' : '#a8a29e';
      }

      const modeText = btn.querySelector('.theme-mode-text, .theme-label');
      if (modeText) {
        modeText.innerText = isDark ? 'Dark' : 'Light';
      }
    });
  }

  function toggleThemeMode() {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);

    // Visual micro-feedback
    try {
      if (window.showToast) {
        window.showToast(next === 'dark' ? '🌙 Imperial Obsidian Dark Mode Activated' : '☀️ Golden Ivory Light Mode Activated', 'info');
      }
    } catch(e) {}
  }

  // Initial immediate application
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme, false);

  // Sync with OS preference changes if not manually set
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  }

  // Cross-tab storage event
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
      applyTheme(e.newValue, false);
    }
  });

  // Re-sync UI after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateToggleButtons(getPreferredTheme());
    });
  } else {
    updateToggleButtons(getPreferredTheme());
  }

  // Expose global methods
  window.KJTheme = {
    get: getPreferredTheme,
    set: applyTheme,
    toggle: toggleThemeMode
  };
  window.toggleThemeMode = toggleThemeMode;

})();
