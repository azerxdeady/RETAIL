package com.karthikjewellers.retail.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BullionRates {
    private double gold24k;
    private double gold22k;
    private double gold18k;
    private double silver;
    private String lastUpdated;
    private String updatedBy;

    public BullionRates() {}

    public BullionRates(double gold24k, double gold22k, double gold18k, double silver, String lastUpdated, String updatedBy) {
        this.gold24k = gold24k;
        this.gold22k = gold22k;
        this.gold18k = gold18k;
        this.silver = silver;
        this.lastUpdated = lastUpdated;
        this.updatedBy = updatedBy;
    }

    public double getGold24k() { return gold24k; }
    public void setGold24k(double gold24k) { this.gold24k = gold24k; }

    public double getGold22k() { return gold22k; }
    public void setGold22k(double gold22k) { this.gold22k = gold22k; }

    public double getGold18k() { return gold18k; }
    public void setGold18k(double gold18k) { this.gold18k = gold18k; }

    public double getSilver() { return silver; }
    public void setSilver(double silver) { this.silver = silver; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
