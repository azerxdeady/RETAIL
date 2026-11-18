/**
 * VISWANANDINI JEWELLERS - ROYAL BRIDAL HOUSE STOREFRONT INTERACTIVE LOGIC
 * An Affiliate Luxury Bridal Brand under Karthik Jewellers Private Limited
 */

let viswaState = {
  rates: null,
  products: [],
  allProducts: [],
  cart: JSON.parse(localStorage.getItem('viswa_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('viswa_wishlist') || '[]'),
  selectedProduct: null,
  tryOnScale: 1,
  tryOnPosX: 0,
  tryOnPosY: 0
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadViswaTheme();
  await loadViswaRates();
  await loadViswaProducts();
  updateViswaCartBadge();
  updateViswaWishlistBadge();
  updateViswaSchemeCalc(15000);

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeViswaPriceModal();
      closeViswaTryOnModal();
      closeNandiniEnrollModal();
      closeCartDrawer();
      closeViswaCheckoutModal();
    }
  });
});

async function loadViswaTheme() {
  try {
    const res = await StoreAPI.getThemeSettings();
    if (res.success && res.themeSettings) {
      if (window.KJSync && typeof window.KJSync.applyThemeSettingsToDOM === 'function') {
        const settings = res.themeSettings.viswanandini || res.themeSettings;
        window.KJSync.applyThemeSettingsToDOM({ viswanandini: settings });
      }
    }
  } catch (err) {
    console.warn('Failed to load Viswanandini theme:', err);
  }
}

// ==========================================
// 1. LIVE BULLION RATES ENGINE
// ==========================================
async function loadViswaRates() {
  try {
    const res = await StoreAPI.getRates();
    if (res.success) {
      viswaState.rates = res.rates;
      renderViswaTicker(res.rates);
      renderViswaRatesCard(res.rates);
    }
  } catch (err) {
    console.error('Failed to load rates for Viswanandini:', err);
  }
}

