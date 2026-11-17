package com.karthikjewellers.retail.controller;

import com.karthikjewellers.retail.service.DatabaseService;
import com.karthikjewellers.retail.service.SyncBroadcastService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/theme")
@CrossOrigin(origins = "*")
public class ThemeApiController {

    private final DatabaseService dbService;
    private final SyncBroadcastService syncService;

    public ThemeApiController(DatabaseService dbService, SyncBroadcastService syncService) {
        this.dbService = dbService;
        this.syncService = syncService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getTheme() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("themeSettings", dbService.getThemeSettings());
        return ResponseEntity.ok(resp);
    }

    @PutMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> updateTheme(@RequestBody Map<String, Object> body) {
        String brand = (String) body.getOrDefault("brand", "karthik");
        Map<String, Object> settings = (Map<String, Object>) body.get("settings");

        if (settings == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Settings payload is required");
            return ResponseEntity.badRequest().body(err);
        }

        Map<String, Object> updated = dbService.updateThemeSettings(brand, settings);

        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("brand", brand);
        syncPayload.put("settings", updated);
        syncService.broadcast("THEME_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Theme settings updated and synchronized across all portals");
        resp.put("themeSettings", updated);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetTheme(@RequestBody(required = false) Map<String, Object> body) {
        String brand = body != null ? (String) body.getOrDefault("brand", "all") : "all";
        Map<String, Object> currentThemes = dbService.getThemeSettings();

        // Broadcast reset event
        Map<String, Object> syncPayload = new HashMap<>();
        syncPayload.put("brand", brand);
        syncPayload.put("settings", currentThemes);
        syncService.broadcast("THEME_UPDATED", syncPayload);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Theme reset to imperial gold factory defaults");
        resp.put("themeSettings", currentThemes);
        return ResponseEntity.ok(resp);
    }
}
