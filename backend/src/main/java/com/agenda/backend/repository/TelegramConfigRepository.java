package com.agenda.backend.repository;

import com.agenda.backend.entity.TelegramConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TelegramConfigRepository extends JpaRepository<TelegramConfig, Long> {
}