function renderViswaTicker(rates) {
  const tickerEl = document.getElementById('viswa-rate-ticker');
  if (!tickerEl) return;

  const timeStr = new Date(rates.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  tickerEl.innerHTML = `
    <div class="flex items-center gap-6 whitespace-nowrap text-xs font-medium">
      <span class="flex items-center gap-2 text-[#f3e5ab]">
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <strong class="text-white tracking-widest font-serif">CENTRAL BULLION INDEX</strong> (${timeStr})
      </span>
      <span>Gold 22KT (916 BIS Hallmark): <strong class="text-white font-mono">₹${rates.gold22k.toLocaleString('en-IN')}/g</strong></span>
      <span>Gold 24KT (999 Pure): <strong class="text-white font-mono">₹${rates.gold24k.toLocaleString('en-IN')}/g</strong></span>
      <span>Gold 18KT (Rose & Diamond): <strong class="text-white font-mono">₹${rates.gold18k.toLocaleString('en-IN')}/g</strong></span>
      <span>Fine Silver: <strong class="text-white font-mono">₹${rates.silver.toLocaleString('en-IN')}/g</strong></span>
      <span class="text-amber-300 font-bold">★ Certified Under Karthik Jewellers BIS License HM/L-600017-0982</span>
    </div>
  `;
}

function renderViswaRatesCard(rates) {
  const cardEl = document.getElementById('viswa-rates-overview-card');
  if (!cardEl) return;

  cardEl.innerHTML = `
    <div class="bg-gradient-to-br from-[#2a0810] via-[#1c050a] to-[#0e0205] border border-[#d4af37]/50 rounded-3xl p-6 sm:p-7 text-white shadow-[0_20px_50px_rgba(212,175,55,0.18)] relative overflow-hidden">
      <div class="absolute -right-16 -top-16 w-56 h-56 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#d4af37]/30 gap-3">
        <div>
          <span class="text-[10px] uppercase tracking-[0.28em] text-[#ecc874] font-bold">Precious Metals Live Index</span>
          <h3 class="text-xl sm:text-2xl font-serif font-bold text-white mt-0.5">Today's Royal Bullion Pricing</h3>
        </div>
        <div class="flex items-center gap-2 text-xs bg-[#3d0f19] text-amber-200 border border-[#d4af37]/40 px-3.5 py-1.5 rounded-full w-fit shadow-sm">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>BIS Assayed Live Synchronizer</span>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        <div class="bg-gradient-to-b from-[#3a0d17] to-[#20060d] p-4 rounded-2xl border-2 border-[#d4af37] shadow-[0_8px_25px_rgba(212,175,55,0.22)] relative">
          <span class="absolute top-2 right-2 text-[8px] bg-gradient-to-r from-[#d4af37] to-[#ecc874] text-stone-950 font-black px-1.5 py-0.5 rounded-full shadow-sm">ROYAL CHOICE</span>
          <p class="text-[10px] text-amber-200 uppercase font-bold tracking-wider">Gold 22KT (916 Hallmark)</p>
          <p class="text-2xl font-bold text-amber-300 mt-1 font-mono">₹${rates.gold22k.toLocaleString('en-IN')}<span class="text-xs font-normal text-stone-400 font-sans"> /g</span></p>
          <span class="text-[10px] text-amber-200/90 mt-1 block">★ Royal Polki & Temple Standard</span>
        </div>

        <div class="bg-[#1b080c] p-4 rounded-2xl border border-[#d4af37]/40 shadow-sm">
          <p class="text-[10px] text-amber-200 uppercase font-semibold tracking-wider">Gold 24KT (999 Pure)</p>
          <p class="text-2xl font-bold text-white mt-1 font-mono">₹${rates.gold24k.toLocaleString('en-IN')}<span class="text-xs font-normal text-stone-400 font-sans"> /g</span></p>
          <span class="text-[10px] text-emerald-400 mt-1 block">▲ Investment Bullion & Coins</span>
        </div>

        <div class="bg-[#1b080c] p-4 rounded-2xl border border-stone-800">
          <p class="text-[10px] text-stone-400 uppercase font-semibold tracking-wider">Gold 18KT (Diamond)</p>
          <p class="text-2xl font-bold text-stone-200 mt-1 font-mono">₹${rates.gold18k.toLocaleString('en-IN')}<span class="text-xs font-normal text-stone-400 font-sans"> /g</span></p>
          <span class="text-[10px] text-stone-400 mt-1 block">Cocktail & Solitaire Rings</span>
        </div>

        <div class="bg-[#1b080c] p-4 rounded-2xl border border-stone-800">
          <p class="text-[10px] text-stone-400 uppercase font-semibold tracking-wider">Silver (999 Fine)</p>
          <p class="text-2xl font-bold text-stone-200 mt-1 font-mono">₹${rates.silver.toLocaleString('en-IN')}<span class="text-xs font-normal text-stone-400 font-sans"> /g</span></p>
          <span class="text-[10px] text-stone-400 mt-1 block">₹${(rates.silver * 1000).toLocaleString('en-IN')} / 1 Kg Bar</span>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 2. PRODUCTS CATALOG FETCH & RENDER
// ==========================================
async function loadViswaProducts() {
  const gridEl = document.getElementById('viswa-products-grid');
  if (gridEl) {
    gridEl.innerHTML = `
      <div class="col-span-full py-16 text-center text-stone-500">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#781d2a] border-t-transparent mb-3"></div>
        <p class="font-serif text-sm">Curating Viswanandini royal bridal masterpieces...</p>
      </div>
    `;
  }

  try {
    const res = await StoreAPI.getProducts({ brand: 'viswanandini' });
    if (res.success) {
      viswaState.products = res.products;
      viswaState.allProducts = res.products;
      renderViswaProductsGrid(res.products);
    }
  } catch (err) {
    console.error('Failed to load Viswanandini products:', err);
  }
}

function renderViswaProductsGrid(products) {
  const gridEl = document.getElementById('viswa-products-grid');
  const countEl = document.getElementById('viswa-products-count');
  if (countEl) countEl.innerText = `${products.length} Royal Masterpieces Found`;

  if (!gridEl) return;

  if (products.length === 0) {
    gridEl.innerHTML = `
      <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-stone-300 p-8">
        <p class="text-4xl mb-3">👑</p>
        <h3 class="text-xl font-serif font-bold text-stone-900">No pieces match this filter</h3>
        <p class="text-xs text-stone-500 mt-1">Please reset your filter to view all Viswanandini bridal heirlooms.</p>
        <button onclick="resetViswaFilters()" class="mt-4 px-6 py-2.5 rounded-full viswa-btn text-xs font-bold uppercase tracking-wider">Show All Pieces</button>
      </div>
    `;
    return;
  }

  const fallbackImg = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';

  gridEl.innerHTML = products.map(prod => {
    const isWishlisted = viswaState.wishlist.some(id => id === prod.id);
    const img1 = (prod.images && prod.images[0]) ? prod.images[0] : fallbackImg;
    const img2 = (prod.images && prod.images[1]) ? prod.images[1] : img1;

    return `
      <div class="viswa-card rounded-3xl overflow-hidden flex flex-col justify-between group bg-white border border-[#d4af37]/35 shadow-[0_12px_35px_rgba(212,175,55,0.12)] hover:border-[#d4af37] transition duration-500">
        
        <!-- Image Area with Dual-Angle Crossfade -->
        <div class="product-image-container relative overflow-hidden aspect-square bg-[#fcf9f2]">
          <img src="${img1}" alt="${prod.name}" class="img-primary w-full h-full object-cover" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
          <img src="${img2}" alt="${prod.name} Alternate Angle" class="img-secondary" loading="lazy" onerror="this.onerror=null; this.src='${img1}';">
          
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

          <div class="absolute top-3 left-3 flex flex-col gap-1 items-start z-10 pointer-events-none">
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#781d2a] text-white shadow border border-amber-300/40">
              ${prod.purity} BIS 916
            </span>
            ${prod.isFeatured ? '<span class="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-[#d4af37] to-[#ecc874] text-stone-950 shadow">ROYAL BRIDAL</span>' : ''}
          </div>

          <button onclick="toggleViswaWishlist('${prod.id}', event)" class="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-xs ${isWishlisted ? 'text-[#781d2a]' : 'text-stone-400'} hover:text-[#781d2a] transition">
            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>

          <!-- Quick Try-On Overlay trigger -->
          <button onclick="openViswaTryOnModal('${prod.id}')" class="absolute bottom-3 right-3 z-10 px-3 py-1 rounded-full bg-black/80 hover:bg-black text-[#d4af37] text-[10px] font-bold tracking-wider backdrop-blur-md shadow flex items-center gap-1 transition border border-[#d4af37]/40">
            <span>✨</span> Virtual AR
          </button>
        </div>

        <!-- Content Area -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between text-[10px] text-stone-400 font-medium">
              <span class="uppercase tracking-widest text-[#781d2a] font-bold">${prod.category}</span>
              <span class="font-mono text-stone-500">HUID: ${prod.huid}</span>
            </div>
            
            <h4 class="font-serif font-bold text-base text-stone-900 mt-1 line-clamp-2 group-hover:text-[#781d2a] transition leading-snug">
              ${prod.name}
            </h4>

            <p class="text-[11px] text-stone-500 mt-1 font-light line-clamp-2">
              ${prod.description}
            </p>
          </div>

          <!-- Weight & Rate Breakdown Preview -->
          <div class="bg-[#fcf9f2] p-2.5 rounded-2xl border border-[#d4af37]/25 text-[11px] space-y-1">
            <div class="flex justify-between text-stone-600">
              <span>Gross / Net Gold:</span>
              <strong class="text-stone-800 font-mono">${prod.grossWeight}g / ${prod.netWeight}g</strong>
            </div>
            ${prod.stonePrice > 0 ? `
              <div class="flex justify-between text-stone-600">
                <span>Gems / Polki:</span>
                <span class="text-amber-800 font-medium">₹${prod.stonePrice.toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
          </div>

          <!-- Price & Action -->
          <div class="pt-2 border-t border-stone-100">
            <div class="flex items-baseline justify-between mb-3">
              <div>
                <span class="text-[9px] uppercase tracking-wider text-stone-400 block font-semibold">All-Inclusive Price</span>
                <strong class="font-mono text-xl font-bold text-[#b4860b]">
                  ₹${prod.currentPrice.toLocaleString('en-IN')}
                </strong>
              </div>
              <button onclick="openViswaPriceModal('${prod.id}')" class="text-[11px] text-[#781d2a] hover:underline font-semibold flex items-center gap-1" title="View transparent mathematical price breakdown">
                <span>Formula</span>
                <span>ⓘ</span>
              </button>
            </div>

            <button onclick="addViswaToCart('${prod.id}')" class="w-full py-2.5 rounded-full viswa-gold-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow">
              <i class="fa-solid fa-bag-shopping"></i>
              <span>Add to Royal Bag</span>
            </button>
          </div>

        </div>

      </div>
    `;
  }).join('');
}

