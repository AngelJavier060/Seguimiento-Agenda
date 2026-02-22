package com.agenda.backend.controller;

import com.agenda.backend.entity.SystemConfig;
import com.agenda.backend.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/system/config")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SystemConfigController {

    private final SystemConfigService service;

    @GetMapping
    public SystemConfig get() {
        return service.get();
    }

    @PutMapping
    public SystemConfig save(@RequestBody SystemConfig cfg) {
        return service.save(cfg);
    }
}
