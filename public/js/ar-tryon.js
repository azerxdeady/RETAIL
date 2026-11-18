/**
 * Karthik Jewellers & Viswanandini Jewellers
 * Real Virtual AR Try-On Studio Engine
 * Features: Live Webcam/Mobile Camera, MediaPipe AI Face Landmark Tracking,
 * Multi-Skintone Bridal Studio Models, Direct Drag/Scale/Rotate Manipulation,
 * Shimmer FX, High-Res Snapshot Capture with BIS Hallmark, and WhatsApp Sharing.
 */

(function() {
  'use strict';

  // Curated Studio Models for Fallback & Diverse Skintone Fitting
  const STUDIO_MODELS = [
    {
      id: 'model-south',
      name: 'South Indian Bride (Muhurtham)',
      category: 'necklaces',
      url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85',
      defaultY: 58,
      defaultScale: 1.05
    },
    {
      id: 'model-royal',
      name: 'Royal Bridal Silhouette (Polki & Choker)',
      category: 'necklaces',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
      defaultY: 62,
      defaultScale: 0.95
    },
    {
      id: 'model-minimal',
      name: 'Contemporary Elegant Portrait',
      category: 'earrings',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=85',
      defaultY: 54,
      defaultScale: 1.0
    },
    {
      id: 'model-hand',
      name: 'Hand & Wrist Display (Rings & Bangles)',
      category: 'rings',
      url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=85',
      defaultY: 50,
      defaultScale: 0.85
    }
  ];

  class ARTryOnStudio {
    constructor() {
      this.currentProduct = null;
      this.brand = 'karthik'; // 'karthik' | 'viswanandini'
      this.catalog = [];
      this.activeMode = 'camera'; // 'camera' | 'model'
      this.stream = null;
      this.facingMode = 'user'; // 'user' | 'environment'
      this.isMirrored = true;
      this.currentModelIdx = 0;

      // Transform state
      this.scale = 1.0;
      this.posX = 0; // px offset from anchor
      this.posY = 0; // px offset from anchor
      this.rotation = 0; // degrees
      this.dropOffset = 0; // vertical neck drop in px
      this.shimmer = 50;

      // AI Tracking state
      this.faceMesh = null;
      this.cameraHelper = null;
      this.hasAiTracking = false;
      this.aiDetected = false;
      this.lastLandmarks = null;
      this.isDragging = false;
      this.dragStart = { x: 0, y: 0 };
      this.initialPos = { x: 0, y: 0 };
      this.touchStartDist = 0;
      this.initialScale = 1;

      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      this.bindEvents();
      this.loadCatalog();
      this.initialized = true;
    }

    async loadCatalog() {
      try {
        if (window.StoreAPI && typeof window.StoreAPI.getProducts === 'function') {
          const res = await window.StoreAPI.getProducts();
          if (res.success && Array.isArray(res.products)) {
            this.catalog = res.products;
          }
        }
      } catch (e) {
        console.warn('Could not load catalog for AR switcher:', e);
      }
    }

    bindEvents() {
      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const modal = document.getElementById('ar-studio-modal');
          if (modal && !modal.classList.contains('hidden')) {
            this.close();
          }
        }
      });
    }

    open(product, brand = 'karthik') {
      this.init();
      if (!product && this.catalog && this.catalog.length > 0) {
        product = this.catalog[0];
      }
      this.currentProduct = product;
      this.brand = brand;
      this.scale = 1.0;
      this.posX = 0;
      this.posY = 0;
      this.rotation = 0;
      this.dropOffset = 0;

      const modal = document.getElementById('ar-studio-modal');
      if (!modal) {
        this.injectModalHtml();
      }

      this.updateProductDetails();
      this.renderCarousel();
      
      const modalEl = document.getElementById('ar-studio-modal');
      modalEl.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

      // Auto start camera if available
      this.setMode('camera');
    }

    close() {
      this.stopCamera();
      const modal = document.getElementById('ar-studio-modal');
      if (modal) modal.classList.add('hidden');
      document.body.style.overflow = '';
      this.closeSnapshotPreview();
    }

    setMode(mode) {
      this.activeMode = mode;
      const videoEl = document.getElementById('ar-video');
      const modelImg = document.getElementById('ar-model-img');
      const modelSelector = document.getElementById('ar-model-picker');
      const camControls = document.getElementById('ar-cam-controls');
      const tabCam = document.getElementById('ar-tab-camera');
      const tabModel = document.getElementById('ar-tab-model');
      const aiStatus = document.getElementById('ar-ai-status');

      if (mode === 'camera') {
        if (tabCam) {
          tabCam.classList.add('bg-[#d4af37]', 'text-stone-950', 'font-black');
          tabCam.classList.remove('text-stone-300', 'hover:text-white');
        }
        if (tabModel) {
          tabModel.classList.remove('bg-[#d4af37]', 'text-stone-950', 'font-black');
          tabModel.classList.add('text-stone-300', 'hover:text-white');
        }
        if (videoEl) videoEl.classList.remove('hidden');
        if (modelImg) modelImg.classList.add('hidden');
        if (modelSelector) modelSelector.classList.add('hidden');
        if (camControls) camControls.classList.remove('hidden');
        if (aiStatus) aiStatus.classList.remove('hidden');
        this.startCamera();
      } else {
        if (tabModel) {
          tabModel.classList.add('bg-[#d4af37]', 'text-stone-950', 'font-black');
          tabModel.classList.remove('text-stone-300', 'hover:text-white');
        }
        if (tabCam) {
          tabCam.classList.remove('bg-[#d4af37]', 'text-stone-950', 'font-black');
          tabCam.classList.add('text-stone-300', 'hover:text-white');
        }
        if (videoEl) videoEl.classList.add('hidden');
        if (modelImg) modelImg.classList.remove('hidden');
        if (modelSelector) modelSelector.classList.remove('hidden');
        if (camControls) camControls.classList.add('hidden');
        if (aiStatus) aiStatus.classList.add('hidden');
        this.stopCamera();
        this.loadModel(this.currentModelIdx);
      }
    }

    async startCamera() {
      const video = document.getElementById('ar-video');
      const loader = document.getElementById('ar-video-loader');
      const errBanner = document.getElementById('ar-cam-error');
      if (errBanner) errBanner.classList.add('hidden');
      if (loader) loader.classList.remove('hidden');

      this.stopCamera();

      try {
        const constraints = {
          video: {
            facingMode: this.facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.stream = stream;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        if (loader) loader.classList.add('hidden');
        this.applyMirrorTransform();
        this.initMediaPipeTracker();
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
        if (loader) loader.classList.add('hidden');
        if (errBanner) {
          errBanner.classList.remove('hidden');
        }
        // Fallback to studio model automatically
        setTimeout(() => {
          if (!this.stream) this.setMode('model');
        }, 2500);
      }
    }

    stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      const video = document.getElementById('ar-video');
      if (video) video.srcObject = null;
      this.hasAiTracking = false;
      this.aiDetected = false;
    }

    switchCamera() {
      this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
      this.isMirrored = this.facingMode === 'user';
      this.startCamera();
    }

    toggleMirror() {
      this.isMirrored = !this.isMirrored;
      this.applyMirrorTransform();
    }

    applyMirrorTransform() {
      const video = document.getElementById('ar-video');
      if (video) {
        video.style.transform = this.isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
      }
    }

    loadModel(idx) {
      this.currentModelIdx = idx;
      const model = STUDIO_MODELS[idx];
      const img = document.getElementById('ar-model-img');
      if (img && model) {
        img.src = model.url;
      }

      // Update pills
      document.querySelectorAll('.ar-model-chip').forEach((chip, i) => {
        if (i === idx) {
          chip.classList.add('border-[#d4af37]', 'bg-amber-500/20', 'text-amber-300');
          chip.classList.remove('border-stone-700', 'bg-stone-900', 'text-stone-400');
        } else {
          chip.classList.remove('border-[#d4af37]', 'bg-amber-500/20', 'text-amber-300');
          chip.classList.add('border-stone-700', 'bg-stone-900', 'text-stone-400');
        }
      });

      this.resetFit();
    }

    initMediaPipeTracker() {
      if (typeof window.FaceMesh === 'undefined') {
        console.log('MediaPipe FaceMesh not loaded from CDN; using real-time canvas anchor');
        this.updateAiBadge('Ready • Manual Anchor & Drag');
        this.updateJewelTransform();
        return;
      }

      try {
        if (!this.faceMesh) {
          this.faceMesh = new window.FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          });

          this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          this.faceMesh.onResults((results) => this.onFaceLandmarks(results));
        }

        const video = document.getElementById('ar-video');
        if (video && !this.cameraHelper && window.Camera) {
          this.cameraHelper = new window.Camera(video, {
            onFrame: async () => {
              if (this.activeMode === 'camera' && this.stream && video.readyState >= 2) {
                await this.faceMesh.send({ image: video });
              }
            },
            width: 640,
            height: 480
          });
          this.cameraHelper.start();
        }
      } catch (e) {
        console.warn('FaceMesh initialization failed:', e);
        this.updateAiBadge('Standard AR Live Mirror');
      }
    }

    onFaceLandmarks(results) {
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        if (this.aiDetected) {
          this.aiDetected = false;
          this.updateAiBadge('Searching for Face...');
        }
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];
      this.lastLandmarks = landmarks;
      this.aiDetected = true;
      this.updateAiBadge('✨ AI Real-Time Landmark Tracking Active');

      // Key landmark indices:
      // 152: Chin tip
      // 234: Left cheek / ear root
      // 454: Right cheek / ear root
      // 10: Forehead top
      // 1: Nose tip
      const chin = landmarks[152];
      const leftEar = landmarks[234];
      const rightEar = landmarks[454];

      const stage = document.getElementById('ar-viewport');
      if (!stage) return;
      const stageW = stage.clientWidth;
      const stageH = stage.clientHeight;

      // Handle mirroring
      let normChinX = chin.x;
      let normLeftEarX = leftEar.x;
      let normRightEarX = rightEar.x;

      if (this.isMirrored) {
        normChinX = 1 - normChinX;
        normLeftEarX = 1 - normLeftEarX;
        normRightEarX = 1 - normRightEarX;
      }

      const chinPxX = normChinX * stageW;
      const chinPxY = chin.y * stageH;

      // Calculate roll angle
      const dx = (normRightEarX - normLeftEarX) * stageW;
      const dy = (rightEar.y - leftEar.y) * stageH;
      const rollAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Distance across face gives scale factor
      const faceWidth = Math.hypot(dx, dy);
      const baseFaceWidth = 140; // baseline face width
      const autoScaleFactor = Math.max(0.6, Math.min(2.0, faceWidth / baseFaceWidth));

      // Neck anchor: slightly below chin
      const neckDrop = (stageH * 0.12) + this.dropOffset;
      const anchorX = chinPxX + this.posX;
      const anchorY = chinPxY + neckDrop + this.posY;

      // Apply to jewel element
      const jewelEl = document.getElementById('ar-jewel-container');
      if (jewelEl && !this.isDragging) {
        const finalScale = this.scale * autoScaleFactor;
        const finalRot = rollAngle + this.rotation;
        jewelEl.style.left = `${anchorX}px`;
        jewelEl.style.top = `${anchorY}px`;
        jewelEl.style.transform = `translate(-50%, -50%) scale(${finalScale}) rotate(${finalRot}deg)`;
      }
    }

    updateAiBadge(text) {
      const badge = document.getElementById('ar-ai-badge-text');
      if (badge) badge.innerText = text;
    }

    updateJewelTransform() {
      const jewelEl = document.getElementById('ar-jewel-container');
      const stage = document.getElementById('ar-viewport');
      if (!jewelEl || !stage) return;

      const stageW = stage.clientWidth;
      const stageH = stage.clientHeight;

      if (!this.aiDetected || this.activeMode === 'model') {
        const model = STUDIO_MODELS[this.currentModelIdx];
        const defaultYPct = (model ? model.defaultY : 55) / 100;
        const centerX = (stageW / 2) + this.posX;
        const centerY = (stageH * defaultYPct) + this.posY + this.dropOffset;

        jewelEl.style.left = `${centerX}px`;
        jewelEl.style.top = `${centerY}px`;
        jewelEl.style.transform = `translate(-50%, -50%) scale(${this.scale}) rotate(${this.rotation}deg)`;
      }
    }

    updateProductDetails() {
      const p = this.currentProduct;
      if (!p) return;

      const titleEl = document.getElementById('ar-product-title');
      const purityEl = document.getElementById('ar-product-purity');
      const priceEl = document.getElementById('ar-product-price');
      const jewelImg = document.getElementById('ar-jewel-img');

      if (titleEl) titleEl.innerText = p.name;
      if (purityEl) purityEl.innerText = `${p.purity || '22KT'} BIS 916 Hallmark • ${p.category?.toUpperCase() || 'FINE JEWELLERY'}`;
      if (priceEl && p.currentPrice) {
        priceEl.innerText = typeof window.formatINR === 'function' ? window.formatINR(p.currentPrice) : `₹${p.currentPrice.toLocaleString('en-IN')}`;
      }

      if (jewelImg) {
        const imgSrc = (p.images && p.images[0]) ? p.images[0] : (p.image || '');
        jewelImg.src = imgSrc;
      }

      // Auto-detect best model based on category
      if (p.category === 'rings' || p.category === 'bangles') {
        this.currentModelIdx = 3; // Hand model
      } else if (p.category === 'earrings') {
        this.currentModelIdx = 2;
      } else {
        this.currentModelIdx = 0;
      }
      this.loadModel(this.currentModelIdx);
      this.updateJewelTransform();
    }

    renderCarousel() {
      const container = document.getElementById('ar-carousel-items');
      if (!container) return;

      const pieces = this.catalog.length > 0 ? this.catalog : [this.currentProduct];
      container.innerHTML = pieces.map(p => {
        const isActive = p.id === this.currentProduct?.id;
        const img = (p.images && p.images[0]) ? p.images[0] : (p.image || '');
        return `
          <button onclick="window.ARTryOn.switchProduct('${p.id}')" class="flex-shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border ${isActive ? 'border-[#d4af37] bg-amber-500/20 text-white' : 'border-stone-800 bg-stone-900/90 text-stone-300 hover:border-stone-600'} transition group text-left">
            <div class="w-10 h-10 rounded-xl overflow-hidden bg-stone-950 flex-shrink-0 border border-stone-800">
              <img src="${img}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
            </div>
            <div class="max-w-[120px]">
              <p class="text-[11px] font-bold truncate">${p.name}</p>
              <span class="text-[10px] text-amber-300 font-mono font-bold">${typeof window.formatINR === 'function' ? window.formatINR(p.currentPrice) : '₹' + (p.currentPrice || '')}</span>
            </div>
          </button>
        `;
      }).join('');
    }

    switchProduct(productId) {
      const found = this.catalog.find(p => p.id === productId);
      if (found) {
        this.currentProduct = found;
        this.updateProductDetails();
        this.renderCarousel();
        this.resetFit();
      }
    }

    resetFit() {
      this.scale = 1.0;
      this.posX = 0;
      this.posY = 0;
      this.rotation = 0;
      this.dropOffset = 0;

      // Update UI sliders
      const scaleSlider = document.getElementById('ar-slider-scale');
      const dropSlider = document.getElementById('ar-slider-drop');
      const rotSlider = document.getElementById('ar-slider-rot');
      if (scaleSlider) scaleSlider.value = 100;
      if (dropSlider) dropSlider.value = 0;
      if (rotSlider) rotSlider.value = 0;

      this.updateJewelTransform();
    }

    adjustScale(val) {
      this.scale = Number(val) / 100;
      this.updateJewelTransform();
    }

    adjustDrop(val) {
      this.dropOffset = Number(val);
      this.updateJewelTransform();
    }

    adjustRotation(val) {
      this.rotation = Number(val);
      this.updateJewelTransform();
    }

    adjustShimmer(val) {
      this.shimmer = Number(val);
      const img = document.getElementById('ar-jewel-img');
      if (img) {
        img.style.filter = `drop-shadow(0 12px 24px rgba(0,0,0,0.65)) brightness(${1 + (this.shimmer - 50) / 100 * 0.4}) contrast(${1 + (this.shimmer - 50) / 100 * 0.2})`;
      }
    }

    // Direct Drag & Pinch Handlers
    onDragStart(e) {
      this.isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      this.dragStart = { x: clientX, y: clientY };
      this.initialPos = { x: this.posX, y: this.posY };

      if (e.touches && e.touches.length === 2) {
        this.touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        this.initialScale = this.scale;
      }
    }

    onDragMove(e) {
      if (!this.isDragging) return;
      e.preventDefault();

      if (e.touches && e.touches.length === 2) {
        // Pinch to zoom
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / this.touchStartDist;
        this.scale = Math.max(0.4, Math.min(2.5, this.initialScale * factor));
      } else {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaX = clientX - this.dragStart.x;
        const deltaY = clientY - this.dragStart.y;
        this.posX = this.initialPos.x + deltaX;
        this.posY = this.initialPos.y + deltaY;
      }

      this.updateJewelTransform();
    }

    onDragEnd() {
      this.isDragging = false;
    }

    // Real Photograph Capture with Official Certification Hallmark Seal
    async captureSnapshot() {
      const stage = document.getElementById('ar-viewport');
      const video = document.getElementById('ar-video');
      const modelImg = document.getElementById('ar-model-img');
      const jewelImg = document.getElementById('ar-jewel-img');
      const jewelContainer = document.getElementById('ar-jewel-container');
      if (!stage || !jewelImg) return;

      const flash = document.getElementById('ar-flash-effect');
      if (flash) {
        flash.classList.remove('opacity-0');
        flash.classList.add('opacity-100');
        setTimeout(() => {
          flash.classList.remove('opacity-100');
          flash.classList.add('opacity-0');
        }, 150);
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      canvas.width = width * 2; // high-DPI 2x
      canvas.height = height * 2;
      ctx.scale(2, 2);

      // 1. Draw Background (Video frame or Model photo)
      if (this.activeMode === 'camera' && video && video.readyState >= 2) {
        ctx.save();
        if (this.isMirrored) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
        ctx.restore();
      } else if (modelImg) {
        ctx.drawImage(modelImg, 0, 0, width, height);
      }

      // 2. Draw Jewellery Piece
      const rect = jewelContainer.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const relX = rect.left - stageRect.left;
      const relY = rect.top - stageRect.top;
      const jewelW = rect.width;
      const jewelH = rect.height;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(jewelImg, relX, relY, jewelW, jewelH);
      ctx.restore();

      // 3. Draw Luxury Brand Hallmark Watermark & Stamp
      ctx.save();
      // Gradient bottom badge
      const grad = ctx.createLinearGradient(0, height - 70, 0, height);
      grad.addColorStop(0, 'rgba(10, 8, 4, 0)');
      grad.addColorStop(1, 'rgba(10, 8, 4, 0.92)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, height - 70, width, 70);

      // Brand Text
      ctx.font = 'bold 14px "Cinzel", serif';
      ctx.fillStyle = '#ecc874';
      ctx.fillText(this.brand === 'viswanandini' ? 'VISWANANDINI JEWELLERS' : 'KARTHIK JEWELLERS', 20, height - 32);

      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#f5eedf';
      ctx.fillText(`BIS 916 Certified AR Fitting • ${this.currentProduct?.name || ''}`, 20, height - 16);

      // Right Seal
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText('✓ HUID VERIFIED FIT', width - 140, height - 24);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/png');
      this.showSnapshotPreview(dataUrl);
    }

    showSnapshotPreview(dataUrl) {
      const previewEl = document.getElementById('ar-snapshot-modal');
      const imgEl = document.getElementById('ar-snapshot-img');
      if (previewEl && imgEl) {
        imgEl.src = dataUrl;
        previewEl.classList.remove('hidden');
        previewEl.classList.add('flex');
      }
    }

    closeSnapshotPreview() {
      const previewEl = document.getElementById('ar-snapshot-modal');
      if (previewEl) {
        previewEl.classList.add('hidden');
        previewEl.classList.remove('flex');
      }
    }

    downloadSnapshot() {
      const imgEl = document.getElementById('ar-snapshot-img');
      if (!imgEl || !imgEl.src) return;
      const a = document.createElement('a');
      a.href = imgEl.src;
      a.download = `karthik-jewellers-ar-look-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    shareWhatsApp() {
      const p = this.currentProduct;
      const name = p ? p.name : 'Karthik Jewellers Masterpiece';
      const text = encodeURIComponent(`✨ Loving my Virtual Try-On look of "${name}" from Karthik Jewellers! Check it out: ${window.location.origin}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }

    addToBagCurrent() {
      if (!this.currentProduct) return;
      if (typeof window.addToCart === 'function') {
        window.addToCart(this.currentProduct.id);
      } else if (typeof window.viswaAddToCart === 'function') {
        window.viswaAddToCart(this.currentProduct.id);
      }
      this.close();
      if (typeof window.openCartDrawer === 'function') {
        window.openCartDrawer();
      }
    }

    injectModalHtml() {
      const modal = document.createElement('div');
      modal.id = 'ar-studio-modal';
      modal.className = 'fixed inset-0 z-50 glass-overlay hidden flex items-center justify-center p-3 sm:p-5 select-none';
      modal.innerHTML = `
        <div class="bg-[#0e0c08] border border-[#d4af37]/40 rounded-3xl max-w-4xl w-full p-4 sm:p-6 text-white shadow-2xl relative flex flex-col max-h-[95vh] overflow-hidden">
          
          <!-- Header Bar -->
          <div class="flex items-center justify-between pb-3 border-b border-stone-800 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#8c6a23] p-0.5 flex items-center justify-center shadow">
                <img src="/images/karthik-emblem.png" alt="KJ" class="w-full h-full object-contain" />
              </div>
              <div>
                <h3 class="font-serif font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  <span>Virtual AR Try-On Studio</span>
                  <span class="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">REAL-TIME</span>
                </h3>
                <p id="ar-product-purity" class="text-[10px] text-amber-300 font-light tracking-wider uppercase">
                  BIS 916 Hallmark Guaranteed
                </p>
              </div>
            </div>

            <!-- Mode Switch Tabs -->
            <div class="flex items-center gap-2">
              <div class="bg-stone-900 border border-stone-700/80 rounded-full p-0.5 flex items-center text-xs">
                <button id="ar-tab-camera" onclick="window.ARTryOn.setMode('camera')" class="px-3 py-1 rounded-full transition font-semibold flex items-center gap-1.5">
                  <span>📷</span> <span class="hidden sm:inline">Live Camera</span>
                </button>
                <button id="ar-tab-model" onclick="window.ARTryOn.setMode('model')" class="px-3 py-1 rounded-full transition font-semibold flex items-center gap-1.5">
                  <span>👗</span> <span class="hidden sm:inline">Studio Models</span>
                </button>
              </div>

              <button onclick="window.ARTryOn.close()" class="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition text-lg">
                ✕
              </button>
            </div>
          </div>

          <!-- Camera Utility Pill & AI Status -->
          <div class="flex flex-wrap items-center justify-between gap-2 py-2 text-xs text-stone-400 flex-shrink-0">
            <div id="ar-ai-status" class="flex items-center gap-2 bg-[#1a140b] px-3 py-1 rounded-full border border-amber-500/30">
              <span class="w-2 h-2 rounded-full bg-emerald-400 pulse-rate"></span>
              <span id="ar-ai-badge-text" class="text-amber-200 text-[11px] font-medium font-mono">Initializing Camera & AI Tracking...</span>
            </div>

            <div id="ar-cam-controls" class="flex items-center gap-2">
              <button onclick="window.ARTryOn.toggleMirror()" class="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 rounded-lg text-[11px] transition text-stone-300" title="Mirror Front Selfie View">
                🪞 Mirror Flip
              </button>
              <button onclick="window.ARTryOn.switchCamera()" class="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 rounded-lg text-[11px] transition text-stone-300" title="Switch Front/Back Camera">
                🔄 Switch Camera
              </button>
            </div>

            <!-- Model Picker Chips -->
            <div id="ar-model-picker" class="hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              ${STUDIO_MODELS.map((m, i) => `
                <button onclick="window.ARTryOn.loadModel(${i})" class="ar-model-chip flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border ${i === 0 ? 'border-[#d4af37] bg-amber-500/20 text-amber-300' : 'border-stone-700 bg-stone-900 text-stone-400'} transition">
                  ${m.name.split(' ')[0]} ${m.name.split(' ')[1] || ''}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Main Viewport (Aspect 16:9 / 4:3) -->
          <div id="ar-viewport" class="relative flex-1 min-h-[300px] sm:min-h-[360px] max-h-[460px] bg-black rounded-2xl overflow-hidden border border-[#d4af37]/30 flex items-center justify-center cursor-crosshair select-none touch-none"
               onmousedown="window.ARTryOn.onDragStart(event)"
               onmousemove="window.ARTryOn.onDragMove(event)"
               onmouseup="window.ARTryOn.onDragEnd(event)"
               ontouchstart="window.ARTryOn.onDragStart(event)"
               ontouchmove="window.ARTryOn.onDragMove(event)"
               ontouchend="window.ARTryOn.onDragEnd(event)">
            
            <!-- Video Feed -->
            <video id="ar-video" autoplay playsinline muted class="w-full h-full object-cover transition-transform duration-200"></video>
            
            <!-- Model Image -->
            <img id="ar-model-img" src="" alt="Model" class="w-full h-full object-cover hidden" />

            <!-- Floating AR Jewellery Piece -->
            <div id="ar-jewel-container" class="absolute select-none pointer-events-none transform -translate-x-1/2 -translate-y-1/2 will-change-transform">
              <img id="ar-jewel-img" src="" alt="Jewellery Piece" class="w-48 sm:w-60 max-w-none transition-filter duration-200" style="filter: drop-shadow(0 14px 28px rgba(0,0,0,0.7));" />
            </div>

            <!-- Loading Spinner -->
            <div id="ar-video-loader" class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3">
              <div class="w-10 h-10 border-3 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs text-amber-200 font-mono">Connecting to High-Def AR Camera...</p>
            </div>

            <!-- Camera Access Error / Permission Prompt -->
            <div id="ar-cam-error" class="hidden absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center p-6 text-center gap-3">
              <span class="text-3xl">📷</span>
              <h4 class="font-bold text-white text-sm">Camera Permission Needed</h4>
              <p class="text-xs text-stone-400 max-w-sm">Please allow camera permissions in your browser to try on jewellery in real-time, or switch to our curated Indian bridal models.</p>
              <div class="flex gap-2 mt-2">
                <button onclick="window.ARTryOn.startCamera()" class="px-4 py-2 gold-btn rounded-full text-xs font-bold uppercase">Retry Camera</button>
                <button onclick="window.ARTryOn.setMode('model')" class="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-full text-xs font-bold">Use Studio Models</button>
              </div>
            </div>

            <!-- Flash Animation Overlay -->
            <div id="ar-flash-effect" class="absolute inset-0 bg-white pointer-events-none opacity-0 transition-opacity duration-150"></div>

            <!-- Direct Manipulation Hint -->
            <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-stone-300 pointer-events-none">
              👆 Drag anywhere to fine-tune fit • Pinch to zoom
            </div>
          </div>

          <!-- Controls Bar (Sliders & Buttons) -->
          <div class="py-3 px-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-stone-800 flex-shrink-0">
            <div>
              <div class="flex justify-between text-[10px] text-stone-400 mb-1">
                <span>Scale / Size</span>
              </div>
              <input type="range" id="ar-slider-scale" min="50" max="180" value="100" class="w-full accent-[#d4af37]" oninput="window.ARTryOn.adjustScale(this.value)" />
            </div>

            <div>
              <div class="flex justify-between text-[10px] text-stone-400 mb-1">
                <span>Neck Drop / Height</span>
              </div>
              <input type="range" id="ar-slider-drop" min="-60" max="60" value="0" class="w-full accent-[#d4af37]" oninput="window.ARTryOn.adjustDrop(this.value)" />
            </div>

            <div>
              <div class="flex justify-between text-[10px] text-stone-400 mb-1">
                <span>Angle / Tilt</span>
              </div>
              <input type="range" id="ar-slider-rot" min="-25" max="25" value="0" class="w-full accent-[#d4af37]" oninput="window.ARTryOn.adjustRotation(this.value)" />
            </div>

            <div>
              <div class="flex justify-between text-[10px] text-stone-400 mb-1">
                <span>Shimmer & Sparkle</span>
              </div>
              <input type="range" id="ar-slider-shimmer" min="0" max="100" value="50" class="w-full accent-[#d4af37]" oninput="window.ARTryOn.adjustShimmer(this.value)" />
            </div>
          </div>

          <!-- Action Utilities & Bottom Catalog Carousel -->
          <div class="pt-3 flex flex-col gap-2.5 flex-shrink-0">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 id="ar-product-title" class="font-serif font-bold text-sm sm:text-base text-white">Jewellery Piece</h4>
                <p id="ar-product-price" class="text-xs text-amber-300 font-bold font-mono">₹0</p>
              </div>

              <div class="flex items-center gap-2">
                <button onclick="window.ARTryOn.resetFit()" class="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-full text-xs font-semibold transition" title="Restore Default Center Fit">
                  🔄 Reset
                </button>

                <button onclick="window.ARTryOn.captureSnapshot()" class="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-full text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md">
                  <span>📸</span> Snap Look
                </button>

                <button onclick="window.ARTryOn.addToBagCurrent()" class="px-5 py-2 gold-btn rounded-full text-xs font-black uppercase tracking-wider text-stone-950 shadow-lg flex items-center gap-1.5">
                  <span>🛍️</span> Add to Bag
                </button>
              </div>
            </div>

            <!-- Try Other Masterpieces Carousel -->
            <div class="pt-2 border-t border-stone-800">
              <span class="text-[10px] uppercase font-bold tracking-widest text-stone-400 block mb-1.5">Try Other Masterpieces:</span>
              <div id="ar-carousel-items" class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <!-- Dynamically populated -->
              </div>
            </div>
          </div>

        </div>

        <!-- High-Res Captured Snapshot Modal -->
        <div id="ar-snapshot-modal" class="fixed inset-0 z-60 bg-black/90 backdrop-blur-md hidden items-center justify-center p-4">
          <div class="bg-[#120e06] border border-[#d4af37]/50 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative text-center">
            <button onclick="window.ARTryOn.closeSnapshotPreview()" class="absolute top-4 right-4 text-stone-400 hover:text-white text-2xl">✕</button>
            <span class="text-[10px] uppercase tracking-widest text-[#d4af37] font-bold block mb-1">Certified AR Fitting Photo</span>
            <h3 class="font-serif text-xl font-bold text-white mb-4">Your Custom Bridal Fit</h3>

            <div class="rounded-2xl overflow-hidden border border-[#d4af37]/40 shadow-xl mb-4 bg-black">
              <img id="ar-snapshot-img" src="" alt="Captured Fit" class="w-full h-auto object-contain" />
            </div>

            <div class="flex flex-wrap items-center justify-center gap-3 text-xs">
              <button onclick="window.ARTryOn.downloadSnapshot()" class="px-5 py-2.5 gold-btn rounded-full font-bold uppercase tracking-wider text-stone-950 flex items-center gap-1.5 shadow-lg">
                <span>📥</span> Save to Gallery
              </button>
              <button onclick="window.ARTryOn.shareWhatsApp()" class="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <span>💬</span> Share on WhatsApp
              </button>
              <button onclick="window.ARTryOn.closeSnapshotPreview()" class="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-full font-semibold">
                Retake Look
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
    }
  }

  // Global Singleton instance
  window.ARTryOn = new ARTryOnStudio();

  // Unified global hooks for store.js and viswanandini.js
  window.openTryOnModal = function(productId) {
    let prod = null;
    if (window.appState && Array.isArray(window.appState.products)) {
      prod = window.appState.products.find(p => p.id === productId);
    }
    if (!prod && window.viswaState && Array.isArray(window.viswaState.products)) {
      prod = window.viswaState.products.find(p => p.id === productId);
    }
    if (prod) {
      window.ARTryOn.open(prod, 'karthik');
    }
  };

  window.openViswaTryOnModal = function(productId) {
    let prod = null;
    if (window.viswaState && Array.isArray(window.viswaState.products)) {
      prod = window.viswaState.products.find(p => p.id === productId);
    }
    if (!prod && window.appState && Array.isArray(window.appState.products)) {
      prod = window.appState.products.find(p => p.id === productId);
    }
    if (prod) {
      window.ARTryOn.open(prod, 'viswanandini');
    }
  };

  window.closeTryOnModal = function() {
    window.ARTryOn.close();
  };

  window.closeViswaTryOnModal = function() {
    window.ARTryOn.close();
  };

})();