function filterViswaCatalog() {
  const cat = document.getElementById('viswa-category-filter')?.value || 'all';
  const purity = document.getElementById('viswa-purity-filter')?.value || 'all';
  const sort = document.getElementById('viswa-sort-filter')?.value || 'default';

  let filtered = [...viswaState.allProducts];

  if (cat !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === cat.toLowerCase());
  }

  if (purity !== 'all') {
    filtered = filtered.filter(p => p.purity.toLowerCase().includes(purity.toLowerCase()));
  }

  if (sort === 'price-low-high') {
    filtered.sort((a, b) => a.currentPrice - b.currentPrice);
  } else if (sort === 'price-high-low') {
    filtered.sort((a, b) => b.currentPrice - a.currentPrice);
  } else if (sort === 'weight-high-low') {
    filtered.sort((a, b) => b.grossWeight - a.grossWeight);
  }

  viswaState.products = filtered;
  renderViswaProductsGrid(filtered);
}

function resetViswaFilters() {
  if (document.getElementById('viswa-category-filter')) document.getElementById('viswa-category-filter').value = 'all';
  if (document.getElementById('viswa-purity-filter')) document.getElementById('viswa-purity-filter').value = 'all';
  if (document.getElementById('viswa-sort-filter')) document.getElementById('viswa-sort-filter').value = 'default';
  viswaState.products = [...viswaState.allProducts];
  renderViswaProductsGrid(viswaState.products);
}

