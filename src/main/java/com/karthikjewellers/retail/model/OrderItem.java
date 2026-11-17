package com.karthikjewellers.retail.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderItem {
    private String productId;
    private String name;
    private String sku;
    private String purity;
    private double grossWeight;
    private double netWeight;
    private int quantity = 1;
    private double price;
    private double total;
    private String huid;
    private String image;

    public OrderItem() {}

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getPurity() { return purity; }
    public void setPurity(String purity) { this.purity = purity; }

    public double getGrossWeight() { return grossWeight; }
    public void setGrossWeight(double grossWeight) { this.grossWeight = grossWeight; }

    public double getNetWeight() { return netWeight; }
    public void setNetWeight(double netWeight) { this.netWeight = netWeight; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public String getHuid() { return huid; }
    public void setHuid(String huid) { this.huid = huid; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
