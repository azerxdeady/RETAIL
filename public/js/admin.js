/**
 * KARTHIK JEWELLERS - EXECUTIVE ADMIN COMMAND CENTER & SHOPIFY THEME CUSTOMIZER
 * Complete Full-Stack Multi-Brand Operations Suite
 */

let adminState = {
  currentTab: 'overview',
  stats: null,
  products: [],
  orders: [],
  schemes: [],
  appointments: [],
  coupons: [],
  rates: null,
  customers: [],
  themeSettings: null,
  storeSettings: null,
  customizerBrand: 'karthik',
  editingProductId: null,
  previewDevice: '100%'
};

// --------------------------------------------------------------------------
// Initialization
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  await initAdmin();
  setupSyncListeners();
});

async function initAdmin() {
  setupAdminNavigation();
  setupLiveRateForm();
  setupProductForm();
  await loadAdminData();
}

async function loadAdminData() {
  try {
    // 1. Stats & Overview
    const statsRes = await StoreAPI.getAdminStats();
    if (statsRes.success) {
      adminState.stats = statsRes.stats;
      adminState.rates = statsRes.stats.rates;
      renderOverviewTab(statsRes.stats);
      populateRatesForm(statsRes.stats.rates);
    }

    // 2. Products
    const prodRes = await StoreAPI.getProducts();
    if (prodRes.success) {
      adminState.products = prodRes.products;
      renderProductsTab(prodRes.products);
    }

    // 3. Orders
    const ordRes = await StoreAPI.getOrders();
    if (ordRes.success) {
      adminState.orders = ordRes.orders;
      renderOrdersTab(ordRes.orders);
    }

    // 4. Schemes
    const schRes = await StoreAPI.getSchemes();
    if (schRes.success) {
      adminState.schemes = schRes.schemes;
      renderSchemesTab(schRes.schemes);
    }

    // 5. Appointments
    const aptRes = await StoreAPI.getAppointments();
    if (aptRes.success) {
      adminState.appointments = aptRes.appointments;
      renderAppointmentsTab(aptRes.appointments);
    }

    // 6. Coupons
    const cpnRes = await StoreAPI.getCoupons();
    if (cpnRes.success) {
      adminState.coupons = cpnRes.coupons;
      renderCouponsTab(cpnRes.coupons);
    }

    // 7. Customers Directory
    const custRes = await StoreAPI.getCustomers();
    if (custRes.success) {
      adminState.customers = custRes.customers;
      renderCustomersTab(custRes.customers);
    }

    // 8. Theme Settings (Shopify Customizer)
    const themeRes = await StoreAPI.getThemeSettings();
    if (themeRes.success) {
      adminState.themeSettings = themeRes.themeSettings;
      populateThemeCustomizerForm(themeRes.themeSettings[adminState.customizerBrand]);
    }

    // 9. Store Settings & Compliance
    const settRes = await StoreAPI.getStoreSettings();
    if (settRes.success) {
      adminState.storeSettings = settRes.settings;
      populateStoreSettingsForm(settRes.settings);
    }

  } catch (err) {
    console.error('Error loading admin ecosystem data:', err);
    showToast('Failed to load full admin dataset', 'error');
  }
}

