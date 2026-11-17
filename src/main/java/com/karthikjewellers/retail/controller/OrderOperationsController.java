package com.karthikjewellers.retail.controller;

import com.karthikjewellers.retail.model.*;
import com.karthikjewellers.retail.service.DatabaseService;
import com.karthikjewellers.retail.service.SyncBroadcastService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrderOperationsController {

    private final DatabaseService dbService;
    private final SyncBroadcastService syncService;

    public OrderOperationsController(DatabaseService dbService, SyncBroadcastService syncService) {
        this.dbService = dbService;
        this.syncService = syncService;
    }

    // 1. Orders
    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getOrders() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("orders", dbService.getOrders());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Map<String, Object>> getOrderById(@PathVariable String id) {
        Order order = dbService.getOrderById(id);
        if (order == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Order not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("order", order);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Order order) {
        String brand = (order.getBrand() != null) ? order.getBrand().toLowerCase() : "karthik";
        String prefix = brand.contains("viswa") ? "ORD-VJ-" : "ORD-KJ-";
        String orderId = prefix + LocalDate.now().getYear() + "-" + (10000 + new Random().nextInt(90000));
        String tracking = (brand.contains("viswa") ? "BVC-VJ-" : "BVC-KJ-") + (100000 + new Random().nextInt(900000));

        order.setId(orderId);
        order.setBrand(brand);
        order.setTrackingNumber(tracking);
        order.setCourier("BVC Logistics Armoured Vault Transit");
        order.setStatus("Hallmarking Verified");
        order.setCreatedAt(Instant.now().toString());
        order.setDeliveryEstimated(LocalDate.now().plusDays(3).toString());

        Order saved = dbService.saveOrder(order);

        // Auto-decrement inventory stock count
        if (order.getItems() != null) {
            for (OrderItem it : order.getItems()) {
                if (it.getProductId() != null) {
                    Product p = dbService.getProductById(it.getProductId());
                    if (p != null) {
                        int newStock = Math.max(0, p.getStockCount() - it.getQuantity());
                        p.setStockCount(newStock);
                        p.setInStock(newStock > 0);
                        dbService.saveProduct(p);
                    }
                }
            }
        }

        syncService.broadcast("ORDER_CREATED", saved);
        syncService.broadcast("PRODUCTS_UPDATED", Collections.singletonMap("action", "stock_change"));

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Order placed successfully with complimentary insured transit!");
        resp.put("order", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping("/orders/{id}")
    public ResponseEntity<Map<String, Object>> updateOrder(@PathVariable String id, @RequestBody Order updates) {
        Order existing = dbService.getOrderById(id);
        if (existing == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Order not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        updates.setId(id);
        Order saved = dbService.saveOrder(updates);

        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("action", "update");
        syncPayload.put("order", saved);
        syncService.broadcast("ORDERS_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Order updated successfully");
        resp.put("order", saved);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/orders/{id}/fulfill")
    public ResponseEntity<Map<String, Object>> fulfillOrder(@PathVariable String id, @RequestBody(required = false) Map<String, Object> body) {
        Order existing = dbService.getOrderById(id);
        if (existing == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Order not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        String tracking = body != null && body.containsKey("trackingNumber") ? (String) body.get("trackingNumber") : existing.getTrackingNumber();
        String courier = body != null && body.containsKey("courier") ? (String) body.get("courier") : existing.getCourier();

        existing.setStatus("In Armoured Transit (Dispatched)");
        existing.setTrackingNumber(tracking);
        existing.setCourier(courier != null ? courier : "BVC Logistics Armoured Vault Transit");
        existing.setDispatchedAt(Instant.now().toString());

        Order saved = dbService.saveOrder(existing);

        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("action", "fulfill");
        syncPayload.put("order", saved);
        syncService.broadcast("ORDERS_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Order fulfilled and marked in armoured transit!");
        resp.put("order", saved);
        return ResponseEntity.ok(resp);
    }

    // 2. Swarna Nidhi Gold Savings Scheme
    @GetMapping("/schemes")
    public ResponseEntity<Map<String, Object>> getSchemes() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("schemes", dbService.getSchemes());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/schemes/enroll")
    public ResponseEntity<Map<String, Object>> enrollScheme(@RequestBody Scheme scheme) {
        BullionRates rates = dbService.getRates();
        double monthly = scheme.getMonthlyAmount() > 0 ? scheme.getMonthlyAmount() : 5000;
        double grams = Math.round((monthly / rates.getGold22k()) * 1000.0) / 1000.0;

        String brand = (scheme.getBrand() != null) ? scheme.getBrand() : "karthik";
        String prefix = brand.contains("viswa") ? "SCH-VJ-" : "SCH-KJ-";
        scheme.setId(prefix + (1000 + new Random().nextInt(9000)));
        scheme.setPaidInstallments(1);
        scheme.setTenureMonths(11);
        scheme.setTotalAccumulatedGoldGrams(grams);
        scheme.setStartDate(LocalDate.now().toString());
        scheme.setNextDueDate(LocalDate.now().plusMonths(1).toString());
        scheme.setStatus("Active");

        Scheme created = dbService.saveScheme(scheme);

        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("action", "enroll");
        syncPayload.put("scheme", created);
        syncService.broadcast("SCHEMES_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Enrolled in Swarna Nidhi with 11+1 bonus benefit!");
        resp.put("scheme", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PostMapping("/schemes/{id}/pay")
    public ResponseEntity<Map<String, Object>> paySchemeInstallment(@PathVariable String id) {
        List<Scheme> list = dbService.getSchemes();
        Scheme scheme = list.stream().filter(s -> s.getId() != null && s.getId().equalsIgnoreCase(id)).findFirst().orElse(null);

        if (scheme == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Scheme not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        if (scheme.getPaidInstallments() >= scheme.getTenureMonths()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Scheme is already completed and matured!");
            return ResponseEntity.badRequest().body(err);
        }

        BullionRates rates = dbService.getRates();
        double additionalGrams = Math.round((scheme.getMonthlyAmount() / rates.getGold22k()) * 1000.0) / 1000.0;
        int newPaidCount = scheme.getPaidInstallments() + 1;

        scheme.setPaidInstallments(newPaidCount);
        scheme.setTotalAccumulatedGoldGrams(Math.round((scheme.getTotalAccumulatedGoldGrams() + additionalGrams) * 1000.0) / 1000.0);
        scheme.setNextDueDate(LocalDate.now().plusMonths(1).toString());
        if (newPaidCount >= scheme.getTenureMonths()) {
            scheme.setStatus("Matured - Ready for Jewellery Purchase");
        }

        Scheme updated = dbService.saveScheme(scheme);

        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("action", "pay");
        syncPayload.put("scheme", updated);
        syncService.broadcast("SCHEMES_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Installment #" + newPaidCount + " paid successfully!");
        resp.put("scheme", updated);
        return ResponseEntity.ok(resp);
    }

    // 3. Coupons
    @GetMapping("/coupons")
    public ResponseEntity<Map<String, Object>> getCoupons() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("coupons", dbService.getCoupons());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/coupons")
    public ResponseEntity<Map<String, Object>> createCoupon(@RequestBody Coupon coupon) {
        if (coupon.getCode() == null || coupon.getDiscountValue() <= 0) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Coupon code and discount value are required");
            return ResponseEntity.badRequest().body(err);
        }

        String upperCode = coupon.getCode().trim().toUpperCase();
        coupon.setId("COUPON-" + upperCode);
        coupon.setCode(upperCode);

        Coupon created = dbService.saveCoupon(coupon);

        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("action", "create");
        syncPayload.put("coupon", created);
        syncService.broadcast("COUPONS_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Privilege discount coupon created!");
        resp.put("coupon", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<Map<String, Object>> updateCoupon(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        List<Coupon> coupons = dbService.getCoupons();
        Coupon existing = coupons.stream().filter(c -> c.getId() != null && c.getId().equalsIgnoreCase(id)).findFirst().orElse(null);
        if (existing == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Coupon not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        if (updates.containsKey("code")) existing.setCode(String.valueOf(updates.get("code")).trim().toUpperCase());
        if (updates.containsKey("discountType")) existing.setDiscountType(String.valueOf(updates.get("discountType")));
        if (updates.containsKey("discountValue")) existing.setDiscountValue(Double.parseDouble(String.valueOf(updates.get("discountValue"))));
        if (updates.containsKey("minOrderValue")) existing.setMinOrderValue(Double.parseDouble(String.valueOf(updates.get("minOrderValue"))));
        if (updates.containsKey("brand")) existing.setBrand(String.valueOf(updates.get("brand")));
        if (updates.containsKey("expiryDate")) existing.setExpiryDate(String.valueOf(updates.get("expiryDate")));
        if (updates.containsKey("isActive")) existing.setActive(Boolean.parseBoolean(String.valueOf(updates.get("isActive"))));

        Coupon saved = dbService.saveCoupon(existing);
        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("action", "update");
        syncPayload.put("coupon", saved);
        syncService.broadcast("COUPONS_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("coupon", saved);
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<Map<String, Object>> deleteCoupon(@PathVariable String id) {
        boolean deleted = dbService.deleteCoupon(id);
        if (!deleted) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Coupon not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("action", "delete");
        syncPayload.put("id", id);
        syncService.broadcast("COUPONS_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Coupon deleted successfully");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/coupons/validate")
    public ResponseEntity<Map<String, Object>> validateCoupon(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        Number cartTotalNum = (Number) body.getOrDefault("cartTotal", 0);
        double cartTotal = cartTotalNum.doubleValue();

        if (code == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Coupon code required");
            return ResponseEntity.badRequest().body(err);
        }

        List<Coupon> coupons = dbService.getCoupons();
        Coupon coupon = coupons.stream()
                .filter(c -> c.getCode() != null && c.getCode().equalsIgnoreCase(code.trim()))
                .findFirst()
                .orElse(null);

        if (coupon == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Invalid coupon code");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        if (coupon.getMinOrderAmount() > 0 && cartTotal < coupon.getMinOrderAmount()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Coupon requires minimum order value of ₹" + (long) coupon.getMinOrderAmount());
            return ResponseEntity.badRequest().body(err);
        }

        long discount;
        if ("percentage".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = Math.round((cartTotal * coupon.getDiscountValue()) / 100.0);
            if (coupon.getMaxDiscount() != null && discount > coupon.getMaxDiscount()) {
                discount = Math.round(coupon.getMaxDiscount());
            }
        } else {
            discount = Math.round(coupon.getDiscountValue());
        }

        Map<String, Object> cInfo = new HashMap<>();
        cInfo.put("code", coupon.getCode());
        cInfo.put("discount", discount);
        cInfo.put("description", coupon.getDescription());

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("coupon", cInfo);
        return ResponseEntity.ok(resp);
    }

    // 4. Customers
    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> getCustomers() {
        List<Map<String, Object>> customers = dbService.getCustomers();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("count", customers.size());
        resp.put("customers", customers);
        return ResponseEntity.ok(resp);
    }

    // 5. Store Settings & Enterprise Compliance
    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("settings", dbService.getStoreSettings());
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody Map<String, Object> newSettings) {
        Map<String, Object> updated = dbService.updateStoreSettings(newSettings);
        syncService.broadcast("SETTINGS_UPDATED", updated);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Store compliance and enterprise settings updated");
        resp.put("settings", updated);
        return ResponseEntity.ok(resp);
    }
}
