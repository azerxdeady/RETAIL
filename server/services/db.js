const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/db.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_PATH)) {
      const seedData = require('./seedData');
      this.save(seedData);
    } else {
      // Ensure themeSettings and storeSettings exist in existing db
      const data = this.read();
      let modified = false;
      const defaultTheme = this.getDefaultThemeSettings();
      if (!data.themeSettings) {
        data.themeSettings = defaultTheme;
        modified = true;
      } else {
        // Ensure both brands and all new customization sections are populated
        const deepMergeDefaults = (target, defaults) => {
          for (const key of Object.keys(defaults)) {
            if (target[key] === undefined) {
              target[key] = JSON.parse(JSON.stringify(defaults[key]));
              modified = true;
            } else if (defaults[key] && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
              if (typeof target[key] !== 'object' || Array.isArray(target[key])) {
                target[key] = {};
                modified = true;
              }
              deepMergeDefaults(target[key], defaults[key]);
            }
          }
        };
        deepMergeDefaults(data.themeSettings, defaultTheme);
      }
      if (!data.storeSettings) {
        data.storeSettings = this.getDefaultStoreSettings();
        modified = true;
      }
      if (modified) {
        this.save(data);
      }
    }
  }

  getDefaultThemeSettings() {
    return {
      karthik: {
        preset: "imperial",
        brandName: "Karthik Jewellers",
        brandTagline: "Fine Jewellers • Est. 1982",
        monogramChar: "K",
        announcement: {
          enabled: true,
          text: "✨ Akshaya & Festive Season: Complimentary Insured Armoured Transit Across India • 0% Making Charges on 24KT Bullion Coins",
          link: "#scheme-section",
          bgColor: "#141007",
          textColor: "#faecd0",
          speed: "normal"
        },
        bullionTicker: {
          enabled: true,
          show24k: true,
          show22k: true,
          show18k: true,
          showSilver: true,
          badgeText: "LIVE BULLION INDEX"
        },
        header: {
          sticky: true,
          style: "glass", // glass, solid, transparent
          glassEffect: true,
          showSearch: true,
          showCategoryNav: true,
          showVipLounge: true,
          vipLoungeText: "✨ VIP Lounge",
          showWishlist: true,
          showCart: true
        },
        hero: {
          layout: "split", // split, centered, fullwidth
          height: "medium", // compact, medium, fullscreen
          textAlignment: "left", // left, center
          overlayOpacity: 0.15,
          eyebrowText: "BIS 916 Hallmarked • IGI Certified Natural Diamonds",
          headingPart1: "Pure Gold.",
          headingShimmer: "Unrivalled Radiance.",
          subheading: "Crafted for the modern connoisseur. Hand-forged heritage temple necklaces, flawless solitaires, and bespoke bridal adornments with 100% transparent live bullion pricing.",
          primaryBtnText: "Explore Masterpieces",
          primaryBtnLink: "#products-section",
          secondaryBtnText: "Live Gold Rates",
          secondaryBtnLink: "#rates-overview-section",
          tertiaryBtnText: "Swarna Nidhi (11+1 Bonus)",
          tertiaryBtnLink: "#scheme-section",
          showcaseTag: "22KT BIS 916",
          showcaseTitle: "Mayuri Heritage Antique Haram",
          showcaseSubtitle: "Burmese Rubies & Emerald Cabochons",
          showcaseWeight: "45.2g Net",
          imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
        },
        colors: {
          primaryGold: "#D4AF37",
          richGold: "#C5A059",
          champagne: "#FAECD0",
          darkGold: "#8C6A23",
          noirBg: "#120E06",
          surfaceLight: "#FAF7F2"
        },
        typography: {
          preset: "imperial",
          headingFont: "Cinzel, serif",
          bodyFont: "Plus Jakarta Sans, sans-serif",
          headingScale: "large",
          letterSpacing: "normal"
        },
        productGrid: {
          columns: 4,
          cardStyle: "elevated",
          cardRadius: "24px",
          showBadges: true,
          showPricing: true,
          showWeight: true,
          imageRatio: "portrait",
          hoverEffect: "glow"
        },
        buttons: {
          style: "pill",
          radius: "9999px",
          primaryColor: "#D4AF37",
          textColor: "#120E06",
          hoverEffect: "shimmer"
        },
        footer: {
          bgColor: "#0b0804",
          textColor: "#faecd0",
          copyrightText: "© 2026 Karthik Jewellers Private Limited. All Rights Reserved.",
          showSocialLinks: true,
          showTrustBadges: true,
          showNewsletter: true
        },
        spacing: {
          density: "comfortable",
          sectionPadding: "medium"
        },
        features: {
          showArTryOn: true,
          showPriceBreakup: true,
          showHuidVerifier: true,
          showOrderTracker: true,
          showSwarnaNidhiChits: true,
          showVipBooking: true
        }
      },
      viswanandini: {
        preset: "royal",
        brandName: "Viswanandini Jewellers",
        brandTagline: "Royal Bridal House • Est. 2014",
        monogramChar: "V",
        announcement: {
          enabled: true,
          text: "👑 Viswanandini Royal Bridal Trousseau: Handcrafted Polki Jadau & Heirloom Temple Collections • Authenticated under Karthik Jewellers BIS License",
          link: "#catalog-section",
          bgColor: "#240a10",
          textColor: "#f7e7b4",
          speed: "normal"
        },
        bullionTicker: {
          enabled: true,
          show24k: true,
          show22k: true,
          show18k: true,
          showSilver: true,
          badgeText: "ROYAL BENCHMARK"
        },
        header: {
          sticky: true,
          style: "glass",
          glassEffect: true,
          showSearch: true,
          showCategoryNav: true,
          showVipLounge: true,
          vipLoungeText: "👑 Royal Bridal Suite",
          showWishlist: true,
          showCart: true
        },
        hero: {
          layout: "split",
          height: "medium",
          textAlignment: "left",
          overlayOpacity: 0.15,
          eyebrowText: "An Affiliate Luxury House of Karthik Jewellers",
          headingPart1: "Heirloom Polki,",
          headingShimmer: "Kundan Jadau",
          headingPart3: "& Temple Treasures.",
          subheading: "Crafted for royal bridal trousseaux and Indian wedding celebrations. Hand-chased by master Karigars of Jaipur and Bikaner, authenticated under the official Bureau of Indian Standards (BIS) Hallmarking license of Karthik Jewellers Private Limited.",
          primaryBtnText: "Explore Masterpieces",
          secondaryBtnText: "✨ Nandini Swarna Varsha",
          signatureTitle: "Maharani Gayatri Uncut Polki Choker",
          signatureSubtitle: "62.00g 22KT Gold • 12.50ct Uncut Diamonds • Zambian Emeralds",
          signaturePrice: "₹6,74,605",
          imageUrl: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80"
        },
        colors: {
          royalBurgundy: "#781D2A",
          burgundyDark: "#3E070F",
          imperialGold: "#D4AF37",
          champagne: "#F7E7B4"
        },
        typography: {
          preset: "royal",
          headingFont: "Cormorant Garamond, serif",
          bodyFont: "Outfit, sans-serif",
          headingScale: "large",
          letterSpacing: "normal"
        },
        productGrid: {
          columns: 4,
          cardStyle: "elevated",
          cardRadius: "24px",
          showBadges: true,
          showPricing: true,
          showWeight: true,
          imageRatio: "portrait",
          hoverEffect: "glow"
        },
        buttons: {
          style: "pill",
          radius: "9999px",
          primaryColor: "#781D2A",
          textColor: "#ffffff",
          hoverEffect: "shimmer"
        },
        footer: {
          bgColor: "#210d11",
          textColor: "#f7e7b4",
          copyrightText: "© 2026 Viswanandini Jewellers (Affiliate House of Karthik Jewellers). All Rights Reserved.",
          showSocialLinks: true,
          showTrustBadges: true,
          showNewsletter: true
        },
        spacing: {
          density: "comfortable",
          sectionPadding: "medium"
        },
        features: {
          showArTryOn: true,
          showPriceBreakup: true,
          showHuidVerifier: true,
          showOrderTracker: true,
          showSwarnaNidhiChits: true,
          showVipBooking: true
        }
      }
    };
  }

  getDefaultStoreSettings() {
    return {
      storeName: "Karthik Jewellers Private Limited",
      legalEntity: "Karthik Jewellers & Fine Gems Private Limited",
      brandAffiliate: "Viswanandini Jewellers (Affiliate Luxury Bridal House)",
      gstin: "33AAACK4928J1Z5",
      bisLicense: "BIS-HM/L-600017-0982",
      stateCode: "33 (Tamil Nadu)",
      panNumber: "AAACK4928J",
      currency: "INR",
      currencySymbol: "₹",
      gstPercentage: 3,
      makingChargeDefault: 12,
      supportEmail: "concierge@karthikjewellers.com",
      supportPhone: "+91 44 2434 8899",
      headquarters: "14 Usman Road, T. Nagar, Chennai - 600017, Tamil Nadu, India",
      assayingLab: "BVC Precious Assaying & Hallmarking Centre (AHC Code: TN-042)",
      courierPartner: "BVC Logistics Secured Armoured Vault Transit",
      autoRefreshRatesSeconds: 30
    };
  }

  getThemeSettings() {
    const data = this.read();
    if (!data.themeSettings) {
      data.themeSettings = this.getDefaultThemeSettings();
      this.save(data);
    }
    return data.themeSettings;
  }

  updateThemeSettings(brand, newSettings) {
    const data = this.read();
    if (!data.themeSettings) data.themeSettings = this.getDefaultThemeSettings();

    const deepMerge = (target, source) => {
      for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
            target[key] = {};
          }
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
      return target;
    };

    if (brand && data.themeSettings[brand]) {
      deepMerge(data.themeSettings[brand], newSettings);
    } else {
      deepMerge(data.themeSettings, newSettings);
    }
    data.themeSettings.lastUpdated = new Date().toISOString();
    this.save(data);
    return data.themeSettings;
  }

  getStoreSettings() {
    const data = this.read();
    if (!data.storeSettings) {
      data.storeSettings = this.getDefaultStoreSettings();
      this.save(data);
    }
    return data.storeSettings;
  }

  updateStoreSettings(updates) {
    const data = this.read();
    if (!data.storeSettings) data.storeSettings = this.getDefaultStoreSettings();
    data.storeSettings = { ...data.storeSettings, ...updates, lastUpdated: new Date().toISOString() };
    this.save(data);
    return data.storeSettings;
  }

  read() {
    try {
      if (!fs.existsSync(DB_PATH)) {
        this.init();
      }
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading db.json:', err);
      return {
        products: [],
        categories: [],
        rates: {},
        orders: [],
        schemes: [],
        appointments: [],
        coupons: [],
        users: []
      };
    }
  }

  save(data) {
    try {
      const tempPath = `${DB_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_PATH);
      return true;
    } catch (err) {
      console.error('Error saving db.json:', err);
      return false;
    }
  }

  // Helper getters and setters
  get(collection) {
    const data = this.read();
    return data[collection] || [];
  }

  findById(collection, id) {
    const items = this.get(collection);
    return items.find(item => String(item.id) === String(id));
  }

  insert(collection, item) {
    const data = this.read();
    if (!data[collection]) data[collection] = [];
    if (!item.id) {
      item.id = 'KJ-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    item.createdAt = item.createdAt || new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    data[collection].unshift(item);
    this.save(data);
    return item;
  }

  update(collection, id, updates) {
    const data = this.read();
    const items = data[collection] || [];
    const idx = items.findIndex(item => String(item.id) === String(id));
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save(data);
    return items[idx];
  }

  delete(collection, id) {
    const data = this.read();
    const items = data[collection] || [];
    const idx = items.findIndex(item => String(item.id) === String(id));
    if (idx === -1) return false;
    items.splice(idx, 1);
    this.save(data);
    return true;
  }

  getCustomers() {
    const data = this.read();
    const orders = data.orders || [];
    const schemes = data.schemes || [];
    const appointments = data.appointments || [];
    const customerMap = {};

    // Populate from orders
    orders.forEach(ord => {
      const cust = ord.customer;
      if (!cust || !cust.phone) return;
      const key = cust.phone.replace(/[\s\-\+]/g, '').slice(-10);
      if (!customerMap[key]) {
        customerMap[key] = {
          id: 'CUST-' + key,
          name: cust.name,
          phone: cust.phone,
          email: cust.email || '',
          city: cust.city || 'Chennai',
          state: cust.state || 'Tamil Nadu',
          address: cust.address || '',
          totalOrders: 0,
          totalSpent: 0,
          orders: [],
          schemes: [],
          appointments: [],
          tier: 'Silver',
          firstSeen: ord.createdAt,
          lastSeen: ord.createdAt
        };
      }
      customerMap[key].totalOrders += 1;
      customerMap[key].totalSpent += (ord.summary?.grandTotal || 0);
      customerMap[key].orders.push({
        id: ord.id,
        date: ord.createdAt,
        amount: ord.summary?.grandTotal,
        status: ord.status,
        brand: ord.brand
      });
      if (new Date(ord.createdAt) > new Date(customerMap[key].lastSeen)) {
        customerMap[key].lastSeen = ord.createdAt;
      }
    });

    // Populate from schemes
    schemes.forEach(sch => {
      if (!sch.customerPhone) return;
      const key = sch.customerPhone.replace(/[\s\-\+]/g, '').slice(-10);
      if (!customerMap[key]) {
        customerMap[key] = {
          id: 'CUST-' + key,
          name: sch.customerName,
          phone: sch.customerPhone,
          email: sch.customerEmail || '',
          city: sch.branch?.includes('Chennai') ? 'Chennai' : sch.branch?.includes('Hyderabad') ? 'Hyderabad' : 'Bangalore',
          state: 'India',
          address: sch.branch || '',
          totalOrders: 0,
          totalSpent: 0,
          orders: [],
          schemes: [],
          appointments: [],
          tier: 'Silver',
          firstSeen: sch.startDate || new Date().toISOString(),
          lastSeen: sch.startDate || new Date().toISOString()
        };
      }
      customerMap[key].schemes.push({
        id: sch.id,
        planName: sch.planName,
        monthlyAmount: sch.monthlyAmount,
        paidInstallments: sch.paidInstallments,
        accruedGrams: sch.totalAccumulatedGoldGrams,
        status: sch.status,
        brand: sch.brand
      });
    });

    // Populate from appointments
    appointments.forEach(apt => {
      if (!apt.customerPhone) return;
      const key = apt.customerPhone.replace(/[\s\-\+]/g, '').slice(-10);
      if (customerMap[key]) {
        customerMap[key].appointments.push({
          id: apt.id,
          date: apt.preferredDate,
          service: apt.serviceType,
          status: apt.status
        });
      }
    });

    // Determine loyalty tier
    const customers = Object.values(customerMap).map(c => {
      if (c.totalSpent > 1000000 || c.schemes.length >= 2) {
        c.tier = 'Imperial Diamond VIP';
      } else if (c.totalSpent > 300000 || c.schemes.length >= 1) {
        c.tier = 'Royal Gold Elite';
      } else {
        c.tier = 'Fine Jewellery Member';
      }
      return c;
    });

    return customers.sort((a, b) => b.totalSpent - a.totalSpent);
  }

  getRates() {
    const data = this.read();
    return data.rates || {
      gold24k: 7850,
      gold22k: 7215,
      gold18k: 5910,
      silver: 94,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Admin'
    };
  }

  updateRates(newRates) {
    const data = this.read();
    data.rates = {
      ...data.rates,
      ...newRates,
      lastUpdated: new Date().toISOString()
    };
    this.save(data);
    return data.rates;
  }
}

module.exports = new Database();

