package com.agenda.backend.controller;

import com.agenda.backend.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService service;

    @PostMapping("/{tipo}")
    public ResponseEntity<Map<String, Object>> enviarReporte(@PathVariable String tipo) {
        boolean ok = service.enviarManual(tipo);
        return ResponseEntity.ok(Map.of(
                "exitoso", ok,
                "mensaje", ok ? "Reporte enviado a Telegram ✓" : "Enviado (revisa configuración de Telegram)"));
    }
}
