package com.agenda.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TelegramUserConfigRequest {
    @NotNull
    private Long usuarioId;

    private String phoneNumber;

    private String userOrChannel;

    private Boolean activo;
}
