/**
 * ============================================================================
 * KARTHIK JEWELLERS & VISWANANDINI BRIDAL HOUSE
 * REAL-TIME LOCATION-BASED BULLION ENGINE (MULTI-CITY GOLD & SILVER RATES)
 * ============================================================================
 * Complies with India Bullion and Jewellers Association (IBJA) standards,
 * state bullion association benchmarks, and Bureau of Indian Standards (BIS).
 */

const db = require('./db');

const SUPPORTED_CITIES = [
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    isHq: true,
    lat: 11.0168,
    lng: 76.9558,
    association: 'The Coimbatore Jewellers Association (CJA Flagship Benchmark)',
    lab: 'BVC Precious Assaying & Hallmarking Centre (AHC Code: TN-042)',
    diff24k: 0,
    diff22k: 0,
    diff18k: 0,
    diffSilver: 0,
    dailyTrend: '+0.25%'
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    isHq: false,
    lat: 13.0827,
    lng: 80.2707,
    association: 'The Madras Jewellers & Diamond Merchants Association (MJDMA)',
    lab: 'Chennai Central Hallmarking Centre',
    diff24k: 15,
    diff22k: 15,
    diff18k: 10,
    diffSilver: 0.5,
    dailyTrend: '+0.30%'
  },
  {
    id: 'madurai',
    name: 'Madurai',
    state: 'Tamil Nadu',
    isHq: false,
    lat: 9.9252,
    lng: 78.1198,
    association: 'Madurai Jewellers Association',
    lab: 'Madurai Gold Assaying Laboratory',
    diff24k: 5,
    diff22k: 5,
    diff18k: 5,
    diffSilver: 0.2,
    dailyTrend: '+0.25%'
  },
  {
    id: 'salem',
    name: 'Salem',
    state: 'Tamil Nadu',
    isHq: false,
    lat: 11.6643,
    lng: 78.1460,
    association: 'Salem Bullion & Goldsmiths Guild',
    lab: 'Salem Regional Assaying Centre',
    diff24k: 0,
    diff22k: 0,
    diff18k: 0,
    diffSilver: 0,
    dailyTrend: '+0.20%'
  },
  {
    id: 'trichy',
    name: 'Tiruchirappalli (Trichy)',
    state: 'Tamil Nadu',
    isHq: false,
    lat: 10.7905,
    lng: 78.7047,
    association: 'Trichy Jewellers Federation',
    lab: 'Trichy Precious Metals Hallmarking Bureau',
    diff24k: 0,
    diff22k: 0,
    diff18k: 0,
    diffSilver: 0,
    dailyTrend: '+0.22%'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru (Bangalore)',
    state: 'Karnataka',
    isHq: false,
    lat: 12.9716,
    lng: 77.5946,
    association: 'The Jewellers Association Bengaluru (JAB)',
    lab: 'Karnataka State Bullion Verification Bureau',
    diff24k: -15,
    diff22k: -10,
    diff18k: -10,
    diffSilver: -0.5,
    dailyTrend: '+0.18%'
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    isHq: false,
    lat: 17.3850,
    lng: 78.4867,
    association: 'Twin Cities Jewellers Association (TCJA)',
    lab: 'Telangana Hallmarking & Assaying Hub',
    diff24k: -5,
    diff22k: 0,
    diff18k: -5,
    diffSilver: -0.2,
    dailyTrend: '+0.20%'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    isHq: false,
    lat: 19.0760,
    lng: 72.8777,
    association: 'India Bullion and Jewellers Association (IBJA Spot)',
    lab: 'Zaveri Bazaar Precious Metal Exchange',
    diff24k: -30,
    diff22k: -25,
    diff18k: -25,
    diffSilver: -1.0,
    dailyTrend: '+0.15%'
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    isHq: false,
    lat: 18.5204,
    lng: 73.8567,
    association: 'Pune Saraf Association',
    lab: 'Maharashtra Bullion Council',
    diff24k: -25,
    diff22k: -20,
    diff18k: -20,
    diffSilver: -1.0,
    dailyTrend: '+0.16%'
  },
  {
    id: 'delhi',
    name: 'New Delhi (NCR)',
    state: 'Delhi NCR',
    isHq: false,
    lat: 28.6139,
    lng: 77.2090,
    association: 'The Bullion & Jewellers Association Delhi (Dariba Kalan)',
    lab: 'North India Bullion Assaying Bureau',
    diff24k: -15,
    diff22k: -10,
    diff18k: -15,
    diffSilver: -0.8,
    dailyTrend: '+0.21%'
  },
  {
    id: 'kochi',
    name: 'Kochi (Kerala)',
    state: 'Kerala',
    isHq: false,
    lat: 9.9312,
    lng: 76.2673,
    association: 'All Kerala Gold & Silver Merchants Association (AKGSMA)',
    lab: 'Kerala State Hallmarking Authority',
    diff24k: -25,
    diff22k: -20,
    diff18k: -20,
    diffSilver: -1.0,
    dailyTrend: '+0.19%'
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    isHq: false,
    lat: 22.5726,
    lng: 88.3639,
    association: 'West Bengal Bullion & Swarna Shilpa Association',
    lab: 'Bowbazar Assaying & Hallmarking Centre',
    diff24k: -20,
    diff22k: -15,
    diff18k: -20,
    diffSilver: -0.8,
    dailyTrend: '+0.17%'
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    isHq: false,
    lat: 23.0225,
    lng: 72.5714,
    association: 'Choksi Mahajan Association Ahmedabad (Manek Chowk)',
    lab: 'Gujarat State Hallmarking Centre',
    diff24k: -10,
    diff22k: -5,
    diff18k: -10,
    diffSilver: -0.7,
    dailyTrend: '+0.22%'
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    isHq: false,
    lat: 26.9124,
    lng: 75.7873,
    association: 'Jaipur Sarafa Association (Johari Bazaar)',
    lab: 'Rajasthan Gem & Jewellery Assaying Bureau',
    diff24k: -5,
    diff22k: 0,
    diff18k: -5,
    diffSilver: -0.6,
    dailyTrend: '+0.20%'
  },
  {
    id: 'dubai',
    name: 'Dubai (UAE / NRI Trousseau)',
    state: 'United Arab Emirates',
    isHq: false,
    isInternational: true,
    currency: 'AED',
    lat: 25.2048,
    lng: 55.2708,
    association: 'Dubai Gold & Jewellery Group (DGJG Duty-Free Benchmark)',
    lab: 'Dubai Central Laboratory (Bareeq Certification)',
    fixedRates: {
      gold24k: 7120,
      gold22k: 6585,
      gold18k: 5435,
      silver: 88.0,
      localRates: { aed24k: 312.5, aed22k: 289.0, aed18k: 238.5, aedSilver: 3.86 }
    },
    dailyTrend: '+0.10%'
  }
];

