function calculateJewelleryPrice(product, rates) {
  if (!rates) {
    rates = { gold24k: 7850, gold22k: 7215, gold18k: 5910, silver: 94, gstPercentage: 3 };
  }

  let metalRate = rates.gold22k;
  const purity = (product.purity || '').toUpperCase();

  if (purity.includes('24KT') || purity.includes('24K')) {
    metalRate = rates.gold24k;
  } else if (purity.includes('22KT') || purity.includes('22K') || purity.includes('916')) {
    metalRate = rates.gold22k;
  } else if (purity.includes('18KT') || purity.includes('18K') || purity.includes('750')) {
    metalRate = rates.gold18k;
  } else if (purity.includes('SILVER') || purity.includes('925') || purity.includes('999')) {
    metalRate = rates.silver;
  }

  const netWeight = parseFloat(product.netWeight) || 0;
  const grossWeight = parseFloat(product.grossWeight) || netWeight;
  const stonePrice = parseFloat(product.stonePrice) || 0;

  const metalValue = Math.round(netWeight * metalRate);

  let makingCharges = 0;
  const makingChargeVal = parseFloat(product.makingChargeValue) || 0;
  if (product.makingChargeType === 'perGram') {
    makingCharges = Math.round(grossWeight * makingChargeVal);
  } else {
    // Percentage on metal value
    makingCharges = Math.round(metalValue * (makingChargeVal / 100));
  }

  const subtotal = metalValue + makingCharges + stonePrice;
  const gstPercentage = rates.gstPercentage || 3;
  const gstAmount = Math.round(subtotal * (gstPercentage / 100));
  const finalPrice = subtotal + gstAmount;

  return {
    metalRate,
    netWeight,
    grossWeight,
    metalValue,
    makingCharges,
    stonePrice,
    subtotal,
    gstPercentage,
    gstAmount,
    finalPrice
  };
}

module.exports = {
  calculateJewelleryPrice
};

