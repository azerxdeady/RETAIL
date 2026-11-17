package com.karthikjewellers.retail.service;

import com.karthikjewellers.retail.model.BullionRates;
import com.karthikjewellers.retail.model.PriceCalculation;
import com.karthikjewellers.retail.model.Product;
import org.springframework.stereotype.Service;

@Service
public class PriceCalculatorService {

    public PriceCalculation calculatePrice(Product product, BullionRates rates) {
        if (rates == null) {
            rates = new BullionRates(7850, 7215, 5910, 94, "", "System Default");
        }

        String purity = (product.getPurity() != null) ? product.getPurity().toUpperCase() : "22KT";
        double metalRate = rates.getGold22k();

        if (purity.contains("24")) {
            metalRate = rates.getGold24k();
        } else if (purity.contains("18")) {
            metalRate = rates.getGold18k();
        } else if (purity.contains("SILVER") || (product.getMetal() != null && product.getMetal().toLowerCase().contains("silver"))) {
            metalRate = rates.getSilver();
        }

        double netWeight = product.getNetWeight() > 0 ? product.getNetWeight() : (product.getGrossWeight() > 0 ? product.getGrossWeight() : 1.0);
        double grossWeight = product.getGrossWeight() > 0 ? product.getGrossWeight() : netWeight;
        long metalValue = Math.round(netWeight * metalRate);

        String mcType = product.getMakingChargeType() != null ? product.getMakingChargeType() : "percentage";
        double mcVal = product.getMakingChargeValue() > 0 ? product.getMakingChargeValue() : 12.0;
        long makingChargeAmount;

        if ("perGram".equalsIgnoreCase(mcType)) {
            makingChargeAmount = Math.round(grossWeight * mcVal);
        } else {
            makingChargeAmount = Math.round(metalValue * (mcVal / 100.0));
        }

        double stonePrice = product.getStonePrice();
        long subtotal = metalValue + makingChargeAmount + Math.round(stonePrice);
        long gstAmount = Math.round(subtotal * 0.03);
        long finalPrice = subtotal + gstAmount;

        PriceCalculation calc = new PriceCalculation();
        calc.setMetalRatePerGram(metalRate);
        calc.setNetWeight(netWeight);
        calc.setMetalValue(metalValue);
        calc.setMakingChargeType(mcType);
        calc.setMakingChargeValue(mcVal);
        calc.setMakingChargeAmount(makingChargeAmount);
        calc.setStonePrice(stonePrice);
        calc.setSubtotal(subtotal);
        calc.setGstPercentage(3.0);
        calc.setGstAmount(gstAmount);
        calc.setFinalPrice(finalPrice);

        return calc;
    }

    public Product enrichProduct(Product product, BullionRates rates) {
        PriceCalculation calc = calculatePrice(product, rates);
        product.setPricing(calc);
        product.setCurrentPrice(calc.getFinalPrice());
        return product;
    }
}
