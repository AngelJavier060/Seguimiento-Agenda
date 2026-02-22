package com.agenda.backend.controller;

import com.agenda.backend.entity.TelegramConfig;
import com.agenda.backend.service.TelegramService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/telegram")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
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
        boolean ok = service.enviarMensaje("🧪 Prueba de notificación desde AgendaPro", "TEST");
        return ResponseEntity.ok(Map.of(
                "exitoso", ok,
                "mensaje", ok ? "✅ Mensaje de prueba enviado" : "❌ No se pudo enviar el mensaje de prueba"));
    }
}
