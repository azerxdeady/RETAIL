package com.karthikjewellers.retail.controller;

import com.karthikjewellers.retail.service.DatabaseService;
import com.karthikjewellers.retail.service.SyncBroadcastService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = "*")
public class SyncStreamController {

    private final SyncBroadcastService syncService;
    private final DatabaseService dbService;

    public SyncStreamController(SyncBroadcastService syncService, DatabaseService dbService) {
        this.syncService = syncService;
        this.dbService = dbService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        return syncService.registerClient(dbService.getRates());
    }

    @GetMapping("/version")
    public ResponseEntity<Map<String, Object>> getVersion() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("version", syncService.getCurrentVersion());
        resp.put("rates", dbService.getRates());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Map<String, Object>> broadcast(@RequestBody Map<String, Object> body) {
        String type = (String) body.get("type");
        Object payload = body.get("payload");

        if (type == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Event type required");
            return ResponseEntity.badRequest().body(err);
        }

        Map<String, Object> event = syncService.broadcast(type, payload);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("event", event);
        return ResponseEntity.ok(resp);
    }
}
