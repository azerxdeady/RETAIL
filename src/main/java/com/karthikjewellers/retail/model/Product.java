package com.karthikjewellers.retail.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Product {
    private String id;
    private String sku;
    private String brand = "karthik";
    private String name;
    private String category;
    private String purity;
    private String metal;
    private double grossWeight;
    private double netWeight;
    private double stoneWeight;
    private String stoneType = "None";
    private double stonePrice;
    private String makingChargeType = "percentage";
    private double makingChargeValue = 12.0;
    private String huid;
    private String certification = "BIS 916 Hallmarked";
    private boolean inStock = true;
    private int stockCount = 5;

    @JsonProperty("isFeatured")
    private boolean isFeatured;

    @JsonProperty("isBestseller")
    private boolean isBestseller;

    @JsonProperty("isNew")
    private boolean isNew;

    private double rating = 4.9;
    private int reviewsCount = 1;
    private String gender = "Women";
    private String occasion = "Festive";
    private List<String> images = new ArrayList<>();
    private String description;
    private PriceCalculation pricing;
    private Long currentPrice;

    public Product() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPurity() { return purity; }
    public void setPurity(String purity) { this.purity = purity; }

    public String getMetal() { return metal; }
    public void setMetal(String metal) { this.metal = metal; }

    public double getGrossWeight() { return grossWeight; }
    public void setGrossWeight(double grossWeight) { this.grossWeight = grossWeight; }

    public double getNetWeight() { return netWeight; }
    public void setNetWeight(double netWeight) { this.netWeight = netWeight; }

    public double getStoneWeight() { return stoneWeight; }
    public void setStoneWeight(double stoneWeight) { this.stoneWeight = stoneWeight; }

    public String getStoneType() { return stoneType; }
    public void setStoneType(String stoneType) { this.stoneType = stoneType; }

    public double getStonePrice() { return stonePrice; }
    public void setStonePrice(double stonePrice) { this.stonePrice = stonePrice; }

    public String getMakingChargeType() { return makingChargeType; }
    public void setMakingChargeType(String makingChargeType) { this.makingChargeType = makingChargeType; }

    public double getMakingChargeValue() { return makingChargeValue; }
    public void setMakingChargeValue(double makingChargeValue) { this.makingChargeValue = makingChargeValue; }

    public String getHuid() { return huid; }
    public void setHuid(String huid) { this.huid = huid; }

    public String getCertification() { return certification; }
    public void setCertification(String certification) { this.certification = certification; }

    public boolean isInStock() { return inStock; }
    public void setInStock(boolean inStock) { this.inStock = inStock; }

    public int getStockCount() { return stockCount; }
    public void setStockCount(int stockCount) { this.stockCount = stockCount; }

    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean isFeatured) { this.isFeatured = isFeatured; }

    public boolean isBestseller() { return isBestseller; }
    public void setBestseller(boolean isBestseller) { this.isBestseller = isBestseller; }

    public boolean isNew() { return isNew; }
    public void setNew(boolean isNew) { this.isNew = isNew; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(int reviewsCount) { this.reviewsCount = reviewsCount; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getOccasion() { return occasion; }
    public void setOccasion(String occasion) { this.occasion = occasion; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public PriceCalculation getPricing() { return pricing; }
    public void setPricing(PriceCalculation pricing) { this.pricing = pricing; }

    public Long getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(Long currentPrice) { this.currentPrice = currentPrice; }
}
