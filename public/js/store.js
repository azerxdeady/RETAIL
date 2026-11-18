/**
 * KARTHIK JEWELLERS - CUSTOMER STOREFRONT INTERACTIVE LOGIC (MODERN TREND)
 */

let appState = {
  rates: null,
  products: [],
  categories: [],
  currentCategory: 'all',
  currentPurity: 'all',
  currentSort: 'default',
  currentSearch: '',
  selectedProduct: null,
  activeCoupon: null
};

document.addEventListener('DOMContentLoaded', async () => {
  initUI();
  await loadStoreTheme();
  await loadRates();
  await loadCategories();
  await loadProducts();
  updateCartBadge();
  updateWishlistBadge();
  initEventListeners();
});

// Load persistent theme settings
async function loadStoreTheme() {
  try {
    const res = await StoreAPI.getThemeSettings();
    if (res.success && res.themeSettings) {
      if (window.KJSync && typeof window.KJSync.applyThemeSettingsToDOM === 'function') {
        const settings = res.themeSettings.karthik || res.themeSettings;
        window.KJSync.applyThemeSettingsToDOM({ karthik: settings });
      }
    }
  } catch (err) {
    console.warn('Failed to load store theme:', err);
  }
}

// Initialize UI Badges & Listeners
function initUI() {
  window.addEventListener('kj_cart_updated', () => updateCartBadge());
  window.addEventListener('kj_wishlist_updated', () => updateWishlistBadge());

  // Real-time location-based gold rate switch listener
  window.addEventListener('kj_city_changed', async (e) => {
    const { rates } = e.detail;
    if (rates) {
      appState.rates = rates;
      renderRateTicker(rates);
      renderRatesOverviewCard(rates);
    }
    await loadProducts();
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closePriceBreakupModal();
      closeTryOnModal();
      closeSizeGuideModal();
      closeCheckoutModal();
      closeCartDrawer();
      if (window.closeCitySelectorModal) window.closeCitySelectorModal();
    }
  });

  // Close modals on backdrop click
  ['product-detail-modal', 'price-breakup-modal', 'tryon-modal', 'size-guide-modal', 'checkout-modal', 'city-selector-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          if (id === 'product-detail-modal') closeProductModal();
          else if (id === 'price-breakup-modal') closePriceBreakupModal();
          else if (id === 'tryon-modal') closeTryOnModal();
          else if (id === 'size-guide-modal') closeSizeGuideModal();
          else if (id === 'checkout-modal') closeCheckoutModal();
          else if (id === 'city-selector-modal' && window.closeCitySelectorModal) window.closeCitySelectorModal();
        }
      });
    }
  });
}

// 1. Fetch & Render Live Metal Rates (Location-Aware)
async function loadRates(cityId = null) {
  try {
    const selectedCity = cityId || (window.LocationRates ? window.LocationRates.getCurrentCity() : 'coimbatore');
    const res = await StoreAPI.getRates(selectedCity);
    if (res.success && res.rates) {
      appState.rates = res.rates;
      renderRateTicker(res.rates);
      renderRatesOverviewCard(res.rates);
    }
  } catch (err) {
    console.error('Failed to load rates:', err);
  }
}