// ==========================================
// 3. TRANSPARENT PRICE BREAKUP MODAL
// ==========================================
function openViswaPriceModal(productId) {
  const prod = viswaState.allProducts.find(p => p.id === productId);
  if (!prod) return;

  const modal = document.getElementById('viswa-price-modal');
  const content = document.getElementById('viswa-price-content');
  if (!modal || !content) return;

  const pr = prod.pricing;

  content.innerHTML = `
    <div class="text-center pb-4 border-b border-stone-200">
      <span class="text-[9px] uppercase tracking-widest text-[#781d2a] font-bold">Transparent Indian Jewellery Standard</span>
      <h3 class="font-serif font-bold text-xl text-stone-900 mt-1">${prod.name}</h3>
      <p class="text-[11px] text-stone-500 font-mono mt-0.5">SKU: ${prod.sku} • HUID: ${prod.huid}</p>
    </div>

    <div class="py-4 space-y-2.5 text-xs">
      <div class="flex justify-between text-stone-600">
        <span>Gold Purity & Fineness:</span>
        <strong class="text-stone-900 font-mono">${prod.purity} (${prod.purity === '22KT' ? '91.6% Pure Gold' : prod.purity === '18KT' ? '75.0% Pure Gold' : '99.9% Pure'})</strong>
      </div>
      <div class="flex justify-between text-stone-600">
        <span>Gross Weight / Net Gold Weight:</span>
        <strong class="text-stone-900 font-mono">${prod.grossWeight}g / ${prod.netWeight}g</strong>
      </div>
      <div class="flex justify-between text-stone-600">
        <span>Live Bullion Rate per Gram:</span>
        <strong class="text-amber-700 font-mono">₹${pr.metalRate.toLocaleString('en-IN')} / g</strong>
      </div>
      <div class="flex justify-between text-stone-600 border-t border-stone-100 pt-2">
        <span>1. Net Gold Metal Value (${prod.netWeight}g × ₹${pr.metalRate}):</span>
        <strong class="text-stone-900 font-mono">₹${pr.metalValue.toLocaleString('en-IN')}</strong>
      </div>
      <div class="flex justify-between text-stone-600">
        <span>2. Artisan Making Charges (${prod.makingChargeValue}% Karigar Crafting):</span>
        <strong class="text-stone-900 font-mono">₹${pr.makingCharges.toLocaleString('en-IN')}</strong>
      </div>
      <div class="flex justify-between text-stone-600">
        <span>3. Syndicate Polki & Gemstone Value:</span>
        <strong class="text-stone-900 font-mono">₹${pr.stonePrice.toLocaleString('en-IN')}</strong>
      </div>
      <div class="flex justify-between text-stone-800 font-semibold border-t border-stone-200 pt-2">
        <span>Taxable Value (1 + 2 + 3):</span>
        <strong class="font-mono">₹${pr.subtotal.toLocaleString('en-IN')}</strong>
      </div>
      <div class="flex justify-between text-stone-600">
        <span>4. GST Remittance (3% = CGST 1.5% + SGST 1.5%):</span>
        <strong class="text-stone-900 font-mono">₹${pr.gstAmount.toLocaleString('en-IN')}</strong>
      </div>
      <div class="flex justify-between text-base font-bold text-[#781d2a] border-t-2 border-[#781d2a] pt-3">
        <span>Final Certified Retail Price:</span>
        <strong class="font-mono text-xl">₹${pr.finalPrice.toLocaleString('en-IN')}</strong>
      </div>
    </div>

    <div class="mt-4 pt-3 border-t border-stone-200 flex justify-between items-center text-[11px] text-stone-500">
      <span>Official BIS Hallmarking Included</span>
      <button onclick="addViswaToCart('${prod.id}'); closeViswaPriceModal();" class="px-5 py-2 rounded-full viswa-btn text-xs font-bold uppercase tracking-wider">
        Add to Royal Bag
      </button>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeViswaPriceModal() {
  document.getElementById('viswa-price-modal')?.classList.add('hidden');
}

// ==========================================
// 4. REAL VIRTUAL AR TRY-ON STUDIO (Live Camera & AI Landmark Tracking)
// ==========================================
function openViswaTryOnModal(productId) {
  const prod = viswaState.allProducts.find(p => p.id === productId);
  if (!prod) return;

  if (window.ARTryOn && typeof window.ARTryOn.open === 'function') {
    window.ARTryOn.open(prod, 'viswanandini');
    return;
  }

  const modal = document.getElementById('viswa-tryon-modal');
  const title = document.getElementById('viswa-tryon-title');
  const overlay = document.getElementById('viswa-tryon-overlay');
  if (!modal || !overlay) return;

  if (title) title.innerText = `${prod.name} (Virtual Try-On)`;
  overlay.src = prod.images[0];
  viswaState.tryOnScale = 1;
  viswaState.tryOnPosX = 0;
  viswaState.tryOnPosY = 0;
  updateViswaTryOnTransform();

  modal.classList.remove('hidden');
}

function closeViswaTryOnModal() {
  if (window.ARTryOn && typeof window.ARTryOn.close === 'function') {
    window.ARTryOn.close();
  }
  document.getElementById('viswa-tryon-modal')?.classList.add('hidden');
}

function adjustViswaTryOnScale(delta) {
  viswaState.tryOnScale = Math.max(0.4, Math.min(2.5, viswaState.tryOnScale + delta));
  updateViswaTryOnTransform();
}

function adjustViswaTryOnPos(dx, dy) {
  viswaState.tryOnPosX += dx;
  viswaState.tryOnPosY += dy;
  updateViswaTryOnTransform();
}

function updateViswaTryOnTransform() {
  const el = document.getElementById('viswa-tryon-overlay');
  if (el) {
    el.style.transform = `translate(calc(-50% + ${viswaState.tryOnPosX}px), calc(-50% + ${viswaState.tryOnPosY}px)) scale(${viswaState.tryOnScale})`;
  }
}

// ==========================================
// 5. NANDINI SWARNA VARSHA CHIT CALCULATOR & ENROLL
// ==========================================
function updateViswaSchemeCalc(amount) {
  const val = Number(amount);
  const paid11 = val * 11;
  const bonus = val;
  const totalMaturity = val * 12;

  const rate22k = viswaState.rates ? viswaState.rates.gold22k : 7215;
  const estGrams = Number((totalMaturity / rate22k).toFixed(2));

  if (document.getElementById('viswa-calc-amount-display')) {
    document.getElementById('viswa-calc-amount-display').innerText = `₹${val.toLocaleString('en-IN')}`;
  }
  if (document.getElementById('viswa-calc-user-paid')) {
    document.getElementById('viswa-calc-user-paid').innerText = `₹${paid11.toLocaleString('en-IN')}`;
  }
  if (document.getElementById('viswa-calc-bonus')) {
    document.getElementById('viswa-calc-bonus').innerText = `+ ₹${bonus.toLocaleString('en-IN')}`;
  }
  if (document.getElementById('viswa-calc-total-maturity')) {
    document.getElementById('viswa-calc-total-maturity').innerText = `₹${totalMaturity.toLocaleString('en-IN')}`;
  }
  if (document.getElementById('viswa-calc-gold-grams')) {
    document.getElementById('viswa-calc-gold-grams').innerText = `~${estGrams} Grams 22KT Gold`;
  }
  if (document.getElementById('viswa-btn-monthly-val')) {
    document.getElementById('viswa-btn-monthly-val').innerText = val.toLocaleString('en-IN');
  }
}

function openNandiniEnrollModal() {
  const modal = document.getElementById('viswa-enroll-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeNandiniEnrollModal() {
  document.getElementById('viswa-enroll-modal')?.classList.add('hidden');
}

async function submitViswaEnrollment(e) {
  e.preventDefault();
  const name = document.getElementById('viswa-enroll-name').value;
  const phone = document.getElementById('viswa-enroll-phone').value;
  const email = document.getElementById('viswa-enroll-email').value;
  const amount = document.getElementById('viswa-enroll-amount').value;
  const branch = document.getElementById('viswa-enroll-branch').value;

  try {
    const res = await StoreAPI.enrollScheme({
      brand: 'viswanandini',
      planName: 'Nandini Swarna Varsha (Bridal Chit Fund)',
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      monthlyAmount: amount,
      branch: branch
    });

    if (res.success) {
      alert(`✨ Congratulations Smt./Sri ${name}! You are successfully enrolled in Nandini Swarna Varsha (Account: ${res.scheme.id}). First installment of ₹${Number(amount).toLocaleString('en-IN')} recorded!`);
      closeNandiniEnrollModal();
    } else {
      alert(res.message || 'Enrollment error');
    }
  } catch (err) {
    alert('Error connecting to savings server');
  }
}

// ==========================================
// 6. VIP BRIDAL SUITE APPOINTMENT
// ==========================================
async function submitViswaAppointment(e) {
  e.preventDefault();
  const name = document.getElementById('viswa-apt-name').value;
  const phone = document.getElementById('viswa-apt-phone').value;
  const email = document.getElementById('viswa-apt-email').value;
  const date = document.getElementById('viswa-apt-date').value;
  const branch = document.getElementById('viswa-apt-branch').value;
  const budget = document.getElementById('viswa-apt-budget').value;

  try {
    const res = await StoreAPI.createAppointment({
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      preferredDate: date,
      branch: branch,
      budget: budget,
      serviceType: 'Viswanandini Royal Polki & Jadau Trousseau Consultation'
    });

    if (res.success) {
      alert(`👑 Bridal Suite Reserved for ${name} on ${date}! Our senior bridal jewellery concierge will contact you on ${phone} with private lounge access credentials.`);
      document.getElementById('viswa-appointment-form').reset();
    }
  } catch (err) {
    alert('Error booking appointment');
  }
}

// ==========================================
// 7. BIS HUID VERIFICATION
// ==========================================
async function verifyViswaHuid() {
  const input = document.getElementById('viswa-huid-input');
  const resultDiv = document.getElementById('viswa-huid-result');
  if (!input || !resultDiv) return;

  const huid = input.value.trim().toUpperCase();
  if (!huid) {
    resultDiv.innerHTML = `<span class="text-rose-600">Please enter an official HUID.</span>`;
    return;
  }

  resultDiv.innerHTML = `<div class="text-stone-500">Querying Bureau of Indian Standards Assaying Registry...</div>`;

  try {
    const res = await StoreAPI.verifyHuid(huid);
    if (res.success && res.verified) {
      resultDiv.innerHTML = `
        <div class="mt-4 p-5 rounded-2xl bg-[#fbf2f3] border border-[#781d2a]/30 text-left text-xs space-y-2">
          <div class="flex items-center justify-between border-b border-stone-200 pb-2">
            <span class="font-bold text-[#781d2a] flex items-center gap-1.5 text-sm">
              <span>🛡️</span> BIS HALLMARK AUTHENTICATED
            </span>
            <span class="font-mono font-bold bg-[#781d2a] text-white px-2.5 py-0.5 rounded-full">${res.huid}</span>
          </div>
          <p>Assay Center: <strong>${res.hallmarkCenter}</strong></p>
          <p>Purity Verified: <strong>${res.purityVerified}</strong></p>
          <p>Jeweller Enterprise: <strong>${res.jewellerName}</strong></p>
          <p>BIS License Code: <strong class="font-mono">${res.retailerLicense}</strong></p>
          <p class="text-[11px] text-emerald-700 font-semibold">✓ Certified Tamper-Proof Laser Stamped Marking</p>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `<div class="text-rose-600 mt-2">HUID verification returned unverified.</div>`;
    }
  } catch (e) {
    resultDiv.innerHTML = `<div class="text-rose-600 mt-2">Error verifying HUID.</div>`;
  }
}