// --------------------------------------------------------------------------
// Navigation & Tab Switching
// --------------------------------------------------------------------------
function setupAdminNavigation() {
  const tabs = document.querySelectorAll('.admin-nav-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });
}

function switchTab(tabId) {
  adminState.currentTab = tabId;

  document.querySelectorAll('.admin-nav-item').forEach(el => {
    const isActive = el.dataset.tab === tabId;
    el.classList.toggle('bg-[#c5a059]', isActive);
    el.classList.toggle('text-stone-950', isActive);
    el.classList.toggle('font-bold', isActive);
    el.classList.toggle('shadow-sm', isActive);
    el.classList.toggle('text-stone-300', !isActive);
    el.classList.toggle('hover:bg-stone-850', !isActive);
  });

  document.querySelectorAll('.admin-tab-section').forEach(sec => {
    sec.classList.toggle('hidden', sec.id !== `tab-${tabId}`);
  });

  if (tabId === 'theme') {
    // Ensure iframe is up-to-date
    updateThemePreviewLive();
  }
}

// --------------------------------------------------------------------------
// TAB 1: Overview Dashboard
// --------------------------------------------------------------------------
function renderOverviewTab(stats) {
  const revEl = document.getElementById('stat-total-revenue');
  const ordEl = document.getElementById('stat-total-orders');
  const prodEl = document.getElementById('stat-total-products');
  const schEl = document.getElementById('stat-active-schemes');

  if (revEl) revEl.innerText = formatINR(stats.totalRevenue);
  if (ordEl) ordEl.innerText = stats.totalOrders;
  if (prodEl) prodEl.innerText = stats.totalProducts;
  if (schEl) schEl.innerText = stats.activeSchemes;

  // Category Distribution Bar
  const catDistEl = document.getElementById('overview-category-distribution');
  if (catDistEl && stats.categoryCounts) {
    const total = stats.totalProducts || 1;
    catDistEl.innerHTML = Object.entries(stats.categoryCounts).map(([cat, count]) => {
      const pct = Math.round((count / total) * 100);
      return `
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs text-stone-300">
            <span class="capitalize font-semibold text-amber-200">${cat}</span>
            <span class="text-stone-400 font-mono">${count} pieces (${pct}%)</span>
          </div>
          <div class="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-[#c5a059] to-[#e8d7b8] rounded-full" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Recent Orders Mini Table
  const recentTableEl = document.getElementById('overview-recent-orders');
  if (recentTableEl && stats.recentOrders) {
    recentTableEl.innerHTML = stats.recentOrders.map(ord => `
      <tr class="border-b border-stone-800/60 text-xs text-stone-300 hover:bg-stone-800/40 transition">
        <td class="py-3 px-3 font-mono font-bold text-amber-200">${ord.id}</td>
        <td class="py-3 px-3 font-medium text-white">${ord.customer?.name || 'Patron'}</td>
        <td class="py-3 px-3 font-bold text-white font-mono">${formatINR(ord.summary?.grandTotal || 0)}</td>
        <td class="py-3 px-3">
          <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
            (ord.status || '').includes('Delivered') ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
            (ord.status || '').includes('Dispatched') ? 'bg-blue-950 text-blue-400 border border-blue-500/30' :
            'bg-amber-950 text-amber-300 border border-amber-500/30'
          }">
            ${ord.status}
          </span>
        </td>
        <td class="py-3 px-3 text-right">
          <a href="/invoice?orderId=${ord.id}" target="_blank" class="text-xs text-[#c5a059] hover:underline font-medium">Invoice ↗</a>
        </td>
      </tr>
    `).join('');
  }
}

// --------------------------------------------------------------------------
// TAB 2: Orders & Dispatch Management
// --------------------------------------------------------------------------
function renderOrdersTab(orders) {
  const container = document.getElementById('admin-orders-table');
  if (!container) return;

  const filterVal = document.getElementById('admin-order-filter')?.value || 'all';
  let displayed = orders;
  if (filterVal !== 'all') {
    displayed = orders.filter(o => (o.status || '').toLowerCase().includes(filterVal.toLowerCase()));
  }

  container.innerHTML = displayed.map(ord => {
    const isViswa = (ord.brand === 'viswanandini') || (ord.id && ord.id.includes('VJ'));
    return `
    <tr class="border-b border-stone-800/80 text-xs text-stone-300 hover:bg-stone-800/40 transition">
      <td class="py-3.5 px-3">
        <div class="flex items-center gap-1.5">
          <span class="font-mono font-bold text-amber-300">${ord.id}</span>
          <span class="px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${isViswa ? 'bg-[#781d2a] text-white' : 'bg-[#c5a059] text-stone-950'}">
            ${isViswa ? 'Viswanandini' : 'Karthik'}
          </span>
        </div>
        <div class="text-[10px] text-stone-400 font-mono">${new Date(ord.createdAt).toLocaleDateString('en-IN')}</div>
      </td>
      <td class="py-3.5 px-3">
        <div class="font-semibold text-white">${ord.customer?.name || 'Walk-in Patron'}</div>
        <div class="text-[10px] text-stone-400">${ord.customer?.phone || ''} | ${ord.customer?.city || 'Chennai'}</div>
      </td>
      <td class="py-3.5 px-3">
        <div class="font-semibold text-stone-200">${(ord.items || []).length} items</div>
        <div class="text-[10px] text-stone-400 line-clamp-1">${(ord.items || []).map(i => i.name).join(', ')}</div>
      </td>
      <td class="py-3.5 px-3">
        <div class="font-bold text-white font-mono">${formatINR(ord.summary?.grandTotal || 0)}</div>
        <div class="text-[10px] text-stone-400 font-light">${ord.payment?.method || 'Prepaid'}</div>
      </td>
      <td class="py-3.5 px-3">
        <div class="flex items-center gap-2">
          <select onchange="updateStatusDirect('${ord.id}', this.value)" class="bg-[#141822] border border-stone-700 rounded-full px-3 py-1 text-xs text-amber-200 focus:outline-none focus:border-[#c5a059]">
            <option value="Hallmarking Verified" ${ord.status === 'Hallmarking Verified' ? 'selected' : ''}>Hallmarking Verified</option>
            <option value="Crafting & Finishing" ${ord.status === 'Crafting & Finishing' ? 'selected' : ''}>Crafting & Finishing</option>
            <option value="Dispatched (Insured Transit)" ${ord.status === 'Dispatched (Insured Transit)' ? 'selected' : ''}>Dispatched (Insured Transit)</option>
            <option value="Delivered" ${ord.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${ord.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
          ${ord.status !== 'Delivered' && ord.status !== 'Dispatched (Insured Transit)' ? `
            <button onclick="fulfillAdminOrder('${ord.id}')" class="px-2.5 py-1 bg-blue-900/80 hover:bg-blue-800 text-blue-200 rounded-full text-[10px] font-bold transition whitespace-nowrap" title="Dispatch with Armoured Logistics">
              🚀 Fulfill
            </button>
          ` : ''}
        </div>
      </td>
      <td class="py-3.5 px-3 text-right">
        <a href="/invoice?orderId=${ord.id}" target="_blank" class="px-3.5 py-1.5 bg-[#c5a059] text-stone-950 font-bold rounded-full text-xs hover:bg-[#d4af37] transition inline-block">
          Tax Invoice 📄
        </a>
      </td>
    </tr>
  `}).join('');
}

function filterAdminOrders() {
  if (adminState.orders) {
    renderOrdersTab(adminState.orders);
  }
}

async function updateStatusDirect(orderId, newStatus) {
  try {
    const res = await StoreAPI.updateOrder(orderId, { status: newStatus });
    if (res.success) {
      showToast(`Order ${orderId} updated to: ${newStatus}`, 'success');
      const ordRes = await StoreAPI.getOrders();
      if (ordRes.success) {
        adminState.orders = ordRes.orders;
        renderOrdersTab(ordRes.orders);
      }
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
}

async function fulfillAdminOrder(orderId) {
  const trackingNumber = prompt('Enter BVC Logistics Armoured Tracking Number (or leave blank for auto-generated code):', `BVC-TN-${Date.now().toString().slice(-6)}`);
  if (trackingNumber === null) return;

  try {
    const res = await StoreAPI.fulfillOrder(orderId, trackingNumber);
    if (res.success) {
      showToast(`Order ${orderId} dispatched via BVC Armoured Transit (${res.order.trackingNumber})!`, 'success');
      const ordRes = await StoreAPI.getOrders();
      if (ordRes.success) {
        adminState.orders = ordRes.orders;
        renderOrdersTab(ordRes.orders);
      }
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Failed to fulfill order', 'error');
  }
}

// --------------------------------------------------------------------------
// TAB 3: Products & Inventory Catalog
// --------------------------------------------------------------------------
function renderProductsTab(products) {
  const container = document.getElementById('admin-products-table');
  if (!container) return;

  const brandFilter = document.getElementById('admin-brand-filter')?.value || 'all';
  let displayed = products;
  if (brandFilter !== 'all') {
    displayed = products.filter(p => (p.brand || 'karthik').toLowerCase() === brandFilter.toLowerCase());
  }

  container.innerHTML = displayed.map(p => {
    const isViswa = (p.brand === 'viswanandini') || (p.sku && p.sku.startsWith('VJ'));
    return `
    <tr class="border-b border-stone-800/80 text-xs text-stone-300 hover:bg-stone-800/40 transition">
      <td class="py-3.5 px-3">
        <div class="flex items-center gap-3">
          <img src="${p.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80'}" alt="${p.name}" class="w-10 h-10 rounded-xl object-cover border border-stone-700 flex-shrink-0" />
          <div>
            <div class="flex items-center gap-2">
              <span class="font-serif font-bold text-white text-sm line-clamp-1">${p.name}</span>
              <span class="px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${isViswa ? 'bg-[#781d2a] text-white' : 'bg-[#c5a059] text-stone-950'}">
                ${isViswa ? 'Viswanandini' : 'Karthik'}
              </span>
            </div>
            <div class="text-[10px] text-stone-400 font-mono">SKU: ${p.sku} | HUID: ${p.huid || 'TN-BIS-916'}</div>
          </div>
        </div>
      </td>
      <td class="py-3.5 px-3">
        <span class="capitalize text-amber-200 font-medium">${p.category}</span>
        <div class="text-[10px] text-stone-400 font-semibold">${p.purity} (${p.metal})</div>
      </td>
      <td class="py-3.5 px-3 font-mono">
        <div>Gross: <strong>${p.grossWeight}g</strong></div>
        <div class="text-amber-300 font-semibold">Net Gold: ${p.netWeight}g</div>
      </td>
      <td class="py-3.5 px-3">
        <div class="text-white font-bold font-mono text-sm">${formatINR(p.currentPrice)}</div>
        <div class="text-[10px] text-stone-400">Making: ${p.makingChargeValue}${p.makingChargeType === 'percentage' ? '%' : ' ₹/g'}</div>
      </td>
      <td class="py-3.5 px-3">
        <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${p.inStock ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'}">
          ${p.inStock ? `${p.stockCount} in Stock` : 'Out of Stock'}
        </span>
      </td>
      <td class="py-3.5 px-3 text-right">
        <div class="flex items-center justify-end gap-2">
          <button onclick="editProduct('${p.id}')" class="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-full font-semibold text-xs transition">
            Edit
          </button>
          <button onclick="deleteProduct('${p.id}')" class="px-3 py-1 bg-rose-950/70 hover:bg-rose-900 text-rose-400 rounded-full font-semibold text-xs transition">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `}).join('');
}

function filterAdminProducts() {
  if (adminState.products) {
    renderProductsTab(adminState.products);
  }
}

function setupProductForm() {
  const form = document.getElementById('add-product-form');
  if (!form) return;

  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAddProductModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAddProductModal();
  });

  ['prod-purity', 'prod-gross-weight', 'prod-net-weight', 'prod-stone-price', 'prod-mc-val', 'prod-mc-type'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateAdminProductPreview);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productPayload = {
      brand: document.getElementById('prod-brand')?.value || 'karthik',
      name: document.getElementById('prod-name').value,
      category: document.getElementById('prod-category').value,
      purity: document.getElementById('prod-purity').value,
      metal: document.getElementById('prod-metal').value,
      grossWeight: Number(document.getElementById('prod-gross-weight').value),
      netWeight: Number(document.getElementById('prod-net-weight').value),
      stoneWeight: Number(document.getElementById('prod-stone-weight').value || 0),
      stoneType: document.getElementById('prod-stone-type').value || 'None',
      stonePrice: Number(document.getElementById('prod-stone-price').value || 0),
      makingChargeType: document.getElementById('prod-mc-type').value,
      makingChargeValue: Number(document.getElementById('prod-mc-val').value),
      stockCount: Number(document.getElementById('prod-stock').value || 5),
      inStock: true,
      isFeatured: document.getElementById('prod-featured').checked,
      isBestseller: document.getElementById('prod-bestseller').checked,
      description: document.getElementById('prod-desc').value,
      images: [
        document.getElementById('prod-image').value.trim() || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        ...(document.getElementById('prod-image-secondary')?.value.trim() ? [document.getElementById('prod-image-secondary').value.trim()] : [])
      ]
    };

    try {
      if (adminState.editingProductId) {
        const res = await StoreAPI.updateProduct(adminState.editingProductId, productPayload);
        if (res.success) {
          showToast('Product updated successfully!', 'success');
          closeAddProductModal();
          await refreshProducts();
        } else {
          showToast(res.message, 'error');
        }
      } else {
        const res = await StoreAPI.createProduct(productPayload);
        if (res.success) {
          showToast('New fine jewellery piece added to catalog!', 'success');
          closeAddProductModal();
          await refreshProducts();
        } else {
          showToast(res.message, 'error');
        }
      }
    } catch (err) {
      showToast('Error saving product', 'error');
    }
  });
}

function calculateAdminProductPreview() {
  const purity = document.getElementById('prod-purity')?.value || '22KT';
  const netWeight = parseFloat(document.getElementById('prod-net-weight')?.value) || 0;
  const grossWeight = parseFloat(document.getElementById('prod-gross-weight')?.value) || netWeight;
  const stonePrice = parseFloat(document.getElementById('prod-stone-price')?.value) || 0;
  const mcType = document.getElementById('prod-mc-type')?.value || 'percentage';
  const mcVal = parseFloat(document.getElementById('prod-mc-val')?.value) || 0;

  const rates = adminState.rates || { gold24k: 7850, gold22k: 7215, gold18k: 5910, silver: 94 };
  let metalRate = rates.gold22k;
  if (purity.includes('24')) metalRate = rates.gold24k;
  else if (purity.includes('18')) metalRate = rates.gold18k;
  else if (purity.includes('Silver')) metalRate = rates.silver;

  const metalVal = Math.round(netWeight * metalRate);
  let mc = mcType === 'perGram' ? Math.round(grossWeight * mcVal) : Math.round(metalVal * (mcVal / 100));
  const subtotal = metalVal + mc + stonePrice;
  const gst = Math.round(subtotal * 0.03);
  const total = subtotal + gst;

  const previewEl = document.getElementById('prod-price-preview');
  if (previewEl) {
    previewEl.innerHTML = `
      Estimated Retail: <strong class="text-amber-300 text-sm font-mono">${formatINR(total)}</strong>
      (Metal: ${formatINR(metalVal)} + MC: ${formatINR(mc)} + GST 3%: ${formatINR(gst)})
    `;
  }
}

async function refreshProducts() {
  const res = await StoreAPI.getProducts();
  if (res.success) {
    adminState.products = res.products;
    renderProductsTab(res.products);
  }
}

function openAddProductModal() {
  adminState.editingProductId = null;
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('product-modal-title');
  const form = document.getElementById('add-product-form');

  if (title) title.innerText = 'Add New Fine Jewellery Masterpiece';
  if (form) form.reset();

  if (document.getElementById('prod-image-secondary')) {
    document.getElementById('prod-image-secondary').value = '';
  }
  updateAdminProdImagePreviews();

  calculateAdminProductPreview();
  if (modal) modal.classList.remove('hidden');
}

function closeAddProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.add('hidden');
  adminState.editingProductId = null;
}

function updateAdminProdImagePreviews() {
  const priInput = document.getElementById('prod-image');
  const secInput = document.getElementById('prod-image-secondary');
  const priPrev = document.getElementById('prod-image-preview');
  const secPrev = document.getElementById('prod-image-secondary-preview');
  const fallback = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';

  if (priPrev) {
    const val = priInput?.value?.trim();
    priPrev.src = val || fallback;
  }
  if (secPrev) {
    const val = secInput?.value?.trim();
    secPrev.src = val || priInput?.value?.trim() || fallback;
  }
}

function selectAdminPhotoPreset(url, event) {
  const priInput = document.getElementById('prod-image');
  const secInput = document.getElementById('prod-image-secondary');

  if (event && event.altKey) {
    // Alt + Click explicitly assigns to Secondary
    if (secInput) secInput.value = url;
    showToast('✨ Alternate (hover) angle photo updated', 'info');
  } else if (priInput && priInput.value.trim() && (!secInput || !secInput.value.trim())) {
    // If primary is already set and secondary is empty, set secondary
    if (secInput) secInput.value = url;
    showToast('✨ Alternate (hover) angle photo set', 'info');
  } else {
    // Set primary
    if (priInput) priInput.value = url;
    showToast('✨ Primary angle photo set', 'info');
  }
  updateAdminProdImagePreviews();
}

function setAdminHeroImage(url) {
  const input = document.getElementById('theme-hero-image');
  const prev = document.getElementById('theme-hero-img-preview');
  if (input) input.value = url;
  if (prev) prev.src = url;
  updateThemePreviewLive();
  showToast('✨ Hero showcase banner image updated', 'info');
}

function editProduct(productId) {
  const p = adminState.products.find(item => item.id === productId);
  if (!p) return;

  adminState.editingProductId = productId;
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('product-modal-title');

  if (title) title.innerText = `Edit Masterpiece: ${p.name}`;

  if (document.getElementById('prod-brand')) {
    document.getElementById('prod-brand').value = p.brand || (p.sku && p.sku.startsWith('VJ') ? 'viswanandini' : 'karthik');
  }
  document.getElementById('prod-name').value = p.name;
  document.getElementById('prod-category').value = p.category;
  document.getElementById('prod-purity').value = p.purity;
  document.getElementById('prod-metal').value = p.metal;
  document.getElementById('prod-gross-weight').value = p.grossWeight;
  document.getElementById('prod-net-weight').value = p.netWeight;
  document.getElementById('prod-stone-weight').value = p.stoneWeight || 0;
  document.getElementById('prod-stone-type').value = p.stoneType || 'None';
  document.getElementById('prod-stone-price').value = p.stonePrice || 0;
  document.getElementById('prod-mc-type').value = p.makingChargeType || 'percentage';
  document.getElementById('prod-mc-val').value = p.makingChargeValue || 12;
  document.getElementById('prod-stock').value = p.stockCount || 5;
  document.getElementById('prod-featured').checked = Boolean(p.isFeatured);
  document.getElementById('prod-bestseller').checked = Boolean(p.isBestseller);
  document.getElementById('prod-image').value = p.images?.[0] || '';
  if (document.getElementById('prod-image-secondary')) {
    document.getElementById('prod-image-secondary').value = p.images?.[1] || '';
  }
  document.getElementById('prod-desc').value = p.description || '';

  updateAdminProdImagePreviews();
  calculateAdminProductPreview();
  if (modal) modal.classList.remove('hidden');
}

async function deleteProduct(productId) {
  if (!confirm(`Are you sure you want to remove this piece from Karthik Jewellers catalog?`)) return;

  try {
    const res = await StoreAPI.deleteProduct(productId);
    if (res.success) {
      showToast('Product removed from catalog', 'info');
      await refreshProducts();
    } else {
      showToast(res.message, 'error');
    }
  } catch (e) {
    showToast('Failed to delete product', 'error');
  }
}

// --------------------------------------------------------------------------
// TAB 4: Customers Directory (Patron CRM)
// --------------------------------------------------------------------------
function renderCustomersTab(customers) {
  const container = document.getElementById('admin-customers-table');
  if (!container) return;

  const searchVal = (document.getElementById('cust-search-input')?.value || '').toLowerCase().trim();
  let displayed = customers;
  if (searchVal) {
    displayed = customers.filter(c => 
      (c.name || '').toLowerCase().includes(searchVal) ||
      (c.phone || '').toLowerCase().includes(searchVal) ||
      (c.city || '').toLowerCase().includes(searchVal) ||
      (c.email || '').toLowerCase().includes(searchVal)
    );
  }

  container.innerHTML = displayed.map(c => `
    <tr class="border-b border-stone-800/80 text-xs text-stone-300 hover:bg-stone-800/40 transition">
      <td class="py-3.5 px-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#8c6a23] text-stone-950 font-bold flex items-center justify-center font-serif text-xs">
            ${(c.name || 'P').charAt(0)}
          </div>
          <div>
            <div class="font-serif font-bold text-white text-sm">${c.name}</div>
            <div class="text-[10px] text-stone-400 font-mono">${c.id}</div>
          </div>
        </div>
      </td>
      <td class="py-3.5 px-3">
        <div class="font-mono text-white">${c.phone || 'N/A'}</div>
        <div class="text-[10px] text-stone-400">${c.email || 'No email registered'} • <span class="text-amber-200 font-semibold">${c.city || 'Chennai'}</span></div>
      </td>
      <td class="py-3.5 px-3 font-mono">
        <span class="font-bold text-white text-sm">${c.totalOrders || 0}</span> orders
      </td>
      <td class="py-3.5 px-3">
        <div class="font-mono font-bold text-amber-300 text-sm">${formatINR(c.totalSpent || 0)}</div>
        <div class="text-[10px] text-stone-400">Total Ecosystem Spend</div>
      </td>
      <td class="py-3.5 px-3">
        <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
          (c.schemes && c.schemes.length > 0) ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-stone-900 text-stone-400 border border-stone-800'
        }">
          ${(c.schemes && c.schemes.length > 0) ? `${c.schemes.length} Active Chit(s)` : 'No Chit Account'}
        </span>
      </td>
      <td class="py-3.5 px-3 text-right">
        <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          c.tier === 'Royal Gold Elite' ? 'bg-gradient-to-r from-[#d4af37] to-[#ecc874] text-stone-950 font-black shadow' :
          'bg-stone-800 text-stone-300 border border-stone-700'
        }">
          ★ ${c.tier || 'Fine Patron'}
        </span>
      </td>
    </tr>
  `).join('');
}

function filterAdminCustomers() {
  if (adminState.customers) {
    renderCustomersTab(adminState.customers);
  }
}

// --------------------------------------------------------------------------
// TAB 5: Swarna Nidhi Schemes (Gold Chits)
// --------------------------------------------------------------------------
function renderSchemesTab(schemes) {
  const container = document.getElementById('admin-schemes-table');
  if (!container) return;

  container.innerHTML = schemes.map(s => `
    <tr class="border-b border-stone-800/80 text-xs text-stone-300 hover:bg-stone-800/40 transition">
      <td class="py-3.5 px-3">
        <div class="font-mono font-bold text-amber-300">${s.id}</div>
        <div class="text-[10px] text-stone-400 font-light">${s.branch}</div>
      </td>
      <td class="py-3.5 px-3">
        <div class="font-semibold text-white">${s.customerName}</div>
        <div class="text-[10px] text-stone-400">${s.customerPhone}</div>
      </td>
      <td class="py-3.5 px-3 font-mono">
        <div>Installment: <strong>${formatINR(s.monthlyAmount)}</strong>/mo</div>
        <div class="text-emerald-400 text-[10px]">Bonus on Maturity: +${formatINR(s.bonusAmount)}</div>
      </td>
      <td class="py-3.5 px-3">
        <div class="flex items-center gap-2">
          <span class="font-bold text-white font-mono">${s.paidInstallments} / ${s.tenureMonths}</span>
          <div class="w-16 h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <div class="h-full bg-[#c5a059]" style="width: ${(s.paidInstallments / s.tenureMonths) * 100}%"></div>
          </div>
        </div>
        <div class="text-[10px] text-amber-200 mt-1 font-mono">Accumulated: <strong>${s.totalAccumulatedGoldGrams}g</strong></div>
      </td>
      <td class="py-3.5 px-3">
        <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${s.status.includes('Matured') ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-blue-950 text-blue-300 border border-blue-500/30'}">
          ${s.status}
        </span>
      </td>
      <td class="py-3.5 px-3 text-right">
        ${s.paidInstallments < s.tenureMonths ? `
          <button onclick="recordSchemePayment('${s.id}')" class="px-3.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-full font-bold text-xs transition">
            + Record Payment
          </button>
        ` : `
          <span class="text-xs text-emerald-400 font-semibold">Ready to Redeem</span>
        `}
      </td>
    </tr>
  `).join('');
}

async function recordSchemePayment(schemeId) {
  try {
    const res = await StoreAPI.paySchemeInstallment(schemeId);
    if (res.success) {
      showToast(res.message, 'success');
      const schRes = await StoreAPI.getSchemes();
      if (schRes.success) {
        adminState.schemes = schRes.schemes;
        renderSchemesTab(schRes.schemes);
      }
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Failed to record payment', 'error');
  }
}

// --------------------------------------------------------------------------
// TAB 6: VIP Concierge Appointments
// --------------------------------------------------------------------------
function renderAppointmentsTab(appointments) {
  const container = document.getElementById('admin-appointments-table');
  if (!container) return;

  container.innerHTML = appointments.map(a => `
    <tr class="border-b border-stone-800/80 text-xs text-stone-300 hover:bg-stone-800/40 transition">
      <td class="py-3.5 px-3">
        <div class="font-mono font-bold text-amber-300">${a.id}</div>
        <div class="text-[10px] text-stone-400">${a.serviceType}</div>
      </td>
      <td class="py-3.5 px-3">
        <div class="font-semibold text-white">${a.customerName}</div>
        <div class="text-[10px] text-stone-400">${a.customerPhone} | ${a.customerEmail}</div>
      </td>
      <td class="py-3.5 px-3">
        <div class="text-stone-200 font-medium">${a.branch}</div>
        <div class="text-[10px] text-stone-400">Date: ${a.preferredDate} at ${a.preferredTime}</div>
      </td>
      <td class="py-3.5 px-3">
        <div class="text-[11px] text-stone-300 max-w-xs truncate font-light">${a.notes || 'None'}</div>
        <div class="text-[10px] text-amber-300">Budget: ${a.budget || 'Open'}</div>
      </td>
      <td class="py-3.5 px-3">
        <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${a.status === 'Confirmed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'}">
          ${a.status}
        </span>
      </td>
      <td class="py-3.5 px-3 text-right">
        ${a.status !== 'Confirmed' ? `
          <button onclick="confirmAppointment('${a.id}')" class="px-3.5 py-1 bg-[#c5a059] text-stone-950 rounded-full font-bold text-xs hover:bg-[#d4af37] transition">
            Confirm Visit
          </button>
        ` : `
          <span class="text-xs text-emerald-400 font-semibold">Concierge Assigned</span>
        `}
      </td>
    </tr>
  `).join('');
}

async function confirmAppointment(id) {
  try {
    const res = await StoreAPI.updateAppointment(id, { status: 'Confirmed' });
    if (res.success) {
      showToast('VIP Consultation confirmed!', 'success');
      const aptRes = await StoreAPI.getAppointments();
      if (aptRes.success) {
        adminState.appointments = aptRes.appointments;
        renderAppointmentsTab(aptRes.appointments);
      }
    }
  } catch (e) {
    showToast('Failed to update appointment', 'error');
  }
}

// --------------------------------------------------------------------------
// TAB 7: Discounts & Coupons Engine
// --------------------------------------------------------------------------
function renderCouponsTab(coupons) {
  const container = document.getElementById('admin-coupons-table');
  if (!container) return;

  container.innerHTML = coupons.map(c => `
    <tr class="border-b border-stone-800/80 text-xs text-stone-300 hover:bg-stone-800/40 transition">
      <td class="py-3.5 px-3 font-mono font-bold text-amber-300 text-sm">${c.code}</td>
      <td class="py-3.5 px-3 capitalize text-white font-medium">${c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat Discount`}</td>
      <td class="py-3.5 px-3 font-mono">${formatINR(c.minOrderAmount)}</td>
      <td class="py-3.5 px-3 text-stone-400 font-light">${c.description || 'Promotional Discount'}</td>
      <td class="py-3.5 px-3">
        <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${c.brand === 'viswanandini' ? 'bg-[#781d2a] text-white' : 'bg-stone-800 text-amber-200'}">
          ${c.brand || 'all'}
        </span>
      </td>
      <td class="py-3.5 px-3 text-right">
        <button onclick="deleteAdminCoupon('${c.id}')" class="px-3 py-1 bg-rose-950/70 hover:bg-rose-900 text-rose-400 rounded-full font-semibold text-xs transition">
          Delete
        </button>
      </td>
    </tr>
  `).join('');
}

function openCreateCouponModal() {
  const modal = document.getElementById('coupon-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeCreateCouponModal() {
  const modal = document.getElementById('coupon-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleCreateCoupon(e) {
  e.preventDefault();
  const payload = {
    code: document.getElementById('cpn-code').value.toUpperCase().trim(),
    discountType: document.getElementById('cpn-type').value,
    discountValue: Number(document.getElementById('cpn-val').value),
    minOrderAmount: Number(document.getElementById('cpn-min').value || 0),
    maxDiscount: Number(document.getElementById('cpn-cap').value || 0),
    brand: document.getElementById('cpn-brand').value,
    description: document.getElementById('cpn-desc').value
  };

  try {
    const res = await StoreAPI.createCoupon(payload);
    if (res.success) {
      showToast(`Privilege Coupon ${payload.code} created!`, 'success');
      closeCreateCouponModal();
      const cpnRes = await StoreAPI.getCoupons();
      if (cpnRes.success) {
        adminState.coupons = cpnRes.coupons;
        renderCouponsTab(cpnRes.coupons);
      }
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Failed to create coupon', 'error');
  }
}

async function deleteAdminCoupon(id) {
  if (!confirm('Are you sure you want to deactivate this discount code?')) return;
  try {
    const res = await StoreAPI.deleteCoupon(id);
    if (res.success) {
      showToast('Coupon removed from ecosystem', 'info');
      const cpnRes = await StoreAPI.getCoupons();
      if (cpnRes.success) {
        adminState.coupons = cpnRes.coupons;
        renderCouponsTab(cpnRes.coupons);
      }
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Failed to delete coupon', 'error');
  }
}

// --------------------------------------------------------------------------
// TAB 8: SHOPIFY-STYLE LIVE THEME CUSTOMIZER
// --------------------------------------------------------------------------

const THEME_PRESETS = {
  imperial: {
    preset: 'imperial',
    typography: { headingFont: "'Cinzel', serif", bodyFont: "'Plus Jakarta Sans', sans-serif", headingScale: 'large', letterSpacing: 'normal' },
    colors: { primaryGold: '#D4AF37', richGold: '#C5A059' },
    header: { style: 'glass', sticky: true, showSearch: true, showCategoryNav: true, showVipLounge: true },
    hero: { layout: 'split', height: 'medium', textAlignment: 'left' },
    productGrid: { columns: 4, cardStyle: 'elevated', cardRadius: '24px', imageRatio: 'portrait', showBadges: true, showPricing: true },
    buttons: { style: 'pill', radius: '9999px', hoverEffect: 'shimmer' },
    footer: { bgColor: '#0b0804', textColor: '#faecd0' },
    spacing: { density: 'comfortable' }
  },
  royal: {
    preset: 'royal',
    typography: { headingFont: "'Cormorant Garamond', Georgia, serif", bodyFont: "'Outfit', sans-serif", headingScale: 'large', letterSpacing: 'normal' },
    colors: { primaryGold: '#781D2A', richGold: '#3E070F' },
    header: { style: 'glass', sticky: true, showSearch: true, showCategoryNav: true, showVipLounge: true },
    hero: { layout: 'split', height: 'medium', textAlignment: 'left' },
    productGrid: { columns: 4, cardStyle: 'elevated', cardRadius: '24px', imageRatio: 'portrait', showBadges: true, showPricing: true },
    buttons: { style: 'pill', radius: '9999px', hoverEffect: 'shimmer' },
    footer: { bgColor: '#210d11', textColor: '#f7e7b4' },
    spacing: { density: 'comfortable' }
  },
  emerald: {
    preset: 'emerald',
    typography: { headingFont: "'Playfair Display', Georgia, serif", bodyFont: "'Plus Jakarta Sans', sans-serif", headingScale: 'large', letterSpacing: 'wide' },
    colors: { primaryGold: '#0D4A38', richGold: '#07261D' },
    header: { style: 'solid', sticky: true, showSearch: true, showCategoryNav: true, showVipLounge: true },
    hero: { layout: 'split', height: 'medium', textAlignment: 'left' },
    productGrid: { columns: 3, cardStyle: 'bordered', cardRadius: '12px', imageRatio: 'portrait', showBadges: true, showPricing: true },
    buttons: { style: 'rounded', radius: '12px', hoverEffect: 'lift' },
    footer: { bgColor: '#071812', textColor: '#e8f5ee' },
    spacing: { density: 'spacious' }
  },
  rose: {
    preset: 'rose',
    typography: { headingFont: "'Cormorant Garamond', Georgia, serif", bodyFont: "'Outfit', sans-serif", headingScale: 'large', letterSpacing: 'normal' },
    colors: { primaryGold: '#B76E79', richGold: '#4A1525' },
    header: { style: 'glass', sticky: true, showSearch: true, showCategoryNav: true, showVipLounge: true },
    hero: { layout: 'split', height: 'medium', textAlignment: 'left' },
    productGrid: { columns: 4, cardStyle: 'elevated', cardRadius: '24px', imageRatio: 'portrait', showBadges: true, showPricing: true },
    buttons: { style: 'pill', radius: '9999px', hoverEffect: 'shimmer' },
    footer: { bgColor: '#2a161f', textColor: '#faecd0' },
    spacing: { density: 'comfortable' }
  },
  obsidian: {
    preset: 'obsidian',
    typography: { headingFont: "'Cinzel', serif", bodyFont: "'Plus Jakarta Sans', sans-serif", headingScale: 'medium', letterSpacing: 'ultra-wide' },
    colors: { primaryGold: '#C0A062', richGold: '#14171F' },
    header: { style: 'transparent', sticky: false, showSearch: true, showCategoryNav: true, showVipLounge: true },
    hero: { layout: 'centered', height: 'medium', textAlignment: 'center' },
    productGrid: { columns: 4, cardStyle: 'flat', cardRadius: '0px', imageRatio: 'square', showBadges: true, showPricing: true },
    buttons: { style: 'square', radius: '0px', hoverEffect: 'lift' },
    footer: { bgColor: '#0d0f14', textColor: '#c0a062' },
    spacing: { density: 'compact' }
  }
};

function applyThemePreset(presetKey) {
  const p = THEME_PRESETS[presetKey];
  if (!p) return;

  const brand = adminState.customizerBrand || 'karthik';

  if (p.typography) {
    const hf = document.getElementById('theme-heading-font');
    const bf = document.getElementById('theme-body-font');
    const hs = document.getElementById('theme-heading-scale');
    const ls = document.getElementById('theme-letter-spacing');
    if (hf) hf.value = p.typography.headingFont;
    if (bf) bf.value = p.typography.bodyFont;
    if (hs) hs.value = p.typography.headingScale;
    if (ls) ls.value = p.typography.letterSpacing;
  }
  if (p.colors) {
    const colPri = p.colors.primaryGold;
    const colRich = p.colors.richGold;
    const cp = document.getElementById('theme-color-primary');
    const cpp = document.getElementById('theme-color-primary-picker');
    const cr = document.getElementById('theme-color-rich');
    const crp = document.getElementById('theme-color-rich-picker');
    if (cp) cp.value = colPri;
    if (cpp) cpp.value = colPri;
    if (cr) cr.value = colRich;
    if (crp) crp.value = colRich;
  }
  if (p.header) {
    const ns = document.getElementById('theme-nav-style');
    const nst = document.getElementById('theme-nav-sticky');
    const nsr = document.getElementById('theme-nav-search');
    const ncat = document.getElementById('theme-nav-categories');
    const nv = document.getElementById('theme-nav-vip');
    if (ns) ns.value = p.header.style;
    if (nst) nst.checked = p.header.sticky;
    if (nsr) nsr.checked = p.header.showSearch;
    if (ncat) ncat.checked = p.header.showCategoryNav;
    if (nv) nv.checked = p.header.showVipLounge;
  }
  if (p.hero) {
    const hl = document.getElementById('theme-hero-layout');
    const ha = document.getElementById('theme-hero-align');
    if (hl) hl.value = p.hero.layout;
    if (ha) ha.value = p.hero.textAlignment;
  }
  if (p.productGrid) {
    const gc = document.getElementById('theme-grid-cols');
    const cs = document.getElementById('theme-card-style');
    const cr = document.getElementById('theme-card-radius');
    const ir = document.getElementById('theme-image-ratio');
    if (gc) gc.value = String(p.productGrid.columns);
    if (cs) cs.value = p.productGrid.cardStyle;
    if (cr) cr.value = p.productGrid.cardRadius;
    if (ir) ir.value = p.productGrid.imageRatio;
  }
  if (p.buttons) {
    const bs = document.getElementById('theme-btn-shape');
    const bh = document.getElementById('theme-btn-hover');
    if (bs) bs.value = p.buttons.style;
    if (bh) bh.value = p.buttons.hoverEffect;
  }
  if (p.footer) {
    const fbg = document.getElementById('theme-footer-bg');
    const fc = document.getElementById('theme-footer-color');
    if (fbg) fbg.value = p.footer.bgColor;
    if (fc) fc.value = p.footer.textColor;
  }
  if (p.spacing) {
    const sd = document.getElementById('theme-spacing-density');
    if (sd) sd.value = p.spacing.density;
  }

  showToast(`✨ Applied Preset: ${presetKey.toUpperCase()}`, 'info');
  updateThemePreviewLive();
}

function setCustomizerBrand(brand) {
  adminState.customizerBrand = brand;

  // Toggle active styling on brand buttons
  const isKarthik = brand === 'karthik';
  const karthikBtn = document.getElementById('theme-brand-karthik');
  const viswaBtn = document.getElementById('theme-brand-viswa');

  if (karthikBtn) {
    karthikBtn.className = isKarthik ? 
      'px-3.5 py-1.5 rounded-xl transition bg-[#c5a059] text-stone-950 font-bold shadow' : 
      'px-3.5 py-1.5 rounded-xl transition text-stone-400 hover:text-white';
  }
  if (viswaBtn) {
    viswaBtn.className = !isKarthik ? 
      'px-3.5 py-1.5 rounded-xl transition bg-[#781d2a] text-white font-bold shadow border border-amber-400/40' : 
      'px-3.5 py-1.5 rounded-xl transition text-rose-300 hover:text-white';
  }

  // Update preview URL and external links
  const previewUrl = isKarthik ? '/' : '/viswanandini';
  const fullUrl = `http://localhost:5000${previewUrl}`;
  const indEl = document.getElementById('preview-url-indicator');
  const linkEl = document.getElementById('preview-external-link');
  const iframe = document.getElementById('theme-preview-iframe');

  if (indEl) indEl.innerText = fullUrl;
  if (linkEl) linkEl.href = previewUrl;
  if (iframe) iframe.src = previewUrl;

  // Populate inputs for selected brand
  if (adminState.themeSettings && adminState.themeSettings[brand]) {
    populateThemeCustomizerForm(adminState.themeSettings[brand]);
  }
}

function populateThemeCustomizerForm(theme) {
  if (!theme) return;

  // 1. Announcement
  const annEn = document.getElementById('theme-ann-enabled');
  const annText = document.getElementById('theme-ann-text');
  const annBg = document.getElementById('theme-ann-bgcolor');
  const annColor = document.getElementById('theme-ann-textcolor');

  if (annEn) annEn.checked = Boolean(theme.announcement?.enabled !== false);
  if (annText) annText.value = theme.announcement?.text || '';
  if (annBg) annBg.value = theme.announcement?.bgColor || '#141007';
  if (annColor) annColor.value = theme.announcement?.textColor || '#faecd0';

  // 2. Brand Identity & Header
  const bName = document.getElementById('theme-brand-name');
  const bMonogram = document.getElementById('theme-monogram-char');
  const bTagline = document.getElementById('theme-brand-tagline');
  const bVip = document.getElementById('theme-vip-btn-text');

  if (bName) bName.value = theme.brandName || '';
  if (bMonogram) bMonogram.value = theme.monogramChar || (adminState.customizerBrand === 'viswanandini' ? 'V' : 'K');
  if (bTagline) bTagline.value = theme.brandTagline || '';
  if (bVip) bVip.value = theme.header?.vipLoungeText || '✨ VIP Lounge';

  // 3. Typography
  const hFont = document.getElementById('theme-heading-font');
  const bFont = document.getElementById('theme-body-font');
  const hScale = document.getElementById('theme-heading-scale');
  const lSpacing = document.getElementById('theme-letter-spacing');

  if (hFont) hFont.value = theme.typography?.headingFont || "'Cinzel', serif";
  if (bFont) bFont.value = theme.typography?.bodyFont || "'Plus Jakarta Sans', sans-serif";
  if (hScale) hScale.value = theme.typography?.headingScale || 'large';
  if (lSpacing) lSpacing.value = theme.typography?.letterSpacing || 'normal';

  // 4. Navigation Architecture
  const nStyle = document.getElementById('theme-nav-style');
  const nSticky = document.getElementById('theme-nav-sticky');
  const nSearch = document.getElementById('theme-nav-search');
  const nCat = document.getElementById('theme-nav-categories');
  const nVip = document.getElementById('theme-nav-vip');

  if (nStyle) nStyle.value = theme.header?.style || 'glass';
  if (nSticky) nSticky.checked = Boolean(theme.header?.sticky !== false);
  if (nSearch) nSearch.checked = Boolean(theme.header?.showSearch !== false);
  if (nCat) nCat.checked = Boolean(theme.header?.showCategoryNav !== false);
  if (nVip) nVip.checked = Boolean(theme.header?.showVipLounge !== false);

  // 5. Editorial Hero Banner
  const hLayout = document.getElementById('theme-hero-layout');
  const hAlign = document.getElementById('theme-hero-align');
  const hEyebrow = document.getElementById('theme-hero-eyebrow');
  const hPart1 = document.getElementById('theme-hero-part1');
  const hShimmer = document.getElementById('theme-hero-shimmer');
  const hSub = document.getElementById('theme-hero-subheading');
  const hBtn1 = document.getElementById('theme-hero-btn1');
  const hBtn2 = document.getElementById('theme-hero-btn2');

  if (hLayout) hLayout.value = theme.hero?.layout || 'split';
  if (hAlign) hAlign.value = theme.hero?.textAlignment || 'left';
  if (hEyebrow) hEyebrow.value = theme.hero?.eyebrowText || '';
  if (hPart1) hPart1.value = theme.hero?.headingPart1 || '';
  if (hShimmer) hShimmer.value = theme.hero?.headingShimmer || '';
  if (hSub) hSub.value = theme.hero?.subheading || '';
  if (hBtn1) hBtn1.value = theme.hero?.primaryBtnText || 'Explore Masterpieces';
  if (hBtn2) hBtn2.value = theme.hero?.secondaryBtnText || 'Live Gold Rates';

  const hImg = document.getElementById('theme-hero-image');
  const hImgPrev = document.getElementById('theme-hero-img-preview');
  const defaultHeroImg = adminState.customizerBrand === 'viswanandini' 
    ? 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80'
    : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';

  if (hImg) hImg.value = theme.hero?.imageUrl || defaultHeroImg;
  if (hImgPrev) hImgPrev.src = theme.hero?.imageUrl || defaultHeroImg;

  // 6. Color Palette Tokens
  const cPri = document.getElementById('theme-color-primary');
  const cPriPick = document.getElementById('theme-color-primary-picker');
  const cRich = document.getElementById('theme-color-rich');
  const cRichPick = document.getElementById('theme-color-rich-picker');

  const pColor = theme.colors?.primaryGold || theme.colors?.royalBurgundy || (adminState.customizerBrand === 'viswanandini' ? '#781D2A' : '#D4AF37');
  const rColor = theme.colors?.richGold || theme.colors?.burgundyDark || (adminState.customizerBrand === 'viswanandini' ? '#3E070F' : '#C5A059');

  if (cPri) cPri.value = pColor;
  if (cPriPick) cPriPick.value = pColor;
  if (cRich) cRich.value = rColor;
  if (cRichPick) cRichPick.value = rColor;

  // 7. Product Grid & Cards
  const gCols = document.getElementById('theme-grid-cols');
  const cStyle = document.getElementById('theme-card-style');
  const cRadius = document.getElementById('theme-card-radius');
  const iRatio = document.getElementById('theme-image-ratio');
  const gBadges = document.getElementById('theme-grid-badges');
  const gPrice = document.getElementById('theme-grid-price');

  if (gCols) gCols.value = String(theme.productGrid?.columns || 4);
  if (cStyle) cStyle.value = theme.productGrid?.cardStyle || 'elevated';
  if (cRadius) cRadius.value = theme.productGrid?.cardRadius || '24px';
  if (iRatio) iRatio.value = theme.productGrid?.imageRatio || 'portrait';
  if (gBadges) gBadges.checked = Boolean(theme.productGrid?.showBadges !== false);
  if (gPrice) gPrice.checked = Boolean(theme.productGrid?.showPricing !== false);

  // 8. Button Styling
  const bShape = document.getElementById('theme-btn-shape');
  const bHover = document.getElementById('theme-btn-hover');

  if (bShape) bShape.value = theme.buttons?.style || 'pill';
  if (bHover) bHover.value = theme.buttons?.hoverEffect || 'shimmer';

  // 9. Spacing
  const sDensity = document.getElementById('theme-spacing-density');
  if (sDensity) sDensity.value = theme.spacing?.density || 'comfortable';

  // 10. Footer
  const fBg = document.getElementById('theme-footer-bg');
  const fColor = document.getElementById('theme-footer-color');
  const fCopy = document.getElementById('theme-footer-copyright');

  if (fBg) fBg.value = theme.footer?.bgColor || (adminState.customizerBrand === 'viswanandini' ? '#210d11' : '#0b0804');
  if (fColor) fColor.value = theme.footer?.textColor || (adminState.customizerBrand === 'viswanandini' ? '#f7e7b4' : '#faecd0');
  if (fCopy) fCopy.value = theme.footer?.copyrightText || (adminState.customizerBrand === 'viswanandini' ? '© 2026 Viswanandini Jewellers. All Rights Reserved.' : '© 2026 Karthik Jewellers Private Limited. All Rights Reserved.');

  // 11. Feature Flags
  const fAr = document.getElementById('theme-feat-ar');
  const fHuid = document.getElementById('theme-feat-huid');
  const fChits = document.getElementById('theme-feat-chits');
  const fTracker = document.getElementById('theme-feat-tracker');

  if (fAr) fAr.checked = Boolean(theme.features?.showArTryOn ?? true);
  if (fHuid) fHuid.checked = Boolean(theme.features?.showHuidVerifier ?? true);
  if (fChits) fChits.checked = Boolean(theme.features?.showSwarnaNidhiChits ?? true);
  if (fTracker) fTracker.checked = Boolean(theme.features?.showOrderTracker ?? true);
}

function getThemeFormValues() {
  const brand = adminState.customizerBrand || 'karthik';
  const current = (adminState.themeSettings && adminState.themeSettings[brand]) ? JSON.parse(JSON.stringify(adminState.themeSettings[brand])) : {};

  current.brandName = document.getElementById('theme-brand-name')?.value || current.brandName || (brand === 'viswanandini' ? 'Viswanandini Jewellers' : 'Karthik Jewellers');
  current.monogramChar = document.getElementById('theme-monogram-char')?.value || current.monogramChar || (brand === 'viswanandini' ? 'V' : 'K');
  current.brandTagline = document.getElementById('theme-brand-tagline')?.value || current.brandTagline || '';

  current.announcement = {
    ...(current.announcement || {}),
    enabled: document.getElementById('theme-ann-enabled')?.checked ?? true,
    text: document.getElementById('theme-ann-text')?.value || '',
    bgColor: document.getElementById('theme-ann-bgcolor')?.value || '#141007',
    textColor: document.getElementById('theme-ann-textcolor')?.value || '#faecd0'
  };

  current.header = {
    ...(current.header || {}),
    style: document.getElementById('theme-nav-style')?.value || 'glass',
    sticky: document.getElementById('theme-nav-sticky')?.checked ?? true,
    showSearch: document.getElementById('theme-nav-search')?.checked ?? true,
    showCategoryNav: document.getElementById('theme-nav-categories')?.checked ?? true,
    showVipLounge: document.getElementById('theme-nav-vip')?.checked ?? true,
    vipLoungeText: document.getElementById('theme-vip-btn-text')?.value || '✨ VIP Lounge'
  };

  current.typography = {
    ...(current.typography || {}),
    headingFont: document.getElementById('theme-heading-font')?.value || "'Cinzel', serif",
    bodyFont: document.getElementById('theme-body-font')?.value || "'Plus Jakarta Sans', sans-serif",
    headingScale: document.getElementById('theme-heading-scale')?.value || 'large',
    letterSpacing: document.getElementById('theme-letter-spacing')?.value || 'normal'
  };

  current.hero = {
    ...(current.hero || {}),
    layout: document.getElementById('theme-hero-layout')?.value || 'split',
    textAlignment: document.getElementById('theme-hero-align')?.value || 'left',
    eyebrowText: document.getElementById('theme-hero-eyebrow')?.value || '',
    headingPart1: document.getElementById('theme-hero-part1')?.value || '',
    headingShimmer: document.getElementById('theme-hero-shimmer')?.value || '',
    subheading: document.getElementById('theme-hero-subheading')?.value || '',
    primaryBtnText: document.getElementById('theme-hero-btn1')?.value || '',
    secondaryBtnText: document.getElementById('theme-hero-btn2')?.value || '',
    imageUrl: document.getElementById('theme-hero-image')?.value || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
  };

  if (!current.colors) current.colors = {};
  const priColor = document.getElementById('theme-color-primary')?.value || (brand === 'viswanandini' ? '#781D2A' : '#D4AF37');
  const richColor = document.getElementById('theme-color-rich')?.value || (brand === 'viswanandini' ? '#3E070F' : '#C5A059');

  if (brand === 'karthik') {
    current.colors.primaryGold = priColor;
    current.colors.richGold = richColor;
  } else {
    current.colors.royalBurgundy = priColor;
    current.colors.burgundyDark = richColor;
    current.colors.imperialGold = '#D4AF37';
  }

  const btnShape = document.getElementById('theme-btn-shape')?.value || 'pill';
  let btnRadius = '9999px';
  if (btnShape === 'rounded') btnRadius = '12px';
  else if (btnShape === 'square') btnRadius = '0px';

  current.buttons = {
    ...(current.buttons || {}),
    style: btnShape,
    radius: btnRadius,
    hoverEffect: document.getElementById('theme-btn-hover')?.value || 'shimmer'
  };

  current.productGrid = {
    ...(current.productGrid || {}),
    columns: Number(document.getElementById('theme-grid-cols')?.value || 4),
    cardStyle: document.getElementById('theme-card-style')?.value || 'elevated',
    cardRadius: document.getElementById('theme-card-radius')?.value || '24px',
    imageRatio: document.getElementById('theme-image-ratio')?.value || 'portrait',
    showBadges: document.getElementById('theme-grid-badges')?.checked ?? true,
    showPricing: document.getElementById('theme-grid-price')?.checked ?? true
  };

  current.spacing = {
    ...(current.spacing || {}),
    density: document.getElementById('theme-spacing-density')?.value || 'comfortable'
  };

  current.footer = {
    ...(current.footer || {}),
    bgColor: document.getElementById('theme-footer-bg')?.value || '#0b0804',
    textColor: document.getElementById('theme-footer-color')?.value || '#faecd0',
    copyrightText: document.getElementById('theme-footer-copyright')?.value || ''
  };

  current.features = {
    ...(current.features || {}),
    showArTryOn: document.getElementById('theme-feat-ar')?.checked ?? true,
    showHuidVerifier: document.getElementById('theme-feat-huid')?.checked ?? true,
    showSwarnaNidhiChits: document.getElementById('theme-feat-chits')?.checked ?? true,
    showOrderTracker: document.getElementById('theme-feat-tracker')?.checked ?? true
  };

  return current;
}

// Live Real-Time Viewport Injection (Zero reload required)
function updateThemePreviewLive() {
  const brand = adminState.customizerBrand || 'karthik';
  const updatedTheme = getThemeFormValues();

  // Save in local state
  if (!adminState.themeSettings) adminState.themeSettings = {};
  adminState.themeSettings[brand] = updatedTheme;

  // 1. Direct DOM injection into preview iframe for instant sub-millisecond response
  const iframe = document.getElementById('theme-preview-iframe');
  if (iframe && iframe.contentDocument) {
    try {
      const doc = iframe.contentDocument;

      // Announcement Bar
      const annBar = doc.getElementById('announcement-bar') || doc.getElementById('viswa-announcement-bar');
      const annText = doc.getElementById('announcement-bar-text') || doc.getElementById('viswa-announcement-bar-text');
      if (annBar) {
        annBar.style.display = updatedTheme.announcement.enabled ? 'block' : 'none';
        if (updatedTheme.announcement.bgColor) annBar.style.backgroundColor = updatedTheme.announcement.bgColor;
        if (updatedTheme.announcement.textColor) annBar.style.color = updatedTheme.announcement.textColor;
      }
      if (annText) annText.innerText = updatedTheme.announcement.text;

      // Brand Identity
      const monogram = doc.getElementById('navbar-brand-monogram') || doc.getElementById('viswa-brand-monogram');
      const bName = doc.getElementById('navbar-brand-name') || doc.getElementById('viswa-brand-name');
      const bTag = doc.getElementById('navbar-brand-tagline') || doc.getElementById('viswa-brand-tagline');
      const vipBtn = doc.getElementById('vip-lounge-btn') || doc.getElementById('viswa-vip-lounge-btn');

      if (monogram) monogram.innerText = updatedTheme.monogramChar;
      if (bName) bName.innerText = updatedTheme.brandName;
      if (bTag) bTag.innerText = updatedTheme.brandTagline;
      if (vipBtn && updatedTheme.header?.vipLoungeText) {
        vipBtn.innerText = updatedTheme.header.vipLoungeText;
      }

      // Typography CSS variables & classes
      if (updatedTheme.typography?.headingFont) {
        doc.documentElement.style.setProperty('--theme-heading-font', updatedTheme.typography.headingFont);
        doc.documentElement.style.setProperty('--font-serif', updatedTheme.typography.headingFont);
      }
      if (updatedTheme.typography?.bodyFont) {
        doc.documentElement.style.setProperty('--theme-body-font', updatedTheme.typography.bodyFont);
        doc.documentElement.style.setProperty('--font-sans', updatedTheme.typography.bodyFont);
      }

      // Button Radius
      if (updatedTheme.buttons?.radius) {
        doc.documentElement.style.setProperty('--theme-btn-radius', updatedTheme.buttons.radius);
      }

      // Card Radius & Style
      if (updatedTheme.productGrid?.cardRadius) {
        doc.documentElement.style.setProperty('--theme-card-radius', updatedTheme.productGrid.cardRadius);
      }

      // Colors
      const pri = updatedTheme.colors?.primaryGold || updatedTheme.colors?.royalBurgundy;
      const rich = updatedTheme.colors?.richGold || updatedTheme.colors?.burgundyDark;
      if (pri) doc.documentElement.style.setProperty('--theme-primary-gold', pri);
      if (rich) doc.documentElement.style.setProperty('--theme-rich-gold', rich);

      // Navigation Styling & Toggles
      const navbar = doc.getElementById('main-navbar') || doc.getElementById('viswa-navbar');
      if (navbar) {
        navbar.classList.remove('glass-nav', 'solid-nav', 'transparent-nav');
        const nStyle = updatedTheme.header?.style || 'glass';
        navbar.classList.add(`${nStyle}-nav`);

        if (updatedTheme.header?.sticky !== false) {
          navbar.classList.add('sticky', 'top-0');
        } else {
          navbar.classList.remove('sticky', 'top-0');
        }
      }

      const searchCont = doc.getElementById('search-container') || doc.getElementById('viswa-search-container');
      if (searchCont) {
        searchCont.style.display = updatedTheme.header?.showSearch !== false ? 'flex' : 'none';
      }

      const catNav = doc.getElementById('category-navbar') || doc.getElementById('viswa-category-navbar');
      if (catNav) {
        catNav.style.display = updatedTheme.header?.showCategoryNav !== false ? 'block' : 'none';
      }

      if (vipBtn) {
        vipBtn.style.display = updatedTheme.header?.showVipLounge !== false ? 'inline-flex' : 'none';
      }

      // Hero Elements
      const hEyebrow = doc.getElementById('hero-eyebrow-text') || doc.getElementById('viswa-hero-eyebrow');
      const hPart1 = doc.getElementById('hero-heading-part1') || doc.getElementById('viswa-hero-heading-part1');
      const hShimmer = doc.getElementById('hero-heading-shimmer') || doc.getElementById('viswa-hero-heading-shimmer');
      const hSub = doc.getElementById('hero-subtitle') || doc.getElementById('viswa-hero-subtitle');
      const cta1 = doc.getElementById('hero-cta-btn1') || doc.getElementById('viswa-hero-cta1');
      const cta2 = doc.getElementById('hero-cta-btn2') || doc.getElementById('viswa-hero-cta2');

      if (hEyebrow) hEyebrow.innerText = updatedTheme.hero?.eyebrowText || '';
      if (hPart1) hPart1.innerText = updatedTheme.hero?.headingPart1 || '';
      if (hShimmer) hShimmer.innerText = updatedTheme.hero?.headingShimmer || '';
      if (hSub) hSub.innerText = updatedTheme.hero?.subheading || '';
      if (cta1 && updatedTheme.hero?.primaryBtnText) cta1.innerText = updatedTheme.hero.primaryBtnText;
      if (cta2 && updatedTheme.hero?.secondaryBtnText) cta2.innerText = updatedTheme.hero.secondaryBtnText;

      // Hero Showcase Image
      const heroImg = doc.getElementById('hero-showcase-img') || doc.getElementById('viswa-hero-showcase-img');
      if (heroImg && updatedTheme.hero?.imageUrl) {
        heroImg.src = updatedTheme.hero.imageUrl;
      }

      // Hero alignment
      const heroText = doc.getElementById('hero-text-block') || doc.getElementById('viswa-hero-text-block');
      if (heroText && updatedTheme.hero?.textAlignment) {
        if (updatedTheme.hero.textAlignment === 'center') {
          heroText.classList.remove('text-left', 'lg:text-left');
          heroText.classList.add('text-center', 'mx-auto');
        } else {
          heroText.classList.remove('text-center', 'mx-auto');
          heroText.classList.add('text-left', 'lg:text-left');
        }
      }

      // Product Grid Columns
      const pGrid = doc.getElementById('products-grid') || doc.getElementById('viswa-products-grid');
      if (pGrid && updatedTheme.productGrid?.columns) {
        pGrid.classList.remove('xl:grid-cols-4', 'lg:grid-cols-3', 'sm:grid-cols-2', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4');
        const cols = updatedTheme.productGrid.columns;
        if (cols === 2) {
          pGrid.classList.add('grid-cols-1', 'sm:grid-cols-2');
        } else if (cols === 3) {
          pGrid.classList.add('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
        } else {
          pGrid.classList.add('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
        }
      }

      // Card Styles
      const cards = doc.querySelectorAll('.jewellery-card, .viswa-card');
      const cardStyle = updatedTheme.productGrid?.cardStyle || 'elevated';
      cards.forEach(c => {
        c.classList.remove('card-elevated', 'card-flat', 'card-bordered');
        c.classList.add(`card-${cardStyle}`);
      });

      // Density
      if (updatedTheme.spacing?.density) {
        doc.body.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
        doc.body.classList.add(`density-${updatedTheme.spacing.density}`);
      }

      // Footer
      const footer = doc.getElementById('main-footer') || doc.getElementById('viswa-footer');
      const footerCopy = doc.getElementById('footer-copyright') || doc.getElementById('viswa-footer-copyright');
      if (footer) {
        if (updatedTheme.footer?.bgColor) footer.style.backgroundColor = updatedTheme.footer.bgColor;
        if (updatedTheme.footer?.textColor) footer.style.color = updatedTheme.footer.textColor;
      }
      if (footerCopy && updatedTheme.footer?.copyrightText) {
        footerCopy.innerText = updatedTheme.footer.copyrightText;
      }

      // Feature sections
      const huidSec = doc.getElementById('huid-section');
      const trackSec = doc.getElementById('track-section');
      const schemeSec = doc.getElementById('scheme-section') || doc.getElementById('nandini-scheme-section');
      if (huidSec) huidSec.style.display = updatedTheme.features?.showHuidVerifier !== false ? 'block' : 'none';
      if (trackSec) trackSec.style.display = updatedTheme.features?.showOrderTracker !== false ? 'block' : 'none';
      if (schemeSec) schemeSec.style.display = updatedTheme.features?.showSwarnaNidhiChits !== false ? 'block' : 'none';

    } catch (e) {
      console.warn('Direct DOM preview update warning:', e);
    }

    // Always deliver postMessage as well
    iframe.contentWindow?.postMessage({
      type: 'KJ_THEME_PREVIEW',
      brand,
      theme: updatedTheme
    }, '*');
  }

  // Cross-tab real-time broadcast so any other open storefront windows reflect immediately!
  if (window.KJSync && typeof window.KJSync.broadcast === 'function') {
    window.KJSync.broadcast('THEME_UPDATED', {
      brand,
      theme: updatedTheme,
      settings: { [brand]: updatedTheme }
    });
  }
}

// Device Viewport Responsive Switcher
function setThemePreviewDevice(width) {
  adminState.previewDevice = width;
  const inner = document.getElementById('theme-preview-inner');
  const dDesktop = document.getElementById('device-desktop');
  const dTablet = document.getElementById('device-tablet');
  const dMobile = document.getElementById('device-mobile');

  if (inner) {
    inner.style.width = width;
    inner.style.maxWidth = width;
  }

  [dDesktop, dTablet, dMobile].forEach(btn => {
    if (btn) {
      btn.className = 'px-2.5 py-1 rounded-lg text-stone-400 hover:text-white transition';
    }
  });

  if (width === '100%' && dDesktop) dDesktop.className = 'px-2.5 py-1 rounded-lg bg-stone-800 text-white font-semibold';
  else if (width === '768px' && dTablet) dTablet.className = 'px-2.5 py-1 rounded-lg bg-stone-800 text-white font-semibold';
  else if (width === '375px' && dMobile) dMobile.className = 'px-2.5 py-1 rounded-lg bg-stone-800 text-white font-semibold';
}

function reloadThemePreviewFrame() {
  const iframe = document.getElementById('theme-preview-iframe');
  if (iframe) {
    iframe.src = iframe.src;
    showToast('Theme preview stage reloaded', 'info');
  }
}

async function saveThemeChanges() {
  const brand = adminState.customizerBrand;
  const updatedTheme = getThemeFormValues();
  const saveBtn = document.getElementById('save-theme-btn');

  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span>⏳</span> Publishing...';
    }

    const res = await StoreAPI.updateThemeSettings(brand, updatedTheme);
    if (res.success) {
      showToast(`✨ Shopify Theme changes published live to ${brand === 'viswanandini' ? 'Viswanandini Bridal' : 'Karthik Flagship'}!`, 'success');
      
      // Update global admin state
      if (!adminState.themeSettings) adminState.themeSettings = {};
      adminState.themeSettings[brand] = res.themeSettings;

      // Broadcast sync event to all open browser windows
      if (window.KJSync) {
        window.KJSync.broadcast('THEME_UPDATED', {
          brand,
          theme: res.themeSettings,
          settings: { [brand]: res.themeSettings }
        });
      }
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Error saving theme settings', 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span>💾</span> Save & Publish';
    }
  }
}

async function resetThemeDefaults() {
  const brand = adminState.customizerBrand;
  if (!confirm(`Reset ${brand === 'viswanandini' ? 'Viswanandini' : 'Karthik'} theme customizations back to factory defaults?`)) return;

  try {
    const res = await StoreAPI.resetThemeSettings(brand);
    if (res.success) {
      showToast('Theme reset to royal presets!', 'success');
      if (!adminState.themeSettings) adminState.themeSettings = {};
      adminState.themeSettings[brand] = res.themeSettings;
      populateThemeCustomizerForm(res.themeSettings);
      updateThemePreviewLive();

      if (window.KJSync) {
        window.KJSync.broadcast('THEME_UPDATED', {
          brand,
          theme: res.themeSettings,
          settings: { [brand]: res.themeSettings }
        });
      }
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Failed to reset theme', 'error');
  }
}

// --------------------------------------------------------------------------
// TAB 9: Live Bullion Rate Controller
// --------------------------------------------------------------------------
function populateRatesForm(rates) {
  if (!rates) return;
  const input24k = document.getElementById('rate-24k');
  const input22k = document.getElementById('rate-22k');
  const input18k = document.getElementById('rate-18k');
  const inputSilver = document.getElementById('rate-silver');
  const updatedByEl = document.getElementById('rate-updated-time');

  if (input24k) input24k.value = rates.gold24k;
  if (input22k) input22k.value = rates.gold22k;
  if (input18k) input18k.value = rates.gold18k;
  if (inputSilver) inputSilver.value = rates.silver;

  if (updatedByEl && rates.lastUpdated) {
    updatedByEl.innerText = `Last Updated: ${new Date(rates.lastUpdated).toLocaleString('en-IN')}`;
  }
}

function setupLiveRateForm() {
  const form = document.getElementById('live-rate-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const gold24k = Number(document.getElementById('rate-24k').value);
    const gold22k = Number(document.getElementById('rate-22k').value);
    const gold18k = Number(document.getElementById('rate-18k').value);
    const silver = Number(document.getElementById('rate-silver').value);

    try {
      const res = await StoreAPI.updateRates({ gold24k, gold22k, gold18k, silver });
      if (res.success) {
        showToast('Gold & Silver Rates Updated! Dynamic prices re-indexed across all portals.', 'success');
        adminState.rates = res.rates;
        populateRatesForm(res.rates);
        const prodRes = await StoreAPI.getProducts();
        if (prodRes.success) {
          adminState.products = prodRes.products;
          renderProductsTab(prodRes.products);
        }
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Error updating rates', 'error');
    }
  });
}

// --------------------------------------------------------------------------
// TAB 10: Store Settings & BIS Compliance
// --------------------------------------------------------------------------
function populateStoreSettingsForm(settings) {
  if (!settings) return;

  const setStore = document.getElementById('set-store-name');
  const setLegal = document.getElementById('set-legal-entity');
  const setGstin = document.getElementById('set-gstin');
  const setBis = document.getElementById('set-bis-license');
  const setGstPct = document.getElementById('set-gst-pct');
  const setEmail = document.getElementById('set-support-email');
  const setPhone = document.getElementById('set-support-phone');
  const setHq = document.getElementById('set-headquarters');
  const setLab = document.getElementById('set-assaying-lab');
  const setCourier = document.getElementById('set-courier-partner');

  if (setStore) setStore.value = settings.storeName || '';
  if (setLegal) setLegal.value = settings.legalEntity || '';
  if (setGstin) setGstin.value = settings.gstin || '';
  if (setBis) setBis.value = settings.bisLicense || '';
  if (setGstPct) setGstPct.value = settings.gstPercentage || 3.0;
  if (setEmail) setEmail.value = settings.supportEmail || '';
  if (setPhone) setPhone.value = settings.supportPhone || '';
  if (setHq) setHq.value = settings.headquarters || '';
  if (setLab) setLab.value = settings.assayingLab || '';
  if (setCourier) setCourier.value = settings.courierPartner || '';
}

async function handleStoreSettingsSubmit(e) {
  e.preventDefault();
  const payload = {
    storeName: document.getElementById('set-store-name').value,
    legalEntity: document.getElementById('set-legal-entity').value,
    gstin: document.getElementById('set-gstin').value,
    bisLicense: document.getElementById('set-bis-license').value,
    gstPercentage: Number(document.getElementById('set-gst-pct').value),
    supportEmail: document.getElementById('set-support-email').value,
    supportPhone: document.getElementById('set-support-phone').value,
    headquarters: document.getElementById('set-headquarters').value,
    assayingLab: document.getElementById('set-assaying-lab').value,
    courierPartner: document.getElementById('set-courier-partner').value
  };

  try {
    const res = await StoreAPI.updateStoreSettings(payload);
    if (res.success) {
      showToast('Enterprise Compliance & Store Settings updated and broadcasted!', 'success');
      adminState.storeSettings = res.settings;
      if (window.KJSync) {
        window.KJSync.broadcast('SETTINGS_UPDATED', { settings: res.settings });
      }
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Failed to save settings', 'error');
  }
}

// --------------------------------------------------------------------------
// Real-Time Cross-Portal Synchronizer Listeners
// --------------------------------------------------------------------------
function setupSyncListeners() {
  if (!window.KJSync) return;

  // React to new orders placed on storefront or Viswanandini
  window.KJSync.on('ORDER_CREATED', async (payload) => {
    const ordRes = await StoreAPI.getOrders();
    if (ordRes.success) {
      adminState.orders = ordRes.orders;
      renderOrdersTab(ordRes.orders);
    }
    const statsRes = await StoreAPI.getAdminStats();
    if (statsRes.success) {
      adminState.stats = statsRes.stats;
      renderOverviewTab(statsRes.stats);
    }
    const custRes = await StoreAPI.getCustomers();
    if (custRes.success) {
      adminState.customers = custRes.customers;
      renderCustomersTab(custRes.customers);
    }
  });

  // React to rate updates
  window.KJSync.on('RATES_UPDATED', async (payload) => {
    if (payload?.rates) {
      adminState.rates = payload.rates;
      populateRatesForm(payload.rates);
    }
    await refreshProducts();
  });

  // React to catalog modifications
  window.KJSync.on('PRODUCTS_UPDATED', async () => {
    await refreshProducts();
  });

  // React to external theme modifications
  window.KJSync.on('THEME_UPDATED', (payload) => {
    if (payload?.theme && payload?.brand === adminState.customizerBrand) {
      populateThemeCustomizerForm(payload.theme);
      updateThemePreviewLive();
    }
  });
}
