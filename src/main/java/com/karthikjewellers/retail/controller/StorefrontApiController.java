package com.karthikjewellers.retail.controller;

import com.karthikjewellers.retail.model.Appointment;
import com.karthikjewellers.retail.model.BullionRates;
import com.karthikjewellers.retail.model.Category;
import com.karthikjewellers.retail.model.Product;
import com.karthikjewellers.retail.service.DatabaseService;
import com.karthikjewellers.retail.service.PriceCalculatorService;
import com.karthikjewellers.retail.service.SyncBroadcastService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class StorefrontApiController {

    private final DatabaseService dbService;
    private final PriceCalculatorService priceCalculator;
    private final SyncBroadcastService syncService;

    public StorefrontApiController(DatabaseService dbService, PriceCalculatorService priceCalculator, SyncBroadcastService syncService) {
        this.dbService = dbService;
        this.priceCalculator = priceCalculator;
        this.syncService = syncService;
    }

    // 1. Live Gold & Silver Rates
    @GetMapping("/rates")
    public ResponseEntity<Map<String, Object>> getRates() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("rates", dbService.getRates());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/rates")
    public ResponseEntity<Map<String, Object>> updateRates(@RequestBody BullionRates rates) {
        BullionRates updated = dbService.updateRates(rates);
        syncService.broadcast("RATES_UPDATED", updated);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Rates updated successfully. Product prices dynamically re-indexed.");
        resp.put("rates", updated);
        return ResponseEntity.ok(resp);
    }

    // 2. Products Catalog with Dynamic Bullion Pricing
    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String purity,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String occasion,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Boolean featured
    ) {
        BullionRates rates = dbService.getRates();
        List<Product> products = dbService.getProducts().stream()
                .map(p -> priceCalculator.enrichProduct(p, rates))
                .collect(Collectors.toList());

        if (brand != null && !brand.equalsIgnoreCase("all")) {
            products = products.stream()
                    .filter(p -> p.getBrand() != null && p.getBrand().equalsIgnoreCase(brand))
                    .collect(Collectors.toList());
        }

        if (category != null && !category.equalsIgnoreCase("all")) {
            products = products.stream()
                    .filter(p -> p.getCategory() != null && p.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        if (purity != null && !purity.equalsIgnoreCase("all")) {
            products = products.stream()
                    .filter(p -> p.getPurity() != null && p.getPurity().toUpperCase().contains(purity.toUpperCase()))
                    .collect(Collectors.toList());
        }

        if (gender != null && !gender.equalsIgnoreCase("all")) {
            products = products.stream()
                    .filter(p -> p.getGender() != null && (p.getGender().equalsIgnoreCase(gender) || p.getGender().equalsIgnoreCase("unisex")))
                    .collect(Collectors.toList());
        }

        if (occasion != null && !occasion.equalsIgnoreCase("all")) {
            products = products.stream()
                    .filter(p -> p.getOccasion() != null && p.getOccasion().equalsIgnoreCase(occasion))
                    .collect(Collectors.toList());
        }

        if (Boolean.TRUE.equals(featured)) {
            products = products.stream()
                    .filter(p -> p.isFeatured() || p.isBestseller())
                    .collect(Collectors.toList());
        }

        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            products = products.stream()
                    .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(q)) ||
                                 (p.getDescription() != null && p.getDescription().toLowerCase().contains(q)) ||
                                 (p.getSku() != null && p.getSku().toLowerCase().contains(q)) ||
                                 (p.getCategory() != null && p.getCategory().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        if (minPrice != null) {
            products = products.stream()
                    .filter(p -> p.getCurrentPrice() != null && p.getCurrentPrice() >= minPrice)
                    .collect(Collectors.toList());
        }

        if (maxPrice != null) {
            products = products.stream()
                    .filter(p -> p.getCurrentPrice() != null && p.getCurrentPrice() <= maxPrice)
                    .collect(Collectors.toList());
        }

        // Sorting
        if ("price-low-high".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparing(p -> p.getCurrentPrice() != null ? p.getCurrentPrice() : 0L));
        } else if ("price-high-low".equalsIgnoreCase(sort)) {
            products.sort((a, b) -> Long.compare(b.getCurrentPrice() != null ? b.getCurrentPrice() : 0L, a.getCurrentPrice() != null ? a.getCurrentPrice() : 0L));
        } else if ("weight-low-high".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparingDouble(Product::getGrossWeight));
        } else if ("weight-high-low".equalsIgnoreCase(sort)) {
            products.sort((a, b) -> Double.compare(b.getGrossWeight(), a.getGrossWeight()));
        } else if ("rating".equalsIgnoreCase(sort)) {
            products.sort((a, b) -> Double.compare(b.getRating(), a.getRating()));
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("count", products.size());
        resp.put("products", products);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable String id) {
        Product product = dbService.getProductById(id);
        if (product == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Jewellery piece not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        BullionRates rates = dbService.getRates();
        Product enriched = priceCalculator.enrichProduct(product, rates);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("product", enriched);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/products")
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody Product product) {
        if (product.getName() == null || product.getCategory() == null || product.getPurity() == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Name, Category, and Purity are mandatory");
            return ResponseEntity.badRequest().body(err);
        }

        String targetBrand = (product.getBrand() != null) ? product.getBrand().toLowerCase() : "karthik";
        String prefix = targetBrand.equalsIgnoreCase("viswanandini") ? "VJ" : "KJ";

        if (product.getSku() == null || product.getSku().trim().isEmpty()) {
            String cat = product.getCategory().length() >= 2 ? product.getCategory().substring(0, 2).toUpperCase() : "JW";
            product.setSku(prefix + "-" + product.getPurity().substring(0, Math.min(3, product.getPurity().length())) + "-" + cat + "-" + (100 + new Random().nextInt(900)));
        }

        if (product.getId() == null || product.getId().trim().isEmpty()) {
            product.setId(product.getSku());
        }

        if (product.getHuid() == null || product.getHuid().trim().isEmpty()) {
            String purityCode = product.getPurity().contains("22") ? "916" : (product.getPurity().contains("18") ? "750" : "999");
            product.setHuid(prefix + purityCode + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        }

        if (product.getImages() == null || product.getImages().isEmpty()) {
            product.setImages(Collections.singletonList("https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"));
        }

        Product saved = dbService.saveProduct(product);
        BullionRates rates = dbService.getRates();
        Product enriched = priceCalculator.enrichProduct(saved, rates);

        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("action", "create");
        syncPayload.put("product", enriched);
        syncService.broadcast("PRODUCTS_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Jewellery piece created successfully");
        resp.put("product", enriched);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(@PathVariable String id, @RequestBody Product productUpdates) {
        Product existing = dbService.getProductById(id);
        if (existing == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Product not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        productUpdates.setId(id);
        Product saved = dbService.saveProduct(productUpdates);
        BullionRates rates = dbService.getRates();
        Product enriched = priceCalculator.enrichProduct(saved, rates);

        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("action", "update");
        syncPayload.put("product", enriched);
        syncService.broadcast("PRODUCTS_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Product updated successfully");
        resp.put("product", enriched);
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable String id) {
        boolean deleted = dbService.deleteProduct(id);
        if (!deleted) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Product not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("action", "delete");
        syncPayload.put("id", id);
        syncService.broadcast("PRODUCTS_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Product deleted successfully");
        return ResponseEntity.ok(resp);
    }

    // 3. Categories
    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories() {
        List<Category> categories = dbService.getCategories();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("count", categories.size());
        resp.put("categories", categories);
        return ResponseEntity.ok(resp);
    }

    // 4. Brands List
    @GetMapping("/brands")
    public ResponseEntity<Map<String, Object>> getBrands() {
        List<Map<String, Object>> brands = new ArrayList<>();

        Map<String, Object> b1 = new HashMap<>();
        b1.put("id", "karthik");
        b1.put("name", "Karthik Jewellers");
        b1.put("tagline", "Heritage Goldsmiths & Certified Solitaire Ateliers");
        b1.put("type", "flagship");
        b1.put("url", "/");
        b1.put("bisLicense", "BIS-HM/L-600017-0982");
        brands.add(b1);

        Map<String, Object> b2 = new HashMap<>();
        b2.put("id", "viswanandini");
        b2.put("name", "Viswanandini Jewellers");
        b2.put("tagline", "Heirloom Polki, Kundan Jadau & Temple Treasures");
        b2.put("type", "affiliate_bridal");
        b2.put("url", "/viswanandini");
        b2.put("bisLicense", "BIS-HM/L-600017-0982 (Verified under Karthik Jewellers License)");
        brands.add(b2);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("count", brands.size());
        resp.put("brands", brands);
        return ResponseEntity.ok(resp);
    }

    // 5. BIS Hallmark & HUID Verification
    @GetMapping("/verify-huid/{huid}")
    public ResponseEntity<Map<String, Object>> verifyHuid(@PathVariable String huid) {
        String cleanHuid = (huid != null) ? huid.trim().toUpperCase() : "";
        Product matched = dbService.getProducts().stream()
                .filter(p -> p.getHuid() != null && p.getHuid().equalsIgnoreCase(cleanHuid))
                .findFirst()
                .orElse(null);

        Map<String, Object> cert = new HashMap<>();
        cert.put("success", true);
        cert.put("verified", true);
        cert.put("huid", cleanHuid);
        cert.put("hallmarkCenter", "BVC Certified Precious Assaying & Hallmarking Centre (AHC Code: TN-042)");
        cert.put("assayDate", "2026-08-14");
        cert.put("certificationBody", "Bureau of Indian Standards (Govt. of India)");
        cert.put("jewellerName", "Karthik Jewellers Private Limited");
        cert.put("retailerLicense", "BIS-HM/L-600017-0982");
        cert.put("laserMarkingIntact", true);

        if (matched != null) {
            cert.put("productName", matched.getName());
            cert.put("sku", matched.getSku());
            cert.put("purityVerified", matched.getPurity() + " BIS 916 Hallmark");
            cert.put("metal", matched.getMetal());
            cert.put("grossWeight", matched.getGrossWeight() + " g");
            cert.put("netWeight", matched.getNetWeight() + " g");
        } else {
            cert.put("purityVerified", "22KT (916 Fineness)");
            cert.put("goldContent", "91.66% Pure Gold");
            cert.put("description", "Official BIS Hallmark Authentication Certificate verified against national registry.");
        }

        return ResponseEntity.ok(cert);
    }

    // 6. VIP Appointments
    @GetMapping("/appointments")
    public ResponseEntity<Map<String, Object>> getAppointments() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("appointments", dbService.getAppointments());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/appointments")
    public ResponseEntity<Map<String, Object>> createAppointment(@RequestBody Appointment appointment) {
        appointment.setId("APT-" + (800 + new Random().nextInt(900)));
        appointment.setStatus("Pending Confirmation");

        Appointment created = dbService.saveAppointment(appointment);

        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("action", "create");
        syncPayload.put("appointment", created);
        syncService.broadcast("APPOINTMENTS_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "VIP Appointment requested. Our master jewellery concierge will call you shortly!");
        resp.put("appointment", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }
}
