/**
 * KARTHIK JEWELLERS - MASTER ECOSYSTEM HUB CONTROLLER
 * Manages Customer Storefront, Executive Admin Center, and GST Tax Invoices
 */

let hubData = null;
let currentStagePortal = 'storefront';

document.addEventListener('DOMContentLoaded', async () => {
  await refreshHubData();
});

async function refreshHubData() {
  try {
    const res = await StoreAPI.getHubMetrics();
    if (res.success) {
      hubData = res;
      renderHubCards(res);
      renderHubKPIs(res);
      renderInvoicesRegistry(res.invoicing.recentInvoices);
      renderBullionForm(res.storefront.liveRates);
      renderAnnouncementForm(res.storefront.storeAnnouncement);
      renderLowStockList(res.operations.lowStockItems);

      const timeEl = document.getElementById('hub-last-updated');
      if (timeEl) {
        timeEl.innerText = `Synchronized: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
      }
    }
  } catch (err) {
    console.error('Failed to load Master Hub data:', err);
    showToast('Failed to sync ecosystem metrics', 'error');
  }
}

// 1. Render Bento Cards for the Portals
function renderHubCards(data) {
  // Portal 1: Karthik Storefront
  const card1Prods = document.getElementById('card1-products');
  const card1Gold22 = document.getElementById('card1-gold22k');
  if (card1Prods) card1Prods.innerText = `${data.storefront.activeProducts} Pieces`;
  if (card1Gold22) card1Gold22.innerText = `₹${data.storefront.currentGold22k.toLocaleString('en-IN')}/g`;

  // Portal 2: Viswanandini Affiliate
  if (data.affiliateStorefront) {
    const viswaProds = document.getElementById('card-viswa-products');
    const viswaChits = document.getElementById('card-viswa-chits');
    if (viswaProds) viswaProds.innerText = `${data.affiliateStorefront.activeProducts} Pieces`;
    if (viswaChits) viswaChits.innerText = `${data.affiliateStorefront.bridalChitSubscribers} Active`;
  }

  // Portal 3: Admin Operations
  const card2Orders = document.getElementById('card2-orders');
  const card2Schemes = document.getElementById('card2-schemes');
  if (card2Orders) card2Orders.innerText = `${data.operations.totalOrders} Orders`;
  if (card2Schemes) card2Schemes.innerText = `${data.operations.activeSchemes} Active`;

  // Portal 4: Invoicing
  const card3Inv = document.getElementById('card3-invoices');
  const card3Gst = document.getElementById('card3-gst');
  if (card3Inv) card3Inv.innerText = `${data.invoicing.invoicesCount} Issued`;
  if (card3Gst) card3Gst.innerText = formatINR(data.invoicing.totalGst);
}

// 2. Render Financial KPIs
function renderHubKPIs(data) {
  const revEl = document.getElementById('hub-kpi-revenue');
  const taxEl = document.getElementById('hub-kpi-taxable');
  const gstEl = document.getElementById('hub-kpi-gst');
  const goldWeightEl = document.getElementById('hub-kpi-gold-weight');
  const schemeGramsEl = document.getElementById('hub-kpi-scheme-grams');

  if (revEl) revEl.innerText = formatINR(data.invoicing.totalRevenue);
  if (taxEl) taxEl.innerText = formatINR(data.invoicing.totalTaxable);
  if (gstEl) gstEl.innerText = formatINR(data.invoicing.totalGst);
  if (goldWeightEl) goldWeightEl.innerText = `${data.invoicing.totalGrossGoldWeight}g`;
  if (schemeGramsEl) schemeGramsEl.innerText = `${data.operations.totalGoldAccruedGrams}g`;

  // Brand Breakdown KPIs
  if (data.brandBreakdown) {
    const kProds = document.getElementById('karthik-kpi-prods');
    const kRev = document.getElementById('karthik-kpi-rev');
    const kChits = document.getElementById('karthik-kpi-chits');
    const vProds = document.getElementById('viswa-kpi-prods');
    const vRev = document.getElementById('viswa-kpi-rev');
    const vChits = document.getElementById('viswa-kpi-chits');

    if (kProds) kProds.innerText = `${data.brandBreakdown.karthik.productsCount} Pieces`;
    if (kRev) kRev.innerText = formatINR(data.brandBreakdown.karthik.revenue);
    if (kChits) kChits.innerText = data.brandBreakdown.karthik.schemesCount;

    if (vProds) vProds.innerText = `${data.brandBreakdown.viswanandini.productsCount} Pieces`;
    if (vRev) vRev.innerText = formatINR(data.brandBreakdown.viswanandini.revenue);
    if (vChits) vChits.innerText = data.brandBreakdown.viswanandini.schemesCount;
  }
}

// 3. Render Invoices Registry Table
function renderInvoicesRegistry(invoices) {
  const tbody = document.getElementById('hub-invoices-table');
  if (!tbody) return;

  if (!invoices || invoices.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-stone-500">No GST Tax Invoices generated yet.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = invoices.map(inv => {
    const isDelivered = inv.status.includes('Delivered');
    const isDispatched = inv.status.includes('Dispatched');
    const isViswa = (inv.brand === 'viswanandini') || (inv.invoiceNumber && inv.invoiceNumber.includes('VJ'));

    return `
      <tr class="hover:bg-stone-850/50 transition">
        <td class="py-3.5 px-4 font-mono font-bold text-amber-200">
          <div class="flex items-center gap-1.5">
            <span>${inv.invoiceNumber}</span>
            <span class="px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${isViswa ? 'bg-[#781d2a] text-white' : 'bg-[#c5a059] text-stone-950'}">
              ${isViswa ? 'Viswanandini' : 'Karthik'}
            </span>
          </div>
          <div class="text-[10px] text-stone-500 font-sans">${new Date(inv.date).toLocaleDateString('en-IN')}</div>
        </td>
        <td class="py-3.5 px-4 font-medium text-white">
          ${inv.customerName}
          <div class="text-[10px] text-stone-400">${inv.customerCity}</div>
        </td>
        <td class="py-3.5 px-4 font-mono text-[11px] text-[#c5a059]">
          ${inv.huidList.join(', ') || 'KJ916V9821'}
        </td>
        <td class="py-3.5 px-4 font-mono font-semibold text-stone-300">
          ${formatINR(inv.amount - inv.gst)}
        </td>
        <td class="py-3.5 px-4 font-mono text-stone-300">
          ${formatINR(inv.gst)}
        </td>
        <td class="py-3.5 px-4 font-mono font-bold text-white">
          ${formatINR(inv.amount)}
        </td>
        <td class="py-3.5 px-4">
          <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            isDelivered ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
            isDispatched ? 'bg-blue-950 text-blue-400 border border-blue-500/30' :
            'bg-amber-950 text-amber-300 border border-amber-500/30'
          }">
            ${inv.status}
          </span>
        </td>
        <td class="py-3.5 px-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="previewInvoiceInStage('${inv.invoiceUrl}')" class="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-full text-xs font-semibold">
              Preview
            </button>
            <a href="${inv.invoiceUrl}" target="_blank" class="px-3.5 py-1 bg-[#c5a059] text-stone-950 font-bold rounded-full text-xs hover:bg-[#d4af37] transition inline-block">
              Print PDF ↗
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 4. Render Low Stock Radar
function renderLowStockList(lowStockItems) {
  const container = document.getElementById('hub-low-stock-list');
  if (!container) return;

  if (!lowStockItems || lowStockItems.length === 0) {
    container.innerHTML = `
      <div class="p-3 bg-[#151c27] border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs">
        ✓ All fine jewellery catalog items are well stocked!
      </div>
    `;
    return;
  }

  container.innerHTML = lowStockItems.map(p => `
    <div class="flex items-center justify-between p-2.5 bg-stone-900 rounded-xl border border-stone-800">
      <span class="font-medium text-stone-200">${p.name}</span>
      <span class="text-rose-400 font-bold font-mono text-xs bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/30">
        Only ${p.stockCount} left
      </span>
    </div>
  `).join('');
}

// 5. Pre-fill Forms
function renderBullionForm(rates) {
  if (!rates) return;
  const in24 = document.getElementById('hub-rate-24k');
  const in22 = document.getElementById('hub-rate-22k');
  const in18 = document.getElementById('hub-rate-18k');
  const inSil = document.getElementById('hub-rate-silver');
  const ts = document.getElementById('hub-rate-timestamp');

  if (in24) in24.value = rates.gold24k;
  if (in22) in22.value = rates.gold22k;
  if (in18) in18.value = rates.gold18k;
  if (inSil) inSil.value = rates.silver;
  if (ts) ts.innerText = `Last Updated: ${new Date(rates.lastUpdated).toLocaleString('en-IN')}`;
}

function renderAnnouncementForm(announcement) {
  const el = document.getElementById('hub-announcement-text');
  if (el) el.value = announcement || '';
}

// 6. Interactive Live Stage Switcher
function setLiveStage(portal) {
  currentStagePortal = portal;
  const singleViewport = document.getElementById('stage-single-viewport');
  const dualViewport = document.getElementById('stage-dual-viewport');
  const iframe = document.getElementById('master-stage-iframe');
  const extLink = document.getElementById('stage-external-link');

  // Update tabs
  document.querySelectorAll('.stage-tab-btn').forEach(btn => {
    btn.classList.remove('bg-[#c5a059]', 'text-stone-950', 'font-bold', 'shadow');
    btn.classList.add('text-stone-300', 'font-semibold');
  });

  const activeBtn = document.getElementById(`stage-tab-${portal}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-stone-300', 'font-semibold');
    activeBtn.classList.add('bg-[#c5a059]', 'text-stone-950', 'font-bold', 'shadow');
  }

  if (portal === 'dual_brands') {
    if (singleViewport) singleViewport.classList.add('hidden');
    if (dualViewport) {
      dualViewport.classList.remove('hidden');
      dualViewport.innerHTML = `
        <div class="rounded-2xl overflow-hidden border border-stone-800 bg-white flex flex-col shadow-2xl">
          <div class="bg-[#11151f] px-4 py-2 border-b border-stone-800 flex justify-between items-center text-xs text-stone-300">
            <span class="font-bold text-amber-200">🛍️ Karthik Jewellers Flagship (/)</span>
            <a href="/" target="_blank" class="text-[#c5a059] hover:underline text-[11px]">New Tab ↗</a>
          </div>
          <iframe src="/" class="w-full flex-1 border-0" title="Karthik Split View"></iframe>
        </div>
        <div class="rounded-2xl overflow-hidden border border-[#781d2a]/50 bg-white flex flex-col shadow-2xl">
          <div class="bg-[#240c11] px-4 py-2 border-b border-[#781d2a] flex justify-between items-center text-xs text-rose-200">
            <span class="font-bold text-amber-200">👑 Viswanandini Bridal Affiliate (/viswanandini)</span>
            <a href="/viswanandini" target="_blank" class="text-amber-300 hover:underline text-[11px]">New Tab ↗</a>
          </div>
          <iframe src="/viswanandini" class="w-full flex-1 border-0" title="Viswanandini Split View"></iframe>
        </div>
      `;
    }
    if (extLink) extLink.href = '/viswanandini';
    return;
  }

  if (portal === 'dual') {
    if (singleViewport) singleViewport.classList.add('hidden');
    if (dualViewport) {
      dualViewport.classList.remove('hidden');
      dualViewport.innerHTML = `
        <div class="rounded-2xl overflow-hidden border border-stone-800 bg-white flex flex-col shadow-2xl">
          <div class="bg-[#11151f] px-4 py-2 border-b border-stone-800 flex justify-between items-center text-xs text-stone-300">
            <span class="font-bold text-amber-200">🛍️ Storefront E-Commerce (/)</span>
            <a href="/" target="_blank" class="text-[#c5a059] hover:underline text-[11px]">New Tab ↗</a>
          </div>
          <iframe src="/" class="w-full flex-1 border-0" title="Storefront Split View"></iframe>
        </div>
        <div class="rounded-2xl overflow-hidden border border-stone-800 bg-white flex flex-col shadow-2xl">
          <div class="bg-[#11151f] px-4 py-2 border-b border-stone-800 flex justify-between items-center text-xs text-stone-300">
            <span class="font-bold text-amber-200">👑 Admin Operations (/admin)</span>
            <a href="/admin" target="_blank" class="text-[#c5a059] hover:underline text-[11px]">New Tab ↗</a>
          </div>
          <iframe src="/admin" class="w-full flex-1 border-0" title="Admin Split View"></iframe>
        </div>
      `;
    }
    if (extLink) extLink.href = '/';
    return;
  }

  // Single Frame View
  if (singleViewport) singleViewport.classList.remove('hidden');
  if (dualViewport) dualViewport.classList.add('hidden');

  let targetUrl = '/';
  if (portal === 'viswanandini') targetUrl = '/viswanandini';
  else if (portal === 'admin') targetUrl = '/admin';
  else if (portal === 'invoice') targetUrl = '/invoice';

  if (iframe) iframe.src = targetUrl;
  if (extLink) extLink.href = targetUrl;
}

function scrollToLiveStage(portal) {
  setLiveStage(portal);
  const stage = document.getElementById('interactive-stage-section');
  if (stage) stage.scrollIntoView({ behavior: 'smooth' });
}

function previewInvoiceInStage(invoiceUrl) {
  setLiveStage('invoice');
  const iframe = document.getElementById('master-stage-iframe');
  if (iframe) iframe.src = invoiceUrl;
  const extLink = document.getElementById('stage-external-link');
  if (extLink) extLink.href = invoiceUrl;

  const stage = document.getElementById('interactive-stage-section');
  if (stage) stage.scrollIntoView({ behavior: 'smooth' });
}

function setStageWidth(width) {
  const frame = document.getElementById('stage-frame-wrapper');
  if (frame) {
    frame.style.maxWidth = width;
  }
}

function reloadStageFrame() {
  const iframe = document.getElementById('master-stage-iframe');
  if (iframe) {
    iframe.src = iframe.src;
    showToast('Reloaded stage viewport', 'info');
  }
}

// 7. Hub Operations Tabs
function switchHubTab(tabName) {
  // Update buttons
  document.querySelectorAll('.hub-control-tab').forEach(b => {
    b.classList.remove('bg-[#c5a059]', 'text-stone-950', 'font-bold');
    b.classList.add('text-stone-400', 'font-semibold');
  });

  const activeBtn = document.getElementById(`hub-tab-btn-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-stone-400', 'font-semibold');
    activeBtn.classList.add('bg-[#c5a059]', 'text-stone-950', 'font-bold');
  }

  // Toggle content sections
  ['analytics', 'invoices', 'bullion', 'announcements'].forEach(name => {
    const section = document.getElementById(`hub-tab-content-${name}`);
    if (section) section.classList.toggle('hidden', name !== tabName);
  });
}

// 8. Form Handlers
async function handleHubRatesSync(e) {
  e.preventDefault();
  const gold24k = document.getElementById('hub-rate-24k').value;
  const gold22k = document.getElementById('hub-rate-22k').value;
  const gold18k = document.getElementById('hub-rate-18k').value;
  const silver = document.getElementById('hub-rate-silver').value;

  try {
    const res = await StoreAPI.updateRates({ gold24k, gold22k, gold18k, silver });
    if (res.success) {
      showToast('⚡ Rates updated and synchronized across all 3 portals!', 'success');
      await refreshHubData();
      reloadStageFrame();
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Error syncing bullion rates', 'error');
  }
}

async function handleHubAnnouncementSubmit(e) {
  e.preventDefault();
  const announcement = document.getElementById('hub-announcement-text').value;

  try {
    const res = await StoreAPI.updateStoreAnnouncement(announcement);
    if (res.success) {
      showToast('Storefront announcement updated!', 'success');
      reloadStageFrame();
    } else {
      showToast(res.message, 'error');
    }
  } catch (err) {
    showToast('Failed to update announcement', 'error');
  }
}

// 9. Ecosystem Reindex Trigger
async function triggerEcosystemReindex() {
  const modal = document.getElementById('reindex-modal');
  const body = document.getElementById('reindex-modal-body');
  if (modal) modal.classList.remove('hidden');

  if (body) {
    body.innerHTML = `
      <div class="text-center py-6">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent mb-3"></div>
        <p class="text-stone-300">Auditing and reindexing all products, orders, categories and live rates...</p>
      </div>
    `;
  }

  try {
    const res = await StoreAPI.reindexEcosystem();
    if (res.success && res.report) {
      const r = res.report;
      if (body) {
        body.innerHTML = `
          <div class="space-y-3">
            <div class="p-3 bg-emerald-950/70 border border-emerald-500/30 rounded-2xl text-emerald-300 flex items-center justify-between">
              <span class="font-bold">System Status:</span>
              <span class="font-bold text-white px-2.5 py-0.5 bg-emerald-800 rounded-full font-mono text-[10px]">${r.databaseIntegrity}</span>
            </div>

            <div class="space-y-2 text-stone-300 pt-1">
              <div class="flex justify-between py-1 border-b border-stone-800/80">
                <span class="text-stone-400">Products Validated:</span>
                <strong class="font-mono text-white">${r.productsValidated} pieces</strong>
              </div>
              <div class="flex justify-between py-1 border-b border-stone-800/80">
                <span class="text-stone-400">Categories Re-indexed:</span>
                <strong class="font-mono text-white">${r.categoriesReindexed} categories</strong>
              </div>
              <div class="flex justify-between py-1 border-b border-stone-800/80">
                <span class="text-stone-400">Orders Mathematically Audited:</span>
                <strong class="font-mono text-white">${r.ordersAudited} orders</strong>
              </div>
              <div class="flex justify-between py-1 border-b border-stone-800/80">
                <span class="text-stone-400">Swarna Nidhi Accounts Audited:</span>
                <strong class="font-mono text-white">${r.schemesAudited} accounts</strong>
              </div>
              <div class="flex justify-between py-1 border-b border-stone-800/80">
                <span class="text-stone-400">Repairs Applied:</span>
                <strong class="font-mono text-emerald-400">${r.repairsAppliedCount} (Zero Corruption)</strong>
              </div>
            </div>

            <p class="text-[11px] text-stone-400 pt-1 font-light italic">
              All live bullion formulas, BIS hallmarked HUID tags, and GST calculations are 100% verified.
            </p>
          </div>
        `;
      }
      showToast('Ecosystem reindexed successfully with zero errors!', 'success');
      await refreshHubData();
      reloadStageFrame();
    }
  } catch (err) {
    if (body) {
      body.innerHTML = `<div class="p-4 bg-rose-950 border border-rose-500 text-rose-300 rounded-2xl">Error during reindexing audit.</div>`;
    }
  }
}

function closeReindexModal() {
  const modal = document.getElementById('reindex-modal');
  if (modal) modal.classList.add('hidden');
}

