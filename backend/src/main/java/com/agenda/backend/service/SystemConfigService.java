package com.agenda.backend.service;

import com.agenda.backend.entity.SystemConfig;
import com.agenda.backend.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SystemConfigService {

    private final SystemConfigRepository repo;

    public SystemConfig get() {
        return repo.findById(1L)
                .orElseGet(() -> SystemConfig.builder()
                        .id(1L)
                        .systemName("Agenda de Cumplimiento")
                        .description("")
                        .build());
    }

    public SystemConfig save(SystemConfig cfg) {
        cfg.setId(1L);
        return repo.save(cfg);
    }
}