// ==========================================
// 8. ROYAL BAG (CART) & CHECKOUT
// ==========================================
function updateViswaCartBadge() {
  const badge = document.getElementById('viswa-cart-count');
  if (badge) {
    const count = viswaState.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = count;
  }
  localStorage.setItem('viswa_cart', JSON.stringify(viswaState.cart));
}

function updateViswaWishlistBadge() {
  const badge = document.getElementById('viswa-wishlist-count');
  if (badge) {
    badge.innerText = viswaState.wishlist.length;
  }
  localStorage.setItem('viswa_wishlist', JSON.stringify(viswaState.wishlist));
}

function addViswaToCart(productId) {
  const prod = viswaState.allProducts.find(p => p.id === productId);
  if (!prod) return;

  const existing = viswaState.cart.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    viswaState.cart.push({
      productId: prod.id,
      name: prod.name,
      purity: prod.purity,
      price: prod.currentPrice,
      image: prod.images[0],
      quantity: 1
    });
  }

  updateViswaCartBadge();
  openCartDrawer();
}

function openCartDrawer() {
  const drawer = document.getElementById('viswa-cart-drawer');
  const itemsContainer = document.getElementById('viswa-cart-items');
  if (!drawer || !itemsContainer) return;

  if (viswaState.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="py-12 text-center text-stone-400">
        <p class="text-3xl mb-2">🛍️</p>
        <p class="text-xs">Your Royal Bag is currently empty.</p>
        <button onclick="closeCartDrawer()" class="mt-4 px-5 py-2 rounded-full viswa-btn text-xs font-bold">Discover Masterpieces</button>
      </div>
    `;
    updateCartTotals(0);
  } else {
    let subtotal = 0;
    itemsContainer.innerHTML = viswaState.cart.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      return `
        <div class="flex items-center gap-3 p-3 rounded-2xl bg-[#fcf9f2] border border-stone-200">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-xl border border-stone-300">
          <div class="flex-1 text-xs">
            <h5 class="font-serif font-bold text-stone-900 leading-tight">${item.name}</h5>
            <p class="text-stone-500 font-mono text-[11px] mt-0.5">₹${item.price.toLocaleString('en-IN')}</p>
            <div class="flex items-center gap-2 mt-2">
              <button onclick="changeCartQty('${item.productId}', -1)" class="w-5 h-5 bg-stone-200 rounded text-center leading-none">-</button>
              <span class="font-bold">${item.quantity}</span>
              <button onclick="changeCartQty('${item.productId}', 1)" class="w-5 h-5 bg-stone-200 rounded text-center leading-none">+</button>
              <button onclick="removeCartItem('${item.productId}')" class="text-rose-600 text-[10px] ml-auto hover:underline">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    updateCartTotals(subtotal);
  }

  drawer.classList.remove('hidden');
}

