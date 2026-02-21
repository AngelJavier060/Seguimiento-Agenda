package com.agenda.backend.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.*;

@Entity
@Table(name = "telegram_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelegramConfig {

    @Id
    @Builder.Default
    private Long id = 1L; // singleton — always row with id=1

    @Column(name = "chat_id")
    private String chatId;

    @Column(name = "bot_token")
    private String botToken;

    @Column(nullable = false)
    private boolean activo;
}
