package com.agenda.backend.repository;

import com.agenda.backend.entity.TelegramUserConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TelegramUserConfigRepository extends JpaRepository<TelegramUserConfig, Long> {
    Optional<TelegramUserConfig> findByUsuarioId(Long usuarioId);
}