function closeCartDrawer() {
  document.getElementById('viswa-cart-drawer')?.classList.add('hidden');
}

function changeCartQty(productId, delta) {
  const item = viswaState.cart.find(i => i.productId === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      viswaState.cart = viswaState.cart.filter(i => i.productId !== productId);
    }
  }
  updateViswaCartBadge();
  openCartDrawer();
}

function removeCartItem(productId) {
  viswaState.cart = viswaState.cart.filter(i => i.productId !== productId);
  updateViswaCartBadge();
  openCartDrawer();
}

function updateCartTotals(total) {
  const subtotal = Math.round(total / 1.03); // Approximate pre-tax
  const gst = total - subtotal;

  if (document.getElementById('viswa-cart-subtotal')) {
    document.getElementById('viswa-cart-subtotal').innerText = `₹${subtotal.toLocaleString('en-IN')}`;
  }
  if (document.getElementById('viswa-cart-gst')) {
    document.getElementById('viswa-cart-gst').innerText = `₹${gst.toLocaleString('en-IN')}`;
  }
  if (document.getElementById('viswa-cart-grandtotal')) {
    document.getElementById('viswa-cart-grandtotal').innerText = `₹${total.toLocaleString('en-IN')}`;
  }
}

function openViswaCheckoutModal() {
  if (viswaState.cart.length === 0) {
    alert('Please add items to your royal bag first.');
    return;
  }
  closeCartDrawer();
  document.getElementById('viswa-checkout-modal')?.classList.remove('hidden');
}

