package com.karthikjewellers.retail.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.karthikjewellers.retail.model.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.*;

@Service
public class DatabaseService {

    private final ObjectMapper mapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
    private final File dbFile = new File("data/db.json");
    private Map<String, Object> database = new HashMap<>();

    @PostConstruct
    public synchronized void init() {
        if (dbFile.exists()) {
            try {
                database = mapper.readValue(dbFile, new TypeReference<Map<String, Object>>() {});
            } catch (IOException e) {
                System.err.println("Warning: Could not read data/db.json: " + e.getMessage());
                database = new HashMap<>();
            }
        } else {
            System.out.println("data/db.json not found, initializing empty database");
        }
    }

    public synchronized void save() {
        try {
            File parent = dbFile.getParentFile();
            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }
            mapper.writeValue(dbFile, database);
        } catch (IOException e) {
            System.err.println("Error saving database: " + e.getMessage());
        }
    }

    public synchronized BullionRates getRates() {
        Object raw = database.get("rates");
        if (raw != null) {
            return mapper.convertValue(raw, BullionRates.class);
        }
        return new BullionRates(7850, 7215, 5910, 94, Instant.now().toString(), "Karthik Jewellers Official Bullion Desk");
    }

    public synchronized BullionRates updateRates(BullionRates newRates) {
        newRates.setLastUpdated(Instant.now().toString());
        database.put("rates", newRates);
        save();
        return newRates;
    }

    public synchronized List<Product> getProducts() {
        Object raw = database.get("products");
        if (raw != null) {
            return mapper.convertValue(raw, new TypeReference<List<Product>>() {});
        }
        return new ArrayList<>();
    }

    public synchronized Product getProductById(String id) {
        List<Product> products = getProducts();
        return products.stream()
                .filter(p -> p.getId() != null && p.getId().equalsIgnoreCase(id))
                .findFirst()
                .orElse(null);
    }

    public synchronized Product saveProduct(Product product) {
        List<Product> products = getProducts();
        int index = -1;
        for (int i = 0; i < products.size(); i++) {
            if (products.get(i).getId() != null && products.get(i).getId().equalsIgnoreCase(product.getId())) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            products.set(index, product);
        } else {
            products.add(product);
        }
        database.put("products", products);
        save();
        return product;
    }

    public synchronized boolean deleteProduct(String id) {
        List<Product> products = getProducts();
        boolean removed = products.removeIf(p -> p.getId() != null && p.getId().equalsIgnoreCase(id));
        if (removed) {
            database.put("products", products);
            save();
        }
        return removed;
    }

    public synchronized List<Category> getCategories() {
        Object raw = database.get("categories");
        if (raw != null) {
            return mapper.convertValue(raw, new TypeReference<List<Category>>() {});
        }
        return new ArrayList<>();
    }

    public synchronized List<Order> getOrders() {
        Object raw = database.get("orders");
        if (raw != null) {
            return mapper.convertValue(raw, new TypeReference<List<Order>>() {});
        }
        return new ArrayList<>();
    }

    public synchronized Order getOrderById(String id) {
        return getOrders().stream()
                .filter(o -> o.getId() != null && o.getId().equalsIgnoreCase(id))
                .findFirst()
                .orElse(null);
    }

    public synchronized Order saveOrder(Order order) {
        List<Order> orders = getOrders();
        int index = -1;
        for (int i = 0; i < orders.size(); i++) {
            if (orders.get(i).getId() != null && orders.get(i).getId().equalsIgnoreCase(order.getId())) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            orders.set(index, order);
        } else {
            orders.add(0, order);
        }
        database.put("orders", orders);
        save();
        return order;
    }

    public synchronized List<Scheme> getSchemes() {
        Object raw = database.get("schemes");
        if (raw != null) {
            return mapper.convertValue(raw, new TypeReference<List<Scheme>>() {});
        }
        return new ArrayList<>();
    }

    public synchronized Scheme saveScheme(Scheme scheme) {
        List<Scheme> schemes = getSchemes();
        int index = -1;
        for (int i = 0; i < schemes.size(); i++) {
            if (schemes.get(i).getId() != null && schemes.get(i).getId().equalsIgnoreCase(scheme.getId())) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            schemes.set(index, scheme);
        } else {
            schemes.add(0, scheme);
        }
        database.put("schemes", schemes);
        save();
        return scheme;
    }

    public synchronized List<Appointment> getAppointments() {
        Object raw = database.get("appointments");
        if (raw != null) {
            return mapper.convertValue(raw, new TypeReference<List<Appointment>>() {});
        }
        return new ArrayList<>();
    }

    public synchronized Appointment saveAppointment(Appointment appointment) {
        List<Appointment> list = getAppointments();
        int index = -1;
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).getId() != null && list.get(i).getId().equalsIgnoreCase(appointment.getId())) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            list.set(index, appointment);
        } else {
            list.add(0, appointment);
        }
        database.put("appointments", list);
        save();
        return appointment;
    }

    public synchronized List<Coupon> getCoupons() {
        Object raw = database.get("coupons");
        if (raw != null) {
            return mapper.convertValue(raw, new TypeReference<List<Coupon>>() {});
        }
        return new ArrayList<>();
    }

    public synchronized Coupon saveCoupon(Coupon coupon) {
        List<Coupon> list = getCoupons();
        int index = -1;
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).getId() != null && list.get(i).getId().equalsIgnoreCase(coupon.getId())) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            list.set(index, coupon);
        } else {
            list.add(coupon);
        }
        database.put("coupons", list);
        save();
        return coupon;
    }

    public synchronized boolean deleteCoupon(String id) {
        List<Coupon> list = getCoupons();
        boolean removed = list.removeIf(c -> c.getId() != null && c.getId().equalsIgnoreCase(id));
        if (removed) {
            database.put("coupons", list);
            save();
        }
        return removed;
    }

    public synchronized List<Map<String, Object>> getCustomers() {
        Object raw = database.get("customers");
        if (raw != null) {
            return mapper.convertValue(raw, new TypeReference<List<Map<String, Object>>>() {});
        }
        return new ArrayList<>();
    }

    @SuppressWarnings("unchecked")
    public synchronized Map<String, Object> getThemeSettings() {
        Object raw = database.get("themeSettings");
        if (raw instanceof Map) {
            return (Map<String, Object>) raw;
        }
        return new HashMap<>();
    }

    @SuppressWarnings("unchecked")
    public synchronized Map<String, Object> updateThemeSettings(String brand, Map<String, Object> newSettings) {
        Map<String, Object> currentThemes = getThemeSettings();
        if (currentThemes == null) currentThemes = new HashMap<>();

        if (brand != null && currentThemes.containsKey(brand) && currentThemes.get(brand) instanceof Map) {
            Map<String, Object> brandTheme = (Map<String, Object>) currentThemes.get(brand);
            deepMerge(brandTheme, newSettings);
        } else {
            deepMerge(currentThemes, newSettings);
        }

        currentThemes.put("lastUpdated", Instant.now().toString());
        database.put("themeSettings", currentThemes);
        save();
        return currentThemes;
    }

    @SuppressWarnings("unchecked")
    private void deepMerge(Map<String, Object> target, Map<String, Object> source) {
        for (Map.Entry<String, Object> entry : source.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            if (value instanceof Map) {
                if (!target.containsKey(key) || !(target.get(key) instanceof Map)) {
                    target.put(key, new HashMap<String, Object>());
                }
                deepMerge((Map<String, Object>) target.get(key), (Map<String, Object>) value);
            } else {
                target.put(key, value);
            }
        }
    }

    @SuppressWarnings("unchecked")
    public synchronized Map<String, Object> getStoreSettings() {
        Object raw = database.get("storeSettings");
        if (raw instanceof Map) {
            return (Map<String, Object>) raw;
        }
        return new HashMap<>();
    }

    public synchronized Map<String, Object> updateStoreSettings(Map<String, Object> newSettings) {
        database.put("storeSettings", newSettings);
        save();
        return newSettings;
    }

    public synchronized String getStoreAnnouncement() {
        Object raw = database.get("storeAnnouncement");
        return raw != null ? raw.toString() : "✨ Akshaya & Festive Season: Complimentary Insured Armoured Transit Across India";
    }

    public synchronized void setStoreAnnouncement(String announcement) {
        database.put("storeAnnouncement", announcement);
        save();
    }

    public synchronized List<Map<String, Object>> getBrands() {
        Object raw = database.get("brands");
        if (raw != null) {
            return mapper.convertValue(raw, new TypeReference<List<Map<String, Object>>>() {});
        }
        return new ArrayList<>();
    }

    public synchronized void setProducts(List<Product> products) {
        database.put("products", products);
        save();
    }

    public synchronized void setCategories(List<Category> categories) {
        database.put("categories", categories);
        save();
    }

    public synchronized void setOrders(List<Order> orders) {
        database.put("orders", orders);
        save();
    }

    public synchronized void setSchemes(List<Scheme> schemes) {
        database.put("schemes", schemes);
        save();
    }

    public synchronized Map<String, Object> getRawDatabase() {
        return database;
    }
}
