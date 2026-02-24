package com.agenda.backend.controller;

import com.agenda.backend.dto.TelegramUserConfigDto;
import com.agenda.backend.dto.TelegramUserConfigRequest;
import com.agenda.backend.service.TelegramUserConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/telegram/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TelegramUserConfigController {

    private final TelegramUserConfigService service;

    @GetMapping
    public List<TelegramUserConfigDto> listar() {
        return service.listar();
    }

    @PostMapping
    public TelegramUserConfigDto guardar(@Valid @RequestBody TelegramUserConfigRequest req) {
        return service.guardar(req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/activo")
    public TelegramUserConfigDto actualizarActivo(@PathVariable Long id, @RequestParam boolean activo) {
        return service.actualizarActivo(id, activo);
    }
}