function closeViswaCheckoutModal() {
  document.getElementById('viswa-checkout-modal')?.classList.add('hidden');
}

async function submitViswaOrder(e) {
  e.preventDefault();
  const name = document.getElementById('viswa-chk-name').value;
  const phone = document.getElementById('viswa-chk-phone').value;
  const email = document.getElementById('viswa-chk-email').value;
  const address = document.getElementById('viswa-chk-address').value;
  const city = document.getElementById('viswa-chk-city').value;
  const state = document.getElementById('viswa-chk-state').value;
  const pincode = document.getElementById('viswa-chk-pincode').value;
  const customer = { name, phone, email, address, city, state, pincode };

  // Calculate cart total
  let totalAmount = 0;
  viswaState.cart.forEach(item => {
    const prod = viswaState.products.find(p => p.id === item.productId);
    const price = prod?.pricing?.finalPrice || (item.price || 50000);
    totalAmount += price * item.quantity;
  });

  if (window.KJPaymentGateway && typeof window.KJPaymentGateway.openCheckout === 'function') {
    closeViswaCheckoutModal();
    window.KJPaymentGateway.openCheckout({
      brand: 'viswanandini',
      amount: totalAmount,
      customer: customer,
      items: viswaState.cart,
      onPaymentSuccess: async (payDetails) => {
        await executeFinalViswaOrder(customer, payDetails);
      },
      onCancel: () => {
        openViswaCheckoutModal();
      }
    });
    return;
  }

  await executeFinalViswaOrder(customer, { method: 'UPI (Viswanandini Bridal House)' });
}

