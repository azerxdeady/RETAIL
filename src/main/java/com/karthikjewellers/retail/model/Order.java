package com.karthikjewellers.retail.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Order {
    private String id;
    private String brand = "karthik";
    private Map<String, Object> customer = new HashMap<>();
    private List<OrderItem> items = new ArrayList<>();
    private Map<String, Object> payment = new HashMap<>();
    private Map<String, Object> summary = new HashMap<>();
    private String status = "Hallmarking Verified";
    private String trackingNumber;
    private String courier = "BVC Logistics Armoured Vault Transit";
    private String createdAt;
    private String deliveryEstimated;
    private String dispatchedAt;

    public Order() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public Map<String, Object> getCustomer() { return customer; }
    public void setCustomer(Map<String, Object> customer) { this.customer = customer; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public Map<String, Object> getPayment() { return payment; }
    public void setPayment(Map<String, Object> payment) { this.payment = payment; }

    public Map<String, Object> getSummary() { return summary; }
    public void setSummary(Map<String, Object> summary) { this.summary = summary; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getCourier() { return courier; }
    public void setCourier(String courier) { this.courier = courier; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getDeliveryEstimated() { return deliveryEstimated; }
    public void setDeliveryEstimated(String deliveryEstimated) { this.deliveryEstimated = deliveryEstimated; }

    public String getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(String dispatchedAt) { this.dispatchedAt = dispatchedAt; }

    public double getGrandTotal() {
        if (summary == null || !summary.containsKey("grandTotal")) return 0.0;
        Object val = summary.get("grandTotal");
        return val instanceof Number ? ((Number) val).doubleValue() : 0.0;
    }

    public double getSubtotal() {
        if (summary == null || !summary.containsKey("subtotal")) return 0.0;
        Object val = summary.get("subtotal");
        return val instanceof Number ? ((Number) val).doubleValue() : 0.0;
    }

    public double getGst() {
        if (summary == null || !summary.containsKey("gst")) return 0.0;
        Object val = summary.get("gst");
        return val instanceof Number ? ((Number) val).doubleValue() : 0.0;
    }

    public double getDiscount() {
        if (summary == null || !summary.containsKey("discount")) return 0.0;
        Object val = summary.get("discount");
        return val instanceof Number ? ((Number) val).doubleValue() : 0.0;
    }

    public String getCustomerName() {
        if (customer == null || !customer.containsKey("name")) return "Valued Customer";
        return String.valueOf(customer.get("name"));
    }

    public String getCustomerCity() {
        if (customer == null || !customer.containsKey("city")) return "Chennai";
        return String.valueOf(customer.get("city"));
    }
}
