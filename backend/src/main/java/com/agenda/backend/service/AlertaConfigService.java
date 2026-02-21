package com.agenda.backend.service;

import com.agenda.backend.entity.AlertaConfig;
import com.agenda.backend.entity.AlertaConfig.TipoAlerta;
import com.agenda.backend.repository.AlertaConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertaConfigService implements CommandLineRunner {

    private final AlertaConfigRepository repo;

    @Override
    public void run(String... args) {
        // Seed default alert configs if table is empty
        if (repo.count() == 0) {
            List<AlertaConfig> defaults = Arrays.stream(TipoAlerta.values())
                    .map(t -> AlertaConfig.builder().tipo(t)
                            .habilitada(t != TipoAlerta.RECORDATORIO_VENCIDAS).build())
                    .toList();
            repo.saveAll(defaults);
        }
    }

    public List<AlertaConfig> listarTodas() {
        return repo.findAll();
    }

    public AlertaConfig actualizar(Long id, boolean habilitada) {
        AlertaConfig cfg = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));
        cfg.setHabilitada(habilitada);
        return repo.save(cfg);
    }

    public boolean isHabilitada(TipoAlerta tipo) {
        return repo.findByTipo(tipo).map(AlertaConfig::isHabilitada).orElse(false);
    }
}
