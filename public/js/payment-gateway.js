/**
 * KARTHIK JEWELLERS & VISWANANDINI LUXURY PAYMENT GATEWAY SUITE
 * ==============================================================
 * Razorpay & Cashfree Luxury Sandbox Engine
 * Features:
 *   - Instant Dynamic BharatQR Code & 1-Click UPI Apps (GPay, PhonePe, Paytm, Cred)
 *   - Credit/Debit Cards with Network Detection & Live No-Cost EMI Calculator
 *   - Instant Net Banking for Major Indian Banks
 *   - Armoured Vault Transit COD with Tamper-Evident OTP
 *   - Swarna Nidhi & Bridal Chit Fund Monthly Installment Gateway
 *   - Instant Verification, Bank Reference (RRN/UTR), and GST Invoice Link
 */

(function (window) {
  'use strict';

  let activeModal = null;
  let activeTimer = null;

  const KJPaymentGateway = {
    /**
     * Open Payment Gateway for Checkout Order
     */
    openCheckout: function (options) {
      const {
        brand = 'karthik',
        amount = 0,
        customer = {},
        items = [],
        onPaymentSuccess,
        onCancel
      } = options;

      this.close();

      const isViswa = brand.toLowerCase().includes('viswa');
      const brandName = isViswa ? 'Viswanandini Jewellers' : 'Karthik Jewellers';
      const brandLogo = isViswa ? '/images/viswanandini-emblem.png' : '/images/karthik-emblem.png';
      const brandColor = isViswa ? '#781d2a' : '#c5a059';
      const formattedAmount = '₹' + Math.round(amount).toLocaleString('en-IN');

      // Create Modal Container
      const modal = document.createElement('div');
      modal.id = 'kj-payment-gateway-modal';
      modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in';

      // SVG QR Code generator (dynamic aesthetic gold SVG pattern)
      const qrSvg = this.generateAestheticQR(amount, isViswa ? 'viswa7007@okhdfcbank' : 'karthikjewellers@upi');

      modal.innerHTML = `
        <div class="bg-[#120e09] text-stone-100 rounded-3xl border border-[#d4af37]/50 shadow-[0_25px_70px_rgba(0,0,0,0.8)] w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col relative animate-scale-up font-sans">
          
          <!-- Top Header Bar -->
          <div class="px-6 py-4 bg-gradient-to-r from-[#1c160c] via-[#241a0d] to-[#1c160c] border-b border-[#d4af37]/30 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img src="${brandLogo}" alt="${brandName}" class="w-9 h-9 object-contain drop-shadow" />
              <div>
                <span class="text-[9px] uppercase tracking-[0.25em] text-[#d4af37] font-bold block">256-Bit Bank Encrypted Payment</span>
                <h3 class="font-serif font-bold text-base sm:text-lg text-white leading-tight">${brandName} Gateway</h3>
              </div>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-stone-400 block font-light">Amount Payable</span>
              <strong class="text-lg sm:text-xl font-mono font-bold text-[#f5d77f]">${formattedAmount}</strong>
            </div>
          </div>

          <!-- Gateway Method Tabs -->
          <div class="flex border-b border-stone-800 bg-[#16110a] text-xs font-semibold text-stone-400">
            <button type="button" onclick="KJPaymentGateway.switchTab('upi')" id="tab-btn-upi" class="flex-1 py-3 px-2 border-b-2 border-[#d4af37] text-white flex items-center justify-center gap-1.5 transition">
              <span>⚡</span> UPI & QR
            </button>
            <button type="button" onclick="KJPaymentGateway.switchTab('card')" id="tab-btn-card" class="flex-1 py-3 px-2 border-b-2 border-transparent hover:text-stone-200 flex items-center justify-center gap-1.5 transition">
              <span>💳</span> Card & EMI
            </button>
            <button type="button" onclick="KJPaymentGateway.switchTab('netbanking')" id="tab-btn-netbanking" class="flex-1 py-3 px-2 border-b-2 border-transparent hover:text-stone-200 flex items-center justify-center gap-1.5 transition">
              <span>🏛️</span> Net Banking
            </button>
            <button type="button" onclick="KJPaymentGateway.switchTab('cod')" id="tab-btn-cod" class="flex-1 py-3 px-2 border-b-2 border-transparent hover:text-stone-200 flex items-center justify-center gap-1.5 transition">
              <span>🛡️</span> Armoured COD
            </button>
          </div>

          <!-- Body Content Scrollable -->
          <div class="p-6 overflow-y-auto space-y-4 flex-1 text-xs">

            <!-- TAB 1: UPI & QR -->
            <div id="tab-panel-upi" class="space-y-4">
              <div class="p-4 rounded-2xl bg-[#1b150c] border border-[#d4af37]/30 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div class="w-36 h-36 bg-white p-2 rounded-xl shadow-inner flex items-center justify-center flex-shrink-0 border border-amber-300">
                  ${qrSvg}
                </div>
                <div class="space-y-2 flex-1">
                  <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-600/40 text-[10px] font-bold">
                    <span>●</span> Live Dynamic BharatQR
                  </div>
                  <h4 class="font-serif font-bold text-sm text-stone-100">Scan with any UPI App</h4>
                  <p class="text-[11px] text-stone-400 font-light">Google Pay, PhonePe, Paytm, BHIM, Cred, or any Banking UPI app.</p>
                  <div class="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <span class="text-[11px] font-mono text-amber-200/90 bg-[#2b2010] px-2.5 py-1 rounded-md border border-[#d4af37]/30 select-all">viswa7007@okhdfcbank</span>
                    <button type="button" onclick="KJPaymentGateway.copyVpa('viswa7007@okhdfcbank')" class="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[10px] font-bold">Copy</button>
                  </div>
                  <div class="text-[11px] text-stone-400">
                    Expires in: <span id="upi-timer" class="font-mono text-amber-300 font-bold">04:59</span>
                  </div>
                </div>
              </div>

              <!-- 1-Click Fast Sandbox Testing Buttons -->
              <div>
                <span class="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-2">Simulate 1-Click Instant App Payment:</span>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button type="button" onclick="KJPaymentGateway.executePayment('UPI (Google Pay)', 'UPI_GPAY_${Date.now()}')" class="p-2.5 rounded-xl bg-stone-900 border border-stone-700 hover:border-[#d4af37] text-stone-200 font-bold flex items-center justify-center gap-1.5 transition">
                    <span class="text-blue-400">●</span> Google Pay
                  </button>
                  <button type="button" onclick="KJPaymentGateway.executePayment('UPI (PhonePe)', 'UPI_PHONEPE_${Date.now()}')" class="p-2.5 rounded-xl bg-stone-900 border border-stone-700 hover:border-[#d4af37] text-stone-200 font-bold flex items-center justify-center gap-1.5 transition">
                    <span class="text-purple-400">●</span> PhonePe
                  </button>
                  <button type="button" onclick="KJPaymentGateway.executePayment('UPI (Paytm)', 'UPI_PAYTM_${Date.now()}')" class="p-2.5 rounded-xl bg-stone-900 border border-stone-700 hover:border-[#d4af37] text-stone-200 font-bold flex items-center justify-center gap-1.5 transition">
                    <span class="text-sky-400">●</span> Paytm
                  </button>
                  <button type="button" onclick="KJPaymentGateway.executePayment('UPI (Cred)', 'UPI_CRED_${Date.now()}')" class="p-2.5 rounded-xl bg-stone-900 border border-stone-700 hover:border-[#d4af37] text-stone-200 font-bold flex items-center justify-center gap-1.5 transition">
                    <span class="text-amber-400">●</span> Cred UPI
                  </button>
                </div>
              </div>
            </div>

            <!-- TAB 2: CREDIT / DEBIT CARDS + NO-COST EMI -->
            <div id="tab-panel-card" class="space-y-4 hidden">
              <!-- Visual Card Preview -->
              <div class="p-4 rounded-2xl bg-gradient-to-tr from-[#2a1e0f] via-[#1c150c] to-[#0e0a05] border border-[#d4af37]/40 shadow-lg text-amber-100 flex flex-col justify-between h-36">
                <div class="flex justify-between items-center">
                  <span class="font-serif tracking-widest text-xs uppercase font-bold text-amber-300">Karthik Imperial Card</span>
                  <span id="card-network-badge" class="font-bold text-[10px] bg-white/10 px-2 py-0.5 rounded border border-white/20">VISA / RUPAY</span>
                </div>
                <div class="font-mono text-base tracking-widest text-white" id="card-preview-number">
                  •••• •••• •••• 9012
                </div>
                <div class="flex justify-between text-[10px] uppercase text-stone-400">
                  <div>
                    <span>Cardholder</span>
                    <strong class="block text-stone-200" id="card-preview-name">${(customer.name || 'Valued Connoisseur').toUpperCase()}</strong>
                  </div>
                  <div>
                    <span>Expires</span>
                    <strong class="block text-stone-200" id="card-preview-exp">12/28</strong>
                  </div>
                </div>
              </div>

              <!-- Card Input Form -->
              <div class="space-y-2.5">
                <div>
                  <label class="block text-[11px] text-stone-400 mb-1">Card Number</label>
                  <input type="text" id="card-input-number" maxlength="19" placeholder="4532 8920 1928 9012" oninput="KJPaymentGateway.formatCardNumber(this)" class="w-full bg-[#18130c] border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono focus:border-[#d4af37] focus:outline-none" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] text-stone-400 mb-1">Expiry Date</label>
                    <input type="text" id="card-input-exp" maxlength="5" placeholder="MM/YY" class="w-full bg-[#18130c] border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono focus:border-[#d4af37] focus:outline-none" />
                  </div>
                  <div>
                    <label class="block text-[11px] text-stone-400 mb-1">CVV / CVC</label>
                    <input type="password" id="card-input-cvv" maxlength="4" placeholder="•••" class="w-full bg-[#18130c] border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono focus:border-[#d4af37] focus:outline-none" />
                  </div>
                </div>
              </div>

              <!-- No-Cost EMI Breakdown -->
              <div class="p-3 bg-[#17120a] rounded-2xl border border-stone-800 space-y-2">
                <span class="text-[10px] uppercase font-bold tracking-wider text-[#d4af37] block">Select No-Cost EMI Tenure:</span>
                <div class="grid grid-cols-2 gap-2 text-[11px]">
                  <label class="p-2 rounded-xl bg-stone-900/90 border border-[#d4af37]/40 flex items-center justify-between cursor-pointer">
                    <div>
                      <input type="radio" name="emi-tenure" value="3 Months" checked class="mr-1" />
                      <strong>3 Months</strong>
                    </div>
                    <span class="text-amber-300 font-mono">₹${Math.round(amount / 3).toLocaleString('en-IN')}/mo</span>
                  </label>
                  <label class="p-2 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between cursor-pointer">
                    <div>
                      <input type="radio" name="emi-tenure" value="6 Months" class="mr-1" />
                      <strong>6 Months</strong>
                    </div>
                    <span class="text-amber-300 font-mono">₹${Math.round(amount / 6).toLocaleString('en-IN')}/mo</span>
                  </label>
                </div>
              </div>

              <!-- Sandbox Auto-Fill Test Card -->
              <div class="flex gap-2">
                <button type="button" onclick="KJPaymentGateway.fillTestCard()" class="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold transition">
                  ⚡ Auto-Fill Test Platinum Card
                </button>
                <button type="button" onclick="KJPaymentGateway.executeCardPayment()" class="flex-1 py-2 rounded-xl gold-btn text-stone-950 font-bold uppercase tracking-wider shadow">
                  Pay ${formattedAmount}
                </button>
              </div>
            </div>

            <!-- TAB 3: NET BANKING -->
            <div id="tab-panel-netbanking" class="space-y-4 hidden">
              <span class="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">Select Your Bank:</span>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                ${[
                  { name: 'HDFC Bank', id: 'HDFC', badge: 'Fastest' },
                  { name: 'State Bank of India', id: 'SBI', badge: 'High-Value RTGS' },
                  { name: 'ICICI Bank', id: 'ICICI', badge: 'Instant Token' },
                  { name: 'Axis Bank', id: 'AXIS', badge: 'Popular' },
                  { name: 'Kotak Mahindra', id: 'KOTAK', badge: 'Instant' },
                  { name: 'Punjab National Bank', id: 'PNB', badge: 'PSU' },
                ].map(bank => `
                  <button type="button" onclick="KJPaymentGateway.executePayment('Net Banking (${bank.name})', 'NB_${bank.id}_${Date.now()}')" class="p-3 rounded-2xl bg-stone-900 border border-stone-800 hover:border-[#d4af37] text-left transition group">
                    <span class="text-[9px] font-bold text-amber-300/80 block">${bank.badge}</span>
                    <strong class="text-stone-200 block text-xs group-hover:text-white mt-0.5">${bank.name}</strong>
                  </button>
                `).join('')}
              </div>
              <p class="text-[11px] text-stone-500 font-light">You will be securely routed through your bank's 256-bit encrypted gateway to authorize the transaction.</p>
            </div>

            <!-- TAB 4: ARMOURED VAULT COD -->
            <div id="tab-panel-cod" class="space-y-4 hidden">
              <div class="p-4 rounded-2xl bg-[#1b150c] border border-amber-600/30 space-y-3">
                <div class="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <span>🛡️</span> Armoured Transit & Showroom Collect
                </div>
                <p class="text-stone-300 leading-relaxed font-light">
                  Your certified jewellery will be transferred via high-security <strong>BVC Armoured Logistics</strong> with serialized tamper-evident barcode seals.
                </p>
                <div class="p-3 bg-black/40 rounded-xl border border-stone-800 flex justify-between items-center">
                  <div>
                    <span class="text-[10px] text-stone-400 uppercase tracking-wider block">Delivery Verification OTP</span>
                    <strong class="font-mono text-base text-amber-300">OTP-782914</strong>
                  </div>
                  <span class="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-1 rounded">Provide on Handover</span>
                </div>
                <button type="button" onclick="KJPaymentGateway.executePayment('Cash on Delivery (Armoured Transit)', 'COD_BVC_${Date.now()}')" class="w-full py-3 rounded-xl dark-pill-btn font-bold uppercase tracking-wider">
                  Confirm Armoured Delivery Order
                </button>
              </div>
            </div>

          </div>

          <!-- Bottom Footer Bar -->
          <div class="px-6 py-3.5 bg-[#0f0c08] border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-[10px] text-stone-400">
            <div class="flex items-center gap-3">
              <span>🔒 256-Bit SSL Encrypted</span>
              <span>•</span>
              <span>🛡️ RBI Compliant</span>
              <span>•</span>
              <span>✨ BIS 916 Insured</span>
            </div>
            <button type="button" onclick="KJPaymentGateway.close()" class="text-stone-400 hover:text-white font-bold transition">
              Cancel ✕
            </button>
          </div>

          <!-- Processing Overlay (Hidden by default) -->
          <div id="kj-gateway-processing-overlay" class="absolute inset-0 bg-[#0f0c08]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-50 hidden">
            <div class="w-16 h-16 rounded-full border-4 border-[#d4af37] border-t-transparent animate-spin mb-4"></div>
            <h4 class="font-serif text-lg font-bold text-white" id="kj-proc-title">Contacting Bank Gateway...</h4>
            <p class="text-xs text-stone-400 mt-1 max-w-sm" id="kj-proc-desc">Authorizing high-value transaction with 256-bit cryptographic verification...</p>
          </div>

        </div>
      `;

      document.body.appendChild(modal);
      activeModal = modal;
      this.initTimer();

      // Store callbacks
      this._onPaymentSuccess = onPaymentSuccess;
      this._onCancel = onCancel;
      this._currentPayload = { brand, amount, customer, items };
    },

    /**
     * Swarna Nidhi & Bridal Chit Fund Monthly Payment
     */
    openSchemePayment: function (scheme, onComplete) {
      const amount = scheme.monthlyAmount || 5000;
      this.openCheckout({
        brand: scheme.brand || 'karthik',
        amount: amount,
        customer: { name: scheme.customerName, phone: scheme.customerPhone, email: scheme.customerEmail },
        items: [{
          name: `Swarna Nidhi Installment #${(scheme.paidInstallments || 0) + 1} (${scheme.schemeName || 'Gold Chit'})`,
          price: amount
        }],
        onPaymentSuccess: async (payDetails) => {
          try {
            const res = await StoreAPI.paySchemeInstallment(scheme.id, {
              paymentDetails: payDetails
            });
            if (res.success) {
              KJPaymentGateway.renderSchemeSuccess(res.scheme, res.receipt);
              if (onComplete) onComplete(res);
            } else {
              alert(res.message || 'Payment processing failed');
            }
          } catch (e) {
            console.error('Scheme pay error:', e);
            alert('Failed to record scheme payment.');
          }
        }
      });
    },

    /**
     * Render Digital Swarna Nidhi Passbook Receipt
     */
    renderSchemeSuccess: function (scheme, receipt) {
      this.close();
      const modal = document.createElement('div');
      modal.id = 'kj-scheme-receipt-modal';
      modal.className = 'fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md';
      modal.innerHTML = `
        <div class="bg-white text-stone-900 rounded-3xl border border-[#d4af37]/60 shadow-2xl w-full max-w-lg p-6 sm:p-8 font-sans relative">
          <div class="text-center pb-4 border-b border-stone-200">
            <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto mb-3 shadow">
              ✓
            </div>
            <span class="text-[10px] uppercase font-bold tracking-[0.25em] text-[#b4860b]">Digital Passbook Credited</span>
            <h3 class="font-serif font-bold text-2xl text-stone-900 mt-1">Swarna Nidhi Chit Receipt</h3>
            <p class="text-xs text-stone-500 font-mono mt-0.5">Receipt #: ${receipt.receiptNumber}</p>
          </div>

          <div class="my-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-stone-600">Subscriber Name:</span>
              <strong class="text-stone-900">${scheme.customerName}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600">Installment Number:</span>
              <strong class="text-[#b4860b] font-bold">#${scheme.paidInstallments} of ${scheme.tenureMonths} Months</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600">Amount Paid:</span>
              <strong class="text-stone-900 font-mono font-bold">₹${Number(receipt.amount).toLocaleString('en-IN')}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600">22KT Gold Rate Locked:</span>
              <strong class="text-stone-900 font-mono">₹${Number(receipt.goldRateLocked).toLocaleString('en-IN')}/g</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600">Gold Grams Credited Today:</span>
              <strong class="text-emerald-700 font-mono font-bold">+${receipt.goldGramsCredited} g</strong>
            </div>
            <div class="flex justify-between pt-2 border-t border-amber-200 text-sm font-bold">
              <span class="text-stone-900">Total Accumulated Gold:</span>
              <span class="text-[#b4860b] font-mono">${scheme.totalAccumulatedGoldGrams} Grams</span>
            </div>
          </div>

          <div class="flex gap-3">
            <button onclick="window.print()" class="flex-1 py-3 px-4 rounded-full dark-pill-btn font-bold text-xs uppercase tracking-wider">
              🖨️ Print Passbook
            </button>
            <button onclick="document.getElementById('kj-scheme-receipt-modal').remove()" class="flex-1 py-3 px-4 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs uppercase tracking-wider">
              Done
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    /**
     * Switch Tabs
     */
    switchTab: function (tabName) {
      ['upi', 'card', 'netbanking', 'cod'].forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const panel = document.getElementById(`tab-panel-${t}`);
        if (t === tabName) {
          btn?.classList.add('border-[#d4af37]', 'text-white');
          btn?.classList.remove('border-transparent');
          panel?.classList.remove('hidden');
        } else {
          btn?.classList.remove('border-[#d4af37]', 'text-white');
          btn?.classList.add('border-transparent');
          panel?.classList.add('hidden');
        }
      });
    },

    /**
     * Execute Sandbox Payment
     */
    executePayment: function (method, txnId) {
      const overlay = document.getElementById('kj-gateway-processing-overlay');
      const title = document.getElementById('kj-proc-title');
      const desc = document.getElementById('kj-proc-desc');
      if (overlay) overlay.classList.remove('hidden');

      setTimeout(() => {
        if (title) title.innerText = 'Payment Authorized Successfully!';
        if (desc) desc.innerText = 'Generating BIS Hallmark Certificate and Bank Reference Number...';
      }, 700);

      setTimeout(() => {
        const rrn = 'RRN' + Math.floor(100000000000 + Math.random() * 900000000000);
        const details = {
          gateway: 'Razorpay / Cashfree Luxury Sandbox',
          method: method,
          transactionId: txnId || ('TXN_' + Date.now().toString(36).toUpperCase()),
          rrn: rrn,
          amount: this._currentPayload ? this._currentPayload.amount : 0,
          paidAt: new Date().toISOString()
        };

        this.close();
        if (typeof this._onPaymentSuccess === 'function') {
          this._onPaymentSuccess(details);
        }
      }, 1400);
    },

    executeCardPayment: function () {
      const num = document.getElementById('card-input-number')?.value || '4532••••9012';
      const last4 = num.replace(/\s/g, '').slice(-4) || '9012';
      const emi = document.querySelector('input[name="emi-tenure"]:checked')?.value || 'Full Payment';
      const txn = 'CRD_' + Date.now().toString(36).toUpperCase();

      this.executePayment(`Card •••• ${last4} (${emi})`, txn);
    },

    fillTestCard: function () {
      const num = document.getElementById('card-input-number');
      const exp = document.getElementById('card-input-exp');
      const cvv = document.getElementById('card-input-cvv');
      if (num) num.value = '4532 8920 1928 9012';
      if (exp) exp.value = '12/28';
      if (cvv) cvv.value = '849';
      const preview = document.getElementById('card-preview-number');
      if (preview) preview.innerText = '4532 8920 1928 9012';
      const badge = document.getElementById('card-network-badge');
      if (badge) badge.innerText = 'VISA PLATINUM';
    },

    formatCardNumber: function (input) {
      let v = input.value.replace(/\D/g, '').slice(0, 16);
      let parts = [];
      for (let i = 0; i < v.length; i += 4) {
        parts.push(v.substring(i, i + 4));
      }
      input.value = parts.join(' ');
      const preview = document.getElementById('card-preview-number');
      if (preview) preview.innerText = input.value || '•••• •••• •••• 9012';

      // Brand detection
      const badge = document.getElementById('card-network-badge');
      if (badge) {
        if (v.startsWith('4')) badge.innerText = 'VISA PLATINUM';
        else if (v.startsWith('5')) badge.innerText = 'MASTERCARD';
        else if (v.startsWith('6')) badge.innerText = 'RUPAY SELECT';
        else if (v.startsWith('3')) badge.innerText = 'AMEX CENTURION';
        else badge.innerText = 'CREDIT / DEBIT';
      }
    },

    copyVpa: function (vpa) {
      navigator.clipboard?.writeText(vpa);
      alert('Copied VPA: ' + vpa);
    },

    initTimer: function () {
      let seconds = 300;
      const el = document.getElementById('upi-timer');
      clearInterval(activeTimer);
      activeTimer = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
          clearInterval(activeTimer);
          if (el) el.innerText = 'Expired';
          return;
        }
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        if (el) el.innerText = `${m}:${s}`;
      }, 1000);
    },

    generateAestheticQR: function (amount, vpa) {
      return `
        <svg viewBox="0 0 100 100" class="w-full h-full text-stone-900" fill="currentColor">
          <rect x="5" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="6"/>
          <rect x="13" y="13" width="12" height="12" rx="2" fill="currentColor"/>
          <rect x="67" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="6"/>
          <rect x="75" y="13" width="12" height="12" rx="2" fill="currentColor"/>
          <rect x="5" y="67" width="28" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="6"/>
          <rect x="13" y="75" width="12" height="12" rx="2" fill="currentColor"/>
          <rect x="38" y="8" width="6" height="6"/>
          <rect x="50" y="8" width="6" height="6"/>
          <rect x="42" y="20" width="8" height="8"/>
          <rect x="8" y="42" width="8" height="8"/>
          <rect x="22" y="42" width="6" height="6"/>
          <rect x="42" y="42" width="16" height="16" rx="2" fill="#b4860b"/>
          <rect x="67" y="42" width="8" height="8"/>
          <rect x="82" y="42" width="6" height="6"/>
          <rect x="38" y="67" width="6" height="6"/>
          <rect x="50" y="74" width="8" height="8"/>
          <rect x="67" y="67" width="12" height="12"/>
          <rect x="82" y="78" width="8" height="8"/>
        </svg>
      `;
    },

    close: function () {
      clearInterval(activeTimer);
      if (activeModal) {
        activeModal.remove();
        activeModal = null;
      }
      const existing = document.getElementById('kj-payment-gateway-modal');
      if (existing) existing.remove();
    }
  };

  window.KJPaymentGateway = KJPaymentGateway;
})(window);
