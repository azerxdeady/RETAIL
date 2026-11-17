package com.karthikjewellers.retail.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SyncBroadcastService {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private volatile long currentVersion = System.currentTimeMillis();

    public SseEmitter registerClient(Object initialRates) {
        currentVersion = System.currentTimeMillis();
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));

        // Send connection handshake
        try {
            Map<String, Object> handshake = new HashMap<>();
            handshake.put("type", "SYNC_CONNECTED");
            handshake.put("version", currentVersion);
            handshake.put("rates", initialRates);
            handshake.put("timestamp", Instant.now().toString());

            emitter.send(SseEmitter.event()
                    .name("message")
                    .data(handshake, MediaType.APPLICATION_JSON));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public Map<String, Object> broadcast(String eventType, Object payload) {
        currentVersion = System.currentTimeMillis();

        Map<String, Object> event = new HashMap<>();
        event.put("type", eventType);
        event.put("version", currentVersion);
        event.put("payload", payload);
        event.put("timestamp", Instant.now().toString());

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("message")
                        .data(event, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }

        return event;
    }

    public long getCurrentVersion() {
        return currentVersion;
    }
}
