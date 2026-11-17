/**
 * KARTHIK JEWELLERS - CORE API & STORE DATA LAYER
 */

const API_BASE = '/api';

const StoreAPI = {
  // Rates
  async getRates() {
    const res = await fetch(`${API_BASE}/rates`);
    return await res.json();
  },

  async updateRates(ratesData) {
    const res = await fetch(`${API_BASE}/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ratesData)
    });
    return await res.json();
  },

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${query}`);
    return await res.json();
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return await res.json();
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return await res.json();
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return await res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return await res.json();
  },

  // Orders
  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    return await res.json();
  },

  async getOrderById(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    return await res.json();
  },

  async createOrder(orderPayload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    return await res.json();
  },

  // Schemes
  async getSchemes() {
    const res = await fetch(`${API_BASE}/schemes`);
    return await res.json();
  },

  async enrollScheme(schemeData) {
    const res = await fetch(`${API_BASE}/schemes/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schemeData)
    });
    return await res.json();
  },

  async paySchemeInstallment(id) {
    const res = await fetch(`${API_BASE}/schemes/${id}/pay`, {
      method: 'POST'
    });
    return await res.json();
  },

  // Appointments
  async getAppointments() {
    const res = await fetch(`${API_BASE}/appointments`);
    return await res.json();
  },

  async createAppointment(appointmentData) {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });
    return await res.json();
  },

  async updateAppointment(id, data) {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // Coupons
  async getCoupons() {
    const res = await fetch(`${API_BASE}/coupons`);
    return await res.json();
  },

  async validateCoupon(code, cartTotal) {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartTotal })
    });
    return await res.json();
  },

  // HUID Verification
  async verifyHuid(huid) {
    const res = await fetch(`${API_BASE}/verify-huid/${encodeURIComponent(huid)}`);
    return await res.json();
  },

  // Admin Stats
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`);
    return await res.json();
  },

  // Master Ecosystem Hub Metrics (All 3 Portals)
  async getHubMetrics() {
    const res = await fetch(`${API_BASE}/hub/metrics`);
    return await res.json();
  },

  async updateStoreAnnouncement(announcement) {
    const res = await fetch(`${API_BASE}/hub/announcement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcement })
    });
    return await res.json();
  },

  // Ecosystem Reindex & Error Diagnostic
  async reindexEcosystem() {
    const res = await fetch(`${API_BASE}/reindex`, {
      method: 'POST'
    });
    return await res.json();
  },

  // Theme Customizer (Shopify-Style Visual Theme Editor)
  async getThemeSettings() {
    const res = await fetch(`${API_BASE}/theme`);
    return await res.json();
  },

  async updateThemeSettings(brand, settings) {
    const res = await fetch(`${API_BASE}/theme`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand, settings })
    });
    return await res.json();
  },

  async resetThemeSettings(brand) {
    const res = await fetch(`${API_BASE}/theme/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand })
    });
    return await res.json();
  },

  // Store Settings & Compliance
  async getStoreSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return await res.json();
  },

  async updateStoreSettings(settings) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return await res.json();
  },

  // Customers
  async getCustomers() {
    const res = await fetch(`${API_BASE}/customers`);
    return await res.json();
  },

  // Order Fulfillment
  async fulfillOrder(id, trackingNumber, courier) {
    const res = await fetch(`${API_BASE}/orders/${id}/fulfill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingNumber, courier })
    });
    return await res.json();
  },

  async updateOrder(id, updates) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await res.json();
  },

  // Coupons CRUD
  async createCoupon(couponData) {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
    return await res.json();
  },

  async deleteCoupon(id) {
    const res = await fetch(`${API_BASE}/coupons/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  }
};

// Utilities
function formatINR(number) {
  if (number === undefined || number === null || isNaN(number)) return '₹0';
  return '₹' + Math.round(number).toLocaleString('en-IN');
}

// Local Cart Management
const CartManager = {
  getCart() {
    try {
      const items = localStorage.getItem('kj_cart');
      return items ? JSON.parse(items) : [];
    } catch (e) {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem('kj_cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('kj_cart_updated', { detail: cart }));
  },

  addItem(product, quantity = 1) {
    const cart = this.getCart();
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        purity: product.purity,
        grossWeight: product.grossWeight,
        netWeight: product.netWeight,
        price: product.currentPrice,
        image: (product.images && product.images[0]) || '',
        quantity: quantity,
        huid: product.huid
      });
    }
    this.saveCart(cart);
    return cart;
  },

  updateQty(productId, quantity) {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter(item => item.productId !== productId);
    } else {
      const item = cart.find(i => i.productId === productId);
      if (item) item.quantity = quantity;
    }
    this.saveCart(cart);
    return cart;
  },

  removeItem(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.productId !== productId);
    this.saveCart(cart);
    return cart;
  },

  clear() {
    this.saveCart([]);
  },

  getTotal() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getCount() {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }
};

// Local Wishlist Management
const WishlistManager = {
  getWishlist() {
    try {
      const items = localStorage.getItem('kj_wishlist');
      return items ? JSON.parse(items) : [];
    } catch (e) {
      return [];
    }
  },

  toggle(product) {
    let wishlist = this.getWishlist();
    const idx = wishlist.findIndex(item => item.id === product.id);
    let added = false;
    if (idx !== -1) {
      wishlist.splice(idx, 1);
    } else {
      wishlist.push(product);
      added = true;
    }
    localStorage.setItem('kj_wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new CustomEvent('kj_wishlist_updated', { detail: wishlist }));
    return added;
  },

  has(productId) {
    const wishlist = this.getWishlist();
    return wishlist.some(item => item.id === productId);
  },

  getCount() {
    return this.getWishlist().length;
  }
};

// Toast notification helper
function showToast(message, type = 'success') {
  if (window.KJSync && typeof window.KJSync.showSyncToast === 'function') {
    window.KJSync.showSyncToast(message);
    return;
  }

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-[#0f2820] border-[#c5a059] text-white' : type === 'error' ? 'bg-red-900 border-red-500 text-white' : 'bg-gray-900 border-gray-700 text-white';
  
  toast.className = `${bg} border px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium transition-all duration-300 transform translate-y-4 pointer-events-auto max-w-md`;
  toast.innerHTML = `
    <span class="text-lg">${type === 'success' ? '✨' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-4');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

