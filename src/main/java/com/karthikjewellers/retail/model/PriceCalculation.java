package com.karthikjewellers.retail.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PriceCalculation {
    private double metalRatePerGram;
    private double netWeight;
    private long metalValue;
    private String makingChargeType;
    private double makingChargeValue;
    private long makingChargeAmount;
    private double stonePrice;
    private long subtotal;
    private double gstPercentage;
    private long gstAmount;
    private long finalPrice;

    public PriceCalculation() {}

    public double getMetalRatePerGram() { return metalRatePerGram; }
    public void setMetalRatePerGram(double metalRatePerGram) { this.metalRatePerGram = metalRatePerGram; }

    public double getNetWeight() { return netWeight; }
    public void setNetWeight(double netWeight) { this.netWeight = netWeight; }

    public long getMetalValue() { return metalValue; }
    public void setMetalValue(long metalValue) { this.metalValue = metalValue; }

    public String getMakingChargeType() { return makingChargeType; }
    public void setMakingChargeType(String makingChargeType) { this.makingChargeType = makingChargeType; }

    public double getMakingChargeValue() { return makingChargeValue; }
    public void setMakingChargeValue(double makingChargeValue) { this.makingChargeValue = makingChargeValue; }

    public long getMakingChargeAmount() { return makingChargeAmount; }
    public void setMakingChargeAmount(long makingChargeAmount) { this.makingChargeAmount = makingChargeAmount; }

    public double getStonePrice() { return stonePrice; }
    public void setStonePrice(double stonePrice) { this.stonePrice = stonePrice; }

    public long getSubtotal() { return subtotal; }
    public void setSubtotal(long subtotal) { this.subtotal = subtotal; }

    public double getGstPercentage() { return gstPercentage; }
    public void setGstPercentage(double gstPercentage) { this.gstPercentage = gstPercentage; }

    public long getGstAmount() { return gstAmount; }
    public void setGstAmount(long gstAmount) { this.gstAmount = gstAmount; }

    public long getFinalPrice() { return finalPrice; }
    public void setFinalPrice(long finalPrice) { this.finalPrice = finalPrice; }
}
