package com.agenda.backend.repository;

import com.agenda.backend.entity.AlertaConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlertaConfigRepository extends JpaRepository<AlertaConfig, Long> {
    Optional<AlertaConfig> findByTipo(AlertaConfig.TipoAlerta tipo);
    long countByHabilitada(boolean habilitada);
}