function renderRateTicker(rates) {
  const tickerEl = document.getElementById('live-rate-ticker');
  if (!tickerEl) return;

  const timeStr = new Date(rates.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const cityName = rates.cityName || 'Coimbatore';

  tickerEl.innerHTML = `
    <div class="flex items-center gap-3 sm:gap-6 whitespace-nowrap text-xs font-medium">
      <!-- 1-Click Interactive City & Location Pill -->
      <button onclick="openCitySelectorModal()" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-amber-300/40 text-amber-200 text-xs font-semibold transition cursor-pointer shadow-sm group" title="Click to view local gold rates for your city">
        <span class="text-amber-400 group-hover:scale-110 transition-transform">📍</span>
        <span class="current-city-label font-bold text-white">${cityName}</span>
        <span class="text-[10px] text-amber-300 underline font-normal">(Change)</span>
      </button>

      <span class="flex items-center gap-2 text-[#f3e5ab]">
        <span class="w-2 h-2 rounded-full bg-emerald-400 pulse-rate"></span>
        <strong class="text-white tracking-wide">LIVE BULLION INDEX</strong> (${timeStr})
      </span>
      <span class="text-amber-100">Gold 24KT (999): <strong class="text-white font-mono">₹${rates.gold24k.toLocaleString('en-IN')}/g</strong></span>
      <span class="text-amber-200">Gold 22KT (916 Hallmark): <strong class="text-white font-mono">₹${rates.gold22k.toLocaleString('en-IN')}/g</strong></span>
      <span class="text-amber-100">Gold 18KT: <strong class="text-white font-mono">₹${rates.gold18k.toLocaleString('en-IN')}/g</strong></span>
      <span class="text-slate-200">Silver 999: <strong class="text-white font-mono">₹${rates.silver.toLocaleString('en-IN')}/g</strong></span>
      <span class="text-emerald-300 font-semibold">★ ${rates.association || '0% Making Charges on 24KT Gold Coins'}</span>
    </div>
  `;
}

function renderRatesOverviewCard(rates) {
  const cardEl = document.getElementById('rates-overview-card');
  if (!cardEl) return;

  const cityName = rates.cityName || 'Coimbatore';
  const state = rates.state || 'Tamil Nadu';
  const association = rates.association || 'The Coimbatore Jewellers Association (CJA Flagship Benchmark)';

  cardEl.innerHTML = `
    <div class="bg-gradient-to-br from-[#120e06] via-[#1a1409] to-[#0a0703] border border-[#d4af37]/50 rounded-3xl p-6 sm:p-8 text-white shadow-[0_20px_50px_rgba(212,175,55,0.16)] relative overflow-hidden">
      <div class="absolute -right-16 -top-16 w-56 h-56 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#d4af37]/30 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] uppercase tracking-[0.28em] text-[#ecc874] font-bold">Real-time Bullion Exchange</span>
            <span class="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">📍 ${cityName} (${state})</span>
          </div>
          <h3 class="text-xl sm:text-2xl font-serif font-bold text-white mt-1">Today's Official Bullion Benchmark</h3>
          <p class="text-xs text-stone-400 mt-0.5 font-light">${association}</p>
        </div>
        <div class="flex items-center gap-2.5">
          <button onclick="openCitySelectorModal()" class="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 border border-[#d4af37]/60 text-amber-200 text-xs font-bold transition flex items-center gap-2 shadow-sm">
            <span>📍 Change City</span>
            <span class="text-[10px] opacity-75 font-normal">(Auto-Detect)</span>
          </button>
          <div class="hidden sm:flex items-center gap-2 text-xs bg-[#1f190d] text-emerald-300 border border-emerald-500/30 px-3.5 py-2 rounded-full w-fit shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>BIS Assayed Live Ticker</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div class="bg-[#181309] p-4 sm:p-5 rounded-2xl border border-[#d4af37]/40 hover:border-[#d4af37] transition shadow-md">
          <p class="text-[11px] text-amber-200 uppercase font-semibold tracking-wider">Gold 24KT (99.9% Pure)</p>
          <p class="text-2xl font-bold text-white mt-1.5 font-mono">₹${rates.gold24k.toLocaleString('en-IN')}<span class="text-xs font-normal text-stone-400 font-sans"> /g</span></p>
          <span class="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">▲ Pure Investment Grade</span>
        </div>

        <div class="bg-gradient-to-b from-[#261c0a] to-[#171106] p-4 sm:p-5 rounded-2xl border-2 border-[#d4af37] shadow-[0_10px_30px_rgba(212,175,55,0.22)] relative">
          <span class="absolute top-2.5 right-2.5 text-[9px] bg-gradient-to-r from-[#d4af37] to-[#ecc874] text-stone-950 font-black px-2 py-0.5 rounded-full shadow-sm">POPULAR</span>
          <p class="text-[11px] text-amber-200 uppercase font-bold tracking-wider">Gold 22KT (916 Hallmark)</p>
          <p class="text-2xl font-bold text-amber-300 mt-1.5 font-mono">₹${rates.gold22k.toLocaleString('en-IN')}<span class="text-xs font-normal text-stone-400 font-sans"> /g</span></p>
          <span class="text-[11px] text-amber-200/90 flex items-center gap-1 mt-1 font-medium">Indian Jewellery Standard</span>
        </div>

        <div class="bg-[#181309] p-4 sm:p-5 rounded-2xl border border-stone-800 hover:border-[#d4af37]/50 transition">
          <p class="text-[11px] text-stone-400 uppercase font-semibold tracking-wider">Gold 18KT (Diamond)</p>
          <p class="text-2xl font-bold text-stone-200 mt-1.5 font-mono">₹${rates.gold18k.toLocaleString('en-IN')}<span class="text-xs font-normal text-stone-400 font-sans"> /g</span></p>
          <span class="text-[11px] text-stone-400 flex items-center gap-1 mt-1 font-medium">Solitaire & Studded Setting</span>
        </div>

        <div class="bg-[#181309] p-4 sm:p-5 rounded-2xl border border-stone-800 hover:border-[#d4af37]/50 transition">
          <p class="text-[11px] text-stone-400 uppercase font-semibold tracking-wider">Silver (999 Fine)</p>
          <p class="text-2xl font-bold text-stone-200 mt-1.5 font-mono">₹${rates.silver.toLocaleString('en-IN')}<span class="text-xs font-normal text-stone-400 font-sans"> /g</span></p>
          <span class="text-[11px] text-stone-400 flex items-center gap-1 mt-1 font-medium">₹${(rates.silver * 1000).toLocaleString('en-IN')} / 1 Kg Bar</span>
        </div>
      </div>
    </div>
  `;
}

// 2. Load Categories
async function loadCategories() {
  try {
    const res = await StoreAPI.getCategories();
    if (res.success) {
      appState.categories = res.categories;
      renderCategories(res.categories);
      renderCategoryFilters(res.categories);
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

function renderCategories(categories) {
  const container = document.getElementById('categories-grid');
  if (!container) return;

  container.innerHTML = categories.map(cat => `
    <div onclick="filterByCategory('${cat.id}')" class="category-card group cursor-pointer rounded-2xl p-4 flex flex-col items-center text-center">
      <div class="kalyan-story-ring w-20 h-20 sm:w-24 sm:h-24 overflow-hidden mb-3.5 p-1 bg-stone-50">
        <img src="${cat.image}" alt="${cat.name}" class="w-full h-full object-cover rounded-full group-hover:scale-110 transition duration-500" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80';" />
      </div>
      <h4 class="font-serif font-bold text-sm text-stone-900 group-hover:text-[#996515] transition">${cat.name}</h4>
      <p class="text-[11px] text-stone-500 mt-0.5 line-clamp-1 font-light">${cat.description}</p>
    </div>
  `).join('');
}

function renderCategoryFilters(categories) {
  const filterSelect = document.getElementById('filter-category');
  if (!filterSelect) return;

  filterSelect.innerHTML = `
    <option value="all">All Categories</option>
    ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
  `;
}

// 3. Load Products
async function loadProducts() {
  const gridEl = document.getElementById('products-grid');
  if (gridEl) {
    gridEl.innerHTML = `
      <div class="col-span-full py-20 text-center text-stone-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#c5a059] border-t-transparent mb-3"></div>
        <p class="font-serif text-sm">Curating certified masterpieces with live bullion pricing...</p>
      </div>
    `;
  }

  try {
    const params = {};
    if (appState.currentCategory !== 'all') params.category = appState.currentCategory;
    if (appState.currentPurity !== 'all') params.purity = appState.currentPurity;
    if (appState.currentSort !== 'default') params.sort = appState.currentSort;
    if (appState.currentSearch) params.search = appState.currentSearch;
    params.city = window.LocationRates ? window.LocationRates.getCurrentCity() : 'coimbatore';

    const res = await StoreAPI.getProducts(params);
    if (res.success) {
      appState.products = res.products;
      renderProductsGrid(res.products);
    }
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

function renderProductsGrid(products) {
  const gridEl = document.getElementById('products-grid');
  const countEl = document.getElementById('products-count');
  if (countEl) countEl.innerText = `${products.length} Masterpieces Found`;

  if (!gridEl) return;

  if (products.length === 0) {
    gridEl.innerHTML = `
      <div class="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-stone-300 p-8">
        <p class="text-4xl mb-3">💍</p>
        <h3 class="text-xl font-serif font-bold text-stone-900">No pieces match your current filter</h3>
        <p class="text-xs text-stone-500 mt-1">Try resetting your filters or exploring another fine collection.</p>
        <button onclick="resetFilters()" class="mt-4 px-6 py-2.5 dark-pill-btn rounded-full text-xs font-bold uppercase tracking-wider">Show All Pieces</button>
      </div>
    `;
    return;
  }

  const fallbackImg = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';

  gridEl.innerHTML = products.map(prod => {
    const isWish = WishlistManager.has(prod.id);
    const p = prod.pricing;
    const img1 = (prod.images && prod.images[0]) ? prod.images[0] : fallbackImg;
    const img2 = (prod.images && prod.images[1]) ? prod.images[1] : img1;

    return `
      <div class="jewellery-card flex flex-col group relative overflow-hidden bg-white rounded-3xl border border-[#d4af37]/30 hover:border-[#d4af37] shadow-[0_10px_30px_rgba(212,175,55,0.08)] hover:shadow-[0_20px_45px_rgba(212,175,55,0.18)] transition-all duration-500">
        <!-- Badges & Wishlist -->
        <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          <span class="badge-hallmark shadow-sm">
            <span>🛡️</span> ${prod.purity} BIS 916
          </span>
          ${prod.stoneType && prod.stoneType !== 'None' ? `<span class="badge-diamond shadow-sm"><span>💎</span> Certified Gems</span>` : ''}
          ${prod.isBestseller ? `<span class="bg-[#0b0e14] text-amber-200 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wider uppercase border border-amber-300/30">Bestseller</span>` : ''}
        </div>

        <button onclick="toggleWishlist('${prod.id}', event)" class="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/95 backdrop-blur shadow-md flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition ${isWish ? 'text-rose-500' : 'text-stone-400'}">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>

        <!-- Product Image Container with Dual-Angle Crossfade -->
        <div onclick="openProductModal('${prod.id}')" class="product-image-container h-64 sm:h-72 cursor-pointer relative overflow-hidden bg-stone-50">
          <img src="${img1}" alt="${prod.name}" class="img-primary w-full h-full object-cover" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';" />
          <img src="${img2}" alt="${prod.name} Alternate Angle" class="img-secondary" loading="lazy" onerror="this.onerror=null; this.src='${img1}';" />
          
          <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

          <!-- Quick Try-on Virtual AR pill -->
          <div class="absolute bottom-2.5 right-2.5 opacity-90 group-hover:opacity-100 transition">
            <span class="bg-black/75 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/40 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
              <span>✨</span> Virtual AR
            </span>
          </div>

          <span class="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full font-medium">
            Gross: ${prod.grossWeight}g | Net: ${prod.netWeight}g
          </span>
        </div>

        <!-- Product Details -->
        <div class="p-3 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-[10px] sm:text-xs text-stone-500 mb-0.5 sm:mb-1">
              <span class="uppercase font-semibold tracking-wider text-[#b4860b] text-[9px] sm:text-[10px]">${prod.category}</span>
              <span class="text-stone-400 text-[9px] sm:text-[10px] font-mono hidden sm:inline">HUID: ${prod.huid}</span>
            </div>
            
            <h3 onclick="openProductModal('${prod.id}')" class="font-serif font-bold text-xs sm:text-base text-stone-900 group-hover:text-[#b4860b] transition cursor-pointer line-clamp-1 leading-snug">
              ${prod.name}
            </h3>

            <!-- Kalyan Style Ratings -->
            <div class="flex items-center gap-1 mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-stone-500">
              <span class="text-amber-500 font-bold">★ 4.9</span>
              <span class="text-stone-300 hidden sm:inline">•</span>
              <span class="text-stone-500 font-medium hidden sm:inline">100% Certified</span>
            </div>

            <p class="hidden sm:block text-xs text-stone-500 mt-1.5 line-clamp-2 font-light">${prod.description}</p>
          </div>

          <div class="mt-2.5 sm:mt-4 pt-2 sm:pt-3.5 border-t border-stone-100">
            <div class="flex items-baseline justify-between">
              <div>
                <span class="text-[8px] sm:text-[10px] text-stone-400 uppercase font-semibold">Incl. 3% GST</span>
                <p class="text-sm sm:text-xl font-bold text-[#b4860b] font-mono tracking-tight">
                  ${formatINR(prod.currentPrice)}
                </p>
              </div>
              <button onclick="openPriceBreakupModal('${prod.id}', event)" class="text-[9px] sm:text-[11px] text-[#b4860b] hover:text-amber-800 font-semibold underline flex items-center gap-0.5">
                <span>Breakup</span>
                <span>ⓘ</span>
              </button>
            </div>

            <!-- Action buttons -->
            <div class="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2 sm:mt-3.5">
              <button onclick="openProductModal('${prod.id}')" class="py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-full text-[10px] sm:text-xs font-semibold text-stone-800 bg-amber-50/70 hover:bg-amber-100/90 border border-[#d4af37]/40 transition text-center shadow-sm truncate">
                Details
              </button>
              <button onclick="addToCart('${prod.id}', event)" class="py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-full text-[10px] sm:text-xs font-bold gold-btn text-center flex items-center justify-center gap-1 shadow truncate">
                <span>+ Bag</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 4. Product Details Modal
async function openProductModal(productId) {
  try {
    const currentCity = window.LocationRates ? window.LocationRates.getCurrentCity() : 'coimbatore';
    const res = await StoreAPI.getProductById(productId, currentCity);
    if (!res.success) return;
    const p = res.product;
    appState.selectedProduct = p;

    const modal = document.getElementById('product-detail-modal');
    const content = document.getElementById('product-detail-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Media Column -->
        <div class="flex flex-col gap-4">
          <div class="w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative group">
            <img id="main-modal-img" src="${p.images[0]}" alt="${p.name}" class="w-full h-full object-cover transition duration-300" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';" />
            <div class="absolute bottom-3 left-3 bg-black/75 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
              <span>HUID: <strong class="font-mono">${p.huid}</strong></span>
              <span>•</span>
              <span>${p.certification}</span>
            </div>
          </div>

          <div class="flex gap-2 overflow-x-auto pb-1">
            ${p.images.map((img, i) => `
              <button onclick="document.getElementById('main-modal-img').src='${img}'" class="w-16 h-16 rounded-xl overflow-hidden border-2 border-stone-200 hover:border-[#c5a059] flex-shrink-0 transition">
                <img src="${img}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';" />
              </button>
            `).join('')}
          </div>

          <!-- AR & Size Helper Tools -->
          <div class="grid grid-cols-2 gap-3 pt-2">
            <button onclick="openTryOnModal('${p.id}')" class="p-3 rounded-full bg-amber-50 border border-amber-300 text-[#996515] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-amber-100 transition">
              <span class="text-base">📸</span> Virtual Try-On AR
            </button>
            <button onclick="openSizeGuideModal('${p.category}')" class="p-3 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-stone-200 transition">
              <span class="text-base">📏</span> Indian Size Guide
            </button>
          </div>
        </div>

        <!-- Details Column -->
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="badge-hallmark text-xs">BIS 916 Hallmark</span>
              <span class="text-xs text-stone-400 font-mono">SKU: ${p.sku}</span>
              <span class="ml-auto text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">In Stock</span>
            </div>

            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900">${p.name}</h2>
            <p class="text-stone-600 text-sm mt-3 leading-relaxed font-light">${p.description}</p>

            <!-- Technical Specifications Table -->
            <div class="mt-6 border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/60">
              <div class="px-4 py-2.5 bg-stone-100 border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-700">
                Jewellery Craftsmanship Specifications
              </div>
              <div class="p-4 grid grid-cols-2 gap-y-2.5 text-xs">
                <div><span class="text-stone-500">Purity / Metal:</span> <strong class="text-stone-800">${p.purity} (${p.metal})</strong></div>
                <div><span class="text-stone-500">Gross Weight:</span> <strong class="text-stone-800">${p.grossWeight} grams</strong></div>
                <div><span class="text-stone-500">Net Gold Weight:</span> <strong class="text-stone-800">${p.netWeight} grams</strong></div>
                <div><span class="text-stone-500">Today's Metal Rate:</span> <strong class="text-stone-800 font-mono">₹${p.pricing.metalRate.toLocaleString('en-IN')}/g</strong></div>
                <div><span class="text-stone-500">Gemstone Details:</span> <strong class="text-stone-800">${p.stoneType}</strong></div>
                <div><span class="text-stone-500">Making Charges:</span> <strong class="text-stone-800">${p.makingChargeValue}${p.makingChargeType === 'percentage' ? '%' : ' ₹/g'}</strong></div>
              </div>
            </div>

            <!-- Price Breakdown Accordion -->
            <div class="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs">
              <div class="flex items-center justify-between font-bold text-stone-800 pb-2 border-b border-amber-200">
                <span>Transparent Itemized Breakdown</span>
                <span class="text-emerald-700">BIS Certified Guarantee</span>
              </div>
              <div class="space-y-1.5 mt-2 font-mono">
                <div class="flex justify-between text-stone-600 font-sans">
                  <span>Net Gold Value (${p.netWeight}g × ₹${p.pricing.metalRate}):</span>
                  <strong class="font-mono text-stone-900">${formatINR(p.pricing.metalValue)}</strong>
                </div>
                <div class="flex justify-between text-stone-600 font-sans">
                  <span>Making Charges (Artisanal Crafting):</span>
                  <strong class="font-mono text-stone-900">${formatINR(p.pricing.makingCharges)}</strong>
                </div>
                ${p.pricing.stonePrice > 0 ? `
                  <div class="flex justify-between text-stone-600 font-sans">
                    <span>Certified Diamonds & Gemstones:</span>
                    <strong class="font-mono text-stone-900">${formatINR(p.pricing.stonePrice)}</strong>
                  </div>
                ` : ''}
                <div class="flex justify-between text-stone-600 font-sans">
                  <span>Standard 3% GST (CGST 1.5% + SGST 1.5%):</span>
                  <strong class="font-mono text-stone-900">${formatINR(p.pricing.gstAmount)}</strong>
                </div>
                <div class="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-amber-200 font-sans">
                  <span>Final Transparent Price:</span>
                  <span class="text-lg text-[#996515] font-mono">${formatINR(p.pricing.finalPrice)}</span>
                </div>
              </div>
            </div>

            <!-- Pincode Delivery Estimator -->
            <div class="mt-4 flex items-center gap-2">
              <div class="relative flex-1">
                <input type="text" id="pincode-input" placeholder="Enter Indian Pincode (e.g. 600017)" maxlength="6" class="w-full text-xs px-3.5 py-2.5 rounded-full border border-stone-300 focus:outline-none focus:border-[#c5a059]" />
              </div>
              <button onclick="checkPincodeDelivery()" class="px-5 py-2.5 dark-pill-btn text-xs font-bold rounded-full transition">
                Check Delivery
              </button>
            </div>
            <p id="pincode-result" class="text-xs text-stone-600 mt-1.5"></p>
          </div>

          <!-- Bottom CTA -->
          <div class="mt-6 pt-4 border-t border-stone-200 flex items-center gap-3">
            <button onclick="addToCart('${p.id}'); closeProductModal();" class="flex-1 py-3.5 px-6 rounded-full gold-btn text-xs uppercase tracking-wider font-bold shadow-lg">
              Add to Shopping Bag
            </button>
            <button onclick="buyNow('${p.id}')" class="flex-1 py-3.5 px-6 rounded-full dark-pill-btn text-xs uppercase tracking-wider font-bold shadow">
              Express Checkout
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } catch (err) {
    console.error('Error opening product modal:', err);
  }
}

function closeProductModal() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// 5. Price Breakup Modal
async function openPriceBreakupModal(productId, event) {
  if (event) event.stopPropagation();
  try {
    const currentCity = window.LocationRates ? window.LocationRates.getCurrentCity() : 'coimbatore';
    const res = await StoreAPI.getProductById(productId, currentCity);
    if (!res.success) return;
    const p = res.product;
    const c = p.pricing;

    const modal = document.getElementById('price-breakup-modal');
    const content = document.getElementById('price-breakup-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="border-b border-stone-200 pb-3 mb-4">
        <span class="text-[10px] uppercase font-bold text-[#996515] tracking-[0.2em]">BIS Hallmark Itemized Breakdown</span>
        <h3 class="font-serif text-lg font-bold text-stone-900 mt-0.5">${p.name}</h3>
        <p class="text-xs text-stone-500 font-mono">HUID: ${p.huid} | Purity: ${p.purity}</p>
      </div>

      <table class="w-full text-xs text-left">
        <thead>
          <tr class="border-b border-stone-200 text-stone-400 uppercase text-[10px]">
            <th class="py-2">Component</th>
            <th class="py-2">Rate / Weight</th>
            <th class="py-2 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <tr>
            <td class="py-2.5 font-medium text-stone-800">Pure Gold Metal Value</td>
            <td class="py-2.5 text-stone-500 font-mono">${p.netWeight}g @ ₹${c.metalRate.toLocaleString('en-IN')}/g</td>
            <td class="py-2.5 text-right font-mono font-bold text-stone-900">${formatINR(c.metalValue)}</td>
          </tr>
          <tr>
            <td class="py-2.5 font-medium text-stone-800">Artisan Making Charges</td>
            <td class="py-2.5 text-stone-500">${p.makingChargeValue}${p.makingChargeType === 'percentage' ? '%' : ' ₹/g'} (Wastage)</td>
            <td class="py-2.5 text-right font-mono font-bold text-stone-900">${formatINR(c.makingCharges)}</td>
          </tr>
          ${c.stonePrice > 0 ? `
            <tr>
              <td class="py-2.5 font-medium text-stone-800">Diamonds & Gemstones</td>
              <td class="py-2.5 text-stone-500">${p.stoneType}</td>
              <td class="py-2.5 text-right font-mono font-bold text-stone-900">${formatINR(c.stonePrice)}</td>
            </tr>
          ` : ''}
          <tr class="bg-stone-50 font-medium">
            <td class="py-2.5 px-2 text-stone-700">Subtotal</td>
            <td class="py-2.5 text-stone-500">Before Tax</td>
            <td class="py-2.5 px-2 text-right font-mono text-stone-900 font-bold">${formatINR(c.subtotal)}</td>
          </tr>
          <tr>
            <td class="py-2.5 font-medium text-stone-800">GST (3%)</td>
            <td class="py-2.5 text-stone-500">CGST (1.5%) + SGST (1.5%)</td>
            <td class="py-2.5 text-right font-mono font-bold text-stone-900">${formatINR(c.gstAmount)}</td>
          </tr>
          <tr class="bg-amber-50/70 font-bold text-sm">
            <td class="py-3 px-2 text-stone-900 font-serif">Total Net Amount</td>
            <td class="py-3 text-stone-500 font-normal text-xs">Insured Vault Shipping</td>
            <td class="py-3 px-2 text-right text-[#996515] font-mono text-base">${formatINR(c.finalPrice)}</td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
        <span>🛡️</span>
        <span>Guaranteed 100% BIS Hallmarked with HUID laser stamped. Zero hidden charges.</span>
      </div>

      <div class="mt-5 flex justify-end">
        <button onclick="closePriceBreakupModal()" class="px-5 py-2 dark-pill-btn rounded-full text-xs font-bold">
          Close
        </button>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } catch (err) {
    console.error('Error opening price breakup modal:', err);
  }
}

function closePriceBreakupModal() {
  const modal = document.getElementById('price-breakup-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// 6. Real Virtual Try-On AR Studio Modal (Live Camera & AI Tracking)
function openTryOnModal(productId) {
  const product = appState.products.find(p => p.id === productId) || appState.selectedProduct;
  if (!product) return;

  if (window.ARTryOn && typeof window.ARTryOn.open === 'function') {
    window.ARTryOn.open(product, 'karthik');
    return;
  }

  const modal = document.getElementById('tryon-modal');
  const titleEl = document.getElementById('tryon-title');
  const overlayImg = document.getElementById('tryon-overlay-img');
  if (!modal || !overlayImg) return;

  if (titleEl) titleEl.innerText = `Virtual AR Try-On Studio: ${product.name}`;
  overlayImg.src = product.images[0];
  overlayImg.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)';

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeTryOnModal() {
  if (window.ARTryOn && typeof window.ARTryOn.close === 'function') {
    window.ARTryOn.close();
  }
  const modal = document.getElementById('tryon-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// 7. Size Guide Modal
function openSizeGuideModal(category = 'rings') {
  const modal = document.getElementById('size-guide-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeSizeGuideModal() {
  const modal = document.getElementById('size-guide-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// 8. Pincode Delivery Estimator
function checkPincodeDelivery() {
  const input = document.getElementById('pincode-input');
  const result = document.getElementById('pincode-result');
  if (!input || !result) return;

  const pin = input.value.trim();
  if (pin.length !== 6 || isNaN(pin)) {
    result.innerHTML = `<span class="text-rose-500">Please enter a valid 6-digit Indian Pincode.</span>`;
    return;
  }

  const days = pin.startsWith('6') ? '2-3 business days' : pin.startsWith('5') ? '2-3 business days' : '3-5 business days';
  result.innerHTML = `
    <span class="text-emerald-700 font-semibold flex items-center gap-1.5 mt-1">
      <span>✓</span> Delivery available for ${pin}! Free Armoured Insured Shipping by BVC Logistics (${days}).
    </span>
  `;
}

// 9. Cart Operations
function addToCart(productId, event) {
  if (event) event.stopPropagation();
  const product = appState.products.find(p => p.id === productId) || appState.selectedProduct;
  if (!product) return;

  CartManager.addItem(product, 1);
  showToast(`Added "${product.name}" to your shopping bag!`, 'success');
  openCartDrawer();
}

function buyNow(productId) {
  addToCart(productId);
  closeProductModal();
  openCheckoutModal();
}

function toggleWishlist(productId, event) {
  if (event) event.stopPropagation();
  const product = appState.products.find(p => p.id === productId);
  if (!product) return;

  const added = WishlistManager.toggle(product);
  showToast(added ? `Saved "${product.name}" to Wishlist!` : `Removed from Wishlist.`, 'info');
  renderProductsGrid(appState.products);
}

function updateCartBadge() {
  const count = CartManager.getCount();
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.innerText = count;
    b.classList.toggle('hidden', count === 0);
  });
  const mobileBadge = document.getElementById('mobile-cart-badge');
  if (mobileBadge) {
    mobileBadge.innerText = count;
    mobileBadge.classList.toggle('hidden', count === 0);
  }
}

function updateWishlistBadge() {
  const count = WishlistManager.getCount();
  const badges = document.querySelectorAll('.wishlist-badge');
  badges.forEach(b => {
    b.innerText = count;
    b.classList.toggle('hidden', count === 0);
  });
}

// 10. Cart Drawer Management
function openCartDrawer() {
  renderCartDrawerItems();
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.classList.remove('translate-x-full');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.classList.add('translate-x-full');
  document.body.style.overflow = '';
}

function renderCartDrawerItems() {
  const cart = CartManager.getCart();
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-grand-total');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center text-stone-500">
        <p class="text-4xl mb-3">🛍️</p>
        <p class="font-serif font-bold text-stone-700">Your shopping bag is empty</p>
        <p class="text-xs text-stone-400 mt-1 font-light">Explore our certified bridal and daily wear collection.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.innerText = formatINR(0);
    if (totalEl) totalEl.innerText = formatINR(0);
    return;
  }

  const subtotal = CartManager.getTotal();
  if (subtotalEl) subtotalEl.innerText = formatINR(subtotal);
  if (totalEl) totalEl.innerText = formatINR(subtotal);

  container.innerHTML = cart.map(item => `
    <div class="flex gap-4 p-3.5 bg-stone-50/80 rounded-2xl border border-stone-200/80">
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover border border-stone-200 flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <h4 class="font-serif font-bold text-xs text-stone-900 truncate">${item.name}</h4>
        <p class="text-[10px] text-stone-500">${item.purity} | Net: ${item.netWeight}g</p>
        <p class="text-xs font-bold text-[#996515] font-mono mt-1">${formatINR(item.price)}</p>
        
        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center border border-stone-200 rounded-full bg-white px-1">
            <button onclick="changeCartQty('${item.productId}', ${item.quantity - 1})" class="px-2 py-0.5 text-xs hover:bg-stone-100 font-bold">-</button>
            <span class="px-2 text-xs font-semibold font-mono">${item.quantity}</span>
            <button onclick="changeCartQty('${item.productId}', ${item.quantity + 1})" class="px-2 py-0.5 text-xs hover:bg-stone-100 font-bold">+</button>
          </div>
          <button onclick="removeFromCart('${item.productId}')" class="text-rose-500 hover:text-rose-700 text-xs font-medium">
            Remove
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function changeCartQty(productId, qty) {
  CartManager.updateQty(productId, qty);
  renderCartDrawerItems();
}

function removeFromCart(productId) {
  CartManager.removeItem(productId);
  renderCartDrawerItems();
  showToast('Item removed from shopping bag', 'info');
}

// 11. Multi-Step Checkout Modal
let checkoutStep = 1;

function openCheckoutModal() {
  const cart = CartManager.getCart();
  if (cart.length === 0) {
    showToast('Your shopping bag is empty!', 'error');
    return;
  }

  closeCartDrawer();
  checkoutStep = 1;
  renderCheckoutStep(1);

  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function renderCheckoutStep(step) {
  checkoutStep = step;
  const container = document.getElementById('checkout-step-content');
  const cart = CartManager.getCart();
  const subtotal = CartManager.getTotal();

  if (!container) return;

  if (step === 1) {
    // Shipping Address Step
    container.innerHTML = `
      <div>
        <div class="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
          <span class="w-6 h-6 rounded-full bg-[#c5a059] text-stone-950 font-bold text-xs flex items-center justify-center">1</span>
          <h3 class="font-serif font-bold text-base text-stone-900">Insured Shipping & Customer Details</h3>
        </div>

        <form id="shipping-form" onsubmit="handleShippingSubmit(event)" class="space-y-3.5 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-stone-600 font-semibold mb-1">Full Name *</label>
              <input type="text" id="cust-name" required value="S. Karthikeyan" class="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#c5a059] focus:outline-none" />
            </div>
            <div>
              <label class="block text-stone-600 font-semibold mb-1">Mobile Phone (for Armoured Courier OTP) *</label>
              <input type="tel" id="cust-phone" required value="+91 98401 55678" class="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#c5a059] focus:outline-none" />
            </div>
          </div>

          <div>
            <label class="block text-stone-600 font-semibold mb-1">Email Address (for GST Hallmark Invoice) *</label>
            <input type="email" id="cust-email" required value="karthik.customer@example.com" class="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#c5a059] focus:outline-none" />
          </div>

          <div>
            <label class="block text-stone-600 font-semibold mb-1">Delivery Street Address *</label>
            <input type="text" id="cust-address" required value="Villa 42, Palm Meadows, Whitefield" class="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#c5a059] focus:outline-none" />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-stone-600 font-semibold mb-1">City *</label>
              <input type="text" id="cust-city" required value="Bangalore" class="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#c5a059] focus:outline-none" />
            </div>
            <div>
              <label class="block text-stone-600 font-semibold mb-1">State *</label>
              <input type="text" id="cust-state" required value="Karnataka" class="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#c5a059] focus:outline-none" />
            </div>
            <div>
              <label class="block text-stone-600 font-semibold mb-1">Pincode *</label>
              <input type="text" id="cust-pincode" required value="560066" maxlength="6" class="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#c5a059] focus:outline-none" />
            </div>
          </div>

          <div class="pt-4 flex justify-between items-center border-t border-stone-200 mt-4">
            <span class="font-bold text-stone-800">Total Payable: <strong class="text-[#996515] text-sm font-mono">${formatINR(subtotal)}</strong></span>
            <button type="submit" class="py-2.5 px-6 rounded-full dark-pill-btn font-bold text-xs uppercase tracking-wider">
              Continue to Payment →
            </button>
          </div>
        </form>
      </div>
    `;
  } else if (step === 2) {
    // Payment Mode Step
    container.innerHTML = `
      <div>
        <div class="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
          <span class="w-6 h-6 rounded-full bg-[#c5a059] text-stone-950 font-bold text-xs flex items-center justify-center">2</span>
          <h3 class="font-serif font-bold text-base text-stone-900">Select Secure Payment Gateway</h3>
        </div>

        <div class="space-y-3.5 text-xs">
          <!-- Promo Coupon Option -->
          <div class="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center gap-2">
            <input type="text" id="checkout-coupon" placeholder="Coupon Code (e.g. WELCOMEKJ, DIWALI2026)" class="flex-1 uppercase text-xs p-2.5 rounded-xl border border-amber-300 focus:outline-none font-mono" />
            <button onclick="applyCheckoutCoupon()" class="px-5 py-2.5 dark-pill-btn rounded-xl font-bold">Apply</button>
          </div>
          <p id="coupon-message" class="text-[11px]"></p>

          <!-- Payment Options -->
          <div class="space-y-2 mt-3">
            <label class="flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:border-[#c5a059] cursor-pointer bg-white transition shadow-sm">
              <input type="radio" name="payment-method" value="UPI (Google Pay / PhonePe / Paytm)" checked class="mt-1" />
              <div>
                <strong class="text-stone-900 block font-serif">Instant UPI & QR Code (Google Pay, PhonePe, Paytm, BHIM)</strong>
                <p class="text-stone-500 text-[11px] font-light">Zero convenience fee. Instant confirmation with real-time assaying receipt.</p>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:border-[#c5a059] cursor-pointer bg-white transition shadow-sm">
              <input type="radio" name="payment-method" value="Credit/Debit Card (No-Cost EMI Available)" class="mt-1" />
              <div>
                <strong class="text-stone-900 block font-serif">Credit / Debit Card (Visa, Mastercard, RuPay, Amex)</strong>
                <p class="text-stone-500 text-[11px] font-light">3, 6, 9, 12 Months Flexible Jewellery EMI options supported.</p>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:border-[#c5a059] cursor-pointer bg-white transition shadow-sm">
              <input type="radio" name="payment-method" value="Net Banking (All Major Indian Banks)" class="mt-1" />
              <div>
                <strong class="text-stone-900 block font-serif">Net Banking (HDFC, SBI, ICICI, Axis, Kotak)</strong>
                <p class="text-stone-500 text-[11px] font-light">Direct high-value RTGS/NEFT/IMPS secured payment.</p>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:border-[#c5a059] cursor-pointer bg-white transition shadow-sm">
              <input type="radio" name="payment-method" value="Cash on Delivery / Showroom Pay" class="mt-1" />
              <div>
                <strong class="text-stone-900 block font-serif">Pay on Delivery / Collect at Flagship</strong>
                <p class="text-stone-500 text-[11px] font-light">Pay via cash or card directly to BVC Armoured courier or in-store.</p>
              </div>
            </label>
          </div>

          <!-- Trust guarantee -->
          <div class="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-[11px] text-stone-600">
            <span class="flex items-center gap-1.5 font-medium"><span>🔒</span> 256-Bit Bank Grade SSL Encryption</span>
            <span class="flex items-center gap-1.5 font-medium"><span>🛡️</span> 100% Transit Insured</span>
          </div>

          <div class="pt-4 flex justify-between items-center border-t border-stone-200 mt-4">
            <button onclick="renderCheckoutStep(1)" class="py-2.5 px-4 text-stone-600 font-bold hover:text-stone-900">
              ← Back
            </button>
            <button onclick="processOrderPlacement()" class="py-2.5 px-7 rounded-full dark-pill-btn font-bold uppercase tracking-wider shadow-lg">
              Confirm & Pay Securely
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

let customerDetailsCache = null;

function handleShippingSubmit(event) {
  event.preventDefault();
  customerDetailsCache = {
    name: document.getElementById('cust-name').value,
    phone: document.getElementById('cust-phone').value,
    email: document.getElementById('cust-email').value,
    address: document.getElementById('cust-address').value,
    city: document.getElementById('cust-city').value,
    state: document.getElementById('cust-state').value,
    pincode: document.getElementById('cust-pincode').value
  };
  renderCheckoutStep(2);
}

async function applyCheckoutCoupon() {
  const input = document.getElementById('checkout-coupon');
  const msg = document.getElementById('coupon-message');
  if (!input || !msg) return;

  const code = input.value.trim();
  const subtotal = CartManager.getTotal();

  try {
    const res = await StoreAPI.validateCoupon(code, subtotal);
    if (res.success) {
      appState.activeCoupon = res.coupon;
      msg.innerHTML = `<span class="text-emerald-700 font-bold">✓ Coupon Applied! You saved ${formatINR(res.coupon.discount)} (${res.coupon.description})</span>`;
    } else {
      appState.activeCoupon = null;
      msg.innerHTML = `<span class="text-rose-500 font-bold">${res.message}</span>`;
    }
  } catch (e) {
    msg.innerHTML = `<span class="text-rose-500 font-bold">Error validating coupon</span>`;
  }
}

async function processOrderPlacement() {
  const methodRadio = document.querySelector('input[name="payment-method"]:checked');
  const paymentMethod = methodRadio ? methodRadio.value : 'UPI';
  const cart = CartManager.getCart();
  const subtotal = CartManager.getTotal();
  const discount = appState.activeCoupon ? appState.activeCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal - discount);

  // If Luxury Payment Gateway is loaded, launch it
  if (window.KJPaymentGateway && typeof window.KJPaymentGateway.openCheckout === 'function') {
    window.KJPaymentGateway.openCheckout({
      brand: 'karthik',
      amount: grandTotal,
      customer: customerDetailsCache,
      items: cart,
      onPaymentSuccess: async (payDetails) => {
        await submitFinalOrder(payDetails);
      },
      onCancel: () => {
        renderCheckoutStep(2);
      }
    });
    return;
  }

  // Fallback direct placement
  await submitFinalOrder({
    method: paymentMethod,
    transactionId: 'TXN_' + Date.now().toString(36).toUpperCase()
  });
}

async function submitFinalOrder(payDetails) {
  const cart = CartManager.getCart();
  const payload = {
    brand: 'karthik',
    customer: customerDetailsCache,
    items: cart,
    paymentMethod: payDetails?.method || 'UPI (Google Pay / PhonePe)',
    paymentDetails: payDetails,
    couponCode: appState.activeCoupon ? appState.activeCoupon.code : null
  };

  const container = document.getElementById('checkout-step-content');
  if (container) {
    container.innerHTML = `
      <div class="py-16 text-center">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-2 border-[#c5a059] border-t-transparent mb-4"></div>
        <h3 class="font-serif text-xl font-bold text-stone-900">Finalizing Your Royal Order...</h3>
        <p class="text-xs text-stone-500 mt-1">Generating official BIS Hallmark Certificate & BVC Insured Transit Waybill...</p>
      </div>
    `;
  }

  try {
    const res = await StoreAPI.createOrder(payload);
    if (res.success) {
      CartManager.clear();
      renderOrderSuccess(res.order);
    } else {
      showToast(res.message || 'Error creating order', 'error');
      renderCheckoutStep(2);
    }
  } catch (err) {
    console.error('Order creation error:', err);
    showToast('Failed to place order. Please try again.', 'error');
    renderCheckoutStep(2);
  }
}

function renderOrderSuccess(order) {
  const container = document.getElementById('checkout-step-content');
  if (!container) return;

  const txnId = order.payment?.transactionId || 'TXN_VERIFIED';
  const rrn = order.payment?.rrn ? ` | Ref: ${order.payment.rrn}` : '';
  const waMsg = encodeURIComponent(
    `✨ Karthik Jewellers Order Confirmation\nOrder ID: ${order.id}\nCustomer: ${order.customer.name}\nTotal Paid: ${formatINR(order.summary.grandTotal)}\nTransaction: ${txnId}\nTracking: ${order.trackingNumber}\nThank you for choosing certified BIS 916 gold.`
  );

  container.innerHTML = `
    <div class="text-center py-6">
      <div class="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3 border border-emerald-200 shadow-sm">
        ✓
      </div>
      <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#996515]">Order Successfully Placed & Insured</span>
      <h3 class="font-serif text-2xl font-bold text-stone-900 mt-1">Thank You, ${order.customer.name}!</h3>
      <p class="text-xs text-stone-500 mt-1">Order Ref: <strong class="text-stone-800 font-mono">${order.id}</strong></p>

      <div class="mt-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-2">
        <div class="flex justify-between">
          <span class="text-stone-500">Insured Armoured Transit:</span>
          <strong class="text-stone-800">${order.courier}</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-stone-500">Waybill Tracking #:</span>
          <strong class="text-stone-800 font-mono">${order.trackingNumber}</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-stone-500">Estimated Delivery:</span>
          <strong class="text-emerald-700">${order.deliveryEstimated}</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-stone-500">Payment Mode:</span>
          <strong class="text-stone-800">${order.payment.method} (${order.payment.status})</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-stone-500">Bank Transaction ID:</span>
          <strong class="text-stone-800 font-mono text-[11px]">${txnId}${rrn}</strong>
        </div>
        <div class="flex justify-between text-sm font-bold pt-2 border-t border-stone-200">
          <span class="text-stone-900">Total Paid:</span>
          <span class="text-[#996515] font-mono">${formatINR(order.summary.grandTotal)}</span>
        </div>
      </div>

      <div class="mt-6 flex flex-col sm:flex-row gap-2.5">
        <a href="/invoice?orderId=${order.id}" target="_blank" class="flex-1 py-3 px-4 rounded-full dark-pill-btn text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
          <span>📄</span> Official GST Invoice
        </a>
        <a href="https://api.whatsapp.com/send?phone=919790644448&text=${waMsg}" target="_blank" class="flex-1 py-3 px-4 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 transition">
          <span>💬</span> WhatsApp Receipt
        </a>
        <button onclick="closeCheckoutModal()" class="py-3 px-5 rounded-full bg-stone-100 text-stone-800 hover:bg-stone-200 transition text-xs font-bold uppercase tracking-wider">
          Done
        </button>
      </div>
    </div>
  `;
}

// 12. Filter & Navigation helpers
function filterByCategory(catId) {
  appState.currentCategory = catId;
  const filterSelect = document.getElementById('filter-category');
  if (filterSelect) filterSelect.value = catId;
  loadProducts();

  const section = document.getElementById('products-section');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

function resetFilters() {
  appState.currentCategory = 'all';
  appState.currentPurity = 'all';
  appState.currentSort = 'default';
  appState.currentSearch = '';

  const catSelect = document.getElementById('filter-category');
  if (catSelect) catSelect.value = 'all';
  const puritySelect = document.getElementById('filter-purity');
  if (puritySelect) puritySelect.value = 'all';
  const sortSelect = document.getElementById('filter-sort');
  if (sortSelect) sortSelect.value = 'default';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  loadProducts();
}

// 13. Event Listeners for Filters & Search
function initEventListeners() {
  const catSelect = document.getElementById('filter-category');
  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      appState.currentCategory = e.target.value;
      loadProducts();
    });
  }

  const puritySelect = document.getElementById('filter-purity');
  if (puritySelect) {
    puritySelect.addEventListener('change', (e) => {
      appState.currentPurity = e.target.value;
      loadProducts();
    });
  }

  const sortSelect = document.getElementById('filter-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      appState.currentSort = e.target.value;
      loadProducts();
    });
  }

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        appState.currentSearch = e.target.value.trim();
        loadProducts();
      }, 350);
    });
  }

  // Scheme calculator
  const schemeSlider = document.getElementById('scheme-amount-slider');
  if (schemeSlider) {
    schemeSlider.addEventListener('input', updateSchemeCalculation);
    updateSchemeCalculation();
  }
}

// 14. Swarna Nidhi Gold Savings Scheme Calculator
function updateSchemeCalculation() {
  const slider = document.getElementById('scheme-amount-slider');
  const displayMonthly = document.getElementById('scheme-monthly-display');
  const displayTotalPaid = document.getElementById('scheme-total-paid');
  const displayBonus = document.getElementById('scheme-bonus-display');
  const displayGrams = document.getElementById('scheme-gold-grams');

  if (!slider || !displayMonthly) return;

  const monthly = Number(slider.value);
  const tenure = 11;
  const totalPaid = monthly * tenure;
  const bonus = monthly;
  const rate22k = (appState.rates && appState.rates.gold22k) || 7215;
  const estimatedGrams = ((totalPaid + bonus) / rate22k).toFixed(2);

  displayMonthly.innerText = formatINR(monthly);
  if (displayTotalPaid) displayTotalPaid.innerText = formatINR(totalPaid);
  if (displayBonus) displayBonus.innerText = formatINR(bonus);
  if (displayGrams) displayGrams.innerText = `${estimatedGrams} grams`;
}

async function handleSchemeEnrollment(event) {
  event.preventDefault();
  const name = document.getElementById('scheme-cust-name').value;
  const phone = document.getElementById('scheme-cust-phone').value;
  const email = document.getElementById('scheme-cust-email').value;
  const slider = document.getElementById('scheme-amount-slider');
  const branch = document.getElementById('scheme-branch').value;

  try {
    const res = await StoreAPI.enrollScheme({
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      monthlyAmount: Number(slider.value),
      branch
    });

    if (res.success) {
      showToast('Enrolled in Swarna Nidhi Gold Savings Scheme! Passbook generated.', 'success');
      document.getElementById('scheme-enroll-form').reset();

      // Offer immediate 1st installment online payment via gateway
      if (window.KJPaymentGateway && res.scheme) {
        setTimeout(() => {
          if (confirm('🎉 Enrollment Successful!\n\nWould you like to pay your 1st monthly installment online now to lock today\'s 22KT gold rate?')) {
            KJPaymentGateway.openSchemePayment(res.scheme);
          }
        }, 500);
      }
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Failed to enroll in scheme', 'error');
  }
}

async function openSchemePayModal() {
  const accountInput = prompt('Enter your Swarna Nidhi Passbook ID or Registered Mobile Number:\n(e.g. SCH-KJ-2026-101 or 9790644448)');
  if (!accountInput) return;

  try {
    const res = await StoreAPI.getSchemes();
    if (!res.success || !res.schemes || !res.schemes.length) {
      alert('No active schemes found.');
      return;
    }

    const trimmed = accountInput.trim().toLowerCase();
    const match = res.schemes.find(s => 
      (s.id && s.id.toLowerCase() === trimmed) || 
      (s.customerPhone && s.customerPhone.includes(trimmed)) ||
      (s.customerName && s.customerName.toLowerCase().includes(trimmed))
    );

    if (!match) {
      alert('No active Swarna Nidhi account found matching: ' + accountInput + '\nPlease verify your Passbook ID or enroll below.');
      return;
    }

    if (window.KJPaymentGateway) {
      window.KJPaymentGateway.openSchemePayment(match);
    } else {
      alert(`Account Found: ${match.customerName} (${match.id})\nMonthly Amount: ₹${match.monthlyAmount}\nPaid: ${match.paidInstallments}/${match.tenureMonths}`);
    }
  } catch (err) {
    console.error('Scheme lookup error:', err);
    alert('Failed to connect to scheme database.');
  }
}

// 15. VIP Appointment Consultation Booking
async function handleAppointmentSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('apt-name').value;
  const phone = document.getElementById('apt-phone').value;
  const email = document.getElementById('apt-email').value;
  const serviceType = document.getElementById('apt-service').value;
  const branch = document.getElementById('apt-branch').value;
  const date = document.getElementById('apt-date').value;
  const time = document.getElementById('apt-time').value;
  const notes = document.getElementById('apt-notes').value;

  try {
    const res = await StoreAPI.createAppointment({
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      serviceType,
      branch,
      preferredDate: date,
      preferredTime: time,
      notes
    });

    if (res.success) {
      showToast('VIP Consultation booked! Our Master Jeweller will contact you.', 'success');
      document.getElementById('appointment-form').reset();
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Failed to book appointment', 'error');
  }
}

// 16. BIS Hallmark HUID Verifier
async function verifyHuidDirect() {
  const input = document.getElementById('huid-verify-input');
  const resultDiv = document.getElementById('huid-verify-result');
  if (!input || !resultDiv) return;

  const huid = input.value.trim();
  if (!huid) {
    resultDiv.innerHTML = `<span class="text-rose-500 text-xs">Please enter an HUID laser stamped code.</span>`;
    return;
  }

  resultDiv.innerHTML = `<div class="text-xs text-stone-500 py-3">Connecting to National Assaying Registry...</div>`;

  try {
    const res = await StoreAPI.verifyHuid(huid);
    if (res.success && res.verified) {
      resultDiv.innerHTML = `
        <div class="mt-4 p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-xs text-left animate-slide-up shadow-sm">
          <div class="flex items-center gap-2 text-emerald-800 font-bold text-sm pb-2 border-b border-emerald-200">
            <span>🛡️</span> BIS Hallmark Authenticity Guaranteed (Govt. of India)
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 text-stone-700">
            <div><strong>HUID Number:</strong> <span class="font-mono text-stone-900 font-bold">${res.huid}</span></div>
            <div><strong>Purity Assayed:</strong> <span class="text-emerald-800 font-bold">${res.purityVerified}</span></div>
            <div><strong>Retailer:</strong> ${res.jewellerName}</div>
            <div><strong>License Code:</strong> ${res.retailerLicense}</div>
            <div class="col-span-full"><strong>Assaying Centre:</strong> ${res.hallmarkCenter}</div>
            ${res.productName ? `<div class="col-span-full"><strong>Linked Masterpiece:</strong> ${res.productName} (${res.grossWeight})</div>` : ''}
          </div>
          <p class="text-[11px] text-emerald-700 mt-3 pt-2 border-t border-emerald-200">
            ✓ Tamper-proof certified with micro-laser engraved triangulation logo.
          </p>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-700">
          ⚠️ ${res.message || 'HUID record not found.'}
        </div>
      `;
    }
  } catch (err) {
    resultDiv.innerHTML = `<div class="text-rose-500 text-xs mt-2">Error connecting to hallmark verification server.</div>`;
  }
}

// 17. Live Order Tracking Lookup
async function trackOrderDirect() {
  const input = document.getElementById('order-track-input');
  const resultDiv = document.getElementById('order-track-result');
  if (!input || !resultDiv) return;

  const orderId = input.value.trim();
  if (!orderId) {
    resultDiv.innerHTML = `<span class="text-rose-500 text-xs">Please enter an Order Reference ID (e.g. ORD-KJ-2026-9041).</span>`;
    return;
  }

  resultDiv.innerHTML = `<div class="text-xs text-stone-500 py-3">Locating Armoured Logistics Consignment...</div>`;

  try {
    const res = await StoreAPI.getOrderById(orderId);
    if (res.success && res.order) {
      const ord = res.order;
      const steps = [
        { label: 'Order Confirmed', done: true },
        { label: 'BIS Hallmarking Verified', done: true },
        { label: 'Master Goldsmith Finishing', done: ord.status.includes('Crafting') || ord.status.includes('Dispatched') || ord.status.includes('Delivered') },
        { label: 'Armoured Transit (BVC Logistics)', done: ord.status.includes('Dispatched') || ord.status.includes('Delivered') },
        { label: 'Delivered Securely', done: ord.status.includes('Delivered') }
      ];

      resultDiv.innerHTML = `
        <div class="mt-4 p-5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-left animate-slide-up shadow-sm">
          <div class="flex justify-between items-center pb-3 border-b border-stone-200">
            <div>
              <span class="text-stone-500">Order ID:</span>
              <strong class="text-stone-900 font-mono">${ord.id}</strong>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#0b0e14] text-emerald-400">
              ${ord.status}
            </span>
          </div>

          <div class="my-6">
            <div class="flex items-center justify-between relative">
              <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 -z-0"></div>
              ${steps.map((st, i) => `
                <div class="flex flex-col items-center relative z-10">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${st.done ? 'bg-[#c5a059] text-stone-950 shadow' : 'bg-stone-300 text-stone-600'}">
                    ${st.done ? '✓' : i + 1}
                  </div>
                  <span class="text-[10px] text-stone-600 mt-2 text-center max-w-[70px] leading-tight font-medium">${st.label}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-stone-600 pt-3 border-t border-stone-200">
            <div>Courier: <strong class="text-stone-900">${ord.courier}</strong></div>
            <div>Waybill: <strong class="text-stone-900 font-mono">${ord.trackingNumber}</strong></div>
            <div>Destination: <strong class="text-stone-900">${ord.customer.city}, ${ord.customer.pincode}</strong></div>
            <div>Est. Arrival: <strong class="text-emerald-700">${ord.deliveryEstimated}</strong></div>
          </div>

          <div class="mt-4 text-center">
            <a href="/invoice?orderId=${ord.id}" target="_blank" class="inline-block py-2.5 px-6 rounded-full dark-pill-btn text-xs font-bold">
              View GST Hallmark Tax Invoice
            </a>
          </div>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `<div class="text-rose-500 text-xs mt-2">Order ID not found. Please verify the reference.</div>`;
    }
  } catch (err) {
    resultDiv.innerHTML = `<div class="text-rose-500 text-xs mt-2">Error checking order status.</div>`;
  }
}
