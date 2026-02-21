package com.agenda.backend.controller;

import com.agenda.backend.entity.AlertaConfig;
import com.agenda.backend.service.AlertaConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/alertas")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AlertaController {

    private final AlertaConfigService service;

    @GetMapping
    public List<AlertaConfig> listar() {
        return service.listarTodas();
    }

    @PutMapping("/{id}")
    public AlertaConfig actualizar(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return service.actualizar(id, body.get("habilitada"));
    }
}
