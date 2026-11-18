/**
 * ============================================================================
 * KARTHIK JEWELLERS & VISWANANDINI BRIDAL HOUSE
 * REAL-TIME GOLDAPI.IO INTEGRATION SERVICE
 * ============================================================================
 * Fetches real-time institutional bullion market rates for XAU/INR (Gold)
 * and XAG/INR (Silver) from GoldAPI.io.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const db = require('./db');

// Lightweight zero-dependency .env loader
try {
  const envPath = path.join(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  // Silent fallback
}

class GoldApiService {
  constructor() {
    this.apiKey = process.env.GOLDAPI_KEY || 'goldapi-348c09865431e7d2603b60400f263ff7-io';
    this.hostname = 'www.goldapi.io';
    this.cacheDurationMs = 15 * 60 * 1000; // 15-minute smart cache to protect monthly API quota
    this.lastFetched = null;
    this.cachedData = null;
    this.timer = null;
  }

  /**
   * HTTP GET Helper with promise & retry mechanism
   */
  requestJson(path) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.hostname,
        path: path,
        method: 'GET',
        headers: {
          'x-access-token': this.apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'KarthikJewellers-BullionSync/1.0'
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(body);
              resolve(parsed);
            } catch (err) {
              reject(new Error(`Failed to parse GoldAPI JSON: ${err.message}`));
            }
          } else {
            reject(new Error(`GoldAPI returned HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', err => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('GoldAPI request timed out after 10 seconds'));
      });

      req.end();
    });
  }

  async requestJsonWithRetry(path, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.requestJson(path);
      } catch (err) {
        if (attempt === retries) throw err;
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }

  /**
   * Fetch Live Gold (XAU/INR) and Silver (XAG/INR) Rates
   * @param {boolean} force - Whether to bypass 15-minute cache
   */
  async fetchLiveRates(force = false) {
    const now = Date.now();
    if (!force && this.cachedData && this.lastFetched && (now - this.lastFetched < this.cacheDurationMs)) {
      return {
        ...this.cachedData,
        fromCache: true,
        cacheExpiresInSeconds: Math.round((this.cacheDurationMs - (now - this.lastFetched)) / 1000)
      };
    }

    try {
      // Concurrently fetch Gold (with purity breakdown) and Silver
      const [goldRes, silverRes] = await Promise.all([
        this.requestJsonWithRetry('/api/price/XAU/INR?purity=true'),
        this.requestJsonWithRetry('/api/price/XAG/INR')
      ]);

      const melt = goldRes.melt_price_per_gram || {};
      const gold24k = Math.round(melt['24k'] || goldRes.price_per_unit?.gram || 11334);
      const gold22k = Math.round(melt['22k'] || (gold24k * 0.9167));
      const gold18k = Math.round(melt['18k'] || (gold24k * 0.75));
      const silverPerGram = silverRes.price_per_unit?.gram || 138;
      const silver = Number(silverPerGram.toFixed(1));

      const change = goldRes.change || 0;
      const changePercent = goldRes.change_percent || 0;
      const lastUpdatedIso = goldRes.datetime || new Date().toISOString();

      const ratePayload = {
        gold24k,
        gold22k,
        gold18k,
        silver,
        change,
        changePercent,
        symbol: goldRes.symbol || 'FX_IDC:XAUINR',
        exchange: goldRes.exchange || 'IDC Spot Bullion Exchange',
        source: 'GoldAPI.io Live Institutional Feed',
        lastUpdated: lastUpdatedIso,
        updatedBy: 'GoldAPI.io Real-Time Synchronizer'
      };

      // Persist to store database so all product prices recalculate
      const updatedInDb = db.updateRates(ratePayload);

      this.lastFetched = now;
      this.cachedData = {
        success: true,
        rates: updatedInDb,
        liveMeta: {
          ask: goldRes.ask,
          bid: goldRes.bid,
          high: goldRes.high_price,
          low: goldRes.low_price,
          change: change,
          changePercent: changePercent,
          rawPurity: melt,
          silverGram: silver
        }
      };

      return {
        ...this.cachedData,
        fromCache: false
      };
    } catch (err) {
      console.error('GoldAPI fetch failed:', err.message);
      // Fallback to database rates on error
      const currentRates = db.getRates();
      return {
        success: false,
        error: err.message,
        rates: currentRates,
        fallback: true
      };
    }
  }

  /**
   * Health and Status check
   */
  getStatus() {
    return {
      provider: 'goldapi.io',
      configured: Boolean(this.apiKey),
      apiKeyMasked: this.apiKey ? `${this.apiKey.substring(0, 10)}...${this.apiKey.substring(this.apiKey.length - 4)}` : 'NOT_SET',
      lastFetched: this.lastFetched ? new Date(this.lastFetched).toISOString() : null,
      cached: Boolean(this.cachedData)
    };
  }

  /**
   * Background automatic periodic sync (e.g., every 30 or 60 minutes)
   */
  startAutoSync(intervalMinutes = 60, broadcastCallback = null) {
    if (this.timer) clearInterval(this.timer);
    const ms = Math.max(15, intervalMinutes) * 60 * 1000;

    // Initial fetch on server start
    this.fetchLiveRates(false).then(res => {
      if (res.success && typeof broadcastCallback === 'function') {
        broadcastCallback(res.rates);
      }
    }).catch(e => console.warn('Initial GoldAPI sync deferred:', e.message));

    this.timer = setInterval(async () => {
      console.log('🔄 [GoldAPI] Running automated periodic bullion rate sync...');
      const res = await this.fetchLiveRates(true);
      if (res.success && typeof broadcastCallback === 'function') {
        broadcastCallback(res.rates);
      }
    }, ms);
  }
}

module.exports = new GoldApiService();