async function executeFinalViswaOrder(customer, payDetails) {
  const orderPayload = {
    brand: 'viswanandini',
    customer: customer,
    items: viswaState.cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
    paymentMethod: payDetails?.method || 'UPI',
    paymentDetails: payDetails
  };

  try {
    const res = await StoreAPI.createOrder(orderPayload);
    if (res.success && res.order) {
      viswaState.cart = [];
      updateViswaCartBadge();
      closeViswaCheckoutModal();

      const invoiceUrl = `/invoice?orderId=${res.order.id}&brand=viswanandini`;
      if (confirm(`👑 Royal Bridal Order Placed Successfully!\n\nOrder ID: ${res.order.id}\nArmoured Transit Waybill: ${res.order.trackingNumber}\nPayment Ref: ${payDetails?.transactionId || 'TXN_VERIFIED'}\nTotal: ₹${res.order.summary.grandTotal.toLocaleString('en-IN')}\n\nClick OK to view and print your Official GST Hallmark Tax Invoice!`)) {
        window.location.href = invoiceUrl;
      }
    } else {
      alert(res.message || 'Error placing order');
    }
  } catch (err) {
    alert('Error connecting to order server');
  }
}

function toggleViswaWishlist(productId, e) {
  if (e) e.stopPropagation();
  const idx = viswaState.wishlist.indexOf(productId);
  if (idx > -1) {
    viswaState.wishlist.splice(idx, 1);
  } else {
    viswaState.wishlist.push(productId);
  }
  updateViswaWishlistBadge();
  renderViswaProductsGrid(viswaState.products);
}

function toggleWishlistDrawer() {
  alert(`Royal Wishlist holds ${viswaState.wishlist.length} selected pieces.`);
}