/**
 * Calculate Great-Circle distance between two coordinates in kilometers (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

class LocationRateService {
  constructor() {
    this.cities = SUPPORTED_CITIES;
  }

  /**
   * Find closest supported bullion hub given latitude & longitude
   */
  findNearestCity(lat, lng) {
    const nLat = parseFloat(lat);
    const nLng = parseFloat(lng);
    if (isNaN(nLat) || isNaN(nLng)) {
      return { ...this.cities[0], distanceKm: 0 };
    }

    let nearest = this.cities[0];
    let minDistance = Infinity;

    for (const city of this.cities) {
      const d = calculateDistance(nLat, nLng, city.lat, city.lng);
      if (d < minDistance) {
        minDistance = d;
        nearest = city;
      }
    }

    return {
      ...nearest,
      distanceKm: minDistance
    };
  }

  /**
   * Resolve specific city rate profile based on ID or Name
   */
  getRatesForCity(cityQuery, baseRates = null) {
    if (!baseRates) {
      baseRates = db.getRates();
    }

    let city = this.cities[0]; // Coimbatore Flagship default
    if (cityQuery) {
      const q = String(cityQuery).trim().toLowerCase();
      const match = this.cities.find(c =>
        c.id.toLowerCase() === q ||
        c.name.toLowerCase() === q ||
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase() === q
      );
      if (match) city = match;
    }

    if (city.fixedRates) {
      return {
        ...baseRates,
        cityId: city.id,
        cityName: city.name,
        state: city.state,
        association: city.association,
        lab: city.lab,
        isHq: !!city.isHq,
        isInternational: !!city.isInternational,
        currency: city.currency || 'INR',
        gold24k: city.fixedRates.gold24k,
        gold22k: city.fixedRates.gold22k,
        gold18k: city.fixedRates.gold18k,
        silver: city.fixedRates.silver,
        localRates: city.fixedRates.localRates,
        dailyTrend: city.dailyTrend,
        variance22k: city.fixedRates.gold22k - baseRates.gold22k
      };
    }

    const gold24k = Math.round(baseRates.gold24k + city.diff24k);
    const gold22k = Math.round(baseRates.gold22k + city.diff22k);
    const gold18k = Math.round(baseRates.gold18k + city.diff18k);
    const silver = Number((baseRates.silver + city.diffSilver).toFixed(2));

    return {
      ...baseRates,
      cityId: city.id,
      cityName: city.name,
      state: city.state,
      association: city.association,
      lab: city.lab,
      isHq: !!city.isHq,
      isInternational: !!city.isInternational,
      currency: 'INR',
      gold24k,
      gold22k,
      gold18k,
      silver,
      dailyTrend: city.dailyTrend,
      variance22k: city.diff22k
    };
  }

  /**
   * Return full multi-city rates comparison index
   */
  getAllCityRates(baseRates = null) {
    if (!baseRates) {
      baseRates = db.getRates();
    }
    return this.cities.map(city => this.getRatesForCity(city.id, baseRates));
  }
}

module.exports = new LocationRateService();
