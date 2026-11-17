package com.karthikjewellers.retail.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Scheme {
    private String id;
    private String brand = "karthik";
    private String planName;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private double monthlyAmount;
    private int tenureMonths = 11;
    private int paidInstallments = 1;
    private double totalAccumulatedGoldGrams;
    private String startDate;
    private String nextDueDate;
    private String status = "Active";
    private String branch;

    public Scheme() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public double getMonthlyAmount() { return monthlyAmount; }
    public void setMonthlyAmount(double monthlyAmount) { this.monthlyAmount = monthlyAmount; }

    public int getTenureMonths() { return tenureMonths; }
    public void setTenureMonths(int tenureMonths) { this.tenureMonths = tenureMonths; }

    public int getPaidInstallments() { return paidInstallments; }
    public void setPaidInstallments(int paidInstallments) { this.paidInstallments = paidInstallments; }

    public double getTotalAccumulatedGoldGrams() { return totalAccumulatedGoldGrams; }
    public void setTotalAccumulatedGoldGrams(double totalAccumulatedGoldGrams) { this.totalAccumulatedGoldGrams = totalAccumulatedGoldGrams; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(String nextDueDate) { this.nextDueDate = nextDueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
}
