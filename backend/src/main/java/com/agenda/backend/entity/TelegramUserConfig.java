package com.agenda.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "telegram_user_config", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"usuario_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelegramUserConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "phone_number", length = 32)
    private String phoneNumber;

    @Column(name = "user_or_channel", length = 120)
    private String userOrChannel;

    @Column(nullable = false)
    private boolean activo;
}
