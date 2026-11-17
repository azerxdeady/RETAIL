package com.karthikjewellers.retail.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Coupon {
    private String id;
    private String code;
    private String discountType = "percentage";
    private double discountValue;
    private String description;
    private double minOrderAmount;
    private Double maxDiscount;
    private String brand = "all";
    private String validUntil = "2026-12-31";
    private boolean isActive = true;
    private int usageCount = 0;

    public Coupon() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public double getDiscountValue() { return discountValue; }
    public void setDiscountValue(double discountValue) { this.discountValue = discountValue; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(double minOrderAmount) { this.minOrderAmount = minOrderAmount; }
    public double getMinOrderValue() { return minOrderAmount; }
    public void setMinOrderValue(double minOrderValue) { this.minOrderAmount = minOrderValue; }

    public Double getMaxDiscount() { return maxDiscount; }
    public void setMaxDiscount(Double maxDiscount) { this.maxDiscount = maxDiscount; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getValidUntil() { return validUntil; }
    public void setValidUntil(String validUntil) { this.validUntil = validUntil; }
    public String getExpiryDate() { return validUntil; }
    public void setExpiryDate(String expiryDate) { this.validUntil = expiryDate; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public int getUsageCount() { return usageCount; }
    public void setUsageCount(int usageCount) { this.usageCount = usageCount; }
}
