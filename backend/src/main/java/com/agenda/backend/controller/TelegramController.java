package com.agenda.backend.controller;

import com.agenda.backend.entity.TelegramConfig;
import com.agenda.backend.service.TelegramService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/telegram")
@RequiredArgsConstructor
public class TelegramController {

    private final TelegramService service;

    @GetMapping("/config")
    public TelegramConfig getConfig() {
        TelegramConfig cfg = service.getConfig();
        // Mask token for display
        if (cfg.getBotToken() != null && cfg.getBotToken().length() > 8) {
            cfg.setBotToken("••••••••" + cfg.getBotToken().substring(cfg.getBotToken().length() - 4));
        }
        return cfg;
    }

    @PutMapping("/config")
    public TelegramConfig saveConfig(@RequestBody TelegramConfig cfg) {
        // Don't overwrite token if masked
        if (cfg.getBotToken() != null && cfg.getBotToken().startsWith("••••••••")) {
            TelegramConfig existing = service.getConfig();
            cfg.setBotToken(existing.getBotToken());
        }
        return service.saveConfig(cfg);
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        boolean ok = service.testConexion();
        return ResponseEntity.ok(Map.of(
                "exitoso", ok,
                "mensaje", ok ? "✅ Conexión exitosa con Telegram" : "❌ No se pudo conectar con Telegram"));
    }
}
