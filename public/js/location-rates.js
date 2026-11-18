/**
 * ============================================================================
 * KARTHIK JEWELLERS & VISWANANDINI BRIDAL HOUSE
 * CLIENT-SIDE LOCATION & MULTI-CITY REAL-TIME BULLION ENGINE
 * ============================================================================
 */

(function () {
  const STORAGE_KEY = 'kj_user_city';
  const DEFAULT_CITY = 'coimbatore';

  class LocationRatesEngine {
    constructor() {
      this.currentCity = localStorage.getItem(STORAGE_KEY) || DEFAULT_CITY;
      this.cachedCities = [];
      this.currentRates = null;
      this.isDetecting = false;
      this.init();
    }

    async init() {
      // Pre-fetch all city rates for instant switcher experience
      try {
        if (window.StoreAPI && typeof window.StoreAPI.getCityRates === 'function') {
          const res = await window.StoreAPI.getCityRates();
          if (res.success && Array.isArray(res.cities)) {
            this.cachedCities = res.cities;
          }
        }
      } catch (e) {
        console.warn('Could not prefetch city rates:', e);
      }

      this.updateCityLabels(this.currentCity);
      this.injectModalHtml();

      // If user hasn't chosen a city yet, attempt passive auto-detect once
      if (!localStorage.getItem(STORAGE_KEY)) {
        this.passiveAutoDetect();
      }
    }

    getCurrentCity() {
      return this.currentCity;
    }

    updateCityLabels(cityId) {
      const cityData = this.cachedCities.find(c => c.cityId === cityId);
      const displayName = cityData ? cityData.cityName : (cityId.charAt(0).toUpperCase() + cityId.slice(1));

      const labels = document.querySelectorAll('.current-city-label, #current-city-label, #viswa-current-city-label');
      labels.forEach(el => {
        el.innerText = displayName;
      });

      const pills = document.querySelectorAll('.city-display-pill');
      pills.forEach(el => {
        el.title = `Currently viewing official bullion rates for ${displayName}`;
      });
    }

    async setCity(cityId, showNotice = true) {
      if (!cityId) cityId = DEFAULT_CITY;
      this.currentCity = cityId;
      localStorage.setItem(STORAGE_KEY, cityId);
      this.updateCityLabels(cityId);

      try {
        const res = await window.StoreAPI.getRates(cityId);
        if (res.success && res.rates) {
          this.currentRates = res.rates;

          // Dispatch custom event for store.js, viswanandini.js, and checkout
          window.dispatchEvent(new CustomEvent('kj_city_changed', {
            detail: {
              cityId: cityId,
              cityName: res.rates.cityName || cityId,
              rates: res.rates
            }
          }));

          if (showNotice) {
            const toastMsg = `📍 Local Gold Rates Updated: ${res.rates.cityName} (22KT: ₹${res.rates.gold22k.toLocaleString('en-IN')}/g • ${res.rates.association})`;
            if (typeof window.showToast === 'function') {
              window.showToast(toastMsg, 'success');
            } else {
              this.showFloatingNotice(toastMsg);
            }
          }
        }
      } catch (err) {
        console.error('Failed to switch city rates:', err);
      }

      this.closeModal();
    }

    async autoDetect() {
      if (this.isDetecting) return;
      this.isDetecting = true;

      const detectBtn = document.getElementById('auto-detect-btn');
      const originalText = detectBtn ? detectBtn.innerHTML : '';
      if (detectBtn) {
        detectBtn.innerHTML = `
          <span class="inline-block animate-spin mr-1">⌛</span>
          <span>Detecting GPS Coordinates...</span>
        `;
        detectBtn.disabled = true;
      }

      const finishDetect = (successMsg) => {
        this.isDetecting = false;
        if (detectBtn) {
          detectBtn.innerHTML = originalText;
          detectBtn.disabled = false;
        }
        if (successMsg) {
          if (typeof window.showToast === 'function') {
            window.showToast(successMsg, 'success');
          } else {
            this.showFloatingNotice(successMsg);
          }
        }
      };

      // 1. Try HTML5 Geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            try {
              const res = await window.StoreAPI.locateNearestCity(lat, lng);
              if (res.success && res.nearest) {
                await this.setCity(res.nearest.id, false);
                finishDetect(`✨ Location Detected: ${res.nearest.name} (${res.nearest.distanceKm} km away) • Live Rates Applied!`);
                return;
              }
            } catch (e) {
              console.warn('Geolocation reverse lookup failed:', e);
            }
            this.fallbackIpDetect(finishDetect);
          },
          (err) => {
            console.warn('Geolocation denied or unavailable:', err.message);
            this.fallbackIpDetect(finishDetect);
          },
          { timeout: 7000, enableHighAccuracy: true }
        );
      } else {
        this.fallbackIpDetect(finishDetect);
      }
    }

    async fallbackIpDetect(callback) {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          const cityQuery = ipData.city || ipData.region || '';
          if (cityQuery) {
            const match = this.cachedCities.find(c =>
              c.name.toLowerCase().includes(cityQuery.toLowerCase()) ||
              c.state.toLowerCase().includes(cityQuery.toLowerCase())
            );
            if (match) {
              await this.setCity(match.cityId, false);
              if (callback) callback(`📍 IP Location Detected: ${match.cityName} • Bullion Rates Synchronized!`);
              return;
            }
          }
        }
      } catch (e) {
        console.warn('IP-based detection unavailable:', e);
      }

      // Default back to Coimbatore Flagship
      await this.setCity('coimbatore', false);
      if (callback) callback(`📍 Location defaulted to Coimbatore (Karthik Jewellers Flagship HQ)`);
    }

    passiveAutoDetect() {
      // Lightweight, silent IP detection on first visit
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(ipData => {
          const cityQuery = ipData.city || '';
          if (cityQuery && this.cachedCities.length > 0) {
            const match = this.cachedCities.find(c => c.name.toLowerCase() === cityQuery.toLowerCase());
            if (match) {
              this.setCity(match.cityId, false);
            }
          }
        })
        .catch(() => {});
    }

    showFloatingNotice(msg) {
      const el = document.createElement('div');
      el.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#120e06] text-amber-200 border border-[#d4af37]/60 px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold backdrop-blur-md max-w-sm text-center animate-bounce';
      el.innerText = msg;
      document.body.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.4s ease';
        setTimeout(() => el.remove(), 400);
      }, 3500);
    }

    openModal() {
      const modal = document.getElementById('city-selector-modal');
      if (!modal) {
        this.injectModalHtml();
      }
      this.renderCityGrid();
      const modalEl = document.getElementById('city-selector-modal');
      if (modalEl) {
        modalEl.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    }

    closeModal() {
      const modalEl = document.getElementById('city-selector-modal');
      if (modalEl) {
        modalEl.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }

    injectModalHtml() {
      if (document.getElementById('city-selector-modal')) return;

      const modalHtml = `
        <div id="city-selector-modal" class="fixed inset-0 z-50 glass-overlay flex items-center justify-center p-3 sm:p-4 hidden">
          <div class="bg-white dark:bg-[#120e09] rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative border border-[#d4af37]/40 max-h-[90vh] flex flex-col text-stone-900 dark:text-stone-100">
            
            <!-- Modal Header -->
            <div class="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-amber-500/15 text-[#d4af37] border border-amber-500/30 flex items-center justify-center text-xl shadow-sm">
                  📍
                </div>
                <div>
                  <h3 class="font-serif text-lg sm:text-2xl font-bold text-stone-900 dark:text-amber-100">
                    Select Your City for Live Gold Rates
                  </h3>
                  <p class="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Official daily bullion benchmarks by local Jewellers Associations (BIS / IBJA). All product prices update in real-time.
                  </p>
                </div>
              </div>
              <button onclick="window.LocationRates.closeModal()" class="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center justify-center text-lg transition">✕</button>
            </div>

            <!-- Controls: Auto-Detect & Search -->
            <div class="py-4 flex flex-col sm:flex-row items-center gap-3">
              <button id="auto-detect-btn" onclick="window.LocationRates.autoDetect()" class="w-full sm:w-auto px-5 py-2.5 rounded-full gold-btn font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md">
                <span>✨ Auto-Detect Location</span>
                <span class="text-[10px] opacity-75 font-normal">(GPS / IP)</span>
              </button>
              
              <div class="relative w-full flex-1">
                <input 
                  type="text" 
                  id="city-search-input" 
                  placeholder="Search city (e.g., Chennai, Mumbai, Bangalore...)" 
                  oninput="window.LocationRates.filterCities(this.value)" 
                  class="w-full bg-stone-50 dark:bg-[#1a140b] border border-stone-300 dark:border-[#d4af37]/40 rounded-full pl-9 pr-4 py-2.5 text-xs text-stone-900 dark:text-amber-100 focus:outline-none focus:border-[#d4af37] transition"
                />
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs">🔍</span>
              </div>
            </div>

            <!-- Scrollable Cities List & Comparison Table -->
            <div class="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar">
              
              <!-- Quick Select Hubs -->
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-[#b4860b] dark:text-amber-300 block mb-2">Popular Bullion Hubs</span>
                <div id="city-quick-chips" class="flex flex-wrap gap-2">
                  <!-- Populated dynamically -->
                </div>
              </div>

              <!-- Full Table -->
              <div class="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left text-xs">
                  <thead class="bg-stone-100 dark:bg-[#1c150c] text-stone-600 dark:text-amber-200 uppercase text-[10px] font-black tracking-wider border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th class="py-2.5 px-3">City / Hub</th>
                      <th class="py-2.5 px-3">22KT Gold (916)</th>
                      <th class="py-2.5 px-3 hidden sm:table-cell">24KT Bullion</th>
                      <th class="py-2.5 px-3 hidden md:table-cell">Silver (999)</th>
                      <th class="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody id="city-table-body" class="divide-y divide-stone-100 dark:divide-stone-800/60 font-medium">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>

            </div>

            <!-- Footer Note -->
            <div class="pt-3 mt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Prices verified with BVC Precious Assaying & Hallmarking Centre</span>
              </span>
              <button onclick="window.LocationRates.closeModal()" class="text-[#b4860b] dark:text-amber-300 font-bold hover:underline">Done</button>
            </div>

          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    renderCityGrid(filterText = '') {
      const chipsContainer = document.getElementById('city-quick-chips');
      const tableBody = document.getElementById('city-table-body');
      if (!chipsContainer || !tableBody) return;

      const q = filterText.trim().toLowerCase();
      const filtered = this.cachedCities.filter(c =>
        c.cityName.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.cityId.toLowerCase().includes(q)
      );

      // Render Popular Chips (first 7 major)
      const popular = this.cachedCities.slice(0, 7);
      chipsContainer.innerHTML = popular.map(c => {
        const isSelected = c.cityId === this.currentCity;
        return `
          <button 
            onclick="window.LocationRates.setCity('${c.cityId}')" 
            class="px-3 py-1.5 rounded-full text-xs font-semibold transition border flex items-center gap-1.5 ${isSelected ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow-sm' : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-400'}"
          >
            <span>${c.isHq ? '👑' : '📍'}</span>
            <span>${c.cityName}</span>
            <span class="text-[10px] font-mono opacity-80">₹${c.gold22k.toLocaleString('en-IN')}</span>
          </button>
        `;
      }).join('');

      // Render Full Table Body
      if (filtered.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="py-8 text-center text-stone-400">
              No matching city found. Please choose from our major state bullion hubs.
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = filtered.map(c => {
        const isSelected = c.cityId === this.currentCity;
        const diffText = c.variance22k > 0 ? `+₹${c.variance22k}` : (c.variance22k < 0 ? `-₹${Math.abs(c.variance22k)}` : 'HQ Benchmark');
        const diffColor = c.variance22k > 0 ? 'text-amber-600 dark:text-amber-400' : (c.variance22k < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400');

        return `
          <tr class="hover:bg-amber-50/50 dark:hover:bg-stone-900/50 transition ${isSelected ? 'bg-amber-50/70 dark:bg-amber-950/25' : ''}">
            <td class="py-3 px-3">
              <div class="flex items-center gap-2">
                <span class="text-sm">${c.isHq ? '👑' : '📍'}</span>
                <div>
                  <div class="flex items-center gap-1.5">
                    <strong class="text-stone-900 dark:text-white font-bold">${c.cityName}</strong>
                    ${c.isHq ? '<span class="bg-[#d4af37] text-stone-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">HQ</span>' : ''}
                    ${c.isInternational ? '<span class="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">NRI</span>' : ''}
                  </div>
                  <span class="text-[10px] text-stone-400 block">${c.state} • <span class="${diffColor} font-semibold">${diffText}</span></span>
                </div>
              </div>
            </td>
            <td class="py-3 px-3 font-mono font-bold text-stone-900 dark:text-amber-200">
              ₹${c.gold22k.toLocaleString('en-IN')}<span class="text-[10px] font-normal text-stone-400">/g</span>
            </td>
            <td class="py-3 px-3 font-mono text-stone-600 dark:text-stone-300 hidden sm:table-cell">
              ₹${c.gold24k.toLocaleString('en-IN')}<span class="text-[10px] font-normal text-stone-400">/g</span>
            </td>
            <td class="py-3 px-3 font-mono text-stone-600 dark:text-stone-300 hidden md:table-cell">
              ₹${c.silver.toLocaleString('en-IN')}<span class="text-[10px] font-normal text-stone-400">/g</span>
            </td>
            <td class="py-3 px-3 text-right">
              ${isSelected ? `
                <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <span>✓</span> Active
                </span>
              ` : `
                <button onclick="window.LocationRates.setCity('${c.cityId}')" class="px-3 py-1 rounded-full text-[11px] font-bold border border-[#d4af37]/60 hover:bg-[#d4af37] hover:text-stone-950 transition text-[#b4860b] dark:text-amber-300">
                  Select
                </button>
              `}
            </td>
          </tr>
        `;
      }).join('');
    }

    filterCities(text) {
      this.renderCityGrid(text);
    }
  }

  // Global Singleton
  window.LocationRates = new LocationRatesEngine();

  // Expose global modal opener
  window.openCitySelectorModal = function () {
    window.LocationRates.openModal();
  };
  window.closeCitySelectorModal = function () {
    window.LocationRates.closeModal();
  };
})();
